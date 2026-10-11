import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/supabase";

export const ONE_SIZE = "Único";

export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  // UI (não persistido)
  isOpen: boolean;
  sizePickerProduct: Product | null;

  addItem: (product: Product, selectedSize: string, quantity?: number) => void;
  removeItem: (productId: string, selectedSize: string) => void;
  updateQuantity: (productId: string, selectedSize: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;

  openCart: () => void;
  closeCart: () => void;
  // Clique no "COP": com vários tamanhos abre o seletor, senão já adiciona.
  requestAdd: (product: Product) => void;
  closeSizePicker: () => void;
}

const isSameLine = (item: CartItem, productId: string, selectedSize: string) =>
  item.product.id === productId && item.selectedSize === selectedSize;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      sizePickerProduct: null,

      addItem: (product, selectedSize, quantity = 1) =>
        set((state) => {
          const exists = state.items.some((item) => isSameLine(item, product.id, selectedSize));
          return {
            items: exists
              ? state.items.map((item) =>
                  isSameLine(item, product.id, selectedSize)
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
                )
              : [...state.items, { product, selectedSize, quantity }],
          };
        }),

      removeItem: (productId, selectedSize) =>
        set((state) => ({
          items: state.items.filter((item) => !isSameLine(item, productId, selectedSize)),
        })),

      updateQuantity: (productId, selectedSize, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, selectedSize);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            isSameLine(item, productId, selectedSize) ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),

      getTotalPrice: () => get().items.reduce((total, item) => total + item.product.price * item.quantity, 0),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      requestAdd: (product) => {
        const sizes = product.sizes ?? [];
        if (sizes.length > 1) {
          set({ sizePickerProduct: product });
          return;
        }
        get().addItem(product, sizes[0] ?? ONE_SIZE);
        set({ isOpen: true });
      },

      closeSizePicker: () => set({ sizePickerProduct: null }),
    }),
    {
      name: "jeeyb-cart",
      version: 1,
      partialize: (state) => ({ items: state.items }),
      // O servidor não tem localStorage: o carrinho começa vazio nos dois lados e só é
      // lido do navegador depois do mount (CartDrawer chama persist.rehydrate()),
      // o que evita erro de hidratação.
      skipHydration: true,
    }
  )
);
