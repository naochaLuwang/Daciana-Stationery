import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Package, Home, Phone, Calendar, CreditCard, ShieldCheck, Clock, AlertCircle, XCircle } from "lucide-react"
import { CancelOrderButton } from "@/components/orders/cancel-order-button"

type tParams = Promise<{ id: string }>;

export default async function OrderDetailsPage(props: { params: tParams }) {
    const { id } = await props.params;
    const supabase = await createClient()

    const { data: order, error } = await supabase
        .from("orders")
        .select(`
            *,
            order_items (*)
        `)
        .eq("id", id)
        .single()

    if (error || !order) return notFound()

    const address = order.shipping_address as any

    const getPaymentStatusStyles = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return {
                    bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                    icon: <ShieldCheck className="w-3 h-3" />,
                    label: 'Payment Successful'
                }
            case 'refunded':
                return {
                    bg: 'bg-amber-50 text-amber-700 border-amber-100',
                    icon: <AlertCircle className="w-3 h-3" />,
                    label: 'Refunded'
                }
            default:
                return {
                    bg: 'bg-slate-100 text-slate-600 border-slate-200',
                    icon: <Clock className="w-3 h-3" />,
                    label: 'Awaiting Payment'
                }
        }
    }

    const payMeta = getPaymentStatusStyles(order.payment_status)

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Order Details</h1>
                        <Badge variant="outline" className={`h-6 text-[10px] uppercase font-black px-2 ${payMeta.bg}`}>
                            {payMeta.icon} <span className="ml-1">{order.payment_status}</span>
                        </Badge>
                    </div>
                    <p className="text-slate-500 flex items-center gap-2 mt-1 font-medium">
                        <Calendar className="w-4 h-4" />
                        Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                    </p>
                </div>

                <div className="flex flex-col items-start md:items-end gap-3">
                    <div className="flex items-center gap-3">
                        {/* THE CANCEL BUTTON: Logic inside the component handles the "Shipped" check */}
                        <CancelOrderButton orderId={id} currentStatus={order.status} />

                        <Badge className={`text-sm px-4 py-1 rounded-full uppercase font-bold shadow-none ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                            }`}>
                            {order.status}
                        </Badge>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">Order ID: {id}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: ORDERED ITEMS */}
                <div className="lg:col-span-2 space-y-6">
                    {/* CANCELLED NOTICE */}
                    {order.status === 'cancelled' && (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-800">
                            <XCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-bold uppercase tracking-tight">This order has been cancelled.</p>
                        </div>
                    )}

                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b bg-slate-50/50">
                            <h2 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                                <Package className="w-4 h-4" /> Items Ordered ({order.order_items?.length})
                            </h2>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {order.order_items.map((item: any) => (
                                <div key={item.id} className="p-6 flex gap-4 hover:bg-slate-50/30 transition-colors">
                                    <div className="w-16 h-16 bg-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center border border-slate-200">
                                        <Package className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-slate-900 leading-tight">{item.product_name}</h4>
                                            <span className="font-black text-slate-900 ml-4">₹{Number(item.unit_price).toLocaleString('en-IN')}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">{item.variant_title || 'Standard Edition'}</p>
                                        <p className="text-xs text-slate-400 mt-2 font-medium">Quantity: {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: ADDRESS & TOTALS */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <Home className="w-4 h-4 text-blue-600" /> Delivery To
                        </h3>
                        <div className="text-sm text-slate-600 space-y-1">
                            <p className="font-bold text-slate-900 text-base mb-1">{address?.full_name}</p>
                            <p className="leading-relaxed">{address?.street}</p>
                            <p className="font-medium text-slate-900">{address?.pincode}</p>
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 text-slate-900 font-bold">
                                <Phone className="w-3 h-3 text-slate-400" /> {address?.phone}
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl shadow-slate-200">
                        <h3 className="font-bold mb-6 flex items-center gap-2 text-sm uppercase tracking-wider text-slate-400">
                            <CreditCard className="w-4 h-4" /> Order Summary
                        </h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between opacity-80">
                                <span>Subtotal</span>
                                <span>₹{(order.total - order.shipping_price).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between opacity-80">
                                <span className="flex flex-col">
                                    Shipping
                                    <span className="text-[10px] text-blue-400 uppercase tracking-tighter">{order.shipping_label}</span>
                                </span>
                                <span>₹{order.shipping_price.toLocaleString('en-IN')}</span>
                            </div>
                            <Separator className="bg-white/10" />
                            <div className="flex justify-between items-end">
                                <span className="font-medium">Total Amount</span>
                                <span className="text-2xl font-black text-white">₹{order.total.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.payment_status === 'paid' ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 bg-white/5'
                                }`}>
                                {payMeta.icon}
                                {payMeta.label}
                            </div>
                            <p className="mt-2 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                                Payment Method: {order.payment_method}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}