// supabase/functions/_shared/log.ts

/** 
 * Adds an ISO timestamp and optional prefix to logs. 
 */
export function log(prefix: string, message: string, data?: any) {
  const ts = new Date().toISOString();
  if (data !== undefined) {
    console.log(`[${ts}] [${prefix}] ${message}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`[${ts}] [${prefix}] ${message}`);
  }
}

/** 
 * Generic error logger with stack trace. 
 */
export function logError(prefix: string, message: string, err: unknown) {
  const ts = new Date().toISOString();
  console.error(`[${ts}] [${prefix}] ERROR: ${message}`);
  if (err instanceof Error) {
    console.error(err.stack || err.message);
  } else {
    console.error(err);
  }
}
