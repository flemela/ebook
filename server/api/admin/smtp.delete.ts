// =============================================================================
// server/api/admin/smtp.delete.ts
// Proxy endpoint deleting tenant custom SMTP configuration.
// =============================================================================

import { sokoClient } from '../../utils/sokoClient';

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'flemela_admin_session') || event.context.authToken;

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized admin session' });
  }

  try {
    return await sokoClient('/smtp', {
      method: 'DELETE',
      token,
    });
  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to remove SMTP credentials',
    });
  }
});