"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"

export function ProductImages({ images, thumbnail, activeImageFromVariant }: any) {
    const [mainIndex, setMainIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const [showLightbox, setShowLightbox] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    const allImages = images?.length > 0 ? images : thumbnail ? [{ url: thumbnail }] : []

    useEffect(() => {
        if (activeImageFromVariant) {
            const idx = allImages.findIndex((img: any) => img.url === activeImageFromVariant)
            if (idx >= 0) {
                setIsAnimating(true)
                setTimeout(() => {
                    setMainIndex(idx)
                    setIsAnimating(false)
                }, 150)
            }
        }
    }, [activeImageFromVariant])

    useEffect(() => {
        if (scrollRef.current) {
            const activeBtn = scrollRef.current.children[mainIndex] as HTMLElement
            if (activeBtn) {
                activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
            }
        }
    }, [mainIndex])

    if (allImages.length === 0) {
        return (
            <div className="aspect-square bg-[#F8F8F8] rounded-2xl flex items-center justify-center">
                <span className="text-slate-300 text-sm">No images</span>
            </div>
        )
    }

    return (
        <>
            {/* Main Image */}
            <div
                className="relative aspect-square overflow-hidden bg-[#F8F8F8] rounded-2xl"
                onClick={() => setShowLightbox(true)}
            >
                <img
                    src={allImages[mainIndex]?.url}
                    alt="Product"
                    className={`w-full h-full object-cover transition-all duration-200 ${isAnimating ? "opacity-40 scale-95" : "opacity-100 scale-100"}`}
                />
                <div className="absolute inset-0 bg-black/[0.02]" />

                {/* Image counter */}
                {allImages.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        {mainIndex + 1}/{allImages.length}
                    </div>
                )}

                {/* Nav arrows (desktop) */}
                {allImages.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); setMainIndex(Math.max(0, mainIndex - 1)) }}
                            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full items-center justify-center shadow-sm hover:bg-white transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setMainIndex(Math.min(allImages.length - 1, mainIndex + 1)) }}
                            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full items-center justify-center shadow-sm hover:bg-white transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
                <div ref={scrollRef} className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 py-2">
                    {allImages.map((img: any, i: number) => (
                        <button
                            key={img.url + i}
                            onClick={() => setMainIndex(i)}
                            className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${mainIndex === i ? "border-slate-900" : "border-transparent opacity-60 hover:opacity-100"}`}
                        >
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {showLightbox && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
                    onClick={() => setShowLightbox(false)}
                >
                    <button
                        onClick={() => setShowLightbox(false)}
                        className="absolute top-4 right-4 text-white/70 hover:text-white text-sm font-bold"
                    >
                        Close
                    </button>
                    <img
                        src={allImages[mainIndex]?.url}
                        alt="Product"
                        className="max-w-full max-h-full object-contain px-4"
                        onClick={(e) => e.stopPropagation()}
                    />
                    {allImages.length > 1 && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                            {allImages.map((_: any, i: number) => (
                                <button
                                    key={i}
                                    onClick={(e) => { e.stopPropagation(); setMainIndex(i) }}
                                    className={`w-2 h-2 rounded-full transition-colors ${mainIndex === i ? "bg-white" : "bg-white/30"}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
