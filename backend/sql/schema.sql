create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key,
  email varchar unique not null,
  password_hash varchar not null,
  company_name varchar,
  siret varchar,
  address text,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists invoices (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  invoice_number varchar not null,
  issue_date date,
  due_date date,
  client_company_name varchar,
  client_siret varchar,
  client_address text,
  client_email varchar,
  line_items jsonb not null default '[]',
  total_ht numeric(12,2),
  total_tva numeric(12,2),
  total_ttc numeric(12,2),
  notes text,
  status varchar not null default 'draft',
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index if not exists invoices_user_id_idx on invoices(user_id);

create table if not exists certifications (
  id uuid primary key,
  invoice_id uuid references invoices(id) on delete cascade,
  pdf_hash varchar(66) not null,
  blockchain_tx_id varchar not null,
  blockchain_network varchar default 'polygon',
  block_number bigint,
  certified_at timestamptz not null,
  pdf_url text,
  verification_count int default 0,
  created_at timestamptz not null,
  unique (invoice_id),
  unique (pdf_hash)
);

create table if not exists verification_logs (
  id uuid primary key,
  certification_id uuid references certifications(id) on delete set null,
  verified_at timestamptz not null,
  verification_method varchar not null,
  ip_address varchar,
  result varchar not null
);

create index if not exists verification_logs_cert_id_idx on verification_logs(certification_id);

-- Password reset tokens for secure password recovery
create table if not exists password_reset_tokens (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  token_hash varchar(64) not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null
);

create index if not exists password_reset_tokens_user_id_idx on password_reset_tokens(user_id);
create index if not exists password_reset_tokens_hash_idx on password_reset_tokens(token_hash);
