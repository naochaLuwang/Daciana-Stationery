"use server"

import { createClient } from "@/utils/supabase/server"

export async function validatePromoCode(code: string, cartItems: any[]) {
    const supabase = await createClient()

    const { data: promo, error } = await supabase
        .from("promo_codes")
        .select("*, promo_code_products(product_id), promo_code_categories(category_id)")
        .eq("code", code.toUpperCase())
        .eq("is_active", true)
        .single()

    if (error || !promo) return { success: false, message: "Invalid promo code" }

    const now = new Date()
    if (promo.starts_at && new Date(promo.starts_at) > now) {
        return { success: false, message: "This promo code is not active yet" }
    }
    if (promo.expires_at && new Date(promo.expires_at) < now) {
        return { success: false, message: "This promo code has expired" }
    }
    if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
        return { success: false, message: "This promo code has reached its usage limit" }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (promo.once_per_user && user) {
        const { data: previousRedemption } = await supabase
            .from("promo_redemptions")
            .select("id")
            .eq("promo_id", promo.id)
            .eq("user_id", user.id)
            .single()
        if (previousRedemption) {
            return { success: false, message: "This coupon can only be used once per customer" }
        }
    }

    const allowedProductIds = promo.promo_code_products?.map((p: any) => String(p.product_id)) || []
    const allowedCategoryIds = promo.promo_code_categories?.map((c: any) => String(c.category_id)) || []

    const eligibleItems = cartItems.filter((item: any) => {
        if (promo.apply_to === "all") return true
        if (promo.apply_to === "specific_products") {
            return allowedProductIds.includes(String(item.id || item.productId))
        }
        if (promo.apply_to === "specific_categories") {
            return allowedCategoryIds.includes(String(item.categoryId))
        }
        return false
    })

    if (eligibleItems.length === 0) {
        return { success: false, message: "This code is not applicable to the items in your bag" }
    }

    const eligibleSubtotal = eligibleItems.reduce(
        (acc: number, item: any) => acc + item.price * item.quantity,
        0
    )
    if (eligibleSubtotal < (promo.min_order_amount || 0)) {
        return {
            success: false,
            message: `Add ₹${((promo.min_order_amount || 0) - eligibleSubtotal).toLocaleString()} more of eligible items to use this code`,
        }
    }

    return {
        success: true,
        id: promo.id,
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: Number(promo.discount_value),
        max_discount_amount: promo.max_discount_amount,
        min_order_amount: promo.min_order_amount,
        apply_to: promo.apply_to,
        allowedProductIds,
        allowedCategoryIds,
    }
}

export async function getActivePromos() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("promo_codes")
        .select("*, promo_code_products(product_id), promo_code_categories(category_id)")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

    if (error) return []

    const { data: { user } } = await supabase.auth.getUser()
    if (user && data) {
        const { data: redemptions } = await supabase
            .from("promo_redemptions")
            .select("promo_id")
            .eq("user_id", user.id)

        if (redemptions) {
            const usedPromoIds = new Set(redemptions.map((r) => r.promo_id))
            return data.filter((promo) => !promo.once_per_user || !usedPromoIds.has(promo.id))
        }
    }

    return data || []
}
