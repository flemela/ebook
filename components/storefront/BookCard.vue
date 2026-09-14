<!-- components/storefront/BookCard.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Star, ShoppingCart } from 'lucide-vue-next';
import { useCart } from '~/composables/useCart';
import { useToast } from '~/composables/useToast';
import type { Book, ProductFormat, BookFormatType } from '~/types';

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
const selectedFormatId = ref<string>('');

// 1. Filter available digital formats
const availableDigitalFormats = computed<ProductFormat[]>(() => {
  if (!props.book?.formats || props.book.formats.length === 0) return [];

  return props.book.formats.filter((f) => {
    const isDigital = f.format === 'pdf' || f.format === 'epub';
    if (!isDigital) return false;
    if (props.book.isSeed) return true;

    return Boolean(
      (f.file_url && f.file_url.trim().length > 0) ||
      (f.file_public_id && f.file_public_id.trim().length > 0)
    );
  });
});

const hasDigitalCopy = computed(() => availableDigitalFormats.value.length > 0);

// 2. Guaranteed Hardcopy Format
const hardcopyFormat = computed<ProductFormat | null>(() => {
  const existing = props.book?.formats?.find((f) => f.format === 'hardcopy');
  if (existing) return existing;

  if (hasDigitalCopy.value || props.book.price) {
    return {
      id: `synthetic-hardcopy-${props.book.id}`,
      product_id: props.book.id,
      format: 'hardcopy' as BookFormatType,
      price: props.book.price || 699,
      compare_at_price: props.book.compare_at_price || null,
      file_url: null,
      file_public_id: null,
      file_size_bytes: null,
      stock: props.book.stock ?? 10,
      created_at: props.book.created_at || '',
      updated_at: props.book.updated_at || '',
    };
  }

  return null;
});

// 3. Combined Formats (Ordered: eBooks first, then Hardcopy)
const availableFormats = computed<ProductFormat[]>(() => {
  const list: ProductFormat[] = [];
  list.push(...availableDigitalFormats.value);
  if (hardcopyFormat.value) {
    list.push(hardcopyFormat.value);
  }
  return list;
});

watch(
  availableFormats,
  (fmts) => {
    imageFailed.value = false;
    if (fmts && fmts.length > 0) {
      if (!fmts.some((f) => f.id === selectedFormatId.value)) {
        selectedFormatId.value = fmts[0].id;
      }
    } else {
      selectedFormatId.value = '';
    }
  },
  { immediate: true }
);

const activeFormat = computed<ProductFormat | undefined>(() => {
  if (!availableFormats.value.length) return undefined;
  return availableFormats.value.find((f) => f.id === selectedFormatId.value) || availableFormats.value[0];
});

// Pricing calculations
const pricing = computed(() => {
  const pBook = props.book.price ?? 0;
  const cpBook = props.book.compare_at_price ?? null;
  const hasParentSale = Boolean(cpBook && cpBook > pBook && pBook > 0);
  const parentDiscountRatio = hasParentSale && cpBook ? (cpBook - pBook) / cpBook : 0;

  const fmt = activeFormat.value;
  let p = fmt ? fmt.price : pBook;
  let cp: number | null = null;

  if (fmt) {
    if (fmt.compare_at_price && fmt.compare_at_price > fmt.price) {
      cp = fmt.compare_at_price;
    } else if (fmt.format === 'hardcopy') {
      cp = cpBook;
    } else if (hasParentSale && parentDiscountRatio > 0 && parentDiscountRatio < 1) {
      cp = Math.round(fmt.price / (1 - parentDiscountRatio));
    }
  } else {
    cp = cpBook;
  }

  if (cp !== null && cp !== undefined && cp > 0 && p > 0 && cp !== p) {
    const minP = Math.min(p, cp);
    const maxP = Math.max(p, cp);
    const diff = maxP - minP;
    const percentDown = Math.round((diff / maxP) * 100);

    return {
      currentPrice: minP,
      originalPrice: maxP,
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
  return props.book.author.replace(/^By\s+/i, '');
});

const displayRating = computed(() => {
  return props.book.rating ? props.book.rating.toFixed(1) : '4.8';
});

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

  const fmt = activeFormat.value;
  const isPhysical = fmt?.format === 'hardcopy';
  const formatType: BookFormatType = fmt ? fmt.format : 'pdf';

  const isSynthetic = !fmt || fmt.id.startsWith('synthetic-');
  const validFormatId = isSynthetic ? '' : fmt.id;

  addItem({
    productId: props.book.id,
    formatId: validFormatId,
    title: props.book.name,
    format: formatType,
    price: currentPrice.value,
    compare_at_price: originalPrice.value,
    quantity: 1,
    deliveryMethod: isPhysical ? 'delivery' : 'digital',
    coverUrl: coverImage.value,
    author: props.book.author,
  });

  pushToast({
    message: `Added "${props.book.name}" to cart!`,
    variant: 'success',
  });

  openDrawer();
}
</script>

<template>
  <div class="w-full bg-theme-surface text-theme-ink rounded-xl p-3 sm:p-4 border border-theme-border hover:border-theme-border-strong hover:shadow-card transition-all flex flex-col justify-between group select-none text-left">
    
    <div>
      <!-- Book Cover -->
      <NuxtLink
        :to="book.isSeed ? '#' : `/book/${book.slug}`"
        class="block relative aspect-[1/1.42] rounded-md overflow-hidden bg-theme-surface-subtle book-cover-3d mb-3 cursor-pointer"
        @click="handleCardClick"
      >
        <div
          v-if="imageFailed || !coverImage"
          class="w-full h-full flex flex-col justify-between p-3 bg-theme-dark text-white text-left select-none"
        >
          <div class="space-y-1">
            <span class="text-[9px] font-mono uppercase tracking-widest text-theme-accent font-bold block truncate">
              {{ book.category_name || 'Ebook' }}
            </span>
            <h4 class="font-sans font-bold text-xs leading-tight line-clamp-3 text-white">
              {{ book.name }}
            </h4>
          </div>
          <span class="text-[9px] font-mono text-theme-dark-muted truncate block pt-1 border-t border-white/10">
            {{ displayAuthor }}
          </span>
        </div>

        <img
          v-else
          :src="coverImage"
          :alt="book.name"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          referrerpolicy="no-referrer"
          @error="imageFailed = true"
        />

        <!-- Discount Badge -->
        <span
          v-if="discountPercentage > 0"
          class="absolute top-2 right-2 bg-theme-accent text-white font-mono font-black text-[9px] px-1.5 py-0.5 rounded shadow-xs z-10"
        >
          -{{ discountPercentage }}%
        </span>
      </NuxtLink>

      <!-- Book Title -->
      <NuxtLink :to="book.isSeed ? '#' : `/book/${book.slug}`" class="block" @click="handleCardClick">
        <h3 class="font-sans text-xs sm:text-sm font-bold text-theme-ink group-hover:text-theme-accent transition-colors line-clamp-1 leading-snug">
          {{ book.name }}
        </h3>
      </NuxtLink>

      <!-- Author -->
      <p class="text-[11px] text-theme-ink-muted truncate mt-0.5">
        {{ displayAuthor }}
      </p>

      <!-- Star Ratings matching Reference Visual -->
      <div class="flex items-center gap-1 text-theme-accent mt-1.5">
        <div class="flex items-center">
          <Star v-for="i in 5" :key="i" :size="11" class="fill-current text-theme-accent" />
        </div>
        <span class="text-[10px] font-bold text-theme-ink-muted ml-0.5">
          ({{ displayRating }})
        </span>
      </div>

      <!-- Multiple Format Switch (Compact & Clean) -->
      <div v-if="availableFormats.length > 1" class="flex gap-1.5 mt-2">
        <button
          v-for="fmt in availableFormats"
          :key="fmt.id"
          type="button"
          class="px-2 py-0.5 text-[9.5px] font-mono font-bold rounded border transition-colors cursor-pointer"
          :class="activeFormat?.id === fmt.id ? 'bg-theme-accent-soft border-theme-accent text-theme-accent' : 'bg-white border-theme-border text-theme-ink-muted hover:border-theme-ink-subtle'"
          @click.stop="selectedFormatId = fmt.id"
        >
          {{ fmt.format.toUpperCase() }}
        </button>
      </div>
    </div>

    <!-- Bottom Pricing & Red 'Add to Cart' Button -->
    <div class="pt-3 mt-3 border-t border-theme-border space-y-2.5">
      <!-- Price Row -->
      <div class="flex items-baseline gap-2">
        <span class="text-sm sm:text-base font-black font-mono leading-none text-theme-ink tracking-tight">
          {{ formatCurrency(currentPrice) }}
        </span>
        <span
          v-if="originalPrice && originalPrice > currentPrice"
          class="text-xs text-theme-ink-subtle line-through font-mono font-semibold"
        >
          {{ formatCurrency(originalPrice) }}
        </span>
      </div>

      <!-- Prominent Full-Width Brand Red Button matching Visual Guide -->
      <button
        type="button"
        class="w-full bg-theme-accent hover:bg-theme-accent-hover active:bg-theme-accent-active text-white text-xs font-bold uppercase tracking-wider py-2.5 px-3 rounded-lg shadow-xs hover:shadow transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
        :title="book.isSeed ? 'Request Book' : 'Add to Cart'"
        @click="handleAddToCart"
      >
        <ShoppingCart :size="13" />
        <span>Add to Cart</span>
      </button>
    </div>

  </div>
</template>