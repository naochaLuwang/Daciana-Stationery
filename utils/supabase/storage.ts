import { createClient } from "@/utils/supabase/client"

export async function uploadProductImage(file: File) {
    const supabase = createClient()

    // Create a unique file path: folder/timestamp-filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`
    const filePath = `product-images/${fileName}`

    const { data, error } = await supabase.storage
        .from('products')
        .upload(filePath, file)

    if (error) throw error

    // Get the Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

    return publicUrl
}