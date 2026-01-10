"use client"

import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, ArrowRight } from "lucide-react"

export function ProductCard({ product }: { product: any }) {
    // Ensure variants is always an array
    const variants = product.product_variants || []

    // LOGIC FIX: Check if variants actually exist in the data, regardless of the boolean flag
    const hasVariantsData = variants.length > 0

    // 1. DATA SELECTION: Find the default variant or fallback to the first one
    // FIX: Use loose truthy check for is_default to handle potential string/boolean mismatch
    const activeSource = hasVariantsData
        ? (variants.find((v: any) => v.is_default) || variants[0])
        : product

    // 2. PRICE CALCULATIONS
    // Prioritize the price from the activeSource (variant), fallback to base_price
    const originalPrice = Number(activeSource?.price ?? product.base_price ?? 0)

    // Discount logic: Check variant first, then parent product
    const dType = activeSource?.discount_type || product.discount_type || 'none'
    const dValue = Number(activeSource?.discount_value || product.discount_value || 0)

    let salePrice = originalPrice
    if (dType === 'percentage' && dValue > 0) {
        salePrice = originalPrice - (originalPrice * (dValue / 100))
    } else if (dType === 'amount' && dValue > 0) {
        salePrice = originalPrice - dValue
    }

    // 3. BUG-PROOF STOCK LOGIC
    // totalStockPool: Sum of ALL variants (if any)
    const totalStockPool = variants.reduce((acc: number, v: any) => acc + Number(v.stock || 0), 0)

    // currentStock: Stock of the SPECIFIC variant being shown
    const currentStock = Number(activeSource?.stock || 0)

    /**
     * LOGIC SUMMARY:
     * If product has variants: It is OOS only if the ENTIRE POOL is 0.
     * If product has NO variants: Use the product's own stock or base logic.
     */
    const isOutOfStock = hasVariantsData ? totalStockPool <= 0 : currentStock <= 0

    return (
        <div className="group bg-white rounded-2xl p-3 border hover:shadow-lg transition-all duration-300 relative">
            <Link href={`/products/${product.id}`} className="flex flex-col h-full">

                {/* IMAGE CONTAINER */}
                <div className="aspect-square relative overflow-hidden rounded-xl bg-slate-50">
                    {product.thumbnail_url ? (
                        <Image
                            src={product.thumbnail_url}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className={`object-cover transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ShoppingBag className="w-10 h-10" />
                        </div>
                    )}

                    {/* OVERLAYS */}
                    {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-10">
                            <Badge variant="destructive" className="uppercase font-bold shadow-xl border-none">
                                Out of Stock
                            </Badge>
                        </div>
                    )}

                    {!isOutOfStock && dType !== 'none' && dValue > 0 && (
                        <Badge className="absolute top-2 right-2 bg-red-600 border-none text-[10px] px-2 font-bold z-10">
                            {dType === 'percentage' ? `${dValue}% OFF` : `₹${dValue} OFF`}
                        </Badge>
                    )}
                </div>

                {/* PRODUCT INFO */}
                <div className="mt-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {product.brand}
                        </span>
                        {hasVariantsData && (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {variants.length} SHADES
                            </span>
                        )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mt-1 mb-2 leading-tight">
                        {product.name}
                    </h3>

                    {/* PRICING */}
                    <div className="flex items-center gap-2 mt-auto">
                        <span className={`text-lg font-black ${isOutOfStock ? 'text-slate-400' : 'text-slate-900'}`}>
                            ₹{Math.round(salePrice).toLocaleString('en-IN')}
                        </span>
                        {!isOutOfStock && salePrice < originalPrice && (
                            <span className="text-xs text-slate-400 line-through">
                                ₹{Math.round(originalPrice).toLocaleString('en-IN')}
                            </span>
                        )}
                    </div>

                    {/* STOCK WARNING */}
                    {!isOutOfStock && currentStock > 0 && currentStock <= 5 && (
                        <p className="text-[10px] text-orange-600 font-bold mt-1 uppercase">
                            Only {currentStock} left!
                        </p>
                    )}
                </div>
            </Link>
        </div>
    )
}
