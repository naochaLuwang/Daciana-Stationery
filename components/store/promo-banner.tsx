import Link from "next/link"
import { Truck, ArrowRight } from "lucide-react"

interface PromoBannerProps {
    title?: string
    subtitle?: string
    cta?: string
    href?: string
    variant?: "default" | "dark"
}

export function PromoBanner({
    title = "Free Shipping on Orders Above ₹999",
    subtitle = "Hassle-free returns within 30 days",
    cta = "Shop Now",
    href = "/shop",
    variant = "default",
}: PromoBannerProps) {
    const isDark = variant === "dark"

    return (
        <section className={`${isDark ? "bg-slate-900 text-white" : "bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 text-slate-900"}`}>
            <div className="container mx-auto px-4 py-6 sm:py-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? "bg-white/10" : "bg-white shadow-sm"}`}>
                            <Truck className={`w-6 h-6 ${isDark ? "text-white" : "text-blue-600"}`} />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-black uppercase tracking-tight">{title}</h3>
                            <p className={`text-xs ${isDark ? "text-white/60" : "text-slate-500"}`}>{subtitle}</p>
                        </div>
                    </div>
                    <Link
                        href={href}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-full transition-all ${
                            isDark
                                ? "bg-white text-slate-900 hover:bg-white/90"
                                : "bg-slate-900 text-white hover:bg-slate-800"
                        }`}
                    >
                        {cta} <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
