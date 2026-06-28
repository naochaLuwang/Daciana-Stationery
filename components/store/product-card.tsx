"use client"

import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Plus } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useWishlist } from "@/hooks/use-wishlist"
import { QuickBuy } from "./quick-buy"
import { toast } from "sonner"
import { useCart } from "@/components/store/use-cart"

import { useRouter } from "next/navigation"

export function ProductCard({ product }: { product: any }) {
    const router = useRouter()
    const [isQuickBuyOpen, setIsQuickBuyOpen] = useState(false)
    const { toggleItem, isInWishlist } = useWishlist()
    const addItem = useCart((state) => state.addItem)
    const isWishlisted = isInWishlist(product.id)

    const variants = product.product_variants || []
    const hasVariantsData = variants.length > 0
    const activeSource = hasVariantsData ? (variants.find((v: any) => v.is_default) || variants[0]) : product

    const originalPrice = Number(activeSource?.price ?? product.base_price ?? 0)
    const dType = activeSource?.discount_type || product.discount_type || 'none'
    const dValue = Number(activeSource?.discount_value || product.discount_value || 0)

    let salePrice = originalPrice
    if (dType === 'percentage' && dValue > 0) {
        salePrice = originalPrice - (originalPrice * (dValue / 100))
    } else if (dType === 'amount' && dValue > 0) {
        salePrice = originalPrice - dValue
    }

    const totalStockPool = variants.reduce((acc: number, v: any) => acc + Number(v.stock || 0), 0)
    const currentStock = Number(activeSource?.stock || 0)
    const isOutOfStock = hasVariantsData ? totalStockPool <= 0 : currentStock <= 0

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (isOutOfStock) return

        if (hasVariantsData) {
            setIsQuickBuyOpen(true)
        } else {
            addItem({
                id: product.id,
                variantId: "base",
                name: product.name,
                variantTitle: "Default",
                price: salePrice,
                mrp: originalPrice,
                image: product.thumbnail_url,
                quantity: 1,
                stock: currentStock
            })
            toast.success(`${product.name} added to cart!`)
        }
    }

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        toggleItem(product.id)
        if (!isWishlisted) toast.success("Saved to favorites")
    }

    return (
        <div className="group flex flex-col h-full bg-white transition-all duration-500 border border-slate-100 rounded-[2.5rem] p-1 shadow-sm hover:shadow-xl hover:border-primary/20">
            {/* IMAGE AREA */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.2rem] bg-slate-50 mb-4 group/img border border-slate-50">
                <Link href={`/products/${product.id}`} className="block w-full h-full">
                    {product.thumbnail_url ? (
                        <Image
                            src={product.thumbnail_url}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className={`object-cover transition-transform duration-1000 group-hover:scale-105 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                            <ShoppingCart className="w-12 h-12" />
                        </div>
                    )}
                </Link>

                {/* OVERLAYS */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
                    <div className="flex flex-col gap-2">
                        {isOutOfStock ? (
                            <Badge className="bg-slate-900 border-none text-[8px] px-3 font-black tracking-[0.2em] uppercase h-6 shadow-2xl">
                                Out of Stock
                            </Badge>
                        ) : dType !== 'none' && dValue > 0 && (
                            <Badge className="bg-red-500 border-none text-[8px] px-3 font-black tracking-[0.2em] uppercase h-6 shadow-xl">
                                {dType === 'percentage' ? `${dValue}% OFF` : `₹${dValue}`}
                            </Badge>
                        )}
                    </div>

                    <button
                        onClick={handleWishlist}
                        className={`pointer-events-auto w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl ${isWishlisted ? "bg-red-500 text-white" : "bg-white/90 backdrop-blur-md text-slate-400 hover:text-red-500"}`}
                    >
                        <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
                    </button>
                </div>

                {/* DESKTOP HOVER: ADD TO CART */}
                <div className="absolute inset-x-4 bottom-4 z-20 hidden lg:block transform translate-y-24 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <Button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className="w-full bg-white/90 backdrop-blur-md text-slate-900 border-none h-12 rounded-2xl font-black uppercase tracking-[0.2em] text-[9px] shadow-2xl hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                    >
                        Add to Cart
                    </Button>
                </div>

                {/* MOBILE VISIBLE: ADD TO CART */}
                <div className="absolute inset-x-4 bottom-4 z-20 lg:hidden">
                    <Button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className="w-full bg-slate-900 text-white border-none h-12 rounded-2xl font-black uppercase tracking-[0.2em] text-[9px] shadow-2xl active:scale-95"
                    >
                        Add to Cart
                    </Button>
                </div>
            </div>

            {/* INFO AREA */}
            <div className="flex flex-col flex-grow px-4 pb-4">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">
                        {product.brand || 'DACIANA'}
                    </span>
                    {hasVariantsData && (
                        <span className="text-[8px] font-black text-primary/60 uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full">
                            {variants.length} Options
                        </span>
                    )}
                </div>

                <Link href={`/products/${product.id}`} className="block group/title">
                    <h3 className="text-sm font-black text-slate-900 mt-1 mb-2 tracking-tighter uppercase line-clamp-1 group-hover/title:text-primary transition-colors duration-300">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center gap-3 mt-auto">
                    <span className={`text-base font-black tracking-tight ${isOutOfStock ? 'text-slate-300' : 'text-slate-900'}`}>
                        ₹{salePrice.toLocaleString('en-IN')}
                    </span>
                    {!isOutOfStock && salePrice < originalPrice && (
                        <span className="text-[10px] text-slate-300 line-through font-bold">
                            ₹{originalPrice.toLocaleString('en-IN')}
                        </span>
                    )}
                </div>
            </div>

            <QuickBuy
                product={product}
                isOpen={isQuickBuyOpen}
                onOpenChange={setIsQuickBuyOpen}
            />
        </div>
    )
}
