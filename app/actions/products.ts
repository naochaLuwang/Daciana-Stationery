// "use server"

// import { v2 as cloudinary } from 'cloudinary'
// import { createClient } from "@/utils/supabase/server"
// import { revalidatePath } from "next/cache"

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// })

// /**
//  * CREATE PRODUCT
//  */
// export async function createProduct(formData: FormData) {
//     const supabase = await createClient()
//     const payload = JSON.parse(formData.get("payload") as string)
//     const files = formData.getAll("files") as File[]

//     try {
//         const { data: product, error: pError } = await supabase
//             .from("products")
//             .insert([{
//                 name: payload.name,
//                 slug: payload.slug,
//                 brand: payload.brand,
//                 description: payload.description,
//                 has_variants: payload.has_variants,
//                 base_price: payload.has_variants ? null : Number(payload.base_price),
//                 discount_type: payload.has_variants ? 'none' : payload.discount_type,
//                 discount_value: payload.has_variants ? 0 : Number(payload.discount_value),
//             }])
//             .select().single()

//         if (pError) throw pError

//         const uploadedUrls: string[] = []
//         for (let i = 0; i < files.length; i++) {
//             const buffer = Buffer.from(await files[i].arrayBuffer())
//             const upload: any = await new Promise((resolve, reject) => {
//                 cloudinary.uploader.upload_stream({ folder: `products/${product.id}` }, (err, res) => err ? reject(err) : resolve(res)).end(buffer)
//             })
//             uploadedUrls.push(upload.secure_url)
//             await supabase.from("product_images").insert({ product_id: product.id, url: upload.secure_url, position: i })
//         }

//         if (uploadedUrls.length > 0) {
//             await supabase.from("products").update({ thumbnail_url: uploadedUrls[0] }).eq("id", product.id)
//         }

//         if (payload.has_variants) {
//             for (const v of payload.variants) {
//                 const primaryUrl = v.image_indices?.length > 0 ? uploadedUrls[v.image_indices[0]] : null
//                 const { data: variant } = await supabase.from("product_variants").insert([{
//                     product_id: product.id,
//                     title: v.title,
//                     price: Number(v.price),
//                     stock: Number(v.stock),
//                     sku: v.sku || `${payload.slug}-${Math.random().toString(36).substring(2, 7)}`,
//                     hex_code: v.hex_code,
//                     discount_type: v.discount_type,
//                     discount_value: Number(v.discount_value),
//                     image_url: primaryUrl
//                 }]).select().single()

//                 if (v.image_indices?.length > 0) {
//                     const vImages = v.image_indices.map((idx: number, pos: number) => ({
//                         product_variant_id: variant.id,
//                         url: uploadedUrls[idx],
//                         position: pos
//                     }))
//                     await supabase.from("variant_images").insert(vImages)
//                 }
//             }
//         } else {
//             await supabase.from("product_variants").insert({
//                 product_id: product.id,
//                 sku: `${payload.slug}-std`,
//                 title: "Standard",
//                 price: Number(payload.base_price),
//                 stock: Number(payload.stock),
//                 is_default: true,
//                 discount_type: payload.discount_type,
//                 discount_value: Number(payload.discount_value)
//             })
//         }

//         revalidatePath("/admin/products")
//         return { success: true }
//     } catch (error: any) {
//         return { success: false, error: error.message }
//     }
// }

// /**
//  * UPDATE PRODUCT
//  */
// export async function updateProduct(productId: string, formData: FormData) {
//     const supabase = await createClient()
//     const payload = JSON.parse(formData.get("payload") as string)
//     const files = formData.getAll("files") as File[]

//     try {
//         // 1. Sync Categories
//         await supabase.from("product_categories").delete().eq("product_id", productId)
//         if (payload.category_ids?.length > 0) {
//             const links = payload.category_ids.map((id: string) => ({
//                 product_id: productId,
//                 category_id: id
//             }))
//             await supabase.from("product_categories").insert(links)
//         }

//         // 2. Handle Image Gallery Cleanup & Uploads
//         const { data: oldImages } = await supabase.from("product_images").select("url").eq("product_id", productId)
//         const oldUrls = oldImages?.map(img => img.url) || []
//         const keptUrls = payload.existing_images || []
//         const urlsToRemove = oldUrls.filter(url => !keptUrls.includes(url))

//         for (const url of urlsToRemove) {
//             const publicId = `products/${productId}/${url.split('/').pop()?.split('.')[0]}`
//             await cloudinary.uploader.destroy(publicId)
//         }

//         const newUrls: string[] = []
//         for (const file of files) {
//             const buffer = Buffer.from(await file.arrayBuffer())
//             const res: any = await new Promise((resolve, reject) => {
//                 cloudinary.uploader.upload_stream({ folder: `products/${productId}` }, (err, r) => err ? reject(err) : resolve(r)).end(buffer)
//             })
//             newUrls.push(res.secure_url)
//         }

//         const finalGallery = [...keptUrls, ...newUrls]

//         // 3. Update Product Table
//         await supabase.from("products").update({
//             name: payload.name,
//             slug: payload.slug,
//             description: payload.description,
//             brand: payload.brand,
//             has_variants: payload.has_variants,
//             base_price: payload.has_variants ? null : payload.base_price,
//             discount_type: payload.has_variants ? 'none' : payload.discount_type,
//             discount_value: payload.has_variants ? 0 : payload.discount_value,
//             thumbnail_url: finalGallery[0] || null,
//             updated_at: new Date().toISOString()
//         }).eq("id", productId)

//         // 4. Update Gallery Records
//         await supabase.from("product_images").delete().eq("product_id", productId)
//         if (finalGallery.length > 0) {
//             await supabase.from("product_images").insert(finalGallery.map((url, i) => ({
//                 product_id: productId,
//                 url,
//                 position: i
//             })))
//         }

//         // 5. Update Inventory (Variants)
//         if (payload.has_variants) {
//             // Delete removed variants
//             const idsToKeep = payload.variants.map((v: any) => v.id).filter(Boolean)
//             if (idsToKeep.length > 0) {
//                 await supabase.from("product_variants").delete().eq("product_id", productId).not("id", "in", `(${idsToKeep.join(',')})`)
//             } else {
//                 // If switching from simple to variants or all deleted
//                 await supabase.from("product_variants").delete().eq("product_id", productId)
//             }

//             for (const v of payload.variants) {
//                 const primaryUrl = v.image_indices?.length > 0 ? finalGallery[v.image_indices[0]] : null

//                 const { data: variant, error: vError } = await supabase.from("product_variants").upsert({
//                     id: v.id || undefined,
//                     product_id: productId,
//                     title: v.title,
//                     price: v.price,
//                     stock: v.stock,
//                     hex_code: v.hex_code,
//                     discount_type: v.discount_type,
//                     discount_value: v.discount_value,
//                     image_url: primaryUrl,
//                     sku: v.sku || `${payload.slug}-${Math.random().toString(36).substring(2, 5)}`
//                 }).select().single()

//                 if (vError) throw vError

//                 // Sync Variant Images
//                 await supabase.from("variant_images").delete().eq("product_variant_id", variant.id)
//                 if (v.image_indices?.length > 0) {
//                     const vImages = v.image_indices.map((idx: number, pos: number) => ({
//                         product_variant_id: variant.id,
//                         url: finalGallery[idx],
//                         position: pos
//                     }))
//                     await supabase.from("variant_images").insert(vImages)
//                 }
//             }
//         } else {
//             // Simple Product: Update the single default variant
//             await supabase.from("product_variants").update({
//                 stock: payload.stock,
//                 price: payload.base_price,
//                 discount_type: payload.discount_type,
//                 discount_value: payload.discount_value,
//                 is_default: true
//             }).eq("product_id", productId).eq("is_default", true)
//         }

//         revalidatePath("/admin/products")
//         return { success: true }
//     } catch (error: any) {
//         console.error("Update Error:", error)
//         return { success: false, error: error.message }
//     }
// }


"use server"

import { v2 as cloudinary } from 'cloudinary'
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * CREATE PRODUCT
 */
export async function createProduct(formData: FormData) {
    const supabase = await createClient()
    const payload = JSON.parse(formData.get("payload") as string)
    const files = formData.getAll("files") as File[]

    try {
        // 1. Insert Main Product
        const { data: product, error: pError } = await supabase
            .from("products")
            .insert([{
                name: payload.name,
                slug: payload.slug,
                brand: payload.brand,
                description: payload.description,
                has_variants: payload.has_variants,
                base_price: payload.has_variants ? null : Number(payload.base_price),
                discount_type: payload.has_variants ? 'none' : payload.discount_type,
                discount_value: payload.has_variants ? 0 : Number(payload.discount_value),
            }])
            .select().single()

        if (pError) throw pError

        // 2. FIXED: INSERT CATEGORIES (This was missing)
        if (payload.category_ids && payload.category_ids.length > 0) {
            const categoryLinks = payload.category_ids.map((catId: string) => ({
                product_id: product.id,
                category_id: catId
            }))
            const { error: catError } = await supabase.from("product_categories").insert(categoryLinks)
            if (catError) console.error("Category Link Error:", catError)
        }

        // 3. Handle Image Uploads
        const uploadedUrls: string[] = []
        for (let i = 0; i < files.length; i++) {
            const buffer = Buffer.from(await files[i].arrayBuffer())
            const upload: any = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream({
                    folder: `products/${product.id}`
                }, (err, res) => err ? reject(err) : resolve(res)).end(buffer)
            })
            uploadedUrls.push(upload.secure_url)
            await supabase.from("product_images").insert({
                product_id: product.id,
                url: upload.secure_url,
                position: i
            })
        }

        // 4. Update Thumbnail
        if (uploadedUrls.length > 0) {
            await supabase.from("products").update({ thumbnail_url: uploadedUrls[0] }).eq("id", product.id)
        }

        // 5. Handle Inventory (Variants vs Simple)
        if (payload.has_variants) {
            for (const v of payload.variants) {
                const primaryUrl = v.image_indices?.length > 0 ? uploadedUrls[v.image_indices[0]] : null
                const { data: variant } = await supabase.from("product_variants").insert([{
                    product_id: product.id,
                    title: v.title,
                    price: Number(v.price),
                    stock: Number(v.stock),
                    sku: v.sku || `${payload.slug}-${Math.random().toString(36).substring(2, 7)}`,
                    hex_code: v.hex_code,
                    discount_type: v.discount_type,
                    discount_value: Number(v.discount_value),
                    image_url: primaryUrl
                }]).select().single()

                if (v.image_indices?.length > 0 && variant) {
                    const vImages = v.image_indices.map((idx: number, pos: number) => ({
                        product_variant_id: variant.id,
                        url: uploadedUrls[idx],
                        position: pos
                    }))
                    await supabase.from("variant_images").insert(vImages)
                }
            }
        } else {
            // Simple Product: default variant
            await supabase.from("product_variants").insert({
                product_id: product.id,
                sku: `${payload.slug}-std`,
                title: "Standard",
                price: Number(payload.base_price),
                stock: Number(payload.stock),
                is_default: true,
                discount_type: payload.discount_type,
                discount_value: Number(payload.discount_value)
            })
        }

        revalidatePath("/admin/products")
        return { success: true }
    } catch (error: any) {
        console.error("Create Product Error:", error)
        return { success: false, error: error.message }
    }
}

/**
 * UPDATE PRODUCT
 */
export async function updateProduct(productId: string, formData: FormData) {
    const supabase = await createClient()
    const payload = JSON.parse(formData.get("payload") as string)
    const files = formData.getAll("files") as File[]

    try {
        // 1. Sync Categories (Clear and Re-insert)
        await supabase.from("product_categories").delete().eq("product_id", productId)
        if (payload.category_ids && payload.category_ids.length > 0) {
            const links = payload.category_ids.map((id: string) => ({
                product_id: productId,
                category_id: id
            }))
            await supabase.from("product_categories").insert(links)
        }

        // 2. Handle Images
        const { data: oldImages } = await supabase.from("product_images").select("url").eq("product_id", productId)
        const oldUrls = oldImages?.map(img => img.url) || []
        const keptUrls = payload.existing_images || []
        const urlsToRemove = oldUrls.filter(url => !keptUrls.includes(url))

        for (const url of urlsToRemove) {
            // Extract public ID carefully
            const splitUrl = url.split('/')
            const fileName = splitUrl[splitUrl.length - 1].split('.')[0]
            const publicId = `products/${productId}/${fileName}`
            await cloudinary.uploader.destroy(publicId).catch(() => null)
        }

        const newUrls: string[] = []
        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer())
            const res: any = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream({ folder: `products/${productId}` }, (err, r) => err ? reject(err) : resolve(r)).end(buffer)
            })
            newUrls.push(res.secure_url)
        }

        const finalGallery = [...keptUrls, ...newUrls]

        // 3. Update Product Table
        await supabase.from("products").update({
            name: payload.name,
            slug: payload.slug,
            description: payload.description,
            brand: payload.brand,
            has_variants: payload.has_variants,
            base_price: payload.has_variants ? null : Number(payload.base_price),
            discount_type: payload.has_variants ? 'none' : payload.discount_type,
            discount_value: payload.has_variants ? 0 : Number(payload.discount_value),
            thumbnail_url: finalGallery[0] || null,
            updated_at: new Date().toISOString()
        }).eq("id", productId)

        // 4. Rebuild Gallery Records
        await supabase.from("product_images").delete().eq("product_id", productId)
        if (finalGallery.length > 0) {
            await supabase.from("product_images").insert(finalGallery.map((url, i) => ({
                product_id: productId,
                url,
                position: i
            })))
        }

        // 5. Update Variants
        if (payload.has_variants) {
            // Delete removed variants
            const idsToKeep = payload.variants.map((v: any) => v.id).filter(Boolean)
            const deleteQuery = supabase.from("product_variants").delete().eq("product_id", productId)
            if (idsToKeep.length > 0) {
                deleteQuery.not("id", "in", `(${idsToKeep.join(',')})`)
            }
            await deleteQuery

            for (const v of payload.variants) {
                const primaryUrl = v.image_indices?.length > 0 ? finalGallery[v.image_indices[0]] : null

                const { data: variant, error: vError } = await supabase.from("product_variants").upsert({
                    id: v.id || undefined, // undefined triggers new ID generation
                    product_id: productId,
                    title: v.title,
                    price: Number(v.price),
                    stock: Number(v.stock),
                    hex_code: v.hex_code,
                    discount_type: v.discount_type,
                    discount_value: Number(v.discount_value),
                    image_url: primaryUrl,
                    sku: v.sku || `${payload.slug}-${Math.random().toString(36).substring(2, 5)}`
                }).select().single()

                if (vError) throw vError

                // Sync Variant Images
                await supabase.from("variant_images").delete().eq("product_variant_id", variant.id)
                if (v.image_indices?.length > 0) {
                    const vImages = v.image_indices.map((idx: number, pos: number) => ({
                        product_variant_id: variant.id,
                        url: finalGallery[idx],
                        position: pos
                    }))
                    await supabase.from("variant_images").insert(vImages)
                }
            }
        } else {
            // Update single default variant
            await supabase.from("product_variants").update({
                stock: Number(payload.stock),
                price: Number(payload.base_price),
                discount_type: payload.discount_type,
                discount_value: Number(payload.discount_value),
                is_default: true
            }).eq("product_id", productId).eq("is_default", true)
        }

        revalidatePath("/admin/products")
        return { success: true }
    } catch (error: any) {
        console.error("Update Error:", error)
        return { success: false, error: error.message }
    }
}