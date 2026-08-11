-- The applicant's own documents: a passport scan, bank statements, proof of
-- employment.
--
-- This is the most sensitive data the product holds — passport pages and bank
-- statements, under PIPL — so the arrangement is deliberately narrow. Bytes go
-- to a private bucket the browser writes directly, keyed by the owner's user
-- id; this table holds only what the product needs to reason about them, and a
-- row is not `stored` until the server has seen the object exist.
--
-- The two halves have to be kept honest with each other: a row without an
-- object is a document the user thinks they sent, and an object without a row
-- is a file nobody will ever delete.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads',
  'uploads',
  false,
  -- 20 MB. A phone photo is one or two after client-side downscaling; a
  -- multi-page scan is the case that needs the headroom.
  20971520,
  array['image/jpeg','image/png','image/heic','image/heif','application/pdf']
)
on conflict (id) do nothing;

-- Objects live under the owner's user id, so ownership is a path prefix and
-- every policy below is the same comparison.
create policy "uploads_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "uploads_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Replacing a photo that came out blurred is the common case, and it is the
-- same act as deleting one.
create policy "uploads_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "uploads_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ---------------------------------------------------------------------------

create table public.uploads (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  user_id        uuid not null references auth.users (id) on delete cascade,

  -- Which requirement this satisfies. The list of requirements is code in
  -- packages/core, not rows here: what a route demands is a rule, and a rule
  -- that lives in the database is a rule nobody can review in a pull request.
  document        text not null,
  -- Multi-page documents are ordered page sets; a bank statement is rarely one
  -- page, and the order is part of what the consulate reads.
  page            smallint not null default 1,

  storage_path   text not null unique,
  content_type   text not null,
  size_bytes     bigint,
  -- The name the applicant's own file had. Frequently Chinese; display only.
  original_name  text,

  -- `pending` until the server has confirmed the object is really there. A
  -- document counts as uploaded on that confirmation and on nothing else.
  status         text not null default 'pending'
                 check (status in ('pending','stored','deleted')),

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz,

  unique (application_id, document, page)
);

create trigger uploads_set_updated_at
  before update on public.uploads
  for each row execute function public.set_updated_at();

create index uploads_application_idx on public.uploads (application_id, document, page);

alter table public.uploads enable row level security;

create policy "uploads_rows_select_own" on public.uploads
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "uploads_rows_insert_own" on public.uploads
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "uploads_rows_update_own" on public.uploads
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "uploads_rows_delete_own" on public.uploads
  for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.uploads from anon;
grant select, delete on public.uploads to authenticated;
-- The client announces an upload and may replace or remove it, but `status` is
-- the server's word for "the object is really there", so it is not among the
-- columns a client can set.
grant insert (id, application_id, user_id, document, page, storage_path, content_type, original_name)
  on public.uploads to authenticated;
grant update (page, content_type, size_bytes, original_name)
  on public.uploads to authenticated;

grant select, insert, update, delete on public.uploads to service_role;
