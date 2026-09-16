<!-- pages/book/[slug].vue -->
<script setup lang="ts">
import { computed } from "vue";
import {
	ArrowLeft,
	ShoppingBag,
	Download,
	BookOpen,
	CheckCircle2,
} from "lucide-vue-next";
import BookstoreHeader from "~/components/storefront/BookstoreHeader.vue";
import CartDrawer from "~/components/storefront/CartDrawer.vue";
import ToastContainer from "~/components/ui/ToastContainer.vue";
import { useCart } from "~/composables/useCart";
import { useToast } from "~/composables/useToast";
import type { Book, ProductFormat } from "~/types";

const route = useRoute();
const slug = computed<string>(() => route.params.slug as string);

const { data: book, error } = await useFetch<Book>(
	`/api/products/${slug.value}`,
);
const { addItem } = useCart();
const { push: pushToast } = useToast();

// Pure PDF format resolver: strictly defaults to digital PDF edition
const activePdfFormat = computed<ProductFormat>(() => {
	const formats = book.value?.formats || [];
	const pdf = formats.find((f) => f.format === "pdf");
	if (pdf) return pdf;

	const epub = formats.find((f) => f.format === "epub");
	if (epub) return epub;

	const defaultEbookPrice =
		book.value?.price && book.value.price < 500 ? book.value.price : 149;
	return {
		id: `pdf-${book.value?.id || "book"}`,
		product_id: book.value?.id || "book",
		format: "pdf",
		price: defaultEbookPrice,
		compare_at_price: book.value?.compare_at_price || null,
		file_url: null,
		file_public_id: null,
		file_size_bytes: null,
		stock: null,
		created_at: book.value?.created_at || "",
		updated_at: book.value?.updated_at || "",
	};
});

const activePricing = computed(() => {
	const fmt = activePdfFormat.value;
	const p = fmt.price;
	const cp = fmt.compare_at_price ?? null;

	if (cp !== null && cp !== undefined && cp > p && p > 0) {
		const diff = cp - p;
		const percentDown = Math.round((diff / cp) * 100);
		return {
			currentPrice: p,
			originalPrice: cp,
			discountPercentage: percentDown > 0 ? percentDown : 0,
		};
	}

	return {
		currentPrice: p,
		originalPrice: null,
		discountPercentage: 0,
	};
});

const primaryImage = computed<string>(() => {
	if (!book.value) return "/images/book-placeholder.svg";
	const rawImg = book.value.images?.[0];
	if (!rawImg)
		return (
			(book.value as any).cover_image_url ||
			"/images/book-placeholder.svg"
		);
	if (typeof rawImg === "string") return rawImg;
	return (
		rawImg.image_url ||
		(book.value as any).cover_image_url ||
		"/images/book-placeholder.svg"
	);
});

function formatCurrency(val: number): string {
	return `KSh ${val.toLocaleString("en-KE")}`;
}

function formatFileSize(bytes: number | null | undefined): string {
	if (!bytes) return "Cloudflare R2 Encrypted";
	const mb = bytes / (1024 * 1024);
	return `${mb.toFixed(1)} MB (PDF)`;
}

const pageTitle = computed(() => `${book.value?.name || "Book"} — Ebook-Reads`);
const pageDescription = computed(() => {
	const authorText = book.value?.author ? `by ${book.value.author}. ` : "";
	const priceText = activePricing.value.currentPrice
		? `Only KSh ${activePricing.value.currentPrice.toLocaleString("en-KE")} in Kenya. `
		: "";
	return `${book.value?.name || "Book"} ${authorText}${priceText}Instant Cloudflare R2 digital eBook PDF download at Ebook-Reads.`;
});

const canonicalUrl = computed(
	() => `https://www.thesunrisebookstore.com/book/${slug.value}`,
);

useHead(() => ({
	title: pageTitle.value,
	link: [{ rel: "canonical", href: canonicalUrl.value }],
	meta: [
		{ name: "description", content: pageDescription.value },
		{ property: "og:title", content: pageTitle.value },
		{ property: "og:description", content: pageDescription.value },
		{ property: "og:url", content: canonicalUrl.value },
		{ property: "og:type", content: "book" },
		{ property: "og:image", content: primaryImage.value },
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:title", content: pageTitle.value },
		{ name: "twitter:description", content: pageDescription.value },
		{ name: "twitter:image", content: primaryImage.value },
	],
	script: [
		{
			type: "application/ld+json",
			innerHTML: JSON.stringify({
				"@context": "https://schema.org",
				"@type": ["Book", "Product"],
				name: book.value?.name,
				image: primaryImage.value,
				description: pageDescription.value,
				sku: book.value?.sku || slug.value,
				bookFormat: "https://schema.org/EBook",
				author: book.value?.author
					? {
							"@type": "Person",
							name: book.value.author,
						}
					: undefined,
				offers: {
					"@type": "Offer",
					url: canonicalUrl.value,
					priceCurrency: "KES",
					price: activePricing.value.currentPrice || 149,
					priceValidUntil: "2027-12-31",
					itemCondition: "https://schema.org/NewCondition",
					availability: "https://schema.org/InStock",
					seller: {
						"@type": "BookStore",
						name: "Ebook-Reads",
						url: "https://www.thesunrisebookstore.com",
					},
				},
			}),
		},
	],
}));

function handleAddToCart(): void {
	if (!book.value) return;

	const fmt = activePdfFormat.value;
	const isSynthetic = !fmt.id || fmt.id.startsWith("pdf-");
	const validFormatId = isSynthetic ? "" : fmt.id;

	addItem({
		productId: book.value.id,
		formatId: validFormatId,
		title: book.value.name,
		format: "pdf",
		price: activePricing.value.currentPrice,
		compare_at_price: activePricing.value.originalPrice,
		quantity: 1,
		deliveryMethod: "digital",
		coverUrl: primaryImage.value,
		author: book.value.author,
	});

	pushToast({
		message: `Added "${book.value.name}" (PDF eBook) to cart!`,
		variant: "success",
	});
}
</script>

<template>
	<div
		class="min-h-screen flex flex-col bg-theme-canvas text-theme-ink antialiased"
	>
		<BookstoreHeader />

		<main
			class="max-w-5xl mx-auto w-full py-6 sm:py-10 px-4 sm:px-6 space-y-6 flex-1"
		>
			<NuxtLink
				to="/"
				class="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-muted hover:text-theme-accent transition-colors"
			>
				<ArrowLeft :size="13" /> Back to Catalog
			</NuxtLink>

			<div
				v-if="error || !book"
				class="bg-theme-surface rounded-2xl border border-theme-border p-12 text-center space-y-3 shadow-subtle"
			>
				<BookOpen
					:size="36"
					class="mx-auto text-theme-muted opacity-40"
				/>
				<h2 class="font-display font-bold text-lg text-theme-ink">
					Book Not Found
				</h2>
				<p class="text-xs text-theme-muted">
					The requested title may have been unlisted or moved.
				</p>
				<NuxtLink
					to="/"
					class="inline-block text-xs font-bold text-theme-accent underline pt-2"
					>Return to homepage</NuxtLink
				>
			</div>

			<!-- Main Book Viewport -->
			<div
				v-else
				class="bg-theme-surface rounded-2xl border border-theme-border p-6 sm:p-10 grid md:grid-cols-12 gap-8 lg:gap-12 shadow-card"
			>
				<!-- Cover Art Frame -->
				<div class="md:col-span-5 flex justify-center items-start">
					<div
						class="w-full max-w-[280px] sm:max-w-[320px] aspect-[3/4] bg-theme-surface-subtle rounded-xl overflow-hidden shadow-medium border border-theme-border relative"
					>
						<img
							:src="primaryImage"
							:alt="`Cover for ${book.name}`"
							class="w-full h-full object-cover"
							width="320"
							height="426"
							@error="
								($event.target as HTMLImageElement).src =
									'/images/book-placeholder.svg'
							"
						/>
						<div
							v-if="
								activePricing.discountPercentage > 0 ||
								book.badge
							"
							class="absolute top-3 left-3 z-10 flex flex-col gap-1"
						>
							<span
								v-if="activePricing.discountPercentage > 0"
								class="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-theme-accent text-white shadow-sm"
							>
								-{{ activePricing.discountPercentage }}% OFF
							</span>
							<span
								v-if="book.badge"
								class="text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-theme-dark text-white shadow-sm"
							>
								★ {{ book.badge }}
							</span>
						</div>
					</div>
				</div>

				<!-- Details -->
				<div class="md:col-span-7 space-y-5 text-left">
					<div class="space-y-1">
						<span
							class="text-[10px] uppercase font-mono font-bold tracking-widest text-theme-accent block"
						>
							{{ book.category_name || "General" }}
						</span>
						<h1
							class="font-display text-2xl sm:text-3xl font-bold text-theme-ink leading-tight"
						>
							{{ book.name }}
						</h1>
						<p class="text-xs text-theme-muted">
							By
							<strong class="text-theme-ink font-semibold">{{
								book.author || "Original Edition"
							}}</strong>
						</p>
					</div>

					<!-- Digital Format Banner -->
					<div class="pt-3 border-t border-theme-border space-y-2">
						<label
							class="text-xs font-bold uppercase text-theme-ink tracking-wider block font-sans"
						>
							Edition Format:
						</label>

						<div
							class="p-4 rounded-xl border border-theme-accent-border bg-theme-accent-soft flex items-center justify-between"
						>
							<div class="space-y-1">
								<div
									class="flex items-center gap-1.5 text-xs font-bold text-theme-accent-hover uppercase"
								>
									<Download
										:size="14"
										class="text-theme-accent"
									/>
									<span>Digital eBook (PDF Edition)</span>
								</div>
								<span
									class="text-[11px] text-theme-muted block font-mono"
								>
									{{
										formatFileSize(
											activePdfFormat.file_size_bytes,
										)
									}}
									• Instant Token Delivery
								</span>
							</div>

							<div class="text-right font-mono">
								<span
									class="text-base font-extrabold text-theme-ink block"
								>
									{{
										formatCurrency(
											activePricing.currentPrice,
										)
									}}
								</span>
								<span
									v-if="
										activePricing.originalPrice &&
										activePricing.originalPrice >
											activePricing.currentPrice
									"
									class="text-[11px] text-theme-muted line-through block"
								>
									{{
										formatCurrency(
											activePricing.originalPrice,
										)
									}}
								</span>
							</div>
						</div>
					</div>

					<!-- Purchase Action Button -->
					<div class="pt-2">
						<button
							type="button"
							class="w-full bg-theme-accent hover:bg-theme-accent-hover active:bg-theme-accent-active text-white font-sans font-bold text-xs uppercase tracking-wider py-4 px-6 rounded-xl shadow-medium hover:shadow-high transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
							@click="handleAddToCart"
						>
							<ShoppingBag :size="16" />
							<span>
								Add eBook to Cart •
								{{ formatCurrency(activePricing.currentPrice) }}
							</span>
						</button>
					</div>

					<!-- Digital Guarantee -->
					<div
						class="flex items-center gap-2 text-xs text-theme-ink pt-1"
					>
						<CheckCircle2
							:size="15"
							class="text-theme-accent flex-shrink-0"
						/>
						<span>
							Instant Cloudflare R2 download tokens &amp;
							permanent email backup issued upon M-Pesa approval.
						</span>
					</div>

					<!-- Description -->
					<div
						v-if="book.description"
						class="pt-4 border-t border-theme-border space-y-1.5 text-xs text-theme-muted leading-relaxed"
						v-html="book.description"
					/>
				</div>
			</div>
		</main>

		<CartDrawer />
		<ToastContainer />
	</div>
</template>
