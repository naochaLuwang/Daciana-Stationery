"use client"

import { useState, useEffect } from "react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Minus, Plus, Tag } from "lucide-react"
import { useCart, CartItem } from "@/components/store/use-cart"
import { calculateDiscountedPrice } from "@/lib/price-helper"
import { toast } from "sonner"
import Image from "next/image"

interface QuickBuyProps {
    product: any
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function QuickBuy({ product, isOpen, onOpenChange }: QuickBuyProps) {
    const addItem = useCart((state) => state.addItem)
    const variants = product.product_variants || []
    const [selectedVariant, setSelectedVariant] = useState<any>(null)
    const [quantity, setQuantity] = useState(1)

    // Set default variant when product or variants change
    useEffect(() => {
        if (variants.length > 0) {
            setSelectedVariant(variants.find((v: any) => v.is_default) || variants[0])
        } else {
            setSelectedVariant(null)
        }
    }, [product, variants])

    if (!product) return null

    // Determine price using selected variant or product base_price
    const originalPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.base_price)
    const discountType = selectedVariant ? selectedVariant.discount_type : product.discount_type
    const discountValue = selectedVariant ? Number(selectedVariant.discount_value) : Number(product.discount_value)

    const salePrice = calculateDiscountedPrice(originalPrice, discountType, discountValue)
    const stock = selectedVariant ? Number(selectedVariant.stock) : Number(product.stock || 0)

    const handleAddToCart = () => {
        const item: CartItem = {
            id: product.id,
            variantId: selectedVariant?.id || "base",
            name: product.name,
            variantTitle: selectedVariant?.title || "Default",
            price: salePrice,
            mrp: originalPrice,
            image: selectedVariant?.image_url || product.thumbnail_url,
            quantity: quantity,
            stock: stock
        }
        addItem(item)
        toast.success(`Added ${quantity} ${product.name} to cart!`)
        onOpenChange(false)
    }

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-[auto] max-h-[90vh] rounded-t-[3rem] p-8 sm:p-12 border-none shadow-2xl bg-white">
                <SheetHeader className="text-left mb-10">
                    <div className="flex gap-8 items-start">
                        <div className="relative w-28 h-28 sm:w-40 sm:h-40 rounded-[2rem] overflow-hidden bg-slate-50 flex-shrink-0 shadow-inner">
                            <Image
                                src={selectedVariant?.image_url || product.thumbnail_url || ""}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-700 hover:scale-110"
                            />
                        </div>
                        <div className="flex-1 space-y-2 pt-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
                                {product.brand || 'DACIANA'}
                            </span>
                            <SheetTitle className="text-2xl sm:text-4xl font-black tracking-tighter uppercase leading-[0.9]">
                                {product.name}
                            </SheetTitle>
                            <div className="flex items-center gap-4 mt-4">
                                <span className="text-3xl font-black text-slate-900 tracking-tighter font-mono">
                                    ₹{salePrice.toLocaleString('en-IN')}
                                </span>
                                {discountType !== 'none' && (
                                    <span className="text-base text-slate-300 line-through font-bold">
                                        ₹{originalPrice.toLocaleString('en-IN')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                <div className="space-y-10 max-w-2xl mx-auto">
                    {/* Variant Selection */}
                    {product.has_variants && variants.length > 0 && (
                        <div className="space-y-6">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 flex items-center gap-2">
                                <Tag className="w-3.5 h-3.5" />
                                {variants[0]?.hex_code ? "Choose Shade" : "Select Option"}
                            </label>
                            <div className="flex flex-wrap gap-4">
                                {variants.map((v: any) => {
                                    const isSelected = selectedVariant?.id === v.id
                                    const isColor = !!v.hex_code

                                    return (
                                        <button
                                            key={v.id}
                                            onClick={() => setSelectedVariant(v)}
                                            className={`relative flex items-center justify-center transition-all duration-500 active:scale-95 ${isColor
                                                ? "p-1.5 rounded-full border-2"
                                                : "h-14 min-w-[4.5rem] px-6 rounded-2xl border-2"
                                                } ${isSelected
                                                    ? "border-slate-900 bg-slate-900 text-white shadow-xl scale-105"
                                                    : "border-slate-100 bg-white hover:border-slate-300 text-slate-500"
                                                }`}
                                        >
                                            {isColor ? (
                                                <div
                                                    className="w-10 h-10 rounded-full border border-black/5 shadow-inner"
                                                    style={{ backgroundColor: v.hex_code }}
                                                />
                                            ) : (
                                                <span className={`text-xs font-black uppercase tracking-widest ${isSelected ? "text-white" : ""}`}>
                                                    {v.title}
                                                </span>
                                            )}
                                            {isSelected && isColor && (
                                                <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-3 py-1.5 rounded-lg uppercase tracking-widest whitespace-nowrap z-50 shadow-2xl">
                                                    {v.title}
                                                </span>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Quantity & Action */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center pt-4">
                        <div className="flex items-center justify-between bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">Quantity</p>
                                <div className="flex items-center gap-6">
                                    <button
                                        className="h-8 w-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 text-slate-900 hover:bg-slate-900 hover:text-white transition-all disabled:opacity-30"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-lg font-black text-slate-900 w-4 text-center">{quantity}</span>
                                    <button
                                        className="h-8 w-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 text-slate-900 hover:bg-slate-900 hover:text-white transition-all disabled:opacity-30"
                                        onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                                        disabled={quantity >= stock}
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">Availability</p>
                                <p className={`text-xs font-black uppercase tracking-wider mt-1 ${stock > 0 ? "text-emerald-500" : "text-red-400"}`}>
                                    {stock > 0 ? `${stock} left` : "OOS"}
                                </p>
                            </div>
                        </div>

                        <Button
                            className="w-full h-20 rounded-[2rem] text-sm font-black uppercase tracking-[0.3em] gap-3 bg-slate-900 hover:bg-slate-800 text-white shadow-2xl transition-all active:scale-[0.98]"
                            size="lg"
                            disabled={stock <= 0}
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="w-5 h-5" /> Add to Cart
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
