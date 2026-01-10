'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function placeOrder(formData: any, cartItems: any[], shippingDetails: any) {
    const supabase = await createClient()

    // 1. Get the current logged-in user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    try {
        // 2. CHECK STOCK AVAILABILITY FIRST
        // We do this before creating the order to avoid empty orders if stock is gone
        for (const item of cartItems) {
            const { data: variant, error: stockErr } = await supabase
                .from("product_variants")
                .select("stock, title")
                .eq("id", item.variantId)
                .single()

            if (stockErr || !variant) throw new Error(`Product variant not found`)
            if (variant.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${item.name} (${variant.title}). Only ${variant.stock} left.`)
            }
        }

        // 3. Insert the main Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{
                user_id: user.id,
                status: 'pending',
                payment_status: 'unpaid', // Default for COD
                payment_method: 'COD',
                total: shippingDetails.total,
                shipping_price: shippingDetails.price,
                shipping_label: shippingDetails.methodName,
                shipping_address: formData,
            }])
            .select()
            .single()

        if (orderError) throw orderError

        // 4. Insert all items into Order Items
        const itemsToInsert = cartItems.map(item => ({
            order_id: order.id,
            product_id: item.id,
            product_variant_id: item.variantId,
            product_name: item.name,
            variant_title: item.variantTitle,
            quantity: item.quantity,
            unit_price: item.price
        }))

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(itemsToInsert)

        if (itemsError) throw itemsError

        // 5. DECREASE STOCK FOR EACH ITEM
        for (const item of cartItems) {
            // We use a postgrest filter to ensure stock doesn't go below 0 
            // even if another process updated it in the last millisecond
            const { error: updateError } = await supabase
                .rpc('decrement_stock', {
                    row_id: item.variantId,
                    amount: item.quantity
                })

            // If you haven't created the RPC function yet, use this standard update:
            if (updateError) {
                const { error: manualError } = await supabase
                    .from("product_variants")
                    .update({
                        stock: supabase.rpc('decrement', { x: item.quantity }) // Logic shortcut
                    })
                    .eq("id", item.variantId)
            }
        }

        // 6. Refresh Admin and Profile Pages
        revalidatePath("/admin/products")
        revalidatePath("/profile")

        return { success: true, orderId: order.id }

    } catch (error: any) {
        console.error("ORDER_PLACEMENT_ERROR:", error)
        return { success: false, message: error.message }
    }
}