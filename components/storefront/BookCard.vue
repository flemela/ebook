<!-- components/storefront/BookCard.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { Download, Zap, Flame, Star, Tag, Clock, FileText } from 'lucide-vue-next';
import { useCart } from '~/composables/useCart';
import { useToast } from '~/composables/useToast';
import type { Book, ProductFormat } from '~/types';

interface Props {
  book: Book;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  requestSeed: [title: string, author?: string];
}>();

const { addItem, openDrawer } = useCart();
const { push: pushToast } = useToast();

const imageFailed = ref(false);

const activePdfFormat = computed<ProductFormat>(() => {
  const formats = props.book?.formats || [];
  const pdf = formats.find((f) => f.format === 'pdf');
  if (pdf) return pdf;

  const epub = formats.find((f) => f.format === 'epub');
  if (epub) return epub;

  const defaultEbookPrice = props.book.price && props.book.price < 500 ? props.book.price : 149;
  return {
    id: `pdf-${props.book.id}`,
    product_id: props.book.id,
    format: 'pdf',
    price: defaultEbookPrice,
    compare_at_price: props.book.compare_at_price || null,
    file_url: null,
    file_public_id: null,
    file_size_bytes: null,
    stock: null,
    created_at: props.book.created_at || '',
    updated_at: props.book.updated_at || '',
  };
});

const pricing = computed(() => {
  const fmt = activePdfFormat.value;
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
});

const currentPrice = computed<number>(() => pricing.value.currentPrice);
const originalPrice = computed<number | null>(() => pricing.value.originalPrice);
const discountPercentage = computed<number>(() => pricing.value.discountPercentage);

const coverImage = computed<string | null>(() => {
  if (!props.book) return null;
  const rawImg: unknown = props.book.images?.[0];
  if (typeof rawImg === 'string' && rawImg.trim().length > 5) return rawImg.trim();
  if (rawImg && typeof rawImg === 'object' && 'image_url' in rawImg) {
    const url = (rawImg as { image_url?: string }).image_url;
    if (typeof url === 'string' && url.trim().length > 5) return url.trim();
  }
  const fallback = (props.book as any).cover_image_url;
  if (typeof fallback === 'string' && fallback.trim().length > 5) return fallback.trim();
  return null;
});

const displayAuthor = computed(() => {
  if (!props.book.author) return 'Original Edition';
  return props.book.author.startsWith('By ') ? props.book.author : `By ${props.book.author}`;
});

type BadgeInfo = { icon: typeof Zap; label: string } | null;

function getBadgeInfo(badgeStr?: string | null): BadgeInfo {
  if (!badgeStr) return null;
  switch (badgeStr) {
    case 'FLASH_SALE':
      return { icon: Zap, label: 'FLASH' };
    case 'BESTSELLER':
      return { icon: Flame, label: 'BESTSELLER' };
    case 'NO1_PICK':
      return { icon: Star, label: '#1 PICK' };
    case 'DEAL_OF_WEEK':
      return { icon: Tag, label: 'DEAL' };
    case 'LIMITED_TIME':
      return { icon: Clock, label: 'LIMITED' };
    default:
      return { icon: Tag, label: badgeStr.replace(/_/g, ' ') };
  }
}

const badgeInfo = computed(() => getBadgeInfo(props.book.badge));

function handleImageError(): void {
  imageFailed.value = true;
}

function formatCurrency(val: number): string {
  return `KSh ${val.toLocaleString('en-KE')}`;
}

function handleCardClick(event: Event): void {
  if (props.book.isSeed) {
    event.preventDefault();
    emit('requestSeed', props.book.name, props.book.author || undefined);
  }
}

function handleAddToCart(event: Event): void {
  event.preventDefault();
  event.stopPropagation();

  if (props.book.isSeed) {
    emit('requestSeed', props.book.name, props.book.author || undefined);
    return;
  }

  const fmt = activePdfFormat.value;
  const isSynthetic = !fmt.id || fmt.id.startsWith('pdf-');
  const validFormatId = isSynthetic ? '' : fmt.id;

  addItem({
    productId: props.book.id,
    formatId: validFormatId,
    title: props.book.name,
    format: 'pdf',
    price: currentPrice.value,
    compare_at_price: originalPrice.value,
    quantity: 1,
    deliveryMethod: 'digital',
    coverUrl: coverImage.value,
    author: props.book.author,
  });

  pushToast({
    message: `Added "${props.book.name}" (PDF eBook) to cart!`,
    variant: 'success',
  });

  openDrawer();
}
</script>

<template>
  <!-- Relative container allows the zigzag discount seal to spill out beyond the border -->
  <div class="relative w-full bg-theme-surface text-theme-ink rounded-2xl p-3.5 sm:p-4 shadow-card hover:shadow-medium border border-theme-border hover:border-theme-border-strong transition-all flex flex-col justify-between group select-none text-left">
    
    <!-- ZIGZAG CIRCULAR STARBURST DISCOUNT BADGE (Spilling over the top-right corner) -->
    <div
      v-if="discountPercentage > 0"
      class="absolute -top-3.5 -right-3.5 sm:-top-4 sm:-right-4 z-20 w-13 h-13 sm:w-15 sm:h-15 flex items-center justify-center pointer-events-none drop-shadow-md transform rotate-12 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
      aria-label="Discount badge"
    >
      <!-- 16-point Zig-Zag Starburst Medallion SVG -->
      <svg
        viewBox="0 0 100 100"
        class="absolute inset-0 w-full h-full text-theme-accent fill-current"
      >
        <path
          d="M50 0 L59 10 L73 7 L78 20 L92 23 L91 37 L100 45 L94 58 L99 71 L87 77 L85 91 L71 89 L63 100 L50 93 L37 100 L29 89 L15 91 L13 77 L1 71 L6 58 L0 45 L9 37 L8 23 L22 20 L27 7 L41 10 Z"
        />
      </svg>

      <!-- Badge Inner Text -->
      <div class="relative z-10 flex flex-col items-center justify-center text-white leading-none text-center">
        <span class="font-black font-mono text-[13px] sm:text-sm tracking-tighter">
          -{{ discountPercentage }}%
        </span>
        <span class="text-[7.5px] sm:text-[8.5px] font-mono font-extrabold uppercase tracking-widest mt-0.5">
          OFF
        </span>
      </div>
    </div>

    <div>
      <!-- Book Cover Link -->
      <NuxtLink
        :to="book.isSeed ? '#' : `/book/${book.slug}`"
        class="block relative aspect-[1/1.37] rounded-xl overflow-hidden bg-theme-surface-subtle book-cover-3d mb-3 cursor-pointer"
        @click="handleCardClick"
      >
        <div
          v-if="imageFailed || !coverImage"
          class="w-full h-full flex flex-col justify-between p-3.5 bg-theme-dark text-white text-left select-none"
        >
          <div class="space-y-1">
            <span class="text-[10px] font-mono uppercase tracking-widest text-theme-accent font-bold block truncate">
              {{ book.category_name || 'eBook' }}
            </span>
            <h4 class="font-display font-bold text-sm leading-snug line-clamp-3 text-white">
              {{ book.name }}
            </h4>
          </div>
          <span class="text-xs font-mono text-white/70 truncate block pt-1 border-t border-white/10">
            {{ book.author || 'Edition' }}
          </span>
        </div>

        <img
          v-else
          :src="coverImage"
          :alt="book.name"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          width="240"
          height="328"
          referrerpolicy="no-referrer"
          @error="handleImageError"
        />

        <!-- Top-Left Editorial/Curated Badge -->
        <span
          v-if="badgeInfo"
          class="absolute top-2.5 left-2.5 bg-theme-dark/90 backdrop-blur-xs text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-md uppercase z-10 flex items-center gap-1 shadow-xs"
        >
          <component :is="badgeInfo.icon" :size="10" class="text-theme-accent" />
          {{ badgeInfo.label }}
        </span>
      </NuxtLink>

      <!-- Meta Row: Bigger eBook (PDF) Text + Category -->
      <div class="flex items-center justify-between gap-1 text-xs sm:text-[13px] pb-1.5">
        <span class="font-bold text-theme-accent flex items-center gap-1.5">
          <FileText :size="13" class="stroke-[2.5]" />
          <span>eBook (PDF)</span>
        </span>
        <span class="text-theme-muted truncate text-[11px] sm:text-xs">
          {{ book.category_name || 'General' }}
        </span>
      </div>

      <!-- Book Title: Bigger, Bolder & Single-Line Ellipsis -->
      <NuxtLink :to="book.isSeed ? '#' : `/book/${book.slug}`" class="block" @click="handleCardClick">
        <h3
          class="font-display font-extrabold text-base sm:text-lg lg:text-xl text-theme-ink group-hover:text-theme-accent transition-colors truncate block leading-tight tracking-tight"
          :title="book.name"
        >
          {{ book.name }}
        </h3>
      </NuxtLink>

      <!-- Author: Legible Size -->
      <p class="text-xs sm:text-[13px] text-theme-muted italic truncate mt-0.5">
        {{ displayAuthor }}
      </p>

      <!-- Rating Line -->
      <div class="flex items-center gap-1.5 pt-1.5 text-xs">
        <span class="text-amber-500 font-bold tracking-tight">★★★★★</span>
        <span class="text-theme-ink font-mono font-bold text-xs">4.9</span>
      </div>
    </div>

    <!-- Bottom Pricing & Bigger Bolder Download Button -->
    <div class="pt-3 mt-3 border-t border-theme-border space-y-2.5">
      <div class="flex items-baseline justify-between">
        <div class="flex items-baseline gap-2">
          <!-- Large Price -->
          <span class="text-xl sm:text-2xl font-black font-mono text-theme-ink tabular-figure tracking-tight">
            {{ formatCurrency(currentPrice) }}
          </span>
          <!-- Strikethrough Price -->
          <span
            v-if="originalPrice && originalPrice > currentPrice"
            class="text-xs sm:text-sm text-theme-muted line-through font-mono"
          >
            {{ formatCurrency(originalPrice) }}
          </span>
        </div>
        <span class="text-[10px] sm:text-xs font-mono text-emerald-600 font-bold">
          Instant
        </span>
      </div>

      <!-- Full-Width High-Impact Download Action Button -->
      <button
        type="button"
        class="w-full bg-theme-accent hover:bg-theme-accent-hover active:bg-theme-accent-active text-white text-xs sm:text-sm font-black uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        :title="book.isSeed ? 'Request eBook' : 'Download eBook (PDF)'"
        :aria-label="book.isSeed ? 'Request eBook' : 'Download eBook (PDF)'"
        @click="handleAddToCart"
      >
        <Download :size="17" class="stroke-[2.5]" />
        <span>Download</span>
      </button>
    </div>
  </div>
</template>