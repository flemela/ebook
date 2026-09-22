<!-- components/storefront/CartDrawer.vue -->
<script setup lang="ts">
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Download } from 'lucide-vue-next';
import { useCart } from '~/composables/useCart';

const { items, isDrawerOpen, totalItems, subtotal, removeItem, closeDrawer } = useCart();

function formatCurrency(val: number): string {
  return `KSh ${val.toLocaleString('en-KE')}`;
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="isDrawerOpen" class="fixed inset-0 z-50 flex justify-end">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/60 backdrop-blur-xs" @click="closeDrawer" />

        <!-- Drawer Panel -->
        <div class="relative w-full max-w-md bg-theme-surface h-full shadow-2xl flex flex-col z-10 text-theme-ink border-l border-theme-border">
          <!-- Header -->
          <div class="p-4 border-b border-theme-border flex items-center justify-between bg-theme-surface-subtle">
            <div class="flex items-center gap-2">
              <ShoppingBag :size="18" class="text-theme-ink" />
              <h3 class="font-display font-bold text-base text-theme-ink">Your Digital Library Cart</h3>
              <span class="bg-theme-accent text-white text-xs font-bold px-2 py-0.5 rounded-full font-mono">
                {{ totalItems }}
              </span>
            </div>
            <button
              type="button"
              class="text-theme-muted hover:text-theme-ink hover:bg-theme-surface-muted p-1.5 rounded-md transition-colors cursor-pointer"
              aria-label="Close cart drawer"
              @click="closeDrawer"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- Empty State -->
          <div v-if="items.length === 0" class="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div class="w-16 h-16 rounded-full bg-theme-surface-subtle flex items-center justify-center text-theme-muted">
              <ShoppingBag :size="32" class="opacity-60" />
            </div>
            <h4 class="font-display font-bold text-base text-theme-ink">Your cart is empty</h4>
            <p class="text-xs text-theme-muted max-w-xs leading-relaxed">
              Explore our catalog and add instant PDF eBooks to your reading collection.
            </p>
            <button
              type="button"
              class="bg-theme-accent hover:bg-theme-accent-hover text-white text-xs font-bold uppercase px-5 py-2.5 rounded-xl transition-colors shadow cursor-pointer"
              @click="closeDrawer"
            >
              Start Browsing
            </button>
          </div>

          <!-- Items List -->
          <div v-else class="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-theme-border">
            <div
              v-for="item in items"
              :key="item.productId"
              class="pt-3 first:pt-0 flex gap-3 items-start"
            >
              <!-- Cover -->
              <div class="w-14 h-18 bg-theme-surface-subtle rounded border border-theme-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                <img v-if="item.coverUrl" :src="item.coverUrl" :alt="item.title" class="w-full h-full object-cover" />
                <ShoppingBag v-else :size="18" class="text-theme-muted opacity-40" />
              </div>

              <!-- Item Info -->
              <div class="flex-1 min-w-0 space-y-1">
                <div class="flex justify-between items-start gap-2">
                  <h5 class="text-xs font-bold text-theme-ink truncate leading-tight">{{ item.title }}</h5>
                  <button
                    type="button"
                    class="text-theme-muted hover:text-theme-accent p-0.5 cursor-pointer transition-colors"
                    title="Remove item"
                    @click="removeItem(item.productId, item.formatId)"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>

                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center gap-1 text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded border bg-emerald-50 text-emerald-800 border-emerald-200">
                    <Download :size="9" />
                    eBook (PDF)
                  </span>
                  <span v-if="item.author" class="text-[11px] text-theme-muted truncate">{{ item.author }}</span>
                </div>

                <div class="flex justify-between items-center pt-2">
                  <span class="text-[11px] font-mono text-theme-muted">
                    1 Digital License
                  </span>
                  <span class="text-xs font-bold text-theme-ink font-mono tabular-figure">
                    {{ formatCurrency(item.price) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer & Checkout CTA -->
          <div v-if="items.length > 0" class="p-4 border-t border-theme-border bg-theme-surface-subtle space-y-3">
            <div class="flex justify-between items-center text-xs">
              <span class="text-theme-muted font-bold">Total (Instant Delivery)</span>
              <span class="text-base font-extrabold text-theme-ink font-mono tabular-figure">
                {{ formatCurrency(subtotal) }}
              </span>
            </div>

            <div class="flex items-center gap-2 text-xs text-theme-muted">
              <ShieldCheck :size="16" class="text-emerald-600 flex-shrink-0" />
              <span>Instant eBook download links unlocked immediately after payment.</span>
            </div>

            <NuxtLink
              to="/checkout"
              class="w-full bg-theme-accent hover:bg-theme-accent-hover active:bg-theme-accent-active text-white text-xs font-bold uppercase py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow cursor-pointer"
              @click="closeDrawer"
            >
              <span>Proceed to Instant Checkout</span>
              <ArrowRight :size="15" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
</style>