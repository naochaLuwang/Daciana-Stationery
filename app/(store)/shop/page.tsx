import { createClient } from "@/utils/supabase/server"
import { ProductCard } from "@/components/store/product-card"
import { Package, X } from "lucide-react"
import Link from "next/link"

export const metadata = {
    title: "Shop All Products | DACIANA",
    description: "Browse our latest collection of premium products.",
}

// Next.js 15+ searchParams is an async Promise
export default async function ShopPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; search?: string }>
}) {
    const supabase = await createClient()

    // 1. Get the search query from URL
    const params = await searchParams
    const query = params.q || params.search || ""

    // 2. Build the Supabase Query
    let supabaseQuery = supabase
        .from('products')
        .select(`
            *,
            product_images(url, alt),
            product_variants(*)
        `)
        .eq('status', 'active')

    // 3. Apply search filter if query exists
    if (query) {
        // Search in Name OR Brand (case-insensitive)
        supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
    }

    const { data: products, error } = await supabaseQuery.order('created_at', { ascending: false })

    if (error) console.error("Fetch error:", error)

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-16 text-center">
                    <span className="font-daciana text-primary tracking-[0.3em] uppercase text-[10px] mb-3 block">
                        {query ? 'Search Results' : 'Collections'}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 mb-4 uppercase">
                        {query ? `"${query}"` : 'SHOP ALL'}
                    </h1>

                    {query && (
                        <Link href="/shop" className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 hover:text-red-500 transition-colors uppercase">
                            <X className="w-3 h-3" /> Clear Search
                        </Link>
                    )}
                </div>
            </div>

            <main className="container mx-auto px-4 py-12">
                {/* Stats & Filter Bar */}
                <div className="flex justify-between items-center mb-8">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Showing <span className="text-slate-900">{products?.length || 0}</span> products
                    </p>
                    <div className="h-[1px] flex-1 bg-slate-200 mx-6 hidden md:block"></div>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                        Sort: <span className="text-primary cursor-pointer underline underline-offset-4">Newest</span>
                    </div>
                </div>

                {products && products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="py-32 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                        <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-black tracking-tight uppercase">No products found</h3>
                        <p className="text-slate-400 text-sm mt-2">Try searching for something else or browse categories.</p>
                        <Link href="/shop" className="inline-block mt-6 px-8 py-3 bg-slate-900 text-white text-[10px] font-bold tracking-widest rounded-full uppercase hover:bg-primary transition-colors">
                            Back to Shop
                        </Link>
                    </div>
                )}
            </main>
        </div>
    )
}