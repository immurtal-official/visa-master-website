-- Local development only: `supabase db reset` runs this after the migrations.
-- It is never pushed to a hosted project.

-- The backend's login role needs a password to connect; this one is known and
-- local. A hosted project sets its own, out of band (see the migration
-- 20261005200000_api_login_role.sql).
alter role visa_api with password 'visa-api-local';
