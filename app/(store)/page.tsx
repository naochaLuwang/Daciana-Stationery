import { createClient } from "@/utils/supabase/server"
import { CategoryCard } from "@/components/store/category-card"
import { ProductCard } from "@/components/store/product-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch categories (already in your code)
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .is("parent_id", null)

  // Helper function to find the right ID based on the name
  const cosmeticCategory = categories?.find(c => c.name.toLowerCase() === 'cosmetics');
  return (
    <div className="bg-background-light dark:bg-background-dark font-display antialiased">

      {/* 1. DUAL HERO SECTION */}
      <main className="flex flex-col lg:flex-row h-screen w-full split-container overflow-hidden">

        {/* COSMETICS (LEFT) */}
        <section className="split-panel relative w-full lg:w-1/2 h-1/2 lg:h-full group overflow-hidden bg-cosmetic-pink">
          <div
            className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-105 bg-cover bg-center"
            style={{ backgroundImage: `linear-gradient(to right, rgba(253, 242, 248, 0.4), rgba(253, 242, 248, 0.1)), url('/hero-cosmetics.png')` }}
          />
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-8 lg:px-20">
            <span className="text-xs font-bold tracking-[0.3em] text-pink-500 uppercase mb-4 block">The Beauty Edit</span>
            <h2 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter mb-6">COSMETICS</h2>
            <p className="max-w-md text-gray-700 text-sm mb-8 leading-relaxed">
              Elevate your daily ritual. Discover our premium skincare and botanical beauty essentials.
            </p>
            <div className="flex gap-4">
              <Button asChild className="bg-gray-900 text-white rounded-lg px-10 py-6 uppercase tracking-widest text-xs font-bold hover:bg-primary transition-all">
                <Link href={`/categories/${cosmeticCategory?.id}`}>Shop Beauty</Link>
              </Button>
            </div>

            {/* HOVER GRID OVERLAY (Cosmetics) */}
            <div className="absolute bottom-10 left-10 right-10 hidden xl:grid grid-cols-3 gap-4 translate-y-20 group-hover:translate-y-0 transition-all duration-500 opacity-0 group-hover:opacity-100">
              <HeroQuickCard label="New" title="Lip Glow" img="/products/lip-glow.jpg" color="text-pink-600" />
              <HeroQuickCard label="Best Seller" title="Hydra Serum" img="/products/serum.jpg" color="text-pink-600" />
              <HeroQuickCard label="Classic" title="Velvet Tint" img="/products/tint.jpg" color="text-pink-600" />
            </div>
          </div>
        </section>

        {/* STATIONERY (RIGHT) */}
        <section className="split-panel relative w-full lg:w-1/2 h-1/2 lg:h-full group overflow-hidden bg-stationery-sage">
          <div
            className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-105 bg-cover bg-center"
            style={{ backgroundImage: `linear-gradient(to left, rgba(241, 245, 242, 0.4), rgba(241, 245, 242, 0.1)), url('/hero-stationery.png')` }}
          />
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-8 lg:px-20">
            <span className="text-xs font-bold tracking-[0.3em] text-emerald-600 uppercase mb-4 block">The Artisan Collection</span>
            <h2 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter mb-6">STATIONERY</h2>
            <p className="max-w-md text-gray-700 text-sm mb-8 leading-relaxed">
              The art of the written word. Explore our curated selection of artisan journals.
            </p>
            <Button asChild variant="outline" className="border-gray-900/10 rounded-lg px-10 py-6 uppercase tracking-widest text-xs font-bold hover:bg-white/50 transition-all">
              <Link href="/shop?category=stationery">Shop Collection</Link>
            </Button>

            {/* HOVER GRID OVERLAY (Stationery) */}
            <div className="absolute bottom-10 left-10 right-10 hidden xl:grid grid-cols-3 gap-4 translate-y-20 group-hover:translate-y-0 transition-all duration-500 opacity-0 group-hover:opacity-100">
              <HeroQuickCard label="Limited" title="A5 Journal" img="/products/journal.jpg" color="text-emerald-600" />
              <HeroQuickCard label="Precision" title="Ink Quill" img="/products/pen.jpg" color="text-emerald-600" />
              <HeroQuickCard label="Focus" title="2024 Planner" img="/products/planner.jpg" color="text-emerald-600" />
            </div>
          </div>
        </section>
      </main>


    </div>
  )
}

// Helper component for the small floating cards
function HeroQuickCard({ label, title, img, color }: { label: string, title: string, img: string, color: string }) {
  return (
    <div className="bg-white/40 backdrop-blur-md rounded-lg p-2 flex items-center gap-3">
      <div className="size-12 rounded bg-cover bg-center" style={{ backgroundImage: `url('${img}')` }}></div>
      <div className="text-left">
        <p className={`text-[10px] font-bold uppercase ${color}`}>{label}</p>
        <p className="text-xs font-bold text-gray-900">{title}</p>
      </div>
    </div>
  )
}