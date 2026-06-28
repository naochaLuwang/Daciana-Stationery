"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Timer, ChevronLeft, ChevronRight, Flame, Zap } from "lucide-react"
import { useCart } from "@/components/store/use-cart"
import { calculateDiscountedPrice } from "@/lib/price-helper"
import { toast } from "sonner"

function useCountdown(endTime: Date) {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

    useEffect(() => {
        const tick = () => {
            const diff = Math.max(0, endTime.getTime() - Date.now())
            setTimeLeft({
                hours: Math.floor(diff / 3600000),
                minutes: Math.floor((diff % 3600000) / 60000),
                seconds: Math.floor((diff % 60000) / 1000),
            })
        }
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [endTime])

    return timeLeft
}

function AnimatedCountdown({ value, label }: { value: number; label: string }) {
    const [animate, setAnimate] = useState(false)
    const prevValue = useRef(value)

    useEffect(() => {
        if (prevValue.current !== value) {
            setAnimate(true)
            const timer = setTimeout(() => {
                setAnimate(false)
                prevValue.current = value
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [value])

    return (
        <div className="flex flex-col items-center">
            <div className={`relative w-14 h-16 sm:w-16 sm:h-20 rounded-xl bg-slate-900 text-white flex items-center justify-center text-2xl sm:text-3xl font-black font-mono shadow-lg shadow-slate-900/20 overflow-hidden transition-transform ${animate ? 'scale-110' : 'scale-100'}`}>
                <div className={`absolute inset-0 bg-gradient-to-b from-white/10 to-transparent ${animate ? 'animate-pulse' : ''}`} />
                <span className="relative">{String(value).padStart(2, "0")}</span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1.5">{label}</span>
        </div>
    )
}

export function DealCountdown({ products }: { products: any[] }) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [scrollPos, setScrollPos] = useState(0)
    const addItem = useCart((state) => state.addItem)

    const dealEnd = new Date()
    dealEnd.setHours(23, 59, 59, 999)
    const timeLeft = useCountdown(dealEnd)

    if (!products || products.length === 0) return null

    const scroll = (dir: "left" | "right") => {
        if (!scrollRef.current) return
        const amount = 300
        const newPos = dir === "left" ? Math.max(0, scrollPos - amount) : scrollPos + amount
        scrollRef.current.scrollTo({ left: newPos, behavior: "smooth" })
        setScrollPos(newPos)
    }

    const hasExpired = timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0

    return (
        <section className="py-6 sm:py-10 bg-gradient-to-r from-red-50 via-orange-50 to-amber-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-200">
                            <Flame className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Deal of the Day</h2>
                                {!hasExpired && (
                                    <span className="flex items-center gap-1 text-[9px] font-black text-red-500 bg-red-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        <Zap className="w-3 h-3" /> Live
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 font-medium">Limited time offers — grab before they&apos;re gone!</p>
                        </div>
                    </div>

                    {/* Animated Countdown */}
                    <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-red-400" />
                        <AnimatedCountdown value={timeLeft.hours} label="hrs" />
                        <span className="text-2xl font-black text-slate-300 mt-[-16px]">:</span>
                        <AnimatedCountdown value={timeLeft.minutes} label="min" />
                        <span className="text-2xl font-black text-slate-300 mt-[-16px]">:</span>
                        <AnimatedCountdown value={timeLeft.seconds} label="sec" />
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={() => scroll("left")}
                        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-slate-50 transition-all hidden sm:flex"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div ref={scrollRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1 snap-x snap-mandatory">
                        {products.map((product: any) => {
                            const variants = product.product_variants || []
                            const active = variants.find((v: any) => v.is_default) || variants[0] || product
                            const orig = Number(active?.price ?? product.base_price ?? 0)
                            const dType = active?.discount_type || product.discount_type || "none"
                            const dVal = Number(active?.discount_value || product.discount_value || 0)
                            const sale = calculateDiscountedPrice(orig, dType, dVal)
                            const stock = variants.length > 0
                                ? variants.reduce((a: number, v: any) => a + Number(v.stock || 0), 0)
                                : Number(active?.stock || 0)

                            return (
                                <Link
                                    key={product.id}
                                    href={`/products/${product.id}`}
                                    className="group min-w-[200px] sm:min-w-[240px] bg-white rounded-2xl border border-orange-100 overflow-hidden hover:shadow-xl hover:border-orange-200 transition-all flex-shrink-0 snap-start"
                                >
                                    <div className="relative aspect-square bg-slate-50 overflow-hidden">
                                        {product.thumbnail_url && (
                                            <Image
                                                src={product.thumbnail_url}
                                                alt={product.name}
                                                fill
                                                sizes="240px"
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        )}
                                        {dType !== "none" && dVal > 0 && (
                                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                                                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-none text-[9px] font-black px-2 py-0.5 shadow-lg">
                                                    {dType === "percentage" ? `${dVal}% OFF` : `₹${dVal}`}
                                                </Badge>
                                                {stock > 0 && stock < 10 && (
                                                    <Badge className="bg-amber-500 text-white border-none text-[8px] font-black px-2 py-0.5">
                                                        Only {stock} left
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 space-y-2">
                                        <h3 className="text-xs font-bold text-slate-700 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-base font-black text-slate-900">₹{sale.toLocaleString("en-IN")}</span>
                                            {sale < orig && (
                                                <span className="text-[10px] text-slate-400 line-through">₹{orig.toLocaleString("en-IN")}</span>
                                            )}
                                            {sale < orig && dType === "percentage" && (
                                                <span className="text-[9px] font-black text-red-500 ml-auto">{dVal}% off</span>
                                            )}
                                        </div>
                                        {stock > 0 && !product.product_variants?.length && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    addItem({
                                                        id: product.id,
                                                        variantId: "base",
                                                        name: product.name,
                                                        variantTitle: "Default",
                                                        price: sale,
                                                        mrp: orig,
                                                        image: product.thumbnail_url,
                                                        quantity: 1,
                                                        stock,
                                                    })
                                                    toast.success(`${product.name} added!`)
                                                }}
                                                className="w-full h-8 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider hover:from-red-600 hover:to-orange-600 transition-all active:scale-95 shadow-md"
                                            >
                                                Add to Cart
                                            </button>
                                        )}
                                        {stock <= 0 && (
                                            <div className="w-full h-8 rounded-lg bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider flex items-center justify-center">
                                                Out of Stock
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>

                    <button
                        onClick={() => scroll("right")}
                        className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-slate-50 transition-all hidden sm:flex"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </section>
    )
}
