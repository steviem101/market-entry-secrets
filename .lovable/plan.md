

# Add Database Constraint for Industry Sector (149 Options Only)

## Overview

Add a validation trigger on the `user_intake_forms` table to restrict the `industry_sector` column to only the 149 approved industry options. First, existing non-conforming data will be migrated to valid values.

## Existing data to fix

The table currently has 9 rows with values not in the 149-option list:

| Current Value | Count | Maps To |
|---|---|---|
| Cybersecurity | 6 | Computer & Network Security |
| MedTech/HealthTech | 1 | Medical Devices |
| Other | 2 | Already valid (in list) |

## What the migration will do

1. **Update existing rows** to map free-text values to valid options:
   - `Cybersecurity` → `Computer & Network Security`
   - `MedTech/HealthTech` → `Medical Devices`

2. **Create a validation trigger** (not a CHECK constraint, per Supabase best practices) that runs on INSERT and UPDATE. It will reject any `industry_sector` value that is not in the approved 149-option list.

## Why a trigger instead of a CHECK constraint

Supabase recommends validation triggers over CHECK constraints because CHECK constraints must be immutable and can cause issues with database backups/restores. A trigger-based approach is more flexible and safer.

## Technical details

### Migration SQL will:

1. Run UPDATE statements to fix the 7 non-conforming rows
2. Create a function `validate_industry_sector()` containing the list of 149 valid values
3. Create a BEFORE INSERT OR UPDATE trigger on `user_intake_forms` that calls this function
4. If an invalid value is submitted, it raises an exception with a clear error message

### No frontend changes needed

The searchable combobox already restricts the UI to only the 149 options -- this migration adds the database-level enforcement as a safety net.

