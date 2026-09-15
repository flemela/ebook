<!-- components/admin/AdminLayout.vue -->
<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, type Component } from 'vue';
import {
  LayoutDashboard,
  Inbox,
  BookOpen,
  PlusCircle,
  FileSpreadsheet,
  Images,
  MapPin,
  Zap,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from 'lucide-vue-next';
import ToastContainer from '~/components/ui/ToastContainer.vue';
import { useAdminAuth } from '~/composables/useAdminAuth';

const { logout } = useAdminAuth();
const route = useRoute();

const isMobileDrawerOpen = ref(false);

function closeMobileDrawer(): void {
  isMobileDrawerOpen.value = false;
}

watch(
  () => route.fullPath,
  () => {
    closeMobileDrawer();
  }
);

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape' && isMobileDrawerOpen.value) {
    closeMobileDrawer();
  }
}

onMounted(() => {
  if (process.client) {
    window.addEventListener('keydown', handleKeydown);
  }
});

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('keydown', handleKeydown);
  }
});

interface NavItem {
  label: string;
  to: string;
  icon: Component;
  exact?: boolean;
  activeMatch: (path: string) => boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Operations',
    items: [
      {
        label: 'Overview',
        to: '/admin',
        icon: LayoutDashboard,
        activeMatch: (p) => p === '/admin',
      },
      {
        label: 'Orders Desk',
        to: '/admin/orders',
        icon: Inbox,
        activeMatch: (p) => p.startsWith('/admin/orders'),
      },
    ],
  },
  {
    title: 'Catalog & Merchandising',
    items: [
      {
        label: 'Books Catalog',
        to: '/admin/books',
        icon: BookOpen,
        activeMatch: (p) => p.startsWith('/admin/books') && !p.includes('new') && !p.includes('import'),
      },
      {
        label: 'Add New Book',
        to: '/admin/books/new',
        icon: PlusCircle,
        activeMatch: (p) => p.includes('/admin/books/new'),
      },
      {
        label: 'Excel / CSV Import',
        to: '/admin/books/import',
        icon: FileSpreadsheet,
        activeMatch: (p) => p.includes('/admin/books/import'),
      },
      {
        label: 'Hero Banners',
        to: '/admin/banners',
        icon: Images,
        activeMatch: (p) => p.includes('/admin/banners'),
      },
    ],
  },
  {
    title: 'Store Settings',
    items: [
      {
        label: 'Hub & Delivery',
        to: '/admin/location',
        icon: MapPin,
        activeMatch: (p) => p.includes('/admin/location'),
      },
      {
        label: 'M-Pesa Setup',
        to: '/admin/mpesa',
        icon: Zap,
        activeMatch: (p) => p.includes('/admin/mpesa'),
      },
    ],
  },
];
</script>

<template>
  <div class="min-h-screen bg-theme-canvas text-theme-ink flex flex-col lg:flex-row antialiased">
    
    <!-- 1. MOBILE TOP BAR (< lg) -->
    <header class="lg:hidden bg-theme-dark text-white h-14 px-4 sticky top-0 z-40 border-b border-theme-dark-border flex items-center justify-between shadow-sm">
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          aria-label="Open navigation menu"
          @click="isMobileDrawerOpen = true"
        >
          <Menu :size="20" />
        </button>

        <NuxtLink to="/admin" class="flex items-center gap-2">
          <img
            src="/images/logo.png"
            alt="Logo"
            class="h-7 w-auto object-contain brightness-0 invert"
          />
          <span class="text-[9px] uppercase tracking-widest text-theme-accent font-mono font-bold pl-2 border-l border-white/15">
            Admin
          </span>
        </NuxtLink>
      </div>

      <div class="flex items-center gap-2">
        <NuxtLink
          to="/"
          target="_blank"
          class="text-xs text-white/70 hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-white/5 transition-colors"
          title="Open live storefront"
        >
          <span>Store</span>
          <ExternalLink :size="12" />
        </NuxtLink>

        <button
          type="button"
          class="p-1.5 text-theme-accent-border hover:text-white hover:bg-theme-accent/20 rounded-lg transition-colors cursor-pointer"
          title="Sign out"
          @click="logout"
        >
          <LogOut :size="16" />
        </button>
      </div>
    </header>

    <!-- 2. MOBILE SLIDE-OVER DRAWER (< lg) -->
    <Teleport to="body">
      <div
        v-if="isMobileDrawerOpen"
        class="lg:hidden fixed inset-0 z-50 flex"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          @click="closeMobileDrawer"
        />

        <aside
          class="relative w-72 max-w-[85vw] bg-theme-dark text-white h-full shadow-2xl flex flex-col z-10 border-r border-theme-dark-border animate-in slide-in-from-left duration-200"
        >
          <div class="h-14 px-4 flex items-center justify-between border-b border-theme-dark-border">
            <NuxtLink to="/admin" class="flex items-center gap-2" @click="closeMobileDrawer">
              <img
                src="/images/logo.png"
                alt="Logo"
                class="h-7 w-auto object-contain brightness-0 invert"
              />
              <span class="text-[9px] uppercase tracking-widest text-theme-accent font-mono font-bold pl-2 border-l border-white/15">
                Admin Portal
              </span>
            </NuxtLink>

            <button
              type="button"
              class="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
              aria-label="Close menu"
              @click="closeMobileDrawer"
            >
              <X :size="18" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-4 space-y-6">
            <div v-for="section in navSections" :key="section.title" class="space-y-1.5">
              <span class="text-[9px] font-mono font-bold uppercase tracking-wider text-theme-dark-muted px-3 block">
                {{ section.title }}
              </span>

              <nav class="space-y-0.5">
                <NuxtLink
                  v-for="item in section.items"
                  :key="item.to"
                  :to="item.to"
                  class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  :class="
                    item.activeMatch(route.path)
                      ? 'bg-white/15 text-white font-bold shadow-xs border-l-2 border-theme-accent'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  "
                  @click="closeMobileDrawer"
                >
                  <component :is="item.icon" :size="16" :class="item.activeMatch(route.path) ? 'text-theme-accent' : 'text-white/60'" />
                  <span>{{ item.label }}</span>
                </NuxtLink>
              </nav>
            </div>
          </div>

          <div class="p-4 border-t border-theme-dark-border space-y-2">
            <NuxtLink
              to="/"
              target="_blank"
              class="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <span class="flex items-center gap-2">
                <ExternalLink :size="15" class="text-theme-accent" />
                <span>Live Storefront</span>
              </span>
              <span class="text-[10px] font-mono text-white/40">Open ↗</span>
            </NuxtLink>

            <button
              type="button"
              class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-theme-accent-border hover:text-white hover:bg-theme-accent/20 rounded-xl transition-colors cursor-pointer"
              @click="logout"
            >
              <LogOut :size="15" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>
      </div>
    </Teleport>

    <!-- 3. DESKTOP VERTICAL SIDEBAR (lg: >= 1024px) -->
    <aside
      class="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 bg-theme-dark text-white z-30 border-r border-theme-dark-border shadow-medium"
      aria-label="Admin Sidebar Navigation"
    >
      <div class="h-16 px-6 flex items-center border-b border-theme-dark-border">
        <NuxtLink to="/admin" class="flex items-center gap-2.5 group">
          <img
            src="/images/logo.png"
            alt="Logo"
            class="h-8 w-auto object-contain brightness-0 invert transition-transform group-hover:scale-105"
          />
          <span class="text-[9px] uppercase tracking-widest text-theme-accent font-mono font-bold pl-2.5 border-l border-white/15">
            Admin Portal
          </span>
        </NuxtLink>
      </div>

      <div class="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div v-for="section in navSections" :key="section.title" class="space-y-1.5">
          <span class="text-[9px] font-mono font-bold uppercase tracking-wider text-theme-dark-muted px-3 block">
            {{ section.title }}
          </span>

          <nav class="space-y-1">
            <NuxtLink
              v-for="item in section.items"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group"
              :class="
                item.activeMatch(route.path)
                  ? 'bg-white/15 text-white font-bold shadow-xs border-l-2 border-theme-accent'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              "
            >
              <component
                :is="item.icon"
                :size="16"
                :class="item.activeMatch(route.path) ? 'text-theme-accent' : 'text-white/60 group-hover:text-white'"
              />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </nav>
        </div>
      </div>

      <div class="p-4 border-t border-theme-dark-border space-y-1.5">
        <NuxtLink
          to="/"
          target="_blank"
          class="flex items-center justify-between px-3 py-2 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
        >
          <span class="flex items-center gap-2">
            <ExternalLink :size="14" class="text-theme-accent" />
            <span>Live Storefront</span>
          </span>
          <span class="text-[10px] font-mono text-white/40">↗</span>
        </NuxtLink>

        <button
          type="button"
          class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-theme-accent-border hover:text-white hover:bg-theme-accent/20 rounded-xl transition-colors cursor-pointer"
          title="Sign out of portal"
          @click="logout"
        >
          <LogOut :size="14" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>

    <!-- 4. MAIN CONTENT CANVAS -->
    <main class="flex-1 min-w-0 lg:pl-64 flex flex-col">
      <div class="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1">
        <slot />
      </div>
    </main>

    <!-- Global Admin Toast Container -->
    <ToastContainer />
  </div>
</template>