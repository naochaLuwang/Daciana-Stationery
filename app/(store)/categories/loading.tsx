import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <main className="min-h-screen bg-[#fafafa]">
            {/* Elegant Minimal Header Skeleton */}
            <header className="py-12 px-4 bg-white border-b border-slate-100">
                <div className="container mx-auto text-center max-w-xl flex flex-col items-center">
                    <Skeleton className="h-3 w-32 mb-3 rounded-full" />
                    <Skeleton className="h-10 w-64 md:w-80 mb-4 rounded-lg" />
                    <Skeleton className="h-px w-12" />
                </div>
            </header>

            {/* Refined Grid Skeleton */}
            <section className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 flex flex-col justify-end"
                        >
                            {/* The Shimmering Background */}
                            <Skeleton className="absolute inset-0 z-0 rounded-none" />

                            {/* Text Placeholders */}
                            <div className="relative z-10 space-y-3">
                                <Skeleton className="h-6 w-3/4 bg-slate-200/50" />
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-[2px] w-8 bg-slate-200/50" />
                                    <Skeleton className="h-2 w-12 bg-slate-200/50" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    )
}