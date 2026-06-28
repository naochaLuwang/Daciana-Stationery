"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function placeOrder(
    address: { full_name: string; phone: string; pincode: string; street: string },
    items: { id: string; variantId: string; name: string; quantity: number; price: number; mrp: number; image: string; variantTitle: string; stock: number }[],
    shipping: { total: number; price: number; methodName: string; methodId: string },
    promoDetails?: { code: string; discount: number; id?: string }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, message: "You must be logged in to place an order." }

    if (items.length === 0) return { success: false, message: "Cart is empty." }

    try {
        const orderPayload: any = {
            user_id: user.id,
            shipping_address: address,
            total: shipping.total,
            shipping_price: shipping.price,
            shipping_method_id: shipping.methodId || null,
            shipping_label: shipping.methodName,
            status: "pending",
            payment_status: "unpaid",
        }

        if (promoDetails) {
            orderPayload.promo_code = promoDetails.code
            orderPayload.promo_discount_amount = promoDetails.discount
        }

        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert(orderPayload)
            .select()
            .single()

        if (orderError) throw orderError

        const orderItems = items.map((item) => ({
            order_id: order.id,
            product_id: item.id,
            product_variant_id: item.variantId !== "base" ? item.variantId : null,
            product_name: item.name,
            variant_title: item.variantTitle,
            quantity: item.quantity,
            unit_price: item.price,
            mrp: item.mrp,
        }))

        const { error: itemsError } = await supabase.from("order_items").insert(orderItems)
        if (itemsError) throw itemsError

        // Deduct stock
        for (const item of items) {
            if (item.variantId && item.variantId !== "base") {
                await supabase
                    .from("product_variants")
                    .update({ stock: Math.max(0, item.stock - item.quantity) })
                    .eq("id", item.variantId)
            }
        }

        // Save address to profile permanently
        const { error: profileError } = await supabase
            .from("profiles")
            .update({
                full_name: address.full_name,
                phone: address.phone,
                pincode: address.pincode,
                street: address.street,
            })
            .eq("id", user.id)

        if (profileError) {
            console.error("Failed to save address to profile:", profileError)
        }

        // Record promo redemption
        if (promoDetails?.id) {
            await supabase.from("promo_redemptions").insert({
                promo_id: promoDetails.id,
                user_id: user.id,
                order_id: order.id,
            })
            const { data: pc } = await supabase
                .from("promo_codes")
                .select("used_count")
                .eq("id", promoDetails.id)
                .single()
            await supabase
                .from("promo_codes")
                .update({ used_count: (pc?.used_count || 0) + 1 })
                .eq("id", promoDetails.id)
        }

        revalidatePath("/admin/orders")
        return { success: true, orderId: order.id }
    } catch (error: any) {
        console.error("Place order error:", error)
        return { success: false, message: error.message || "Failed to place order." }
    }
}

export async function cancelOrderAndRestoreStock(orderId: string) {
    const supabase = await createClient()

    try {
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .select("status")
            .eq("id", orderId)
            .single()

        if (orderError) throw orderError
        if (order.status === "shipped" || order.status === "delivered") {
            return { success: false, message: "Cannot cancel a shipped or delivered order." }
        }

        const { data: items, error: itemsError } = await supabase
            .from("order_items")
            .select("product_variant_id, quantity, product_id")
            .eq("order_id", orderId)

        if (itemsError) throw itemsError

        for (const item of items || []) {
            if (item.product_variant_id) {
                await supabase
                    .from("product_variants")
                    .update({ stock: item.quantity })
                    .eq("id", item.product_variant_id)
            }
        }

        const { error: updateError } = await supabase
            .from("orders")
            .update({ status: "cancelled" })
            .eq("id", orderId)

        if (updateError) throw updateError

        revalidatePath("/admin/orders")
        return { success: true }
    } catch (error: any) {
        console.error("Cancel order error:", error)
        return { success: false, message: error.message || "Failed to cancel order." }
    }
}
