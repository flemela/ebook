<!-- pages/index.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import PromoTickerStrip, {
	type PromoTickerMessage,
} from "~/components/storefront/PromoTickerStrip.vue";
import StoreNavbar from "~/components/storefront/StoreNavbar.vue";
import HeroCarousel from "~/components/storefront/HeroCarousel.vue";
import BentoCategories from "~/components/storefront/BentoCategories.vue";
import DealsWeek from "~/components/storefront/DealsWeek.vue";
import StoreFooter from "~/components/storefront/StoreFooter.vue";
import BookCard from "~/components/storefront/BookCard.vue";
import CartDrawer from "~/components/storefront/CartDrawer.vue";
import ToastContainer from "~/components/ui/ToastContainer.vue";
import BookRequestModal from "~/components/storefront/BookRequestModal.vue";
import Pagination from "~/components/ui/Pagination.vue";
import { BookOpen, ChevronDown, Check, Filter, X, Zap } from "lucide-vue-next";
import { MONTHLY_TOP_SEEDS, DEALS_SEEDS, mergeWithSeeds } from "~/data/seeds";
import type { Book } from "~/types";
import type { PaginatedProductsResponse } from "~/server/api/products/index.get";

const route = useRoute();

// Pagination & Search Reactive State
const currentPage = ref(1);
const itemsPerPage = ref(48);
const activeCategoryFilter = ref<string>("General");
const searchQuery = ref<string>("" );
const debouncedSearch = ref<string>("");
let searchTimer: ReturnType<typeof setTimeout> | undefined;

// Reactive Catalogue Query (Powered natively by backend PostgreSQL pg_trgm fuzzy matching)
const { data: catalogData, status: booksStatus } =
	await useFetch<PaginatedProductsResponse>("/api/products", {
		query: computed(() => ({
			page: currentPage.value,
			limit: itemsPerPage.value,
			category:
				activeCategoryFilter.value === "General"
					? undefined
					: activeCategoryFilter.value,
			q: debouncedSearch.value.trim()
				? debouncedSearch.value.trim()
				: undefined,
		})),
		watch: [currentPage, activeCategoryFilter, debouncedSearch],
	});

// Dedicated Showcase fetch for Bestsellers shelf
const { data: showcaseData } = await useFetch<PaginatedProductsResponse>(
	"/api/products",
	{
		query: { limit: 50 },
	},
);
const { data: storeMetadata } = await useFetch<any>("/api/stores/current");

// Server-Authoritative SEO & Schema.org JSON-LD Metadata (Targeting www.ebookreads.com)
useHead({
	title: "EbookReads — Online Bookstore & eBooks in Nairobi, Kenya",
	link: [{ rel: "canonical", href: "https://www.ebookreads.com" }],
	meta: [
		{
			name: "description",
			content:
				"Shop bestsellers, finance, business, psychology, and African literature at EbookReads, Diamond Mall, Parklands, Nairobi. Instant eBook PDF downloads across Kenya.",
		},
		{
			property: "og:title",
			content: "EbookReads — Online Bookstore & eBooks in Nairobi, Kenya",
		},
		{
			property: "og:description",
			content:
				"Shop bestsellers, finance, business, psychology, and African literature at EbookReads, Diamond Mall, Parklands, Nairobi. Instant eBook PDF downloads.",
		},
		{ property: "og:url", content: "https://www.ebookreads.com" },
		{
			property: "og:image",
			content: "https://www.ebookreads.com/images/hero-cover.jpg",
		},
		{ property: "og:type", content: "website" },
		{ name: "twitter:card", content: "summary_large_image" },
		{
			name: "twitter:title",
			content: "EbookReads — Online Bookstore & eBooks in Nairobi, Kenya",
		},
		{
			name: "twitter:description",
			content:
				"Shop bestsellers, finance, business, and literature at EbookReads. Instant eBook downloads.",
		},
		{
			name: "twitter:image",
			content: "https://www.ebookreads.com/images/hero-cover.jpg",
		},
	],
	script: [
		{
			type: "application/ld+json",
			innerHTML: JSON.stringify({
				"@context": "https://schema.org",
				"@graph": [
					{
						"@type": "BookStore",
						"@id": "https://www.ebookreads.com/#bookstore",
						name: "EbookReads",
						url: "https://www.ebookreads.com",
						logo: "https://www.ebookreads.com/images/logo.png",
						image: "https://www.ebookreads.com/images/hero-cover.jpg",
						email: "admin@ebookreads.com",
						telephone: "+254143304460",
						priceRange: "KSh 149 - KSh 4500",
						currenciesAccepted: "KES",
						address: {
							"@type": "PostalAddress",
							streetAddress:
								"Diamond Mall / Diamond Plaza, 4th Parklands Ave",
							addressLocality: "Nairobi",
							addressCountry: "KE",
						},
					},
				],
			}),
		},
	],
});

const tickerItems = computed<PromoTickerMessage[]>(
	() => storeMetadata.value?.promo_ticker || [],
);

// Server-authoritative catalogue list directly resolved from database
const displayBooks = computed<Book[]>(() => {
	return catalogData.value?.products || [];
});

const totalBooksCount = computed<number>(() => {
	return catalogData.value?.total ?? displayBooks.value.length;
});

const totalPages = computed<number>(() => {
	return catalogData.value?.totalPages ?? 1;
});

// Detects whether a typo correction/fuzzy hit was served by PostgreSQL pg_trgm
const isTypoCorrectionActive = computed<boolean>(() => {
	const q = debouncedSearch.value.trim().toLowerCase();
	if (!q || displayBooks.value.length === 0) return false;

	// If none of the top 3 books literally contain the query string in title, author, or SKU, it is a fuzzy hit
	return !displayBooks.value.slice(0, 3).some((b) => {
		const nameMatch = b.name?.toLowerCase().includes(q);
		const authorMatch = b.author?.toLowerCase().includes(q);
		const skuMatch = b.sku?.toLowerCase().includes(q);
		return Boolean(nameMatch || authorMatch || skuMatch);
	});
});

const paginationRangeText = computed<string>(() => {
	const total = totalBooksCount.value;
	if (total === 0) return "0 titles";
	const start = (currentPage.value - 1) * itemsPerPage.value + 1;
	const end = Math.min(currentPage.value * itemsPerPage.value, total);
	return `Showing ${start}–${end} of ${total.toLocaleString("en-KE")} titles`;
});

const isFilterActive = computed<boolean>(() => {
	const cat = activeCategoryFilter.value.trim().toLowerCase();
	return (
		(cat !== "general" && cat !== "all") ||
		debouncedSearch.value.trim().length > 0
	);
});


const bestsellersOfWeek = computed<Book[]>(() => {
	const list: Book[] = showcaseData.value?.products || [];
	const tagged = list.filter((b) => b.badge === "BESTSELLER" || b.badge === "DEAL_OF_WEEK");
	const combinedSeeds = [...MONTHLY_TOP_SEEDS, ...DEALS_SEEDS];
	return mergeWithSeeds(tagged, combinedSeeds, 8, list);
});
const catalogueCategories = computed<string[]>(() => {
	const set = new Set<string>();
	const allList: Book[] = showcaseData.value?.products || [];
	for (const b of allList) {
		if (
			b?.category_name &&
			b.category_name.trim() &&
			b.category_name.toLowerCase() !== "general"
		) {
			set.add(b.category_name.trim());
		}
	}
	if (set.size > 0) {
		return ["General", ...Array.from(set).sort()];
	}
	return [
		"General",
		"Business & Finance",
		"Psychology & Self-Help",
		"Self-Help",
		"Fiction & Literature",
		"Christian Books",
		"Education & Textbooks",
		"Biographies & Memoir",
	];
});

const isCatalogueDropdownOpen = ref(false);
const showRequestModal = ref(false);
const modalInitialTitle = ref("");
const modalInitialAuthor = ref("");

function handleSearch(queryText: string, category?: string): void {
	searchQuery.value = queryText;
	if (searchTimer) clearTimeout(searchTimer);
	debouncedSearch.value = queryText.trim();
	currentPage.value = 1;

	if (category && category !== "All Categories") {
		activeCategoryFilter.value = category;
	}
	scrollToSection("catalog-results");
}

function handleCategorySelect(category: string): void {
	activeCategoryFilter.value = category;
	currentPage.value = 1;
	scrollToSection("catalog-results");
}

function selectCatalogueCategory(cat: string): void {
	activeCategoryFilter.value = cat;
	currentPage.value = 1;
	isCatalogueDropdownOpen.value = false;
	scrollToSection("catalog-results");
}

function handlePageChange(newPage: number): void {
	currentPage.value = newPage;
	scrollToSection("catalog-results");
}

function clearAllFilters(): void {
	activeCategoryFilter.value = "General";
	searchQuery.value = "";
	debouncedSearch.value = "";
	currentPage.value = 1;
}

function scrollToSection(sectionId: string): void {
	if (process.client) {
		const el = document.getElementById(sectionId);
		if (el) el.scrollIntoView({ behavior: "smooth" });
	}
}

function handleRequestSeed(title?: string, author?: string): void {
	modalInitialTitle.value = title || "";
	modalInitialAuthor.value = author || "";
	showRequestModal.value = true;
}

function handleOutsideClickCatalogue(event: MouseEvent): void {
	const target = event.target as HTMLElement | null;
	if (
		target &&
		!target.closest("#catalogue-category-dropdown") &&
		!target.closest("#catalogue-category-trigger")
	) {
		isCatalogueDropdownOpen.value = false;
	}
}

onMounted(() => {
	// Deep-link query param hydration (e.g. /?q=mindset or /?category=business)
	if (route.query.q && typeof route.query.q === "string") {
		searchQuery.value = route.query.q;
		debouncedSearch.value = route.query.q.trim();
	}
	if (route.query.category && typeof route.query.category === "string") {
		activeCategoryFilter.value = route.query.category;
	}
	if (process.client) {
		window.addEventListener("click", handleOutsideClickCatalogue);
	}
});

onUnmounted(() => {
	if (process.client) {
		window.removeEventListener("click", handleOutsideClickCatalogue);
	}
	if (searchTimer) clearTimeout(searchTimer);
});
</script>

<template>
	<div
		class="min-h-screen flex flex-col bg-theme-canvas text-theme-ink antialiased"
	>
		<!-- Top Rotating Announcement Ribbon -->
		<PromoTickerStrip :messages="tickerItems" />

		<!-- Sticky Store Navbar -->
		<StoreNavbar
			@search="handleSearch"
			@select-category="handleCategorySelect"
			@request-book="() => handleRequestSeed()"
		/>

		<!-- 1. Hero Carousel -->
		<HeroCarousel
			@search="handleSearch"
			@select-category="handleCategorySelect"
		/>

		<!-- 2. Bento Categories Grid -->
		<BentoCategories @select="handleCategorySelect" />

		<!-- 3. Bestsellers of the Week (1-Row Scrollable Shelf) -->
		<DealsWeek
			:books="bestsellersOfWeek"
			@request-seed="handleRequestSeed"
		/>

		<!-- 4. Catalogue Section with Server-Authoritative Fuzzy Search -->
		<section
			id="catalog-results"
			class="pt-8 sm:pt-12 pb-14 px-4 max-w-6xl mx-auto w-full space-y-6"
		>
			<!-- Section Header -->
			<div
				class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-theme-border"
			>
				<div class="space-y-1">
					<div class="flex items-center gap-2">
						<span
							class="text-[11px] font-mono font-bold uppercase tracking-widest text-theme-accent block"
						>
							Catalogue Archive
						</span>
						<span
							class="text-xs font-mono font-bold text-theme-muted bg-theme-surface-subtle px-3 py-0.5 rounded-full border border-theme-border"
						>
							{{ paginationRangeText }}
						</span>
					</div>
					<h2
						class="font-sans font-extrabold text-2xl sm:text-3xl lg:text-4xl text-theme-ink tracking-tight leading-tight"
					>
						{{
							activeCategoryFilter.toLowerCase() === "general"
								? "Browse All Books"
								: activeCategoryFilter
						}}
					</h2>
				</div>

				<!-- Filter Dropdown & Reset Action -->
				<div class="flex items-center gap-2.5 flex-wrap">
					<div class="relative">
						<button
							id="catalogue-category-trigger"
							type="button"
							class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-theme-surface-subtle hover:bg-theme-accent-soft border border-theme-border hover:border-theme-accent text-xs font-bold text-theme-ink transition-all cursor-pointer shadow-2xs"
							:class="{
								'border-theme-accent text-theme-accent bg-theme-accent-soft':
									isCatalogueDropdownOpen,
							}"
							@click="
								isCatalogueDropdownOpen =
									!isCatalogueDropdownOpen
							"
						>
							<Filter :size="14" class="text-theme-accent" />
							<span
								>Category:
								<strong>{{
									activeCategoryFilter.toLowerCase() ===
									"general"
										? "General (All Books)"
										: activeCategoryFilter
								}}</strong></span
							>
							<ChevronDown
								:size="14"
								class="transition-transform duration-200 text-theme-muted"
								:class="{
									'rotate-180 text-theme-accent':
										isCatalogueDropdownOpen,
								}"
							/>
						</button>

						<!-- Dropdown Menu -->
						<Transition name="dropdown-fade">
							<div
								v-if="isCatalogueDropdownOpen"
								id="catalogue-category-dropdown"
								class="absolute right-0 sm:left-0 sm:right-auto mt-2 w-64 bg-theme-surface border border-theme-border rounded-2xl shadow-2xl py-2 z-50 text-left"
							>
								<div
									class="px-4 py-1.5 border-b border-theme-border flex items-center justify-between"
								>
									<span
										class="text-[10px] font-mono uppercase font-bold text-theme-muted tracking-wider"
									>
										Select Category
									</span>
									<span
										class="text-[10px] font-mono text-theme-accent font-bold"
									>
										{{ catalogueCategories.length }}
										Categories
									</span>
								</div>

								<div class="max-h-64 overflow-y-auto py-1">
									<button
										v-for="cat in catalogueCategories"
										:key="cat"
										type="button"
										class="w-full text-left px-4 py-2 hover:bg-theme-accent-soft hover:text-theme-accent-hover text-xs transition-colors cursor-pointer flex items-center justify-between"
										:class="
											activeCategoryFilter === cat
												? 'bg-theme-accent-soft text-theme-accent font-extrabold'
												: 'text-theme-ink font-semibold'
										"
										@click="selectCatalogueCategory(cat)"
									>
										<span>{{
											cat === "General"
												? "General (All Books)"
												: cat
										}}</span>
										<Check
											v-if="activeCategoryFilter === cat"
											:size="14"
											class="text-theme-accent"
										/>
									</button>
								</div>
							</div>
						</Transition>
					</div>

					<!-- Reset Filter Button -->
					<button
						v-if="isFilterActive"
						type="button"
						class="px-3.5 py-2 bg-theme-surface-subtle hover:bg-theme-surface-muted text-theme-ink text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-theme-border"
						title="Reset Search and Category Filters"
						@click="clearAllFilters"
					>
						<X :size="13" />
						<span>Clear Filters</span>
					</button>
				</div>
			</div>

			<!-- Typo-Tolerant Match Notice Banner -->
			<div
				v-if="isTypoCorrectionActive"
				class="p-3.5 bg-theme-accent-soft border border-theme-accent-border rounded-2xl flex items-center justify-between gap-3 text-xs text-theme-accent-hover"
			>
				<div class="flex items-center gap-2">
					<Zap :size="16" class="text-theme-accent flex-shrink-0" />
					<span
						>Showing closest matching eBooks for "<strong>{{
							debouncedSearch
						}}</strong
						>":</span
					>
				</div>
				<button
					type="button"
					class="text-xs font-bold underline hover:text-theme-accent-active cursor-pointer flex-shrink-0"
					@click="clearAllFilters"
				>
					View All Books
				</button>
			</div>

			<!-- SKELETON LOADING GRID -->
			<div
				v-if="booksStatus === 'pending'"
				class="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6 w-full"
			>
				<div
					v-for="n in 8"
					:key="`skel-catalog-${n}`"
					class="w-full bg-theme-surface rounded-xl p-3 border border-theme-border shadow-card flex flex-col justify-between space-y-3"
				>
					<div
						class="aspect-[1/1.37] rounded-lg bg-theme-surface-muted animate-pulse"
					/>
					<div class="space-y-1.5 pt-1">
						<div
							class="h-3.5 bg-theme-surface-muted rounded w-4/5 animate-pulse"
						/>
						<div
							class="h-2.5 bg-theme-surface-subtle rounded w-1/2 animate-pulse"
						/>
					</div>
					<div
						class="h-9 bg-theme-surface-muted rounded-xl w-full animate-pulse"
					/>
				</div>
			</div>

			<!-- REAL BOOKS GRID -->
			<div
				v-else-if="displayBooks.length > 0"
				class="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6 w-full animate-in fade-in duration-300"
			>
				<BookCard
					v-for="book in displayBooks"
					:key="book.id"
					:book="book"
					@request-seed="handleRequestSeed"
				/>
			</div>

			<!-- EMPTY STATE (With Zero-Dead-End Recovery Actions) -->
			<div
				v-else
				class="bg-theme-surface rounded-2xl border border-theme-border p-12 text-center space-y-3 shadow-sm animate-in fade-in duration-200"
			>
				<BookOpen
					:size="36"
					class="mx-auto text-theme-muted opacity-60"
				/>
				<h3 class="font-sans font-bold text-base text-theme-ink">
					No eBooks found matching "{{ debouncedSearch }}"
				</h3>
				<p class="text-xs text-theme-muted max-w-xs mx-auto">
					We can source any eBook in Kenya directly for you upon request via WhatsApp.
				</p>
				<div class="flex items-center justify-center gap-3 pt-2">
					<button
						type="button"
						class="bg-theme-surface-subtle hover:bg-theme-surface-muted text-theme-ink text-xs font-bold uppercase px-4 py-2.5 rounded-xl border border-theme-border cursor-pointer transition-all active:scale-95"
						@click="clearAllFilters"
					>
						Clear Search
					</button>
					<button
						type="button"
						class="bg-theme-accent hover:bg-theme-accent-hover active:bg-theme-accent-active text-white text-xs font-bold uppercase px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
						@click="handleRequestSeed(debouncedSearch)"
					>
						Request This eBook on WhatsApp
					</button>
				</div>
			</div>

			<!-- NUMBERED PAGINATION CONTROLS -->
			<Pagination
				:page="currentPage"
				:total-pages="totalPages"
				:disabled="booksStatus === 'pending'"
				@change="handlePageChange"
			/>
		</section>

		<!-- Footer -->
		<StoreFooter />

		<!-- Book Request Modal & Cart Drawer -->
		<BookRequestModal
			:open="showRequestModal"
			:initial-title="modalInitialTitle"
			:initial-author="modalInitialAuthor"
			@close="showRequestModal = false"
		/>

		<CartDrawer />
		<ToastContainer />
	</div>
</template>

<style scoped>
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
	transition:
		opacity 0.18s ease,
		transform 0.18s ease;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
	opacity: 0;
	transform: translateY(-6px);
}
</style>