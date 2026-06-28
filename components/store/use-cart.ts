"use client"

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
    id: string;
    variantId: string;
    name: string;
    variantTitle: string;
    price: number;
    mrp: number;
    image: string;
    quantity: number;
    stock: number;
}

interface CartStore {
    items: CartItem[];
    appliedPromo: any | null;
    shippingPrice: number;
    baseShippingPrice: number;
    shippingLabel: string;
    deliveryTimeLabel: string;
    selectedShippingId: string | null;

    autoCalculateShipping: () => void;
    addItem: (item: CartItem) => void;
    removeItem: (variantId: string) => void;
    updateQuantity: (variantId: string, quantity: number) => void;
    setItems: (items: CartItem[]) => void;
    setAppliedPromo: (promo: any) => void;
    setShippingMethod: (method: { id: string, name: string, price: number, delivery_time_label?: string }) => void;
    setSelectedShipping: (id: string | null, price: number, label?: string) => void;
    clearCart: () => void;
    totalItems: () => number;
    getSubtotal: () => number;
    getDiscountAmount: () => number;
    getFinalTotal: () => number;
    clearShipping: () => void;
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            appliedPromo: null,
            shippingPrice: 0,
            baseShippingPrice: 0,
            shippingLabel: '',
            deliveryTimeLabel: '',
            selectedShippingId: null,

            autoCalculateShipping: () => {
                const { selectedShippingId, baseShippingPrice } = get()
                if (!selectedShippingId) return
                const isFree = get().getSubtotal() >= 3000
                set({ shippingPrice: isFree ? 0 : baseShippingPrice })
            },

            getSubtotal: () => {
                return get().items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            },

            setShippingMethod: (method) => {
                const subtotal = get().getSubtotal()
                const isFree = subtotal >= 3000 && subtotal > 0
                set({
                    selectedShippingId: method.id,
                    shippingLabel: method.name,
                    baseShippingPrice: method.price,
                    shippingPrice: isFree ? 0 : method.price,
                    deliveryTimeLabel: method.delivery_time_label || ''
                });
            },

            setSelectedShipping: (id, price, label) => {
                const subtotal = get().getSubtotal()
                const isFree = subtotal >= 3000 && subtotal > 0
                set({
                    selectedShippingId: id,
                    baseShippingPrice: price,
                    shippingPrice: isFree ? 0 : price,
                    shippingLabel: label || ''
                });
            },

            addItem: (newItem) => {
                const currentItems = get().items;
                const existingIndex = currentItems.findIndex(item => item.variantId === newItem.variantId);
                let updatedItems;

                if (existingIndex > -1) {
                    updatedItems = [...currentItems];
                    updatedItems[existingIndex] = {
                        ...updatedItems[existingIndex],
                        quantity: Math.min(updatedItems[existingIndex].quantity + (newItem.quantity || 1), updatedItems[existingIndex].stock)
                    };
                } else {
                    updatedItems = [...currentItems, { ...newItem, quantity: newItem.quantity || 1 }];
                }

                set({ items: updatedItems });
                get().autoCalculateShipping();
            },

            updateQuantity: (variantId, quantity) => {
                set({
                    items: get().items.map(item =>
                        item.variantId === variantId
                            ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
                            : item
                    )
                });
                get().autoCalculateShipping();
            },

            removeItem: (variantId) => {
                const remainingItems = get().items.filter(item => item.variantId !== variantId);
                set({ items: remainingItems });
            },

            setItems: (newItems) => {
                set({ items: newItems });
            },

            setAppliedPromo: (promo) => set({ appliedPromo: promo }),

            clearCart: () => set({
                items: [],
                appliedPromo: null,
                selectedShippingId: null,
                shippingPrice: 0,
                baseShippingPrice: 0,
                shippingLabel: '',
                deliveryTimeLabel: ''
            }),

            clearShipping: () => set({
                selectedShippingId: null,
                shippingPrice: 0,
                baseShippingPrice: 0,
                shippingLabel: '',
                deliveryTimeLabel: ''
            }),

            getDiscountAmount: () => {
                const { items, appliedPromo } = get()
                if (!appliedPromo) return 0

                const eligibleItems = items.filter((item: any) => {
                    if (appliedPromo.apply_to === "all") return true
                    if (appliedPromo.apply_to === "specific_products") {
                        return appliedPromo.allowedProductIds?.includes(String(item.productId || item.id))
                    }
                    return false
                })
                if (eligibleItems.length === 0) return 0

                const eligibleSubtotal = eligibleItems.reduce(
                    (acc: number, item: any) => acc + item.price * item.quantity,
                    0
                )
                if (eligibleSubtotal < (appliedPromo.min_order_amount || 0)) return 0

                let discount = 0
                if (appliedPromo.discount_type === "percentage") {
                    discount = (eligibleSubtotal * appliedPromo.discount_value) / 100
                    if (appliedPromo.max_discount_amount) {
                        discount = Math.min(discount, appliedPromo.max_discount_amount)
                    }
                } else {
                    discount = appliedPromo.discount_value
                    discount = Math.min(discount, eligibleSubtotal)
                }
                return Math.round(discount)
            },

            getFinalTotal: () => {
                const subtotal = get().getSubtotal();
                const discount = get().getDiscountAmount();
                const shipping = get().shippingPrice;
                return Math.max(0, subtotal - discount + shipping);
            },

            totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
        }),
        {
            name: 'shopping-cart',
            storage: createJSONStorage(() => localStorage),
            version: 2,
        }
    )
);
