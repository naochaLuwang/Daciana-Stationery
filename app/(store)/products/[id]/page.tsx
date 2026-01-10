import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { ProductViewSection } from "@/components/store/product-view-section"

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: product } = await supabase
        .from("products")
        .select(`
            *,
            images:product_images(url, alt),
            variants:product_variants(*)
        `)
        .eq("id", id)
        .single()

    if (!product) notFound()

    return (
        <div className="container mx-auto px-4 py-12">
            <ProductViewSection product={product} />
        </div>
    )
}