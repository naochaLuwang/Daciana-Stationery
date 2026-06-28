"use client"

import Link from "next/link"
import Image from "next/image"

interface Category {
    id: string
    name: string
    slug: string
    image_url: string | null
    parent_id: string | null
}

export function CategoryBrowse({
    parents,
    childrenByParent,
}: {
    parents: Category[]
    childrenByParent: Record<string, Category[]>
}) {
    const allChildren = Object.values(childrenByParent).flat()

    return (
        <main className="min-h-screen bg-white">
            <div className="px-4 pt-12 pb-6 border-b border-slate-100">
                <span className="text-primary tracking-[0.4em] uppercase text-[10px] font-semibold">
                    The Collections
                </span>
                <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase mt-1">
                    Browse by Category
                </h1>
            </div>

            {parents.length === 0 ? (
                <div className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                        {allChildren.map((cat) => (
                            <Card key={cat.id} category={cat} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {parents.map((parent) => {
                        const children = childrenByParent[parent.id] ?? []
                        return (
                            <section key={parent.id} className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-black tracking-tight uppercase text-slate-900">
                                        {parent.name}
                                    </h2>
                                    <Link
                                        href={`/categories/${parent.id}`}
                                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400"
                                    >
                                        View All
                                    </Link>
                                </div>
                                {children.length === 0 ? (
                                    <p className="text-xs text-slate-400 uppercase tracking-widest text-center py-8">
                                        No sub-categories yet
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {children.map((child) => (
                                            <Card key={child.id} category={child} />
                                        ))}
                                    </div>
                                )}
                            </section>
                        )
                    })}
                </div>
            )}
        </main>
    )
}

function Card({ category }: { category: Category }) {
    return (
        <Link
            href={`/categories/${category.id}`}
            className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm"
        >
            <div className="absolute inset-0">
                {category.image_url ? (
                    <Image
                        src={category.image_url}
                        alt={category.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-50" />
                )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="text-lg font-black text-white tracking-tight uppercase leading-none">
                    {category.name}
                </h3>
            </div>
        </Link>
    )
}
