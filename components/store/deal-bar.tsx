"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Clock } from "lucide-react"
import { calculateDiscountedPrice } from "@/lib/price-helper"

function CountdownTimer() {
    const [time, setTime] = useState({ h: 0, m: 0, s: 0 })

    useEffect(() => {
        function getRemaining() {
            const now = new Date()
            const end = new Date()
            end.setHours(23, 59, 59, 999)
            const diff = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000))
            return {
                h: Math.floor(diff / 3600),
                m: Math.floor((diff % 3600) / 60),
                s: diff % 60,
            }
        }

        setTime(getRemaining())
        const interval = setInterval(() => setTime(getRemaining()), 1000)
        return () => clearInterval(interval)
    }, [])

    const pad = (n: number) => String(n).padStart(2, "0")

    return (
        <div className="flex items-center gap-1">
            {[
                { val: time.h, label: "H" },
                { val: time.m, label: "M" },
                { val: time.s, label: "S" },
            ].map((item, i) => (
                <div key={i} className="flex items-center gap-0.5">
                    <span className="bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded min-w-[22px] text-center">
                        {pad(item.val)}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400">{item.label}</span>
                </div>
            ))}
        </div>
    )
}

export function DealBar({ products }: { products: any[] }) {
    if (!products || products.length === 0) return null

    return (
        <div className="mb-10 lg:mb-0">
            <div className="flex items-end justify-between px-4 mb-5">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                        ENDS TODAY
                    </p>
                    <h3 className="text-[26px] font-light text-slate-900 tracking-tight leading-none mt-0.5">
                        Flash Sale
                    </h3>
                </div>
                <CountdownTimer />
            </div>

            <div className="flex gap-3 overflow-x-auto px-4 no-scrollbar">
                {products.map((product: any) => {
                    const variants = product.product_variants || []
                    const active = variants.find((v: any) => v.is_default) || variants[0] || product
                    const orig = Number(active?.price ?? product.base_price ?? 0)
                    const dType = active?.discount_type || product.discount_type || "none"
                    const dVal = Number(active?.discount_value || product.discount_value || 0)
                    const sale = calculateDiscountedPrice(orig, dType, dVal)
                    const discountPercent = orig > 0 ? Math.round(((orig - sale) / orig) * 100) : 0

                    return (
                        <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            className="w-36 shrink-0"
                        >
                            <div className="bg-white border border-black/[0.06] rounded-2xl overflow-hidden">
                                <div className="relative aspect-square bg-[#F8F8F8]">
                                    {product.thumbnail_url && (
                                        <Image
                                            src={product.thumbnail_url}
                                            alt={product.name}
                                            fill
                                            sizes="144px"
                                            className="object-cover"
                                        />
                                    )}
                                    {discountPercent > 0 && (
                                        <div className="absolute top-2 left-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                                            {discountPercent}% OFF
                                        </div>
                                    )}
                                </div>
                                <div className="p-2.5">
                                    <h3 className="text-[11px] font-medium text-slate-800 line-clamp-1 leading-tight">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="text-sm font-bold text-slate-900">
                                            ₹{Math.round(sale).toLocaleString("en-IN")}
                                        </span>
                                        {sale < orig && (
                                            <span className="text-[9px] text-slate-400 line-through">
                                                ₹{orig.toLocaleString("en-IN")}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
