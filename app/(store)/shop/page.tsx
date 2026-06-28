import { createClient } from "@/utils/supabase/server"
import { DenseProductCard } from "@/components/store/dense-product-card"
import { ShopControls } from "@/components/store/shop-controls"
import { Package } from "lucide-react"
import Link from "next/link"

export const metadata = {
    title: "Shop All Products | DACIANA",
    description: "Browse our latest collection of premium products.",
}

const PRODUCT_SELECT = `
  *,
  product_images(url, alt),
  product_variants(*)
`

export default async function ShopPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; search?: string; sort?: string; category?: string; minPrice?: string; maxPrice?: string }>
}) {
    const supabase = await createClient()
    const params = await searchParams
    const query = params.q || params.search || ""
    const sort = params.sort || "newest"
    const categoryId = params.category || ""
    const minPrice = params.minPrice || ""
    const maxPrice = params.maxPrice || ""

    let supabaseQuery = supabase
        .from("products")
        .select(PRODUCT_SELECT, { count: "exact" })
        .eq("status", "active")

    if (query) {
        const searchTerm = `%${query}%`
        supabaseQuery = supabaseQuery.or(
            `name.ilike.${searchTerm},brand.ilike.${searchTerm}`
        )
    }

    if (minPrice) {
        supabaseQuery = supabaseQuery.gte("price", parseFloat(minPrice))
    }
    if (maxPrice) {
        supabaseQuery = supabaseQuery.lte("price", parseFloat(maxPrice))
    }

    switch (sort) {
        case "price_asc":
            supabaseQuery = supabaseQuery.order("price", { ascending: true })
            break
        case "price_desc":
            supabaseQuery = supabaseQuery.order("price", { ascending: false })
            break
        case "default":
            supabaseQuery = supabaseQuery.order("name", { ascending: true })
            break
        case "newest":
        default:
            supabaseQuery = supabaseQuery.order("created_at", { ascending: false })
            break
    }

    const { data: products, count } = await supabaseQuery

    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <div className="border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
                    <span className="text-primary tracking-[0.4em] uppercase text-[10px] font-semibold mb-2 block">
                        {query ? "Search Results" : "Collections"}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 uppercase">
                        {query ? `"${query}"` : "Shop All"}
                    </h1>
                    {query && (
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-1.5 mt-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            Clear search
                        </Link>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-8">
                <div className="flex-1 min-w-0">
                    {/* Controls bar */}
                    <div className="px-4">
                        <ShopControls count={count || 0} />
                    </div>

                        {/* Products Grid */}
                        {products && products.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-0">
                                {products.map((product: any) => (
                                    <DenseProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center">
                                <Package className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                                <h3 className="text-base font-black tracking-tight uppercase text-slate-900">
                                    No products found
                                </h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    Try adjusting your filters or search.
                                </p>
                                <Link
                                    href="/shop"
                                    className="inline-block mt-6 px-6 py-2.5 bg-slate-900 text-white text-[9px] font-bold tracking-[0.2em] rounded-full uppercase"
                                >
                                    Clear all filters
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }
