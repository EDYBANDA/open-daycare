-- Seed: usuario staff Caro Giménez (caro@opendaycare.com) en Sala Soles.
-- Paso manual previo requerido: crear el auth user en el dashboard
-- (Authentication → Users → Add user) con auto-confirm.
update public.users as u
set role       = 'staff',
    full_name  = 'Caro Giménez',
    daycare_id = 'c0a80101-0000-4000-8000-000000000001'  -- Guardería Sala Soles
from auth.users as a
where u.id = a.id
  and lower(a.email) = 'caro@opendaycare.com';
