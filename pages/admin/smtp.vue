<!-- pages/admin/smtp.vue -->
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import {
  Mail,
  Server,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Trash2,
  ArrowLeft,
} from 'lucide-vue-next';
import AdminLayout from '~/components/admin/AdminLayout.vue';
import { useToast } from '~/composables/useToast';
import type { SmtpCredentialsStatus } from '~/server/api/admin/smtp.get';

definePageMeta({
  middleware: 'admin-auth',
});

const { push: pushToast } = useToast();

const { data: smtpData, refresh } = await useFetch<SmtpCredentialsStatus | null>('/api/admin/smtp');

const form = reactive({
  smtpHost: '',
  smtpPort: 465,
  smtpSecure: true,
  smtpUser: '',
  smtpPass: '',
  fromName: 'EbookReads',
  fromEmail: 'orders@ebookreads.co.ke',
  replyTo: '',
});

const testRecipient = ref('');
const isSaving = ref(false);
const isVerifying = ref(false);
const isDeleting = ref(false);

onMounted(() => {
  if (smtpData.value) {
    form.smtpHost = smtpData.value.smtp_host || '';
    form.smtpPort = smtpData.value.smtp_port || 465;
    form.smtpSecure = smtpData.value.smtp_secure ?? true;
    form.smtpUser = smtpData.value.smtp_user || '';
    form.fromName = smtpData.value.from_name || 'EbookReads';
    form.fromEmail = smtpData.value.from_email || 'orders@ebookreads.co.ke';
    form.replyTo = smtpData.value.reply_to || '';
    testRecipient.value = smtpData.value.from_email || 'admin@ebookreads.co.ke';
  } else {
    testRecipient.value = 'admin@ebookreads.co.ke';
  }
});

const isVerified = computed(() => smtpData.value?.status === 'verified');
const isFailed = computed(() => smtpData.value?.status === 'failed');

async function handleSaveCredentials(): Promise<void> {
  if (!form.smtpHost || !form.smtpUser || !form.smtpPass || !form.fromName || !form.fromEmail) {
    pushToast({ message: 'Please fill in all required SMTP fields', variant: 'error' });
    return;
  }

  isSaving.value = true;
  try {
    await $fetch('/api/admin/smtp', {
      method: 'POST',
      body: {
        smtpHost: form.smtpHost.trim(),
        smtpPort: Number(form.smtpPort),
        smtpSecure: form.smtpSecure,
        smtpUser: form.smtpUser.trim(),
        smtpPass: form.smtpPass.trim(),
        fromName: form.fromName.trim(),
        fromEmail: form.fromEmail.trim(),
        replyTo: form.replyTo ? form.replyTo.trim() : null,
      },
    });

    await refresh();
    pushToast({
      message: 'SMTP settings saved! Now send a test email below to verify.',
      variant: 'success',
    });
  } catch (err: any) {
    pushToast({ message: err.data?.statusMessage || 'Failed to save SMTP settings', variant: 'error' });
  } finally {
    isSaving.value = false;
  }
}

async function handleVerifySmtp(): Promise<void> {
  if (!testRecipient.value.trim()) {
    pushToast({ message: 'Enter a recipient email address for the test', variant: 'error' });
    return;
  }

  isVerifying.value = true;
  try {
    const res = await $fetch<{ success: boolean; message: string }>('/api/admin/smtp/verify', {
      method: 'POST',
      body: { testRecipient: testRecipient.value.trim() },
    });

    await refresh();
    pushToast({
      message: res.message || 'SMTP verified! Test email delivered successfully.',
      variant: 'success',
    });
  } catch (err: any) {
    await refresh();
    pushToast({
      message: err.data?.statusMessage || 'SMTP connection failed. Check your server credentials.',
      variant: 'error',
    });
  } finally {
    isVerifying.value = false;
  }
}

async function handleDeleteSmtp(): Promise<void> {
  if (!confirm('Are you sure you want to remove custom SMTP settings? Store emails will revert to platform default.')) {
    return;
  }

  isDeleting.value = true;
  try {
    await $fetch('/api/admin/smtp', { method: 'DELETE' });
    form.smtpHost = '';
    form.smtpUser = '';
    form.smtpPass = '';
    form.fromName = 'EbookReads';
    form.fromEmail = 'orders@ebookreads.co.ke';
    form.replyTo = '';
    await refresh();
    pushToast({ message: 'Custom SMTP removed. Reverted to platform default mailer.', variant: 'info' });
  } catch (err: any) {
    pushToast({ message: err.data?.statusMessage || 'Failed to remove SMTP settings', variant: 'error' });
  } finally {
    isDeleting.value = false;
  }
}
</script>

<template>
  <AdminLayout>
    <div class="max-w-5xl mx-auto space-y-6">
      <!-- Back Navigation -->
      <NuxtLink to="/admin" class="inline-flex items-center gap-1.5 text-xs font-bold text-forest-900 hover:text-gold-600 transition-colors">
        <ArrowLeft :size="14" /> Back to Dashboard
      </NuxtLink>

      <!-- Header & Verification Status Badge -->
      <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-paper-border">
        <div>
          <span class="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-gold-600 font-bold block">
            Transactional Mail Pipeline
          </span>
          <h1 class="font-display text-2xl font-bold text-forest-950">Store Email (SMTP) Setup</h1>
          <p class="text-xs text-ink-muted mt-0.5">
            Connect your store domain mail server so purchase receipts and eBook download links send from your own address.
          </p>
        </div>

        <div>
          <span v-if="isVerified" class="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full shadow-xs">
            <CheckCircle2 :size="16" class="text-emerald-700" /> CUSTOM SMTP VERIFIED
          </span>
          <span v-else-if="isFailed" class="inline-flex items-center gap-1.5 bg-red-100 text-red-900 border border-red-300 text-xs font-bold px-3 py-1.5 rounded-full shadow-xs">
            <AlertTriangle :size="16" class="text-red-700" /> VERIFICATION FAILED
          </span>
          <span v-else-if="smtpData" class="inline-flex items-center gap-1.5 bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold px-3 py-1.5 rounded-full shadow-xs">
            <RefreshCw :size="14" class="text-amber-700" /> PENDING TEST VERIFICATION
          </span>
          <span v-else class="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold px-3 py-1.5 rounded-full shadow-xs">
            PLATFORM DEFAULT ACTIVE
          </span>
        </div>
      </div>

      <div class="grid lg:grid-cols-12 gap-8 items-start">
        
        <!-- LEFT COLUMN: Server Credentials & Testing (7 cols) -->
        <div class="lg:col-span-7 space-y-5">
          
          <!-- STEP 1: Mail Server Configuration -->
          <div class="bg-paper-surface rounded-2xl shadow-soft border border-paper-border p-6 space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-paper-border">
              <h2 class="font-display text-sm font-bold text-forest-950 uppercase tracking-wider flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-forest-950 text-gold-300 text-[11px] font-mono font-bold flex items-center justify-center">1</span>
                <span>Server &amp; Identity Settings</span>
              </h2>

              <button
                v-if="smtpData"
                type="button"
                class="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-semibold cursor-pointer disabled:opacity-50"
                :disabled="isDeleting"
                @click="handleDeleteSmtp"
              >
                <Trash2 :size="13" />
                <span>{{ isDeleting ? 'Removing...' : 'Remove Custom SMTP' }}</span>
              </button>
            </div>

            <form class="space-y-4" @submit.prevent="handleSaveCredentials">
              <!-- Host & Port -->
              <div class="grid sm:grid-cols-3 gap-3">
                <div class="sm:col-span-2 space-y-1">
                  <label class="text-xs font-semibold text-forest-950">SMTP Host *</label>
                  <div class="relative flex items-center">
                    <Server :size="14" class="absolute left-3 text-ink-subtle pointer-events-none" />
                    <input
                      v-model="form.smtpHost"
                      type="text"
                      placeholder="e.g. smtp.gmail.com or mail.ebookreads.co.ke"
                      class="w-full pl-8 pr-3 py-2 bg-paper-canvas/50 border border-paper-border rounded-xl text-xs font-mono outline-none focus:bg-white focus:border-forest-900"
                      required
                    />
                  </div>
                </div>

                <div class="space-y-1">
                  <label class="text-xs font-semibold text-forest-950">Port *</label>
                  <input
                    v-model.number="form.smtpPort"
                    type="number"
                    placeholder="465"
                    class="w-full px-3 py-2 bg-paper-canvas/50 border border-paper-border rounded-xl text-xs font-mono outline-none focus:bg-white focus:border-forest-900"
                    required
                  />
                </div>
              </div>

              <!-- SSL/TLS Toggle -->
              <label class="flex items-center gap-2 cursor-pointer text-xs select-none">
                <input
                  v-model="form.smtpSecure"
                  type="checkbox"
                  class="rounded border-paper-border text-forest-950 focus:ring-forest-900"
                />
                <span class="font-semibold text-forest-950">Use SSL/TLS (Default: Port 465 uses SSL; Port 587 uses STARTTLS)</span>
              </label>

              <!-- Username & Password -->
              <div class="grid sm:grid-cols-2 gap-3 pt-1">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-forest-950">SMTP Username / Email *</label>
                  <div class="relative flex items-center">
                    <User :size="14" class="absolute left-3 text-ink-subtle pointer-events-none" />
                    <input
                      v-model="form.smtpUser"
                      type="text"
                      placeholder="orders@ebookreads.co.ke"
                      class="w-full pl-8 pr-3 py-2 bg-paper-canvas/50 border border-paper-border rounded-xl text-xs font-mono outline-none focus:bg-white focus:border-forest-900"
                      required
                    />
                  </div>
                </div>

                <div class="space-y-1">
                  <label class="text-xs font-semibold text-forest-950">SMTP Password *</label>
                  <div class="relative flex items-center">
                    <Lock :size="14" class="absolute left-3 text-ink-subtle pointer-events-none" />
                    <input
                      v-model="form.smtpPass"
                      type="password"
                      placeholder="••••••••••••••••"
                      class="w-full pl-8 pr-3 py-2 bg-paper-canvas/50 border border-paper-border rounded-xl text-xs font-mono outline-none focus:bg-white focus:border-forest-900"
                      required
                    />
                  </div>
                </div>
              </div>

              <!-- Sender Identity -->
              <div class="grid sm:grid-cols-2 gap-3 pt-2 border-t border-paper-border">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-forest-950">Sender Display Name *</label>
                  <input
                    v-model="form.fromName"
                    type="text"
                    placeholder="EbookReads Bookstore"
                    class="w-full px-3 py-2 bg-paper-canvas/50 border border-paper-border rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-forest-900"
                    required
                  />
                </div>

                <div class="space-y-1">
                  <label class="text-xs font-semibold text-forest-950">Sender Email Address *</label>
                  <input
                    v-model="form.fromEmail"
                    type="email"
                    placeholder="orders@ebookreads.co.ke"
                    class="w-full px-3 py-2 bg-paper-canvas/50 border border-paper-border rounded-xl text-xs font-mono outline-none focus:bg-white focus:border-forest-900"
                    required
                  />
                </div>
              </div>

              <!-- Reply-To -->
              <div class="space-y-1">
                <label class="text-xs font-semibold text-forest-950">Reply-To Email (Optional)</label>
                <input
                  v-model="form.replyTo"
                  type="email"
                  placeholder="support@ebookreads.co.ke"
                  class="w-full px-3 py-2 bg-paper-canvas/50 border border-paper-border rounded-xl text-xs font-mono outline-none focus:bg-white focus:border-forest-900"
                />
              </div>

              <div class="pt-2 flex justify-end">
                <button
                  type="submit"
                  class="bg-forest-950 hover:bg-forest-900 text-paper text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-subtle cursor-pointer disabled:opacity-50 transition-all active:scale-[0.98]"
                  :disabled="isSaving"
                >
                  {{ isSaving ? 'Encrypting & Saving...' : 'Save Credentials' }}
                </button>
              </div>
            </form>
          </div>

          <!-- STEP 2: Live Delivery Handshake & Test -->
          <div class="bg-paper-surface rounded-2xl shadow-soft border border-paper-border p-6 space-y-4">
            <h2 class="font-display text-sm font-bold text-forest-950 uppercase tracking-wider flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-forest-950 text-gold-300 text-[11px] font-mono font-bold flex items-center justify-center">2</span>
              <span>Test Connection &amp; Verify Handshake</span>
            </h2>

            <p class="text-xs text-ink-muted leading-relaxed">
              We will execute a live SMTP handshake and dispatch a verified test receipt to your inbox. Passing this test activates your custom sender identity for all customer orders.
            </p>

            <div v-if="smtpData?.last_error" class="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle :size="15" class="flex-shrink-0 mt-0.5" />
              <span>Last error: {{ smtpData.last_error }}</span>
            </div>

            <form class="flex flex-wrap gap-2.5 items-center pt-1" @submit.prevent="handleVerifySmtp">
              <div class="relative flex-1 min-w-[220px]">
                <Mail :size="14" class="absolute left-3.5 top-3 text-ink-subtle pointer-events-none" />
                <input
                  v-model="testRecipient"
                  type="email"
                  placeholder="admin@ebookreads.co.ke"
                  class="w-full pl-9 pr-3 py-2 bg-paper-canvas/50 border border-paper-border rounded-xl text-xs font-mono outline-none focus:bg-white focus:border-forest-900"
                  :disabled="isVerifying"
                  required
                />
              </div>

              <button
                type="submit"
                class="bg-forest-950 hover:bg-forest-900 text-paper font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-subtle flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-[0.98]"
                :disabled="isVerifying || !smtpData"
                :title="!smtpData ? 'Save credentials first before verifying' : 'Send test email'"
              >
                <RefreshCw v-if="isVerifying" :size="14" class="animate-spin" />
                <Send v-else :size="13" class="text-gold-300" />
                <span>{{ isVerifying ? 'Verifying...' : 'Send Test Email' }}</span>
              </button>
            </form>
          </div>

        </div>

        <!-- RIGHT COLUMN: Provider Guides & Security Guarantee (5 cols) -->
        <div class="lg:col-span-5 bg-paper-surface rounded-2xl shadow-soft border border-paper-border p-6 space-y-4 sticky top-24">
          <div class="flex items-center gap-2 pb-3 border-b border-paper-border">
            <ShieldCheck :size="18" class="text-forest-900" />
            <h3 class="font-display font-bold text-sm text-forest-950 uppercase">Zero-Leakage Security Guarantee</h3>
          </div>

          <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <strong>AES-256-GCM Encryption:</strong>
            <p class="text-emerald-900/80 leading-normal">
              Your SMTP password is encrypted at rest using authenticated AES-256-GCM before database insertion. It is never exposed via APIs and never shared across tenant boundaries.
            </p>
          </div>

          <div class="space-y-3 pt-2">
            <h4 class="text-xs font-bold uppercase tracking-wider text-forest-950 font-mono">Popular Setup Guides:</h4>

            <div class="space-y-2.5 text-xs text-slate-700">
              <div class="p-3 bg-paper-cream/60 rounded-xl border border-paper-border space-y-1">
                <strong>Google Workspace / Gmail:</strong>
                <p class="text-[11px] text-ink-muted">Host: <code>smtp.gmail.com</code> | Port: <code>465</code> (SSL)</p>
                <p class="text-[11px] text-ink-muted">Use an <strong>App Password</strong> generated under Google Account Security, not your raw login password.</p>
              </div>

              <div class="p-3 bg-paper-cream/60 rounded-xl border border-paper-border space-y-1">
                <strong>Custom Domain (cPanel / Webmail):</strong>
                <p class="text-[11px] text-ink-muted">Host: <code>mail.yourdomain.com</code> | Port: <code>465</code></p>
                <p class="text-[11px] text-ink-muted">Use the full email address as the username.</p>
              </div>

              <div class="p-3 bg-paper-cream/60 rounded-xl border border-paper-border space-y-1">
                <strong>Transactional Relays (SES, Resend, Brevo):</strong>
                <p class="text-[11px] text-ink-muted">Host: <code>smtp-relay.brevo.com</code> | Port: <code>587</code></p>
                <p class="text-[11px] text-ink-muted">Requires domain SPF and DKIM DNS records to ensure inbox delivery.</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  </AdminLayout>
</template>