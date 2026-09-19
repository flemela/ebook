<!-- pages/admin/books/[id]/edit.vue -->
<template>
  <div class="min-h-screen bg-theme-canvas py-8 px-4 sm:px-6 lg:px-8 font-sans text-theme-ink">
    <div class="max-w-4xl mx-auto">

      <!-- Loading Skeleton -->
      <div v-if="isLoadingInitial" class="space-y-6">
        <div class="h-10 bg-theme-surface-muted rounded-lg w-1/3 animate-pulse"></div>
        <div class="h-64 bg-theme-surface rounded-2xl border border-theme-border p-6 animate-pulse"></div>
      </div>

      <div v-else>
        <!-- Top Action Bar -->
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center space-x-3">
            <NuxtLink
              to="/admin/books"
              class="w-9 h-9 rounded-lg bg-theme-surface border border-theme-border flex items-center justify-center text-theme-muted hover:text-theme-ink transition-colors shadow-sm cursor-pointer"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </NuxtLink>
            <div>
              <h1 class="text-2xl font-bold text-theme-ink tracking-tight">Edit PDF eBook</h1>
              <p class="text-xs text-theme-muted mt-0.5">Manage digital pricing, discounts, badges, categories, and Cloudflare R2 file</p>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <NuxtLink
              to="/admin/books"
              class="px-4 py-2 text-xs font-semibold text-theme-muted bg-theme-surface border border-theme-border rounded-lg hover:bg-theme-surface-subtle shadow-sm transition-colors"
            >
              Cancel
            </NuxtLink>
            <button
              type="button"
              :disabled="isSubmitting"
              @click="handleUpdate"
              class="inline-flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-theme-accent hover:bg-theme-accent-hover active:bg-theme-accent-active disabled:opacity-50 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <svg v-if="isSubmitting" class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>{{ isSubmitting ? 'Saving Changes...' : 'Save Changes' }}</span>
            </button>
          </div>
        </div>

        <form @submit.prevent="handleUpdate" class="space-y-6">

          <!-- Success Alert -->
          <div v-if="successToast" class="p-4 rounded-xl bg-theme-accent-soft border border-theme-accent-border flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-theme-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <p class="text-xs font-bold text-theme-accent-hover">{{ successToast }}</p>
            </div>
            <button type="button" @click="successToast = ''" class="text-xs text-theme-accent font-bold cursor-pointer">Dismiss</button>
          </div>

          <!-- Error Alert -->
          <div v-if="formError" class="p-4 rounded-xl bg-theme-accent-soft border border-theme-accent-border flex items-start space-x-3">
            <svg class="w-5 h-5 text-theme-accent flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 class="text-xs font-bold text-theme-accent-hover">Update Blocked</h4>
              <p class="text-xs text-theme-accent mt-0.5">{{ formError }}</p>
            </div>
          </div>

          <!-- Section 1: Book Essentials -->
          <div class="bg-theme-surface rounded-2xl border border-theme-border p-6 shadow-sm space-y-5">
            <h2 class="text-sm font-bold text-theme-ink uppercase tracking-wider border-b border-theme-border pb-3">
              Book Details
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div class="sm:col-span-2">
                <label class="block text-xs font-bold text-theme-ink mb-1.5">Book Title *</label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="e.g. The Psychology of Money"
                  class="w-full px-3.5 py-2.5 bg-theme-surface-subtle border border-theme-border rounded-lg text-sm text-theme-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-theme-accent/20 focus:border-theme-accent transition-all"
                  required
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-theme-ink mb-1.5">Author</label>
                <input
                  v-model="form.author"
                  type="text"
                  placeholder="e.g. Morgan Housel"
                  class="w-full px-3.5 py-2.5 bg-theme-surface-subtle border border-theme-border rounded-lg text-sm text-theme-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-theme-accent/20 focus:border-theme-accent transition-all"
                />
              </div>

              <!-- Category with "+ New Category" Action -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="block text-xs font-bold text-theme-ink">Category *</label>
                  <button
                    type="button"
                    class="text-[11px] font-bold text-theme-accent hover:text-theme-accent-hover hover:underline cursor-pointer flex items-center gap-1"
                    @click="isCategoryModalOpen = true"
                  >
                    <span>+ New Category</span>
                  </button>
                </div>
                <select
                  v-model="form.category_id"
                  class="w-full px-3.5 py-2.5 bg-theme-surface-subtle border border-theme-border rounded-lg text-sm text-theme-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-theme-accent/20 focus:border-theme-accent transition-all cursor-pointer"
                  required
                >
                  <option value="" disabled>Select category</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-theme-ink mb-1.5">SKU / ISBN</label>
                <input
                  v-model="form.sku"
                  type="text"
                  placeholder="e.g. 978-0857197689"
                  class="w-full px-3.5 py-2.5 bg-theme-surface-subtle border border-theme-border rounded-lg text-sm text-theme-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-theme-accent/20 focus:border-theme-accent transition-all"
                />
              </div>

              <!-- Promotional Badge (Presets or Custom Badge) -->
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-theme-ink">Promotional Badge</label>
                <div class="space-y-2">
                  <select
                    v-model="badgeSelectValue"
                    class="w-full px-3.5 py-2.5 bg-theme-surface-subtle border border-theme-border rounded-lg text-sm text-theme-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-theme-accent/20 focus:border-theme-accent transition-all cursor-pointer"
                    @change="handleBadgeSelectChange"
                  >
                    <option value="">None (Standard)</option>
                    <option value="BESTSELLER">Bestseller (BESTSELLER)</option>
                    <option value="FLASH_SALE">Flash Sale (FLASH_SALE)</option>
                    <option value="NO1_PICK">#1 Staff Pick (NO1_PICK)</option>
                    <option value="DEAL_OF_WEEK">Deal of the Week (DEAL_OF_WEEK)</option>
                    <option value="LIMITED_TIME">Limited Time (LIMITED_TIME)</option>
                    <option value="__CUSTOM__">✨ Custom Badge...</option>
                  </select>

                  <!-- Custom Badge Input -->
                  <div v-if="badgeSelectValue === '__CUSTOM__'" class="space-y-1 animate-in fade-in duration-200">
                    <input
                      v-model="form.customBadgeText"
                      type="text"
                      placeholder="Type custom badge (e.g. EDITOR'S CHOICE, 20% OFF)"
                      class="w-full px-3 py-2 bg-theme-surface border border-theme-accent rounded-lg text-xs font-mono font-bold uppercase text-theme-ink focus:outline-none focus:ring-2 focus:ring-theme-accent/20"
                      maxlength="30"
                    />
                    <p class="text-[10px] text-theme-muted">Appears as an editorial promotional badge across the digital storefront.</p>
                  </div>
                </div>
              </div>

              <div class="sm:col-span-2">
                <label class="block text-xs font-bold text-theme-ink mb-1.5">Synopsis / Description</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  placeholder="Describe the eBook content..."
                  class="w-full px-3.5 py-2.5 bg-theme-surface-subtle border border-theme-border rounded-lg text-sm text-theme-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-theme-accent/20 focus:border-theme-accent transition-all resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Section 2: Book Cover Art -->
          <div class="bg-theme-surface rounded-2xl border border-theme-border p-6 shadow-sm space-y-5">
            <div class="flex items-center justify-between border-b border-theme-border pb-3">
              <div>
                <h2 class="text-sm font-bold text-theme-ink uppercase tracking-wider">Book Cover Art</h2>
                <p class="text-xs text-theme-muted mt-0.5">High-definition publisher jacket</p>
              </div>
              <button
                type="button"
                :disabled="isFindingCover || !form.name.trim()"
                @click="handleAutoFindCover"
                class="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-theme-surface-subtle hover:bg-theme-surface-muted text-theme-ink border border-theme-border rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                <svg v-if="isFindingCover" class="animate-spin w-3.5 h-3.5 text-theme-ink" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span v-else>🔍</span>
                <span>{{ isFindingCover ? 'Searching Studio Art...' : 'Auto-Find Cover' }}</span>
              </button>
            </div>

            <div class="flex flex-col sm:flex-row items-start gap-6">
              <div class="w-32 h-44 bg-theme-surface-subtle rounded-xl border border-theme-border overflow-hidden flex-shrink-0 flex items-center justify-center relative shadow-sm">
                <img
                  v-if="form.cover_image_url"
                  :src="form.cover_image_url"
                  alt="Book cover preview"
                  class="w-full h-full object-cover"
                  @error="form.cover_image_url = ''"
                />
                <div v-else class="text-center p-3 text-theme-subtle">
                  <svg class="w-8 h-8 mx-auto mb-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span class="text-[10px] block">No Cover</span>
                </div>
              </div>

              <div class="flex-1 space-y-3 w-full">
                <div class="flex items-center gap-2">
                  <input
                    ref="coverFileInputRef"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleCoverFileSelected"
                  />
                  <button
                    type="button"
                    :disabled="isUploadingCover"
                    @click="coverFileInputRef?.click()"
                    class="px-4 py-2 bg-theme-dark hover:bg-theme-dark-surface text-white rounded-lg text-xs font-bold transition-all inline-flex items-center space-x-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <svg v-if="isUploadingCover" class="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>{{ isUploadingCover ? 'Uploading...' : 'Upload Cover Image' }}</span>
                  </button>

                  <button
                    v-if="form.cover_image_url"
                    type="button"
                    @click="form.cover_image_url = ''"
                    class="px-3 py-2 text-xs font-semibold text-theme-accent hover:bg-theme-accent-soft rounded-lg transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>

                <div class="space-y-1">
                  <label class="block text-[11px] font-semibold text-theme-muted">Or paste image URL directly:</label>
                  <input
                    v-model="form.cover_image_url"
                    type="url"
                    placeholder="https://..."
                    class="w-full px-3 py-2 bg-theme-surface-subtle border border-theme-border rounded-lg text-xs text-theme-ink focus:bg-white focus:outline-none focus:border-theme-accent font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Pure Digital Edition Management with Strikethrough Pricing -->
          <div class="bg-theme-surface rounded-2xl border border-theme-border p-6 shadow-sm space-y-6">
            <div class="flex items-center justify-between border-b border-theme-border pb-3">
              <div class="flex items-center space-x-2.5">
                <span class="w-2.5 h-2.5 rounded-full bg-theme-accent"></span>
                <h3 class="text-sm font-bold text-theme-ink uppercase tracking-wider">Digital PDF Edition</h3>
              </div>
              <span v-if="pdfFormatId" class="text-xs text-theme-accent font-bold bg-theme-accent-soft px-2 py-0.5 rounded">
                Format Active (ID: {{ pdfFormatId.slice(0, 8) }})
              </span>
            </div>

            <div class="p-5 rounded-xl border border-theme-border bg-theme-surface-subtle space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- PDF Selling Price -->
                <div>
                  <label class="block text-xs font-semibold text-theme-ink mb-1">eBook Price (KSh) *</label>
                  <input
                    v-model.number="form.pdfPrice"
                    type="number"
                    min="0"
                    placeholder="e.g. 149"
                    class="w-full px-3 py-2 bg-theme-surface border border-theme-border rounded-lg text-sm text-theme-ink font-mono font-bold"
                    required
                  />
                </div>

                <!-- PDF Strikethrough Price -->
                <div>
                  <label class="block text-xs font-semibold text-theme-ink mb-1">
                    Original Price (KSh)
                    <span class="text-[10px] text-theme-muted font-normal">Strikethrough</span>
                  </label>
                  <input
                    v-model.number="form.compareAtPrice"
                    type="number"
                    min="0"
                    placeholder="e.g. 299 (Optional discount)"
                    class="w-full px-3 py-2 bg-theme-surface border border-theme-border rounded-lg text-sm text-theme-ink font-mono"
                  />
                </div>
              </div>

              <!-- SINGLE PDF UPLOADER -->
              <div>
                <label class="block text-xs font-semibold text-theme-ink mb-1.5">
                  eBook PDF Document
                </label>
                <SinglePdfUploader
                  v-model="form.pdfKey"
                  :initial-file-name="form.pdfFileName"
                  :initial-file-size="form.pdfFileSize"
                  :max-file-size-mb="50"
                  @success="handlePdfReplaced"
                  @remove="handlePdfRemoved"
                />
              </div>

              <div v-if="isPdfDirty" class="p-3 bg-theme-surface-muted border border-theme-border rounded-lg flex items-center space-x-2">
                <svg class="w-4 h-4 text-theme-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-[11px] text-theme-ink font-medium">
                  New PDF staged in Cloudflare R2. Click <strong>Save Changes</strong> to update customer download streams.
                </p>
              </div>
            </div>
          </div>

        </form>
      </div>

      <!-- Add Category Modal -->
      <AddCategoryModal
        :open="isCategoryModalOpen"
        @close="isCategoryModalOpen = false"
        @created="handleCategoryCreated"
      />

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ofetch } from 'ofetch';
import SinglePdfUploader from '~/components/admin/SinglePdfUploader.vue';
import AddCategoryModal from '~/components/admin/AddCategoryModal.vue';
import { useToast } from '~/composables/useToast';

definePageMeta({
  middleware: 'admin-auth',
});

const route = useRoute();
const productId = route.params.id as string;
const { push: pushToast } = useToast();

const isLoadingInitial = ref(true);
const isSubmitting = ref(false);
const isFindingCover = ref(false);
const isUploadingCover = ref(false);
const isPdfDirty = ref(false);
const isCategoryModalOpen = ref(false);
const formError = ref('');
const successToast = ref('');
const coverFileInputRef = ref<HTMLInputElement | null>(null);

const categories = ref<Array<{ id: string; name: string; slug?: string }>>([]);
const pdfFormatId = ref<string | null>(null);

// Badge Selector Mode
const badgeSelectValue = ref<string>('');

const form = reactive({
  name: '',
  author: '',
  category_id: '',
  sku: '',
  badge: null as string | null,
  customBadgeText: '',
  description: '',
  cover_image_url: '',
  pdfPrice: 149,
  compareAtPrice: null as number | null,
  pdfKey: null as string | null,
  pdfFileUrl: null as string | null,
  pdfFileSize: 0,
  pdfFileName: '',
});

const STANDARD_BADGES = ['BESTSELLER', 'FLASH_SALE', 'NO1_PICK', 'DEAL_OF_WEEK', 'LIMITED_TIME'];

onMounted(async () => {
  try {
    // 1. Fetch Categories
    const catRaw = await ofetch<any>('/api/admin/categories');
    const catList = catRaw?.data || catRaw;
    if (Array.isArray(catList)) categories.value = catList;

    // 2. Fetch Book Record
    const bookRaw = await ofetch<any>(`/api/admin/books/${productId}`);
    const book = bookRaw?.data || bookRaw;

    if (!book || !book.id) {
      throw new Error('Book record could not be loaded.');
    }

    form.name = book.name || '';
    form.category_id = book.category_id || '';
    form.sku = book.sku || '';
    form.description = book.description || '';
    form.pdfPrice = Number(book.price) || 149;
    form.compareAtPrice = book.compare_at_price ? Number(book.compare_at_price) : null;

    // Badge Hydration: Preset vs Custom String
    if (book.badge) {
      if (STANDARD_BADGES.includes(book.badge)) {
        badgeSelectValue.value = book.badge;
        form.badge = book.badge;
      } else {
        badgeSelectValue.value = '__CUSTOM__';
        form.badge = book.badge;
        form.customBadgeText = book.badge;
      }
    } else {
      badgeSelectValue.value = '';
      form.badge = null;
      form.customBadgeText = '';
    }

    // Prefill author from description if prefixed "By ..."
    if (book.description && book.description.startsWith('By ')) {
      const match = book.description.match(/^By\s+([^.]+)\.\s*(.*)$/);
      if (match) {
        form.author = match[1].trim();
        form.description = match[2].trim();
      }
    } else if (book.author) {
      form.author = book.author;
    }

    // Prefill cover image
    const firstImg = book.images?.[0];
    if (typeof firstImg === 'string') {
      form.cover_image_url = firstImg;
    } else if (firstImg?.image_url) {
      form.cover_image_url = firstImg.image_url;
    } else if (book.cover_image_url) {
      form.cover_image_url = book.cover_image_url;
    }

    // Formats Hydration (Strictly digital eBook PDF/ePub format)
    const formats: any[] = book.formats || [];
    const pdf = formats.find((f) => f.format === 'pdf') || formats.find((f) => f.format === 'epub');
    if (pdf) {
      pdfFormatId.value = pdf.id;
      form.pdfPrice = Number(pdf.price) || form.pdfPrice;
      form.compareAtPrice = pdf.compare_at_price ? Number(pdf.compare_at_price) : form.compareAtPrice;
      form.pdfKey = pdf.file_public_id || pdf.file_url || null;
      form.pdfFileUrl = pdf.file_url || null;
      form.pdfFileSize = pdf.file_size_bytes ? Number(pdf.file_size_bytes) : 0;
      form.pdfFileName = pdf.file_public_id
        ? pdf.file_public_id.split('/').pop()?.replace(/^\d+-/, '') || 'eBook-edition.pdf'
        : `${book.name}.pdf`;
    }
  } catch (err: any) {
    formError.value =
      err.data?.data?.message || err.data?.message || err.message || 'Failed to load book data.';
  } finally {
    isLoadingInitial.value = false;
  }
});

function handleBadgeSelectChange() {
  if (badgeSelectValue.value === '__CUSTOM__') {
    form.badge = form.customBadgeText.trim() || null;
  } else if (badgeSelectValue.value === '') {
    form.badge = null;
    form.customBadgeText = '';
  } else {
    form.badge = badgeSelectValue.value;
  }
	}
	function handleCategoryCreated(newCat: { id: string; name: string; slug: string }) {
  if (!categories.value.some((c) => c.id === newCat.id)) {
    categories.value.push(newCat);
  }
  form.category_id = newCat.id;
}

async function handleAutoFindCover() {
  if (!form.name.trim()) {
    pushToast({ message: 'Enter a book title first to search for cover art', variant: 'info' });
    return;
  }

  isFindingCover.value = true;
  try {
    const res = await ofetch<{ coverUrl: string | null; title: string; source: string | null }>(
      `/api/admin/books/find-cover`,
      {
        query: {
          title: form.name.trim(),
          author: form.author ? form.author.trim() : undefined,
        },
      }
    );

    if (res?.coverUrl) {
      form.cover_image_url = res.coverUrl;
      pushToast({
        message: `High-res cover located (${(res.source || 'Studio').toUpperCase()})!`,
        variant: 'success',
      });
    } else {
      pushToast({ message: 'No online cover found. You can upload an image file.', variant: 'info' });
    }
  } catch {
    pushToast({ message: 'Auto-find cover search timed out. You can upload manually.', variant: 'error' });
  } finally {
    isFindingCover.value = false;
  }
}

async function handleCoverFileSelected(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  isUploadingCover.value = true;
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await ofetch<{ url: string }>('/api/admin/banners/upload', {
      method: 'POST',
      body: formData,
    });

    if (res?.url) {
      form.cover_image_url = res.url;
      pushToast({ message: 'Cover image uploaded successfully!', variant: 'success' });
    }
  } catch (err: any) {
    pushToast({ message: err.data?.message || 'Failed to upload cover image.', variant: 'error' });
  } finally {
    isUploadingCover.value = false;
    target.value = '';
  }
}

function handlePdfReplaced(payload: { key: string; fileUrl: string; sizeBytes: number; fileName: string }) {
  form.pdfKey = payload.key;
  form.pdfFileUrl = payload.fileUrl;
  form.pdfFileSize = payload.sizeBytes;
  form.pdfFileName = payload.fileName;
  isPdfDirty.value = true;
}

function handlePdfRemoved() {
  form.pdfKey = null;
  form.pdfFileUrl = null;
  form.pdfFileSize = 0;
  form.pdfFileName = '';
  isPdfDirty.value = true;
}

async function handleUpdate() {
  formError.value = '';
  successToast.value = '';

  if (!form.name.trim()) {
    formError.value = 'Book title is required.';
    return;
  }

  if (!form.category_id) {
    formError.value = 'Please select a category.';
    return;
  }

  isSubmitting.value = true;

  try {
    // Resolve final badge string
    let resolvedBadge: string | null = null;
    if (badgeSelectValue.value === '__CUSTOM__') {
      resolvedBadge = form.customBadgeText.trim() || null;
    } else if (badgeSelectValue.value) {
      resolvedBadge = badgeSelectValue.value;
    }

    // 1. Update Base Product with Strikethrough & Resolved Badge
    await ofetch(`/api/admin/books/${productId}`, {
      method: 'PATCH',
      body: {
        name: form.name.trim(),
        category_id: form.category_id,
        price: Math.max(0, Number(form.pdfPrice) || 0),
        compare_at_price: form.compareAtPrice ? Math.max(0, Number(form.compareAtPrice)) : null,
        sku: form.sku.trim() || null,
        badge: resolvedBadge,
        description: form.author ? `By ${form.author.trim()}. ${form.description}` : form.description,
        images: form.cover_image_url
          ? [{ image_url: form.cover_image_url, image_public_id: 'cover_img' }]
          : [],
      },
    });

    // 2. Update or Create Pure Digital PDF Format with Strikethrough Price
    if (pdfFormatId.value) {
      await ofetch(`/api/admin/products/${productId}/formats/${pdfFormatId.value}`, {
        method: 'PATCH',
        body: {
          price: Math.max(0, Number(form.pdfPrice) || 0),
          compare_at_price: form.compareAtPrice ? Math.max(0, Number(form.compareAtPrice)) : null,
          file_url: form.pdfFileUrl || form.pdfKey,
          file_public_id: form.pdfKey,
          file_size_bytes: form.pdfFileSize ? Number(form.pdfFileSize) : null,
        },
      });
    } else if (form.pdfKey) {
      const createdFormat = await ofetch<any>(`/api/admin/products/${productId}/formats`, {
        method: 'POST',
        body: {
          format: 'pdf',
          price: Math.max(0, Number(form.pdfPrice) || 0),
          compare_at_price: form.compareAtPrice ? Math.max(0, Number(form.compareAtPrice)) : null,
          file_url: form.pdfFileUrl || form.pdfKey,
          file_public_id: form.pdfKey,
          file_size_bytes: form.pdfFileSize ? Number(form.pdfFileSize) : null,
        },
      });
      pdfFormatId.value = createdFormat?.id || createdFormat?.data?.id;
    }

    isPdfDirty.value = false;
    successToast.value = 'eBook details, discounts, badges, cover art, and PDF file saved successfully!';
    pushToast({ message: successToast.value, variant: 'success' });
  } catch (err: any) {
    formError.value =
      err.data?.message ||
      err.data?.error?.message ||
      err.statusMessage ||
      err.message ||
      'Failed to save changes.';
    pushToast({ message: formError.value, variant: 'error' });
  } finally {
    isSubmitting.value = false;
  }
	  }
</script>