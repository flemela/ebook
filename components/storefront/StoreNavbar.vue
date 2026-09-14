<!-- components/storefront/StoreNavbar.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ShoppingCart, Menu, X, Search, ChevronDown, Sparkles, LayoutGrid } from 'lucide-vue-next';
import WhatsAppIcon from '~/components/icons/WhatsAppIcon.vue';
import { useCart } from '~/composables/useCart';
import { buildWhatsAppLink } from '~/utils/phone';
import type { Book } from '~/types';

const emit = defineEmits<{
  search: [query: string];
  'select-category': [category: string];
  'request-book': [];
}>();

const { totalItems, openDrawer } = useCart();

const isMobileOpen = ref(false);
const searchInput = ref('');
const isCategoryDropdownOpen = ref(false);
let closeTimer: ReturnType<typeof setTimeout> | undefined;

// Dynamic categories extraction from live catalog products
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
  if (set.size > 0) {
    return Array.from(set).sort();
  }
  return [
    'Business & Finance',
    'Psychology & Self-Help',
    'Self-Help',
    'Fiction & Literature',
    'Christian Books',
    'Education & Textbooks',
    'Biographies & Memoir',
  ];
});

const helpWhatsAppUrl = buildWhatsAppLink(
  'Hello The Sunrise Bookstore Help Desk, I need assistance with an order or book inquiry.'
);

function submitSearch(): void {
  if (searchInput.value.trim()) {
    emit('search', searchInput.value.trim());
    isMobileOpen.value = false;
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
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

function handleRequestBookClick(event: Event): void {
  event.preventDefault();
  emit('request-book');
  isMobileOpen.value = false;
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
  <header
    class="bg-theme-surface border-b border-theme-border sticky top-0 z-40 transition-all select-none shadow-xs"
  >
    <!-- =================================================================== -->
    <!-- ROW 1: BRAND LOGO & ORIGINAL MAIN NAVIGATION ITEMS                  -->
    <!-- =================================================================== -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
      
      <!-- Left: Mobile Trigger & Authentic Real Logo -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="md:hidden p-1.5 text-theme-ink hover:bg-theme-surface-subtle rounded-lg transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
          @click="isMobileOpen = !isMobileOpen"
        >
          <component :is="isMobileOpen ? X : Menu" :size="20" />
        </button>

        <NuxtLink to="/" class="flex items-center group py-1" aria-label="The Sunrise Bookstore Home">
          <img
            src="/images/logo.png"
            alt="The Sunrise Bookstore"
            class="h-8 sm:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            loading="eager"
            width="120"
            height="40"
          />
        </NuxtLink>
      </div>

      <!-- Center: Original Navigation Links + Side-by-Side Category + Request CTA -->
      <nav aria-label="Main Navigation" class="hidden md:flex items-center gap-6 lg:gap-7 text-xs font-bold tracking-wide">
        
        <!-- Home Link -->
        <a href="/" class="nav-link-item py-1 cursor-pointer">
          Home
        </a>

        <!-- Category Dropdown: LayoutGrid Icon Side-by-Side with Text and Chevron -->
        <div
          class="relative"
          @mouseenter="onCategoryMouseEnter"
          @mouseleave="onCategoryMouseLeave"
        >
          <button
            id="nav-category-trigger"
            type="button"
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-theme-border hover:border-theme-accent text-theme-ink hover:text-theme-accent bg-theme-surface-subtle hover:bg-theme-accent-soft transition-all cursor-pointer font-bold select-none text-xs"
            :class="{ 'border-theme-accent text-theme-accent bg-theme-accent-soft shadow-2xs': isCategoryDropdownOpen }"
            @click.stop="toggleCategoryDropdown"
          >
            <!-- Icon Side-by-Side to Text -->
            <LayoutGrid :size="13" class="text-theme-accent flex-shrink-0" />
            <span class="leading-none">Categories</span>
            <ChevronDown
              :size="12"
              class="transition-transform duration-200 text-theme-ink-muted flex-shrink-0"
              :class="{ 'rotate-180 text-theme-accent': isCategoryDropdownOpen }"
            />
          </button>

          <!-- Dropdown Menu Panel -->
          <Transition name="dropdown-fade">
            <div
              v-if="isCategoryDropdownOpen"
              id="nav-category-dropdown"
              class="absolute top-full left-0 mt-2 w-64 bg-theme-surface border border-theme-border rounded-2xl shadow-xl py-2 z-50 text-left"
              @mouseenter="onCategoryMouseEnter"
              @mouseleave="onCategoryMouseLeave"
            >
              <div class="px-4 py-1.5 border-b border-theme-border flex items-center justify-between">
                <span class="text-[10px] font-mono uppercase font-bold text-theme-ink-subtle tracking-wider">
                  Store Catalog
                </span>
                <span class="text-[10px] font-mono text-theme-accent font-bold">
                  {{ categories.length + 1 }} Options
                </span>
              </div>

              <div class="max-h-72 overflow-y-auto py-1">
                <!-- General / All Books Option -->
                <button
                  type="button"
                  class="w-full text-left px-4 py-2 hover:bg-theme-accent-soft hover:text-theme-accent text-xs font-bold transition-colors text-theme-ink cursor-pointer flex items-center justify-between group"
                  @click="chooseCategory('General')"
                >
                  <span class="flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-theme-accent"></span>
                    General (All Books)
                  </span>
                  <span class="text-[10px] font-mono text-theme-ink-subtle group-hover:text-theme-accent">↗</span>
                </button>

                <button
                  v-for="cat in categories"
                  :key="cat"
                  type="button"
                  class="w-full text-left px-4 py-2 hover:bg-theme-accent-soft hover:text-theme-accent text-xs font-semibold transition-colors text-theme-ink cursor-pointer flex items-center justify-between group"
                  @click="chooseCategory(cat)"
                >
                  <span class="truncate pr-2">{{ cat }}</span>
                  <span class="text-[10px] font-mono text-theme-ink-subtle group-hover:text-theme-accent">↗</span>
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Flash Sale Link -->
        <a href="#flash-sale" class="nav-link-item py-1 cursor-pointer">
          Flash Sale
        </a>

        <!-- Bestsellers Link -->
        <a href="#bestsellers-week" class="nav-link-item py-1 cursor-pointer">
          Bestsellers
        </a>

        <!-- Help Link -->
        <a
          :href="helpWhatsAppUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="nav-link-item py-1 cursor-pointer"
        >
          Help
        </a>

        <!-- Brand Accent "Request Book!" Button -->
        <button
          type="button"
          class="bg-theme-accent hover:bg-theme-accent-hover active:bg-theme-accent-active text-white text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-xs hover:shadow transition-all duration-200 cursor-pointer active:scale-95 flex items-center gap-1.5 flex-shrink-0"
          title="Request any title you can't find in stock"
          @click="handleRequestBookClick"
        >
          <Sparkles :size="12" class="text-white" />
          <span>Request Book!</span>
        </button>
      </nav>

      <!-- Right: Action Icons (WhatsApp Messenger + Cart) -->
      <div class="flex items-center gap-3 sm:gap-4 text-theme-ink">
        <!-- 1. WhatsApp Messenger Button -->
        <a
          :href="helpWhatsAppUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer flex items-center justify-center"
          title="Chat with The Sunrise Bookstore on WhatsApp"
          aria-label="Chat with The Sunrise Bookstore on WhatsApp"
        >
          <WhatsAppIcon class="w-5 h-5 transition-transform hover:scale-110" />
        </a>

        <!-- 2. Shopping Cart Button with Badge -->
        <button
          type="button"
          class="relative p-1.5 text-theme-ink hover:text-theme-accent hover:bg-theme-surface-subtle rounded-lg transition-colors cursor-pointer flex items-center justify-center"
          aria-label="Open Shopping Cart"
          @click="openDrawer"
        >
          <ShoppingCart :size="19" class="transition-transform hover:scale-105" />
          <span
            v-if="totalItems > 0"
            class="absolute -top-1 -right-1 bg-theme-accent text-white font-mono text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs"
          >
            {{ totalItems }}
          </span>
        </button>
      </div>
    </div>

    <!-- =================================================================== -->
    <!-- ROW 2: PERMANENT, NON-RETRACTABLE SEARCH BAR STRIP                  -->
    <!-- =================================================================== -->
    <div class="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-theme-surface-subtle border-t border-theme-border">
      <form
        class="max-w-3xl mx-auto flex items-center gap-2"
        @submit.prevent="submitSearch"
      >
        <div class="flex-1 flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-theme-border shadow-xs focus-within:border-theme-accent focus-within:ring-2 focus-within:ring-theme-accent/10 transition-all">
          <Search :size="16" class="text-theme-ink-subtle flex-shrink-0" />

          <input
            v-model="searchInput"
            type="text"
            placeholder="Search books by title, author, or ISBN..."
            class="w-full bg-transparent text-xs sm:text-sm text-theme-ink placeholder:text-theme-ink-subtle outline-none font-sans font-medium"
          />

          <button
            v-if="searchInput"
            type="button"
            class="text-theme-ink-subtle hover:text-theme-ink p-0.5 transition-colors cursor-pointer"
            aria-label="Clear search"
            @click="clearSearch"
          >
            <X :size="14" />
          </button>
        </div>

        <button
          type="submit"
          class="bg-theme-accent hover:bg-theme-accent-hover text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider px-5 sm:px-6 py-2.5 rounded-full transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md active:scale-95 flex-shrink-0 flex items-center gap-1.5"
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
      class="md:hidden bg-theme-surface border-t border-theme-border px-6 py-4 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto"
    >
      <div class="flex flex-col gap-2.5 text-xs font-bold tracking-wide">
        <!-- Request Book CTA -->
        <button
          type="button"
          class="w-full text-center bg-theme-accent hover:bg-theme-accent-hover text-white font-extrabold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mb-1"
          @click="handleRequestBookClick"
        >
          <Sparkles :size="14" />
          <span>Request Book!</span>
        </button>

        <a
          href="/"
          class="py-2 text-theme-ink hover:text-theme-accent border-b border-theme-border transition-colors"
          @click="isMobileOpen = false"
        >
          Home
        </a>
        <a
          href="#flash-sale"
          class="py-2 text-theme-ink hover:text-theme-accent border-b border-theme-border transition-colors"
          @click="isMobileOpen = false"
        >
          Flash Sale
        </a>
        <a
          href="#bestsellers-week"
          class="py-2 text-theme-ink hover:text-theme-accent border-b border-theme-border transition-colors"
          @click="isMobileOpen = false"
        >
          Bestsellers
        </a>
        <a
          :href="helpWhatsAppUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="py-2 text-emerald-600 font-bold border-b border-theme-border flex items-center gap-2"
          @click="isMobileOpen = false"
        >
          <WhatsAppIcon class="w-4 h-4 text-emerald-600" />
          <span>Help & Support</span>
        </a>
      </div>

      <!-- Mobile Categories List -->
      <div class="pt-2">
        <span class="text-[10px] font-mono uppercase font-bold text-theme-ink-subtle tracking-wider block mb-2">
          Filter by Category:
        </span>
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="text-left px-3 py-2 rounded-lg bg-theme-surface-subtle text-[11px] font-bold text-theme-accent border border-theme-accent-border"
            @click="chooseCategory('General')"
          >
            General (All Books)
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
  transition: color 0.25s ease;
}

.nav-link-item:hover {
  color: var(--theme-accent);
}

.nav-link-item::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  width: 100%;
  height: 2px;
  background-color: var(--theme-accent);
  transform: translateX(-50%) scaleX(0);
  transform-origin: center;
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 9999px;
}

.nav-link-item:hover::after {
  transform: translateX(-50%) scaleX(1);
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>