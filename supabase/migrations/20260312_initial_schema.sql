-- BelegPilot Initial Schema
-- Tables: organizations, profiles, clients, documents, exports, vendor_patterns

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ORGANIZATIONS (Treuhand firms)
-- ============================================================
create table public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  plan text not null default 'starter' check (plan in ('starter', 'professional', 'enterprise')),
  stripe_customer_id text,
  stripe_subscription_id text,
  documents_this_month integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PROFILES (users linked to auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null default 'member' check (role in ('owner', 'member', 'viewer')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- CLIENTS (Mandanten / SME clients of the Treuhand firm)
-- ============================================================
create table public.clients (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  contact_email text,
  address text,
  erp_target text not null default 'csv' check (erp_target in ('csv', 'bexio', 'abacus', 'sage', 'banana')),
  erp_settings jsonb,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- DOCUMENTS (uploaded invoices, receipts, statements)
-- ============================================================
create table public.documents (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  file_name text not null,
  file_path text not null,
  file_type text not null,
  file_size integer not null,
  status text not null default 'uploading' check (status in ('uploading', 'processing', 'review', 'verified', 'exported', 'error')),
  extracted_data jsonb,
  confidence_scores jsonb,
  account_number text,
  contra_account text,
  vat_rate numeric(5,2),
  amount numeric(12,2),
  currency text default 'CHF',
  document_date date,
  supplier_name text,
  supplier_iban text,
  supplier_vat_number text,
  qr_data jsonb,
  ai_model text,
  ai_cost numeric(8,4),
  processing_duration_ms integer,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- EXPORTS (ERP export batches)
-- ============================================================
create table public.exports (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  erp_target text not null check (erp_target in ('csv', 'bexio', 'abacus', 'sage', 'banana')),
  document_ids uuid[] not null default '{}',
  file_path text,
  status text not null default 'pending' check (status in ('pending', 'completed', 'error')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- VENDOR PATTERNS (learned categorization patterns)
-- ============================================================
create table public.vendor_patterns (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  vendor_name text not null,
  default_account text not null,
  default_contra_account text,
  default_vat_rate numeric(5,2),
  match_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unique constraint: one vendor pattern per org per vendor name
create unique index idx_vendor_patterns_org_vendor on public.vendor_patterns(organization_id, lower(vendor_name));

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_profiles_org on public.profiles(organization_id);
create index idx_clients_org on public.clients(organization_id);
create index idx_documents_org on public.documents(organization_id);
create index idx_documents_client on public.documents(client_id);
create index idx_documents_status on public.documents(status);
create index idx_documents_date on public.documents(document_date);
create index idx_exports_org on public.exports(organization_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.documents enable row level security;
alter table public.exports enable row level security;
alter table public.vendor_patterns enable row level security;

-- Helper: get current user's organization_id
create or replace function public.get_user_org_id()
returns uuid as $$
  select organization_id from public.profiles where id = auth.uid()
$$ language sql security definer stable;

-- Organizations: users can read their own org
create policy "Users can read own organization"
  on public.organizations for select
  using (id = public.get_user_org_id());

create policy "Owners can update own organization"
  on public.organizations for update
  using (id = public.get_user_org_id())
  with check (
    id = public.get_user_org_id()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'owner')
  );

-- Profiles: users can read profiles in their org
create policy "Users can read org profiles"
  on public.profiles for select
  using (organization_id = public.get_user_org_id());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

-- Clients: org-scoped CRUD
create policy "Users can read org clients"
  on public.clients for select
  using (organization_id = public.get_user_org_id());

create policy "Members can manage org clients"
  on public.clients for all
  using (organization_id = public.get_user_org_id())
  with check (
    organization_id = public.get_user_org_id()
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'member'))
  );

-- Documents: org-scoped CRUD
create policy "Users can read org documents"
  on public.documents for select
  using (organization_id = public.get_user_org_id());

create policy "Members can manage org documents"
  on public.documents for all
  using (organization_id = public.get_user_org_id())
  with check (
    organization_id = public.get_user_org_id()
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'member'))
  );

-- Exports: org-scoped read + create
create policy "Users can read org exports"
  on public.exports for select
  using (organization_id = public.get_user_org_id());

create policy "Members can create org exports"
  on public.exports for insert
  with check (
    organization_id = public.get_user_org_id()
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'member'))
  );

-- Vendor patterns: org-scoped
create policy "Users can read org vendor patterns"
  on public.vendor_patterns for select
  using (organization_id = public.get_user_org_id());

create policy "Members can manage org vendor patterns"
  on public.vendor_patterns for all
  using (organization_id = public.get_user_org_id())
  with check (
    organization_id = public.get_user_org_id()
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'member'))
  );

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.on_auth_user_created()
returns trigger as $$
declare
  new_org_id uuid;
begin
  -- Create organization from signup metadata
  insert into public.organizations (name)
  values (coalesce(new.raw_user_meta_data->>'org_name', 'Meine Firma'))
  returning id into new_org_id;

  -- Create profile linked to the new org
  insert into public.profiles (id, organization_id, email, full_name, role)
  values (
    new.id,
    new_org_id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'owner'
  );

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.on_auth_user_created();

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_organizations_updated_at
  before update on public.organizations
  for each row execute function public.update_updated_at();

create trigger update_clients_updated_at
  before update on public.clients
  for each row execute function public.update_updated_at();

create trigger update_documents_updated_at
  before update on public.documents
  for each row execute function public.update_updated_at();

create trigger update_vendor_patterns_updated_at
  before update on public.vendor_patterns
  for each row execute function public.update_updated_at();
