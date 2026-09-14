<!-- components/storefront/StoreNavbar.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ShoppingCart, Menu, X, Search, ChevronDown, BookOpen } from 'lucide-vue-next';
import { useCart } from '~/composables/useCart';
import type { Book } from '~/types';

const emit = defineEmits<{
  search: [query: string];
  'select-category': [category: string];
  'request-book': [];
}>();

const route = useRoute();
const { totalItems, openDrawer } = useCart();

const isMobileOpen = ref(false);
const searchInput = ref('');
const isCategoryDropdownOpen = ref(false);
let closeTimer: ReturnType<typeof setTimeout> | undefined;

const { data: catalogBooks } = await useFetch<Book[]>('/api/products');

const categories = computed<string[]>(() => {
  const set = new Set<string>();
  if (catalogBooks.value) {
    for (const book of catalogBooks.value) {
      if (book.category_name && book.category_name.trim()) {
        const name = book.category_name.trim();
        if (name.toLowerCase() !== 'general') {
          set.add(name);
        }
      }
    }
  }
  if (set.size > 0) return Array.from(set).sort();
  return [
    'Fiction',
    'Non-Fiction',
    'Self Help',
    'Business',
    'Technology',
    'Classic',
  ];
});

function submitSearch(): void {
  emit('search', searchInput.value.trim());
  isMobileOpen.value = false;

  if (process.client) {
    const el = document.getElementById('catalog-results');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}

function clearSearch(): void {
  searchInput.value = '';
  emit('search', '');
}

function chooseCategory(cat: string): void {
  emit('select-category', cat);
  isCategoryDropdownOpen.value = false;
  isMobileOpen.value = false;

  if (process.client) {
    const el = document.getElementById('catalog-results');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}

function onCategoryMouseEnter(): void {
  if (closeTimer) clearTimeout(closeTimer);
  isCategoryDropdownOpen.value = true;
}

function onCategoryMouseLeave(): void {
  closeTimer = setTimeout(() => {
    isCategoryDropdownOpen.value = false;
  }, 160);
}

function toggleCategoryDropdown(): void {
  isCategoryDropdownOpen.value = !isCategoryDropdownOpen.value;
}

function handleOutsideClick(event: MouseEvent): void {
  const target = event.target as HTMLElement | null;
  if (target && !target.closest('#nav-category-dropdown') && !target.closest('#nav-category-trigger')) {
    isCategoryDropdownOpen.value = false;
  }
}

onMounted(() => {
  if (process.client) {
    window.addEventListener('click', handleOutsideClick);
  }
});

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('click', handleOutsideClick);
  }
  if (closeTimer) clearTimeout(closeTimer);
});
</script>

<template>
  <header class="bg-theme-surface border-b border-theme-border sticky top-0 z-40 transition-all select-none shadow-xs">
    
    <!-- =================================================================== -->
    <!-- ROW 1: BRAND LOGO, NAV LINKS, CART & SIGN IN                      -->
    <!-- =================================================================== -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
      
      <!-- Left: Mobile Menu Trigger & EbookStore Brand Logo -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="md:hidden p-1.5 text-theme-ink hover:bg-theme-surface-subtle rounded-lg transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
          @click="isMobileOpen = !isMobileOpen"
        >
          <component :is="isMobileOpen ? X : Menu" :size="20" />
        </button>

        <NuxtLink to="/" class="flex items-center gap-2 group py-1" aria-label="EbookStore Home">
          <div class="w-8 h-8 rounded-lg bg-theme-accent text-white flex items-center justify-center shadow-xs">
            <BookOpen :size="18" />
          </div>
          <span class="font-display font-extrabold text-xl tracking-tight text-theme-ink">
            Ebook<span class="text-theme-accent">Store</span>
          </span>
        </NuxtLink>
      </div>

      <!-- Center: Main Navigation Links with Red Underline Active Indicator -->
      <nav aria-label="Main Navigation" class="hidden md:flex items-center gap-7 text-xs font-bold">
        
        <NuxtLink to="/" class="nav-link-item py-1" :class="{ 'active': route.path === '/' }">
          Home
        </NuxtLink>

        <a href="#catalog-results" class="nav-link-item text-theme-ink py-1">
          Browse
        </a>

        <!-- Category Dropdown Trigger -->
        <div
          class="relative"
          @mouseenter="onCategoryMouseEnter"
          @mouseleave="onCategoryMouseLeave"
        >
          <button
            id="nav-category-trigger"
            type="button"
            class="nav-link-item inline-flex items-center gap-1 text-theme-ink py-1 cursor-pointer"
            :class="{ 'text-theme-accent': isCategoryDropdownOpen }"
            @click.stop="toggleCategoryDropdown"
          >
            <span>Categories</span>
            <ChevronDown :size="13" class="transition-transform" :class="{ 'rotate-180': isCategoryDropdownOpen }" />
          </button>

          <!-- Dropdown Panel -->
          <Transition name="dropdown-fade">
            <div
              v-if="isCategoryDropdownOpen"
              id="nav-category-dropdown"
              class="absolute top-full left-0 mt-2 w-56 bg-theme-surface border border-theme-border rounded-xl shadow-xl py-1.5 z-50 text-left"
              @mouseenter="onCategoryMouseEnter"
              @mouseleave="onCategoryMouseLeave"
            >
              <button
                type="button"
                class="w-full text-left px-4 py-2 hover:bg-theme-surface-subtle text-xs font-bold text-theme-accent cursor-pointer flex items-center justify-between"
                @click="chooseCategory('General')"
              >
                <span>All Categories</span>
                <span class="text-[10px] font-mono">↗</span>
              </button>
              <button
                v-for="cat in categories"
                :key="cat"
                type="button"
                class="w-full text-left px-4 py-2 hover:bg-theme-surface-subtle text-xs font-semibold text-theme-ink cursor-pointer flex items-center justify-between transition-colors"
                @click="chooseCategory(cat)"
              >
                <span class="truncate pr-2">{{ cat }}</span>
                <span class="text-[10px] text-theme-ink-subtle">↗</span>
              </button>
            </div>
          </Transition>
        </div>

        <a href="#about-us" class="nav-link-item text-theme-ink py-1">
          About
        </a>

        <a href="#contact-us" class="nav-link-item text-theme-ink py-1">
          Contact
        </a>
      </nav>

      <!-- Right: Cart & Sign In CTA -->
      <div class="flex items-center gap-3.5">
        <!-- Shopping Cart Bag -->
        <button
          type="button"
          class="relative p-2 text-theme-ink hover:text-theme-accent transition-colors cursor-pointer flex items-center justify-center"
          aria-label="Open Shopping Cart"
          @click="openDrawer"
        >
          <ShoppingCart :size="19" />
          <span
            v-if="totalItems > 0"
            class="absolute top-0.5 right-0.5 bg-theme-accent text-white font-mono text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs"
          >
            {{ totalItems }}
          </span>
        </button>

        <!-- Red 'Sign In' Button -->
        <NuxtLink
          to="/admin/login"
          class="bg-theme-accent hover:bg-theme-accent-hover text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          Sign In
        </NuxtLink>
      </div>
    </div>

    <!-- =================================================================== -->
    <!-- ROW 2: PERMANENT, NON-RETRACTABLE SEARCH BAR STRIP                  -->
    <!-- =================================================================== -->
    <div class="w-full px-4 sm:px-6 py-2.5 bg-theme-surface-subtle border-t border-theme-border">
      <form
        class="max-w-3xl mx-auto flex items-center gap-2"
        @submit.prevent="submitSearch"
      >
        <!-- Search Input Pill -->
        <div class="flex-1 flex items-center gap-2.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-theme-border focus-within:border-theme-accent focus-within:ring-2 focus-within:ring-theme-accent/10 transition-all shadow-2xs">
          <Search :size="15" class="text-theme-ink-subtle flex-shrink-0" />

          <input
            v-model="searchInput"
            type="text"
            placeholder="Search ebooks by title, author, or ISBN..."
            class="w-full bg-transparent text-xs sm:text-sm text-theme-ink placeholder:text-theme-ink-subtle outline-none font-sans font-medium"
            @keyup.enter="submitSearch"
          />

          <button
            v-if="searchInput"
            type="button"
            class="text-theme-ink-subtle hover:text-theme-ink p-0.5 transition-colors cursor-pointer"
            aria-label="Clear search text"
            @click="clearSearch"
          >
            <X :size="14" />
          </button>
        </div>

        <!-- Submit Button (10% Crimson Red Accent) -->
        <button
          type="submit"
          class="bg-theme-accent hover:bg-theme-accent-hover active:bg-theme-accent-active text-white text-xs font-bold uppercase tracking-wider px-5 sm:px-6 py-2 sm:py-2.5 rounded-full transition-all duration-150 cursor-pointer shadow-xs active:scale-95 flex-shrink-0 flex items-center gap-1.5"
        >
          <Search :size="13" class="hidden sm:inline" />
          <span>Search</span>
        </button>
      </form>
    </div>

    <!-- =================================================================== -->
    <!-- MOBILE DRAWER MENU                                                  -->
    <!-- =================================================================== -->
    <div
      v-if="isMobileOpen"
      class="md:hidden bg-theme-surface border-t border-theme-border px-6 py-4 space-y-3 shadow-xl max-h-[80vh] overflow-y-auto"
    >
      <div class="flex flex-col gap-2.5 text-xs font-bold tracking-wide">
        <NuxtLink to="/" class="py-2 text-theme-ink border-b border-theme-border" @click="isMobileOpen = false">
          Home
        </NuxtLink>
        <a href="#catalog-results" class="py-2 text-theme-ink border-b border-theme-border" @click="isMobileOpen = false">
          Browse Ebooks
        </a>
        <a href="#about-us" class="py-2 text-theme-ink border-b border-theme-border" @click="isMobileOpen = false">
          About Us
        </a>
        <a href="#contact-us" class="py-2 text-theme-ink border-b border-theme-border" @click="isMobileOpen = false">
          Contact
        </a>
      </div>

      <div class="pt-2">
        <span class="text-[10px] font-mono uppercase font-bold text-theme-ink-subtle tracking-wider block mb-2">
          Categories:
        </span>
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="text-left px-3 py-2 rounded-lg bg-theme-surface-subtle text-[11px] font-bold text-theme-accent border border-theme-accent-border"
            @click="chooseCategory('General')"
          >
            All Categories
          </button>
          <button
            v-for="cat in categories"
            :key="cat"
            type="button"
            class="text-left px-3 py-2 rounded-lg bg-theme-surface-subtle text-[11px] font-semibold text-theme-ink border border-theme-border truncate"
            @click="chooseCategory(cat)"
          >
            {{ cat }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav-link-item {
  position: relative;
  display: inline-block;
  color: var(--theme-ink);
  transition: color 0.2s ease;
}

.nav-link-item:hover,
.nav-link-item.active {
  color: var(--theme-accent);
}

.nav-link-item::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  width: 100%;
  height: 2px;
  background-color: var(--theme-accent);
  transform: translateX(-50%) scaleX(0);
  transform-origin: center;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 9999px;
}

.nav-link-item:hover::after,
.nav-link-item.active::after {
  transform: translateX(-50%) scaleX(1);
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>