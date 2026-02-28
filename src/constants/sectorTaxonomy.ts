// Sector taxonomy constants for the Lead Database section.
// Maps broad sector categories (used in lead_databases.sector) to display metadata.

import { INDUSTRY_OPTIONS } from '@/components/report-creator/intakeSchema';

/**
 * Full industry taxonomy from the report generator intake form (149 industries).
 * Re-exported here as the canonical SECTOR_TAXONOMY constant.
 */
export const SECTOR_TAXONOMY = INDUSTRY_OPTIONS;

/**
 * Gradient classes for each broad sector category used in lead_databases.sector.
 * These map to the 11 STANDARD_SECTORS from sectorMapping.ts.
 */
const SECTOR_GRADIENTS: Record<string, string> = {
  Technology: 'from-violet-500 to-purple-600',
  Healthcare: 'from-emerald-500 to-teal-600',
  Finance: 'from-blue-500 to-indigo-600',
  Manufacturing: 'from-amber-500 to-orange-600',
  Education: 'from-cyan-500 to-blue-600',
  Government: 'from-slate-500 to-gray-600',
  Retail: 'from-pink-500 to-rose-600',
  Agriculture: 'from-lime-500 to-green-600',
  Energy: 'from-yellow-500 to-amber-600',
  Tourism: 'from-sky-500 to-cyan-600',
  Other: 'from-gray-500 to-slate-600',
};

/**
 * Returns a Tailwind gradient class string for a given sector.
 */
export const getSectorGradient = (sector: string | null): string => {
  if (!sector) return SECTOR_GRADIENTS.Other;
  return SECTOR_GRADIENTS[sector] || SECTOR_GRADIENTS.Other;
};

/**
 * Maps broad sector names to their best-guess slug on /sectors/:sectorSlug pages.
 * These are approximations — if the sector page doesn't exist, links degrade gracefully.
 */
const SECTOR_SLUG_MAP: Record<string, string> = {
  Technology: 'technology',
  Healthcare: 'healthcare',
  Finance: 'finance',
  Manufacturing: 'manufacturing',
  Education: 'education',
  Government: 'government',
  Retail: 'retail',
  Agriculture: 'agriculture',
  Energy: 'energy',
  Tourism: 'tourism',
};

export interface SectorMeta {
  label: string;
  slug: string | null;
  gradient: string;
}

/**
 * Returns display metadata for a sector: label, slug (for linking), and gradient.
 */
export const getSectorMeta = (sector: string | null): SectorMeta => {
  if (!sector) {
    return { label: 'Other', slug: null, gradient: SECTOR_GRADIENTS.Other };
  }
  return {
    label: sector,
    slug: SECTOR_SLUG_MAP[sector] || null,
    gradient: SECTOR_GRADIENTS[sector] || SECTOR_GRADIENTS.Other,
  };
};

/**
 * Default feature lists by lead database list_type.
 * Used when a database doesn't have sample_fields populated.
 */
export const DEFAULT_FEATURES_BY_TYPE: Record<string, string[]> = {
  'Lead Database': [
    'Verified email addresses',
    'LinkedIn profiles',
    'Job title + seniority level',
    'Company size + revenue band',
    'Direct phone numbers',
    'HQ location',
  ],
  'Market Data': [
    'Market sizing data',
    'Competitive landscape mapping',
    'Technology stack information',
    'Growth trajectory indicators',
    'Digital maturity scoring',
    'Buying signal enrichment',
  ],
  'TAM Map': [
    'Total addressable market analysis',
    'Company segmentation by vertical',
    'Revenue band classification',
    'Growth stage categorization',
    'Competitive clustering',
    'Geographic distribution',
  ],
};
