"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Printer, ArrowLeft, Package, User, MapPin, Loader2, Globe } from "lucide-react"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react" // Import QR Code component

export default function OrderDetailsPage() {
    const { id } = useParams()
    const supabase = createClient()
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Construct your tracking URL (replace with your actual domain)
    const trackingUrl = `https://dacianastore.in/track/${id}`

    useEffect(() => {
        async function fetchOrder() {
            const { data } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('id', id)
                .single()
            setOrder(data)
            setLoading(false)
        }
        fetchOrder()
    }, [id])

    const handlePrint = () => window.print()

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
    )

    if (!order) return <div className="p-10 text-center">Order not found</div>

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    #printable-invoice, #printable-invoice * { visibility: visible; }
                    #printable-invoice {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        border: none !important;
                        padding: 0 !important;
                    }
                    .no-print { display: none !important; }
                }
            `}</style>

            {/* Header / Actions */}
            <div className="flex justify-between items-center mb-8 no-print">
                <Button variant="ghost" asChild className="rounded-full">
                    <Link href="/admin/orders">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
                    </Link>
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handlePrint} className="rounded-full shadow-sm">
                        <Printer className="w-4 h-4 mr-2" /> Print Invoice
                    </Button>
                </div>
            </div>

            {/* Invoice Container */}
            <div id="printable-invoice" className="bg-white border p-12 rounded-[2.5rem] shadow-sm print:shadow-none print:border-none">

                {/* BRANDING & INVOICE TITLE */}
                <div className="flex justify-between items-start mb-12">
                    <div className="flex flex-col">
                        <span className="text-3xl font-black font-daciana tracking-[0.15em] leading-none text-slate-900 uppercase">
                            DACIANA
                        </span>
                        <span className="text-[9px] font-bold tracking-[0.3em] text-slate-400 uppercase whitespace-nowrap mt-1">
                            Stationery & Cosmetics
                        </span>
                    </div>
                    <div>
                        <div className="text-right">
                            <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-100 leading-none">Invoice</h1>
                            <p className="text-slate-500 font-mono text-xs mt-2 uppercase tracking-widest">Ref: {order.id.slice(0, 8)}</p>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Date Issued</p>
                            <p className="font-bold text-slate-900">{new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                        </div>
                    </div>

                </div>



                {/* CUSTOMER & SHIPPING */}
                <div className="grid grid-cols-2 gap-16 mb-16">
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 flex items-center gap-2 tracking-[0.2em]">
                            <User className="w-3 h-3" /> Customer Detail
                        </h3>
                        <p className="font-black text-xl text-slate-900">{order.shipping_address?.full_name}</p>
                        <p className="text-slate-500 mt-1 font-medium">{order.shipping_address?.phone}</p>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 flex items-center gap-2 tracking-[0.2em]">
                            <MapPin className="w-3 h-3" /> Ship To
                        </h3>
                        <p className="text-slate-600 leading-relaxed font-medium">
                            {order.shipping_address?.street},<br />
                            Pincode: <span className="font-black text-slate-900">{order.shipping_address?.pincode}</span>
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                            {order.shipping_label}
                        </div>
                    </div>
                </div>

                {/* ITEMS TABLE */}
                <div className="mb-12">
                    <table className="w-full">
                        <thead>
                            <tr className="text-[10px] text-slate-400 uppercase tracking-[0.2em] border-b pb-4 font-black">
                                <th className="pb-4 text-left">Item Description</th>
                                <th className="pb-4 text-center">Qty</th>
                                <th className="pb-4 text-right">Rate</th>
                                <th className="pb-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {order.order_items.map((item: any) => (
                                <tr key={item.id} className="text-sm">
                                    <td className="py-6">
                                        <p className="font-black text-slate-900 uppercase tracking-tight leading-none">{item.product_name}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{item.variant_title}</p>
                                    </td>
                                    <td className="py-6 text-center font-bold text-slate-600 italic">x{item.quantity}</td>
                                    <td className="py-6 text-right font-medium text-slate-400">₹{item.unit_price}</td>
                                    <td className="py-6 text-right font-black text-slate-900">₹{item.unit_price * item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* TOTALS & QR SECTION */}
                <div className="grid grid-cols-2 pt-10 border-t-2 border-slate-900 border-dashed items-start">
                    {/* QR CODE DIV */}
                    <div className="flex items-center gap-5">
                        <div className="p-2 border border-slate-100 rounded-xl bg-slate-50">
                            <QRCodeSVG
                                value={trackingUrl}
                                size={80}
                                level="H"
                                includeMargin={false}
                                bgColor="transparent"
                            />
                        </div>
                        <div className="max-w-[150px]">
                            <p className="text-[9px] font-black uppercase text-slate-900 tracking-tighter mb-1">Track Delivery</p>
                            <p className="text-[8px] text-slate-400 leading-tight font-medium">Scan this code to view real-time shipping status for this order.</p>
                        </div>
                    </div>

                    {/* TOTAL CALCULATIONS */}
                    <div className="flex flex-col items-end space-y-3">
                        <div className="flex justify-between w-full max-w-[200px] text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                            <span>Subtotal</span>
                            <span className="text-slate-900 font-black">₹{order.total - order.shipping_price}</span>
                        </div>
                        <div className="flex justify-between w-full max-w-[200px] text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                            <span>Shipping</span>
                            <span className="text-slate-900 font-black text-right">₹{order.shipping_price}</span>
                        </div>
                        <div className="flex justify-between w-full max-w-[240px] text-3xl font-black border-t-4 border-slate-900 pt-4">
                            <span className="uppercase tracking-tighter text-sm self-center">Grand Total</span>
                            <span className="tracking-tighter italic">₹{order.total}</span>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="mt-20 flex justify-between items-center border-t border-slate-50 pt-8">
                    <p className="text-[8px] text-slate-300 uppercase font-black tracking-[0.4em]">
                        Official Daciana Invoice
                    </p>
                    <div className="flex items-center gap-2 text-slate-300">
                        <Globe className="w-3 h-3" />
                        <span className="text-[8px] font-black tracking-widest uppercase italic">www.daciana.in</span>
                    </div>
                </div>
            </div>
        </div>
    )
}