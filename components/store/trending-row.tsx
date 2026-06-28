"use client"

import Link from "next/link"
import { DenseProductCard } from "@/components/store/dense-product-card"

export function TrendingRow({ products }: { products: any[] }) {
    if (!products || products.length === 0) return null

    return (
        <section className="border-t border-slate-50">
            <div className="max-w-[1400px] mx-auto px-4 py-8 sm:py-10">
                <div className="flex items-end justify-between mb-5">
                    <div>
                        <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                            TRENDING
                        </span>
                        <h2 className="text-[22px] sm:text-[28px] font-normal tracking-tight text-slate-900 mt-1">
                            Best Sellers
                        </h2>
                    </div>
                    <Link href="/shop" className="text-[11px] font-semibold text-slate-900 hover:opacity-60 transition-opacity shrink-0">
                        View All →
                    </Link>
                </div>

                <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4">
                    {products.map((product) => (
                        <div key={product.id} className="w-[160px] sm:w-[200px] shrink-0">
                            <DenseProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
