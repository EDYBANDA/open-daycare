-- RECONSTRUCCIÓN (el historial remoto solo guarda version+name; el SQL
-- original no es recuperable). Verificada contra el estado de la BD:
-- creó el auth user caro@opendaycare.com con auto-confirm; id resultante
-- d3b1e403-3fed-4399-b9e0-ced9085a732c. El trigger on_auth_user_created
-- generó su fila en public.users en el mismo instante (23:47:53 UTC).
-- La contraseña fue elegida por el usuario y no queda en el repo.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  'caro@opendaycare.com', crypt('<contraseña elegida por el usuario>', gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}', '{}',
  now(), now(), '', '', '', ''
);
