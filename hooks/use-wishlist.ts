"use client"

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface WishlistStore {
    items: string[] // Array of product IDs
    addItem: (id: string) => void
    removeItem: (id: string) => void
    toggleItem: (id: string) => void
    isInWishlist: (id: string) => boolean
    clearWishlist: () => void
}

export const useWishlist = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (id) => {
                const currentItems = get().items
                if (!currentItems.includes(id)) {
                    set({ items: [...currentItems, id] })
                }
            },

            removeItem: (id) => {
                set({ items: get().items.filter(itemId => itemId !== id) })
            },

            toggleItem: (id) => {
                const currentItems = get().items
                if (currentItems.includes(id)) {
                    set({ items: currentItems.filter(itemId => itemId !== id) })
                } else {
                    set({ items: [...currentItems, id] })
                }
            },

            isInWishlist: (id) => get().items.includes(id),

            clearWishlist: () => set({ items: [] }),
        }),
        {
            name: 'daciana-wishlist',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
