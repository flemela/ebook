<!-- components/storefront/BentoCategories.vue -->
<script setup lang="ts">
import { computed, type Component } from 'vue';
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
import type { PaginatedProductsResponse } from '~/server/api/products/index.get';

interface CategoryItem {
  name: string;
  icon: Component;
  fallbackCount: string;
  query: string;
}

const emit = defineEmits<{
  select: [category: string];
}>();

const { data: catalogResponse } = await useFetch<PaginatedProductsResponse>('/api/products', {
  query: { limit: 100 },
});

const CATEGORIES: CategoryItem[] = [
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
  const list: Book[] = catalogResponse.value?.products || [];

  for (const b of list) {
    const cat = (b?.category_name || 'General').toLowerCase();
    map.set(cat, (map.get(cat) || 0) + 1);
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
  return total > 0 ? `${total} eBooks` : `${fallback} eBooks`;
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
  <section id="categories-grid" class="py-8 sm:py-10 md:py-12 px-4 max-w-6xl mx-auto w-full space-y-4 sm:space-y-5 select-none">
    <!-- Header with Unified Bigger & Bolder Sans Font -->
    <div class="flex items-end justify-between border-b border-theme-border pb-3.5">
      <div class="space-y-1">
        <span class="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-widest text-theme-accent block">
          eBook Catalog
        </span>
        <h2 class="font-sans font-black text-2xl sm:text-3xl md:text-4xl text-theme-ink tracking-tight uppercase leading-none">
          Shop by Category
        </h2>
      </div>

      <button
        type="button"
        class="text-xs sm:text-sm font-extrabold text-theme-accent hover:text-theme-accent-hover flex items-center gap-1 transition-colors cursor-pointer"
        @click="handleCategoryClick('General')"
      >
        <span>View all</span>
        <ArrowRight :size="14" />
      </button>
    </div>

    <!-- Category Grid: 3 on Mobile, 6 on Tablet & Desktop -->
    <div class="grid grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3.5 md:gap-4">
      <button
        v-for="cat in CATEGORIES"
        :key="cat.name"
        type="button"
        class="bg-theme-surface hover:bg-theme-surface-subtle border border-theme-border hover:border-theme-border-strong rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center text-center gap-2 transition-all duration-200 group cursor-pointer shadow-2xs hover:shadow-xs hover:-translate-y-0.5 min-h-[96px] sm:min-h-[114px]"
        @click="handleCategoryClick(cat.query)"
      >
        <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-theme-accent-soft group-hover:bg-theme-surface-muted flex items-center justify-center transition-colors duration-200 flex-shrink-0">
          <component
            :is="cat.icon"
            :size="19"
            class="sm:w-5 sm:h-5 stroke-[1.75] text-theme-accent fill-theme-accent group-hover:text-black group-hover:fill-black transition-colors duration-200"
          />
        </div>

        <div class="space-y-0.5 w-full min-w-0">
          <h3 class="font-sans font-bold text-xs sm:text-sm text-theme-ink group-hover:text-theme-accent transition-colors leading-tight truncate">
            {{ cat.name }}
          </h3>
          <p class="text-[10px] sm:text-[11px] text-theme-muted font-medium truncate">
            {{ getDisplayCount(cat.query, cat.fallbackCount) }}
          </p>
        </div>
      </button>
    </div>
  </section>
</template>