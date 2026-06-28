"use client"

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface RecentlyViewedStore {
    items: string[]
    addItem: (id: string) => void
    getItems: () => string[]
    clearItems: () => void
}

const MAX_ITEMS = 20

export const useRecentlyViewed = create<RecentlyViewedStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (id) => {
                const currentItems = get().items.filter(itemId => itemId !== id)
                set({ items: [id, ...currentItems].slice(0, MAX_ITEMS) })
            },

            getItems: () => get().items,

            clearItems: () => set({ items: [] }),
        }),
        {
            name: 'daciana-recently-viewed',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
