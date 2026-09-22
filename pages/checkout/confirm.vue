<!-- pages/checkout/confirm.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
	CheckCircle2,
	AlertTriangle,
	Download,
	ShoppingBag,
	ArrowRight,
	RefreshCw,
	Clock,
	MessageCircle,
	Zap,
	MailCheck,
} from "lucide-vue-next";
import TopUtilityBar from "~/components/storefront/TopUtilityBar.vue";
import BookstoreHeader from "~/components/storefront/BookstoreHeader.vue";
import ToastContainer from "~/components/ui/ToastContainer.vue";
import { useToast } from "~/composables/useToast";
import {
	normalizeKenyanPhone,
	isValidKenyanPhone,
	buildWhatsAppLink,
} from "~/utils/phone";

const route = useRoute();
const router = useRouter();
const { push: pushToast } = useToast();

const orderId = computed(() => (route.query.orderId as string) || "");
const phoneParam = computed(() => (route.query.phone as string) || "");

const savedPhone = process.client
	? sessionStorage.getItem("flemela_last_checkout_phone") || ""
	: "";
const savedEmail = process.client
	? sessionStorage.getItem("flemela_last_checkout_email") || ""
	: "";
const activePhone = ref(phoneParam.value || savedPhone);

interface DownloadItem {
	bookTitle: string;
	format: string;
	token: string;
	downloadUrl: string;
	expiresAt: string;
	maxDownloads: number;
	downloadCount: number;
}

interface OrderStatusPayload {
	orderId: string;
	customerName: string;
	customerEmail: string | null;
	total: number;
	status:
		| "pending"
		| "confirmed"
		| "assigned"
		| "out_for_delivery"
		| "delivered"
		| "cancelled";
	paymentMethod: string;
	paymentStatus: "pending" | "paid" | "failed";
	paymentReference: string | null;
	mpesaReceiptNumber: string | null;
	downloads: DownloadItem[];
}

const orderData = ref<OrderStatusPayload | null>(null);
const isCheckingStatus = ref(false);
let pollInterval: ReturnType<typeof setInterval> | undefined;

const pollAttempts = ref(0);
const MAX_POLL_ATTEMPTS = 30;

const stkCountdown = ref(60);
let countdownTimer: ReturnType<typeof setInterval> | undefined;

const showPaymentRecovery = ref(false);
const recoveryMethod = ref<"mpesa" | "mpesa_manual">("mpesa");
const recoveryPhone = ref(activePhone.value);
const recoveryMpesaCode = ref("");
const isSubmittingRecovery = ref(false);

const hasTriggeredAutoDownload = ref(false);

function formatCurrency(val: number): string {
	return `KSh ${val.toLocaleString("en-KE")}`;
}

const isDirectMpesa = computed(
	() => orderData.value?.paymentMethod === "mpesa_manual",
);
const isAutomatedSTK = computed(
	() =>
		orderData.value?.paymentMethod === "mpesa" ||
		orderData.value?.paymentMethod === "mpesa_direct",
);

const isPaymentPaid = computed(() => orderData.value?.paymentStatus === "paid");
const isPaymentFailed = computed(
	() => orderData.value?.paymentStatus === "failed",
);
const isPaymentPending = computed(
	() => orderData.value?.paymentStatus === "pending",
);

const hasDigitalDownloads = computed(() => {
	return Boolean(
		orderData.value &&
		orderData.value.downloads &&
		orderData.value.downloads.length > 0,
	);
});

const customerEmailDisplay = computed(() => {
	return orderData.value?.customerEmail || savedEmail || "your email";
});

async function fetchStatus(phoneToUse = activePhone.value): Promise<void> {
	if (!orderId.value) return;

	pollAttempts.value++;

	try {
		const data = await $fetch<OrderStatusPayload>(
			`/api/orders/${orderId.value}/status`,
			{
				query: { phone: phoneToUse || undefined },
			},
		);
		orderData.value = data;

		if (
			data.paymentStatus === "paid" &&
			data.downloads &&
			data.downloads.length > 0 &&
			!hasTriggeredAutoDownload.value
		) {
			triggerAutomaticDownload(data.downloads[0]);
		}

		if (
			data.paymentStatus === "paid" ||
			data.paymentStatus === "failed" ||
			pollAttempts.value >= MAX_POLL_ATTEMPTS
		) {
			stopTimers();
		}
	} catch {
		if (pollAttempts.value >= MAX_POLL_ATTEMPTS) {
			stopTimers();
		}
	}
}

function triggerAutomaticDownload(item: DownloadItem): void {
	if (typeof window === "undefined") return;
	hasTriggeredAutoDownload.value = true;

	const downloadUrl = `/api/books/download/${item.token}?redirect=true`;
	const link = document.createElement("a");
	link.href = downloadUrl;
	link.setAttribute("download", `${item.bookTitle}.${item.format}`);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	pushToast({
		message: `Your eBook download (${item.format.toUpperCase()}) has started automatically!`,
		variant: "success",
	});
}

function startCountdown(): void {
	stkCountdown.value = 60;
	if (countdownTimer) clearInterval(countdownTimer);
	countdownTimer = setInterval(() => {
		if (stkCountdown.value > 0) {
			stkCountdown.value--;
		} else if (countdownTimer) {
			clearInterval(countdownTimer);
		}
	}, 1000);
}

function startTimers(): void {
	stopTimers();
	if (isAutomatedSTK.value && !isPaymentPaid.value) {
		startCountdown();
	}
	if (!isPaymentPaid.value && !isPaymentFailed.value) {
		pollAttempts.value = 0;
		pollInterval = setInterval(() => fetchStatus(), 3500);
	}
}

function stopTimers(): void {
	if (pollInterval) {
		clearInterval(pollInterval);
		pollInterval = undefined;
	}
	if (countdownTimer) {
		clearInterval(countdownTimer);
		countdownTimer = undefined;
	}
}

async function handleManualCheckStatus(): Promise<void> {
	isCheckingStatus.value = true;
	try {
		await fetchStatus();
		if (orderData.value?.paymentStatus === "paid") {
			pushToast({
				message: "Payment confirmed! Digital items unlocked.",
				variant: "success",
			});
		} else if (orderData.value?.paymentStatus === "failed") {
			pushToast({
				message: "Payment was not received or failed.",
				variant: "error",
			});
		} else {
			pushToast({
				message:
					"Status is currently being verified. Please wait a moment.",
				variant: "info",
			});
		}
	} finally {
		isCheckingStatus.value = false;
	}
}

async function handleRetryOrSwitchPayment(): Promise<void> {
	if (
		recoveryMethod.value === "mpesa" &&
		!isValidKenyanPhone(recoveryPhone.value)
	) {
		pushToast({
			message:
				"Enter a valid Kenyan phone number (e.g. 07XXXXXXXX or 01XXXXXXXX)",
			variant: "error",
		});
		return;
	}

	if (
		recoveryMethod.value === "mpesa_manual" &&
		!recoveryMpesaCode.value.trim()
	) {
		pushToast({
			message: "Enter your M-Pesa transaction reference code",
			variant: "error",
		});
		return;
	}

	isSubmittingRecovery.value = true;
	try {
		const cleanPhone = normalizeKenyanPhone(recoveryPhone.value);
		await $fetch(`/api/orders/${orderId.value}/retry-payment`, {
			method: "POST",
			body: {
				paymentMethod: recoveryMethod.value,
				phone: cleanPhone,
				mpesaCode:
					recoveryMethod.value === "mpesa_manual"
						? recoveryMpesaCode.value.trim().toUpperCase()
						: null,
			},
		});

		pushToast({
			message: "Payment method updated! Initiating verification...",
			variant: "success",
		});
		showPaymentRecovery.value = false;
		activePhone.value = cleanPhone;

		await fetchStatus(cleanPhone);
		startTimers();
	} catch (err: any) {
		pushToast({
			message:
				err.data?.message ||
				err.statusMessage ||
				"Failed to update payment method",
			variant: "error",
		});
	} finally {
		isSubmittingRecovery.value = false;
	}
}

onMounted(() => {
	if (!orderId.value) {
		router.replace("/");
		return;
	}
	fetchStatus().then(() => {
		startTimers();
	});
});

onUnmounted(() => {
	stopTimers();
});

const whatsappHelpUrl = computed(() => {
	if (!orderData.value) {
		return buildWhatsAppLink(
			"Hello Ebook-Reads Concierge, I need assistance with my eBook order.",
		);
	}
	const orderRef = orderData.value.orderId.slice(0, 8).toUpperCase();
	const paymentRef = orderData.value.paymentReference
		? ` (M-Pesa Ref: ${orderData.value.paymentReference})`
		: "";
	const text = `Hello Ebook-Reads Concierge, I need assistance with eBook Order #${orderRef}${paymentRef}. Customer: ${orderData.value.customerName}.`;
	return buildWhatsAppLink(text);
});
</script>

<template>
	<div
		class="min-h-screen flex flex-col bg-theme-canvas text-theme-ink antialiased"
	>
		<TopUtilityBar />
		<BookstoreHeader />

		<main
			class="max-w-3xl mx-auto w-full py-8 sm:py-12 px-4 sm:px-6 flex-1"
		>
			<div
				class="bg-theme-surface rounded-2xl shadow-card border border-theme-border p-6 sm:p-9 space-y-7"
			>
				<!-- STATE A: PAYMENT PENDING -->
				<div v-if="isPaymentPending" class="space-y-6">
					<div
						v-if="isAutomatedSTK"
						class="bg-theme-surface-subtle border border-theme-accent-border rounded-2xl p-6 sm:p-7 space-y-4 shadow-soft"
					>
						<div class="flex items-start gap-4">
							<div
								class="relative w-11 h-11 flex items-center justify-center flex-shrink-0 mt-0.5"
							>
								<span
									class="absolute w-full h-full rounded-full bg-theme-accent/20 animate-ping"
								/>
								<div
									class="w-10 h-10 rounded-full bg-theme-accent text-white flex items-center justify-center shadow-xs"
								>
									<Zap :size="20" />
								</div>
							</div>

							<div class="space-y-1.5 flex-1">
								<div class="flex items-center justify-between">
									<span
										class="text-[10px] font-mono uppercase font-bold tracking-wider text-theme-accent"
									>
										Safaricom STK Prompt Sent
									</span>
									<span
										class="text-xs font-mono font-bold text-theme-ink bg-theme-surface px-2 py-0.5 rounded border border-theme-border"
									>
										{{ stkCountdown }}s
									</span>
								</div>
								<h2
									class="font-display font-bold text-base sm:text-lg text-theme-ink"
								>
									Please Check Your Mobile Screen
								</h2>
								<p
									class="text-xs sm:text-sm text-theme-muted leading-relaxed"
								>
									Enter your <strong>M-Pesa PIN</strong> to
									authorize payment of
									<strong class="text-theme-ink font-mono">{{
										orderData
											? formatCurrency(orderData.total)
											: "your order"
									}}</strong
									>.
								</p>
							</div>
						</div>

						<div
							class="pt-3 border-t border-theme-border flex flex-wrap items-center justify-between gap-3 text-xs"
						>
							<div
								class="flex items-center gap-2 font-medium text-theme-muted"
							>
								<span
									class="w-2 h-2 rounded-full bg-theme-accent animate-pulse"
								/>
								<span
									>Listening for Safaricom
									confirmation...</span
								>
							</div>

							<div class="flex items-center gap-2">
								<button
									type="button"
									class="px-3 py-1.5 bg-theme-surface border border-theme-border hover:bg-theme-surface-subtle rounded-lg font-semibold text-theme-ink transition-colors cursor-pointer text-xs"
									@click="
										showPaymentRecovery =
											!showPaymentRecovery
									"
								>
									Change Payment Method
								</button>

								<button
									type="button"
									class="px-3.5 py-1.5 bg-theme-dark hover:bg-theme-dark-surface text-white rounded-lg font-bold flex items-center gap-1.5 shadow-subtle cursor-pointer transition-all disabled:opacity-50 text-xs"
									:disabled="isCheckingStatus"
									@click="handleManualCheckStatus"
								>
									<RefreshCw
										:size="12"
										:class="{
											'animate-spin': isCheckingStatus,
										}"
									/>
									<span>Check Status</span>
								</button>
							</div>
						</div>
					</div>

					<div
						v-else-if="isDirectMpesa"
						class="bg-theme-surface-subtle border border-theme-accent-border rounded-2xl p-6 sm:p-7 space-y-4 shadow-soft"
					>
						<div class="flex items-start gap-4">
							<div
								class="w-10 h-10 rounded-full bg-theme-accent text-white flex items-center justify-center shadow-xs flex-shrink-0"
							>
								<Clock :size="20" />
							</div>
							<div class="space-y-1 flex-1">
								<span
									class="text-[10px] font-mono uppercase font-bold tracking-wider text-theme-accent block"
								>
									Reference Received • Under Verification
								</span>
								<h2
									class="font-display font-bold text-base sm:text-lg text-theme-ink"
								>
									Verifying Your M-Pesa Deposit
								</h2>
								<p
									class="text-xs sm:text-sm text-theme-muted leading-relaxed"
								>
									Thank you,
									<strong>{{
										orderData?.customerName
									}}</strong
									>. Our team is validating your reference
									code against our till records.
								</p>
							</div>
						</div>

						<div
							class="bg-theme-surface rounded-xl p-4 border border-theme-border text-xs text-theme-ink space-y-2 shadow-2xs"
						>
							<div
								class="flex justify-between items-center text-theme-muted"
							>
								<span>Submitted Code:</span>
								<span
									class="font-mono font-bold text-theme-ink text-sm tracking-wider uppercase bg-theme-surface-subtle px-2.5 py-1 rounded border border-theme-border"
								>
									{{
										orderData?.paymentReference ||
										"SUBMITTED"
									}}
								</span>
							</div>
							<div
								class="flex justify-between items-center text-theme-muted"
							>
								<span>Total Amount:</span>
								<span
									class="font-mono font-bold text-theme-ink tabular-figure"
								>
									{{
										orderData
											? formatCurrency(orderData.total)
											: ""
									}}
								</span>
							</div>
						</div>

						<div
							class="flex flex-wrap items-center justify-between gap-3 pt-1"
						>
							<span
								class="text-[11px] text-theme-muted flex items-center gap-1.5 font-medium"
							>
								<span
									class="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"
								/>
								<span
									>eBook PDF downloads unlock automatically
									upon verification.</span
								>
							</span>

							<div class="flex items-center gap-2">
								<a
									:href="whatsappHelpUrl"
									target="_blank"
									rel="noopener noreferrer"
									class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
								>
									<MessageCircle
										:size="13"
										class="text-emerald-700"
									/>
									<span>Verify on WhatsApp</span>
								</a>

								<button
									type="button"
									class="px-3 py-1.5 bg-theme-dark hover:bg-theme-dark-surface text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-subtle cursor-pointer transition-all disabled:opacity-50"
									:disabled="isCheckingStatus"
									@click="handleManualCheckStatus"
								>
									<RefreshCw
										:size="12"
										:class="{
											'animate-spin': isCheckingStatus,
										}"
									/>
									<span>Check Status</span>
								</button>
							</div>
						</div>
					</div>
				</div>

				<!-- STATE B: PAYMENT FAILED -->
				<div
					v-else-if="isPaymentFailed"
					class="bg-theme-accent-soft border border-theme-accent-border rounded-2xl p-6 sm:p-7 space-y-4 shadow-soft"
				>
					<div class="flex items-start gap-4">
						<AlertTriangle
							:size="26"
							class="text-theme-accent flex-shrink-0 mt-0.5"
						/>
						<div class="space-y-1 flex-1">
							<span
								class="text-[10px] font-mono uppercase font-bold tracking-wider text-theme-accent block"
							>
								Payment Not Completed
							</span>
							<h2
								class="font-display font-bold text-base sm:text-lg text-theme-ink"
							>
								Payment Request Was Cancelled or Timed Out
							</h2>
							<p
								class="text-xs sm:text-sm text-theme-muted leading-relaxed"
							>
								The prompt was not approved. You can switch to
								another payment method or re-attempt with your
								phone number below without re-entering your
								order details.
							</p>
						</div>
					</div>

					<div class="pt-2">
						<button
							type="button"
							class="px-4 py-2 bg-theme-accent hover:bg-theme-accent-hover text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
							@click="showPaymentRecovery = true"
						>
							Retry / Change Payment Method
						</button>
					</div>
				</div>

				<!-- RECOVERY DRAWER -->
				<div
					v-if="showPaymentRecovery"
					class="p-5 bg-theme-surface-subtle border border-theme-accent-border rounded-2xl space-y-4 shadow-soft animate-in fade-in"
				>
					<div
						class="flex items-center justify-between border-b border-theme-border pb-2"
					>
						<h3
							class="font-display font-bold text-xs sm:text-sm text-theme-ink"
						>
							Select Alternate Payment Method
						</h3>
						<button
							type="button"
							class="text-xs text-theme-muted underline cursor-pointer"
							@click="showPaymentRecovery = false"
						>
							Close
						</button>
					</div>

					<div class="space-y-2.5 text-xs">
						<label
							class="flex items-center gap-2 cursor-pointer font-semibold text-theme-ink"
						>
							<input
								type="radio"
								value="mpesa"
								v-model="recoveryMethod"
							/>
							<span>Retry Automated M-Pesa STK Push</span>
						</label>

						<div
							v-if="recoveryMethod === 'mpesa'"
							class="pl-6 space-y-1"
						>
							<input
								v-model="recoveryPhone"
								type="tel"
								placeholder="07XXXXXXXX or 01XXXXXXXX"
								class="px-3 py-1.5 bg-theme-surface border border-theme-border rounded-lg text-xs font-mono w-full max-w-xs outline-none focus:border-theme-accent text-theme-ink"
							/>
						</div>

						<label
							class="flex items-center gap-2 cursor-pointer font-semibold text-theme-ink"
						>
							<input
								type="radio"
								value="mpesa_manual"
								v-model="recoveryMethod"
							/>
							<span>Pay Directly to Buy Goods Till (174379)</span>
						</label>

						<div
							v-if="recoveryMethod === 'mpesa_manual'"
							class="pl-6 space-y-1"
						>
							<input
								v-model="recoveryMpesaCode"
								type="text"
								placeholder="Paste new M-Pesa reference (e.g. SH12AB34CD)"
								class="px-3 py-1.5 bg-theme-surface border border-theme-border rounded-lg text-xs font-mono uppercase tracking-wider w-full max-w-xs outline-none focus:border-theme-accent text-theme-ink"
							/>
						</div>
					</div>

					<div class="pt-2 flex justify-end gap-2">
						<button
							type="button"
							class="px-4 py-2 bg-theme-accent hover:bg-theme-accent-hover text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
							:disabled="isSubmittingRecovery"
							@click="handleRetryOrSwitchPayment"
						>
							{{
								isSubmittingRecovery
									? "Submitting..."
									: "Submit & Proceed"
							}}
						</button>
					</div>
				</div>

				<!-- STATE C: PAYMENT APPROVED -->
				<div
					v-if="
						isPaymentPaid ||
						orderData?.status === 'confirmed' ||
						orderData?.status === 'delivered'
					"
					class="space-y-6"
				>
					<div
						class="text-center space-y-2 pb-5 border-b border-theme-border"
					>
						<div
							class="w-13 h-13 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm"
						>
							<CheckCircle2
								:size="28"
								class="text-emerald-700"
							/>
						</div>
						<span
							class="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200"
						>
							Payment Verified &amp; Approved
						</span>
						<h1
							class="font-display text-2xl sm:text-3xl font-extrabold text-theme-ink"
						>
							Your eBooks Are Ready!
						</h1>
						<p
							class="text-xs sm:text-sm text-theme-muted max-w-md mx-auto"
						>
							Thank you,
							<strong>{{ orderData?.customerName }}</strong
							>. Your digital book license is ready for instant
							download.
						</p>
					</div>

					<!-- Email Confirmation Notice -->
					<div
						v-if="hasDigitalDownloads && isPaymentPaid"
						class="p-4 bg-theme-surface-subtle border border-theme-border rounded-2xl flex items-center gap-3.5 text-xs text-theme-ink shadow-2xs"
					>
						<div
							class="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0"
						>
							<MailCheck :size="18" />
						</div>
						<div>
							<strong class="font-semibold text-theme-ink block"
								>Permanent Backup Dispatched via Email</strong
							>
							<span class="text-theme-muted">
								A permanent receipt with direct eBook recovery
								links has been sent to
								<strong>{{ customerEmailDisplay }}</strong
								>.
							</span>
						</div>
					</div>

					<!-- Digital Downloads Vault -->
					<div v-if="hasDigitalDownloads" class="space-y-3.5">
						<div class="flex items-center justify-between">
							<h3
								class="font-display font-bold text-sm text-theme-ink uppercase tracking-wider flex items-center gap-2"
							>
								<Download
									:size="16"
									class="text-emerald-700"
								/>
								Your Digital Editions (Direct Download)
							</h3>
							<span
								class="text-[10px] text-emerald-800 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
							>
								Access Valid: 90 Days
							</span>
						</div>

						<div class="grid sm:grid-cols-2 gap-3.5">
							<div
								v-for="dl in orderData!.downloads"
								:key="dl.token"
								class="p-4 sm:p-5 bg-theme-surface border border-theme-border rounded-2xl space-y-3.5 flex flex-col justify-between shadow-soft hover:shadow-medium transition-shadow"
							>
								<div class="space-y-1">
									<span
										class="text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-md bg-theme-dark text-white"
									>
										{{ dl.format.toUpperCase() }} EBOOK
									</span>
									<h4
										class="text-xs sm:text-sm font-bold text-theme-ink mt-1 line-clamp-1"
									>
										{{ dl.bookTitle }}
									</h4>
									<p class="text-[11px] text-theme-muted">
										Downloads remaining:
										{{ dl.maxDownloads - dl.downloadCount }}
									</p>
								</div>

								<a
									:href="`/api/books/download/${dl.token}?redirect=true`"
									target="_blank"
									class="bg-theme-accent hover:bg-theme-accent-hover active:bg-theme-accent-active text-white text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-subtle cursor-pointer active:scale-[0.98]"
								>
									<Download :size="14" class="text-white" />
									<span
										>Download
										{{ dl.format.toUpperCase() }}</span
									>
								</a>
							</div>
						</div>
					</div>

					<!-- Order Summary -->
					<div
						class="border-t border-theme-border pt-4 space-y-2.5 text-xs"
					>
						<div
							class="flex justify-between items-center text-theme-muted"
						>
							<span>Order Reference</span>
							<span class="font-mono font-bold text-theme-ink"
								>#{{
									orderData?.orderId.slice(0, 8).toUpperCase()
								}}</span
							>
						</div>
						<div
							class="flex justify-between items-center text-theme-muted"
						>
							<span>Payment Mode</span>
							<span
								class="font-mono font-bold text-theme-ink uppercase"
							>
								{{
									orderData?.paymentMethod === "mpesa_manual"
										? "Direct M-Pesa Till"
										: "Automated M-Pesa"
								}}
							</span>
						</div>
						<div
							v-if="orderData?.paymentReference"
							class="flex justify-between items-center text-theme-muted"
						>
							<span>M-Pesa Reference</span>
							<span
								class="font-mono font-bold text-theme-ink uppercase bg-theme-surface-subtle px-2 py-0.5 rounded border border-theme-border"
							>
								{{ orderData.paymentReference }}
							</span>
						</div>
						<div
							class="flex justify-between items-center text-theme-muted"
						>
							<span>Delivery Format</span>
							<span class="font-medium text-theme-ink"
								>Instant Direct Download</span
							>
						</div>
						<div
							class="flex justify-between items-baseline pt-2.5 border-t border-theme-border text-sm font-bold text-theme-ink"
						>
							<span>Total Amount</span>
							<span
								class="font-display font-extrabold text-xl sm:text-2xl text-theme-ink font-mono tabular-figure text-base sm:text-lg"
							>
								{{
									orderData
										? formatCurrency(orderData.total)
										: ""
								}}
							</span>
						</div>
					</div>

					<div class="pt-2 flex flex-wrap gap-3.5">
						<a
							:href="whatsappHelpUrl"
							target="_blank"
							rel="noopener noreferrer"
							class="flex-1 min-w-[200px] border border-theme-border bg-theme-surface hover:bg-theme-surface-subtle text-theme-ink text-xs font-bold uppercase py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
						>
							<MessageCircle :size="15" class="text-[#25D366]" />
							WhatsApp Concierge Desk
						</a>

						<NuxtLink
							to="/"
							class="flex-1 min-w-[200px] bg-theme-dark hover:bg-theme-dark-surface text-white text-xs font-bold uppercase py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-medium cursor-pointer"
						>
							<ShoppingBag :size="15" class="text-theme-accent" />
							Return to Bookstore <ArrowRight :size="14" />
						</NuxtLink>
					</div>
				</div>
			</div>
		</main>

		<ToastContainer />
	</div>
</template>