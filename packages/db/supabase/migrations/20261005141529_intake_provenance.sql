-- Where each answer came from, what was read off each document, and which
-- intake contract an application was answered under.
--
-- Until now every answer was something the applicant typed, so its origin went
-- without saying. Extraction changes that: a passport number read off the
-- scan is a proposal until the applicant confirms it, and the submission gate
-- has to be able to tell the two apart. These tables are the record that lets
-- it. Nothing writes a document-sourced answer yet — that is the write-back,
-- which follows — but the shape is settled here so the gate and the write-back
-- are built against the same thing.

-- ---------------------------------------------------------------------------
-- Which contract the answers were given under.
--
-- `pnpm intake:lock` versions the core of the questionnaire. An application
-- records the version and checksum current when its answers were last written,
-- so answers from before a contract change are recognisable as such. The job
-- input carries the version it was validated against separately, written by
-- the server at submission; these columns are the client's working record.

alter table public.applications
  add column intake_version  integer check (intake_version >= 1),
  add column intake_checksum text    check (intake_checksum ~ '^[0-9a-f]{64}$');

-- Column grants do not reach columns added later; without these, the first
-- write of either is a 42501 (see 20260910022332_intake_draft_answers).
grant insert (intake_version, intake_checksum) on public.applications to authenticated;
grant update (intake_version, intake_checksum) on public.applications to authenticated;

-- ---------------------------------------------------------------------------
-- What was read off a document.
--
-- One row per field per upload: what the extractor read, how sure it was, and
-- which page it found it on. `field` is the answer path the value is for
-- (`passport.number`), so a value can be offered as an answer without a
-- second mapping. Written by the server alone — an extraction a client could
-- write would be an answer that skipped the applicant's confirmation.

create table public.document_fields (
  id             uuid primary key default gen_random_uuid(),
  upload_id      uuid not null references public.uploads (id) on delete cascade,
  application_id uuid not null references public.applications (id) on delete cascade,
  user_id        uuid not null references auth.users (id) on delete cascade,

  field          text not null,
  value          text not null,
  confidence     numeric(4, 3) check (confidence >= 0 and confidence <= 1),
  source_page    smallint check (source_page >= 1),

  -- Which job read it, when a job did; fixtures and manual entry have none.
  job_id         uuid references public.jobs (id) on delete set null,

  created_at     timestamptz not null default now(),

  -- Reading the same document again replaces what was read before.
  unique (upload_id, field)
);

create index document_fields_application_idx on public.document_fields (application_id, field);

alter table public.document_fields enable row level security;

create policy "document_fields_select_own" on public.document_fields
  for select to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.document_fields from anon, authenticated;
grant select on public.document_fields to authenticated;
grant select, insert, update, delete on public.document_fields to service_role;

-- ---------------------------------------------------------------------------
-- Where each answer came from.
--
-- One row per answered path. `applicant` means typed (or chosen) by the
-- applicant, which is its own confirmation. `document` means proposed from a
-- document field and stands as a placeholder until `confirmed_at` is set — the
-- applicant looked at it and kept it. An answer with no row predates this
-- table and was typed.
--
-- Server-written, like document_fields: the row that says an answer was
-- confirmed is the row the submission gate trusts.

create table public.answer_sources (
  application_id    uuid not null references public.applications (id) on delete cascade,
  user_id           uuid not null references auth.users (id) on delete cascade,
  path              text not null,

  source            text not null check (source in ('applicant', 'document')),
  -- Kept when the document's row goes, so a proposal stays a proposal: losing
  -- the upload must not quietly promote what was read off it to an answer.
  document_field_id uuid references public.document_fields (id) on delete set null,
  confirmed_at      timestamptz,

  intake_version    integer not null check (intake_version >= 1),
  updated_at        timestamptz not null default now(),

  primary key (application_id, path),
  -- A typed answer is its own confirmation.
  check (source <> 'applicant' or confirmed_at is not null)
);

create trigger answer_sources_set_updated_at
  before update on public.answer_sources
  for each row execute function public.set_updated_at();

alter table public.answer_sources enable row level security;

create policy "answer_sources_select_own" on public.answer_sources
  for select to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.answer_sources from anon, authenticated;
grant select on public.answer_sources to authenticated;
grant select, insert, update, delete on public.answer_sources to service_role;
