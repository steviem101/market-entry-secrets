-- Fix stuck report that has no data (worker died before saving)
UPDATE public.user_reports 
SET status = 'failed', 
    report_json = '{"error": "Report generation timed out during processing. Please regenerate."}'::jsonb
WHERE id = '82e0a22a-ef4b-4e78-b1de-20400356f122' 
  AND status = 'processing';

-- Also fix the associated intake form
UPDATE public.user_intake_forms 
SET status = 'failed' 
WHERE id IN (
  SELECT intake_form_id FROM public.user_reports 
  WHERE id = '82e0a22a-ef4b-4e78-b1de-20400356f122'
);