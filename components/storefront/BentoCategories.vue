<!-- components/storefront/BentoCategories.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import {
  BookOpen,
  GraduationCap,
  Heart,
  Briefcase,
  Laptop,
  Star,
  ArrowRight,
} from 'lucide-vue-next';
import type { Book } from '~/types';

const emit = defineEmits<{
  select: [category: string];
}>();

// Fetch live catalog books to dynamically calculate inventory counts
const { data: catalogBooks } = await useFetch<Book[]>('/api/products');

const CATEGORIES = [
  {
    name: 'Fiction',
    icon: BookOpen,
    fallbackCount: '2,450+',
    query: 'Fiction',
  },
  {
    name: 'Non-Fiction',
    icon: GraduationCap,
    fallbackCount: '1,630+',
    query: 'Non-Fiction',
  },
  {
    name: 'Self Help',
    icon: Heart,
    fallbackCount: '980+',
    query: 'Self-Help',
  },
  {
    name: 'Business',
    icon: Briefcase,
    fallbackCount: '760+',
    query: 'Business',
  },
  {
    name: 'Technology',
    icon: Laptop,
    fallbackCount: '540+',
    query: 'Technology',
  },
  {
    name: 'Classic',
    icon: Star,
    fallbackCount: '320+',
    query: 'Classic',
  },
];

const countMap = computed(() => {
  const map = new Map<string, number>();
  if (catalogBooks.value) {
    for (const b of catalogBooks.value) {
      const cat = (b.category_name || 'General').toLowerCase();
      map.set(cat, (map.get(cat) || 0) + 1);
    }
  }
  return map;
});

function getDisplayCount(query: string, fallback: string): string {
  const q = query.toLowerCase();
  let total = 0;
  for (const [cat, count] of countMap.value.entries()) {
    if (cat.includes(q) || q.includes(cat)) {
      total += count;
    }
  }
  return total > 0 ? `${total} titles` : `${fallback} titles`;
}

function handleCategoryClick(catQuery: string): void {
  emit('select', catQuery);
  if (process.client) {
    const el = document.getElementById('catalog-results');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
</script>

<template>
  <section id="categories-grid" class="py-10 sm:py-14 px-4 max-w-7xl mx-auto w-full space-y-6 select-none">
    <!-- Header with 'View all ->' Link -->
    <div class="flex items-end justify-between border-b border-theme-border pb-3">
      <div>
        <h2 class="font-sans font-extrabold text-2xl sm:text-3xl text-theme-ink tracking-tight">
          Shop by Category
        </h2>
      </div>

      <button
        type="button"
        class="text-xs sm:text-sm font-bold text-theme-accent hover:text-theme-accent-hover flex items-center gap-1 transition-colors cursor-pointer"
        @click="handleCategoryClick('General')"
      >
        <span>View all</span>
        <ArrowRight :size="14" />
      </button>
    </div>

    <!-- 6-Card Category Grid matching Visual Guide -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
      <button
        v-for="cat in CATEGORIES"
        :key="cat.name"
        type="button"
        class="bg-theme-surface hover:bg-theme-surface-subtle border border-theme-border hover:border-theme-accent rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center gap-2.5 transition-all duration-200 group cursor-pointer shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
        @click="handleCategoryClick(cat.query)"
      >
        <!-- Category Icon -->
        <div class="w-10 h-10 rounded-full bg-theme-surface-subtle group-hover:bg-theme-accent-soft text-theme-ink group-hover:text-theme-accent flex items-center justify-center transition-colors">
          <component :is="cat.icon" :size="20" class="stroke-[1.75]" />
        </div>

        <!-- Name and Title Count -->
        <div class="space-y-0.5">
          <h3 class="font-sans font-bold text-xs sm:text-sm text-theme-ink group-hover:text-theme-accent transition-colors leading-tight">
            {{ cat.name }}
          </h3>
          <p class="text-[11px] text-theme-ink-muted font-medium">
            {{ getDisplayCount(cat.query, cat.fallbackCount) }}
          </p>
        </div>
      </button>
    </div>
  </section>
</template>