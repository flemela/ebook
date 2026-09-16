<!-- components/storefront/BestsellersSection.vue -->
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
  seeMore: [];
}>();

// Ensure count aligns to 3 items per row for clean desktop presentation
const bestsellerBooks = computed(() => {
  const combined = [...MONTHLY_TOP_SEEDS, ...DEALS_SEEDS];
  const list = mergeWithSeeds(props.books, combined, 6);
  return list.slice(0, 6);
});
</script>

<template>
  <section class="py-14 px-4 max-w-6xl mx-auto w-full space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-theme-border pb-3.5">
      <div class="space-y-1">
        <span class="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-widest text-theme-accent block">
          READER FAVORITES
        </span>
        <h2 class="font-poster text-3xl sm:text-4xl font-extrabold uppercase text-theme-ink tracking-wide leading-none">
          BEST SELLERS OF THE MONTH
        </h2>
      </div>

      <div class="flex items-center gap-3">
        <p class="text-xs text-theme-muted hidden sm:inline">
          Explore the digital editions dominating bookshelves and changing perspectives right now.
        </p>
        <button
          type="button"
          class="bg-theme-accent hover:bg-theme-accent-hover active:bg-theme-accent-active text-white text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full transition-all shadow-xs cursor-pointer flex-shrink-0 active:scale-95"
          @click="emit('seeMore')"
        >
          See More
        </button>
      </div>
    </div>

    <!-- 3-Column Responsive Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto w-full">
      <BookCard
        v-for="book in bestsellerBooks"
        :key="book.id"
        :book="book"
        @request-seed="(t, a) => emit('requestSeed', t, a)"
      />
    </div>
  </section>
</template>