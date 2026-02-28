// supabase/functions/_shared/email/types.ts

export interface EmailRequest {
  email_type: string;
  recipient_email: string;
  user_id?: string;
  data?: Record<string, unknown>;
}

export interface ResendResult {
  id?: string;
  error?: string;
}

export interface TemplateResult {
  subject: string;
  html: string;
}
