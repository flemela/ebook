<!-- =============================================================================
     flemela/pages/admin/books/new.vue
     Add Book: Comprehensive Form with Live Cloudflare R2 Single PDF Uploader
     ============================================================================= -->

<template>
  <div class="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
    <div class="max-w-4xl mx-auto">
      
      <!-- Top Navigation Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center space-x-3">
          <NuxtLink
            to="/admin/books"
            class="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors shadow-sm"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </NuxtLink>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Add New Book</h1>
            <p class="text-xs text-gray-500 mt-0.5">Publish physical hardcopies and instant PDF eBooks to your catalog</p>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <NuxtLink
            to="/admin/books"
            class="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Cancel
          </NuxtLink>
          <button
            type="button"
            :disabled="isSubmitting"
            @click="handleSubmit"
            class="inline-flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg transition-all shadow-sm"
          >
            <svg v-if="isSubmitting" class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>{{ isSubmitting ? 'Publishing Book...' : 'Publish Book' }}</span>
          </button>
        </div>
      </div>

      <!-- Main Form Body -->
      <form @submit.prevent="handleSubmit" class="space-y-6">

        <!-- Banner Error Alert -->
        <div v-if="formError" class="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3">
          <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 class="text-xs font-bold text-red-900">Submission Blocked</h4>
            <p class="text-xs text-red-700 mt-0.5">{{ formError }}</p>
          </div>
        </div>

        <!-- Section 1: Book Essentials -->
        <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">
            Book Information
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-gray-700 mb-1.5">Book Title *</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="e.g. The Psychology of Money"
                class="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
                required
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">Author</label>
              <input
                v-model="form.author"
                type="text"
                placeholder="e.g. Morgan Housel"
                class="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">Category *</label>
              <select
                v-model="form.category_id"
                class="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
                required
              >
                <option value="" disabled>Select category</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">ISBN / SKU</label>
              <input
                v-model="form.sku"
                type="text"
                placeholder="e.g. 978-0857197689"
                class="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">Promotional Badge</label>
              <select
                v-model="form.badge"
                class="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
              >
                <option :value="null">None</option>
                <option value="BESTSELLER">Bestseller</option>
                <option value="FLASH_SALE">Flash Sale</option>
                <option value="NO1_PICK">#1 Staff Pick</option>
                <option value="DEAL_OF_WEEK">Deal of the Week</option>
              </select>
            </div>

            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-gray-700 mb-1.5">Synopsis / Description</label>
              <textarea
                v-model="form.description"
                rows="3"
                placeholder="Enter a captivating overview of the book..."
                class="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Section 2: Formats & Pricing Matrix -->
        <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
          <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">
            Formats &amp; Inventory
          </h2>

          <!-- A. Physical Hardcopy Format -->
          <div class="p-5 rounded-xl border border-gray-200 bg-gray-50/30 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2.5">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <h3 class="text-sm font-bold text-gray-900">Physical Hardcopy Edition</h3>
              </div>
              <span class="text-xs text-gray-500 font-medium">Delivered to customer doorstep</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Selling Price (KSh) *</label>
                <input
                  v-model.number="form.hardcopyPrice"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="999"
                  class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Strike-Through Price (KSh)</label>
                <input
                  v-model.number="form.hardcopyCompareAt"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Optional discount"
                  class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Initial Stock Count *</label>
                <input
                  v-model.number="form.hardcopyStock"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="10"
                  class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <!-- B. Digital PDF Format (Integrated with SinglePdfUploader) -->
          <div class="p-5 rounded-xl border border-gray-200 bg-gray-50/30 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <input
                  id="includePdf"
                  v-model="form.hasPdf"
                  type="checkbox"
                  class="w-4 h-4 text-emerald-700 border-gray-300 rounded focus:ring-emerald-700"
                />
                <label for="includePdf" class="text-sm font-bold text-gray-900 cursor-pointer">
                  Offer Digital PDF Edition (Instant Download)
                </label>
              </div>
              <span v-if="form.hasPdf" class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Cloudflare R2 Direct
              </span>
            </div>

            <!-- PDF Configuration Sub-panel -->
            <div v-if="form.hasPdf" class="space-y-4 pt-2">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">PDF eBook Price (KSh) *</label>
                  <input
                    v-model.number="form.pdfPrice"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="149"
                    class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">PDF Strike-Through Price (KSh)</label>
                  <input
                    v-model.number="form.pdfCompareAt"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Optional discount"
                    class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <!-- MOUNTED SINGLE PDF UPLOADER COMPONENT -->
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1.5">
                  Upload PDF eBook File *
                </label>
                <SinglePdfUploader
                  v-model="form.pdfKey"
                  :initial-file-name="form.pdfFileName"
                  :initial-file-size="form.pdfFileSize"
                  :max-file-size-mb="50"
                  @success="handlePdfUploadSuccess"
                  @error="handlePdfUploadError"
                  @remove="handlePdfRemove"
                />
              </div>
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
import SinglePdfUploader from '~/components/admin/SinglePdfUploader.vue';

const router = useRouter();

const isSubmitting = ref(false);
const formError = ref('');
const categories = ref<Array<{ id: string; name: string }>>([]);

const form = reactive({
  name: '',
  author: '',
  category_id: '',
  sku: '',
  badge: null as string | null,
  description: '',
  hardcopyPrice: 999,
  hardcopyCompareAt: null as number | null,
  hardcopyStock: 10,
  hasPdf: true,
  pdfPrice: 149,
  pdfCompareAt: null as number | null,
  pdfKey: null as string | null,
  pdfFileUrl: null as string | null,
  pdfFileSize: 0,
  pdfFileName: '',
});

// Load category options from BFF
onMounted(async () => {
  try {
    const res = await $fetch<{ success: boolean; data: Array<{ id: string; name: string }> }>('/api/admin/categories');
    if (res.data) {
      categories.value = res.data;
      if (categories.value.length > 0) {
        form.category_id = categories.value[0].id;
      }
    }
  } catch (e) {
    console.error('Failed to load categories', e);
  }
});

function handlePdfUploadSuccess(payload: { key: string; fileUrl: string; sizeBytes: number; fileName: string }) {
  form.pdfKey = payload.key;
  form.pdfFileUrl = payload.fileUrl;
  form.pdfFileSize = payload.sizeBytes;
  form.pdfFileName = payload.fileName;
  formError.value = '';
}

function handlePdfUploadError(err: { message: string }) {
  formError.value = `PDF upload error: ${err.message}`;
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
  if (form.hasPdf && !form.pdfKey) {
    formError.value = 'Please upload a PDF document for the digital edition or uncheck the digital option.';
    return;
  }

  isSubmitting.value = true;

  try {
    // 1. Create Base Product via BFF proxy
    const productPayload = {
      name: form.name.trim(),
      category_id: form.category_id,
      price: form.hardcopyPrice,
      compare_at_price: form.hardcopyCompareAt || null,
      sku: form.sku.trim() || null,
      badge: form.badge || null,
      description: form.author ? `By ${form.author.trim()}. ${form.description}` : form.description,
      stock: form.hardcopyStock,
      publish: true,
    };

    const createProductRes = await $fetch<{ success: boolean; data: { id: string } }>('/api/admin/products', {
      method: 'POST',
      body: productPayload,
    });

    const productId = createProductRes.data.id;

    // 2. Attach Hardcopy Format
    await $fetch(`/api/admin/products/${productId}/formats`, {
      method: 'POST',
      body: {
        format: 'hardcopy',
        price: form.hardcopyPrice,
        compare_at_price: form.hardcopyCompareAt || null,
        stock: form.hardcopyStock,
      },
    });

    // 3. Attach Digital PDF Format (if enabled and uploaded to R2)
    if (form.hasPdf && form.pdfKey) {
      await $fetch(`/api/admin/products/${productId}/formats`, {
        method: 'POST',
        body: {
          format: 'pdf',
          price: form.pdfPrice,
          compare_at_price: form.pdfCompareAt || null,
          file_url: form.pdfFileUrl || form.pdfKey,
          file_public_id: form.pdfKey,
          file_size_bytes: form.pdfFileSize,
        },
      });
    }

    // Success: navigate back to catalog table
    await router.push('/admin/books');
  } catch (err: any) {
    formError.value = err.data?.message || err.message || 'Failed to publish book. Please check inputs and retry.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>