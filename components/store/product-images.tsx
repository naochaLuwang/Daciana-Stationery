"use client"

import { useState, useEffect } from "react"

export function ProductImages({ images, thumbnail, activeImageFromVariant }: any) {
    const [mainImage, setMainImage] = useState(activeImageFromVariant || images[0]?.url)
    const [isAnimating, setIsAnimating] = useState(false)

    // Trigger animation and swap image when variant changes
    useEffect(() => {
        if (activeImageFromVariant && activeImageFromVariant !== mainImage) {
            setIsAnimating(true)
            const timeout = setTimeout(() => {
                setMainImage(activeImageFromVariant)
                setIsAnimating(false)
            }, 200) // Matches duration-200
            return () => clearTimeout(timeout)
        }
    }, [activeImageFromVariant])

    useEffect(() => {
        const imageExists = images.some((img: any) => img.url === mainImage)
        if (!imageExists && images.length > 0) {
            setMainImage(images[0].url)
        }
    }, [images])

    return (
        <div className="flex flex-col gap-4">
            <div className="aspect-square overflow-hidden rounded-2xl border bg-slate-50 relative">
                <img
                    src={mainImage}
                    alt="Product"
                    className={`h-full w-full object-cover transition-all duration-300 ease-in-out ${isAnimating ? "opacity-40 scale-95 blur-sm" : "opacity-100 scale-100 blur-0"
                        }`}
                />
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {images?.map((img: any, i: number) => (
                    <button
                        key={img.url + i}
                        onClick={() => setMainImage(img.url)}
                        className={`w-20 h-20 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-colors ${mainImage === img.url ? "border-primary" : "border-transparent"
                            }`}
                    >
                        <img src={img.url} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
    )
}