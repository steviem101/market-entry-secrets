-- ============================================================
-- Repair events column defaults for fresh / preview databases
-- Target: MES Platform (xhziwveaiuhzdoutpgrh) ONLY
-- The repair_events_for_preview migration (20260208110000) builds a fresh events
-- table with `time` and `organizer` NOT NULL and no default, and `date` NOT NULL.
-- The live table has the defaults ('See website' / 'TBC') and a nullable date, so
-- inserts that omit these columns (the pilot seed, and the pipeline upsert RPC for
-- rejected rows with no parseable date) work there but fail on a fresh database.
-- Restore that shape. All three statements are no-ops on the live project.
-- Runs before the seed (20260613093700) so the seed's omitted columns get defaults.
-- ============================================================

ALTER TABLE events ALTER COLUMN time SET DEFAULT 'See website';
ALTER TABLE events ALTER COLUMN organizer SET DEFAULT 'TBC';
ALTER TABLE events ALTER COLUMN date DROP NOT NULL;
