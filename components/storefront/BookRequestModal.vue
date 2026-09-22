<!-- components/storefront/BookRequestModal.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue';
import { X, MessageSquare, Send, Download } from 'lucide-vue-next';
import { useToast } from '~/composables/useToast';
import { buildWhatsAppLink } from '~/utils/phone';

interface Props {
  open: boolean;
  initialTitle?: string;
  initialAuthor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  initialTitle: '',
  initialAuthor: '',
});

const emit = defineEmits<{
  close: [];
}>();

const { push: pushToast } = useToast();

const title = ref(props.initialTitle);
const author = ref(props.initialAuthor);
const customerPhone = ref('');
const isSubmitting = ref(false);

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    title.value = props.initialTitle || '';
    author.value = props.initialAuthor || '';
  }
});

function handleSubmit(): void {
  if (!title.value.trim() || !customerPhone.value.trim()) return;

  isSubmitting.value = true;

  const lines = [
    `*📚 The Sunrise Bookstore — Custom eBook (PDF) Request*`,
    `Book Title: ${title.value.trim()}`,
    author.value.trim() ? `Author: ${author.value.trim()}` : null,
    `Requested Format: DIGITAL EBOOK (PDF)`,
    `Customer Contact: ${customerPhone.value.trim()}`,
  ].filter(Boolean);

  const whatsappUrl = buildWhatsAppLink(lines.join('\n'));

  setTimeout(() => {
    isSubmitting.value = false;
    emit('close');
    pushToast({ message: 'Request submitted! Opening WhatsApp...', variant: 'success' });
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  }, 350);
}
</script>

<template>
	<Teleport to="body">
		<div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
			@click.self="emit('close')">
			<div class="bg-theme-surface rounded-2xl shadow-2xl border border-theme-border w-full max-w-lg p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200 text-theme-ink"
				role="dialog" aria-modal="true">
				<!-- Header -->
				<div class="flex items-center justify-between pb-3 border-b border-theme-border">
					<div class="flex items-center gap-2">
						<div
							class="w-8 h-8 rounded-xl bg-theme-accent-soft text-theme-accent flex items-center justify-center">
							<MessageSquare :size="16" />
						</div>
						<div>
							<h3 class="font-display font-bold text-base sm:text-lg text-theme-ink">Request eBook Title
							</h3>
							<p class="text-[11px] text-theme-muted">Our team will source this digital PDF edition and
								notify you on WhatsApp.</p>
						</div>
					</div>
					<button type="button"
						class="p-1.5 text-theme-muted hover:text-theme-ink rounded-lg transition-colors cursor-pointer"
						aria-label="Close dialog" @click="emit('close')">
						<X :size="18" />
					</button>
				</div>

				<!-- Form -->
				<form class="space-y-4" @submit.prevent="handleSubmit">
					<div class="space-y-1">
						<label class="text-xs font-semibold text-theme-ink">Book Title *</label>
						<input v-model="title" type="text" placeholder="e.g. Atomic Habits or Thinking Fast & Slow"
							class="w-full px-3.5 py-2.5 bg-theme-surface-subtle border border-theme-border rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:border-theme-accent transition-all text-theme-ink placeholder:text-theme-muted"
							required />
					</div>

					<div class="grid sm:grid-cols-2 gap-3">
						<div class="space-y-1">
							<label class="text-xs font-semibold text-theme-ink">Author Name</label>
							<input v-model="author" type="text" placeholder="e.g. James Clear"
								class="w-full px-3.5 py-2.5 bg-theme-surface-subtle border border-theme-border rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:border-theme-accent transition-all text-theme-ink placeholder:text-theme-muted" />
						</div>

						<div class="space-y-1">
							<label class="text-xs font-semibold text-theme-ink">Your WhatsApp Phone *</label>
							<input v-model="customerPhone" type="tel" placeholder="07XXXXXXXX or 01XXXXXXXX"
								class="w-full px-3.5 py-2.5 bg-theme-surface-subtle border border-theme-border rounded-xl text-xs sm:text-sm font-mono outline-none focus:bg-white focus:border-theme-accent transition-all text-theme-ink placeholder:text-theme-muted"
								required />
						</div>
					</div>

					<!-- Pure Digital Edition Notice -->
					<div
						class="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 text-xs text-emerald-950 flex items-center gap-2">
						<Download :size="14" class="text-emerald-700 flex-shrink-0" />
						<span class="text-emerald-900">Title will be prepared as an authentic digital PDF eBook with an
							instant download link.</span>
					</div>

					<div class="pt-2 flex justify-end gap-2.5">
						<button type="button"
							class="px-4 py-2 text-xs font-semibold text-theme-muted hover:text-theme-ink rounded-lg cursor-pointer"
							@click="emit('close')">
							Cancel
						</button>
						<button type="submit"
							class="bg-theme-accent hover:bg-theme-accent-hover active:bg-theme-accent-active text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
							:disabled="isSubmitting">
							<Send :size="13" />
							<span>{{ isSubmitting ? 'Submitting...' : 'Send Request via WhatsApp' }}</span>
						</button>
					</div>
				</form>
			</div>
		</div>
	</Teleport>
</template>