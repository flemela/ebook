<!-- pages/checkout/index.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
	ArrowLeft,
	ShoppingBag,
	Download,
	User,
	Phone,
	Mail,
	FileText,
	Zap,
	CheckCircle2,
	Copy,
	Check,
	ShieldCheck,
	AlertCircle,
} from "lucide-vue-next";
import TopUtilityBar from "~/components/storefront/TopUtilityBar.vue";
import BookstoreHeader from "~/components/storefront/BookstoreHeader.vue";
import ToastContainer from "~/components/ui/ToastContainer.vue";
import { useCart } from "~/composables/useCart";
import { useToast } from "~/composables/useToast";
import {
	normalizeKenyanPhone,
	isValidKenyanPhone,
	detectKenyanCarrier,
} from "~/utils/phone";

const router = useRouter();
const { items, totalItems, subtotal, clearCart } = useCart();
const { push: pushToast } = useToast();

onMounted(() => {
	if (items.value.length === 0) {
		router.replace("/");
	}
});

// Customer & Order Form State
const customerName = ref("");
const customerPhone = ref("");
const customerEmail = ref("");
const notes = ref("");
const mpesaCode = ref("");
const paymentMethod = ref<"mpesa_manual" | "mpesa">("mpesa_manual");

const STORE_TILL_NUMBER = "174379";
const isTillCopied = ref(false);

function copyTillNumber(): void {
	if (!navigator.clipboard) return;
	navigator.clipboard.writeText(STORE_TILL_NUMBER);
	isTillCopied.value = true;
	pushToast({
		message: `Till number ${STORE_TILL_NUMBER} copied!`,
		variant: "success",
	});
	setTimeout(() => (isTillCopied.value = false), 2200);
}

const isSubmitting = ref(false);
const formError = ref<string | null>(null);

const detectedCarrier = computed(() =>
	detectKenyanCarrier(customerPhone.value),
);

function formatCurrency(val: number): string {
	return `KSh ${val.toLocaleString("en-KE")}`;
}

const isFormValid = computed(() => {
	const hasName = customerName.value.trim().length > 0;
	const hasValidPhone = isValidKenyanPhone(customerPhone.value);
	const hasEmail =
		customerEmail.value.trim().length > 0 &&
		customerEmail.value.includes("@");

	if (!hasName || !hasValidPhone || !hasEmail) return false;
	if (paymentMethod.value === "mpesa_manual" && !mpesaCode.value.trim())
		return false;

	return true;
});

async function handlePlaceOrder(): Promise<void> {
	if (!isFormValid.value || isSubmitting.value) return;

	isSubmitting.value = true;
	formError.value = null;

	try {
		const cleanPhone = normalizeKenyanPhone(customerPhone.value);

		if (process.client) {
			sessionStorage.setItem("flemela_last_checkout_phone", cleanPhone);
			sessionStorage.setItem(
				"flemela_last_checkout_email",
				customerEmail.value.trim(),
			);
		}

		const payload = {
			customerName: customerName.value.trim(),
			customerPhone: cleanPhone,
			customerEmail: customerEmail.value.trim(),
			deliveryType: "delivery",
			deliveryLocation:
				"Instant Digital Download (eBook PDF)",
			paymentMethod: paymentMethod.value,
			mpesaCode:
				paymentMethod.value === "mpesa_manual"
					? mpesaCode.value.trim().toUpperCase()
					: null,
			notes: notes.value.trim() || null,
			customerLat: null,
			customerLng: null,
			items: items.value.map((i) => ({
				product_id: i.productId,
				format_id: i.formatId || null,
				quantity: 1,
				delivery_method: "digital",
			})),
		};

		const response = await $fetch<{
			success: boolean;
			orderId: string;
			checkoutRequestId?: string;
			phone: string;
		}>("/api/checkout", {
			method: "POST",
			body: payload,
		});

		clearCart();

		await router.push({
			path: "/checkout/confirm",
			query: {
				orderId: response.orderId,
				checkoutRequestId: response.checkoutRequestId || undefined,
				phone: response.phone,
			},
		});
	} catch (err: any) {
		formError.value =
			err.data?.message ||
			err.statusMessage ||
			"Checkout failed. Please try again.";
		pushToast({
			message: formError.value || "Checkout failed",
			variant: "error",
		});
	} finally {
		isSubmitting.value = false;
	}
}
</script>

<template>
	<div
		class="min-h-screen flex flex-col bg-theme-canvas text-theme-ink antialiased"
	>
		<TopUtilityBar />
		<BookstoreHeader />

		<main
			class="max-w-6xl mx-auto w-full py-8 px-4 sm:px-6 flex-1 space-y-6"
		>
			<div class="flex items-center justify-between">
				<NuxtLink
					to="/"
					class="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-muted hover:text-theme-accent transition-colors"
				>
					<ArrowLeft :size="14" /> Return to Catalog
				</NuxtLink>
				<span
					class="text-[11px] font-mono uppercase tracking-widest text-theme-muted"
					>Instant eBook Checkout</span
				>
			</div>

			<div class="grid lg:grid-cols-12 gap-8 items-start">
				<!-- Left: Form Steps -->
				<div class="lg:col-span-7 space-y-6">
					<!-- Instant Digital Delivery Banner -->
					<div
						class="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3.5 text-xs text-emerald-950 shadow-soft"
					>
						<div
							class="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs"
						>
							<Download :size="18" />
						</div>
						<div>
							<strong class="font-bold text-emerald-950 block"
								>Instant eBook Download</strong
							>
							<span class="text-emerald-800">
								Download links unlock immediately after payment and are sent straight to your email.
							</span>
						</div>
					</div>

					<!-- Step 1: Customer Details -->
					<section
						aria-labelledby="step-contact-heading"
						class="bg-theme-surface rounded-2xl shadow-soft border border-theme-border p-6 sm:p-7 space-y-5"
					>
						<div
							class="flex items-center gap-3 pb-3.5 border-b border-theme-border"
						>
							<span
								class="w-6 h-6 rounded-full bg-theme-dark text-white text-xs font-mono font-bold flex items-center justify-center shadow-xs"
								>1</span
							>
							<h2
								id="step-contact-heading"
								class="font-display text-base sm:text-lg font-bold text-theme-ink"
							>
								Reader &amp; Download Recipient
							</h2>
						</div>

						<div class="space-y-4">
							<div class="space-y-1.5">
								<label
									class="text-xs font-semibold text-theme-ink"
									>Full Name *</label
								>
								<div class="relative flex items-center">
									<User
										:size="15"
										class="absolute left-3.5 text-theme-muted pointer-events-none"
									/>
									<input
										v-model="customerName"
										type="text"
										placeholder="e.g. Amani Wanjiku"
										class="w-full pl-10 pr-3.5 py-2.5 bg-theme-surface-subtle border border-theme-border rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:border-theme-accent transition-all text-theme-ink placeholder:text-theme-muted"
										required
									/>
								</div>
							</div>

							<div class="grid sm:grid-cols-2 gap-4">
								<div class="space-y-1.5">
									<label
										class="text-xs font-semibold text-theme-ink"
										>M-Pesa Phone Number *</label
									>
									<div class="relative flex items-center">
										<Phone
											:size="15"
											class="absolute left-3.5 text-theme-muted pointer-events-none"
										/>
										<input
											v-model="customerPhone"
											type="tel"
											placeholder="07XXXXXXXX"
											class="w-full pl-10 pr-20 py-2.5 bg-theme-surface-subtle border border-theme-border rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:border-theme-accent font-mono text-theme-ink transition-all placeholder:text-theme-muted"
											required
										/>
										<span
											v-if="detectedCarrier"
											class="absolute right-2.5 text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded-md tracking-wider bg-theme-surface-muted text-theme-ink"
										>
											{{ detectedCarrier }}
										</span>
									</div>
								</div>

								<div class="space-y-1.5">
									<label
										class="text-xs font-semibold text-theme-ink"
										>Email Address (For eBook PDF Delivery)
										*</label
									>
									<div class="relative flex items-center">
										<Mail
											:size="15"
											class="absolute left-3.5 text-theme-muted pointer-events-none"
										/>
										<input
											v-model="customerEmail"
											type="email"
											placeholder="name@email.com"
											class="w-full pl-10 pr-3.5 py-2.5 bg-theme-surface-subtle border border-theme-border rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:border-theme-accent transition-all text-theme-ink placeholder:text-theme-muted"
											required
										/>
									</div>
								</div>
							</div>

							<div class="space-y-1.5 pt-1">
								<label
									class="text-xs font-semibold text-theme-ink"
									>Order Notes (Optional)</label
								>
								<div class="relative flex items-start">
									<FileText
										:size="15"
										class="absolute left-3.5 top-3 text-theme-muted pointer-events-none"
									/>
									<textarea
										v-model="notes"
										rows="2"
										placeholder="Optional message to the bookstore..."
										class="w-full pl-10 pr-3.5 py-2.5 bg-theme-surface-subtle border border-theme-border rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:border-theme-accent transition-all text-theme-ink placeholder:text-theme-muted resize-none"
									/>
								</div>
							</div>
						</div>
					</section>

					<!-- Step 2: Payment Channels -->
					<section
						aria-labelledby="step-payment-heading"
						class="bg-theme-surface rounded-2xl shadow-soft border border-theme-border p-6 sm:p-7 space-y-5"
					>
						<div
							class="flex items-center gap-3 pb-3.5 border-b border-theme-border"
						>
							<span
								class="w-6 h-6 rounded-full bg-theme-dark text-white text-xs font-mono font-bold flex items-center justify-center shadow-xs"
								>2</span
							>
							<h2
								id="step-payment-heading"
								class="font-display text-base sm:text-lg font-bold text-theme-ink"
							>
								Payment Method
							</h2>
						</div>

						<div class="space-y-3.5">
							<!-- OPTION A: DIRECT TILL -->
							<label
								class="border-2 rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 cursor-pointer transition-all relative overflow-hidden"
								:class="
									paymentMethod === 'mpesa_manual'
										? 'border-emerald-600 bg-emerald-50/50 shadow-soft ring-1 ring-emerald-600'
										: 'border-theme-border bg-theme-surface hover:border-theme-border-strong'
								"
							>
								<div class="flex items-start gap-3.5">
									<input
										type="radio"
										value="mpesa_manual"
										v-model="paymentMethod"
										class="sr-only"
									/>
									<div
										class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
										:class="
											paymentMethod === 'mpesa_manual'
												? 'bg-emerald-100 text-emerald-700'
												: 'bg-slate-100 text-slate-400'
										"
									>
										<CheckCircle2 :size="18" />
									</div>
									<div class="flex-1 min-w-0">
										<div class="flex items-center gap-2">
											<strong
												class="text-xs sm:text-sm font-bold text-theme-ink block"
												>Pay Directly to Buy Goods
												Till</strong
											>
											<span
												class="bg-emerald-700 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
											>
												Instant
											</span>
										</div>
										<p
											class="text-xs text-theme-muted mt-0.5 leading-relaxed"
										>
											Send payment to Till
											<strong class="text-theme-ink">{{
												STORE_TILL_NUMBER
											}}</strong>
											and paste the confirmation code
											below.
										</p>
									</div>
								</div>

								<div
									v-if="paymentMethod === 'mpesa_manual'"
									class="pt-3 border-t border-theme-border/80 space-y-3 pl-0 sm:pl-12"
								>
									<div
										class="bg-theme-surface rounded-xl p-3.5 border border-theme-border flex flex-wrap items-center justify-between gap-3 shadow-xs"
									>
										<div class="space-y-0.5">
											<span
												class="text-[10px] uppercase font-mono font-bold text-theme-muted tracking-widest block"
												>Lipa Na M-Pesa • Buy Goods
												Till</span
											>
											<div
												class="flex items-baseline gap-2"
											>
												<span
													class="font-mono text-lg font-bold text-theme-ink tracking-wider"
													>{{
														STORE_TILL_NUMBER
													}}</span
												>
												<span
													class="text-xs font-semibold text-theme-muted"
													>(Ebook-Reads)</span
												>
											</div>
										</div>

										<button
											type="button"
											class="px-3 py-1.5 bg-theme-surface-subtle hover:bg-theme-dark hover:text-white rounded-lg text-xs font-bold font-sans transition-colors flex items-center gap-1.5 border border-theme-border cursor-pointer shadow-2xs"
											@click="copyTillNumber"
										>
											<component
												:is="
													isTillCopied ? Check : Copy
												"
												:size="13"
												:class="
													isTillCopied
														? 'text-emerald-600'
														: 'text-theme-ink'
												"
											/>
											<span>{{
												isTillCopied
													? "Copied!"
													: "Copy Till"
											}}</span>
										</button>
									</div>

									<div class="space-y-1.5">
										<label
											class="text-xs font-bold text-theme-ink flex items-center justify-between"
										>
											<span
												>Safaricom Confirmation Code
												*</span
											>
											<span
												class="text-[10px] text-theme-muted font-normal"
												>From M-Pesa SMS</span
											>
										</label>
										<input
											v-model="mpesaCode"
											type="text"
											placeholder="e.g. SH12AB34CD"
											class="w-full px-3.5 py-2.5 bg-theme-surface border border-theme-border rounded-xl text-sm font-mono font-bold uppercase tracking-widest outline-none focus:border-theme-accent transition-all text-theme-ink placeholder:text-theme-muted"
											required
										/>
									</div>
								</div>
							</label>

							<!-- OPTION B: AUTOMATED STK PUSH -->
							<label
								class="border rounded-2xl p-4 sm:p-4.5 flex items-start gap-3.5 cursor-pointer transition-all"
								:class="
									paymentMethod === 'mpesa'
										? 'border-emerald-600 bg-emerald-50/50 shadow-soft ring-1 ring-emerald-600'
										: 'border-theme-border bg-theme-surface hover:border-theme-border-strong'
								"
							>
								<input
									type="radio"
									value="mpesa"
									v-model="paymentMethod"
									class="sr-only"
								/>
								<div
									class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
									:class="
										paymentMethod === 'mpesa'
											? 'bg-emerald-100 text-emerald-700'
											: 'bg-slate-100 text-slate-400'
									"
								>
									<Zap :size="18" />
								</div>
								<div>
									<strong
										class="text-xs sm:text-sm font-bold text-theme-ink block"
										>Automated M-Pesa STK Push</strong
									>
									<p
										class="text-xs text-theme-muted mt-0.5 leading-relaxed"
									>
										Sends an automated PIN prompt to your
										mobile phone.
									</p>
								</div>
							</label>
						</div>
					</section>
				</div>

				<!-- Right: Order Summary Sidebar -->
				<div
					class="lg:col-span-5 bg-theme-surface rounded-2xl shadow-soft border border-theme-border p-6 sm:p-7 space-y-6 sticky top-24"
				>
					<div
						class="pb-3.5 border-b border-theme-border flex justify-between items-center"
					>
						<h3
							class="font-display font-bold text-base sm:text-lg text-theme-ink"
						>
							Order Summary
						</h3>
						<span
							class="text-xs font-semibold font-mono text-theme-muted"
							>{{ totalItems }} eBook(s)</span
						>
					</div>

					<!-- Items Breakdown -->
					<div
						class="space-y-3.5 max-h-72 overflow-y-auto divide-y divide-theme-border pr-1"
					>
						<div
							v-for="item in items"
							:key="item.productId"
							class="pt-3 first:pt-0 flex gap-3.5 items-center"
						>
							<div
								class="w-12 h-16 bg-theme-surface-subtle rounded-book border border-theme-border overflow-hidden flex-shrink-0 flex items-center justify-center shadow-xs"
							>
								<img
									v-if="item.coverUrl"
									:src="item.coverUrl"
									:alt="item.title"
									class="w-full h-full object-cover"
								/>
								<ShoppingBag
									v-else
									:size="18"
									class="text-theme-muted opacity-40"
								/>
							</div>
							<div class="flex-1 min-w-0 space-y-0.5">
								<h4
									class="text-xs sm:text-sm font-bold text-theme-ink truncate"
								>
									{{ item.title }}
								</h4>
								<div
									class="flex items-center gap-2 text-[10px] text-theme-muted"
								>
									<span
										class="font-mono font-bold uppercase text-theme-accent-hover bg-theme-accent-soft px-1.5 py-0.2 rounded"
									>
										PDF eBook
									</span>
									<span>• 1 License</span>
								</div>
							</div>
							<span
								class="text-xs sm:text-sm font-bold text-theme-ink font-mono tabular-figure"
							>
								{{ formatCurrency(item.price) }}
							</span>
						</div>
					</div>

					<!-- Totals -->
					<!-- Totals -->
					<div
						class="space-y-2.5 border-t border-theme-border pt-4 text-xs"
					>
						<div
							class="flex justify-between text-theme-muted font-medium"
						>
							<span>eBooks Subtotal</span>
							<span
								class="font-semibold text-theme-ink font-mono tabular-figure"
								>{{ formatCurrency(subtotal) }}</span
							>
						</div>

						<div
							class="flex justify-between text-theme-muted font-medium"
						>
							<span>Digital Delivery Fee</span>
							<span class="text-emerald-700 font-bold font-mono">
								FREE (INSTANT)
							</span>
						</div>

						<div
							class="flex justify-between items-baseline pt-3 border-t border-theme-border text-base"
						>
							<span class="font-bold text-theme-ink font-sans"
								>Total Bill</span
							>
							<span
								class="font-display font-extrabold text-xl sm:text-2xl text-theme-ink font-mono tabular-figure"
							>
								{{ formatCurrency(subtotal) }}
							</span>
						</div>
					</div>

					<div
						v-if="formError"
						class="p-3.5 bg-theme-accent-soft border border-theme-accent-border rounded-xl text-xs text-theme-accent-hover flex items-start gap-2.5"
					>
						<AlertCircle
							:size="16"
							class="flex-shrink-0 mt-0.5 text-theme-accent"
						/>
						<span>{{ formError }}</span>
					</div>

					<button
						type="button"
						class="w-full bg-theme-accent hover:bg-theme-accent-hover active:bg-theme-accent-active text-white font-sans font-bold text-xs uppercase tracking-wider py-4 px-6 rounded-xl shadow-medium hover:shadow-high transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
						:disabled="!isFormValid || isSubmitting"
						@click="handlePlaceOrder"
					>
						<span
							v-if="isSubmitting"
							class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"
						/>
						<span v-else>
							{{
								paymentMethod === "mpesa_manual"
									? `Complete Order â€¢ ${formatCurrency(subtotal)}`
									: `Pay ${formatCurrency(subtotal)} via M-Pesa`
							}}
						</span>
					</button>

					<div
						class="flex items-center justify-center gap-2 text-[11px] text-theme-muted pt-1"
					>
						<ShieldCheck
							:size="14"
							class="text-emerald-600 flex-shrink-0"
						/>
						<span
							>Instant eBook Download Links Sent Immediately After Payment</span
						>
					</div>
				</div>
			</div>
		</main>

		<ToastContainer />
	</div>
</template>