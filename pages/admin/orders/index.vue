<!-- pages/admin/orders/index.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Inbox,
  Search,
  CheckCircle2,
  Truck,
  Store,
  RefreshCw,
  MapPin,
  CreditCard,
  Zap,
  Phone,
  User,
  ChevronDown,
  ChevronUp,
  KeyRound,
} from 'lucide-vue-next';
import Pagination from '~/components/ui/Pagination.vue';
import AdminLayout from '~/components/admin/AdminLayout.vue';
import { useToast } from '~/composables/useToast';

definePageMeta({
  middleware: 'admin-auth',
});

interface OrderItem {
  id: string;
  product_name: string;
  variant_title: string | null;
  unit_price: string;
  quantity: number;
  subtotal: string;
}

interface AdminOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_location: string;
  notes: string | null;
  status: 'pending' | 'confirmed' | 'assigned' | 'out_for_delivery' | 'delivered' | 'cancelled';
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed';
  payment_reference: string | null;
  total: string;
  delivery_type: 'delivery' | 'pickup';
  delivery_fee: string;
  delivery_confirmation_code: string | null;
  created_at: string;
  items: OrderItem[];
}

const { push: pushToast } = useToast();

const searchQuery = ref('');
const statusFilter = ref('all');
const paymentMethodFilter = ref('all');
const paymentStatusFilter = ref('all');
const page = ref(1);
const totalPages = computed(() => ordersData.value?.meta?.totalPages ?? 1);

function handlePageChange(newPage: number): void {
  page.value = newPage;
  if (process.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

const { data: ordersData, refresh, status: fetchStatus } = await useFetch<{
  data: AdminOrder[];
  meta: { totalItems: number; page: number; totalPages: number };
}>('/api/admin/orders', {
  query: {
    q: searchQuery,
    status: statusFilter,
    payment_method: paymentMethodFilter,
    payment_status: paymentStatusFilter,
    page,
  },
});

const orders = computed<AdminOrder[]>(() => ordersData.value?.data || []);
const updatingOrderId = ref<string | null>(null);
const expandedOrderIds = ref<Set<string>>(new Set());

function toggleExpand(orderId: string): void {
  if (expandedOrderIds.value.has(orderId)) {
    expandedOrderIds.value.delete(orderId);
  } else {
    expandedOrderIds.value.add(orderId);
  }
}

function formatCurrency(val: string | number): string {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  return `KSh ${num.toLocaleString('en-KE')}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function handleApprovePayment(orderId: string): Promise<void> {
  updatingOrderId.value = orderId;
  try {
    await $fetch(`/api/admin/orders/${orderId}/payment-status`, {
      method: 'PATCH' as any,
      body: { payment_status: 'paid' },
    });
    pushToast({ message: 'Payment verified! Downloads unlocked and ledger entry created.', variant: 'success' });
    await refresh();
  } catch (err: any) {
    pushToast({ message: err.data?.message || 'Failed to approve payment', variant: 'error' });
  } finally {
    updatingOrderId.value = null;
  }
}

async function handleUpdateStatus(orderId: string, newStatus: string): Promise<void> {
  updatingOrderId.value = orderId;
  try {
    await $fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH' as any,
      body: { status: newStatus },
    });
    pushToast({ message: `Order status updated to ${newStatus}!`, variant: 'success' });
    await refresh();
  } catch (err: any) {
    pushToast({ message: err.data?.message || 'Failed to update order status', variant: 'error' });
  } finally {
    updatingOrderId.value = null;
  }
}

function handleResetFilters(): void {
  searchQuery.value = '';
  statusFilter.value = 'all';
  paymentMethodFilter.value = 'all';
  paymentStatusFilter.value = 'all';
  page.value = 1;
}
</script>

<template>
  <AdminLayout>
    <div class="space-y-6 max-w-7xl mx-auto text-theme-ink">
      
      <!-- Top Title Bar -->
      <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-theme-border">
        <div>
          <span class="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-theme-accent font-bold block">
            Fulfillment &amp; Verification
          </span>
          <h1 class="font-display text-2xl sm:text-3xl font-bold text-theme-ink">
            Order Management Desk
          </h1>
          <p class="text-xs text-theme-muted mt-0.5">
            Verify manual M-Pesa deposits, monitor Cash on Delivery orders, and track fulfillment dispatch.
          </p>
        </div>

        <button
          type="button"
          class="px-3.5 py-2 bg-theme-surface border border-theme-border rounded-xl text-theme-ink text-xs font-semibold flex items-center gap-1.5 hover:bg-theme-surface-subtle transition-colors cursor-pointer shadow-2xs"
          @click="() => refresh()"
        >
          <RefreshCw :size="13" :class="{ 'animate-spin': fetchStatus === 'pending' }" />
          <span>Refresh Orders</span>
        </button>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="bg-theme-surface p-4 rounded-2xl border border-theme-border shadow-soft flex flex-wrap gap-3 items-center justify-between">
        
        <div class="relative flex-1 min-w-[240px]">
          <Search :size="14" class="absolute left-3.5 top-3 text-theme-subtle pointer-events-none" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by customer, phone, M-Pesa ref, or order ID..."
            class="w-full pl-9 pr-3 py-2 bg-theme-surface-subtle border border-theme-border rounded-xl text-xs outline-none focus:bg-white focus:border-theme-accent transition-all text-theme-ink placeholder:text-theme-muted"
            @keyup.enter="() => refresh()"
          />
        </div>

        <select
          v-model="paymentMethodFilter"
          class="px-3 py-2 bg-theme-surface-subtle border border-theme-border rounded-xl text-xs font-semibold text-theme-ink outline-none"
          @change="() => { page = 1; refresh(); }"
        >
          <option value="all">All Payment Channels</option>
          <option value="mpesa_manual">Direct M-Pesa Till (Manual)</option>
          <option value="mpesa_cash">Cash on Delivery / Pickup</option>
          <option value="mpesa">Automated STK Push</option>
        </select>

        <select
          v-model="statusFilter"
          class="px-3 py-2 bg-theme-surface-subtle border border-theme-border rounded-xl text-xs font-semibold text-theme-ink outline-none"
          @change="() => { page = 1; refresh(); }"
        >
          <option value="all">All Fulfillment Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="assigned">Rider Assigned</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          v-model="paymentStatusFilter"
          class="px-3 py-2 bg-theme-surface-subtle border border-theme-border rounded-xl text-xs font-semibold text-theme-ink outline-none"
          @change="() => { page = 1; refresh(); }"
        >
          <option value="all">All Payment Statuses</option>
          <option value="pending">Payment Pending</option>
          <option value="paid">Payment Verified</option>
          <option value="failed">Payment Failed</option>
        </select>
      </div>

      <!-- Orders Feed Table -->
      <div class="bg-theme-surface rounded-2xl border border-theme-border shadow-soft overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-theme-surface-subtle border-b border-theme-border text-theme-muted uppercase tracking-wider font-mono text-[9px]">
                <th class="py-3 px-4">Order ID &amp; Time</th>
                <th class="py-3 px-4">Customer &amp; Destination</th>
                <th class="py-3 px-4">Channel &amp; M-Pesa Ref</th>
                <th class="py-3 px-4 text-right">Total Bill</th>
                <th class="py-3 px-4">Status &amp; Verification</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-theme-border">
              <tr v-if="fetchStatus === 'pending'">
                <td colspan="6" class="py-12 text-center text-theme-muted text-xs">
                  Loading order desk...
                </td>
              </tr>

              <tr v-else-if="!orders.length">
                <td colspan="6" class="py-12 text-center text-theme-muted text-xs space-y-2">
                  <Inbox :size="24" class="mx-auto text-theme-subtle opacity-50" />
                  <p>No orders match the selected filters.</p>
                  <button
                    type="button"
                    class="text-theme-accent font-bold underline cursor-pointer text-xs"
                    @click="handleResetFilters"
                  >
                    Reset all filters
                  </button>
                </td>
              </tr>

              <template v-for="order in orders" :key="order.id">
                <tr class="hover:bg-theme-surface-subtle transition-colors">
                  <td class="py-3.5 px-4 align-top">
                    <span class="font-mono font-bold text-theme-ink block">
                      #{{ order.id.slice(0, 8).toUpperCase() }}
                    </span>
                    <span class="text-[10px] text-theme-muted font-mono block mt-0.5">
                      {{ formatDate(order.created_at) }}
                    </span>
                    <div class="mt-1 flex items-center gap-1.5">
                      <span
                        v-if="order.delivery_type === 'pickup'"
                        class="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200"
                      >
                        <Store :size="10" /> Store Pickup
                      </span>
                      <span
                        v-else
                        class="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-theme-ink bg-theme-surface-subtle px-1.5 py-0.2 rounded border border-theme-border"
                      >
                        <Truck :size="10" /> Delivery
                      </span>

                      <button
                        type="button"
                        class="text-[10px] font-mono text-theme-muted hover:text-theme-ink flex items-center gap-0.5 cursor-pointer"
                        @click="toggleExpand(order.id)"
                      >
                        <span>{{ order.items?.length || 0 }} item(s)</span>
                        <component :is="expandedOrderIds.has(order.id) ? ChevronUp : ChevronDown" :size="11" />
                      </button>
                    </div>
                  </td>

                  <td class="py-3.5 px-4 align-top max-w-xs">
                    <div class="font-bold text-theme-ink flex items-center gap-1">
                      <User :size="12" class="text-theme-subtle" />
                      <span>{{ order.customer_name }}</span>
                    </div>
                    <div class="font-mono text-[11px] text-theme-muted flex items-center gap-1 mt-0.5">
                      <Phone :size="11" class="text-theme-subtle" />
                      <span>{{ order.customer_phone }}</span>
                    </div>
                    <div class="text-[11px] text-theme-subtle truncate mt-1 flex items-center gap-1" :title="order.delivery_location">
                      <MapPin :size="11" class="flex-shrink-0 text-emerald-600" />
                      <span>{{ order.delivery_location }}</span>
                    </div>
                  </td>

                  <td class="py-3.5 px-4 align-top">
                    <div class="space-y-1">
                      <span
                        class="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded"
                        :class="{
                          'bg-emerald-50 text-emerald-900 border border-emerald-200': order.payment_method === 'mpesa_manual',
                          'bg-theme-surface-muted text-theme-ink': order.payment_method === 'mpesa_cash',
                          'bg-theme-dark text-white': order.payment_method === 'mpesa' || order.payment_method === 'mpesa_direct',
                        }"
                      >
                        <component :is="order.payment_method === 'mpesa_cash' ? CreditCard : Zap" :size="10" />
                        {{ order.payment_method === 'mpesa_manual' ? 'Direct Till' : (order.payment_method === 'mpesa_cash' ? 'Cash on Delivery' : 'STK Push') }}
                      </span>

                      <div v-if="order.payment_reference" class="pt-0.5">
                        <span class="font-mono text-xs font-bold text-theme-ink bg-theme-surface px-2 py-0.5 rounded border border-theme-border inline-block shadow-2xs">
                          {{ order.payment_reference }}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td class="py-3.5 px-4 align-top text-right font-mono font-bold text-theme-ink text-xs tabular-figure">
                    {{ formatCurrency(order.total) }}
                    <span v-if="order.delivery_fee && parseFloat(order.delivery_fee) > 0" class="text-[10px] text-theme-subtle block font-normal">
                      Incl. {{ formatCurrency(order.delivery_fee) }} delivery
                    </span>
                  </td>

                  <td class="py-3.5 px-4 align-top space-y-1">
                    <span
                      class="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border block max-w-fit"
                      :class="{
                        'bg-emerald-50 text-emerald-900 border-emerald-200': order.payment_status === 'paid',
                        'bg-amber-50 text-amber-900 border-amber-200': order.payment_status === 'pending',
                        'bg-red-50 text-red-900 border-red-200': order.payment_status === 'failed',
                      }"
                    >
                      <span
                        class="w-1.5 h-1.5 rounded-full"
                        :class="{
                          'bg-emerald-600': order.payment_status === 'paid',
                          'bg-amber-600': order.payment_status === 'pending',
                          'bg-red-600': order.payment_status === 'failed',
                        }"
                      />
                      {{ order.payment_status === 'paid' ? 'Payment Verified' : (order.payment_status === 'pending' ? 'Payment Pending' : 'Payment Failed') }}
                    </span>

                    <span
                      class="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border block max-w-fit"
                      :class="{
                        'bg-blue-50 text-blue-900 border-blue-200': order.status === 'out_for_delivery',
                        'bg-emerald-50 text-emerald-900 border-emerald-200': order.status === 'confirmed' || order.status === 'delivered',
                        'bg-amber-50 text-amber-900 border-amber-200': order.status === 'pending',
                        'bg-red-50 text-red-900 border-red-200': order.status === 'cancelled',
                      }"
                    >
                      {{ order.status }}
                    </span>

                    <div v-if="order.delivery_confirmation_code" class="pt-0.5">
                      <span class="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-theme-muted">
                        <KeyRound :size="10" class="text-emerald-700" />
                        <span>Code: {{ order.delivery_confirmation_code }}</span>
                      </span>
                    </div>
                  </td>

                  <td class="py-3.5 px-4 align-top text-right space-y-1.5">
                    <button
                      v-if="order.payment_status === 'pending' && order.payment_method === 'mpesa_manual'"
                      type="button"
                      class="bg-theme-dark hover:bg-theme-dark-surface text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all inline-flex items-center gap-1.5 shadow-subtle cursor-pointer disabled:opacity-50"
                      :disabled="updatingOrderId === order.id"
                      @click="handleApprovePayment(order.id)"
                    >
                      <CheckCircle2 :size="12" class="text-emerald-400" />
                      <span>{{ updatingOrderId === order.id ? 'Approving...' : 'Verify Deposit' }}</span>
                    </button>

                    <button
                      v-if="order.status === 'confirmed' && order.delivery_type === 'delivery'"
                      type="button"
                      class="bg-theme-dark hover:bg-theme-dark-surface text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                      :disabled="updatingOrderId === order.id"
                      @click="handleUpdateStatus(order.id, 'out_for_delivery')"
                    >
                      <Truck :size="11" />
                      <span>Dispatch</span>
                    </button>

                    <button
                      v-if="order.status === 'out_for_delivery' || (order.status === 'confirmed' && order.delivery_type === 'pickup')"
                      type="button"
                      class="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                      :disabled="updatingOrderId === order.id"
                      @click="handleUpdateStatus(order.id, 'delivered')"
                    >
                      <CheckCircle2 :size="11" />
                      <span>Complete</span>
                    </button>
                  </td>
                </tr>

                <!-- Expandable Line Items Drawer -->
                <tr v-if="expandedOrderIds.has(order.id)" class="bg-theme-surface-subtle">
                  <td colspan="6" class="px-6 py-3 border-b border-theme-border">
                    <div class="space-y-1.5">
                      <span class="text-[10px] font-mono uppercase font-bold text-theme-muted block tracking-wider">
                        Order Line Items:
                      </span>
                      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        <div
                          v-for="item in order.items"
                          :key="item.id"
                          class="bg-theme-surface p-2.5 rounded-lg border border-theme-border text-xs flex justify-between items-center shadow-2xs"
                        >
                          <div>
                            <strong class="text-theme-ink font-bold block truncate max-w-[180px]">{{ item.product_name }}</strong>
                            <span class="text-[10px] text-theme-muted font-mono">
                              {{ item.variant_title || 'Hardcopy' }} â€¢ Qty: {{ item.quantity }}
                            </span>
                          </div>
                          <span class="font-mono font-bold text-theme-ink text-xs">
                            {{ formatCurrency(item.subtotal) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        :page="page"
        :total-pages="totalPages"
        :disabled="fetchStatus === 'pending'"
        @change="handlePageChange"
      />
    </div>
  </AdminLayout>
</template>