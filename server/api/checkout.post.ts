// =============================================================================
// server/api/checkout.post.ts (EbookReads)
// Pure Digital Checkout Endpoint with Verified Asset Availability Protection
// =============================================================================

import { z } from 'zod';
import { sokoClient } from '../utils/sokoClient';
import { normalizeKenyanPhone, isValidKenyanPhone } from '../../utils/phone';

const DigitalCheckoutSchema = z.object({
  customerName: z.string().min(1, 'Full name is required').max(200),
  customerPhone: z
    .string()
    .min(9, 'Phone number is required')
    .refine((val) => isValidKenyanPhone(val), {
      message: 'Enter a valid Kenyan mobile number (e.g. 07XXXXXXXX or 01XXXXXXXX)',
    }),
  customerEmail: z
    .string()
    .email('Valid email address is required for digital eBook delivery')
    .max(255),
  deliveryType: z.enum(['delivery', 'pickup']).default('delivery'),
  deliveryLocation: z
    .string()
    .default('Instant Digital Delivery (eBook PDF via Cloudflare R2)'),
  paymentMethod: z.enum(['mpesa_manual', 'mpesa']).default('mpesa_manual'),
  mpesaCode: z
    .string()
    .max(50)
    .nullable()
    .optional()
    .transform((v) => (v ? v.trim().toUpperCase() : null)),
  notes: z.string().max(1000).nullable().optional(),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid('Invalid product ID'),
        format_id: z.string().uuid('Invalid format ID').nullable().optional(),
        quantity: z.number().int().min(1).default(1),
        delivery_method: z.literal('digital').default('digital'),
      })
    )
    .min(1, 'Cannot checkout with an empty digital cart'),
});

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const storeSlug = config.public.storeSlug;

  const rawBody = await readBody(event);
  const parsed = DigitalCheckoutSchema.safeParse(rawBody);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message || 'Invalid checkout payload',
    });
  }

  const cleanPhone = normalizeKenyanPhone(parsed.data.customerPhone);

  const payload = {
    customerName: parsed.data.customerName.trim(),
    customerPhone: cleanPhone,
    customerEmail: parsed.data.customerEmail.trim(),
    deliveryLocation: 'Instant Digital Delivery (eBook PDF via Cloudflare R2)',
    deliveryType: 'delivery',
    paymentMethod: parsed.data.paymentMethod,
    mpesaCode: parsed.data.mpesaCode,
    notes: parsed.data.notes?.trim() || null,
    customerLat: null,
    customerLng: null,
    items: parsed.data.items.map((item) => ({
      product_id: item.product_id,
      format_id: item.format_id || null,
      quantity: 1, // Single-license per title
      delivery_method: 'digital',
    })),
  };

  try {
    const response = await sokoClient<{ orderId: string; checkoutRequestId?: string }>(
      `/public/stores/${storeSlug}/orders`,
      {
        method: 'POST',
        body: payload,
      }
    );

    return {
      success: true,
      orderId: response.orderId,
      checkoutRequestId: response.checkoutRequestId || null,
      phone: cleanPhone,
    };
  } catch (err: any) {
    const errorMsg =
      err.data?.error?.message ||
      err.data?.message ||
      err.statusMessage ||
      'Failed to place eBook order. If a book has no PDF, please request it on WhatsApp.';

    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: errorMsg,
      data: err.data,
    });
  }
});