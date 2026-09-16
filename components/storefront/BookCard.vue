<!-- components/storefront/BookCard.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { Download, Zap, Flame, Star, Tag, Clock, FileText, CheckCircle2 } from 'lucide-vue-next';
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

// Strict PDF format resolver
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
  <div class="w-full bg-theme-surface text-theme-ink rounded-2xl p-4 sm:p-5 shadow-card hover:shadow-medium border border-theme-border hover:border-theme-border-strong transition-all flex flex-col justify-between group select-none text-left">
    <div>
      <!-- Book Cover Link -->
      <NuxtLink
        :to="book.isSeed ? '#' : `/book/${book.slug}`"
        class="block relative aspect-[1/1.37] rounded-xl overflow-hidden bg-theme-surface-subtle book-cover-3d mb-3 sm:mb-4 cursor-pointer"
        @click="handleCardClick"
      >
        <div
          v-if="imageFailed || !coverImage"
          class="w-full h-full flex flex-col justify-between p-4 bg-theme-dark text-white text-left select-none"
        >
          <div class="space-y-1">
            <span class="text-[11px] font-mono uppercase tracking-widest text-theme-accent font-bold block truncate">
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
          width="280"
          height="384"
          referrerpolicy="no-referrer"
          @error="handleImageError"
        />

        <!-- Urgency Savings Badge -->
        <span
          v-if="discountPercentage > 0"
          class="absolute top-2.5 right-2.5 bg-theme-accent text-white font-mono font-extrabold text-[11px] px-2 py-0.5 rounded-md shadow-sm z-10"
        >
          -{{ discountPercentage }}% OFF
        </span>

        <!-- Social Proof Editorial Badge -->
        <span
          v-if="badgeInfo"
          class="absolute top-2.5 left-2.5 bg-theme-dark/90 backdrop-blur-xs text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-md uppercase z-10 flex items-center gap-1.5 shadow-sm"
        >
          <component :is="badgeInfo.icon" :size="11" class="text-theme-accent" />
          {{ badgeInfo.label }}
        </span>
      </NuxtLink>

      <!-- Meta Line: Simple Format Text + Category -->
      <div class="flex items-center justify-between gap-2 text-[11px] font-sans pb-1.5">
        <span class="font-bold text-theme-accent flex items-center gap-1">
          <FileText :size="12" />
          <span>eBook (PDF)</span>
        </span>
        <span class="font-medium text-theme-muted truncate">
          {{ book.category_name || 'General' }}
        </span>
      </div>

      <!-- Book Title: Bold, Large & Truncated Cleanly to One Line -->
      <NuxtLink :to="book.isSeed ? '#' : `/book/${book.slug}`" class="block" @click="handleCardClick">
        <h3
          class="font-display font-bold text-base sm:text-lg text-theme-ink group-hover:text-theme-accent transition-colors truncate block leading-snug"
          :title="book.name"
        >
          {{ book.name }}
        </h3>
      </NuxtLink>

      <!-- Author -->
      <p class="text-xs text-theme-muted italic truncate mt-0.5">
        {{ displayAuthor }}
      </p>

      <!-- Buyer's Psychology Rating & Instant Access Indicator -->
      <div class="flex items-center gap-2 pt-2 text-[11px]">
        <div class="flex items-center text-amber-500 font-bold gap-0.5">
          <span>★★★★★</span>
          <span class="text-theme-ink font-mono ml-1">4.9</span>
        </div>
        <span class="text-theme-muted">•</span>
        <span class="text-theme-muted flex items-center gap-1">
          <CheckCircle2 :size="11" class="text-emerald-600" /> Instant Access
        </span>
      </div>
    </div>

    <!-- Bottom Bar: Pricing & Full-Width Download Action Button -->
    <div class="pt-3.5 mt-3.5 border-t border-theme-border space-y-2.5">
      <!-- Price Anchoring -->
      <div class="flex items-baseline justify-between">
        <div class="flex items-baseline gap-2">
          <span class="text-lg sm:text-xl font-extrabold font-mono text-theme-ink tabular-figure">
            {{ formatCurrency(currentPrice) }}
          </span>
          <span
            v-if="originalPrice && originalPrice > currentPrice"
            class="text-xs text-theme-muted line-through font-mono"
          >
            {{ formatCurrency(originalPrice) }}
          </span>
        </div>
        <span class="text-[10px] font-mono text-theme-muted uppercase">
          Cloudflare R2
        </span>
      </div>

      <!-- High-Impact Full-Width Download Action Button -->
      <button
        type="button"
        class="w-full bg-theme-accent hover:bg-theme-accent-hover active:bg-theme-accent-active text-white text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        :title="book.isSeed ? 'Request eBook' : 'Download eBook (PDF)'"
        :aria-label="book.isSeed ? 'Request eBook' : 'Download eBook (PDF)'"
        @click="handleAddToCart"
      >
        <Download :size="15" />
        <span>Download eBook</span>
      </button>
    </div>
  </div>
</template>