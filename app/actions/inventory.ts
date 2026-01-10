"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateVariantStock(variantId: string, newStock: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("product_variants")
        .update({ stock: newStock })
        .eq("id", variantId)

    if (error) return { error: error.message }

    revalidatePath("/admin/inventory")
    return { success: true }
}