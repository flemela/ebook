<!-- components/storefront/HeroCarousel.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from 'lucide-vue-next';
import type { PublicBanner } from '~/server/api/banners/index.get';

// -----------------------------------------------------------------------------
// Carousel Logic & State Machine (PRESERVED 100% UNTOUCHED)
// -----------------------------------------------------------------------------
const { data: remoteBanners } = await useFetch<PublicBanner[]>('/api/banners');
const bannersList = computed(() => remoteBanners.value || []);
const totalSlides = computed(() => bannersList.value.length);

const activeIndex = ref(0);
const isPaused = ref(false);
let autoplayTimer: ReturnType<typeof setInterval> | undefined;

const touchStartX = ref(0);
const currentTouchX = ref(0);
const isSwiping = ref(false);
const dragOffset = ref(0);

function startAutoplay(): void {
  stopAutoplay();
  if (totalSlides.value > 1 && !isPaused.value) {
    autoplayTimer = setInterval(() => {
      nextSlide();
    }, 6000);
  }
}

function stopAutoplay(): void {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = undefined;
  }
}

function resumeAutoplay(): void {
  stopAutoplay();
  if (totalSlides.value > 1 && !isPaused.value) {
    startAutoplay();
  }
}

function nextSlide(): void {
  if (totalSlides.value <= 1) return;
  activeIndex.value = (activeIndex.value + 1) % totalSlides.value;
  resumeAutoplay();
}

function prevSlide(): void {
  if (totalSlides.value <= 1) return;
  activeIndex.value = (activeIndex.value - 1 + totalSlides.value) % totalSlides.value;
  resumeAutoplay();
}

function goToSlide(index: number): void {
  if (index === activeIndex.value || totalSlides.value <= 1) return;
  activeIndex.value = index;
  resumeAutoplay();
}

function handleMouseEnter(): void {
  isPaused.value = true;
  stopAutoplay();
}

function handleMouseLeave(): void {
  isPaused.value = false;
  startAutoplay();
}

function handleTouchStart(e: TouchEvent): void {
  if (totalSlides.value <= 1) return;
  touchStartX.value = e.touches[0].clientX;
  currentTouchX.value = e.touches[0].clientX;
  isSwiping.value = true;
  dragOffset.value = 0;
  stopAutoplay();
}

function handleTouchMove(e: TouchEvent): void {
  if (!isSwiping.value) return;
  currentTouchX.value = e.touches[0].clientX;
  const diff = currentTouchX.value - touchStartX.value;
  if ((activeIndex.value === 0 && diff > 0) || (activeIndex.value === totalSlides.value - 1 && diff < 0)) {
    dragOffset.value = diff * 0.35;
  } else {
    dragOffset.value = diff;
  }
}

function handleTouchEnd(): void {
  if (!isSwiping.value) return;
  isSwiping.value = false;
  const threshold = 50;
  if (dragOffset.value < -threshold) {
    nextSlide();
  } else if (dragOffset.value > threshold) {
    prevSlide();
  }
  dragOffset.value = 0;
  resumeAutoplay();
}

const trackTransformStyle = computed(() => {
  if (isSwiping.value) {
    return {
      transform: `translate3d(calc(-${activeIndex.value * 100}% + ${dragOffset.value}px), 0, 0)`,
      transition: 'none',
    };
  }
  return {
    transform: `translate3d(-${activeIndex.value * 100}%, 0, 0)`,
    transition: 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)',
  };
});

async function handleBannerClick(banner: PublicBanner): Promise<void> {
  if (!banner.cta_link) return;
  $fetch(`/api/banners/${banner.id}/click`, { method: 'POST' }).catch(() => {});

  if (banner.cta_link.startsWith('http')) {
    window.open(banner.cta_link, '_blank', 'noopener,noreferrer');
  } else if (banner.cta_link.startsWith('#')) {
    const el = document.querySelector(banner.cta_link);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  } else {
    navigateTo(banner.cta_link);
  }
}

onMounted(() => {
  if (process.client && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    startAutoplay();
  }
});

onUnmounted(() => {
  stopAutoplay();
});
</script>

<template>
  <section
    class="relative select-none bg-theme-dark text-white overflow-hidden"
    aria-roledescription="carousel"
    aria-label="Ebook Highlights & Promotions"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Viewport with Responsive Height -->
    <div
      class="relative w-full overflow-hidden min-h-[380px] sm:min-h-[440px] lg:min-h-[480px] flex items-center"
      @touchstart.passive="handleTouchStart"
      @touchmove.passive="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- 1. Hero Showcase matching Reference Visual -->
      <div
        v-if="totalSlides === 0"
        class="w-full h-full relative py-12 px-6 sm:px-10 lg:px-16 flex items-center"
      >
        <div class="max-w-7xl mx-auto w-full grid md:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <!-- Left Content (7 Cols) -->
          <div class="md:col-span-7 space-y-4 sm:space-y-6 text-left">
            <span class="text-[11px] font-mono font-bold tracking-widest text-theme-accent uppercase block">
              READ ANYTIME, ANYWHERE
            </span>

            <h1 class="font-sans font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.08] tracking-tight">
              Discover Your Next <br />
              <span class="text-theme-accent">Great Book</span>
            </h1>

            <p class="text-sm sm:text-base text-theme-dark-muted font-normal max-w-lg leading-relaxed">
              Thousands of ebooks. Endless possibilities. Read, learn, and grow — all in one place.
            </p>

            <div class="pt-2">
              <a
                href="#catalog-results"
                class="inline-flex items-center gap-2 bg-theme-accent hover:bg-theme-accent-hover text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-6 py-3.5 rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>Browse Ebooks</span>
                <ArrowRight :size="15" />
              </a>
            </div>
          </div>

          <!-- Right Showcase: 3D Book Cover & Circular Price Tag (5 Cols) -->
          <div class="md:col-span-5 flex justify-center items-center relative">
            <div class="relative w-48 sm:w-56 aspect-[1/1.45] rounded-md overflow-hidden book-cover-3d shadow-2xl z-10 border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80"
                alt="The Midnight Library Featured Ebook"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Red Circular Price Badge matching Visual Guide -->
            <div class="absolute -top-3 right-4 sm:right-8 z-20 w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-theme-accent text-white flex flex-col items-center justify-center shadow-lg transform rotate-6 border-2 border-white">
              <span class="font-mono text-xs sm:text-sm font-black leading-tight">KSh 499</span>
              <span class="font-mono text-[9px] line-through text-white/75">KSh 999</span>
              <span class="text-[8px] font-mono font-black uppercase bg-black/25 px-1 rounded mt-0.5">50% OFF</span>
            </div>
          </div>

        </div>
      </div>

      <!-- 2. Remote Carousel Track -->
      <div
        v-else
        class="flex w-full h-full will-change-transform"
        :style="trackTransformStyle"
      >
        <div
          v-for="(banner, index) in bannersList"
          :key="banner.id"
          class="w-full flex-shrink-0 relative h-full flex items-center overflow-hidden"
          :class="{ 'cursor-pointer': Boolean(banner.cta_link) }"
          :style="{ backgroundColor: banner.bg_color || 'var(--theme-dark)' }"
          role="group"
          aria-roledescription="slide"
          :aria-label="`${index + 1} of ${totalSlides}`"
          @click="handleBannerClick(banner)"
        >
          <picture class="absolute inset-0 w-full h-full">
            <source
              v-if="banner.mobile_image_url"
              :srcset="banner.mobile_image_url"
              media="(max-width: 640px)"
            />
            <img
              :src="banner.image_url"
              :alt="banner.title || 'Promotional Banner'"
              class="w-full h-full object-cover object-center scale-100"
              loading="lazy"
              referrerpolicy="no-referrer"
            />
          </picture>

          <!-- Typography Overlay -->
          <div
            v-if="banner.title || banner.subtitle || banner.badge || banner.cta_label"
            class="absolute inset-0 z-10 flex items-center pointer-events-none px-6 sm:px-12"
          >
            <div class="max-w-xl space-y-2 pointer-events-auto">
              <div
                v-if="banner.badge"
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-theme-dark/90 border border-theme-accent text-[10px] font-mono font-bold text-theme-accent shadow-xs"
              >
                <Sparkles :size="10" />
                <span>{{ banner.badge }}</span>
              </div>

              <h2
                v-if="banner.title"
                class="font-display text-2xl sm:text-4xl font-extrabold text-white leading-tight drop-shadow-md"
              >
                {{ banner.title }}
              </h2>

              <p
                v-if="banner.subtitle"
                class="text-xs sm:text-sm text-theme-dark-muted font-medium line-clamp-2"
              >
                {{ banner.subtitle }}
              </p>

              <div v-if="banner.cta_label" class="pt-2">
                <button
                  type="button"
                  class="bg-theme-accent hover:bg-theme-accent-hover text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                  @click.stop="handleBannerClick(banner)"
                >
                  <span>{{ banner.cta_label }}</span>
                  <ArrowRight :size="13" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Arrows -->
      <div
        v-if="totalSlides > 1"
        class="absolute inset-y-0 inset-x-3 sm:inset-x-5 z-20 flex items-center justify-between pointer-events-none"
      >
        <button
          type="button"
          class="w-9 h-9 rounded-full bg-theme-dark/80 hover:bg-theme-dark text-white flex items-center justify-center pointer-events-auto backdrop-blur-xs transition-all shadow-xs active:scale-90 cursor-pointer border border-white/10"
          aria-label="Previous slide"
          @click="prevSlide"
        >
          <ChevronLeft :size="16" />
        </button>

        <button
          type="button"
          class="w-9 h-9 rounded-full bg-theme-dark/80 hover:bg-theme-dark text-white flex items-center justify-center pointer-events-auto backdrop-blur-xs transition-all shadow-xs active:scale-90 cursor-pointer border border-white/10"
          aria-label="Next slide"
          @click="nextSlide"
        >
          <ChevronRight :size="16" />
        </button>
      </div>

      <!-- Pagination Dots -->
      <div
        v-if="totalSlides > 1"
        class="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5"
      >
        <button
          v-for="(_, idx) in totalSlides"
          :key="idx"
          type="button"
          class="h-1.5 rounded-full cursor-pointer transition-all duration-300"
          :class="idx === activeIndex ? 'w-6 bg-theme-accent' : 'w-2 bg-white/40 hover:bg-white/70'"
          :aria-label="`Navigate to slide ${idx + 1}`"
          @click="goToSlide(idx)"
        />
      </div>
    </div>
  </section>
</template>