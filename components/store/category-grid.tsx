import Link from "next/link"
import Image from "next/image"
import { ShoppingBag } from "lucide-react"

const FALLBACK_CATEGORIES = [
    { id: "cosmetics", name: "Cosmetics", slug: "cosmetics", image_url: null },
    { id: "stationery", name: "Stationery", slug: "stationery", image_url: null },
    { id: "pens", name: "Pens", slug: "pens", image_url: null },
    { id: "notebooks", name: "Notebooks", slug: "notebooks", image_url: null },
]

export function CategoryGrid({ categories }: { categories?: { id: string; name: string; slug?: string; image_url?: string | null }[] }) {
    const cats = categories?.length ? categories : FALLBACK_CATEGORIES

    return (
        <section className="border-t border-slate-50">
            <div className="max-w-[1400px] mx-auto px-4 py-8 sm:py-12">
                <div className="mb-6 sm:mb-8">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                        BROWSE
                    </span>
                    <h2 className="text-[22px] sm:text-[28px] font-normal tracking-tight text-slate-900 mt-1">
                        Shop by Category
                    </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {cats.slice(0, 4).map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/categories/${cat.slug || cat.id}`}
                            className="group relative aspect-[4/5] overflow-hidden bg-slate-50 active:scale-[0.98] transition-all duration-200"
                        >
                            {cat.image_url ? (
                                <Image
                                    src={cat.image_url}
                                    alt={cat.name}
                                    fill
                                    sizes="(max-width: 640px) 50vw, 25vw"
                                    className="object-cover transition-all duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag className="w-8 h-8 text-slate-200" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                                <p className="text-white text-sm sm:text-base font-semibold tracking-tight leading-tight">
                                    {cat.name}
                                </p>
                                <p className="text-white/50 text-[8px] font-semibold uppercase tracking-[0.15em] mt-1">
                                    Shop now →
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
