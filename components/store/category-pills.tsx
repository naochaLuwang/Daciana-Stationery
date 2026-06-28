"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingBag } from "lucide-react"

const FALLBACK_CATEGORIES = [
    { id: "cosmetics", name: "Cosmetics", slug: "cosmetics", image_url: null },
    { id: "stationery", name: "Stationery", slug: "stationery", image_url: null },
    { id: "pens", name: "Pens", slug: "pens", image_url: null },
    { id: "notebooks", name: "Notebooks", slug: "notebooks", image_url: null },
]

export function CategoryCards({ categories }: { categories?: { id: string; name: string; slug?: string; image_url?: string | null }[] }) {
    const cats = categories?.length ? categories : FALLBACK_CATEGORIES

    return (
        <div className="mb-10 lg:mb-0">
            <div className="flex items-end justify-between px-4 mb-5">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                        BROWSE
                    </p>
                    <h3 className="text-[26px] font-light text-slate-900 tracking-tight leading-none mt-0.5">
                        Shop For
                    </h3>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4">
                {cats.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/categories/${cat.slug || cat.id}`}
                        className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 active:scale-[0.97] transition-all duration-200"
                    >
                        {cat.image_url ? (
                            <Image
                                src={cat.image_url}
                                alt={cat.name}
                                fill
                                sizes="(max-width: 640px) 50vw, 25vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                <ShoppingBag className="w-8 h-8 text-slate-200" />
                            </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                        <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="text-white text-[13px] font-bold tracking-tight leading-tight">
                                {cat.name}
                            </p>
                            <p className="text-white/50 text-[8px] font-semibold uppercase tracking-[0.15em] mt-0.5">
                                Explore
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
