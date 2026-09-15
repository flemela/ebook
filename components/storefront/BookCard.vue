<!-- components/storefront/BookCard.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { ShoppingCart, Zap, Flame, Star, Tag, Clock, Download } from 'lucide-vue-next';
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

// Strict PDF-First Format Resolver (Eradicating Synthetic Hardcopy)
const activePdfFormat = computed<ProductFormat>(() => {
  const formats = props.book?.formats || [];
  const pdf = formats.find((f) => f.format === 'pdf');
  if (pdf) return pdf;

  const epub = formats.find((f) => f.format === 'epub');
  if (epub) return epub;

  // Fallback eBook format if catalog record lacks explicit formats array
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

const coverImage = computed(() => {
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
  <div class="w-full max-w-none sm:max-w-[176px] bg-theme-surface text-theme-ink rounded-xl p-2.5 sm:p-3 shadow-card hover:shadow-medium transition-all flex flex-col justify-between group select-none text-left border border-theme-border hover:border-theme-border-strong">
    <div>
      <!-- Book Cover -->
      <NuxtLink
        :to="book.isSeed ? '#' : `/book/${book.slug}`"
        class="block relative aspect-[1/1.37] rounded-book overflow-hidden bg-theme-surface-subtle book-cover-3d mb-2 sm:mb-2.5 cursor-pointer"
        @click="handleCardClick"
      >
        <div
          v-if="imageFailed || !coverImage"
          class="w-full h-full flex flex-col justify-between p-2 bg-theme-dark text-white text-left select-none"
        >
          <div class="space-y-0.5">
            <span class="text-[10px] font-mono uppercase tracking-widest text-theme-accent font-bold block truncate">
              {{ book.category_name || 'eBook' }}
            </span>
            <h4 class="font-display font-bold text-xs leading-tight line-clamp-3 text-white">
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
          width="144"
          height="188"
          referrerpolicy="no-referrer"
          @error="handleImageError"
        />

        <span
          v-if="discountPercentage > 0"
          class="absolute top-1.5 right-1.5 bg-theme-accent text-white font-mono font-extrabold text-[10px] px-1.5 py-0.5 rounded shadow-xs z-10"
        >
          -{{ discountPercentage }}%
        </span>

        <span
          v-if="badgeInfo"
          class="absolute top-1.5 left-1.5 bg-theme-dark text-theme-accent font-mono font-bold text-[10px] px-1.5 py-0.5 rounded uppercase z-10 flex items-center gap-1"
        >
          <component :is="badgeInfo.icon" :size="10" />
          {{ badgeInfo.label }}
        </span>
      </NuxtLink>

      <!-- Book Title -->
      <NuxtLink :to="book.isSeed ? '#' : `/book/${book.slug}`" class="block" @click="handleCardClick">
        <h3 class="font-display text-xs font-bold text-theme-ink group-hover:text-theme-accent transition-colors line-clamp-1 leading-snug">
          {{ book.name }}
        </h3>
      </NuxtLink>

      <!-- Author -->
      <p class="text-[10px] text-theme-muted italic truncate mt-0.5">
        {{ displayAuthor }}
      </p>

      <!-- Pure Digital Format Badge -->
      <div class="mt-2.5">
        <div class="w-full flex items-center justify-between px-2 py-1 rounded-lg text-[10px] font-sans font-bold bg-theme-accent-soft border border-theme-accent-border text-theme-accent-hover">
          <span class="flex items-center gap-1 truncate">
            <Download :size="11" class="text-theme-accent flex-shrink-0" />
            <span>eBook (PDF)</span>
          </span>
          <span class="font-mono font-bold text-[10px] flex-shrink-0">
            {{ formatCurrency(currentPrice) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Bottom Bar: Price + Cart Button -->
    <div class="pt-2 mt-2.5 border-t border-theme-border flex items-end justify-between gap-1.5">
      <div class="min-w-0 flex flex-col justify-center">
        <span
          v-if="originalPrice && originalPrice > currentPrice"
          class="text-[10px] text-theme-muted line-through decoration-theme-muted decoration-1 font-mono font-bold block leading-none mb-0.5"
        >
          {{ formatCurrency(originalPrice) }}
        </span>
        <span class="text-sm font-black font-mono leading-tight text-theme-ink tracking-tight">
          {{ formatCurrency(currentPrice) }}
        </span>
      </div>

      <button
        type="button"
        class="w-8 h-8 rounded-lg bg-theme-dark hover:bg-theme-accent active:bg-theme-accent-active text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm hover:shadow flex-shrink-0"
        :title="book.isSeed ? 'Request eBook' : 'Add eBook (PDF) to Cart'"
        :aria-label="book.isSeed ? 'Request eBook' : 'Add eBook (PDF) to Cart'"
        @click="handleAddToCart"
      >
        <ShoppingCart :size="14" class="transition-transform group-hover:scale-105" />
      </button>
    </div>
  </div>
</template>