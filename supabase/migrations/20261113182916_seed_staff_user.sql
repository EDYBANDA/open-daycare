-- Seed: usuario staff (ebanda@gmail.com) con login de Supabase Auth.
-- La contrasena se hashea con bcrypt, el mismo formato que usa GoTrue.
-- Idempotente: si el usuario ya existe (ej. creado manualmente), no hace nada.
with new_user as (
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, is_sso_user, is_anonymous
  )
  values (
    null,
    '48649b04-7e1e-40dc-b2ad-bd0fbfa9d8b5',
    'authenticated',
    'authenticated',
    'ebanda@gmail.com',
    extensions.crypt('ABC123456', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    false,
    false
  )
  on conflict (id) do nothing
  returning id
)
insert into auth.identities (user_id, provider, provider_id, identity_data, last_sign_in_at, created_at, updated_at)
select
  id,
  'email',
  id::text,
  jsonb_build_object('sub', id, 'email', 'ebanda@gmail.com', 'email_verified', true),
  now(),
  now(),
  now()
from new_user
on conflict do nothing;

-- El trigger handle_new_user() crea el perfil con rol 'parent' por defecto;
-- se ajusta a staff (idempotente).
update public.users
set role = 'staff', updated_at = now()
where id = '48649b04-7e1e-40dc-b2ad-bd0fbfa9d8b5';
