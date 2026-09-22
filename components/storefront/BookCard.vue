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

const buttonAriaLabel = computed(() => {
  return props.book.isSeed ? 'Request eBook' : 'Download eBook (PDF)';
});

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
	<!-- Form-fitting Card with snug padding -->
	<div
		class="relative w-full h-full bg-theme-surface text-theme-ink rounded-2xl p-2.5 sm:p-3 shadow-card hover:shadow-xl hover:-translate-y-1 hover:border-theme-accent/60 transition-all duration-200 flex flex-col justify-between group select-none text-left border border-theme-border">
		<div class="flex flex-col flex-1">

			<!-- Streamlined Stage Alcove framing the 3D book cover snugly -->
			<div
				class="ebookreads-book-stage relative mb-2 w-full aspect-[1/1.18] max-h-[210px] rounded-xl flex items-center justify-center p-2">

				<!-- Multi-Planar 3D Physical Book Assembly (Size preserved at max-width: 128px) -->
				<NuxtLink :to="book.isSeed ? '#' : `/book/${book.slug}`"
					class="ebookreads-3d-book-assembly block cursor-pointer"
					:aria-label="`View details for ${book.name}`" @click="handleCardClick">
					<!-- 1. Directional Perspective Ground Shadow -->
					<div class="ebookreads-3d-cast-shadow" aria-hidden="true" />

					<!-- 2. Back Cover Board (translateZ(-7.5px)) -->
					<div class="ebookreads-3d-back-board" aria-hidden="true" />

					<!-- 3. Fore-Edge Page Block (Tucked between -7px and +7px) -->
					<div class="ebookreads-3d-pages-side" aria-hidden="true" />

					<!-- 4. Front Cover Board (translateZ(7.5px)) -->
					<div class="ebookreads-3d-front bg-theme-surface-subtle">
						<!-- Missing Cover Fallback -->
						<div v-if="imageFailed || !coverImage"
							class="w-full h-full flex flex-col justify-between p-2.5 bg-gradient-to-br from-theme-dark to-theme-dark-surface text-white text-left select-none">
							<div class="space-y-0.5">
								<span
									class="text-[9.5px] font-mono uppercase tracking-widest text-theme-accent font-bold block truncate">
									{{ book.category_name || 'eBook' }}
								</span>
								<h4
									class="font-display font-bold text-xs sm:text-sm leading-tight line-clamp-3 text-white">
									{{ book.name }}
								</h4>
							</div>
							<span
								class="text-[9.5px] font-mono text-white/70 truncate block pt-1 border-t border-white/10">
								{{ book.author || 'Edition' }}
							</span>
						</div>

						<!-- Cover Jacket Image -->
						<img v-else :src="coverImage" :alt="`Cover for ${book.name}`" class="w-full h-full object-cover"
							loading="lazy" width="128" height="186" referrerpolicy="no-referrer"
							@error="handleImageError" />

						<!-- Spine Roll & Debossed Joint Hinge Crease -->
						<div class="ebookreads-3d-spine-crease" aria-hidden="true" />

						<!-- Laminate Sheen Reflection -->
						<div class="ebookreads-3d-sheen" aria-hidden="true" />
					</div>

					<!-- Identity Badge (Top Left of Front Cover) -->
					<span v-if="badgeInfo"
						class="absolute top-1.5 left-2 bg-theme-dark/95 text-white font-mono font-bold text-[9px] px-1.5 py-0.5 rounded uppercase z-20 flex items-center gap-1 shadow-xs border border-white/15 pointer-events-none">
						<component :is="badgeInfo.icon" :size="9" class="text-theme-accent" />
						{{ badgeInfo.label }}
					</span>
				</NuxtLink>

				<!-- Upright Starburst Discount Badge (Anchored cleanly to Stage Top-Right) -->
				<div v-if="discountPercentage > 0"
					class="absolute top-2 right-2 z-20 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center pointer-events-none drop-shadow-[0_3px_8px_rgba(229,9,20,0.40)]"
					aria-label="Discount badge">
					<svg viewBox="0 0 100 100" class="w-full h-full text-theme-accent fill-current">
						<polygon
							points="98,50 89.2,57.8 94.3,68.4 83.3,72.2 83.9,83.9 72.2,83.3 68.4,94.3 57.8,89.2 50,98 42.2,89.2 31.6,94.3 27.8,83.3 16.1,83.9 16.7,72.2 5.7,68.4 10.8,57.8 2,50 10.8,42.2 5.7,31.6 16.7,27.8 16.1,16.1 27.8,16.7 31.6,5.7 42.2,10.8 50,2 57.8,10.8 68.4,5.7 72.2,16.7 83.9,16.1 83.3,27.8 94.3,31.6 89.2,42.2" />
					</svg>
					<span
						class="absolute inset-0 flex items-center justify-center font-black font-mono text-[11px] sm:text-[12px] text-white tracking-tighter drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
						-{{ discountPercentage }}%
					</span>
				</div>
			</div>

			<!-- Format Line: Minimal Modern Publisher Tag -->
			<div class="flex items-center justify-between gap-1 text-xs sm:text-[13px] pb-1">
				<span class="font-bold text-theme-accent flex items-center gap-1.5">
					<FileText :size="13" class="stroke-[2.5]" />
					<span>eBook (PDF)</span>
				</span>
				<span class="text-theme-muted truncate text-[11px] sm:text-xs">
					{{ book.category_name || 'General' }}
				</span>
			</div>

			<!-- Book Title -->
			<NuxtLink :to="book.isSeed ? '#' : `/book/${book.slug}`" class="block" @click="handleCardClick">
				<h3 class="font-display font-extrabold text-sm sm:text-base md:text-lg text-theme-ink group-hover:text-theme-accent transition-colors truncate block leading-tight tracking-tight"
					:title="book.name">
					{{ book.name }}
				</h3>
			</NuxtLink>

			<!-- Author -->
			<p class="text-xs sm:text-[13px] text-theme-muted italic truncate mt-0.5">
				{{ displayAuthor }}
			</p>

			<!-- Rating Line -->
			<div class="flex items-center gap-1.5 pt-1 text-xs select-none">
				<span class="text-amber-500 font-bold tracking-tight">★★★★★</span>
				<span class="text-theme-ink font-mono font-bold text-xs">4.9</span>
			</div>
		</div>

		<!-- Bottom Pricing & Download Action Button -->
		<div class="pt-2 mt-2 border-t border-theme-border space-y-2">
			<!-- Price Row -->
			<div class="flex items-baseline gap-2">
				<span
					class="text-base sm:text-lg font-extrabold font-mono text-theme-ink tabular-figure tracking-tight">
					{{ formatCurrency(currentPrice) }}
				</span>
				<span v-if="originalPrice && originalPrice > currentPrice"
					class="text-xs sm:text-sm font-semibold font-mono text-theme-accent line-through decoration-theme-accent">
					{{ formatCurrency(originalPrice) }}
				</span>
			</div>

			<!-- Full-Width Download Action Button -->
			<button type="button"
				class="w-full bg-theme-accent hover:bg-theme-accent-hover active:bg-theme-accent-active text-white text-xs sm:text-sm font-black uppercase tracking-wider py-2.5 sm:py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-theme-accent"
				:title="buttonAriaLabel" :aria-label="buttonAriaLabel" @click="handleAddToCart">
				<Download :size="16" class="stroke-[2.5]" />
				<span>{{ book.isSeed ? 'Request eBook' : 'Download' }}</span>
			</button>
		</div>
	</div>
</template>