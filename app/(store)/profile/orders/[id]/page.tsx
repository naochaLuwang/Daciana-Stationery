import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Package, Home, Phone, Calendar, CreditCard,
    ShieldCheck, Clock, AlertCircle, XCircle,
    Truck, CheckCircle2, MapPin
} from "lucide-react"
import { CancelOrderButton } from "@/components/orders/cancel-order-button"

type tParams = Promise<{ id: string }>;

export default async function OrderDetailsPage(props: { params: tParams }) {
    const { id } = await props.params;
    const supabase = await createClient()

    const { data: order, error } = await supabase
        .from("orders")
        .select(`*, order_items (*)`)
        .eq("id", id)
        .single()

    if (error || !order) return notFound()

    const address = order.shipping_address as any

    // --- TIMELINE LOGIC ---
    const steps = [
        { status: 'pending', label: 'Order Placed', desc: 'We have received your order.', icon: Clock },
        { status: 'processing', label: 'Processing', desc: 'Your items are being packed.', icon: Package },
        { status: 'shipped', label: 'Shipped', desc: 'Your package is on the way.', icon: Truck },
        { status: 'delivered', label: 'Delivered', desc: 'Order received successfully.', icon: CheckCircle2 },
    ]
    const currentIndex = steps.findIndex(s => s.status === order.status?.toLowerCase())

    const getPaymentStatusStyles = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <ShieldCheck className="w-3 h-3" />, label: 'Payment Successful' }
            case 'refunded':
                return { bg: 'bg-amber-50 text-amber-700 border-amber-100', icon: <AlertCircle className="w-3 h-3" />, label: 'Refunded' }
            default:
                return { bg: 'bg-slate-100 text-slate-600 border-slate-200', icon: <Clock className="w-3 h-3" />, label: 'Awaiting Payment' }
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
                    <p className="text-slate-500 flex items-center gap-2 mt-1 font-medium italic">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                    </p>
                </div>

                <div className="flex flex-col items-start md:items-end gap-3">
                    <div className="flex items-center gap-3">
                        <CancelOrderButton orderId={id} currentStatus={order.status} />
                        <Badge className={`text-sm px-4 py-1 rounded-full uppercase font-bold shadow-none ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                            {order.status}
                        </Badge>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">ID: {id}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">

                    {/* --- TRACKING TIMELINE SECTION --- */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                        <h2 className="font-black text-slate-900 flex items-center gap-2 text-sm uppercase tracking-widest mb-8">
                            <Truck className="w-4 h-4 text-blue-600" /> Tracking Status
                        </h2>

                        <div className="space-y-0">
                            {steps.map((step, idx) => {
                                const Icon = step.icon
                                const isCompleted = idx <= currentIndex
                                const isCurrent = idx === currentIndex
                                const isCancelled = order.status === 'cancelled'

                                if (isCancelled && idx > 0) return null; // Hide future steps if cancelled

                                return (
                                    <div key={step.status} className="relative flex gap-6 pb-10 last:pb-0">
                                        {/* Line Connector */}
                                        {idx !== steps.length - 1 && !isCancelled && (
                                            <div className={`absolute left-5 top-10 w-[2px] h-full ${idx < currentIndex ? 'bg-slate-900' : 'bg-slate-100'
                                                }`} />
                                        )}

                                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-white border-slate-100 text-slate-300'
                                            } ${isCurrent && !isCancelled ? 'scale-110 ring-4 ring-blue-50' : ''}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>

                                        <div className="flex flex-col">
                                            <p className={`font-black uppercase text-xs tracking-widest ${isCompleted ? 'text-slate-900' : 'text-slate-300'
                                                }`}>
                                                {step.label}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1 font-medium">{step.desc}</p>
                                        </div>
                                    </div>
                                )
                            })}

                            {order.status === 'cancelled' && (
                                <div className="flex gap-6 items-start">
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 border-2 border-red-200">
                                        <XCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-black uppercase text-xs tracking-widest text-red-600">Order Cancelled</p>
                                        <p className="text-xs text-red-500 mt-1 font-medium">This order was cancelled and items were restocked.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ITEMS TABLE */}
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
                            <h2 className="font-black text-slate-700 flex items-center gap-2 text-xs uppercase tracking-widest">
                                <Package className="w-4 h-4" /> Items Ordered
                            </h2>
                            <Badge className="bg-slate-900 text-white rounded-full h-5 text-[10px]">{order.order_items?.length}</Badge>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {order.order_items.map((item: any) => (
                                <div key={item.id} className="p-6 flex gap-4 hover:bg-slate-50/30 transition-colors">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex-shrink-0 flex items-center justify-center border border-slate-100 font-black text-slate-300 text-xs">
                                        {item.quantity}x
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-slate-900 text-sm">{item.product_name}</h4>
                                            <span className="font-black text-slate-900 text-sm">₹{Number(item.unit_price).toLocaleString('en-IN')}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">{item.variant_title || 'Standard'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
                            <MapPin className="w-3 h-3 text-blue-600" /> Shipping To
                        </h3>
                        <div className="text-sm text-slate-600 space-y-1">
                            <p className="font-black text-slate-900 text-base mb-2">{address?.full_name}</p>
                            <p className="leading-relaxed font-medium">{address?.street}</p>
                            <p className="font-black text-slate-900 mt-2">{address?.pincode}</p>
                            <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-50 text-slate-900 font-bold">
                                <Phone className="w-3 h-3 text-slate-400" /> {address?.phone}
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 text-white rounded-[2rem] p-8 shadow-2xl shadow-slate-200">
                        <h3 className="font-black mb-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                            <CreditCard className="w-4 h-4" /> Summary
                        </h3>
                        <div className="space-y-4 text-sm font-medium">
                            <div className="flex justify-between text-slate-400">
                                <span>Subtotal</span>
                                <span>₹{(order.total - order.shipping_price).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span className="flex flex-col">
                                    Shipping
                                    <span className="text-[9px] text-blue-400 uppercase font-black">{order.shipping_label}</span>
                                </span>
                                <span>₹{order.shipping_price.toLocaleString('en-IN')}</span>
                            </div>
                            <Separator className="bg-white/10 my-4" />
                            <div className="flex justify-between items-end">
                                <span className="text-xs uppercase tracking-widest text-slate-400">Total Paid</span>
                                <span className="text-3xl font-black text-white italic">₹{order.total.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center">
                            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${order.payment_status === 'paid' ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 bg-white/5'
                                }`}>
                                {payMeta.icon} {payMeta.label}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}