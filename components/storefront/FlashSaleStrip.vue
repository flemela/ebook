<!-- components/storefront/FlashSaleStrip.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ChevronLeft, ChevronRight, ShoppingCart, Zap, Clock, Download } from 'lucide-vue-next';
import { useCart } from '~/composables/useCart';
import { useToast } from '~/composables/useToast';
import type { Book, ProductFormat } from '~/types';

interface Props {
  books: Book[];
  title?: string;
  badgeLabel?: string;
}

withDefaults(defineProps<Props>(), {
  title: 'FLASH SALE DEALS',
  badgeLabel: 'LIMITED TIME',
});

const { addItem, openDrawer } = useCart();
const { push: pushToast } = useToast();

const scrollContainer = ref<HTMLElement | null>(null);

const hours = ref('08');
const minutes = ref('24');
const seconds = ref('36');
let timerInterval: ReturnType<typeof setInterval> | undefined;

function updateCountdown(): void {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const diff = Math.max(0, target.getTime() - now.getTime());

  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / 1000 / 60) % 60);
  const s = Math.floor((diff / 1000) % 60);

  hours.value = String(h).padStart(2, '0');
  minutes.value = String(m).padStart(2, '0');
  seconds.value = String(s).padStart(2, '0');
}

onMounted(() => {
  updateCountdown();
  timerInterval = setInterval(updateCountdown, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

function scrollLeft(): void {
  scrollContainer.value?.scrollBy({ left: -240, behavior: 'smooth' });
}

function scrollRight(): void {
  scrollContainer.value?.scrollBy({ left: 240, behavior: 'smooth' });
}

function formatCurrency(val: number): string {
  return `KSh ${val.toLocaleString('en-KE')}`;
}

function getBookPdfFormat(book: Book): ProductFormat {
  const pdf = book.formats?.find((f) => f.format === 'pdf');
  if (pdf) return pdf;

  const epub = book.formats?.find((f) => f.format === 'epub');
  if (epub) return epub;

  const defaultPrice = book.price && book.price < 500 ? book.price : 149;
  return {
    id: `pdf-${book.id}`,
    product_id: book.id,
    format: 'pdf',
    price: defaultPrice,
    compare_at_price: book.compare_at_price || null,
    file_url: null,
    file_public_id: null,
    file_size_bytes: null,
    stock: null,
    created_at: book.created_at || '',
    updated_at: book.updated_at || '',
  };
}

function getBookPricing(book: Book) {
  const fmt = getBookPdfFormat(book);
  const p = fmt.price;
  const cp = fmt.compare_at_price ?? null;

  if (cp !== null && cp !== undefined && cp > p && p > 0) {
    const diff = cp - p;
    const percentDown = Math.round((diff / cp) * 100);
    return {
      currentPrice: p,
      originalPrice: cp,
      discountPercentage: percentDown > 0 ? percentDown : 0,
    };
  }

  return {
    currentPrice: p,
    originalPrice: null,
    discountPercentage: 0,
  };
}

function handleQuickAdd(book: Book, event: Event): void {
  event.preventDefault();
  event.stopPropagation();

  const fmt = getBookPdfFormat(book);
  const pricing = getBookPricing(book);
  const isSynthetic = !fmt.id || fmt.id.startsWith('pdf-');
  const validFormatId = isSynthetic ? '' : fmt.id;

  addItem({
    productId: book.id,
    formatId: validFormatId,
    title: book.name,
    format: 'pdf',
    price: pricing.currentPrice,
    compare_at_price: pricing.originalPrice,
    quantity: 1,
    deliveryMethod: 'digital',
    coverUrl: book.images?.[0]?.image_url || (book as any).cover_image_url || null,
    author: book.author,
  });

  pushToast({
    message: `Added "${book.name}" (PDF eBook) to cart!`,
    variant: 'success',
  });

  openDrawer();
}
</script>

<template>
  <section
    v-if="books.length > 0"
    class="bg-theme-dark text-white py-4 px-4 sm:px-6 relative overflow-hidden select-none rounded-2xl max-w-6xl mx-auto shadow-md border border-theme-dark-border"
  >
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 sm:gap-8 relative z-10">

      <!-- CONTROLS CONTAINER -->
      <div class="w-full sm:w-72 sm:flex-shrink-0 space-y-2.5 text-left py-1">
        <div class="space-y-1">
          <span class="inline-flex items-center gap-1 text-[10px] font-mono font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-theme-accent text-white shadow-2xs">
            <Zap :size="10" />
            {{ badgeLabel }}
          </span>
          <h2 class="font-poster text-3xl sm:text-4xl font-extrabold uppercase tracking-wide leading-none text-white drop-shadow-xs">
            {{ title }}
          </h2>
        </div>

        <p class="text-xs text-white/80 leading-relaxed font-sans line-clamp-2">
          Instant Cloudflare R2 PDF eBook downloads with limited-time price drops.
        </p>

        <!-- Countdown Timer -->
        <ClientOnly>
          <div class="flex items-center gap-2 pt-0.5">
            <div class="bg-white/10 text-white rounded-lg px-2.5 py-1 border border-white/20 text-center shadow-xs min-w-[42px]">
              <span class="font-mono text-sm font-bold block">{{ hours }}H</span>
            </div>
            <span class="font-bold text-white">:</span>
            <div class="bg-white/10 text-white rounded-lg px-2.5 py-1 border border-white/20 text-center shadow-xs min-w-[42px]">
              <span class="font-mono text-sm font-bold block">{{ minutes }}M</span>
            </div>
            <span class="font-bold text-white">:</span>
            <div class="bg-white/10 text-white rounded-lg px-2.5 py-1 border border-white/20 text-center shadow-xs min-w-[42px] flex items-center justify-center gap-1">
              <Clock :size="10" class="text-theme-accent" />
              <span class="font-mono text-sm font-bold text-theme-accent block">{{ seconds }}S</span>
            </div>
          </div>
        </ClientOnly>

        <!-- Shelf Navigation -->
        <div class="hidden sm:flex items-center gap-2.5 pt-1">
          <button
            type="button"
            class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 border border-white/20"
            aria-label="Previous deal"
            @click="scrollLeft"
          >
            <ChevronLeft :size="15" />
          </button>
          <button
            type="button"
            class="w-8 h-8 rounded-full bg-theme-accent hover:bg-theme-accent-hover text-white flex items-center justify-center cursor-pointer shadow-xs active:scale-95 transition-all border border-theme-accent-border/30"
            aria-label="Next deal"
            @click="scrollRight"
          >
            <ChevronRight :size="15" />
          </button>
        </div>
      </div>

      <!-- BOOKS SHELF -->
      <div class="flex-1 min-w-0 w-full">
        <div
          ref="scrollContainer"
          class="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-1 px-1 snap-x snap-mandatory touch-pan-x"
        >
          <div
            v-for="book in books"
            :key="book.id"
            class="w-[160px] sm:w-[168px] flex-shrink-0 bg-theme-surface text-theme-ink rounded-xl p-2.5 sm:p-3 shadow-card hover:shadow-medium transition-all snap-start flex flex-col justify-between group select-none text-left border border-theme-border"
          >
            <div>
              <!-- Book Cover -->
              <NuxtLink
                :to="`/book/${book.slug}`"
                class="block relative aspect-[1/1.37] rounded-book overflow-hidden bg-theme-surface-subtle book-cover-3d mb-2 sm:mb-2.5"
              >
                <img
                  :src="book.images?.[0]?.image_url || (book as any).cover_image_url || '/images/book-placeholder.svg'"
                  :alt="book.name"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  referrerpolicy="no-referrer"
                />

                <span
                  v-if="getBookPricing(book).discountPercentage > 0"
                  class="absolute top-1.5 right-1.5 bg-theme-accent text-white font-mono font-extrabold text-[10px] px-1.5 py-0.5 rounded shadow-xs z-10"
                >
                  -{{ getBookPricing(book).discountPercentage }}%
                </span>

                <span
                  class="absolute top-1.5 left-1.5 bg-theme-dark text-theme-accent font-mono font-bold text-[10px] px-1.5 py-0.5 rounded uppercase z-10 flex items-center gap-1"
                >
                  <Zap :size="9" />
                  FLASH
                </span>
              </NuxtLink>

              <!-- Book Title -->
              <NuxtLink :to="`/book/${book.slug}`" class="block">
                <h3 class="font-display text-xs font-bold text-theme-ink group-hover:text-theme-accent transition-colors line-clamp-1 leading-snug">
                  {{ book.name }}
                </h3>
              </NuxtLink>
              <p class="text-[10px] text-theme-muted italic truncate mt-0.5">
                {{ book.author ? (book.author.startsWith('By ') ? book.author : `By ${book.author}`) : 'Original Edition' }}
              </p>

              <!-- Pure Digital Badge -->
              <div class="mt-2">
                <div class="w-full flex items-center justify-between px-2 py-1 rounded-lg text-[10px] font-sans font-bold bg-theme-accent-soft border border-theme-accent-border text-theme-accent-hover">
                  <span class="flex items-center gap-1 truncate">
                    <Download :size="11" class="text-theme-accent flex-shrink-0" />
                    <span>eBook (PDF)</span>
                  </span>
                  <span class="font-mono font-bold text-[10px] flex-shrink-0">
                    {{ formatCurrency(getBookPricing(book).currentPrice) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Bottom Bar: Price + Cart Button -->
            <div class="pt-2 mt-2 border-t border-theme-border flex items-end justify-between gap-1.5">
              <div class="min-w-0 flex flex-col justify-center">
                <span
                  v-if="getBookPricing(book).originalPrice && getBookPricing(book).originalPrice! > getBookPricing(book).currentPrice"
                  class="text-[10px] text-theme-muted line-through decoration-theme-muted decoration-1 font-mono font-bold block leading-none mb-0.5"
                >
                  {{ formatCurrency(getBookPricing(book).originalPrice!) }}
                </span>
                <span class="text-sm font-black font-mono leading-tight text-theme-ink tracking-tight">
                  {{ formatCurrency(getBookPricing(book).currentPrice) }}
                </span>
              </div>

              <button
                type="button"
                class="w-8 h-8 rounded-lg bg-theme-dark hover:bg-theme-accent active:bg-theme-accent-active text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-xs flex-shrink-0"
                title="Add eBook (PDF) to Cart"
                aria-label="Add eBook (PDF) to Cart"
                @click="handleQuickAdd(book, $event)"
              >
                <ShoppingCart :size="13" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>