create table public.daycares (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger daycares_set_updated_at
  before update on public.daycares
  for each row
  execute function public.set_updated_at();

alter table public.daycares enable row level security;

create policy "daycares_select_authenticated"
  on public.daycares
  for select
  to authenticated
  using (true);
