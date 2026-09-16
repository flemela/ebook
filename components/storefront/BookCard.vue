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
  <div class="w-full bg-theme-surface text-theme-ink rounded-xl p-3 sm:p-3.5 shadow-card hover:shadow-medium border border-theme-border hover:border-theme-border-strong transition-all flex flex-col justify-between group select-none text-left">
    <div>
      <!-- Book Cover Link -->
      <NuxtLink
        :to="book.isSeed ? '#' : `/book/${book.slug}`"
        class="block relative aspect-[1/1.37] rounded-lg overflow-hidden bg-theme-surface-subtle book-cover-3d mb-2.5 cursor-pointer"
        @click="handleCardClick"
      >
        <div
          v-if="imageFailed || !coverImage"
          class="w-full h-full flex flex-col justify-between p-3 bg-theme-dark text-white text-left select-none"
        >
          <div class="space-y-0.5">
            <span class="text-[9px] font-mono uppercase tracking-widest text-theme-accent font-bold block truncate">
              {{ book.category_name || 'eBook' }}
            </span>
            <h4 class="font-display font-bold text-xs leading-snug line-clamp-3 text-white">
              {{ book.name }}
            </h4>
          </div>
          <span class="text-[10px] font-mono text-white/70 truncate block pt-0.5 border-t border-white/10">
            {{ book.author || 'Edition' }}
          </span>
        </div>

        <img
          v-else
          :src="coverImage"
          :alt="book.name"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          width="200"
          height="274"
          referrerpolicy="no-referrer"
          @error="handleImageError"
        />

        <span
          v-if="discountPercentage > 0"
          class="absolute top-2 right-2 bg-theme-accent text-white font-mono font-extrabold text-[10px] px-1.5 py-0.5 rounded shadow-xs z-10"
        >
          -{{ discountPercentage }}%
        </span>

        <span
          v-if="badgeInfo"
          class="absolute top-2 left-2 bg-theme-dark/90 backdrop-blur-xs text-white font-mono font-bold text-[9px] px-1.5 py-0.5 rounded uppercase z-10 flex items-center gap-1 shadow-xs"
        >
          <component :is="badgeInfo.icon" :size="9" class="text-theme-accent" />
          {{ badgeInfo.label }}
        </span>
      </NuxtLink>

      <!-- Format line: simple text, no pill box -->
      <div class="flex items-center justify-between gap-1 text-[11px] pb-1">
        <span class="font-bold text-theme-accent flex items-center gap-1">
          <FileText :size="11" />
          <span>eBook (PDF)</span>
        </span>
        <span class="text-theme-muted truncate text-[10px]">
          {{ book.category_name || 'General' }}
        </span>
      </div>

      <!-- Book Title: Bold, Large & Strictly Single-Line -->
      <NuxtLink :to="book.isSeed ? '#' : `/book/${book.slug}`" class="block" @click="handleCardClick">
        <h3
          class="font-display font-bold text-sm sm:text-base text-theme-ink group-hover:text-theme-accent transition-colors truncate block leading-snug"
          :title="book.name"
        >
          {{ book.name }}
        </h3>
      </NuxtLink>

      <!-- Author -->
      <p class="text-[11px] text-theme-muted italic truncate mt-0.5">
        {{ displayAuthor }}
      </p>

      <!-- Rating Line -->
      <div class="flex items-center gap-1.5 pt-1 text-[10px]">
        <span class="text-amber-500 font-bold">★★★★★</span>
        <span class="text-theme-muted font-mono">4.9</span>
      </div>
    </div>

    <!-- Bottom Pricing & Bigger, Bolder Full-Width Download Button -->
    <div class="pt-2.5 mt-2.5 border-t border-theme-border space-y-2">
      <div class="flex items-baseline justify-between">
        <div class="flex items-baseline gap-1.5">
          <span class="text-base sm:text-lg font-extrabold font-mono text-theme-ink tabular-figure">
            {{ formatCurrency(currentPrice) }}
          </span>
          <span
            v-if="originalPrice && originalPrice > currentPrice"
            class="text-[11px] text-theme-muted line-through font-mono"
          >
            {{ formatCurrency(originalPrice) }}
          </span>
        </div>
        <span class="text-[9px] font-mono text-emerald-600 font-bold">
          Instant
        </span>
      </div>

      <!-- Bigger, Bolder Download Button -->
      <button
        type="button"
        class="w-full bg-theme-accent hover:bg-theme-accent-hover active:bg-theme-accent-active text-white text-xs sm:text-[13px] font-extrabold uppercase tracking-wider py-3 sm:py-3.5 px-3 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        :title="book.isSeed ? 'Request eBook' : 'Download eBook (PDF)'"
        :aria-label="book.isSeed ? 'Request eBook' : 'Download eBook (PDF)'"
        @click="handleAddToCart"
      >
        <Download :size="16" class="stroke-[2.5]" />
        <span>Download</span>
      </button>
    </div>
  </div>
</template>