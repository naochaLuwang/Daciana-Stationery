"use client"

import { useState, useEffect } from "react"
import { useRecentlyViewed } from "@/hooks/use-recently-viewed"
import { getProductsByIds } from "@/app/actions/homepage"
import { DenseProductCard } from "./dense-product-card"

export function RecentlyViewed() {
    const ids = useRecentlyViewed((s) => s.items)
    const [products, setProducts] = useState<any[]>([])

    useEffect(() => {
        if (ids.length === 0) return
        getProductsByIds(ids.slice(0, 10)).then((data) => {
            const ordered = ids
                .map((id) => data.find((p: any) => p.id === id))
                .filter(Boolean)
            setProducts(ordered)
        })
    }, [ids])

    if (ids.length === 0 || products.length === 0) return null

    return (
        <section className="border-t border-slate-50">
            <div className="max-w-[1400px] mx-auto px-4 py-8 sm:py-10">
                <div className="mb-5">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                        CONTINUE SHOPPING
                    </span>
                    <h2 className="text-[22px] sm:text-[28px] font-normal tracking-tight text-slate-900 mt-1">
                        Recently Viewed
                    </h2>
                </div>

                <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4">
                    {products.map((product: any) => (
                        <div key={product.id} className="w-[160px] sm:w-[200px] shrink-0">
                            <DenseProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
