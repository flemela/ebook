// =============================================================================
// server/api/admin/smtp/verify.post.ts
// Proxy endpoint executing SMTP connection handshake & test email verification.
// =============================================================================

import { sokoClient } from '../../../utils/sokoClient';

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'flemela_admin_session') || event.context.authToken;

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized admin session' });
  }

  const body = await readBody(event);

  try {
    return await sokoClient<{ success: boolean; message: string }>('/smtp/verify', {
      method: 'POST',
      body,
      token,
    });
  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.data?.message || err.statusMessage || 'SMTP verification failed',
    });
  }
});