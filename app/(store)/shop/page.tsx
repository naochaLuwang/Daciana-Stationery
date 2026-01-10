import { createClient } from "@/utils/supabase/server"
import { ProductCard } from "@/components/store/product-card"
import { Package } from "lucide-react"

export const metadata = {
    title: "Shop All Products | Your Store",
    description: "Browse our latest collection of premium products.",
}

export default async function ShopPage() {
    const supabase = await createClient()
    // Fetch products with their images and variants
    const { data: products, error } = await supabase
        .from('products')
        .select(`
            *,
            product_images(url, alt),
            product_variants(*)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Fetch error:", error)
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 mb-4">
                        SHOP ALL
                    </h1>
                    <p className="text-slate-500 max-w-lg mx-auto uppercase tracking-widest text-xs font-bold">
                        Premium Quality • Fast Shipping • Secure Checkout
                    </p>
                </div>
            </div>

            <main className="container mx-auto px-4 py-12">
                {/* Stats & Filter Bar (Simplified) */}
                <div className="flex justify-between items-center mb-8">
                    <p className="text-sm font-medium text-slate-500">
                        Showing <span className="text-black font-bold">{products?.length || 0}</span> products
                    </p>
                    <div className="h-[1px] flex-1 bg-slate-200 mx-6 hidden md:block"></div>
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-tighter">
                        Sort by: <span className="cursor-pointer underline">Latest</span>
                    </div>
                </div>

                {products && products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="py-32 text-center">
                        <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold">No products found</h3>
                        <p className="text-slate-500">Check back later for new arrivals!</p>
                    </div>
                )}
            </main>
        </div>
    )
}