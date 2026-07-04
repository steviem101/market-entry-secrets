-- Revert 20260703120000_create_ecosystem_import_candidates.sql
-- Safe: the table is additive staging only; nothing in the app or other
-- tables depends on it. Dropping it removes all staged candidates —
-- export first if any batch is mid-review.

drop table if exists public.ecosystem_import_candidates;
