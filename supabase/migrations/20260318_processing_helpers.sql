-- Atomic usage increment for organizations
-- Called after each document is processed successfully
create or replace function public.increment_org_usage(org_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.organizations
  set documents_this_month = documents_this_month + 1,
      updated_at = now()
  where id = org_id;
end;
$$;

-- Grant execute to authenticated users (edge functions use service role anyway,
-- but this ensures the RPC is callable)
grant execute on function public.increment_org_usage(uuid) to authenticated;
grant execute on function public.increment_org_usage(uuid) to service_role;
