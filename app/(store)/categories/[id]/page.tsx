import { createClient } from "@/utils/supabase/server"
import { CategoryCard } from "@/components/store/category-card"
import { ProductCard } from "@/components/store/product-card"
import { ChevronLeft, SlidersHorizontal, ImageOff } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: category } = await supabase
        .from("categories")
        .select(`
            name,
            image_url,
            parent_id,
            parent:categories!parent_id(id,name, slug),
            sub_categories:categories(id, name, slug, image_url) 
        `)
        .eq("id", id)
        .single()

    const { data: products } = await supabase
        .from("products")
        .select(`
            *,
            product_categories!inner(category_id),
            product_variants(id, price, stock, is_default)
        `)
        .eq("product_categories.category_id", id)
        .eq("status", "active")

    return (
        <div className="min-h-screen bg-white">
            {/* 1. HERO HEADER SECTION */}
            <div className="relative h-[40vh] w-full flex items-center justify-center overflow-hidden bg-slate-900">
                {/* Safe check: render only if image_url is present and not empty */}
                {category?.image_url && category.image_url.trim() !== "" ? (
                    <Image
                        src={category.image_url}
                        alt={category.name || "Category Image"}
                        fill
                        priority
                        className="object-cover opacity-60 scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white" />

                <div className="relative z-10 text-center space-y-4">
                    <Link
                        href="/"
                        className="inline-flex items-center text-xs font-bold tracking-widest uppercase text-white/80 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
                    </Link>
                    <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter">
                        {category?.name}
                    </h1>
                    <div className="w-12 h-1 bg-primary mx-auto" />
                </div>
            </div>

            <main className="container mx-auto px-4 -mt-10 relative z-20 pb-24">
                {/* 2. SUB-CATEGORY SLIDER */}
                {category?.sub_categories && category.sub_categories.length > 0 && (
                    <section className="mb-16">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Refine Collection</h2>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                            {category.sub_categories.map((sub: any) => (
                                <Link
                                    key={sub.id}
                                    href={`/categories/${sub.id}`}
                                    className="flex-shrink-0 group relative w-40 h-40 rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-sm hover:shadow-xl transition-all duration-500"
                                >
                                    {/* Safe check for sub-category image */}
                                    {sub.image_url && sub.image_url.trim() !== "" ? (
                                        <Image
                                            alt={sub.name}
                                            src={sub.image_url}
                                            fill
                                            sizes="160px"
                                            className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center gap-2">
                                            <ImageOff className="w-5 h-5 text-slate-300" />
                                            <span className="text-[10px] text-slate-400 uppercase font-bold">No Image</span>
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                                    <div className="absolute inset-0 flex items-center justify-center p-4">
                                        <span className="text-white text-sm font-bold uppercase tracking-wider text-center drop-shadow-md">
                                            {sub.name}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. PRODUCT GRID WITH STICKY FILTER BAR */}
                <section className="space-y-8">
                    <div className="sticky top-20 z-30 bg-white/80 backdrop-blur-md py-4 border-b flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Showing <span className="text-black">{products?.length || 0}</span> Products
                        </p>
                        <Button variant="outline" size="sm" className="rounded-full text-xs font-bold uppercase tracking-tighter">
                            <SlidersHorizontal className="w-3 h-3 mr-2" /> Sort & Filter
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-8">
                        {products && products.length > 0 ? (
                            products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                                <p className="text-slate-400 font-medium italic">No pieces found in this selection.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    )
}