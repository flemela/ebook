<!-- components/storefront/TrustBadgeStrip.vue -->
<script setup lang="ts">
import { Download, ShieldCheck, Headphones, Lock } from 'lucide-vue-next';
</script>

<template>
  <section class="py-7 bg-theme-surface border-b border-theme-border px-4 shadow-subtle select-none">
    <div class="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-full bg-theme-accent-soft border border-theme-accent-border text-theme-accent flex-shrink-0">
          <Download :size="20" />
        </div>
        <div>
          <h4 class="text-xs font-bold uppercase text-theme-ink leading-tight">INSTANT DOWNLOAD</h4>
          <p class="text-xs font-medium text-theme-muted mt-0.5">High-speed Cloudflare R2 links</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-full bg-theme-accent-soft border border-theme-accent-border text-theme-accent flex-shrink-0">
          <ShieldCheck :size="20" />
        </div>
        <div>
          <h4 class="text-xs font-bold uppercase text-theme-ink leading-tight">AUTHENTIC PDF EBOOKS</h4>
          <p class="text-xs font-medium text-theme-muted mt-0.5">Complete publisher digital editions</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-full bg-theme-accent-soft border border-theme-accent-border text-theme-accent flex-shrink-0">
          <Headphones :size="20" />
        </div>
        <div>
          <h4 class="text-xs font-bold uppercase text-theme-ink leading-tight">READER SUPPORT</h4>
          <p class="text-xs font-medium text-theme-muted mt-0.5">WhatsApp concierge help</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-full bg-theme-accent-soft border border-theme-accent-border text-theme-accent flex-shrink-0">
          <Lock :size="20" />
        </div>
        <div>
          <h4 class="text-xs font-bold uppercase text-theme-ink leading-tight">SECURE M-PESA</h4>
          <p class="text-xs font-medium text-theme-muted mt-0.5">Direct Till &amp; STK Push</p>
        </div>
      </div>
    </div>
  </section>
</template>