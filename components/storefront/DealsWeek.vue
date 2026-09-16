<!-- components/storefront/DealsWeek.vue -->
<script setup lang="ts">
import { ref, computed } from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import BookCard from "~/components/storefront/BookCard.vue";
import { MONTHLY_TOP_SEEDS, DEALS_SEEDS, mergeWithSeeds } from "~/data/seeds";
import type { Book } from "~/types";

interface Props {
	books: Book[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
	requestSeed: [title: string, author?: string];
}>();

const carouselRef = ref<HTMLElement | null>(null);

const bestsellerBooks = computed(() => {
	const combined = [...MONTHLY_TOP_SEEDS, ...DEALS_SEEDS];
	return mergeWithSeeds(props.books, combined, 8);
});

function scrollLeft(): void {
	carouselRef.value?.scrollBy({ left: -280, behavior: "smooth" });
}

function scrollRight(): void {
	carouselRef.value?.scrollBy({ left: 280, behavior: "smooth" });
}
</script>

<template>
	<section
		id="bestsellers-week"
		class="py-12 sm:py-14 px-4 max-w-6xl mx-auto w-full space-y-5 select-none"
	>
		<!-- Section Header: Standardized to font-sans font-extrabold text-2xl sm:text-3xl lg:text-4xl -->
		<div
			class="flex items-end justify-between border-b border-theme-border pb-3.5"
		>
			<div class="space-y-1">
				<span
					class="text-[11px] font-mono font-bold uppercase tracking-widest text-theme-accent block"
				>
					Top Reader Picks
				</span>
				<h2
					class="font-sans font-extrabold text-2xl sm:text-3xl lg:text-4xl text-theme-ink tracking-tight leading-tight"
				>
					Bestsellers of the Week
				</h2>
			</div>

			<!-- Desktop Scroll Arrows -->
			<div class="hidden sm:flex items-center gap-2">
				<button
					type="button"
					class="w-9 h-9 rounded-full bg-theme-surface border border-theme-border flex items-center justify-center text-theme-ink hover:bg-theme-surface-subtle cursor-pointer shadow-xs active:scale-95 transition-all"
					aria-label="Previous bestsellers"
					@click="scrollLeft"
				>
					<ChevronLeft :size="16" />
				</button>
				<button
					type="button"
					class="w-9 h-9 rounded-full bg-theme-accent text-white flex items-center justify-center hover:bg-theme-accent-hover active:bg-theme-accent-active cursor-pointer shadow-xs active:scale-95 transition-all"
					aria-label="Next bestsellers"
					@click="scrollRight"
				>
					<ChevronRight :size="16" />
				</button>
			</div>
		</div>

		<!-- 1-Row Smooth Scrollable Shelf -->
		<div
			ref="carouselRef"
			class="flex gap-3.5 sm:gap-5 overflow-x-auto no-scrollbar py-2 px-1"
		>
			<div
				v-for="book in bestsellerBooks"
				:key="book.id"
				class="w-[185px] sm:w-[210px] md:w-[235px] flex-shrink-0"
			>
				<BookCard
					:book="book"
					@request-seed="(t, a) => emit('requestSeed', t, a)"
				/>
			</div>
		</div>
	</section>
</template>
