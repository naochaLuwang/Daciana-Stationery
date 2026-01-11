"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function approveReview(formData: FormData) {
    const id = formData.get("id") as string
    const supabase = await createClient();

    const { error } = await supabase
        .from("product_reviews")
        .update({ is_approved: true })
        .eq("id", id);

    if (error) {
        console.error("Approval Error:", error.message)
        return
    }

    // Force revalidation of all relevant paths
    revalidatePath("/admin/reviews");
    revalidatePath("/products/[id]", "layout");
    revalidatePath("/", "layout"); // Absolute reset
}

export async function toggleVerification(reviewId: string, currentStatus: boolean) {
    const supabase = await createClient()
    await supabase
        .from("product_reviews")
        .update({ is_verified: !currentStatus })
        .eq("id", reviewId)

    revalidatePath("/admin/reviews")
}

export async function deleteReview(reviewId: string) {
    const supabase = await createClient()
    await supabase.from("product_reviews").delete().eq("id", reviewId)

    revalidatePath("/admin/reviews")
}