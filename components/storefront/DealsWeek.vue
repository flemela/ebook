<!-- components/storefront/DealsWeek.vue -->
<script setup lang="ts">
import { computed } from 'vue';
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

// 6 books: exactly 2 complete rows of 3 on desktop, 3 rows of 2 on mobile
const bestsellerBooks = computed(() => {
  const combined = [...MONTHLY_TOP_SEEDS, ...DEALS_SEEDS];
  const list = mergeWithSeeds(props.books, combined, 6);
  return list.slice(0, 6);
});
</script>

<template>
  <section id="bestsellers-week" class="py-12 sm:py-14 px-4 max-w-6xl mx-auto w-full space-y-6 select-none">
    <!-- Clean Classic Top Heading (No Timer) -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-theme-border pb-3.5">
      <div class="space-y-1">
        <span class="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-widest text-theme-accent block">
          TOP READER PICKS
        </span>
        <h2 class="font-poster text-3xl sm:text-4xl font-extrabold uppercase text-theme-ink tracking-wide leading-none">
          BESTSELLERS OF THE WEEK
        </h2>
      </div>

      <p class="text-xs text-theme-muted max-w-md sm:text-right leading-relaxed">
        The most requested titles, life-changing philosophy, and business essentials dominating reader lists right now.
      </p>
    </div>

    <!-- Strictly Balanced Grid: 2 columns on mobile, 3 columns on tablet and desktop -->
    <div class="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 lg:gap-6 w-full">
      <BookCard
        v-for="book in bestsellerBooks"
        :key="book.id"
        :book="book"
        @request-seed="(t, a) => emit('requestSeed', t, a)"
      />
    </div>
  </section>
</template>