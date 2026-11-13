-- Revoke execute on handle_new_user() from public and anon to prevent REST RPC abuse.
-- It's a trigger function (not meant to be called directly), so restrict access.
revoke execute on function public.handle_new_user() from public, anon;
