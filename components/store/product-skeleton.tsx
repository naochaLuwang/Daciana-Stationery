export function ProductSkeleton() {
    return (
        <div className="flex flex-col bg-white border border-slate-100 rounded-xl overflow-hidden animate-pulse">
            <div className="aspect-square bg-slate-100" />
            <div className="p-3 space-y-2">
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-5 bg-slate-100 rounded w-1/3 mt-2" />
                <div className="h-8 bg-slate-100 rounded-lg w-full mt-1" />
            </div>
        </div>
    )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <ProductSkeleton key={i} />
            ))}
        </div>
    )
}
