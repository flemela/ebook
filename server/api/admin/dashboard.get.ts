// =============================================================================
// server/api/admin/dashboard.get.ts
// Aggregates real-time telemetry: catalog count, R2 storage (MB), orders & revenue.
// =============================================================================

import { sokoClient } from '../../utils/sokoClient';

export interface AdminDashboardData {
  totalBooks: number;
  storageUsedMb: number;
  pendingOrders: number;
  todayRevenue: number;
  monthRevenue: number;
  recentOrders: Array<{
    id: string;
    customerName: string;
    customerPhone: string;
    total: number;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    createdAt: string;
  }>;
}

export default defineEventHandler(async (event): Promise<AdminDashboardData> => {
  const token =
    event.context.authToken ||
    getCookie(event, 'flemela_admin_session') ||
    undefined;

  try {
    // Concurrent fetch with graceful fallbacks
    const [productsRes, storageRes, summaryRes, ordersRes] = await Promise.all([
      sokoClient<any>('/products', {
        token,
        event,
        query: { limit: 100, page: 1 },
      }).catch((err) => {
        console.warn('[Dashboard] Products fetch warning:', err.message);
        return null;
      }),

      sokoClient<{ totalMb?: number; totalBytes?: number }>('/books/storage-stats', {
        token,
        event,
      }).catch(() => null),

      sokoClient<{
        today_revenue?: string | number;
        month_revenue?: string | number;
        pending_count?: number;
      }>('/orders/summary', {
        token,
        event,
      }).catch(() => null),

      sokoClient<any>('/orders', {
        token,
        event,
        query: { limit: 50, page: 1 },
      }).catch((err) => {
        console.warn('[Dashboard] Orders fetch warning:', err.message);
        return null;
      }),
    ]);

    // 1. Resolve Products & Catalog Size
    let productsList: any[] = [];
    let totalBooksCount = 0;

    if (Array.isArray(productsRes)) {
      productsList = productsRes;
      totalBooksCount = productsRes.length;
    } else if (productsRes && typeof productsRes === 'object') {
      productsList = productsRes.products || productsRes.data || [];
      totalBooksCount = Number(productsRes.total ?? productsList.length);
    }

    // 2. Resolve Orders List
    let allOrdersList: any[] = [];
    if (Array.isArray(ordersRes)) {
      allOrdersList = ordersRes;
    } else if (ordersRes && typeof ordersRes === 'object') {
      allOrdersList = ordersRes.orders || ordersRes.data || [];
    }

    // 3. Resolve Real Cloudflare R2 Storage (MB)
    let storageUsedMb = 0;
    if (storageRes?.totalMb && storageRes.totalMb > 0) {
      storageUsedMb = Number(storageRes.totalMb);
    } else if (storageRes?.totalBytes && storageRes.totalBytes > 0) {
      storageUsedMb = Math.round((storageRes.totalBytes / (1024 * 1024)) * 10) / 10;
    } else {
      // Direct sum from catalog format byte sizes
      let totalBytes = 0;
      for (const prod of productsList) {
        if (Array.isArray(prod.formats)) {
          for (const fmt of prod.formats) {
            if (fmt.file_size_bytes && Number(fmt.file_size_bytes) > 0) {
              totalBytes += Number(fmt.file_size_bytes);
            }
          }
        }
      }
      storageUsedMb = totalBytes > 0 ? Math.round((totalBytes / (1024 * 1024)) * 10) / 10 : 0;
    }

    // 4. Compute Dynamic Revenue & Pending Counts
    const now = new Date();
    const todayYMD = now.toISOString().slice(0, 10);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let todayRevenue = 0;
    let monthRevenue = 0;
    let pendingCount = 0;

    // Use summary endpoint if populated
    if (summaryRes) {
      todayRevenue = parseFloat(String(summaryRes.today_revenue || '0'));
      monthRevenue = parseFloat(String(summaryRes.month_revenue || '0'));
      pendingCount = Number(summaryRes.pending_count || 0);
    }

    // Fallback: Compute directly from live order records if summary is zero/null
    if (todayRevenue === 0 && monthRevenue === 0 && pendingCount === 0 && allOrdersList.length > 0) {
      for (const order of allOrdersList) {
        const orderDate = new Date(order.created_at || order.createdAt || Date.now());
        const orderDateYMD = orderDate.toISOString().slice(0, 10);
        const orderTotal = parseFloat(String(order.total || '0')) || 0;

        const isPaid =
          order.payment_status === 'paid' ||
          order.paymentStatus === 'paid' ||
          order.status === 'confirmed' ||
          order.status === 'delivered';

        const isPending =
          order.payment_status === 'pending' ||
          order.paymentStatus === 'pending' ||
          order.status === 'pending';

        if (isPending) {
          pendingCount++;
        }

        if (isPaid && orderDateYMD === todayYMD) {
          todayRevenue += orderTotal;
        }

        if (isPaid && orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
          monthRevenue += orderTotal;
        }
      }
    }

    // 5. Format Most Recent 8 Orders
    const recentOrders = allOrdersList.slice(0, 8).map((o: any) => ({
      id: String(o.id || ''),
      customerName: o.customer_name || o.customerName || 'Customer',
      customerPhone: o.customer_phone || o.customerPhone || '—',
      total: parseFloat(String(o.total || '0')) || 0,
      status: o.status || 'pending',
      paymentStatus: o.payment_status || o.paymentStatus || 'pending',
      paymentMethod: o.payment_method || o.paymentMethod || 'mpesa_manual',
      createdAt: o.created_at || o.createdAt || new Date().toISOString(),
    }));

    return {
      totalBooks: totalBooksCount,
      storageUsedMb,
      pendingOrders: pendingCount,
      todayRevenue,
      monthRevenue,
      recentOrders,
    };
  } catch (err: any) {
    console.error('[Dashboard Error]', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.data?.message || err.message || 'Failed to load live dashboard data',
    });
  }
});