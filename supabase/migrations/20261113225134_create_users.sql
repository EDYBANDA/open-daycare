-- Enums de usuario
create type public.user_role as enum ('staff', 'parent', 'admin');
create type public.user_status as enum ('pending', 'active');

create table public.users (
  id                    uuid primary key references auth.users (id) on delete cascade,
  daycare_id            uuid references public.daycares (id),
  role                  public.user_role   not null default 'parent',
  status                public.user_status not null default 'active',
  full_name             text               not null default '',
  avatar_url            text,
  notify_on_post        boolean            not null default true,
  daily_summary_enabled boolean            not null default true,
  created_at            timestamptz        not null default now(),
  updated_at            timestamptz        not null default now()
);

create index users_daycare_id_idx on public.users (daycare_id);

create trigger users_set_updated_at
  before update on public.users
  for each row
  execute function public.set_updated_at();

-- Provisioning: crea la fila de perfil al registrarse un auth user.
-- Defensivo: solo toma full_name de raw_user_meta_data (controlado por el cliente);
-- role nace siempre 'parent' y daycare_id NULL para evitar auto-escalada.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Helper: la policy no puede hacer subquery directo sobre la misma tabla
-- (error "infinite recursion detected in policy for relation users")
create function public.current_daycare_id()
returns uuid
language sql
stable
security definer set search_path = ''
as $$
  select daycare_id from public.users where id = (select auth.uid())
$$;

revoke execute on function public.current_daycare_id() from public, anon;
grant  execute on function public.current_daycare_id() to authenticated;

alter table public.users enable row level security;

create policy "users_select_self_or_same_daycare"
  on public.users
  for select
  to authenticated
  using (
    id = (select auth.uid())
    or daycare_id = public.current_daycare_id()
  );
