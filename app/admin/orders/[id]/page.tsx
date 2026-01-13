"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Printer, ArrowLeft, User, MapPin, Loader2, Globe, CreditCard, ShieldCheck, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"

// Helper function for Indian Currency Word Conversion
const numberToWords = (num: number) => {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const format = (n: number): string => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
        if (n < 1000) return a[Math.floor(n / 100)] + "hundred " + (n % 100 !== 0 ? format(n % 100) : "");
        if (n < 100000) return format(Math.floor(n / 1000)) + "thousand " + (n % 1000 !== 0 ? format(n % 1000) : "");
        if (n < 10000000) return format(Math.floor(n / 100000)) + "lakh " + (n % 100000 !== 0 ? format(n % 100000) : "");
        return "";
    };
    return (format(Math.floor(num)) + "rupees only").toUpperCase();
};

export default function OrderDetailsPage() {
    const { id } = useParams()
    const supabase = createClient()
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)

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

    // Color Coding Logic
    const getStatusStyles = (status: string) => {
        const s = status?.toLowerCase()
        if (s === 'paid') return {
            bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: <CheckCircle2 className="w-3 h-3" />
        }
        if (s === 'pending') return {
            bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: <Clock className="w-3 h-3" />
        }
        return {
            bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', icon: <AlertCircle className="w-3 h-3" />
        }
    }

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
    )

    if (!order) return <div className="p-10 text-center">Order not found</div>

    const statusStyle = getStatusStyles(order.payment_status)

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

            <div className="flex justify-between items-center mb-8 no-print">
                <Button variant="ghost" asChild className="rounded-full">
                    <Link href="/admin/orders">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
                    </Link>
                </Button>
                <Button onClick={handlePrint} className="rounded-full shadow-lg bg-slate-900 hover:bg-slate-800 transition-all">
                    <Printer className="w-4 h-4 mr-2" /> Print Invoice
                </Button>
            </div>

            <div id="printable-invoice" className="bg-white border p-12 rounded-[2.5rem] shadow-sm print:shadow-none print:border-none relative overflow-hidden">

                {/* Background Status Watermark (Visual Only) */}
                <div className={`absolute -top-10 -right-10 text-8xl font-black uppercase opacity-[0.03] rotate-12 pointer-events-none select-none ${statusStyle.text}`}>
                    {order.payment_status}
                </div>

                {/* Branding & Business Info */}
                <div className="flex justify-between items-start mb-2 relative z-10">
                    <div className="flex flex-col">
                        <span className="text-3xl font-black font-daciana tracking-[0.15em] leading-none text-slate-900 uppercase">
                            DACIANA
                        </span>
                        <span className="text-[9px] font-bold tracking-[0.3em] text-slate-400 uppercase whitespace-nowrap mt-1 mb-4">
                            Stationery & Cosmetics
                        </span>
                        <div className="text-[10px] text-slate-500 font-medium leading-relaxed">
                            <p>Kontha khabam mayai leikai Imphal,</p>
                            <p>Manipur Imphal 795002</p>
                            <p className="font-bold text-slate-700">Phone: 6909013764</p>
                        </div>

                        {/* Payment Status Badge - COLOR CODED */}
                        <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} text-[10px] font-black uppercase tracking-widest shadow-sm`}>
                            {statusStyle.icon}
                            Status: {order.payment_status || 'Paid'}
                        </div>
                    </div>

                    <div className="text-right">
                        <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-100 leading-none">Invoice</h1>
                        <p className="text-slate-500 font-mono text-xs mt-2 uppercase tracking-widest">Ref: {order.id.slice(0, 8)}</p>
                        <div className="mt-6">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Date Issued</p>
                            <p className="font-bold text-slate-900">{new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                        </div>
                    </div>
                </div>

                {/* Customer Detail Section */}
                <div className="grid grid-cols-2 gap-16 mb-8 border-t border-b border-slate-50 py-8 relative z-10">
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
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-10 relative z-10">
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
                                <tr key={item.id} className="text-sm group">
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

                {/* Amount in Words */}
                <div className="bg-slate-50 p-6 rounded-2xl mb-10 flex justify-between items-center border border-slate-100 relative z-10">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic">Amount in words</p>
                        <p className="text-xs font-black text-slate-700 uppercase tracking-tight italic">{numberToWords(order.total)}</p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 justify-end text-slate-400 mb-1">
                            <CreditCard className="w-3 h-3" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Mode</span>
                        </div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{order.payment_method || 'Online'}</p>
                    </div>
                </div>

                {/* Totals & T&C Section */}
                <div className="grid grid-cols-2 pt-5 border-t-2 border-slate-900 border-dashed items-start relative z-10">
                    <div className="space-y-8">
                        <div className="flex items-center gap-5">
                            <div className="p-2 border border-slate-100 rounded-xl bg-slate-50">
                                <QRCodeSVG value={trackingUrl} size={70} level="H" bgColor="transparent" />
                            </div>
                            <div className="max-w-[150px]">
                                <p className="text-[9px] font-black uppercase text-slate-900 tracking-tighter mb-1">Track Delivery</p>
                                <p className="text-[8px] text-slate-400 leading-tight font-medium">Scan to view real-time shipping status.</p>
                            </div>
                        </div>

                        <div className="bg-slate-900 text-white p-4 rounded-2xl mr-10 shadow-lg shadow-slate-200">
                            <p className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-50">Terms & Conditions</p>
                            <p className="text-[10px] font-bold leading-tight italic">
                                "Goods once sold will not be taken back or exchanged."
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end space-y-3">
                        <div className="flex justify-between w-full max-w-[200px] text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                            <span>Subtotal</span>
                            <span className="text-slate-900 font-black">₹{order.total - (order.shipping_price || 0)}</span>
                        </div>
                        <div className="flex justify-between w-full max-w-[200px] text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                            <span>Shipping</span>
                            <span className="text-slate-900 font-black text-right">₹{order.shipping_price || 0}</span>
                        </div>
                        <div className="flex justify-between w-full max-w-[240px] text-4xl font-black border-t-4 border-slate-900 pt-4 mt-2">
                            <span className="uppercase tracking-tighter text-xs self-center text-slate-400">Total</span>
                            <span className="tracking-tighter italic">₹{order.total}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-20 flex justify-between items-center border-t border-slate-50 pt-8 relative z-10">
                    <div className="flex items-center gap-2 text-slate-400">
                        <ShieldCheck className="w-3 h-3" />
                        <p className="text-[8px] uppercase font-black tracking-[0.4em]">
                            Computer Generated Invoice
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                        <Globe className="w-3 h-3" />
                        <span className="text-[8px] font-black tracking-widest uppercase italic font-daciana">www.dacianastore.in</span>
                    </div>
                </div>
            </div>
        </div>
    )
}