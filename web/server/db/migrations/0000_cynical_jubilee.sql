-- Drizzle baseline migration: cynical_jubilee
-- NOTE:
-- - This project was using existing SQL migrations under ./server/db/migrations/base and ./server/db/migrations/modules
-- - This file serves as a NO-OP baseline so Drizzle's migrator can work with the current schema snapshot (meta/0000_snapshot.json)
-- - It intentionally does not create or alter any objects, because the schema already exists in the database.

-- no-op
SELECT 1;

