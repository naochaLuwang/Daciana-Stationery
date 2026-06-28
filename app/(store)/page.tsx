import { createClient } from "@/utils/supabase/server"
import { HeroCarousel } from "@/components/store/hero-carousel"
import { ValueProps } from "@/components/store/value-props"
import { CategoryGrid } from "@/components/store/category-grid"
import { PromoStrip } from "@/components/store/promo-strip"
import { BrandBanner } from "@/components/store/brand-banner"
import { TrendingRow } from "@/components/store/trending-row"
import { DenseProductCard } from "@/components/store/dense-product-card"
import { ProductGrid } from "@/components/store/product-grid"
import { RecentlyViewed } from "@/components/store/recently-viewed"

const PRODUCT_SELECT = `
  *,
  product_images(url, alt),
  product_variants(*)
`

export default async function HomePage() {
    const supabase = await createClient()

    const [
        bannersRes,
        categoriesRes,
        trendingRes,
        featuredRes,
        allProductsRes,
    ] = await Promise.all([
        supabase
            .from("banners")
            .select("*")
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),
        supabase
            .from("categories")
            .select("id, name, slug, image_url")
            .is("parent_id", null)
            .order("name"),
        supabase
            .from("products")
            .select(PRODUCT_SELECT)
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(8),
        supabase
            .from("products")
            .select(PRODUCT_SELECT)
            .eq("status", "active")
            .limit(4),
        supabase
            .from("products")
            .select(PRODUCT_SELECT, { count: "exact" })
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .range(0, 7),
    ])

    const banners = bannersRes.data || []
    const categories = categoriesRes.data || []
    const trending = trendingRes.data || []
    const featured = featuredRes.data || []
    const allProducts = allProductsRes.data || []
    const totalProducts = allProductsRes.count || 0

    const hasTrending = trending.length > 0
    const hasFeatured = featured.length > 0

    return (
        <>
            {/* ─── Hero Carousel (full-bleed) ─── */}
            <HeroCarousel slides={banners.map((b) => ({
                id: b.id,
                title: b.title,
                subtitle: b.subtitle || "",
                cta: b.cta,
                href: b.href,
                bg: b.bg_color,
                image: b.image_url || undefined,
                textColor: b.text_color || undefined,
            }))} />

            {/* ─── Value Props ─── */}
            <ValueProps />

            {/* ─── Shop by Category ─── */}
            <CategoryGrid categories={categories} />

            {/* ─── Promo Strip (full-bleed) ─── */}
            <PromoStrip />

            {/* ─── Best Sellers ─── */}
            {hasTrending && <TrendingRow products={trending} />}

            {/* ─── Brand Banner (full-bleed) ─── */}
            <BrandBanner />

            {/* ─── Top Picks ─── */}
            {hasFeatured && (
                <section className="border-t border-slate-50">
                    <div className="max-w-[1400px] mx-auto px-4 py-8 sm:py-10">
                        <div className="mb-5">
                            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                                CURATED
                            </span>
                            <h2 className="text-[22px] sm:text-[28px] font-normal tracking-tight text-slate-900 mt-1">
                                Top Picks
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0">
                            {featured.map((product: any) => (
                                <DenseProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ─── New Arrivals ─── */}
            <section className="border-t border-slate-50">
                <div className="max-w-[1400px] mx-auto px-4 py-8 sm:py-10">
                    <div className="mb-5">
                        <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                            NEW
                        </span>
                        <h2 className="text-[22px] sm:text-[28px] font-normal tracking-tight text-slate-900 mt-1">
                            New Arrivals
                        </h2>
                    </div>
                    <ProductGrid
                        initialProducts={allProducts}
                        initialHasMore={totalProducts > 8}
                    />
                </div>
            </section>

            {/* ─── Recently Viewed ─── */}
            <RecentlyViewed />
        </>
    )
}
