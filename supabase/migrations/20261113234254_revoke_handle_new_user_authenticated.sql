-- Also revoke execute on handle_new_user() from authenticated.
-- It's a trigger function — no role should call it directly via RPC.
revoke execute on function public.handle_new_user() from authenticated;
