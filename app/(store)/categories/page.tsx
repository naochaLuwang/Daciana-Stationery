import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/utils/supabase/server"
import { ArrowRight } from "lucide-react"

export default async function CategoriesPage() {
    const supabase = await createClient()

    const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

    if (error) return <div className="py-20 text-center font-daciana tracking-widest">Loading...</div>

    return (
        <main className="min-h-screen bg-[#fafafa]">
            {/* Elegant Minimal Header */}
            <header className="py-12 px-4 bg-white border-b border-slate-100">
                <div className="container mx-auto text-center max-w-xl">
                    <span className="font-daciana text-primary tracking-[0.4em] uppercase text-[10px] mb-3 block">
                        The Collections
                    </span>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 mb-4 uppercase">
                        Browse by Category
                    </h1>
                    <div className="h-px w-12 bg-primary/30 mx-auto" />
                </div>
            </header>

            {/* Refined Smaller Grid */}
            <section className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {categories?.map((category) => (
                        <Link
                            key={category.id}
                            href={`/categories/${category.id}`}
                            className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-primary/20"
                        >
                            {/* Background Image with slight zoom effect */}
                            <div className="absolute inset-0 z-0">
                                {category.image_url ? (
                                    <Image
                                        src={category.image_url}
                                        alt={category.name}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200 uppercase text-[10px] tracking-widest">
                                        No Image
                                    </div>
                                )}
                            </div>

                            {/* Refined Gradient Overlay (starts higher for better text contrast) */}
                            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                            {/* Minimalist Content */}
                            <div className="absolute inset-0 z-20 p-5 flex flex-col justify-end">
                                <h2 className="text-xl font-black text-white tracking-tight uppercase leading-none mb-2">
                                    {category.name}
                                </h2>

                                {/* Animated "Explore" bar */}
                                <div className="flex items-center gap-2">
                                    <div className="h-[2px] w-0 bg-primary transition-all duration-500 group-hover:w-8" />
                                    <span className="text-[8px] font-bold text-white/0 tracking-[0.3em] uppercase transition-all duration-500 group-hover:text-white/100">
                                        Explore
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    )
}