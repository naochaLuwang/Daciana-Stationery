"use client"

import { useSearchParams } from "next/navigation"
import { FilterDrawer } from "./filter-drawer"

export function ShopControls({ count }: { count: number }) {
    const searchParams = useSearchParams()

    return (
        <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <span className="text-slate-900">{count}</span>{" "}
                {count === 1 ? "product" : "products"}
            </p>
            <div className="lg:hidden">
                <FilterDrawer
                    currentSort={searchParams.get("sort") || undefined}
                    currentMin={searchParams.get("minPrice") || undefined}
                    currentMax={searchParams.get("maxPrice") || undefined}
                />
            </div>
        </div>
    )
}
