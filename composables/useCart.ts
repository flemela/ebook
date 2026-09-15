// =============================================================================
// composables/useCart.ts
// Pure Digital eBook (PDF) Cart State with Single-Copy Licensing & Instant Delivery
// =============================================================================

import type { CartItem, BookFormatType, DeliveryMethodType } from '~/types';

export function useCart() {
  const items = useState<CartItem[]>('flemela_cart_items', () => []);
  const isDrawerOpen = useState<boolean>('flemela_cart_drawer_open', () => false);

  const totalItems = computed<number>(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  const subtotal = computed<number>(() => {
    const total = items.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return Math.round(total * 100) / 100;
  });

  // Pure digital store: all valid items are digital downloads
  const hasDigitalItems = computed<boolean>(() => items.value.length > 0);
  const hasPhysicalItems = computed<boolean>(() => false);

  function addItem(item: {
    productId: string;
    formatId?: string | null;
    title: string;
    format?: BookFormatType;
    price: number;
    compare_at_price?: number | null;
    quantity?: number;
    deliveryMethod?: DeliveryMethodType;
    coverUrl?: string | null;
    author?: string | null;
  }): void {
    const existingIndex = items.value.findIndex(
      (i) => i.productId === item.productId
    );

    // Digital licenses: ensure 1 copy per customer order to prevent redundant charges
    if (existingIndex > -1) {
      items.value[existingIndex].quantity = 1;
    } else {
      items.value.push({
        productId: item.productId,
        formatId: item.formatId || '',
        title: item.title,
        format: item.format || 'pdf',
        price: item.price,
        compare_at_price: item.compare_at_price ?? null,
        quantity: 1,
        deliveryMethod: 'digital',
        coverUrl: item.coverUrl ?? null,
        author: item.author ?? null,
      });
    }

    isDrawerOpen.value = true;
  }

  function updateQuantity(productId: string, formatId: string, quantity: number): void {
    const index = items.value.findIndex(
      (i) => i.productId === productId && (!formatId || i.formatId === formatId)
    );
    if (index > -1) {
      if (quantity <= 0) {
        items.value.splice(index, 1);
      } else {
        items.value[index].quantity = 1; // Strict single-license cap for digital files
      }
    }
  }

  function removeItem(productId: string, formatId?: string): void {
    items.value = items.value.filter(
      (i) => !(i.productId === productId && (!formatId || i.formatId === formatId))
    );
  }

  function clearCart(): void {
    items.value = [];
  }

  function openDrawer(): void {
    isDrawerOpen.value = true;
  }

  function closeDrawer(): void {
    isDrawerOpen.value = false;
  }

  return {
    items,
    isDrawerOpen,
    totalItems,
    subtotal,
    hasDigitalItems,
    hasPhysicalItems,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    openDrawer,
    closeDrawer,
  };
}