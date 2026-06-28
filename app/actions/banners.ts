"use server"

import { v2 as cloudinary } from "cloudinary"
import { createClient } from "@/utils/supabase/server"
import { bannerSchema } from "@/lib/validations/banner"
import { revalidatePath } from "next/cache"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function createBanner(formData: FormData) {
    const supabase = await createClient()

    const payload = JSON.parse(formData.get("payload") as string)
    const file = formData.get("file") as File | null

    const validatedFields = bannerSchema.safeParse(payload)
    if (!validatedFields.success) {
        return { error: "Validation failed" }
    }

    try {
        let imageUrl = validatedFields.data.image_url || ""

        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer())
            const upload: any = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "banners" },
                    (err, res) => (err ? reject(err) : resolve(res)),
                ).end(buffer)
            })
            imageUrl = upload.secure_url
        }

        const { error } = await supabase.from("banners").insert([
            {
                title: validatedFields.data.title,
                subtitle: validatedFields.data.subtitle || null,
                cta: validatedFields.data.cta,
                href: validatedFields.data.href,
                image_url: imageUrl,
                bg_color: validatedFields.data.bg_color,
                text_color: validatedFields.data.text_color || null,
                sort_order: validatedFields.data.sort_order,
                is_active: validatedFields.data.is_active,
            },
        ])

        if (error) throw error

        revalidatePath("/admin/banners")
        revalidatePath("/")
        return { success: true }
    } catch (error: any) {
        console.error("Banner Action Error:", error)
        return { error: error.message }
    }
}

export async function updateBanner(bannerId: string, formData: FormData) {
    const supabase = await createClient()

    const payload = JSON.parse(formData.get("payload") as string)
    const file = formData.get("file") as File | null

    const validatedFields = bannerSchema.safeParse(payload)
    if (!validatedFields.success) {
        return { error: "Validation failed" }
    }

    try {
        let imageUrl = validatedFields.data.image_url || ""

        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer())
            const upload: any = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "banners" },
                    (err, res) => (err ? reject(err) : resolve(res)),
                ).end(buffer)
            })
            imageUrl = upload.secure_url
        }

        const { error } = await supabase
            .from("banners")
            .update({
                title: validatedFields.data.title,
                subtitle: validatedFields.data.subtitle || null,
                cta: validatedFields.data.cta,
                href: validatedFields.data.href,
                image_url: imageUrl,
                bg_color: validatedFields.data.bg_color,
                text_color: validatedFields.data.text_color || null,
                sort_order: validatedFields.data.sort_order,
                is_active: validatedFields.data.is_active,
            })
            .eq("id", bannerId)

        if (error) throw error

        revalidatePath("/admin/banners")
        revalidatePath("/")
        return { success: true }
    } catch (error: any) {
        console.error("Banner Action Error:", error)
        return { error: error.message }
    }
}

export async function deleteBanner(id: string) {
    const supabase = await createClient()

    const { error } = await supabase.from("banners").delete().eq("id", id)

    if (error) return { error: error.message }

    revalidatePath("/admin/banners")
    revalidatePath("/")
    return { success: true }
}
