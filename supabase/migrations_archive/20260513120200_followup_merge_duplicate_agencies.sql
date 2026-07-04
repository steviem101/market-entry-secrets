-- Follow-up 3: merge the 6 duplicate trade-agency pairs that the Phase 3
-- research sub-agents independently converged on the same canonical website.
--
-- For each pair: reassign agency_contacts to the keeper row, then delete
-- the dropped row. trade_agencies_enrichment_staging has ON DELETE CASCADE
-- so its rows for the dropped agency_id auto-clean; same for agency_resources.
--
-- Keeper selection rule:
--   * cleaner / less-abbreviated name where possible
--   * matches the recommendation in
--     docs/trade-agencies-staging-review-2026-05-09.md
--
-- Pairs (keep / drop / canonical):
--   1. danish    529439b4 (Danish Trade Council)
--                / 8cd0bc12 (Danish Trade Council / Danish Connect)
--                — australien.um.dk
--   2. dutch_qld c524cd3f (Dutch Chamber of Commerce Queensland)
--                / 264247f4 (DCCQ - Dutch Chamber of Commerce Queensland)
--                — dccq.org
--   3. estonian  28cf410f (Estonian Australian Chamber of Commerce)
--                / 4da104ef (Estonian Chamber of Commerce)
--                — eacci.com.au
--   4. iccwa     55f921a6 (Indonesian Chamber of Commerce Western Australia)
--                / d8989f98 (ICCWA - Indonesian Chamber of Commerce Western Australia)
--                — iccwa.net.au
--   5. jetro     86099799 (JETRO - Japan External Trade Organization)
--                / dda9886d (JETRO - Japan External Trade Organisation)
--                — jetro.go.jp (Org/Organisation spelling variant only)
--   6. nzmebc    2780b091 (New Zealand Middle East Business Council)
--                / bf951a3e (NZ-Middle East Business Council (NZMEBC))
--                — nzmebc.org.nz

BEGIN;

-- Step 1: reassign contacts from dropped → keeper.
-- Keepers will end up with the union of both rows' contacts. agency_contacts
-- has no UNIQUE (agency_id, full_name) constraint, so duplicate names across
-- both halves are tolerated — those can be deduped in a separate sweep.
UPDATE agency_contacts SET agency_id = '529439b4-0571-497f-989f-8326487169fa'
  WHERE agency_id = '8cd0bc12-d2ea-41ef-b80b-aad91ad3465a';
UPDATE agency_contacts SET agency_id = 'c524cd3f-ca20-43f1-a634-d00135a9588b'
  WHERE agency_id = '264247f4-6a79-4ca5-abdf-3f9620ccf069';
UPDATE agency_contacts SET agency_id = '28cf410f-89d5-418c-b967-bce36330bcdd'
  WHERE agency_id = '4da104ef-d80f-4992-8701-588fa5ab2837';
UPDATE agency_contacts SET agency_id = '55f921a6-a25f-40e5-aaa3-33c6bf129ae7'
  WHERE agency_id = 'd8989f98-9051-4a9a-86a2-3b42f0b4716b';
UPDATE agency_contacts SET agency_id = '86099799-b451-4811-bb63-b02763b13b12'
  WHERE agency_id = 'dda9886d-b7f9-46de-80ac-5422c1242371';
UPDATE agency_contacts SET agency_id = '2780b091-a846-42f8-9dac-c4c960da94cd'
  WHERE agency_id = 'bf951a3e-1ec1-492c-b102-af89a1b57949';

-- Step 2: ensure each keeper has exactly one is_primary=true contact.
-- After the merge, the keeper may have 2 primary contacts (one from each
-- original row). Promote the highest-scoring one and demote the other.
WITH ranked AS (
  SELECT ac.id, ac.agency_id,
    ROW_NUMBER() OVER (
      PARTITION BY ac.agency_id
      ORDER BY
        COALESCE(ac.is_archived, false) ASC,
        COALESCE(ac.mes_relevance_score, 0) DESC,
        COALESCE(ac.display_order, 99) ASC
    ) AS rank_in_agency
  FROM agency_contacts ac
  WHERE ac.agency_id IN (
    '529439b4-0571-497f-989f-8326487169fa',
    'c524cd3f-ca20-43f1-a634-d00135a9588b',
    '28cf410f-89d5-418c-b967-bce36330bcdd',
    '55f921a6-a25f-40e5-aaa3-33c6bf129ae7',
    '86099799-b451-4811-bb63-b02763b13b12',
    '2780b091-a846-42f8-9dac-c4c960da94cd'
  )
)
UPDATE agency_contacts ac
SET is_primary = (r.rank_in_agency = 1)
FROM ranked r
WHERE ac.id = r.id;

-- Step 3: delete the dropped duplicates (ON DELETE CASCADE handles the
-- enrichment_staging entries and any residual resources).
DELETE FROM trade_investment_agencies
WHERE id IN (
  '8cd0bc12-d2ea-41ef-b80b-aad91ad3465a',
  '264247f4-6a79-4ca5-abdf-3f9620ccf069',
  '4da104ef-d80f-4992-8701-588fa5ab2837',
  'd8989f98-9051-4a9a-86a2-3b42f0b4716b',
  'dda9886d-b7f9-46de-80ac-5422c1242371',
  'bf951a3e-1ec1-492c-b102-af89a1b57949'
);

COMMIT;
