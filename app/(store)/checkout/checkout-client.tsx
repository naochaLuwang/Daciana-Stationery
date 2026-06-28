"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/components/store/use-cart"
import { placeOrder } from "@/app/actions/orders"
import { validatePromoCode } from "@/app/actions/promo"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
    Plus,
    Loader2,
    Check,
    ChevronRight,
    MapPin,
    ShoppingBag,
    Ticket,
    X,
    Sparkles,
    Home,
    Briefcase,
    Star,
} from "lucide-react"
import { checkPromoEligibility } from "@/lib/promo-helper"

const LABEL_ICONS: Record<string, typeof Home> = { Home, Work: Briefcase, Other: MapPin }

export default function CheckoutClient({
    userId,
    initialAddresses,
    allPromos = [],
}: {
    userId: string
    initialAddresses: any[]
    allPromos?: any[]
}) {
    const router = useRouter()
    const {
        items,
        shippingPrice,
        shippingLabel,
        deliveryTimeLabel,
        selectedShippingId,
        clearCart,
        setShippingMethod,
        getSubtotal,
        appliedPromo,
        setAppliedPromo,
        getDiscountAmount,
        getFinalTotal,
    } = useCart()

    const [mounted, setMounted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [savedAddresses, setSavedAddresses] = useState(initialAddresses)
    const [selectedAddress, setSelectedAddress] = useState<any | null>(
        initialAddresses.find((a: any) => a.is_default) || initialAddresses[0] || null
    )
    const [showAddressPicker, setShowAddressPicker] = useState(false)
    const [showPromoPicker, setShowPromoPicker] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (selectedAddress?.shipping_methods) {
            const m = selectedAddress.shipping_methods
            setShippingMethod({
                id: m.id,
                name: m.name,
                price: Number(m.price),
                delivery_time_label: m.delivery_time_label,
            })
        } else {
            setShippingMethod({
                id: "",
                name: "",
                price: 0,
                delivery_time_label: "",
            })
        }
    }, [selectedAddress])

    const subtotal = mounted ? getSubtotal() : 0
    const discountAmount = mounted ? getDiscountAmount() : 0
    const total = mounted ? getFinalTotal() : 0

    const handleAddressAdded = (newAddr: any) => {
        setSavedAddresses((prev: any) => [newAddr, ...prev])
        setSelectedAddress(newAddr)
    }

    const handleSelectAddress = (addr: any) => {
        setSelectedAddress(addr)
        setShowAddressPicker(false)
    }

    const handleApplyPromo = async (promo: any) => {
        const result = await validatePromoCode(promo.code, items)
        if (result.success) {
            setAppliedPromo({
                ...result,
                allowedProductIds: promo.promo_code_products?.map((p: any) =>
                    String(p.product_id)
                ),
                allowedCategoryIds: promo.promo_code_categories?.map((c: any) =>
                    String(c.category_id)
                ),
            })
            setShowPromoPicker(false)
            toast.success(`Coupon ${promo.code} Applied!`)
        } else {
            toast.error(result.message || "Cannot apply this coupon")
        }
    }

    const handleRemovePromo = () => {
        setAppliedPromo(null)
        toast.info("Promo code removed")
    }

    const handlePlaceOrder = async () => {
        if (!selectedAddress || !selectedShippingId) {
            return toast.error("Please select a delivery address")
        }
        setLoading(true)
        try {
            const promoDetails = appliedPromo
                ? {
                      code: appliedPromo.code,
                      discount: discountAmount,
                      id: appliedPromo.id,
                  }
                : undefined

            const res = await placeOrder(
                {
                    full_name: selectedAddress.full_name,
                    phone: selectedAddress.phone,
                    pincode: selectedAddress.pincode,
                    street: selectedAddress.street,
                },
                items,
                {
                    total,
                    price: shippingPrice,
                    methodName: shippingLabel,
                    methodId: selectedShippingId,
                },
                promoDetails
            )
            if (res.success) {
                clearCart()
                router.push(`/checkout/success?orderId=${res.orderId}`)
            } else {
                toast.error(res.message || "Order failed")
            }
        } catch {
            toast.error("Process interrupted")
        } finally {
            setLoading(false)
        }
    }

    if (!mounted) return null

    const eligiblePromos = allPromos.filter((p: any) =>
        checkPromoEligibility(p, items).isEligible
    )
    const ineligiblePromos = allPromos.filter(
        (p: any) => !checkPromoEligibility(p, items).isEligible
    )

    return (
        <div className="min-h-screen bg-gray-50/80 pb-24">
            {/* Deliver To */}
            {selectedAddress ? (
                <button
                    onClick={() => setShowAddressPicker(true)}
                    className="w-full bg-white border-b border-gray-100 px-5 py-3.5 flex items-center gap-3 text-left"
                >
                    <MapPin className="w-[18px] h-[18px] text-gray-900 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                            Deliver to:{" "}
                            <span className="font-semibold">
                                {selectedAddress.full_name}
                            </span>
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                            {selectedAddress.street}
                            {selectedAddress.city
                                ? `, ${selectedAddress.city}`
                                : ""}
                            {selectedAddress.state
                                ? `, ${selectedAddress.state}`
                                : ""}{" "}
                            &mdash; {selectedAddress.pincode}
                        </p>
                        {selectedAddress.shipping_methods && (
                            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                                {selectedAddress.shipping_methods.name} —{" "}
                                {Number(selectedAddress.shipping_methods.price) === 0
                                    ? "FREE"
                                    : `₹${Number(selectedAddress.shipping_methods.price)}`}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs font-semibold text-gray-900">
                            Change
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                </button>
            ) : (
                <div className="bg-white px-5 py-8 flex flex-col items-center border-b border-gray-100">
                    <MapPin className="w-9 h-9 text-gray-300 mb-3" />
                    <p className="text-sm font-semibold text-gray-700">
                        No saved addresses
                    </p>
                    <p className="text-xs text-gray-400 mt-1 mb-4">
                        Add a delivery address to continue
                    </p>
                    <button
                        onClick={() => setShowAddressPicker(true)}
                        className="h-10 px-6 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" /> Add New Address
                    </button>
                </div>
            )}

            <div className="px-5 py-5 space-y-6">
                {/* Items */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <ShoppingBag className="w-[18px] h-[18px] text-gray-700" />
                        <h2 className="text-sm font-bold text-gray-900">
                            Items ({items.length})
                        </h2>
                    </div>
                    <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
                        {items.map((item: any, idx: number) => (
                            <div
                                key={item.variantId}
                                className={`flex items-center gap-3 p-3 ${
                                    idx < items.length - 1
                                        ? "border-b border-gray-50"
                                        : ""
                                }`}
                            >
                                <img
                                    src={item.image || "/placeholder.png"}
                                    alt={item.name}
                                    className="w-14 h-14 rounded-lg object-cover bg-gray-50"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
                                        {item.name}
                                    </p>
                                    {item.variantTitle && (
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {item.variantTitle}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Qty: {item.quantity}
                                    </p>
                                </div>
                                <p className="text-sm font-bold text-gray-900 shrink-0">
                                    ₹{Math.round(item.price * item.quantity)}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Offers & Coupons */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <Ticket className="w-[18px] h-[18px] text-gray-700" />
                        <h2 className="text-sm font-bold text-gray-900">
                            Offers & Coupons
                        </h2>
                    </div>
                    {appliedPromo ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
                            <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
                                <Check className="w-[18px] h-[18px] text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900">
                                    {appliedPromo.code}
                                </p>
                                <p className="text-xs font-semibold text-green-600">
                                    You saved ₹{discountAmount}
                                </p>
                            </div>
                            <button onClick={handleRemovePromo}>
                                <X className="w-[18px] h-[18px] text-gray-400" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowPromoPicker(true)}
                            className="w-full bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3"
                        >
                            <div className="w-9 h-9 bg-pink-50 rounded-lg flex items-center justify-center shrink-0">
                                <Ticket className="w-4 h-4 text-gray-900" />
                            </div>
                            <span className="flex-1 text-sm font-semibold text-gray-900 text-left">
                                {eligiblePromos.length > 0
                                    ? `${eligiblePromos.length} coupon${
                                          eligiblePromos.length > 1 ? "s" : ""
                                      } available`
                                    : "View all coupons"}
                            </span>
                            {eligiblePromos.length > 0 && (
                                <span className="h-5 min-w-[22px] px-1.5 bg-gray-900 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">
                                    {eligiblePromos.length}
                                </span>
                            )}
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                    )}
                </section>

                {/* Payment Method */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <svg
                            className="w-[18px] h-[18px] text-gray-700"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                        </svg>
                        <h2 className="text-sm font-bold text-gray-900">
                            Payment Method
                        </h2>
                    </div>
                    <div className="bg-white border-2 border-gray-900 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                            <svg
                                className="w-5 h-5 text-gray-900"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125V9M2.25 6h18m10.5 0V9"
                                />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                                Cash on Delivery
                            </p>
                            <p className="text-xs text-gray-400">
                                Pay when your order arrives
                            </p>
                        </div>
                        <Check className="w-5 h-5 text-gray-900" />
                    </div>
                </section>

                {/* Price Summary */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <svg
                            className="w-[18px] h-[18px] text-gray-700"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                        </svg>
                        <h2 className="text-sm font-bold text-gray-900">
                            Price Summary
                        </h2>
                    </div>
                    <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
                        <div className="px-4 py-3 flex justify-between">
                            <span className="text-sm text-gray-500">
                                Subtotal ({items.length} item
                                {items.length !== 1 ? "s" : ""})
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                                ₹{Math.round(subtotal).toLocaleString("en-IN")}
                            </span>
                        </div>
                        <div className="h-px bg-gray-50 mx-4" />
                        <div className="px-4 py-3 flex justify-between">
                            <div>
                                <span className="text-sm text-gray-500">
                                    Shipping
                                    {shippingLabel &&
                                    shippingLabel !== "Standard"
                                        ? ` (${shippingLabel})`
                                        : ""}
                                </span>
                                {shippingPrice > 0 && subtotal < 3000 && (
                                    <p className="text-xs font-semibold text-green-500 mt-0.5">
                                        Free above ₹3,000
                                    </p>
                                )}
                            </div>
                            <span
                                className={`text-sm font-medium ${
                                    shippingPrice === 0 && selectedShippingId
                                        ? "text-green-500"
                                        : "text-gray-900"
                                }`}
                            >
                                {shippingPrice === 0 && selectedShippingId
                                    ? "FREE"
                                    : `₹${Math.round(shippingPrice).toLocaleString("en-IN")}`}
                            </span>
                        </div>
                        {discountAmount > 0 && (
                            <>
                                <div className="h-px bg-gray-50 mx-4" />
                                <div className="px-4 py-3 flex justify-between">
                                    <span className="text-sm text-green-500">
                                        Promo Discount
                                    </span>
                                    <span className="text-sm font-medium text-green-500">
                                        -₹{discountAmount}
                                    </span>
                                </div>
                            </>
                        )}
                        <div className="h-px bg-gray-100 mx-4" />
                        <div className="px-4 py-3 flex justify-between">
                            <span className="text-base font-bold text-gray-900">
                                Total
                            </span>
                            <span className="text-lg font-extrabold text-gray-900">
                                ₹{Math.round(total).toLocaleString("en-IN")}
                            </span>
                        </div>
                    </div>
                </section>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-3 flex items-center gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-50">
                <div>
                    <p className="text-[10px] font-black tracking-wider text-gray-400 uppercase">
                        Total
                    </p>
                    <p className="text-xl font-extrabold text-gray-900">
                        ₹{Math.round(total).toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-gray-400">incl. taxes & fees</p>
                </div>
                <div className="flex-1">
                    <button
                        onClick={handlePlaceOrder}
                        disabled={loading || !selectedAddress || !selectedShippingId}
                        className="w-full h-[46px] bg-gray-900 text-white text-xs font-black tracking-wider rounded-full flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-gray-800 transition-colors"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "Place Order"
                        )}
                    </button>
                </div>
            </div>

            {/* Address Picker Bottom Sheet */}
            {showAddressPicker && (
                <div className="fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setShowAddressPicker(false)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] flex flex-col">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                            <h3 className="text-base font-bold text-gray-900">
                                Select Delivery Address
                            </h3>
                            <button onClick={() => setShowAddressPicker(false)}>
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-3">
                            {savedAddresses.length === 0 ? (
                                <div className="text-center py-8">
                                    <MapPin className="mx-auto w-8 h-8 text-gray-300" />
                                    <p className="mt-3 text-sm font-medium text-gray-500">
                                        No saved addresses
                                    </p>
                                </div>
                            ) : (
                                savedAddresses.map((addr: any) => {
                                    const Icon =
                                        LABEL_ICONS[addr.label] || MapPin
                                    const isSelected =
                                        selectedAddress?.id === addr.id
                                    return (
                                        <button
                                            key={addr.id}
                                            onClick={() =>
                                                handleSelectAddress(addr)
                                            }
                                            className={`w-full text-left rounded-xl border-2 p-4 transition-colors ${
                                                isSelected
                                                    ? "border-gray-900 bg-gray-50"
                                                    : "border-gray-200"
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                                                        isSelected
                                                            ? "border-gray-900"
                                                            : "border-gray-300"
                                                    }`}
                                                >
                                                    {isSelected && (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-gray-900 uppercase">
                                                            {addr.label}
                                                        </span>
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            {addr.full_name}
                                                        </span>
                                                        {addr.is_default && (
                                                            <Star className="w-3 h-3 text-amber-500" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
                                                        {addr.street}
                                                        {addr.city
                                                            ? `, ${addr.city}`
                                                            : ""}
                                                        {addr.state
                                                            ? `, ${addr.state}`
                                                            : ""}{" "}
                                                        - {addr.pincode}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {addr.phone}
                                                    </p>
                                                    {addr.shipping_methods && (
                                                        <p className="text-[10px] font-semibold text-emerald-600 mt-1">
                                                            {
                                                                addr
                                                                    .shipping_methods
                                                                    .name
                                                            }{" "}
                                                            &mdash;{" "}
                                                            {Number(
                                                                addr
                                                                    .shipping_methods
                                                                    .price
                                                            ) === 0
                                                                ? "FREE"
                                                                : `₹${Number(
                                                                      addr
                                                                          .shipping_methods
                                                                          .price
                                                                  )}`}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })
                            )}
                        </div>
                        {savedAddresses.length > 0 && (
                            <div className="px-5 pb-6 shrink-0">
                                <button
                                    onClick={() => {
                                        setShowAddressPicker(false)
                                        window.location.href = "/profile"
                                    }}
                                    className="w-full h-12 rounded-xl border-2 border-dashed border-gray-200 text-xs font-bold text-gray-500 flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add New Address
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Promo Picker Bottom Sheet */}
            {showPromoPicker && (
                <div className="fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setShowPromoPicker(false)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] flex flex-col">
                        <div className="bg-gray-900 px-5 pt-5 pb-6 shrink-0 rounded-t-2xl">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        Available Offers
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-0.5">
                                        {eligiblePromos.length} coupon
                                        {eligiblePromos.length !== 1
                                            ? "s"
                                            : ""}{" "}
                                        can be applied
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowPromoPicker(false)}
                                    className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {eligiblePromos.length > 0 && (
                                <div>
                                    <p className="text-xs font-extrabold uppercase tracking-wider text-gray-900 mb-3">
                                        Available for you
                                    </p>
                                    {eligiblePromos.map((promo: any) => {
                                        const discountLabel =
                                            promo.discount_type === "percentage"
                                                ? `${promo.discount_value}% OFF`
                                                : `₹${promo.discount_value} OFF`
                                        return (
                                            <button
                                                key={promo.id}
                                                onClick={() =>
                                                    handleApplyPromo(promo)
                                                }
                                                className={`w-full text-left rounded-xl border-2 p-4 mb-3 transition-colors ${
                                                    appliedPromo?.code ===
                                                    promo.code
                                                        ? "border-green-400 bg-green-50"
                                                        : "border-gray-200"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                                        style={{
                                                            backgroundColor:
                                                                appliedPromo?.code ===
                                                                promo.code
                                                                    ? "#22C55E"
                                                                    : "#111",
                                                        }}
                                                    >
                                                        {promo.discount_type ===
                                                        "percentage" ? (
                                                            <Sparkles className="w-4 h-4 text-white" />
                                                        ) : (
                                                            <span className="text-sm font-bold text-white">
                                                                ₹
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-gray-900">
                                                                {promo.code}
                                                            </span>
                                                            <span
                                                                className={`text-[10px] font-bold ${
                                                                    appliedPromo?.code ===
                                                                    promo.code
                                                                        ? "text-green-600"
                                                                        : "text-gray-900"
                                                                }`}
                                                            >
                                                                {discountLabel}
                                                            </span>
                                                        </div>
                                                        {promo.description && (
                                                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                                                                {promo.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {appliedPromo?.code ===
                                                    promo.code ? (
                                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                            <Check className="w-3.5 h-3.5 text-white" />
                                                        </div>
                                                    ) : (
                                                        <Plus className="w-5 h-5 text-gray-900" />
                                                    )}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                            {ineligiblePromos.length > 0 && (
                                <div>
                                    <p className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-3">
                                        Other offers
                                    </p>
                                    {ineligiblePromos.map((promo: any) => {
                                        const { reasons } =
                                            checkPromoEligibility(promo, items)
                                        return (
                                            <div
                                                key={promo.id}
                                                className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 p-4 mb-3 opacity-60"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                                                        {promo.discount_type ===
                                                        "percentage" ? (
                                                            <Sparkles className="w-4 h-4 text-gray-400" />
                                                        ) : (
                                                            <span className="text-sm font-bold text-gray-400">
                                                                ₹
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-gray-500">
                                                                {promo.code}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-gray-400">
                                                                {promo.discount_type ===
                                                                "percentage"
                                                                    ? `${promo.discount_value}% OFF`
                                                                    : `₹${promo.discount_value} OFF`}
                                                            </span>
                                                        </div>
                                                        {reasons[0] && (
                                                            <p className="text-[10px] font-semibold text-amber-600 mt-0.5">
                                                                · {reasons[0]}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                            {allPromos.length === 0 && (
                                <div className="py-16 flex flex-col items-center">
                                    <Ticket className="w-12 h-12 text-gray-200 mb-3" />
                                    <p className="text-sm font-semibold text-gray-400">
                                        No offers available right now
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
