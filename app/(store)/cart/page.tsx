"use client"

import { useCart } from "@/components/store/use-cart"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Heart, Shield, Banknote, Truck } from "lucide-react"
import { toast } from "sonner"
import { DenseProductCard } from "@/components/store/dense-product-card"

export default function CartPage() {
    const { items, removeItem, updateQuantity, clearCart } = useCart()
    const [mounted, setMounted] = useState(false)
    const [recommendations, setRecommendations] = useState<any[]>([])
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
        syncCartPrices()
        fetchRecommendations()
    }, [])

    const syncCartPrices = async () => {
        if (items.length === 0) return
        const variantIds = items.map((item) => item.variantId).filter((id) => id !== "base")
        if (variantIds.length === 0) return

        const { data: variants } = await supabase
            .from("product_variants")
            .select("id, price, discount_type, discount_value, stock, mrp")
            .in("id", variantIds)

        if (!variants) return

        const updated = items.map((item) => {
            const v = variants.find((vr) => vr.id === item.variantId)
            if (!v) return item
            const base = Number(v.price)
            const dType = v.discount_type || "none"
            const dVal = Number(v.discount_value || 0)
            let sale = base
            if (dType === "percentage" && dVal > 0) sale = base - base * (dVal / 100)
            else if (dType === "amount" && dVal > 0) sale = base - dVal
            return { ...item, price: sale, mrp: Number(v.mrp || base), stock: Number(v.stock || 0) }
        })

        useCart.setState({ items: updated })
    }

    const fetchRecommendations = async () => {
        const { data } = await supabase
            .from("products")
            .select("*, product_images(url, alt), product_variants(*)")
            .eq("status", "active")
            .limit(6)
        setRecommendations(data || [])
    }

    const handleSaveForLater = async (item: any) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            toast.error("Please login to save items")
            return
        }

        const { error } = await supabase
            .from("wishlist")
            .upsert({ user_id: user.id, product_id: item.id }, { onConflict: "user_id,product_id" })

        if (!error) {
            removeItem(item.variantId)
            toast.success("Saved to wishlist")
        }
    }

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const totalMRP = items.reduce((acc, item) => acc + item.mrp * item.quantity, 0)
    const totalDiscount = totalMRP - subtotal
    const total = subtotal

    const estimatedDelivery = new Date()
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5)

    if (!mounted) return null

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-white px-4 py-12">
                <div className="text-center py-32">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-8 h-8 text-slate-200" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
                    <p className="text-sm text-slate-400 mb-8">Add items to get started</p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider px-8 py-3 rounded-xl"
                    >
                        Start Shopping <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white pb-40">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold text-slate-900">Cart ({items.length})</h1>
                    <button onClick={clearCart} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Clear All
                    </button>
                </div>
            </div>

            {/* Cart Items */}
            <div className="px-4 py-4 space-y-4">
                {items.map((item) => (
                    <div key={item.variantId} className="flex gap-3 pb-4 border-b border-slate-50 last:border-0">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                            {item.image ? (
                                <Image src={item.image} alt={item.name} width={80} height={80} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag className="w-6 h-6 text-slate-200" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.name}</h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">{item.variantTitle}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-bold text-slate-900">₹{Math.round(item.price).toLocaleString("en-IN")}</span>
                                {item.price < item.mrp && (
                                    <span className="text-[10px] text-slate-400 line-through">₹{item.mrp.toLocaleString("en-IN")}</span>
                                )}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center border border-slate-200 rounded-lg">
                                    <button onClick={() => updateQuantity(item.variantId, Math.max(1, item.quantity - 1))} className="w-8 h-8 flex items-center justify-center text-slate-600">
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-8 h-8 flex items-center justify-center text-xs font-bold text-slate-900 border-x border-slate-200">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.variantId, Math.min(item.stock, item.quantity + 1))} className="w-8 h-8 flex items-center justify-center text-slate-600">
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handleSaveForLater(item)} className="p-2 text-slate-400 hover:text-pink-500 transition-colors" title="Save for later">
                                        <Heart className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => removeItem(item.variantId)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-slate-50">
                                <p className="text-[10px] font-bold text-slate-500">
                                    You pay <span className="text-emerald-600">₹{Math.round(item.price * item.quantity).toLocaleString("en-IN")}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Delivery Estimate */}
            <div className="px-4 py-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-900">Delivery Estimate</p>
                        <p className="text-[10px] text-slate-500">
                            {estimatedDelivery.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Order Summary */}
            <div className="px-4 py-4 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-3">Order Summary</p>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Subtotal ({items.length} items)</span>
                        <span className="text-xs font-bold text-slate-900">₹{totalMRP.toLocaleString("en-IN")}</span>
                    </div>
                    {totalDiscount > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-emerald-600">Discount</span>
                            <span className="text-xs font-bold text-emerald-600">-₹{Math.round(totalDiscount).toLocaleString("en-IN")}</span>
                        </div>
                    )}
                    <div className="border-t border-slate-100 pt-2 mt-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900">Total (Incl. of all taxes)</span>
                            <span className="text-lg font-bold text-slate-900">₹{Math.round(total).toLocaleString("en-IN")}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="px-4 py-4 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-2">Payment Methods</p>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-slate-600" />
                        <span className="text-[10px] font-bold text-slate-600">COD</span>
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div className="px-4 py-4 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-3">You Might Also Like</p>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4">
                        {recommendations.slice(0, 4).map((product) => (
                            <div key={product.id} className="w-40 shrink-0">
                                <DenseProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                        <Shield className="w-3 h-3 text-emerald-600" />
                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Secure Checkout</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="min-w-0">
                            <p className="text-xs text-slate-400">Total</p>
                            <p className="text-lg font-bold text-slate-900">₹{Math.round(total).toLocaleString("en-IN")}</p>
                        </div>
                        <button
                            onClick={() => router.push("/checkout")}
                            className="flex-1 h-11 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wide flex items-center justify-center hover:bg-slate-800 transition-colors"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
