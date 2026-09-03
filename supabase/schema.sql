-- Samarthan complaints table
-- Run this in Supabase Dashboard → SQL Editor

create table if not exists complaints (
  incident_id text primary key,
  fraud_type text not null,
  fraudster_identifier text not null default '',
  complainant_name text not null default '',
  amount numeric not null default 0,
  urgency_level text not null check (urgency_level in ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  summary text not null,
  summary_hi text not null default '',
  complaint_draft text not null,
  complaint_draft_hi text not null default '',
  frauder_contact text not null default '',
  bank_name text not null default '',
  account_number text not null default '',
  upi_id text,
  timeline text not null default '',
  freeze_steps jsonb not null default '[]'::jsonb,
  applicable_laws jsonb not null default '[]'::jsonb,
  saved_at timestamptz not null default now(),
  language text not null default 'en' check (language in ('en', 'hi')),
  status text not null default 'SUBMITTED' check (status in ('SUBMITTED', 'BANK_NOTIFIED', 'PLATFORM_REPORTED', 'FIR_FILED', 'UNDER_INVESTIGATION', 'RESOLVED')),
  status_history jsonb not null default '[]'::jsonb,
  evidence_images jsonb not null default '[]'::jsonb,
  updates jsonb not null default '[]'::jsonb,
  recommended_channel text not null default 'helpline' check (recommended_channel in ('bank', 'platform', 'agency', 'helpline')),
  recommended_channel_target text not null default '1930'
);

create index if not exists complaints_saved_at_idx on complaints (saved_at desc);

-- Row Level Security: this app has no real user accounts (DigiLocker sign-in
-- is a simulated demo flow), so complaints are readable/writable by anyone
-- holding the anon key, matching the existing localStorage-equivalent trust
-- model. Do not store real PII here — synthetic/demo data only.
alter table complaints enable row level security;

create policy "public read" on complaints
  for select using (true);

create policy "public insert" on complaints
  for insert with check (true);

create policy "public update" on complaints
  for update using (true);

-- If the table already existed before evidence_images was added, run:
-- alter table complaints add column if not exists evidence_images jsonb not null default '[]'::jsonb;

-- If the table already existed before applicable_laws was added, run:
-- alter table complaints add column if not exists applicable_laws jsonb not null default '[]'::jsonb;

-- If the table already existed before updates was added, run:
-- alter table complaints add column if not exists updates jsonb not null default '[]'::jsonb;

-- If the table already existed before recommended_channel was added, run:
-- alter table complaints add column if not exists recommended_channel text not null default 'helpline';
-- alter table complaints add column if not exists recommended_channel_target text not null default '1930';
