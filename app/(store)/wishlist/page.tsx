"use client"

import { useWishlist } from "@/hooks/use-wishlist"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { ProductCard } from "@/components/store/product-card"
import { ShoppingBag, Heart, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export default function WishlistPage() {
    const { items: wishlistIds } = useWishlist()
    const [products, setProducts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchWishlistProducts() {
            if (wishlistIds.length === 0) {
                setProducts([])
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            const { data, error } = await supabase
                .from("products")
                .select("*, product_images(url, alt), product_variants(*)")
                .in("id", wishlistIds)
                .eq("status", "active")

            if (error) {
                console.error("Error fetching wishlist:", error)
            } else {
                setProducts(data || [])
            }
            setIsLoading(false)
        }

        fetchWishlistProducts()
    }, [wishlistIds])

    return (
        <div className="min-h-screen bg-slate-50 py-12 md:py-24">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-pink-500 tracking-[0.4em] uppercase flex items-center gap-2">
                            <Heart className="w-3 h-3 fill-current" /> My Favorites
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-slate-900">
                            Your Wishlist
                        </h1>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        {products.length} Items Saved
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="aspect-square rounded-3xl w-full" />
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-sm px-6 max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Heart className="w-8 h-8 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight uppercase text-slate-900 mb-4">Your wishlist is empty</h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed font-medium">
                            Save items you love to your wishlist and they'll show up here so you can easily find them later.
                        </p>
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-3 mt-10 px-10 py-5 bg-slate-900 text-white text-[10px] font-black tracking-[0.2em] rounded-full uppercase hover:bg-primary hover:scale-105 transition-all shadow-xl shadow-slate-200"
                        >
                            Start Shopping <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
