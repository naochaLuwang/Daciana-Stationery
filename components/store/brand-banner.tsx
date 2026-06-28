import Link from "next/link"

interface BrandBannerProps {
    title?: string
    subtitle?: string
    cta?: string
    href?: string
}

export function BrandBanner({
    title = "Premium Stationery & Cosmetics",
    subtitle = "Curated essentials for the modern lifestyle.",
    cta = "Explore the Collection",
    href = "/shop",
}: BrandBannerProps) {
    return (
        <section className="bg-slate-900">
            <div className="max-w-[1400px] mx-auto px-4 py-12 sm:py-16">
                <div className="max-w-xl mx-auto text-center space-y-4">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/30">
                        DACIANA
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-white leading-tight">
                        {title}
                    </h2>
                    <p className="text-sm text-white/50 leading-relaxed max-w-md mx-auto">
                        {subtitle}
                    </p>
                    <div className="pt-2">
                        <Link
                            href={href}
                            className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] hover:bg-white/90 transition-all active:scale-[0.97]"
                        >
                            {cta}
                            <span className="opacity-50">→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
