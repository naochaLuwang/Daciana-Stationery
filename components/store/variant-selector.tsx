"use client"

import { useState } from "react"
import { calculateDiscountedPrice } from "@/lib/price-helper"

interface VariantSelectorProps {
    product: any
    variants: any[]
    onVariantChange: (variant: any) => void
}

export function VariantSelector({ product, variants, onVariantChange }: VariantSelectorProps) {
    const defaultVariant = variants.find((v: any) => v.is_default) || variants[0]
    const [selectedVariant, setSelectedVariant] = useState<any>(defaultVariant)

    const handleSelect = (variant: any) => {
        setSelectedVariant(variant)
        onVariantChange(variant)
    }

    if (!selectedVariant) return null

    const originalPrice = Number(selectedVariant.price)
    const dType = selectedVariant.discount_type || "none"
    const dValue = Number(selectedVariant.discount_value || 0)
    const salePrice = calculateDiscountedPrice(originalPrice, dType, dValue)
    const stock = Number(selectedVariant.stock || 0)
    const hasDiscount = dType !== "none" && dValue > 0
    const discountPercent = originalPrice > 0 ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0

    const hasColorVariants = variants.some((v: any) => v.hex_code)
    const hasSizeVariants = variants.some((v: any) => !v.hex_code)

    return (
        <div className="space-y-5">
            {/* Price */}
            <div>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-2xl font-bold text-slate-900 tracking-tight">
                        ₹{Math.round(salePrice).toLocaleString("en-IN")}
                    </span>
                    {hasDiscount && (
                        <>
                            <span className="text-sm text-slate-400 line-through">
                                ₹{originalPrice.toLocaleString("en-IN")}
                            </span>
                            <span className="text-xs font-bold text-emerald-600">
                                {discountPercent}% OFF
                            </span>
                        </>
                    )}
                </div>
                {hasDiscount && (
                    <p className="text-[10px] font-bold text-emerald-600 mt-0.5">
                        ↯ You save ₹{Math.round(originalPrice - salePrice).toLocaleString("en-IN")}
                    </p>
                )}
            </div>

            {/* Color Variants */}
            {hasColorVariants && (
                <div>
                    <p className="text-xs font-bold text-slate-900 mb-2">
                        Color: <span className="text-slate-500 font-medium">{selectedVariant.title}</span>
                    </p>
                    <div className="flex gap-2">
                        {variants.filter((v: any) => v.hex_code).map((v: any) => (
                            <button
                                key={v.id}
                                onClick={() => handleSelect(v)}
                                className={`w-9 h-9 rounded-full border-2 transition-all ${selectedVariant.id === v.id
                                    ? "border-slate-900 scale-110"
                                    : "border-slate-200 hover:border-slate-400"
                                }`}
                                title={v.title}
                            >
                                <div
                                    className="w-full h-full rounded-full"
                                    style={{ backgroundColor: v.hex_code }}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Size/Option Variants */}
            {hasSizeVariants && (
                <div>
                    <p className="text-xs font-bold text-slate-900 mb-2">
                        Size: <span className="text-slate-500 font-medium">{selectedVariant.title}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {variants.map((v: any) => {
                            const vStock = Number(v.stock || 0)
                            const isVOut = vStock <= 0
                            return (
                                <button
                                    key={v.id}
                                    onClick={() => handleSelect(v)}
                                    disabled={isVOut}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${selectedVariant.id === v.id
                                        ? "bg-slate-900 text-white border-slate-900"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                                    } ${isVOut ? "opacity-30 cursor-not-allowed line-through" : ""}`}
                                >
                                    {v.title}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Stock info */}
            {stock > 0 && stock <= 5 && (
                <p className="text-[10px] font-bold text-red-500">
                    Only {stock} left — order soon
                </p>
            )}
        </div>
    )
}
