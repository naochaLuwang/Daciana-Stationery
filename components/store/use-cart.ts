import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
    id: string;
    variantId: string;
    name: string;
    variantTitle: string;
    price: number;
    image: string;
    quantity: number;
    stock: number;
}

interface CartStore {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (variantId: string) => void;
    updateQuantity: (variantId: string, quantity: number) => void;
    setItems: (items: CartItem[]) => void; // Added for DB Sync
    clearCart: () => void;
    totalItems: () => number;
    shippingMethods: any[];
    shippingPrice: number;
    selectedShippingId: string | null;
    setShippingMethods: (methods: any[]) => void;
    setSelectedShipping: (id: string | null, price: number) => void;
    clearShipping: () => void;
    getTotalPrice: () => number;
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            // Action to hydrate store from Database
            setItems: (items) => set({ items }),

            addItem: (newItem) => {
                const currentItems = get().items;
                const existingItem = currentItems.find(item => item.variantId === newItem.variantId);

                if (existingItem) {
                    set({
                        items: currentItems.map(item =>
                            item.variantId === newItem.variantId
                                ? { ...item, quantity: Math.min(item.quantity + newItem.quantity, item.stock) }
                                : item
                        ),
                    });
                } else {
                    set({ items: [...currentItems, newItem] });
                }
            },

            updateQuantity: (variantId, quantity) => {
                set({
                    items: get().items.map(item =>
                        item.variantId === variantId
                            ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
                            : item
                    )
                });
            },

            removeItem: (variantId) => set({
                items: get().items.filter(item => item.variantId !== variantId)
            }),

            // Critical fix for Logout: resets state and clears storage
            clearCart: () => {
                set({
                    items: [],
                    selectedShippingId: null,
                    shippingPrice: 0,
                    shippingMethods: []
                });

                useCart.persist.clearStorage();

                // 3. Extra precaution to ensure sync
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('shopping-cart');
                }
            },

            totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),

            shippingMethods: [],
            selectedShippingId: null,
            shippingPrice: 0,

            setShippingMethods: (methods) => set({ shippingMethods: methods }),

            setSelectedShipping: (id, price) => set({
                selectedShippingId: id,
                shippingPrice: price
            }),

            clearShipping: () => set({
                selectedShippingId: null,
                shippingPrice: 0
            }),

            getTotalPrice: () => {
                const subtotal = get().items.reduce(
                    (acc, item) => acc + (item.price * item.quantity), 0
                );
                return subtotal + get().shippingPrice;
            }
        }),
        { name: 'shopping-cart', storage: createJSONStorage(() => localStorage) }
    )
);