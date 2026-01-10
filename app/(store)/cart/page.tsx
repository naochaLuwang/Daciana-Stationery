"use client"

import { useCart } from "@/components/store/use-cart"

import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function CartPage() {
    // 1. Pull everything needed from the store
    const {
        items,
        removeItem,
        updateQuantity,

        shippingPrice
    } = useCart()

    const [mounted, setMounted] = useState(false)

    // 2. Calculation Logic
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    // Find the full method object to display the name in the summary

    const finalTotal = subtotal

    // 3. Hydration Fix
    useEffect(() => { setMounted(true) }, [])
    if (!mounted) return null

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="bg-slate-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="w-10 h-10 text-slate-300" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
                <p className="text-slate-500 mb-8">Add some items to get started!</p>
                <Button asChild size="lg"><Link href="/">Start Shopping</Link></Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-10">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left: Items List */}
                <div className="lg:col-span-2 space-y-6">
                    {items.map((item) => (
                        <div key={item.variantId} className="flex gap-6 p-4 border rounded-2xl bg-white shadow-sm">
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden border flex-shrink-0 bg-slate-50">
                                <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                            </div>

                            <div className="flex-grow space-y-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg leading-tight">{item.name}</h3>
                                        <p className="text-sm text-slate-500">{item.variantTitle}</p>
                                    </div>
                                    <p className="font-bold text-lg">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                </div>

                                <div className="flex items-center justify-between pt-4">
                                    <div className="flex items-center border rounded-lg bg-slate-50 p-1">
                                        <button
                                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                            className="p-1 hover:bg-white rounded transition-colors disabled:opacity-30"
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                            className="p-1 hover:bg-white rounded transition-colors disabled:opacity-30"
                                            disabled={item.quantity >= item.stock}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => removeItem(item.variantId)}
                                        className="text-slate-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right: Order Summary Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-50 rounded-2xl p-6 sticky top-24 border">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                        {/* Dynamic Shipping Method Selector */}


                        <div className="space-y-4 text-sm mt-6 pt-6 border-t border-slate-200">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>

                            {/* <div className="flex justify-between text-slate-600">
                                <span>Shipping ({selectedMethod?.name || 'Standard'})</span>
                                <span>₹{(shippingPrice ?? 0).toLocaleString('en-IN')}</span>
                            </div> */}

                            <hr className="border-slate-200" />

                            <div className="flex justify-between text-xl font-bold text-slate-900">
                                <span>Total</span>
                                <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <Button className="w-full mt-8 h-12 text-md shadow-lg shadow-primary/20" size="lg" asChild>
                            <Link href="/checkout">
                                Proceed to Checkout <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </Button>

                        <div className="mt-6 flex items-center justify-center gap-2 grayscale opacity-50">
                            <span className="text-[10px] uppercase tracking-widest font-bold">Secure Checkout</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


// "use client"

// import { useCart } from "@/components/store/use-cart"
// import { Button } from "@/components/ui/button"
// import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck, ShieldCheck } from "lucide-react"
// import Link from "next/link"
// import Image from "next/image"
// import { useEffect, useState } from "react"
// import { Progress } from "@/components/ui/progress"

// export default function CartPage() {
//     const { items, removeItem, updateQuantity } = useCart()
//     const [mounted, setMounted] = useState(false)

//     // Hydration Fix: Prevents "Text content did not match" errors in Next.js
//     useEffect(() => {
//         setMounted(true)
//     }, [])

//     // 1. Calculation Logic
//     const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)

//     // Shipping Settings (Matching your Product Page logic)
//     const FREE_SHIPPING_THRESHOLD = 499
//     const SHIPPING_FEE = 40
//     const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
//     const shippingCost = isFreeShipping ? 0 : SHIPPING_FEE
//     const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal
//     const progressToFreeShipping = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)

//     const finalTotal = subtotal + shippingCost

//     if (!mounted) return null

//     // Empty Cart State
//     if (items.length === 0) {
//         return (
//             <div className="container mx-auto px-4 py-24 text-center">
//                 <div className="bg-slate-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
//                     <ShoppingBag className="w-12 h-12 text-slate-300" />
//                 </div>
//                 <h1 className="text-3xl font-bold mb-2">Your cart is empty</h1>
//                 <p className="text-slate-500 mb-8 max-w-sm mx-auto">
//                     Looks like you haven't added anything to your cart yet.
//                 </p>
//                 <Button asChild size="lg" className="rounded-full px-8">
//                     <Link href="/">Start Shopping</Link>
//                 </Button>
//             </div>
//         )
//     }

//     return (
//         <div className="container mx-auto px-4 py-12 max-w-6xl">
//             <h1 className="text-3xl font-bold mb-10">
//                 Shopping Cart <span className="text-slate-400 font-normal">({items.length})</span>
//             </h1>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
//                 {/* Left: Items List */}
//                 <div className="lg:col-span-2 space-y-6">

//                     {/* Free Shipping Progress Indicator */}
//                     <div className="p-5 border rounded-2xl bg-slate-50/50 border-slate-200">
//                         <div className="flex justify-between items-center mb-3">
//                             <div className="flex items-center gap-2 text-sm font-bold">
//                                 <Truck className={`w-5 h-5 ${isFreeShipping ? "text-green-600" : "text-blue-600"}`} />
//                                 {isFreeShipping ? (
//                                     <span className="text-green-600 font-bold uppercase tracking-wide">You qualify for FREE Delivery!</span>
//                                 ) : (
//                                     <span>Add <span className="text-blue-600">₹{amountToFreeShipping}</span> more for Free Delivery</span>
//                                 )}
//                             </div>
//                             {!isFreeShipping && (
//                                 <span className="text-xs font-bold text-slate-400 uppercase">{Math.round(progressToFreeShipping)}%</span>
//                             )}
//                         </div>
//                         <Progress value={progressToFreeShipping} className="h-2 bg-slate-200" />
//                     </div>

//                     <div className="space-y-4">
//                         {items.map((item, index) => (
//                             <div
//                                 key={`${item.variantId}-${index}`}
//                                 className="flex gap-4 md:gap-6 p-4 border rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-200"
//                             >
//                                 {/* Product Image */}
//                                 <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border flex-shrink-0 bg-slate-50">
//                                     <Image
//                                         src={item.image}
//                                         alt={item.name}
//                                         fill
//                                         className="object-cover"
//                                     />
//                                 </div>

//                                 {/* Item Info */}
//                                 <div className="flex-grow flex flex-col justify-between py-1">
//                                     <div className="flex justify-between items-start">
//                                         <div>
//                                             <h3 className="font-bold text-lg text-slate-900 leading-tight">
//                                                 {item.name}
//                                             </h3>
//                                             <p className="text-sm font-medium text-slate-500 mt-1">
//                                                 {item.variantTitle}
//                                             </p>
//                                         </div>
//                                         <p className="font-bold text-lg text-slate-900 font-mono">
//                                             ₹{(item.price * item.quantity).toLocaleString('en-IN')}
//                                         </p>
//                                     </div>

//                                     {/* Actions: Quantity & Remove */}
//                                     <div className="flex items-center justify-between mt-4">
//                                         <div className="flex items-center border rounded-xl bg-slate-50 p-1">
//                                             <button
//                                                 onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
//                                                 className="p-1.5 hover:bg-white rounded-lg transition-all disabled:opacity-30"
//                                                 disabled={item.quantity <= 1}
//                                             >
//                                                 <Minus className="w-4 h-4" />
//                                             </button>
//                                             <span className="w-10 text-center font-bold text-sm">
//                                                 {item.quantity}
//                                             </span>
//                                             <button
//                                                 onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
//                                                 className="p-1.5 hover:bg-white rounded-lg transition-all disabled:opacity-30"
//                                                 disabled={item.quantity >= (item.stock || 99)}
//                                             >
//                                                 <Plus className="w-4 h-4" />
//                                             </button>
//                                         </div>

//                                         <button
//                                             onClick={() => removeItem(item.variantId)}
//                                             className="flex items-center gap-2 text-slate-400 hover:text-red-600 transition-colors text-sm font-bold uppercase tracking-wider"
//                                         >
//                                             <Trash2 className="w-4 h-4" />
//                                             <span className="hidden md:inline">Remove</span>
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Right: Summary Sidebar */}
//                 <div className="lg:col-span-1">
//                     <div className="bg-white rounded-3xl p-8 sticky top-24 border shadow-sm">
//                         <h2 className="text-2xl font-bold mb-6 text-slate-900">Summary</h2>

//                         <div className="space-y-4">
//                             <div className="flex justify-between text-slate-600 font-medium">
//                                 <span>Subtotal</span>
//                                 <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
//                             </div>

//                             <div className="flex justify-between text-slate-600 font-medium">
//                                 <span>Shipping</span>
//                                 <span className={isFreeShipping ? "text-green-600 font-bold" : "font-mono"}>
//                                     {isFreeShipping ? "FREE" : `₹${SHIPPING_FEE}`}
//                                 </span>
//                             </div>

//                             <div className="pt-6 border-t border-slate-100">
//                                 <div className="flex justify-between text-3xl font-black text-slate-900">
//                                     <span>Total</span>
//                                     <span className="font-mono tracking-tighter">₹{finalTotal.toLocaleString('en-IN')}</span>
//                                 </div>
//                                 <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-bold">
//                                     Secure checkout with encrypted payment
//                                 </p>
//                             </div>
//                         </div>

//                         <Button
//                             className="w-full mt-10 h-16 text-lg font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all"
//                             size="lg"
//                             asChild
//                         >
//                             <Link href="/checkout">
//                                 Proceed to Checkout <ArrowRight className="ml-3 w-6 h-6" />
//                             </Link>
//                         </Button>

//                         <div className="mt-8 flex items-center justify-center gap-4 py-4 border-t border-slate-50 grayscale opacity-40">
//                             <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter">
//                                 <ShieldCheck className="w-4 h-4" /> 100% Authentic
//                             </div>
//                             <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter">
//                                 <Truck className="w-4 h-4" /> Fast Delivery
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }