"use client"

import { useState } from "react"
import { useCart } from "@/components/store/use-cart"
import { CheckoutShipping } from "@/components/store/checkout-shipping"
import { placeOrder } from "@/app/actions/orders"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { MapPin, Phone, User, Home, CreditCard, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function CheckoutClient({ profile }: { profile: any }) {
    // UPDATED: Destructuring shippingLabel to fix the database saving issue
    const { items, shippingPrice, selectedShippingId, shippingLabel, clearCart } = useCart()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const [address, setAddress] = useState({
        full_name: profile?.full_name || "",
        phone: profile?.phone || "",
        pincode: profile?.pincode || "",
        street: profile?.street || ""
    })

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    const total = subtotal + shippingPrice

    const handlePlaceOrder = async () => {
        if (!address.full_name || !address.phone || !address.pincode || !address.street || !selectedShippingId) {
            return toast.error("Please ensure all shipping details are complete.")
        }

        setLoading(true)
        try {
            const res = await placeOrder({
                full_name: address.full_name,
                phone: address.phone,
                pincode: address.pincode,
                street: address.street
            }, items, {
                total,
                price: shippingPrice,
                // SUCCESS: This now sends "Express Delivery" etc. instead of undefined
                methodName: shippingLabel
            })

            if (res.success) {
                toast.success("Order placed successfully!")
                clearCart()
                router.push(`/checkout/success?orderId=${res.orderId}`);
            } else {
                toast.error(res.message || "Failed to place order.")
            }
        } catch (err) {
            toast.error("An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <h2 className="text-2xl font-black uppercase tracking-tighter">Your cart is empty</h2>
                <Link href="/shop" className="text-sm font-bold underline underline-offset-4">Continue Shopping</Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex items-center gap-4 mb-10">
                <Link href="/cart" className="p-2 hover:bg-white rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-3xl font-black uppercase tracking-tighter">Checkout</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-10">
                    {/* Step 1: Shipping Address */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                            <div className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                            <h2 className="text-xl font-bold uppercase tracking-tight">Shipping Address</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <User className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                                <input
                                    className="w-full pl-12 p-4 border-2 border-slate-100 rounded-[1.25rem] focus:border-slate-900 outline-none transition-all font-medium"
                                    placeholder="Full Name"
                                    value={address.full_name}
                                    onChange={e => setAddress({ ...address, full_name: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                                <input
                                    className="w-full pl-12 p-4 border-2 border-slate-100 rounded-[1.25rem] focus:border-slate-900 outline-none transition-all font-medium"
                                    placeholder="Phone Number"
                                    value={address.phone}
                                    onChange={e => setAddress({ ...address, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <MapPin className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                            <input
                                className="w-full pl-12 p-4 border-2 border-slate-100 rounded-[1.25rem] focus:border-slate-900 outline-none transition-all font-mono font-bold"
                                placeholder="6-Digit Pincode"
                                maxLength={6}
                                value={address.pincode}
                                onChange={e => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '') })}
                            />
                        </div>

                        <div className="relative">
                            <Home className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                            <textarea
                                className="w-full pl-12 p-4 border-2 border-slate-100 rounded-[1.25rem] focus:border-slate-900 outline-none transition-all min-h-[120px] font-medium"
                                placeholder="House No, Building, Street, Area"
                                value={address.street}
                                onChange={e => setAddress({ ...address, street: e.target.value })}
                            />
                        </div>
                    </section>

                    {/* Step 2: Shipping Method */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                            <div className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                            <h2 className="text-xl font-bold uppercase tracking-tight">Shipping Method</h2>
                        </div>
                        <CheckoutShipping pincode={address.pincode} />
                    </section>
                </div>

                {/* Right Column: Sticky Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl shadow-slate-200/40 sticky top-24">
                        <h3 className="font-black text-xl mb-8 flex items-center gap-2 uppercase tracking-tighter">
                            <CreditCard className="w-5 h-5" /> Order Summary
                        </h3>

                        <div className="space-y-4 mb-8 pb-8 border-b border-dashed border-slate-200">
                            <div className="flex justify-between text-slate-500 font-bold text-xs uppercase tracking-widest">
                                <span>Items Subtotal</span>
                                <span className="text-slate-900">₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 font-bold text-xs uppercase tracking-widest">
                                <span>Shipping Fee</span>
                                <span className={shippingPrice === 0 ? "text-emerald-600" : "text-slate-900"}>
                                    {shippingPrice === 0 ? "FREE" : `₹${shippingPrice}`}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-10">
                            <span className="font-black text-slate-400 uppercase text-[10px] tracking-[0.3em]">Payable Amount</span>
                            <span className="text-4xl font-black italic tracking-tighter">₹{total.toLocaleString()}</span>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading || !selectedShippingId}
                            className="w-full bg-slate-900 text-white py-6 rounded-[1.5rem] font-black text-lg uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-[0.98] disabled:opacity-20 disabled:grayscale shadow-xl shadow-slate-200"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Processing</span>
                                </div>
                            ) : (
                                "Confirm Order"
                            )}
                        </button>

                        <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
                            <div className="h-1 w-1 rounded-full bg-slate-300" />
                            <p className="text-[9px] font-bold uppercase tracking-widest">Cash on Delivery only</p>
                            <div className="h-1 w-1 rounded-full bg-slate-300" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}