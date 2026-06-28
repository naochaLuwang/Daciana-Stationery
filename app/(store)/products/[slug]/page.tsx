import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { ProductViewSection } from "@/components/store/product-view-section"
import { DenseProductCard } from "@/components/store/dense-product-card"
import { ReviewsSection } from "@/components/store/reviews-section"

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data: product } = await supabase
        .from("products")
        .select(`
            *,
            images:product_images(url, alt),
            variants:product_variants(*),
            reviews:product_reviews(*),
            product_categories(
                categories(id, name, slug)
            )
        `)
        .eq("id", slug)
        .eq("product_reviews.is_approved", true)
        .order('created_at', { foreignTable: 'product_reviews', ascending: false })
        .single()

    if (!product) notFound()

    const category = product.product_categories?.[0]?.categories

    let relatedProducts: any[] = []
    if (category) {
        const { data: relData } = await supabase
            .from("products")
            .select(`
                *,
                product_images(url, alt),
                product_variants(*)
            `)
            .eq("status", "active")
            .neq("id", product.id)
            .limit(6)
        relatedProducts = relData || []
    }

    return (
        <div className="bg-white min-h-screen">
            <ProductViewSection product={product} />

            {relatedProducts.length > 0 && (
                <div className="border-t border-slate-100">
                    <section className="py-6 lg:py-8">
                        <div className="container mx-auto px-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">YOU MAY ALSO LIKE</p>
                            <h3 className="text-[26px] font-light text-slate-900 leading-tight mt-0.5 mb-4">Related</h3>
                            <div className="flex gap-3 overflow-x-auto no-scrollbar">
                                {relatedProducts.map((relProduct) => (
                                    <div key={relProduct.id} className="w-40 shrink-0">
                                        <DenseProductCard product={relProduct} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            <div className="border-t border-slate-100">
                <section className="py-6 lg:py-8">
                    <div className="container mx-auto px-4">
                        <ReviewsSection
                            reviews={product.reviews || []}
                            productId={product.id}
                            user={user}
                        />
                    </div>
                </section>
            </div>
        </div>
    )
}
