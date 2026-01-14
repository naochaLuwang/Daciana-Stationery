"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Printer, ArrowLeft, Globe, ShieldCheck, CheckCircle2, Clock, AlertCircle, Loader2, Truck } from "lucide-react"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"

export default function OrderInvoicePage() {
    const { id } = useParams()
    const supabase = createClient()
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)

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

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
    if (!order) return <div className="p-10 text-center text-slate-500 font-bold uppercase tracking-widest">Order not found</div>

    const totalSavings = order.order_items.reduce((acc: number, item: any) => {
        const mrp = Number(item.mrp || item.unit_price);
        const paid = Number(item.unit_price);
        return acc + ((mrp - paid) * item.quantity);
    }, 0);

    const getStatusStyles = (status: string) => {
        const s = status?.toLowerCase()
        if (s === 'paid') return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: <CheckCircle2 className="w-3 h-3" /> }
        if (s === 'pending') return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: <Clock className="w-3 h-3" /> }
        return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', icon: <AlertCircle className="w-3 h-3" /> }
    }

    const statusStyle = getStatusStyles(order.payment_status)

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            {/* PRINT CSS - Targets global layout elements to hide them */}
            <style jsx global>{`
                @media print {
                    /* Hide website-wide header and footer */
                    header, footer, nav, .site-header, .site-footer { 
                        display: none !important; 
                    }
                    
                    @page { size: A4; margin: 0; }
                    body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    
                    #printable-invoice {
                        border: none !important;
                        padding: 15mm !important;
                        box-shadow: none !important;
                        position: absolute;
                        top: 0; left: 0; width: 100%;
                    }
                }
            `}</style>

            <div className="flex justify-between items-center mb-8 no-print">
                <Button variant="ghost" asChild className="rounded-full font-bold">
                    <Link href={`/orders/${id}`}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Order</Link>
                </Button>
                <Button onClick={() => window.print()} className="rounded-full shadow-lg bg-slate-900 hover:bg-slate-800 transition-all font-bold">
                    <Printer className="w-4 h-4 mr-2" /> Download / Print PDF
                </Button>
            </div>

            <div id="printable-invoice" className="bg-white border-2 border-slate-50 p-12 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                {/* Branding & Header */}
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                        <div className="flex flex-col ">
                            <span className="text-3xl font-black tracking-[0.2em] font-daciana leading-none text-slate-900 uppercase">DACIANA</span>
                            <span className="text-xs font-light tracking-wider">STATIONERY & COSMETICS</span>
                        </div>

                        <div className="text-[10px] text-slate-500 font-medium mt-4 leading-relaxed">
                            <p>Kontha khabam mayai leikai Imphal,</p>
                            <p>Manipur Imphal 795002</p>
                            <p className="font-bold text-slate-900">Phone: 6909013764</p>
                        </div>
                        <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} text-[10px] font-black uppercase tracking-widest`}>
                            {statusStyle.icon} Status: {order.payment_status}
                        </div>
                    </div>
                    <div className="text-right">
                        <h1 className="text-6xl font-black uppercase text-slate-100 leading-none italic">Invoice</h1>
                        <p className="text-slate-400 font-mono text-xs mt-2 uppercase tracking-tighter">Ref: {order.id.slice(0, 8)}</p>
                        <div className="mt-6 text-[10px] uppercase">
                            <p className="font-black text-slate-300 tracking-widest">Date Issued</p>
                            <p className="font-bold text-slate-900">{new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                        </div>
                    </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-2 gap-16 mb-5 border-t border-b border-slate-50 py-2 relative z-10">
                    {/* Customer Column */}
                    <div>
                        <h3 className="text-[10px] font-black text-slate-300 uppercase mb-2 tracking-[0.2em]">Customer Detail</h3>
                        <p className="font-black text-xl text-slate-900 tracking-tight">{order.shipping_address?.full_name}</p>
                        <p className="text-slate-500 font-medium text-sm">{order.shipping_address?.phone}</p>
                    </div>

                    {/* Shipping Column */}
                    <div>
                        <h3 className="text-[10px] font-black text-slate-300 uppercase mb-2 tracking-[0.2em]">Shipping Address</h3>
                        <p className="text-slate-600 font-medium text-sm leading-relaxed mb-2">
                            {order.shipping_address?.street},<br />
                            Pincode: <span className="font-black text-slate-900 underline underline-offset-2">{order.shipping_address?.pincode}</span>
                        </p>

                        {/* Shipping Method / Label Tag */}
                        <div className="inline-flex flex-col">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Zone/Area</span>
                            <div className="flex items-center gap-2 text-slate-900">
                                <Truck className="w-3 h-3" />
                                <span className="text-xs font-black uppercase tracking-tighter">
                                    {order.shipping_label || "Standard Delivery"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-10">
                    <thead>
                        <tr className="text-[10px] text-slate-400 uppercase tracking-[0.2em] border-b pb-4 font-black">
                            <th className="pb-4 text-left">Description</th>
                            <th className="pb-4 text-right">MRP</th>
                            <th className="pb-4 text-center">Disc.</th>
                            <th className="pb-4 text-center">Qty</th>
                            <th className="pb-4 text-right">Rate</th>
                            <th className="pb-4 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {order.order_items.map((item: any) => {
                            const mrp = Number(item.mrp || item.unit_price);
                            const rate = Number(item.unit_price);
                            const discount = mrp > rate ? Math.round(((mrp - rate) / mrp) * 100) : 0;

                            return (
                                <tr key={item.id} className="text-sm">
                                    <td className="py-6 pr-4">
                                        <p className="font-black text-slate-900 uppercase tracking-tight">{item.product_name}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{item.variant_title}</p>
                                    </td>
                                    <td className="py-6 text-right font-black text-slate-900">₹{mrp.toLocaleString()}</td>
                                    <td className="py-6 text-center">
                                        {discount > 0 ? (
                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                                {discount}% OFF
                                            </span>
                                        ) : (
                                            <span className="text-slate-200">—</span>
                                        )}
                                    </td>
                                    <td className="py-6 text-center font-bold text-slate-600">x{item.quantity}</td>
                                    <td className="py-6 text-right font-bold text-slate-700">₹{rate.toLocaleString()}</td>
                                    <td className="py-6 text-right font-black text-slate-900">₹{(rate * item.quantity).toLocaleString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Totals & Delivery Section */}
                <div className="grid grid-cols-2 pt-8 border-t-2 border-slate-900 border-dashed items-start">
                    <div className="space-y-6">
                        <div className="flex items-center gap-6">
                            <QRCodeSVG value={`https://dacianastore.in/track/${id}`} size={60} />
                            <div className="max-w-[160px]">
                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Live Tracking</p>
                                <p className="text-[8px] text-slate-400 mt-1 font-medium leading-relaxed uppercase">Scan this QR code to track your shipment and view delivery updates.</p>
                            </div>
                        </div>

                        {/* Delivery Partner Info */}
                        <div className="bg-slate-50 p-4 rounded-2xl inline-flex items-center gap-4">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                <Truck className="w-5 h-5 text-slate-900" />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Shipping Partner</p>
                                <p className="text-sm font-black text-slate-900 uppercase italic tracking-tighter">Xamadon Express</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                            <span>Subtotal (MRP)</span>
                            <span className="text-slate-900 font-black">
                                ₹{(order.total - (order.shipping_price || 0) + totalSavings).toLocaleString()}
                            </span>
                        </div>



                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                            <span>Shipping Cost</span>
                            <span className="text-slate-900 font-black">₹{order.shipping_price || 0}</span>
                        </div>

                        {totalSavings > 0 && (
                            <div className="flex justify-between text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                <span>Total Savings</span>
                                <span>- ₹{totalSavings.toLocaleString()}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-end border-t-4 border-slate-900 pt-6 mt-4">
                            <div>
                                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1 tracking-widest">Net Payable</span>
                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter italic">{order.payment_method}</p>
                            </div>
                            <span className="text-5xl font-black italic tracking-tighter text-slate-900">
                                ₹{order.total.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Terms & Conditions Section */}
                <div className="mt-12 pt-8 border-t border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3">Terms & Conditions</h4>
                    <ul className="text-[8px] text-slate-400 font-bold uppercase tracking-wider space-y-1.5 list-disc pl-3">

                        <li>Goods once sold will not be taken back unless found damaged upon delivery.</li>

                        <li>This is a computer-generated invoice and does not require a physical signature.</li>
                    </ul>
                </div>

                {/* Footer */}
                <div className="mt-12 flex justify-between items-center border-t border-slate-50 pt-8 text-[8px] uppercase font-black text-slate-300 tracking-[0.4em]">
                    <div className="flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-slate-400" /> Authorized Invoice</div>
                    <div className="text-slate-400 font-bold italic">Delivery fulfilled by Xamadon Express</div>
                    <div className="flex items-center gap-2"><Globe className="w-3 h-3 text-slate-400" /> dacianastore.in</div>
                </div>
            </div>
        </div>
    )
}