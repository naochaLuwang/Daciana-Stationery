"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Slide {
    id: string
    title: string
    subtitle: string
    cta: string
    href: string
    bg: string
    image?: string
    textColor?: string
}

const DEFAULT_SLIDES: Slide[] = [
    {
        id: "1",
        title: "New Arrivals",
        subtitle: "Discover the latest in premium stationery & cosmetics",
        cta: "Shop Now",
        href: "/shop",
        bg: "from-rose-100 via-pink-50 to-fuchsia-100",
    },
    {
        id: "2",
        title: "Up to 50% Off",
        subtitle: "Limited time deals on bestselling cosmetics",
        cta: "Grab Deals",
        href: "/shop",
        bg: "from-amber-100 via-orange-50 to-yellow-100",
    },
    {
        id: "3",
        title: "Stationery Edit",
        subtitle: "Artisan crafted notebooks, pens & desk accessories",
        cta: "Explore",
        href: "/shop",
        bg: "from-emerald-100 via-teal-50 to-cyan-100",
    },
]

export function HeroCarousel({ slides = DEFAULT_SLIDES }: { slides?: Slide[] }) {
    const [current, setCurrent] = useState(0)
    const touchStartX = useRef(0)
    const touchEndX = useRef(0)

    const next = useCallback(() => {
        setCurrent((prev) => (prev + 1) % slides.length)
    }, [slides.length])

    const prev = useCallback(() => {
        setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
    }, [slides.length])

    useEffect(() => {
        const timer = setInterval(next, 5000)
        return () => clearInterval(timer)
    }, [next])

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX
    }

    const handleTouchEnd = () => {
        const diff = touchStartX.current - touchEndX.current
        const threshold = 50
        if (Math.abs(diff) > threshold) {
            if (diff > 0) next()
            else prev()
        }
    }

    if (slides.length === 0) return null

    return (
        <div
            className="relative w-full overflow-hidden bg-white"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${current * 100}%)` }}
            >
                {slides.map((slide) => (
                    <Link
                        key={slide.id}
                        href={slide.href}
                        className={cn(
                            "relative min-w-full h-[55vh] sm:h-[450px] lg:h-[560px] flex items-center",
                            slide.image ? "" : `bg-gradient-to-r ${slide.bg}`
                        )}
                    >
                        {slide.image && (
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url('${slide.image}')` }}
                            />
                        )}
                        {slide.image && <div className="absolute inset-0 bg-black/25" />}
                        <div className="relative w-full px-6 sm:px-12 lg:px-20">
                            <div className="max-w-2xl space-y-4 sm:space-y-5">
                                <span className={cn(
                                    "inline-block text-[9px] font-semibold uppercase tracking-[0.25em]",
                                    slide.image ? "text-white/70" : slide.textColor ? `${slide.textColor}/70` : "text-slate-500"
                                )}>
                                    {slide.subtitle}
                                </span>
                                <h2 className={cn(
                                    "text-3xl sm:text-5xl lg:text-7xl font-normal tracking-tight leading-[1.05]",
                                    slide.textColor || "text-slate-900",
                                    slide.image && "text-white"
                                )}>
                                    {slide.title}
                                </h2>
                                <div className="pt-1 sm:pt-2">
                                    <span className={cn(
                                        "inline-flex items-center gap-2 px-6 py-3 sm:px-7 sm:py-3.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] transition-all active:scale-[0.97]",
                                        slide.image
                                            ? "bg-white text-slate-900 hover:bg-white/90"
                                            : "bg-slate-900 text-white hover:bg-slate-800"
                                    )}>
                                        {slide.cta}
                                        <span className="text-current opacity-50">→</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Progress dots */}
            <div className="absolute bottom-5 left-0 right-0">
                <div className="flex justify-center gap-2">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={cn(
                                "rounded-full transition-all duration-300",
                                i === current
                                    ? "w-8 h-1.5 bg-slate-900"
                                    : "w-1.5 h-1.5 bg-slate-300"
                            )}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
