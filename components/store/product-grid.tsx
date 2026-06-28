"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { DenseProductCard } from "./dense-product-card"
import { Loader2 } from "lucide-react"
import { getProductsByPage } from "@/app/actions/homepage"
import { ProductGridSkeleton } from "./product-skeleton"

interface ProductGridProps {
    initialProducts: any[]
    initialHasMore: boolean
}

export function ProductGrid({ initialProducts, initialHasMore }: ProductGridProps) {
    const [products, setProducts] = useState(initialProducts)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(initialHasMore)
    const [loading, setLoading] = useState(false)
    const sentinelRef = useRef<HTMLDivElement>(null)

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return
        setLoading(true)
        try {
            const result = await getProductsByPage(page, 8)
            setProducts((prev) => [...prev, ...result.products])
            setHasMore(result.hasMore)
            setPage((prev) => prev + 1)
        } catch (err) {
            console.error("Failed to load products:", err)
        } finally {
            setLoading(false)
        }
    }, [page, hasMore, loading])

    useEffect(() => {
        if (!hasMore || loading) return
        const sentinel = sentinelRef.current
        if (!sentinel) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore()
                }
            },
            { rootMargin: "200px" }
        )

        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [hasMore, loading, loadMore])

    return (
        <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0">
                {products.map((product: any) => (
                    <DenseProductCard key={product.id} product={product} />
                ))}
                {loading && <ProductGridSkeleton count={4} />}
            </div>

            {hasMore && (
                <div ref={sentinelRef} className="flex justify-center pt-8 pb-4">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-900 transition-all active:scale-[0.97] disabled:opacity-40"
                    >
                        {loading ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading</>
                        ) : (
                            "Load More"
                        )}
                    </button>
                </div>
            )}
        </div>
    )
}
