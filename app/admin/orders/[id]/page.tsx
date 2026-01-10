"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Printer, Download, ArrowLeft, Package, User, MapPin } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function OrderDetailsPage() {
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

    const handlePrint = () => window.print()

    if (loading) return <div className="p-10 text-center">Loading Details...</div>
    if (!order) return <div className="p-10 text-center">Order not found</div>

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            {/* Header / Actions */}
            <div className="flex justify-between items-center mb-8 no-print">
                <Button variant="ghost" asChild>
                    <Link href="/admin/orders"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders</Link>
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" /> Print Invoice
                    </Button>
                </div>
            </div>

            {/* The Invoice / Detail Content */}
            <div id="invoice-content" className="bg-white border p-8 rounded-xl shadow-sm print:shadow-none print:border-none">
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h1 className="text-3xl font-bold uppercase tracking-tighter">Invoice</h1>
                        <p className="text-slate-500 mt-1">Order ID: #{order.id.slice(0, 8)}</p>
                        <p className="text-sm">Date: {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                        <Badge className="capitalize text-lg px-4 py-1">{order.status}</Badge>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-10">
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                            <User className="w-3 h-3" /> Customer Information
                        </h3>
                        <p className="font-bold">{order.shipping_address?.full_name}</p>
                        <p className="text-sm">{order.shipping_address?.phone}</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> Shipping Address
                        </h3>
                        <p className="text-sm leading-relaxed">
                            {order.shipping_address?.street}<br />
                            Pincode: {order.shipping_address?.pincode}
                        </p>
                        <p className="text-xs mt-2 font-medium text-blue-600">Method: {order.shipping_label}</p>
                    </div>
                </div>

                {/* Items Table */}
                <div className="border-t pt-8 mb-8">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                        <Package className="w-3 h-3" /> Ordered Items
                    </h3>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-sm text-slate-500 border-b">
                                <th className="pb-4 font-medium">Description</th>
                                <th className="pb-4 font-medium text-right">Qty</th>
                                <th className="pb-4 font-medium text-right">Price</th>
                                <th className="pb-4 font-medium text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {order.order_items.map((item: any) => (
                                <tr key={item.id} className="text-sm">
                                    <td className="py-4">
                                        <p className="font-bold">{item.product_name}</p>
                                        <p className="text-xs text-slate-500">{item.variant_title}</p>
                                    </td>
                                    <td className="py-4 text-right">{item.quantity}</td>
                                    <td className="py-4 text-right">₹{item.unit_price}</td>
                                    <td className="py-4 text-right font-bold">₹{item.unit_price * item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end pt-6 border-t">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Subtotal</span>
                            <span>₹{order.total - order.shipping_price}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Shipping</span>
                            <span>₹{order.shipping_price}</span>
                        </div>
                        <div className="flex justify-between text-xl font-black border-t pt-3">
                            <span>Total</span>
                            <span>₹{order.total}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-20 text-center text-[10px] text-slate-400 uppercase tracking-widest border-t pt-8">
                    This is a computer generated invoice. No signature required.
                </div>
            </div>
        </div>
    )
}