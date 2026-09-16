<!-- components/storefront/DealsWeek.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import BookCard from '~/components/storefront/BookCard.vue';
import { MONTHLY_TOP_SEEDS, DEALS_SEEDS, mergeWithSeeds } from '~/data/seeds';
import type { Book } from '~/types';

interface Props {
  books: Book[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  requestSeed: [title: string, author?: string];
}>();

const carouselRef = ref<HTMLElement | null>(null);

const bestsellerBooks = computed(() => {
  const combined = [...MONTHLY_TOP_SEEDS, ...DEALS_SEEDS];
  return mergeWithSeeds(props.books, combined, 6);
});

const days = ref('04');
const hours = ref('18');
const minutes = ref('40');
const seconds = ref('23');
let timerInterval: ReturnType<typeof setInterval> | undefined;

function updateCountdown(): void {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilSunday = (7 - dayOfWeek) % 7 || 7;
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 23, 59, 59);

  const diff = Math.max(0, target.getTime() - now.getTime());
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / 1000 / 60) % 60);
  const s = Math.floor((diff / 1000) % 60);

  days.value = String(d).padStart(2, '0');
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
  carouselRef.value?.scrollBy({ left: -320, behavior: 'smooth' });
}

function scrollRight(): void {
  carouselRef.value?.scrollBy({ left: 320, behavior: 'smooth' });
}
</script>

<template>
  <section id="bestsellers-week" class="bg-theme-surface-subtle py-14 px-4 relative overflow-hidden select-none">
    <svg class="absolute -left-20 -bottom-20 w-96 h-96 text-theme-border/60 pointer-events-none" viewBox="0 0 200 200" fill="none">
      <circle cx="100" cy="100" r="40" stroke="currentColor" stroke-width="0.75" />
      <circle cx="100" cy="100" r="70" stroke="currentColor" stroke-width="0.75" />
      <circle cx="100" cy="100" r="100" stroke="currentColor" stroke-width="0.75" />
    </svg>

    <div class="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 relative z-10">
      <!-- Left: Countdown & Controls -->
      <div class="w-full lg:w-80 lg:flex-shrink-0 space-y-4 text-left">
        <div class="space-y-1">
          <span class="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-widest text-theme-accent block">
            TOP READER PICKS
          </span>
          <h2 class="font-poster text-3xl sm:text-4xl font-extrabold text-theme-ink uppercase tracking-wide leading-none">
            BESTSELLERS OF THE WEEK
          </h2>
        </div>

        <p class="text-xs text-theme-muted leading-relaxed">
          The most requested eBook titles, life-changing philosophy, and business essentials dominating reader lists this week.
        </p>

        <!-- Countdown Timer Boxes -->
        <ClientOnly>
          <div class="flex items-center gap-2 pt-1">
            <div class="bg-theme-surface rounded-lg px-2.5 py-1.5 border border-theme-border text-center shadow-xs min-w-[42px]">
              <span class="font-mono text-sm font-bold text-theme-ink block">{{ days }}D</span>
            </div>
            <span class="font-bold text-theme-ink">:</span>
            <div class="bg-theme-surface rounded-lg px-2.5 py-1.5 border border-theme-border text-center shadow-xs min-w-[42px]">
              <span class="font-mono text-sm font-bold text-theme-ink block">{{ hours }}H</span>
            </div>
            <span class="font-bold text-theme-ink">:</span>
            <div class="bg-theme-surface rounded-lg px-2.5 py-1.5 border border-theme-border text-center shadow-xs min-w-[42px]">
              <span class="font-mono text-sm font-bold text-theme-ink block">{{ minutes }}M</span>
            </div>
            <span class="font-bold text-theme-ink">:</span>
            <div class="bg-theme-surface rounded-lg px-2.5 py-1.5 border border-theme-border text-center shadow-xs min-w-[42px]">
              <span class="font-mono text-sm font-bold text-theme-accent block">{{ seconds }}S</span>
            </div>
          </div>
        </ClientOnly>

        <!-- Carousel Navigation Controls -->
        <div class="hidden lg:flex items-center gap-2.5 pt-2">
          <button
            type="button"
            class="w-9 h-9 rounded-full bg-theme-surface border border-theme-border flex items-center justify-center text-theme-ink hover:bg-theme-surface-muted cursor-pointer shadow-xs active:scale-95 transition-all"
            aria-label="Previous bestsellers"
            @click="scrollLeft"
          >
            <ChevronLeft :size="16" />
          </button>
          <button
            type="button"
            class="w-9 h-9 rounded-full bg-theme-accent text-white flex items-center justify-center hover:bg-theme-accent-hover active:bg-theme-accent-active cursor-pointer shadow-xs active:scale-95 transition-all"
            aria-label="Next bestsellers"
            @click="scrollRight"
          >
            <ChevronRight :size="16" />
          </button>
        </div>
      </div>

      <!-- Right: Scrollable Bestsellers Shelf with Generously Sized Cards -->
      <div class="flex-1 min-w-0 w-full">
        <div
          ref="carouselRef"
          class="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2 px-1 snap-x snap-mandatory touch-pan-x"
        >
          <div
            v-for="book in bestsellerBooks"
            :key="book.id"
            class="w-[280px] sm:w-[320px] flex-shrink-0 snap-start"
          >
            <BookCard :book="book" @request-seed="(t, a) => emit('requestSeed', t, a)" />
          </div>
        </div>
      </div>

    </div>
  </section>
</template>