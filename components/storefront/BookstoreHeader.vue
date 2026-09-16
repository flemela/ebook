<!-- components/storefront/BookstoreHeader.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Search, ShoppingBag, Menu, X, ChevronDown } from 'lucide-vue-next';
import { useCart } from '~/composables/useCart';
import type { Book } from '~/types';

interface Props {
  customCategories?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  customCategories: () => [],
});

const emit = defineEmits<{
  search: [query: string, category: string];
  selectCategory: [category: string];
}>();

const { totalItems, openDrawer } = useCart();
const searchInput = ref('');
const selectedCategory = ref('All Categories');
const isCategoryDropdownOpen = ref(false);
const isMobileMenuOpen = ref(false);
const dropdownContainerRef = ref<HTMLElement | null>(null);

const { data: catalogBooks } = await useFetch<Book[]>('/api/products');

const categories = computed<string[]>(() => {
  if (props.customCategories && props.customCategories.length > 0) {
    return ['All Categories', ...props.customCategories];
  }

  const liveCategories = new Set<string>();
  if (catalogBooks.value) {
    for (const book of catalogBooks.value) {
      if (book.category_name && book.category_name.trim()) {
        liveCategories.add(book.category_name.trim());
      }
    }
  }

  if (liveCategories.size > 0) {
    return ['All Categories', ...Array.from(liveCategories).sort()];
  }

  return [
    'All Categories',
    'Fiction & Literature',
    'Psychology & Self-Help',
    'Business & Finance',
    'Christian Books',
    'Education & Textbooks',
    'Biographies & Memoir',
  ];
});

function handleSearch(): void {
  emit('search', searchInput.value.trim(), selectedCategory.value);
  isMobileMenuOpen.value = false;
}

function handleCategoryClick(cat: string): void {
  selectedCategory.value = cat;
  isCategoryDropdownOpen.value = false;
  emit('selectCategory', cat === 'All Categories' ? 'ALL' : cat);
}

function clearSearch(): void {
  searchInput.value = '';
  emit('search', '', selectedCategory.value);
}

function handleDocumentClick(event: MouseEvent): void {
  if (
    dropdownContainerRef.value &&
    !dropdownContainerRef.value.contains(event.target as Node)
  ) {
    isCategoryDropdownOpen.value = false;
  }
}

onMounted(() => {
  if (process.client) {
    document.addEventListener('click', handleDocumentClick);
  }
});

onUnmounted(() => {
  if (process.client) {
    document.removeEventListener('click', handleDocumentClick);
  }
});
</script>

<template>
  <header class="bg-theme-surface/95 backdrop-blur-md border-b border-theme-border sticky top-0 z-40 transition-all select-none">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-6">
      
      <!-- Left: Mobile Menu Trigger & Free-Width Brand Logo -->
      <div class="flex items-center gap-2.5 sm:gap-3.5 flex-shrink-0">
        <button
          type="button"
          class="md:hidden p-1.5 text-theme-ink hover:bg-theme-surface-subtle rounded-lg transition-colors cursor-pointer flex-shrink-0"
          aria-label="Toggle navigation menu"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <component :is="isMobileMenuOpen ? X : Menu" :size="20" />
        </button>

        <NuxtLink to="/" class="flex items-center flex-shrink-0 py-0.5 group" aria-label="E-Book Reads Home">
          <img
            src="/images/logo.png"
            alt="E-Book Reads Logo"
            class="h-9 sm:h-11 md:h-12 w-auto max-w-[190px] sm:max-w-[240px] md:max-w-[280px] object-contain transition-transform duration-300 group-hover:scale-102"
            loading="eager"
          />
        </NuxtLink>
      </div>

      <!-- Center: Floating Search Pill (Desktop) -->
      <div class="hidden md:flex items-center flex-1 max-w-xl mx-2 bg-theme-surface-subtle rounded-full border border-theme-border focus-within:border-theme-accent focus-within:bg-white focus-within:ring-2 focus-within:ring-theme-accent/5 transition-all shadow-subtle">
        
        <!-- Category Dropdown Trigger -->
        <div ref="dropdownContainerRef" class="relative flex-shrink-0">
          <button
            type="button"
            class="px-3.5 py-2 text-[11px] font-sans font-semibold text-theme-ink hover:text-theme-accent flex items-center gap-1 border-r border-theme-border cursor-pointer select-none"
            @click.stop="isCategoryDropdownOpen = !isCategoryDropdownOpen"
          >
            <span class="max-w-[110px] truncate">{{ selectedCategory }}</span>
            <ChevronDown
              :size="12"
              class="text-theme-muted transition-transform"
              :class="{ 'rotate-180': isCategoryDropdownOpen }"
            />
          </button>

          <!-- Dropdown Menu -->
          <div
            v-if="isCategoryDropdownOpen"
            class="absolute top-full left-0 mt-1.5 w-56 max-h-72 overflow-y-auto bg-theme-surface border border-theme-border rounded-xl shadow-medium py-1.5 z-50 text-xs font-medium text-theme-ink divide-y divide-theme-border/30"
          >
            <button
              v-for="cat in categories"
              :key="cat"
              type="button"
              class="w-full text-left px-3.5 py-2 hover:bg-theme-surface-subtle transition-colors text-xs font-semibold cursor-pointer truncate"
              :class="{ 'text-theme-accent font-bold bg-theme-accent-soft': selectedCategory === cat }"
              @click="handleCategoryClick(cat)"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <!-- Text Input -->
        <input
          v-model="searchInput"
          type="text"
          placeholder="Search eBooks by title, author, or keyword..."
          class="flex-1 bg-transparent px-3.5 py-2 text-xs text-theme-ink font-medium outline-none placeholder:text-theme-muted"
          @keyup.enter="handleSearch"
        />

        <!-- Clear Button -->
        <button
          v-if="searchInput"
          type="button"
          class="p-1 text-theme-muted hover:text-theme-ink mr-1 cursor-pointer"
          aria-label="Clear search query"
          @click="clearSearch"
        >
          <X :size="13" />
        </button>

        <!-- Search Action Button -->
        <button
          type="button"
          class="px-3.5 py-2 text-theme-ink hover:text-theme-accent transition-colors cursor-pointer"
          aria-label="Search"
          @click="handleSearch"
        >
          <Search :size="14" />
        </button>
      </div>

      <!-- Right: Portal & Cart Actions -->
      <div class="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
        <NuxtLink
          to="/admin/login"
          class="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-theme-muted hover:text-theme-ink transition-colors px-2.5 py-1.5 rounded-md hover:bg-theme-surface-subtle"
        >
          <span>Portal</span>
        </NuxtLink>

        <!-- Cart Bag Button -->
        <button
          type="button"
          class="relative flex items-center gap-2 bg-theme-dark text-white hover:bg-theme-dark-surface active:bg-theme-dark px-3.5 py-2 rounded-xl transition-all text-xs font-bold cursor-pointer shadow-subtle active:scale-[0.98]"
          @click="openDrawer"
        >
          <div class="relative flex items-center justify-center">
            <ShoppingBag :size="15" class="text-theme-accent" />
            <span
              v-if="totalItems > 0"
              class="absolute -top-2 -right-2.5 bg-theme-accent text-white font-extrabold text-[9px] px-1.5 py-0.2 rounded-full font-mono shadow-xs"
            >
              {{ totalItems }}
            </span>
          </div>
          <span class="font-sans text-xs font-bold hidden sm:inline">eBooks Cart</span>
        </button>
      </div>
    </div>

    <!-- Mobile Search Bar -->
    <div class="md:hidden px-4 pb-2.5">
      <div class="flex items-center bg-theme-surface-subtle rounded-full border border-theme-border px-3 py-1.5 shadow-subtle">
        <Search :size="13" class="text-theme-muted mr-2 flex-shrink-0" />
        <input
          v-model="searchInput"
          type="text"
          placeholder="Search eBooks, authors..."
          class="w-full bg-transparent text-xs text-theme-ink font-medium outline-none placeholder:text-theme-muted"
          @keyup.enter="handleSearch"
        />
        <button
          v-if="searchInput"
          type="button"
          class="p-0.5 text-theme-muted hover:text-theme-ink"
          @click="clearSearch"
        >
          <X :size="12" />
        </button>
      </div>
    </div>

    <!-- Mobile Navigation Drawer -->
    <div v-if="isMobileMenuOpen" class="md:hidden bg-theme-surface border-t border-theme-border px-4 py-4 space-y-3.5 shadow-medium">
      <div class="flex items-center justify-between">
        <p class="text-[10px] uppercase font-mono font-bold tracking-widest text-theme-accent">Browse eBook Catalog</p>
        <button type="button" class="text-xs text-theme-muted" @click="isMobileMenuOpen = false">Close</button>
      </div>

      <div class="grid grid-cols-2 gap-2 text-xs max-h-60 overflow-y-auto pr-1">
        <button
          v-for="cat in categories"
          :key="cat"
          type="button"
          class="text-left py-2 px-2.5 rounded-lg bg-theme-surface-subtle border border-theme-border hover:bg-theme-accent-soft hover:text-theme-accent font-medium text-theme-ink truncate cursor-pointer text-[11px]"
          @click="handleCategoryClick(cat); isMobileMenuOpen = false;"
        >
          {{ cat }}
        </button>
      </div>

      <div class="pt-3 border-t border-theme-border flex justify-between items-center text-xs">
        <NuxtLink to="/admin/login" class="text-theme-ink font-bold hover:underline">Merchant Portal</NuxtLink>
        <span class="text-[10px] text-theme-muted font-mono">E-Book Reads</span>
      </div>
    </div>
  </header>
</template>