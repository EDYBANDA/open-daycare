-- Endurece rls_auto_enable(): función de event trigger (ensure_rls) que no
-- debe ser callable vía Data API. El event trigger la invoca con privilegios
-- del owner (postgres), que conserva EXECUTE tras el revoke.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
