<!-- components/storefront/PromoTickerStrip.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ChevronLeft, ChevronRight, Zap, ArrowRight } from 'lucide-vue-next';

export interface PromoTickerMessage {
  id: string;
  text: string;
  link?: string | null;
  is_active: boolean;
  sort_order: number;
}

interface Props {
  messages?: PromoTickerMessage[];
}

const props = withDefaults(defineProps<Props>(), {
  messages: () => [],
});

const fallbackMessages: PromoTickerMessage[] = [
  {
    id: 'default-1',
    text: 'Get 50% OFF on all ebooks this weekend only!',
    link: '#catalog-results',
    is_active: true,
    sort_order: 0,
  },
  {
    id: 'default-2',
    text: 'Instant PDF download delivered directly to your device upon payment',
    link: '#catalog-results',
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'default-3',
    text: 'Need a specific title? Custom book requests fulfilled on WhatsApp',
    link: 'https://wa.me/254143304460',
    is_active: true,
    sort_order: 2,
  },
];

const activeMessages = computed(() => {
  const filtered = props.messages.filter((m) => m.is_active && m.text && m.text.trim());
  if (filtered.length > 0) {
    return filtered.sort((a, b) => a.sort_order - b.sort_order);
  }
  return fallbackMessages;
});

const activeIndex = ref(0);
const isPaused = ref(false);
let rotationTimer: ReturnType<typeof setInterval> | undefined;

// Weekend Flash Sale Countdown (visual reference: 2d 14h 32m 17s)
const days = ref('02');
const hours = ref('14');
const minutes = ref('32');
const seconds = ref('17');
let countdownInterval: ReturnType<typeof setInterval> | undefined;

function updateCountdown(): void {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilSunday = (7 - dayOfWeek) % 7 || 7;
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 23, 59, 59);

  const diff = Math.max(0, target.getTime() - now.getTime());
  days.value = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
  hours.value = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
  minutes.value = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0');
  seconds.value = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
}

function nextMessage(): void {
  if (activeMessages.value.length <= 1) return;
  activeIndex.value = (activeIndex.value + 1) % activeMessages.value.length;
}

function prevMessage(): void {
  if (activeMessages.value.length <= 1) return;
  activeIndex.value = (activeIndex.value - 1 + activeMessages.value.length) % activeMessages.value.length;
}

function startTimer(): void {
  stopTimer();
  if (activeMessages.value.length > 1 && !isPaused.value) {
    rotationTimer = setInterval(nextMessage, 5000);
  }
}

function stopTimer(): void {
  if (rotationTimer) {
    clearInterval(rotationTimer);
    rotationTimer = undefined;
  }
}

function handleMessageClick(msg: PromoTickerMessage): void {
  if (!msg.link) return;
  if (msg.link.startsWith('http')) {
    window.open(msg.link, '_blank', 'noopener,noreferrer');
  } else if (msg.link.startsWith('#')) {
    const target = document.querySelector(msg.link);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  } else {
    navigateTo(msg.link);
  }
}

onMounted(() => {
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
  if (process.client && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    startTimer();
  }
});

onUnmounted(() => {
  stopTimer();
  if (countdownInterval) clearInterval(countdownInterval);
});
</script>

<template>
  <div
    class="relative w-full overflow-hidden select-none bg-theme-accent text-theme-accent-text border-b border-black/10 shadow-xs z-30 transition-colors"
    aria-label="Flash Sale Announcements"
    @mouseenter="isPaused = true; stopTimer();"
    @mouseleave="isPaused = false; startTimer();"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center justify-between gap-3 text-xs">
      
      <!-- Left: Flash Sale Tag & Carousel Navigation -->
      <div class="flex items-center gap-2.5 flex-shrink-0">
        <div class="inline-flex items-center gap-1 font-mono font-black uppercase tracking-wider text-[11px] text-white">
          <Zap :size="13" class="fill-current" />
          <span>FLASH SALE</span>
        </div>

        <span class="hidden sm:inline text-white/40">|</span>

        <!-- Manual Chevrons -->
        <div v-if="activeMessages.length > 1" class="hidden sm:flex items-center gap-1">
          <button
            type="button"
            class="w-5 h-5 rounded-full bg-black/15 hover:bg-black/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Previous announcement"
            @click="prevMessage"
          >
            <ChevronLeft :size="12" />
          </button>
          <button
            type="button"
            class="w-5 h-5 rounded-full bg-black/15 hover:bg-black/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Next announcement"
            @click="nextMessage"
          >
            <ChevronRight :size="12" />
          </button>
        </div>
      </div>

      <!-- Center: Rotating Promo Copy -->
      <div class="flex-1 min-w-0 text-center overflow-hidden py-0.5">
        <Transition name="ticker-slide" mode="out-in">
          <div
            :key="activeMessages[activeIndex]?.id"
            class="inline-flex items-center justify-center gap-2 cursor-pointer group px-2 max-w-full"
            @click="handleMessageClick(activeMessages[activeIndex])"
          >
            <span class="font-sans font-semibold text-[11px] sm:text-xs text-white truncate">
              {{ activeMessages[activeIndex]?.text }}
            </span>
          </div>
        </Transition>
      </div>

      <!-- Right: White CTA Pill & Live Timer -->
      <div class="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        <a
          href="#catalog-results"
          class="hidden md:inline-flex items-center gap-1 bg-white hover:bg-white/90 text-theme-accent font-sans font-bold text-[11px] px-3 py-1 rounded-full shadow-xs transition-all duration-150 active:scale-95"
        >
          <span>Shop Now</span>
          <ArrowRight :size="11" />
        </a>

        <!-- Live Countdown -->
        <ClientOnly>
          <div class="flex items-center gap-1 font-mono font-bold text-[11px] tracking-tight text-white/95 bg-black/20 px-2.5 py-0.5 rounded-full">
            <span>{{ days }}d</span>
            <span>{{ hours }}h</span>
            <span>{{ minutes }}m</span>
            <span>{{ seconds }}s</span>
          </div>
        </ClientOnly>
      </div>

    </div>
  </div>
</template>

<style scoped>
.ticker-slide-enter-active,
.ticker-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.ticker-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.ticker-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>