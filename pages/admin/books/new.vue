<!-- pages/admin/books/new.vue -->
<template>
  <div class="min-h-screen bg-theme-canvas py-8 px-4 sm:px-6 lg:px-8 font-sans text-theme-ink">
    <div class="max-w-4xl mx-auto">
      
      <!-- Top Action Bar -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center space-x-3">
          <NuxtLink
            to="/admin/books"
            class="w-9 h-9 rounded-lg bg-theme-surface border border-theme-border flex items-center justify-center text-theme-muted hover:text-theme-ink transition-colors shadow-sm"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </NuxtLink>
          <div>
            <h1 class="text-2xl font-bold text-theme-ink tracking-tight">Add New PDF eBook</h1>
            <p class="text-xs text-theme-muted mt-0.5">Upload and publish instant Cloudflare R2 digital editions</p>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <NuxtLink
            to="/admin/books"
            class="px-4 py-2 text-xs font-semibold text-theme-muted bg-theme-surface border border-theme-border rounded-lg hover:bg-theme-surface-subtle shadow-sm"
          >
            Cancel
          </NuxtLink>
          <button
            type="button"
            :disabled="isSubmitting"
            @click="handleSubmit"
            class="inline-flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-theme-accent hover:bg-theme-accent-hover active:bg-theme-accent-active disabled:opacity-50 rounded-lg shadow-sm transition-all"
          >
            <svg v-if="isSubmitting" class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>{{ isSubmitting ? 'Publishing eBook...' : 'Publish eBook' }}</span>
          </button>
        </div>
      </div>

      <!-- Main Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">

        <!-- Error Banner -->
        <div v-if="formError" class="p-4 rounded-xl bg-theme-accent-soft border border-theme-accent-border flex items-start space-x-3">
          <svg class="w-5 h-5 text-theme-accent flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 class="text-xs font-bold text-theme-accent-hover">Validation Error</h4>
            <p class="text-xs text-theme-accent mt-0.5">{{ formError }}</p>
          </div>
        </div>

        <!-- Section 1: Book Essentials -->
        <div class="bg-theme-surface rounded-2xl border border-theme-border p-6 shadow-sm space-y-5">
          <h2 class="text-sm font-bold text-theme-ink uppercase tracking-wider border-b border-theme-border pb-3">
            Book Information
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

            <div>
              <label class="block text-xs font-bold text-theme-ink mb-1.5">Category *</label>
              <select
                v-model="form.category_id"
                class="w-full px-3.5 py-2.5 bg-theme-surface-subtle border border-theme-border rounded-lg text-sm text-theme-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-theme-accent/20 focus:border-theme-accent transition-all"
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

            <div>
              <label class="block text-xs font-bold text-theme-ink mb-1.5">Promotional Badge</label>
              <select
                v-model="form.badge"
                class="w-full px-3.5 py-2.5 bg-theme-surface-subtle border border-theme-border rounded-lg text-sm text-theme-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-theme-accent/20 focus:border-theme-accent transition-all"
              >
                <option :value="null">None</option>
                <option value="BESTSELLER">Bestseller</option>
                <option value="FLASH_SALE">Flash Sale</option>
                <option value="NO1_PICK">#1 Staff Pick</option>
                <option value="DEAL_OF_WEEK">Deal of the Week</option>
              </select>
            </div>

            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-theme-ink mb-1.5">Synopsis / Description</label>
              <textarea
                v-model="form.description"
                rows="3"
                placeholder="Describe the eBook content..."
                class="w-full px-3.5 py-2.5 bg-theme-surface-subtle border border-theme-border rounded-lg text-sm text-theme-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-theme-accent/20 focus:border-theme-accent transition-all"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Section 2: Book Cover Image -->
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
            <!-- Cover Preview Box -->
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

            <!-- Upload & URL Controls -->
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

        <!-- Section 3: Digital Pricing & PDF Uploader -->
        <div class="bg-theme-surface rounded-2xl border border-theme-border p-6 shadow-sm space-y-6">
          <div class="border-b border-theme-border pb-3 flex items-center justify-between">
            <div>
              <h2 class="text-sm font-bold text-theme-ink uppercase tracking-wider">
                Digital PDF eBook Configuration
              </h2>
              <p class="text-xs text-theme-muted mt-0.5">Instant Cloudflare R2 download tokens are issued upon M-Pesa approval</p>
            </div>
            <span class="text-xs font-bold text-theme-accent bg-theme-accent-soft px-2.5 py-1 rounded-md">
              Pure Digital License
            </span>
          </div>

          <div class="p-5 rounded-xl border border-theme-border bg-theme-surface-subtle space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-theme-ink mb-1">eBook Price (KSh) *</label>
                <input
                  v-model.number="form.pdfPrice"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 bg-theme-surface border border-theme-border rounded-lg text-sm text-theme-ink font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-theme-ink mb-1">Original / Strikethrough Price (Optional)</label>
                <input
                  v-model.number="form.compareAtPrice"
                  type="number"
                  min="0"
                  placeholder="Leave empty if no discount"
                  class="w-full px-3 py-2 bg-theme-surface border border-theme-border rounded-lg text-sm text-theme-ink font-mono"
                />
              </div>
            </div>

            <!-- Single PDF Uploader -->
            <div>
              <label class="block text-xs font-semibold text-theme-ink mb-1.5">
                Upload PDF eBook Document *
              </label>
              <SinglePdfUploader
                v-model="form.pdfKey"
                :initial-file-name="form.pdfFileName"
                :initial-file-size="form.pdfFileSize"
                :max-file-size-mb="50"
                @success="handlePdfSuccess"
                @remove="handlePdfRemove"
              />
            </div>
          </div>
        </div>

      </form>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ofetch } from 'ofetch';
import SinglePdfUploader from '~/components/admin/SinglePdfUploader.vue';
import { useToast } from '~/composables/useToast';

definePageMeta({
  middleware: 'admin-auth',
});

const router = useRouter();
const { push: pushToast } = useToast();

const isSubmitting = ref(false);
const isFindingCover = ref(false);
const isUploadingCover = ref(false);
const formError = ref('');
const coverFileInputRef = ref<HTMLInputElement | null>(null);
const categories = ref<Array<{ id: string; name: string }>>([]);

const form = reactive({
  name: '',
  author: '',
  category_id: '',
  sku: '',
  badge: null as string | null,
  description: '',
  cover_image_url: '',
  pdfPrice: 149,
  compareAtPrice: null as number | null,
  pdfKey: null as string | null,
  pdfFileUrl: null as string | null,
  pdfFileSize: 0,
  pdfFileName: '',
});

onMounted(async () => {
  try {
    const raw = await ofetch<any>('/api/admin/categories');
    const list = raw?.data || raw;
    if (Array.isArray(list)) {
      categories.value = list;
      if (list.length > 0) form.category_id = list[0].id;
    }
  } catch (e) {
    console.error('Failed to load categories', e);
  }
});

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

function handlePdfSuccess(payload: { key: string; fileUrl: string; sizeBytes: number; fileName: string }) {
  form.pdfKey = payload.key;
  form.pdfFileUrl = payload.fileUrl;
  form.pdfFileSize = payload.sizeBytes;
  form.pdfFileName = payload.fileName;
  formError.value = '';
}

function handlePdfRemove() {
  form.pdfKey = null;
  form.pdfFileUrl = null;
  form.pdfFileSize = 0;
  form.pdfFileName = '';
}

async function handleSubmit() {
  formError.value = '';

  if (!form.name.trim()) {
    formError.value = 'Book title is required.';
    return;
  }
  if (!form.category_id) {
    formError.value = 'Please select a catalog category.';
    return;
  }
  if (!form.pdfKey) {
    formError.value = 'Please upload a PDF document for this eBook edition.';
    return;
  }

  isSubmitting.value = true;

  try {
    const productPayload = {
      name: form.name.trim(),
      category_id: form.category_id,
      price: form.pdfPrice,
      compare_at_price: form.compareAtPrice || null,
      sku: form.sku.trim() || null,
      badge: form.badge || null,
      description: form.author ? `By ${form.author.trim()}. ${form.description}` : form.description,
      stock: null,
      publish: true,
      images: form.cover_image_url
        ? [{ image_url: form.cover_image_url, image_public_id: 'cover_img' }]
        : [],
    };

    const createdProduct = await ofetch<any>('/api/admin/books', {
      method: 'POST',
      body: productPayload,
    });

    const productId = createdProduct?.id || createdProduct?.data?.id;

    // Attach solely the digital PDF format
    await ofetch(`/api/admin/products/${productId}/formats`, {
      method: 'POST',
      body: {
        format: 'pdf',
        price: form.pdfPrice,
        compare_at_price: form.compareAtPrice || null,
        file_url: form.pdfFileUrl || form.pdfKey,
        file_public_id: form.pdfKey,
        file_size_bytes: form.pdfFileSize,
      },
    });

    pushToast({ message: `"${form.name}" published as PDF eBook!`, variant: 'success' });
    await router.push('/admin/books');
  } catch (err: any) {
    formError.value =
      err.data?.data?.message || err.data?.message || err.message || 'Failed to publish eBook.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>