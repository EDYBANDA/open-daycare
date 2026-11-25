-- RECONSTRUCCIÓN (el historial remoto solo guarda version+name; el SQL
-- original no es recuperable). Verificada contra el estado de la BD.
-- Idéntica a seed_staff_user (20261113234100), que fue no-op porque corrió
-- antes de que existiera el auth user de Caro; esta v2 (23:48:08 UTC) hizo
-- el seed real: staff / Caro Giménez / Sala Soles, con updated_at > created_at.
update public.users as u
set role       = 'staff',
    full_name  = 'Caro Giménez',
    daycare_id = 'c0a80101-0000-4000-8000-000000000001'  -- Guardería Sala Soles
from auth.users as a
where u.id = a.id
  and lower(a.email) = 'caro@opendaycare.com';
