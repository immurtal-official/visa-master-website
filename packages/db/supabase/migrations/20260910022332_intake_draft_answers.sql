-- What is being typed right now, as opposed to what has been answered.
--
-- `answers` is written on the way out of a question, once the value has passed
-- the rule for that field. Until then the typing lived only in the page, so a
-- refresh — or an in-app browser deciding to reload the tab, which is the case
-- that actually happens — threw it away. Someone thirty characters into their
-- address lost thirty characters, and nothing anywhere had a record of them.
--
-- This column holds the raw keystrokes for the question in hand: unvalidated,
-- unnormalised, possibly half a date. It is deliberately a separate column
-- rather than a shape inside `answers`, because the two mean different things
-- and only one of them is allowed to reach a visa pack. `parseIntake` reads
-- `answers` and cannot see this column, so a value nobody pressed Continue on
-- can never become part of a submission. That is a property of the schema, not
-- a rule someone has to remember.
--
-- Entries are cleared per question as each answer is confirmed, and wholesale
-- at submission, so this is scratch space that empties itself rather than a
-- second copy of the intake that grows forever.
--
-- It is personal data on the same footing as `answers` — same row, same owner,
-- same cascade on account deletion — and is listed alongside it in the
-- retention schedule (architecture v0.4 Chapter B §3).

alter table public.applications
  add column draft_answers jsonb not null default '{}';

-- Column privileges do not extend to columns added later, and both client
-- write paths name their columns explicitly. Without these two grants nothing
-- already working breaks — the first autosave simply returns 42501, which
-- looks like a bug in the new feature rather than a missing grant. That is the
-- failure mode 20260811041953_server_role_grants.sql exists to describe.
grant insert (draft_answers) on public.applications to authenticated;
grant update (draft_answers) on public.applications to authenticated;
