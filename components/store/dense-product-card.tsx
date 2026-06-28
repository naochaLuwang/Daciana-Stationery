"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Heart, ShoppingBag, Plus, X, Check, Palette, Star, StarHalf } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useCart } from "@/components/store/use-cart"
import { calculateDiscountedPrice } from "@/lib/price-helper"

function RatingStars({ rating, size = 10 }: { rating: number; size?: number }) {
    const full = Math.floor(rating)
    const half = rating % 1 >= 0.5
    const empty = 5 - full - (half ? 1 : 0)
    return (
        <div className="flex items-center gap-[1px]">
            {Array.from({ length: full }).map((_, i) => (
                <Star key={`f-${i}`} className="fill-amber-400 text-amber-400" style={{ width: size, height: size }} />
            ))}
            {half && <StarHalf className="fill-amber-400 text-amber-400" style={{ width: size, height: size }} />}
            {Array.from({ length: empty }).map((_, i) => (
                <Star key={`e-${i}`} className="text-slate-200" style={{ width: size, height: size }} />
            ))}
        </div>
    )
}

export function DenseProductCard({ product }: { product: any }) {
    const [isWishlisted, setIsWishlisted] = React.useState(false)
    const [isPending, setIsPending] = React.useState(false)
    const [showVariantSelector, setShowVariantSelector] = React.useState(false)
    const [justAdded, setJustAdded] = React.useState(false)
    const [averageRating, setAverageRating] = React.useState(0)
    const [mounted, setMounted] = React.useState(false)

    const supabase = createClient()
    const router = useRouter()
    const addItem = useCart((s) => s.addItem)
    const cartItems = useCart((s) => s.items)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    React.useEffect(() => {
        fetchAverageRating()
        checkWishlistStatus()
    }, [])

    const fetchAverageRating = async () => {
        try {
            const { data: reviews } = await supabase
                .from("product_reviews")
                .select("rating")
                .eq("product_id", product.id)
                .eq("is_approved", true)
            if (reviews && reviews.length > 0) {
                const avg = reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
                setAverageRating(Math.round(avg * 10) / 10)
            }
        } catch { }
    }

    const checkWishlistStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data } = await supabase
                .from("wishlist")
                .select("id")
                .eq("user_id", user.id)
                .eq("product_id", product.id)
                .maybeSingle()
            if (data) setIsWishlisted(true)
        } catch { }
    }

    const variants = product.product_variants || []
    const hasVariants = product.has_variants && variants.length > 0
    const activeSource = variants.length > 0
        ? (variants.find((v: any) => v.is_default) || variants[0])
        : product

    const originalPrice = Number(activeSource?.price ?? product.base_price ?? 0)
    const dType = activeSource?.discount_type || product.discount_type || "none"
    const dValue = Number(activeSource?.discount_value || product.discount_value || 0)
    const salePrice = calculateDiscountedPrice(originalPrice, dType, dValue)

    const discountAmount = Math.max(0, originalPrice - salePrice)
    const discountPercent = originalPrice > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0
    const hasDiscount = dType !== "none" && dValue > 0

    const productIsOutOfStock = variants.length > 0
        ? variants.every((v: any) => v.stock != null && Number(v.stock) <= 0)
        : (product.stock != null && Number(product.stock) <= 0)

    const inBag = React.useMemo(
        () => cartItems.some((i: any) => i.id === product.id),
        [cartItems, product.id]
    )

    const handleAddToBag = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (productIsOutOfStock) return
        if (hasVariants) {
            setShowVariantSelector(true)
        } else {
            addItem({
                id: product.id,
                variantId: "base",
                name: product.name,
                variantTitle: "Standard",
                price: salePrice,
                mrp: originalPrice,
                image: product.thumbnail_url,
                quantity: 1,
                stock: Number(activeSource?.stock || product.stock || 0),
            })
            setJustAdded(true)
            setTimeout(() => setJustAdded(false), 1500)
        }
    }

    const handleWishlistToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (isPending) return
        setIsPending(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return router.push("/login")
        try {
            if (isWishlisted) {
                await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", product.id)
                setIsWishlisted(false)
            } else {
                await supabase.from("wishlist").insert({ user_id: user.id, product_id: product.id })
                setIsWishlisted(true)
            }
        } finally { setIsPending(false) }
    }

    return (
        <div className="group relative flex flex-col bg-white border border-black/[0.06] h-full transition-all duration-300 hover:z-10 hover:shadow-[0_0_20px_rgba(0,0,0,0.04)]">

            {/* IMAGE SECTION */}
            <Link href={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-[#F8F8F8]">
                {product.thumbnail_url ? (
                    <Image
                        src={product.thumbnail_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-slate-200" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/[0.03]" />

                {productIsOutOfStock && (
                    <div className="absolute inset-0 z-20 bg-white/55 flex items-center justify-center">
                        <div className="bg-black/70 px-3.5 py-1.5 rounded-full">
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">Out of Stock</span>
                        </div>
                    </div>
                )}
            </Link>

            {/* CONTENT */}
            <div className="flex flex-col flex-1 p-3 pt-2 gap-0.5">
                {product.brand && (
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em] truncate">
                        {product.brand}
                    </span>
                )}

                <h3 className="text-[13px] font-medium text-slate-800 leading-[18px] h-[38px] overflow-hidden">
                    {product.name}
                </h3>

                {/* VARIANT SWATCHES */}
                {hasVariants && (
                    <div className="flex items-center gap-1.5 mt-1.5 mb-1">
                        {variants.slice(0, 3).map((v: any, idx: number) => (
                            <div
                                key={`${v.id}-${idx}`}
                                className="w-3 h-3 rounded-sm border border-slate-200"
                                style={{ backgroundColor: v.hex_code || "#e2e8f0" }}
                            />
                        ))}
                        {variants.length > 3 && (
                            <div className="px-1 py-0.5 bg-slate-100 rounded">
                                <span className="text-[9px] font-semibold text-slate-500">+{variants.length - 3}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* RATING */}
                {averageRating > 0 && (
                    <div className="flex items-center gap-1.5 mt-1 mb-0.5">
                        <RatingStars rating={averageRating} size={9} />
                        <span className="text-[9px] font-medium text-slate-400">{averageRating.toFixed(1)}</span>
                    </div>
                )}

                {/* PRICE SECTION */}
                <div className="mt-auto pt-2.5 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[15px] font-bold text-slate-900 tracking-tight">
                            ₹{Math.round(salePrice).toLocaleString("en-IN")}
                        </span>
                        {hasDiscount && (
                            <>
                                <span className="text-[11px] text-slate-400 line-through font-medium">
                                    ₹{Math.round(originalPrice).toLocaleString("en-IN")}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-900">{discountPercent}% OFF</span>
                            </>
                        )}
                    </div>
                    {hasDiscount && (
                        <div className="mt-0.5">
                            <span className="text-[9px] font-bold text-emerald-600 tracking-tight">
                                ↯ You saved ₹{Math.round(discountAmount).toLocaleString("en-IN")}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* ACTIONS ROW */}
            <div className="flex items-center gap-2 px-3 pb-3 pt-1">
                <button
                    onClick={handleWishlistToggle}
                    disabled={isPending}
                    className="w-[38px] h-[38px] rounded-lg border border-slate-200 flex items-center justify-center shrink-0 hover:bg-slate-50 transition-all"
                >
                    <Heart
                        className={`w-[17px] h-[17px] transition-colors ${isWishlisted ? "fill-slate-900 text-slate-900" : "text-slate-500"
                            }`}
                    />
                </button>

                {productIsOutOfStock ? (
                    <div className="flex-1 h-[38px] rounded-lg bg-slate-100 flex items-center justify-center">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">OUT OF STOCK</span>
                    </div>
                ) : (
                    <button
                        onClick={handleAddToBag}
                        disabled={justAdded}
                        className={`flex-1 h-[38px] rounded-lg flex items-center justify-center text-[11px] font-semibold tracking-wide transition-all active:scale-[0.97] ${justAdded
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950"
                            }`}
                    >
                        {justAdded ? "ADDED ✓" : hasVariants ? "SELECT" : "ADD TO BAG"}
                    </button>
                )}
            </div>

            {/* VARIANT BOTTOM SHEET */}
            {mounted && showVariantSelector && createPortal(
                <div className="fixed inset-0 z-[9999]">
                    <div
                        onClick={() => setShowVariantSelector(false)}
                        className="absolute inset-0 bg-black/40"
                    />
                    <div
                        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col animate-slide-up"
                    >
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 rounded-full bg-slate-300" />
                        </div>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-900">Select Shade</h3>
                            <button onClick={() => setShowVariantSelector(false)} className="p-1 hover:rotate-90 transition-transform">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-2">
                            {variants.map((v: any) => {
                                const vStock = Number(v.stock || 0)
                                const isVOut = vStock <= 0
                                const vBase = Number(v.price)
                                const vSale = v.discount_type === "percentage"
                                    ? vBase - vBase * (v.discount_value / 100)
                                    : v.discount_type === "amount" ? vBase - v.discount_value : vBase

                                return (
                                    <button
                                        key={v.id}
                                        disabled={isVOut}
                                        onClick={() => {
                                            addItem({
                                                id: v.id,
                                                variantId: v.id,
                                                name: product.name,
                                                variantTitle: v.title,
                                                price: vSale,
                                                mrp: vBase,
                                                image: v.image_url || product.thumbnail_url,
                                                quantity: 1,
                                                stock: vStock,
                                            })
                                            setShowVariantSelector(false)
                                            setJustAdded(true)
                                            setTimeout(() => setJustAdded(false), 1500)
                                        }}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${isVOut
                                                ? "opacity-40 cursor-not-allowed border-slate-100 bg-slate-50"
                                                : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-lg border border-slate-100 flex items-center justify-center"
                                                style={{ backgroundColor: v.hex_code || "#f1f5f9" }}
                                            >
                                                {!v.hex_code && (
                                                    <Palette className="w-5 h-5 text-slate-300" />
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-slate-900">{v.title}</p>
                                                <p className="text-xs font-semibold text-slate-900">₹{Math.round(vSale).toLocaleString("en-IN")}</p>
                                            </div>
                                        </div>
                                        {!isVOut && (
                                            <div className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center">
                                                <Plus className="w-3.5 h-3.5 text-slate-400" />
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
