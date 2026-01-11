import { createClient } from "@/utils/supabase/server"
import { ProductCard } from "@/components/store/product-card"
import { ChevronLeft, ImageOff } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { FilterDrawer } from "@/components/store/filter-drawer"

export default async function CategoryPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ sort?: string; minPrice?: string; maxPrice?: string }>
}) {
    const { id } = await params
    const { sort, minPrice, maxPrice } = await searchParams
    const supabase = await createClient()

    // 1. Fetch Category Data
    const { data: category } = await supabase
        .from("categories")
        .select(`
            name,
            image_url,
            sub_categories:categories(id, name, slug, image_url) 
        `)
        .eq("id", id)
        .single()

    // 2. Build Base Product Query
    let query = supabase
        .from("products")
        .select(`
            *,
            product_categories!inner(category_id),
            product_variants(*)
        `)
        .eq("product_categories.category_id", id)
        .eq("status", "active")

    // 3. Apply Filters
    if (minPrice) query = query.gte('base_price', Number(minPrice))
    if (maxPrice) query = query.lte('base_price', Number(maxPrice))

    // 4. Apply Sorting
    if (sort === 'price_asc') query = query.order('base_price', { ascending: true })
    else if (sort === 'price_desc') query = query.order('base_price', { ascending: false })
    else if (sort === 'newest') query = query.order('created_at', { ascending: false })
    else query = query.order('name', { ascending: true })

    const { data: products } = await query

    return (
        <div className="min-h-screen bg-white">
            {/* HERO HEADER */}
            <div className="relative h-[45vh] w-full flex items-center justify-center overflow-hidden bg-slate-900">
                {category?.image_url ? (
                    <Image
                        src={category.image_url}
                        alt={category.name}
                        fill
                        priority
                        className="object-cover opacity-60 scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white" />
                <div className="relative z-10 text-center space-y-4">
                    <Link href="/" className="inline-flex items-center text-[10px] font-black tracking-[0.3em] uppercase text-white/80 hover:text-white transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
                    </Link>
                    <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter">
                        {category?.name}
                    </h1>
                </div>
            </div>

            <main className="container mx-auto px-4 -mt-12 relative z-20 pb-24">
                {/* SUB-CATEGORY SLIDER */}
                {category?.sub_categories && category.sub_categories.length > 0 && (
                    <section className="mb-20">
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                            {category.sub_categories.map((sub: any) => (
                                <Link key={sub.id} href={`/categories/${sub.id}`} className="flex-shrink-0 group relative w-44 h-44 rounded-[2rem] overflow-hidden border border-slate-100 bg-white shadow-sm transition-all hover:shadow-xl">
                                    {sub.image_url ? (
                                        <Image alt={sub.name} src={sub.image_url} fill className="object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
                                            <ImageOff className="w-5 h-5 text-slate-200" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors" />
                                    <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                                        <span className="text-white text-[11px] font-black uppercase tracking-widest">{sub.name}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* STICKY FILTER BAR */}
                <div className="sticky top-[72px] z-30 bg-white/90 backdrop-blur-xl py-6 mb-12 border-b flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Collection <span className="text-black ml-1">{products?.length || 0} Pieces</span>
                        </p>
                    </div>

                    <FilterDrawer
                        currentSort={sort}
                        currentMin={minPrice}
                        currentMax={maxPrice}
                    />
                </div>

                {/* PRODUCT GRID */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16">
                    {products && products.length > 0 ? (
                        products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <div className="col-span-full py-40 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No pieces found in this selection.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}