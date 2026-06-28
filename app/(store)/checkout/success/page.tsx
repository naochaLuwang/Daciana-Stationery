"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, Package, Home } from "lucide-react"

export default function OrderSuccessPage() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get("orderId")

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Placed!</h1>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                    Your order has been placed successfully. You&apos;ll receive a confirmation shortly.
                </p>

                <div className="bg-slate-50 rounded-2xl p-5 mb-8 text-left space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order ID</span>
                        <span className="text-xs font-bold font-mono text-slate-900">#{orderId?.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="border-t border-slate-200/60" />
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment</span>
                        <span className="text-xs font-bold text-slate-900">Cash on Delivery</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href={`/profile/orders/${orderId}`}
                        className="flex-1 h-12 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                    >
                        <Package className="w-4 h-4" /> View Order
                    </Link>
                    <Link
                        href="/"
                        className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                    >
                        <Home className="w-4 h-4" /> Back Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
