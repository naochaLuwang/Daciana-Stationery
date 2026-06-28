"use client"

import { useEffect, useRef, useState } from "react"

export function HeaderScroll({ children }: { children: React.ReactNode }) {
    const [scrolled, setScrolled] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    return (
        <div
            ref={ref}
            className={`sticky top-0 z-50 w-full transition-all duration-300 ${
                scrolled ? "bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.04)]" : "bg-white/80 backdrop-blur-sm"
            }`}
        >
            {children}
        </div>
    )
}
