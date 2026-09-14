<!-- pages/index.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import PromoTickerStrip from '~/components/storefront/PromoTickerStrip.vue';
import StoreNavbar from '~/components/storefront/StoreNavbar.vue';
import HeroCarousel from '~/components/storefront/HeroCarousel.vue';
import FlashSaleStrip from '~/components/storefront/FlashSaleStrip.vue';
import BentoCategories from '~/components/storefront/BentoCategories.vue';
import DealsWeek from '~/components/storefront/DealsWeek.vue';
import NewsletterBanner from '~/components/storefront/NewsletterBanner.vue';
import TrustStrip from '~/components/storefront/TrustStrip.vue';
import StoreFooter from '~/components/storefront/StoreFooter.vue';
import BookCard from '~/components/storefront/BookCard.vue';
import CartDrawer from '~/components/storefront/CartDrawer.vue';
import ToastContainer from '~/components/ui/ToastContainer.vue';
import BookRequestModal from '~/components/storefront/BookRequestModal.vue';
import { BookOpen, ChevronDown, Check, Filter, X } from 'lucide-vue-next';
import { MONTHLY_TOP_SEEDS, DEALS_SEEDS, mergeWithSeeds } from '~/data/seeds';
import type { Book } from '~/types';

const { data: realBooks } = await useFetch<Book[]>('/api/products');
const { data: storeMetadata } = await useFetch<any>('/api/stores/current');

// ---------------------------------------------------------------------------
// Comprehensive SEO Meta & Schema.org Structured Data
// ---------------------------------------------------------------------------
useHead({
  title: 'EbookStore — Discover Your Next Great Book',
  link: [
    { rel: 'canonical', href: 'https://www.thesunrisebookstore.com' },
  ],
  meta: [
    {
      name: 'description',
      content: 'Shop thousands of ebooks with instant digital downloads. Fiction, non-fiction, self-help, business, and classic literature delivered directly to your device.',
    },
    { property: 'og:title', content: 'EbookStore — Discover Your Next Great Book' },
    { property: 'og:description', content: 'Shop thousands of ebooks with instant digital downloads. Read anytime, anywhere on EbookStore.' },
    { property: 'og:url', content: 'https://www.thesunrisebookstore.com' },
    { property: 'og:image', content: 'https://www.thesunrisebookstore.com/images/hero-cover.jpg' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BookStore',
            '@id': 'https://www.thesunrisebookstore.com/#bookstore',
            name: 'EbookStore',
            url: 'https://www.thesunrisebookstore.com',
            priceRange: 'KSh 149 - KSh 4500',
            currenciesAccepted: 'KES',
            paymentAccepted: 'Cash, M-Pesa',
          },
          {
            '@type': 'WebSite',
            '@id': 'https://www.thesunrisebookstore.com/#website',
            url: 'https://www.thesunrisebookstore.com',
            name: 'EbookStore',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://www.thesunrisebookstore.com/?q={search_term_string}#catalog-results',
              'query-input': 'required name=search_term_string',
            },
          },
        ],
      }),
    },
  ],
});

const tickerItems = computed(() => {
  return storeMetadata.value?.promo_ticker || [];
});

const activeCategoryFilter = ref<string>('General');
const searchQuery = ref<string>('');

const showRequestModal = ref(false);
const modalInitialTitle = ref('');
const modalInitialAuthor = ref('');

const isCatalogueDropdownOpen = ref(false);

const catalogueCategories = computed<string[]>(() => {
  const set = new Set<string>();
  if (realBooks.value) {
    for (const book of realBooks.value) {
      if (book.category_name && book.category_name.trim()) {
        const name = book.category_name.trim();
        if (name.toLowerCase() !== 'general') {
          set.add(name);
        }
      }
    }
  }
  if (set.size > 0) {
    return ['General', ...Array.from(set).sort()];
  }
  return [
    'General',
    'Fiction',
    'Non-Fiction',
    'Self Help',
    'Business',
    'Technology',
    'Classic',
  ];
});

// Dynamic Filter Engine for Main Catalog Grid
const filteredBooks = computed(() => {
  const books = realBooks.value || [];
  let result = [...books];

  const currentCat = activeCategoryFilter.value.trim().toLowerCase();

  // "General" and "ALL" both act as the universal unfiltered view
  if (currentCat !== 'general' && currentCat !== 'all' && currentCat !== 'all books') {
    result = result.filter((b) => {
      const bCat = (b.category_name || '').toLowerCase().trim();
      return bCat === currentCat || bCat.includes(currentCat) || currentCat.includes(bCat);
    });
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    result = result.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.author && b.author.toLowerCase().includes(q)) ||
        (b.description && b.description.toLowerCase().includes(q))
    );
  }

  return result;
});

const isFilterActive = computed(() => {
  const cat = activeCategoryFilter.value.trim().toLowerCase();
  const isNotGeneral = cat !== 'general' && cat !== 'all' && cat !== 'all books';
  return isNotGeneral || searchQuery.value.trim().length > 0;
});

// Flash sale filtered books
const flashSaleBooks = computed<Book[]>(() => {
  const books = realBooks.value || [];
  return books.filter((b) => {
    if (b.badge === 'FLASH_SALE' || b.badge === 'LIMITED_TIME') return true;
    if (!b.badge && b.compare_at_price && b.compare_at_price > b.price) return true;
    return false;
  });
});

// Bestsellers of the week backfilled gracefully with seeds
const bestsellersOfWeek = computed<Book[]>(() => {
  const books = realBooks.value || [];
  const tagged = books.filter((b) => b.badge === 'BESTSELLER');
  const combinedSeeds = [...MONTHLY_TOP_SEEDS, ...DEALS_SEEDS];
  return mergeWithSeeds(tagged, combinedSeeds, 4);
});

function handleSearch(query: string, category?: string): void {
  searchQuery.value = query;
  if (category && category !== 'All Categories') {
    activeCategoryFilter.value = category;
  }
  scrollToSection('catalog-results');
}

function handleCategorySelect(category: string): void {
  activeCategoryFilter.value = category;
  scrollToSection('catalog-results');
}

function selectCatalogueCategory(cat: string): void {
  activeCategoryFilter.value = cat;
  isCatalogueDropdownOpen.value = false;
}

function scrollToSection(sectionId: string): void {
  if (process.client) {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}

function handleRequestSeed(title?: string, author?: string): void {
  modalInitialTitle.value = title || '';
  modalInitialAuthor.value = author || '';
  showRequestModal.value = true;
}

function handleOutsideClickCatalogue(event: MouseEvent): void {
  const target = event.target as HTMLElement | null;
  if (target && !target.closest('#catalogue-category-dropdown') && !target.closest('#catalogue-category-trigger')) {
    isCatalogueDropdownOpen.value = false;
  }
}

onMounted(() => {
  if (process.client) {
    window.addEventListener('click', handleOutsideClickCatalogue);
  }
});

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('click', handleOutsideClickCatalogue);
  }
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-theme-canvas text-theme-ink antialiased">
    <!-- 1. Top Rotating Promotional Ribbon (Single Source of Truth) -->
    <PromoTickerStrip :messages="tickerItems" />

    <!-- 2. Sticky Navbar with Categories Dropdown & Permanent Row 2 Search Bar -->
    <StoreNavbar
      @search="handleSearch"
      @select-category="handleCategorySelect"
      @request-book="() => handleRequestSeed()"
    />

    <!-- 3. Ambient Charcoal Hero Section with 3D Book & Circular Price Badge -->
    <HeroCarousel
      @search="handleSearch"
      @select-category="handleCategorySelect"
      @navigate-flash-sale="scrollToSection('flash-sale')"
    />

    <!-- 4. Flash Sale Shelf -->
    <div id="flash-sale" class="mt-0">
      <FlashSaleStrip
        :books="flashSaleBooks"
        title="FLASH SALE DEALS"
        badge-label="LIMITED TIME"
      />
    </div>

    <!-- 5. Shop by Category (2 on mobile <768px, 6 on tablet & desktop >=768px) -->
    <BentoCategories @select="handleCategorySelect" />

    <!-- 6. Bestsellers of the Week -->
    <DealsWeek :books="bestsellersOfWeek" @request-seed="handleRequestSeed" />

    <!-- 7. Complete Catalogue / Popular Ebooks -->
    <section
      id="catalog-results"
      class="pt-10 sm:pt-14 pb-16 px-4 max-w-7xl mx-auto w-full space-y-6 select-none"
    >
      <!-- Section Header with Category Filter -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-theme-border">
        <div class="space-y-1">
          <span class="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-widest text-theme-accent block">
            FEATURED COLLECTION
          </span>
          <h2 class="font-sans font-extrabold text-2xl sm:text-3xl text-theme-ink tracking-tight">
            Popular Ebooks
          </h2>
        </div>

        <!-- Dropdown Category Filter -->
        <div class="flex items-center gap-2.5 flex-wrap">
          <div class="relative">
            <button
              id="catalogue-category-trigger"
              type="button"
              class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-theme-surface hover:bg-theme-surface-subtle border border-theme-border hover:border-theme-accent text-xs font-bold text-theme-ink transition-all cursor-pointer shadow-2xs"
              :class="{ 'border-theme-accent text-theme-accent bg-theme-accent-soft': isCatalogueDropdownOpen }"
              @click="isCatalogueDropdownOpen = !isCatalogueDropdownOpen"
            >
              <Filter :size="13" class="text-theme-accent" />
              <span>Category: <strong>{{ activeCategoryFilter.toLowerCase() === 'general' ? 'All Books' : activeCategoryFilter }}</strong></span>
              <ChevronDown :size="13" class="transition-transform duration-200 text-theme-ink-muted" :class="{ 'rotate-180 text-theme-accent': isCatalogueDropdownOpen }" />
            </button>

            <!-- Dropdown Panel -->
            <Transition name="dropdown-fade">
              <div
                v-if="isCatalogueDropdownOpen"
                id="catalogue-category-dropdown"
                class="absolute right-0 sm:left-0 sm:right-auto mt-2 w-56 bg-theme-surface border border-theme-border rounded-xl shadow-xl py-1.5 z-50 text-left"
              >
                <div class="max-h-64 overflow-y-auto py-1">
                  <button
                    v-for="cat in catalogueCategories"
                    :key="cat"
                    type="button"
                    class="w-full text-left px-4 py-2 hover:bg-theme-accent-soft hover:text-theme-accent text-xs transition-colors cursor-pointer flex items-center justify-between"
                    :class="activeCategoryFilter === cat ? 'bg-theme-accent-soft text-theme-accent font-bold' : 'text-theme-ink font-semibold'"
                    @click="selectCatalogueCategory(cat)"
                  >
                    <span>{{ cat === 'General' ? 'All Books' : cat }}</span>
                    <Check v-if="activeCategoryFilter === cat" :size="13" class="text-theme-accent" />
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Clear Filter Button -->
          <button
            v-if="isFilterActive"
            type="button"
            class="px-3 py-2 bg-theme-surface-subtle hover:bg-theme-surface text-theme-ink text-xs font-bold rounded-lg border border-theme-border transition-colors cursor-pointer flex items-center gap-1"
            title="Show All Books"
            @click="activeCategoryFilter = 'General'; searchQuery = '';"
          >
            <X :size="13" />
            <span>Clear Filter</span>
          </button>
        </div>
      </div>

      <!-- Strict 2-Column Mobile (<768px) / 4-Column Tablet & Desktop (>=768px) Grid -->
      <div
        v-if="filteredBooks.length > 0"
        class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full"
      >
        <BookCard
          v-for="book in filteredBooks"
          :key="book.id"
          :book="book"
          @request-seed="handleRequestSeed"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="bg-theme-surface rounded-xl border border-theme-border p-12 text-center space-y-3 shadow-xs">
        <BookOpen :size="36" class="mx-auto text-theme-ink-subtle opacity-60" />
        <h3 class="font-sans font-bold text-base text-theme-ink">
          No ebooks found in this category
        </h3>
        <p class="text-xs text-theme-ink-muted max-w-xs mx-auto">
          We can source this title for you directly via our WhatsApp concierge.
        </p>
        <button
          type="button"
          class="bg-theme-accent hover:bg-theme-accent-hover text-white text-xs font-bold uppercase px-5 py-2.5 rounded-lg shadow-xs cursor-pointer transition-all active:scale-95"
          @click="handleRequestSeed(searchQuery)"
        >
          Submit Book Request
        </button>
      </div>
    </section>

    <!-- 8. Newsletter Banner -->
    <NewsletterBanner />

    <!-- 9. Trust & Delivery Benefits Strip -->
    <TrustStrip />

    <!-- 10. Store Footer (Single Source of Truth) -->
    <StoreFooter />

    <!-- Overlays -->
    <BookRequestModal
      :open="showRequestModal"
      :initial-title="modalInitialTitle"
      :initial-author="modalInitialAuthor"
      @close="showRequestModal = false"
    />

    <CartDrawer />
    <ToastContainer />
  </div>
</template>

<style scoped>
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