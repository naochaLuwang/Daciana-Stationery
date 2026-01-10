"use server"

import { v2 as cloudinary } from 'cloudinary'
import { createClient } from "@/utils/supabase/server"
import { categorySchema } from "@/lib/validations/category"
import { revalidatePath } from "next/cache"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function createCategory(formData: FormData) {
    const supabase = await createClient()

    // 1. Extract and Validate Text Data
    const payload = JSON.parse(formData.get("payload") as string)
    const file = formData.get("file") as File | null

    const validatedFields = categorySchema.safeParse(payload)
    if (!validatedFields.success) {
        return { error: "Validation failed" }
    }

    try {
        let imageUrl = ""

        // 2. Upload Image to Cloudinary if file exists
        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer())
            const upload: any = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "categories" },
                    (err, res) => err ? reject(err) : resolve(res)
                ).end(buffer)
            })
            imageUrl = upload.secure_url
        }

        // 3. Insert into Supabase
        const { error } = await supabase
            .from("categories")
            .insert([{
                name: validatedFields.data.name,
                slug: validatedFields.data.slug,
                parent_id: validatedFields.data.parent_id || null,
                image_url: imageUrl || validatedFields.data.image_url
            }])

        if (error) throw error

        revalidatePath("/admin/categories")
        return { success: true }

    } catch (error: any) {
        console.error("Category Action Error:", error)
        return { error: error.message }
    }
}

export async function updateCategory(categoryId: string, formData: FormData) {
    const supabase = await createClient()

    try {
        const payload = JSON.parse(formData.get("payload") as string)
        const file = formData.get("file") as File | null

        const validatedFields = categorySchema.safeParse(payload)
        if (!validatedFields.success) return { error: "Validation failed" }

        let imageUrl = payload.image_url // Default to current URL

        // Only upload to Cloudinary if a NEW file was selected
        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer())
            const upload: any = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "categories" },
                    (err, res) => err ? reject(err) : resolve(res)
                ).end(buffer)
            })
            imageUrl = upload.secure_url
        }

        const { error } = await supabase
            .from("categories")
            .update({
                name: validatedFields.data.name,
                slug: validatedFields.data.slug,
                parent_id: validatedFields.data.parent_id || null,
                image_url: imageUrl
            })
            .eq("id", categoryId)

        if (error) throw error

        revalidatePath("/admin/categories")
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}


export async function deleteCategory(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/admin/categories")
    return { success: true }
}