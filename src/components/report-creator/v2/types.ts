import type { FieldErrors } from 'react-hook-form';
import type { IntakeFormDataV2, ReportPersona } from '../intakeSchema.v2';

export type IntakeValues = IntakeFormDataV2;

/** Patch helper: shallow-merges keys into the form (mirrors the prototype's `set`). */
export type SetPatch = (patch: Partial<IntakeValues>) => void;

export interface StepProps {
  persona: ReportPersona;
  form: IntakeValues;
  set: SetPatch;
  errors: FieldErrors<IntakeValues>;
  onNext: () => void;
  onBack?: () => void;
}
