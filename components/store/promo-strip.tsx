"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

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
        <div className="flex items-center gap-3">
            {[
                { val: time.h, label: "HRS" },
                { val: time.m, label: "MIN" },
                { val: time.s, label: "SEC" },
            ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                    <span className="font-mono text-lg sm:text-xl font-semibold text-white tabular-nums">
                        {pad(item.val)}
                    </span>
                    <span className="text-[9px] font-semibold text-white/50">{item.label}</span>
                </div>
            ))}
        </div>
    )
}

export function PromoStrip() {
    return (
        <section className="bg-slate-900">
            <div className="max-w-[1400px] mx-auto px-4 py-8 sm:py-12">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-1 text-center sm:text-left">
                        <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/40">
                            LIMITED TIME
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-white">
                            Flash Sale — Up to 50% Off
                        </h2>
                        <p className="text-sm text-white/50">
                            Best-selling cosmetics & stationery at unbeatable prices
                        </p>
                    </div>
                    <div className="flex items-center gap-6 sm:gap-8">
                        <div className="border-r border-white/10 pr-6 sm:pr-8">
                            <CountdownTimer />
                        </div>
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] hover:bg-white/90 transition-all active:scale-[0.97] shrink-0"
                        >
                            Shop Sale
                            <span className="opacity-50">→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
