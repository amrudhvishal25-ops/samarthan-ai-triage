-- Samarthan complaints table
-- Run this in Supabase Dashboard → SQL Editor

create table if not exists complaints (
  incident_id text primary key,
  fraud_type text not null,
  victim_name text not null,
  amount numeric not null default 0,
  urgency_level text not null,
  summary text not null,
  summary_hi text not null,
  complaint_draft text not null,
  complaint_draft_hi text not null,
  frauder_contact text not null,
  bank_name text not null,
  account_number text not null,
  upi_id text,
  timeline text not null,
  freeze_steps jsonb not null default '[]'::jsonb,
  saved_at timestamptz not null default now(),
  language text not null default 'en',
  status text not null default 'SUBMITTED',
  status_history jsonb not null default '[]'::jsonb,
  evidence_images jsonb not null default '[]'::jsonb
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
