import { neon } from '@neondatabase/serverless'

const DB = 'postgresql://neondb_owner:npg_9UVPupCwLb0c@ep-blue-lab-azl82wp3.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
const sql = neon(DB)

await sql`
create table if not exists complaints (
  incident_id text primary key,
  fraud_type text not null,
  victim_name text not null,
  amount numeric not null default 0,
  urgency_level text not null,
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
  language text not null default 'en',
  status text not null default 'SUBMITTED',
  status_history jsonb not null default '[]'::jsonb,
  evidence_images jsonb not null default '[]'::jsonb,
  updates jsonb not null default '[]'::jsonb,
  recommended_channel text not null default 'helpline',
  recommended_channel_target text not null default '1930'
)`

await sql`create index if not exists complaints_saved_at_idx on complaints (saved_at desc)`

// Additive migration for pre-existing tables.
await sql`alter table complaints add column if not exists recommended_channel text not null default 'helpline'`
await sql`alter table complaints add column if not exists recommended_channel_target text not null default '1930'`

console.log('✅ Schema applied to Neon successfully')
