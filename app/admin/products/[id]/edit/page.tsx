// app/admin/products/[id]/edit/page.tsx

import { createClient } from "@/utils/supabase/server"
import ProductForm from "@/components/admin/product-form"
import { notFound } from "next/navigation"

// Update the type to Promise
export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    // 1. Unbox the params
    const { id } = await params;

    const supabase = await createClient()

    // 2. Use the 'id' variable in your query
    const { data: product, error } = await supabase
        .from("products")
        .select(`
            *,
            product_categories(category_id),
            product_images(url, position),
            product_variants(
                *,
                variant_images(url, position)
            )
        `)
        .eq("id", id) // Use the unwrapped id
        .single()

    const { data: categories } = await supabase.from("categories").select("id, name")

    if (error || !product) notFound()

    // Transform data to match your ProductFormValues structure
    const initialData = {
        ...product,
        category_ids: product.product_categories.map((pc: any) => pc.category_id),
        existing_images: product.product_images
            .sort((a: any, b: any) => a.position - b.position)
            .map((img: any) => img.url),
        variants: product.product_variants.map((v: any) => ({
            ...v,
            // Pre-fill the array of URLs for the Multi-Image selection popup
            variant_image_urls: v.variant_images
                .sort((a: any, b: any) => a.position - b.position)
                .map((vi: any) => vi.url)
        }))
    }

    return (
        <div className="container mx-auto py-10">
            <ProductForm
                categories={categories || []}
                initialData={initialData}
                isEdit={true}
            />
        </div>
    )
}