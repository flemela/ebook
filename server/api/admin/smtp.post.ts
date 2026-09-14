// =============================================================================
// server/api/admin/smtp.post.ts
// Proxy endpoint encrypting and upserting tenant SMTP credentials.
// =============================================================================

import { sokoClient } from '../../utils/sokoClient';

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'flemela_admin_session') || event.context.authToken;

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized admin session' });
  }

  const body = await readBody(event);

  try {
    return await sokoClient('/smtp', {
      method: 'POST',
      body,
      token,
    });
  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.data?.message || err.statusMessage || 'Failed to save SMTP credentials',
    });
  }
});