"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Tag, Minus, Plus } from "lucide-react"
import { toast } from "sonner"
import { useCart, CartItem } from "@/components/store/use-cart"
import { calculateDiscountedPrice } from "@/lib/price-helper"
import { Badge } from "@/components/ui/badge"

export function VariantSelector({ product, variants, onVariantChange }: any) {
    const addItem = useCart((state) => state.addItem)
    const [selectedVariant, setSelectedVariant] = useState(
        variants.find((v: any) => v.is_default) || variants[0]
    )
    const [quantity, setQuantity] = useState(1)

    const salePrice = calculateDiscountedPrice(
        Number(selectedVariant.price),
        selectedVariant.discount_type,
        Number(selectedVariant.discount_value)
    )
    const getDiscountLabel = () => {
        if (selectedVariant.discount_type === 'percentage') {
            return `${selectedVariant.discount_value}% OFF`
        }
        if (selectedVariant.discount_type === 'amount') {
            const pct = Math.round((selectedVariant.discount_value / selectedVariant.price) * 100)
            return `₹${selectedVariant.discount_value} OFF (${pct}% OFF)`
        }
        return null
    }

    const discountLabel = getDiscountLabel()
    const handleVariantClick = (v: any) => {
        setSelectedVariant(v)
        setQuantity(1) // Reset quantity on variant change

        onVariantChange(v) // Tell gallery to swap image

    }

    const handleAddToCart = () => {
        const item: CartItem = {
            id: product.id,
            variantId: selectedVariant.id,
            name: product.name,
            variantTitle: selectedVariant.title,
            price: salePrice,
            image: selectedVariant.image_url || product.thumbnail_url,
            quantity: quantity,
            stock: selectedVariant.stock
        }
        addItem(item)
        toast.success(`Added ${quantity} ${product.name} (${selectedVariant.title}) to cart!`)
    }

    return (
        <div className="space-y-6">
            {/* Price Section */}
            <div className="flex flex-col">
                {/* Top Row: Prices and Badge */}
                <div className="flex items-baseline gap-3">
                    <div className="text-4xl font-bold text-slate-900 font-mono">
                        ₹{salePrice.toLocaleString('en-IN')}
                    </div>

                    {selectedVariant.discount_type !== 'none' && (
                        <>
                            <div className="text-lg text-slate-400 line-through">
                                ₹{Number(selectedVariant.price).toLocaleString('en-IN')}
                            </div>
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-3">
                                {discountLabel}
                            </Badge>
                        </>
                    )}
                </div>

                {/* Bottom Row: Tax Info */}
                <p className="text-[11px] font-bold uppercase tracking-tighter text-emerald-600 mt-1">
                    Inclusive of all taxes
                </p>
            </div>

            {/* Variant Chips */}
            {/* {product.has_variants && (
                <div className="space-y-3">
                    <label className="text-sm font-bold uppercase text-slate-500 flex items-center gap-2">
                        <Tag className="w-3 h-3" /> Select Shade
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {variants.map((v: any) => (
                            <button
                                key={v.id}
                                onClick={() => handleVariantClick(v)}
                                className={`flex items-center gap-3 px-4 py-2 rounded-full border-2 transition-all ${selectedVariant.id === v.id
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-slate-100 bg-white hover:border-slate-300"
                                    }`}
                            >
                                <div
                                    className="w-4 h-4 rounded-full border border-black/10"
                                    style={{ backgroundColor: v.hex_code }}
                                />
                                <span className="text-sm font-bold">{v.title}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )} */}

            {product.has_variants && (
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5" />
                        {/* Dynamic Label based on data */}
                        {variants[0]?.hex_code ? "Select Shade" : "Select Size"}
                    </label>

                    <div className="flex flex-wrap gap-3">
                        {variants.map((v: any) => {
                            const isSelected = selectedVariant.id === v.id;
                            const isColor = !!v.hex_code;

                            return (
                                <button
                                    key={v.id}
                                    onClick={() => handleVariantClick(v)}
                                    className={`relative flex items-center justify-center transition-all duration-300 active:scale-95 ${isColor
                                        ? "p-1 rounded-full border-2" // Container for Color
                                        : "h-12 min-w-[3rem] px-4 rounded-xl border-2" // Container for Size (M, L, S)
                                        } ${isSelected
                                            ? "border-primary bg-primary/5 shadow-sm"
                                            : "border-slate-100 bg-white hover:border-slate-200"
                                        }`}
                                >
                                    {isColor ? (
                                        <>
                                            {/* Large Color Swatch */}
                                            <div
                                                className="w-8 h-8 rounded-full border border-black/5 shadow-inner"
                                                style={{ backgroundColor: v.hex_code }}
                                            />
                                            {/* Tooltip or text appearing on hover/select for color name */}
                                            {isSelected && (
                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-2 py-1 rounded uppercase tracking-widest whitespace-nowrap">
                                                    {v.title}
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        /* Text-only variant (S, M, L) */
                                        <span className={`text-xs font-black uppercase tracking-widest ${isSelected ? "text-primary" : "text-slate-600"
                                            }`}>
                                            {v.title}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-3">
                <label className="text-sm font-bold uppercase text-slate-500">Quantity</label>
                <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-xl p-1 bg-slate-50">
                        <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                            <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-10 text-center font-bold">{quantity}</span>
                        <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))} disabled={quantity >= selectedVariant.stock}>
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {selectedVariant.stock} units left
                    </span>
                </div>
            </div>

            <Button
                size="lg"
                className="w-full h-14 text-lg gap-3"
                disabled={selectedVariant.stock <= 0}
                onClick={handleAddToCart}
            >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
            </Button>
        </div>
    )
}