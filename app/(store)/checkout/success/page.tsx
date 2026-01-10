"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, Package, ArrowRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OrderSuccessPage() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get("orderId")

    return (
        <div className="container mx-auto px-4 py-20 min-h-[70vh] flex flex-col items-center justify-center text-center">
            {/* Success Icon */}
            <div className="mb-6 bg-green-50 p-4 rounded-full">
                <CheckCircle2 className="w-16 h-16 text-green-600 animate-in zoom-in duration-500" />
            </div>

            <h1 className="text-4xl font-black text-slate-900 mb-2">Thank You!</h1>
            <p className="text-lg text-slate-600 mb-8 max-w-md">
                Your order has been placed successfully. We've sent a confirmation email to your inbox.
            </p>

            {/* Order Info Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-10 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-500 font-medium text-sm">Order Number</span>
                    <span className="text-slate-900 font-bold font-mono">#{orderId?.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium text-sm">Payment Method</span>
                    <span className="text-slate-900 font-bold text-sm">Cash on Delivery</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Button asChild className="flex-1 bg-black hover:bg-slate-800 text-white py-6 rounded-xl">
                    <Link href={`/profile/orders/${orderId}`}>
                        <Package className="mr-2 h-4 w-4" /> View Order
                    </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 py-6 rounded-xl border-slate-200">
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" /> Back to Home
                    </Link>
                </Button>
            </div>

            <p className="mt-12 text-sm text-slate-400 italic">
                Having trouble? <Link href="/contact" className="underline underline-offset-4">Contact Support</Link>
            </p>
        </div>
    )
}