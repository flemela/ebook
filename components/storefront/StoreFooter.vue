<!-- components/storefront/StoreFooter.vue -->
<script setup lang="ts">
import { BookOpen } from 'lucide-vue-next';
import { buildWhatsAppLink, FLEMELA_WHATSAPP_LOCAL } from '~/utils/phone';

const whatsappUrl = buildWhatsAppLink(
  'Hello EbookStore Concierge, I have an inquiry about an ebook order.'
);
</script>

<template>
  <footer class="bg-theme-dark-deep text-white pt-16 pb-10 px-4 sm:px-6 border-t border-theme-dark-border mt-auto select-none">
    <div class="max-w-7xl mx-auto space-y-12">
      
      <!-- Top Grid: Brand & Column Links -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 text-xs">
        
        <!-- Column 1: Brand & Tagline (4 Cols) -->
        <div class="md:col-span-4 space-y-4 text-left">
          <NuxtLink to="/" class="flex items-center gap-2 group">
            <div class="w-8 h-8 rounded-lg bg-theme-accent text-white flex items-center justify-center shadow-xs">
              <BookOpen :size="18" />
            </div>
            <span class="font-display font-extrabold text-xl tracking-tight text-white">
              Ebook<span class="text-theme-accent">Store</span>
            </span>
          </NuxtLink>

          <p class="text-xs text-theme-dark-muted font-medium leading-relaxed max-w-sm">
            Better books. A brighter you. Discover thousands of digital editions with instant, direct downloads.
          </p>

          <!-- Social Icon Links -->
          <div class="flex items-center gap-2.5 pt-1 text-white/80">
            <a
              href="#"
              class="w-7 h-7 rounded-full bg-white/10 hover:bg-theme-accent flex items-center justify-center transition-colors"
              aria-label="Facebook"
            >
              <span class="font-bold text-[11px]">f</span>
            </a>
            <a
              href="#"
              class="w-7 h-7 rounded-full bg-white/10 hover:bg-theme-accent flex items-center justify-center transition-colors"
              aria-label="X / Twitter"
            >
              <span class="font-bold text-[11px]">𝕏</span>
            </a>
            <a
              href="#"
              class="w-7 h-7 rounded-full bg-white/10 hover:bg-theme-accent flex items-center justify-center transition-colors"
              aria-label="Instagram"
            >
              <span class="font-bold text-[11px]">📷</span>
            </a>
            <a
              href="#"
              class="w-7 h-7 rounded-full bg-white/10 hover:bg-theme-accent flex items-center justify-center transition-colors"
              aria-label="YouTube"
            >
              <span class="font-bold text-[11px]">▶</span>
            </a>
          </div>
        </div>

        <!-- Column 2: Quick Links (3 Cols) -->
        <div class="md:col-span-3 space-y-3 text-left">
          <h5 class="font-sans font-bold text-xs uppercase text-white tracking-wider">Quick Links</h5>
          <ul class="space-y-2 text-theme-dark-muted font-medium">
            <li><NuxtLink to="/" class="hover:text-white transition-colors">Home</NuxtLink></li>
            <li><a href="#catalog-results" class="hover:text-white transition-colors">Browse</a></li>
            <li><a href="#catalog-results" class="hover:text-white transition-colors">Categories</a></li>
            <li><a href="#about-us" class="hover:text-white transition-colors">About</a></li>
            <li><a href="#contact-us" class="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>

        <!-- Column 3: Help & Support (2 Cols) -->
        <div class="md:col-span-2 space-y-3 text-left">
          <h5 class="font-sans font-bold text-xs uppercase text-white tracking-wider">Help</h5>
          <ul class="space-y-2 text-theme-dark-muted font-medium">
            <li><a :href="whatsappUrl" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">FAQs</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Shipping & Delivery</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Returns & Refunds</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Privacy Policy</a></li>
          </ul>
        </div>

        <!-- Column 4: Payment Methods & Contact (3 Cols) -->
        <div class="md:col-span-3 space-y-3 text-left">
          <h5 class="font-sans font-bold text-xs uppercase text-white tracking-wider">Payment Methods</h5>
          
          <!-- Payment Badges matching Visual Guide -->
          <div class="flex items-center gap-2 pt-0.5">
            <span class="px-2 py-1 bg-white rounded font-mono font-extrabold text-[10px] text-emerald-800 tracking-wider shadow-xs">
              M-PESA
            </span>
            <span class="px-2 py-1 bg-white rounded font-sans font-black text-[10px] text-blue-800 italic shadow-xs">
              VISA
            </span>
            <span class="px-2 py-1 bg-white rounded font-sans font-black text-[10px] text-orange-600 shadow-xs">
              MC
            </span>
          </div>

          <div class="pt-2 text-[11px] text-theme-dark-muted space-y-1">
            <p>Customer Care: <strong class="text-white">{{ FLEMELA_WHATSAPP_LOCAL }}</strong></p>
            <p>Instant digital download links delivered via email & browser.</p>
          </div>
        </div>

      </div>

      <!-- Bottom Bar: Copyright -->
      <div class="pt-8 border-t border-theme-dark-border flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-theme-dark-muted font-medium">
        <p>© 2026 EbookStore. All rights reserved.</p>
        <div class="flex gap-4">
          <a href="#" class="hover:text-white transition-colors">Terms</a>
          <a href="#" class="hover:text-white transition-colors">Privacy</a>
          <a href="#" class="hover:text-white transition-colors">Security</a>
        </div>
      </div>

    </div>
  </footer>
</template>