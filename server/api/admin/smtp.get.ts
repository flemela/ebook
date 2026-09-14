// =============================================================================
// server/api/admin/smtp.get.ts
// Proxy endpoint retrieving tenant-specific SMTP configuration & verification status.
// =============================================================================

import { sokoClient } from '../../utils/sokoClient';

export interface SmtpCredentialsStatus {
  id?: string;
  org_id?: string;
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_user: string;
  from_name: string;
  from_email: string;
  reply_to: string | null;
  status: 'pending' | 'verified' | 'failed';
  last_verified_at: string | null;
  last_error: string | null;
}

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'flemela_admin_session') || event.context.authToken;

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized admin session' });
  }

  try {
    return await sokoClient<SmtpCredentialsStatus | null>('/smtp', { token });
  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to fetch SMTP credentials',
    });
  }
});