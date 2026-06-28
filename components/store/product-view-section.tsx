"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ProductImages } from "./product-images"
import { DeliveryInfo } from "./delivery-info"
import { useCart } from "@/components/store/use-cart"
import { calculateDiscountedPrice } from "@/lib/price-helper"
import {
    ShoppingCart, Check, Heart, Minus, Plus, Star,
    ChevronLeft, ChevronRight, ChevronDown,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function ProductViewSection({ product }: { product: any }) {
    const addItem = useCart((state) => state.addItem)
    const defaultVariant = product.variants?.find((v: any) => v.is_default) || product.variants?.[0]

    const [selectedVariant, setSelectedVariant] = useState(defaultVariant)
    const [quantity, setQuantity] = useState(1)
    const [justAdded, setJustAdded] = useState(false)
    const [activeImageIdx, setActiveImageIdx] = useState(0)
    const [showLightbox, setShowLightbox] = useState(false)
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

    const getImages = () => {
        if (selectedVariant?.variant_image_urls?.length) {
            return selectedVariant.variant_image_urls.map((u: string) => ({ url: u }))
        }
        if (selectedVariant?.image_url) {
            return [{ url: selectedVariant.image_url }]
        }
        if (product.images?.length) return product.images
        if (product.thumbnail_url) return [{ url: product.thumbnail_url }]
        return []
    }

    const allImages = getImages()
    const currentImage = allImages[activeImageIdx]

    const handleVariantChange = (variant: any) => {
        setSelectedVariant(variant)
        setActiveImageIdx(0)
        setQuantity(1)
    }

    const originalPrice = Number(selectedVariant?.price ?? product.base_price ?? 0)
    const dType = selectedVariant?.discount_type || product.discount_type || "none"
    const dValue = Number(selectedVariant?.discount_value || product.discount_value || 0)
    const salePrice = calculateDiscountedPrice(originalPrice, dType, dValue)
    const stock = Number(selectedVariant?.stock || 0)
    const isOos = stock <= 0
    const hasDiscount = dType !== "none" && dValue > 0
    const discountPercent = originalPrice > 0 ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0

    const reviews = product.reviews || []
    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : null

    const category = product.product_categories?.[0]?.categories
    const hasVariants = product.variants?.length > 1
    const hasColor = product.variants?.some((v: any) => v.hex_code)

    const toggleSection = (key: string) => {
        setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    const handleAddToCart = () => {
        if (isOos) return
        addItem({
            id: product.id,
            variantId: selectedVariant?.id || "base",
            name: product.name,
            variantTitle: selectedVariant?.title || "Default",
            price: salePrice,
            mrp: originalPrice,
            image: selectedVariant?.image_url || product.thumbnail_url,
            quantity,
            stock,
        })
        setJustAdded(true)
        setTimeout(() => setJustAdded(false), 1500)
        toast.success(`${product.name} added to cart!`)
    }

    return (
        <>
            {/* Desktop breadcrumbs */}
            <div className="hidden lg:block border-b border-slate-100">
                <div className="max-w-[1400px] mx-auto px-4 py-3">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Link href="/" className="hover:text-slate-600">Home</Link>
                        {category && (
                            <>
                                <span>/</span>
                                <Link href={`/categories/${category.slug}`} className="hover:text-slate-600">{category.name}</Link>
                            </>
                        )}
                        <span>/</span>
                        <span className="text-slate-900 font-medium truncate">{product.name}</span>
                    </div>
                </div>
            </div>

            <div className="lg:flex lg:max-w-[1400px] lg:mx-auto lg:px-4 lg:gap-10 lg:py-8">
                {/* ── Images ── */}
                <div className="lg:w-[55%] lg:sticky lg:top-4 lg:self-start">
                    {/* Desktop: thumbnail strip + main image */}
                    <div className="hidden lg:flex lg:gap-3">
                        {allImages.length > 1 && (
                            <div className="flex flex-col gap-2 w-20 shrink-0">
                                {allImages.map((img: any, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImageIdx(i)}
                                        className={cn(
                                            "w-20 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0",
                                            activeImageIdx === i ? "border-slate-900" : "border-transparent opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <Image src={img.url} alt="" width={80} height={80} className="object-cover w-full h-full" />
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="flex-1 aspect-[4/5] bg-[#F8F8F8] rounded-2xl overflow-hidden relative group cursor-zoom-in">
                            {currentImage && (
                                <Image src={currentImage.url} alt={product.name} fill className="object-cover" sizes="50vw" />
                            )}
                            <button
                                onClick={() => setShowLightbox(true)}
                                className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                            </button>
                            {allImages.length > 1 && (
                                <>
                                    <button onClick={() => setActiveImageIdx(Math.max(0, activeImageIdx - 1))}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setActiveImageIdx(Math.min(allImages.length - 1, activeImageIdx + 1))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                            <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                {activeImageIdx + 1}/{allImages.length}
                            </div>
                        </div>
                    </div>

                    {/* Mobile: full-width image carousel */}
                    <div className="lg:hidden relative">
                        <ProductImages images={allImages} />
                    </div>
                </div>

                {/* ── Product Info ── */}
                <div className="lg:w-[45%] lg:flex lg:flex-col lg:gap-5">
                    {/* Mobile: in-page content (above sticky bar) */}
                    <div className="lg:flex-1 lg:space-y-5 pb-36 lg:pb-0">
                        {/* Brand + Name */}
                        <div className="px-4 pt-4 lg:px-0 lg:pt-0">
                            {product.brand && (
                                <p className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-[0.1em]">
                                    {product.brand}
                                </p>
                            )}
                            <h1 className="text-lg lg:text-2xl font-bold text-slate-900 tracking-tight mt-0.5 lg:mt-1 leading-tight">
                                {product.name}
                            </h1>
                            {avgRating && (
                                <Link href="#reviews" className="inline-flex items-center gap-1.5 mt-1.5">
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <Star key={i} className={cn("w-3 h-3 lg:w-3.5 lg:h-3.5", i <= Math.round(Number(avgRating)) ? "fill-slate-900 text-slate-900" : "text-slate-200")} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] lg:text-xs font-bold text-slate-500">
                                        {avgRating} ({reviews.length})
                                    </span>
                                </Link>
                            )}
                        </div>

                        <div className="border-t border-slate-100 mx-4 lg:mx-0" />

                        {/* Price */}
                        <div className="px-4 lg:px-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                                    ₹{Math.round(salePrice).toLocaleString("en-IN")}
                                </span>
                                {hasDiscount && (
                                    <>
                                        <span className="text-sm lg:text-base text-slate-400 line-through">
                                            ₹{originalPrice.toLocaleString("en-IN")}
                                        </span>
                                        <span className="text-[10px] lg:text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                                            {discountPercent}% OFF
                                        </span>
                                    </>
                                )}
                            </div>
                            {hasDiscount && (
                                <p className="text-[10px] lg:text-[11px] text-emerald-600 font-bold mt-1">
                                    You save ₹{Math.round(originalPrice - salePrice).toLocaleString("en-IN")}
                                </p>
                            )}
                        </div>

                        <div className="border-t border-slate-100 mx-4 lg:mx-0" />

                        {/* Variant selector */}
                        {hasVariants && (
                            <div className="px-4 lg:px-0">
                                <p className="text-xs font-bold text-slate-900 mb-2">
                                    {hasColor ? "Shade:" : "Option:"}{" "}
                                    <span className="text-slate-500 font-medium">{selectedVariant?.title}</span>
                                </p>
                                <div className="flex flex-wrap gap-2.5">
                                    {product.variants.map((v: any) => {
                                        const sel = selectedVariant?.id === v.id
                                        const vOos = Number(v.stock) <= 0
                                        return (
                                            <button
                                                key={v.id}
                                                onClick={() => !vOos && handleVariantChange(v)}
                                                disabled={vOos}
                                                className={cn(
                                                    "relative transition-all active:scale-95",
                                                    hasColor
                                                        ? "w-9 h-9 lg:w-10 lg:h-10 rounded-full border-2"
                                                        : "px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider",
                                                    sel ? "border-slate-900" : "border-slate-200 hover:border-slate-400",
                                                    vOos && "opacity-30 cursor-not-allowed"
                                                )}
                                            >
                                                {hasColor ? (
                                                    <div className="w-full h-full rounded-full" style={{ backgroundColor: v.hex_code }} />
                                                ) : (
                                                    v.title
                                                )}
                                                {vOos && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-full h-px bg-slate-300 rotate-45" />
                                                    </div>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                                {stock > 0 && stock <= 3 && (
                                    <p className="text-[10px] font-bold text-red-500 mt-2">Only {stock} left</p>
                                )}
                            </div>
                        )}

                        <div className="border-t border-slate-100 mx-4 lg:mx-0 lg:hidden" />

                        {/* Accordion Details (mobile only) */}
                        <div className="lg:hidden">
                            {product.description && (
                                <Section title="Description" open={expandedSections.desc} onToggle={() => toggleSection("desc")}>
                                    <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
                                </Section>
                            )}

                            <Section title="Delivery & Returns" open={expandedSections.delivery} onToggle={() => toggleSection("delivery")}>
                                <DeliveryInfo />
                            </Section>
                        </div>

                        {/* Desktop: full description + delivery inline */}
                        <div className="hidden lg:block space-y-5">
                            <div className="border-t border-slate-100" />
                            {product.description && (
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-2">Description</p>
                                    <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
                                </div>
                            )}
                            <div className="border-t border-slate-100" />
                            <DeliveryInfo />
                        </div>
                    </div>

                    {/* Desktop: Add to Cart (inline, not sticky) */}
                    <div className="hidden lg:block space-y-3 border-t border-slate-100 pt-5">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 w-16">Quantity:</span>
                            <QtySelector quantity={quantity} setQuantity={setQuantity} stock={stock} />
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleAddToCart}
                                disabled={isOos}
                                className={cn(
                                    "flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-bold tracking-wide transition-all active:scale-[0.97]",
                                    justAdded ? "bg-emerald-600 text-white" : "bg-slate-900 text-white hover:bg-slate-800",
                                    "disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                )}
                            >
                                {justAdded ? <><Check className="w-4 h-4" /> ADDED</> : isOos ? "OUT OF STOCK" : <><ShoppingCart className="w-4 h-4" /> ADD TO CART</>}
                            </button>
                            <button className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors">
                                <Heart className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile: sticky bottom bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 lg:hidden">
                <div className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0">
                        <p className="text-lg font-bold text-slate-900 leading-tight">₹{Math.round(salePrice).toLocaleString("en-IN")}</p>
                        {hasDiscount && <p className="text-[10px] text-slate-400 line-through">₹{originalPrice.toLocaleString("en-IN")}</p>}
                    </div>
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} className="w-8 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30">
                            <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-slate-900">{quantity}</span>
                        <button onClick={() => setQuantity(Math.min(stock, quantity + 1))} disabled={quantity >= stock} className="w-8 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30">
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={isOos}
                        className={cn(
                            "flex-1 h-11 rounded-xl flex items-center justify-center text-xs font-bold tracking-wide transition-all active:scale-[0.97]",
                            justAdded ? "bg-emerald-600 text-white" : "bg-slate-900 text-white hover:bg-slate-800",
                            "disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        )}
                    >
                        {justAdded ? <><Check className="w-4 h-4 mr-1" /> ADDED</> : isOos ? "OUT OF STOCK" : <><ShoppingCart className="w-4 h-4 mr-1" /> ADD TO CART</>}
                    </button>
                </div>
            </div>

            {/* Lightbox */}
            {showLightbox && (
                <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center" onClick={() => setShowLightbox(false)}>
                    <button onClick={() => setShowLightbox(false)} className="absolute top-4 right-4 text-white/70 hover:text-white text-sm font-bold z-10">Close</button>
                    {currentImage && (
                        <Image src={currentImage.url} alt={product.name} width={1200} height={1500} className="max-w-[90vw] max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
                    )}
                    {allImages.length > 1 && (
                        <>
                            <button onClick={(e) => { e.stopPropagation(); setActiveImageIdx(Math.max(0, activeImageIdx - 1)); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setActiveImageIdx(Math.min(allImages.length - 1, activeImageIdx + 1)); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            )}
        </>
    )
}

/* ── Sub-components ── */

function Section({ title, open, onToggle, children }: { title: string; open?: boolean; onToggle: () => void; children: React.ReactNode }) {
    return (
        <div className="border-b border-slate-100">
            <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-4 text-left">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">{title}</span>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", open && "rotate-180")} />
            </button>
            <div className={cn("overflow-hidden transition-all duration-300", open ? "max-h-[1000px] pb-4 px-4" : "max-h-0")}>
                {children}
            </div>
        </div>
    )
}

function QtySelector({ quantity, setQuantity, stock }: { quantity: number; setQuantity: (n: number) => void; stock: number }) {
    return (
        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30">
                <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center text-sm font-bold text-slate-900">{quantity}</span>
            <button onClick={() => setQuantity(Math.min(stock, quantity + 1))} disabled={quantity >= stock} className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30">
                <Plus className="w-3.5 h-3.5" />
            </button>
        </div>
    )
}
