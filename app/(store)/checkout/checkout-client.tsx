"use client"

import { useState } from "react"
import { useCart } from "@/components/store/use-cart"
import { CheckoutShipping } from "@/components/store/checkout-shipping"
import { placeOrder } from "@/app/actions/orders"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { MapPin, Phone, User, Home, CreditCard } from "lucide-react"

export default function CheckoutPage({ profile }: { profile: any }) {
    const { items, shippingPrice, selectedShippingId, shippingMethods, clearCart } = useCart()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Initialize state with profile data for "Single-Click" checkout experience
    const [address, setAddress] = useState({
        full_name: profile?.full_name || "",
        phone: profile?.phone || "",
        pincode: profile?.pincode || "",
        street: profile?.street || ""
    })

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    const selectedMethod = shippingMethods.find(m => m.id === selectedShippingId)
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
                methodName: selectedMethod?.name
            })

            if (res.success) {
                toast.success("Order placed successfully!")
                clearCart()
                router.push(`/checkout/success?orderId=${res.orderId}`);
            }
        } catch (err) {
            toast.error("Failed to place order. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-black mb-10 text-center lg:text-left">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-10">

                    {/* Shipping Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-b pb-4">
                            <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                            <h2 className="text-xl font-bold uppercase tracking-tight">Shipping Address</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                <input
                                    className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                                    placeholder="Full Name"
                                    value={address.full_name}
                                    onChange={e => setAddress({ ...address, full_name: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                <input
                                    className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                                    placeholder="Phone Number"
                                    value={address.phone}
                                    onChange={e => setAddress({ ...address, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                            <input
                                className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-mono"
                                placeholder="6-Digit Pincode"
                                maxLength={6}
                                value={address.pincode}
                                onChange={e => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '') })}
                            />
                        </div>

                        <div className="relative">
                            <Home className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                            <textarea
                                className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-black outline-none transition-all min-h-[100px]"
                                placeholder="Complete Address (House No, Building, Street, Area)"
                                value={address.street}
                                onChange={e => setAddress({ ...address, street: e.target.value })}
                            />
                        </div>
                    </section>

                    {/* Shipping Method Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-b pb-4">
                            <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                            <h2 className="text-xl font-bold uppercase tracking-tight">Shipping Method</h2>
                        </div>
                        {/* Passes pincode to CheckoutShipping to calculate zone-based rates */}
                        <CheckoutShipping pincode={address.pincode} />
                    </section>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-3xl border shadow-xl shadow-slate-200/50 sticky top-24">
                        <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                            <CreditCard className="w-5 h-5" /> Summary
                        </h3>

                        <div className="space-y-4 text-sm mb-6 pb-6 border-b border-dashed">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal ({items.length} items)</span>
                                <span>₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Shipping Fee</span>
                                <span className={shippingPrice === 0 ? "text-green-600 font-bold" : ""}>
                                    {shippingPrice === 0 ? "FREE" : `₹${shippingPrice}`}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-8">
                            <span className="font-medium text-slate-500 uppercase text-xs tracking-widest">Total Amount</span>
                            <span className="text-3xl font-black italic">₹{total.toLocaleString()}</span>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading || !selectedShippingId}
                            className="w-full bg-black text-white py-5 rounded-2xl font-bold text-lg hover:bg-slate-900 transition-all active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none"
                        >
                            {loading ? "Processing..." : "Place Order (COD)"}
                        </button>

                        <p className="text-[10px] text-center mt-4 text-slate-400 uppercase tracking-tighter">
                            By clicking, you agree to our Terms & Conditions
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}