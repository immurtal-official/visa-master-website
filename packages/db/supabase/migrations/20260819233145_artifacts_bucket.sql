-- Where finished runs land.
--
-- Written only by the conductor with its own credential, after a run: the job
-- container never holds a storage credential, so a taken-over agent cannot
-- reach this bucket — it never could. No client policy exists on purpose;
-- users will get short-lived signed URLs from the review/delivery surfaces
-- (week 4), never the bucket.
insert into storage.buckets (id, name, public)
values ('artifacts', 'artifacts', false)
on conflict (id) do nothing;
