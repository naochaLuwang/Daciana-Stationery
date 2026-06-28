"use client"

import { useEffect } from "react"
import { useCart, CartItem } from "./use-cart"
import { createClient } from "@/utils/supabase/client"

interface CartSyncProps {
    userId: string | null
}

export function CartSync({ userId }: CartSyncProps) {
    const setItems = useCart((s) => s.setItems)
    const items = useCart((s) => s.items)

    // Load cart from Supabase when user logs in
    useEffect(() => {
        if (!userId) return

        const supabase = createClient()
        supabase
            .from("cart_items")
            .select("product_id, variant_id, name, variant_title, price, mrp, image, quantity, stock")
            .eq("user_id", userId)
            .then(({ data }) => {
                if (data && data.length > 0) {
                    const remoteItems: CartItem[] = data.map((row: any) => ({
                        id: row.product_id,
                        variantId: row.variant_id,
                        name: row.name,
                        variantTitle: row.variant_title,
                        price: row.price,
                        mrp: row.mrp,
                        image: row.image,
                        quantity: row.quantity,
                        stock: row.stock,
                    }))
                    setItems(remoteItems)
                }
            })
    }, [userId, setItems])

    // Save cart to Supabase whenever items change (if logged in)
    useEffect(() => {
        if (!userId) return

        const supabase = createClient()
        const upsertItems = items.map((item) => ({
            user_id: userId,
            product_id: item.id,
            variant_id: item.variantId,
            name: item.name,
            variant_title: item.variantTitle,
            price: item.price,
            mrp: item.mrp,
            image: item.image,
            quantity: item.quantity,
            stock: item.stock,
        }))

        // Clear existing and re-insert
        supabase
            .from("cart_items")
            .delete()
            .eq("user_id", userId)
            .then(() => {
                if (upsertItems.length > 0) {
                    supabase.from("cart_items").insert(upsertItems)
                }
            })
    }, [userId, items])

    return null
}
