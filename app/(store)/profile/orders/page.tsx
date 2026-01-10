import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, ChevronRight, ShoppingBag, Calendar } from "lucide-react"

export default async function OrdersHistoryPage() {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // 2. Fetch orders sorted by newest first
    const { data: orders, error } = await supabase
        .from("orders")
        .select(`
            id,
            created_at,
            status,
            total,
            order_items (count)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

    if (error) {
        return <div className="py-20 text-center">Error loading orders. Please try again.</div>
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="flex flex-col gap-2 mb-10">
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Your Orders</h1>
                <p className="text-slate-500 font-medium">Manage and track your recent purchases.</p>
            </div>

            {orders && orders.length > 0 ? (
                <div className="grid gap-6">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                {/* Order Metadata */}
                                <div className="flex gap-4 items-start">
                                    <div className="bg-slate-100 p-3 rounded-xl hidden sm:block">
                                        <Package className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900">
                                                Order #{order.id.slice(0, 8).toUpperCase()}
                                            </span>
                                            <Badge className={`text-[10px] px-2 py-0 uppercase font-black tracking-tighter ${order.status === 'delivered' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                                order.status === 'pending' ? 'bg-orange-100 text-orange-700 hover:bg-orange-100' :
                                                    'bg-blue-100 text-blue-700 hover:bg-blue-100'
                                                }`}>
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            <span>•</span>
                                            <span>{order.order_items[0].count} Items</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Value & Action */}
                                <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0">
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Total Amount</p>
                                        <p className="text-xl font-black text-slate-900">₹{order.total.toLocaleString('en-IN')}</p>
                                    </div>
                                    <Button asChild variant="ghost" className="rounded-xl group-hover:bg-slate-100">
                                        <Link href={`/profile/orders/${order.id}`}>
                                            View Details <ChevronRight className="ml-1 w-4 h-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* EMPTY STATE */
                <div className="flex flex-col items-center justify-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                        <ShoppingBag className="w-12 h-12 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No orders yet</h3>
                    <p className="text-slate-500 mb-8 max-w-xs text-center">
                        Looks like you haven't placed any orders. Start shopping to see them here!
                    </p>
                    <Button asChild className="bg-black text-white px-8 py-6 rounded-2xl">
                        <Link href="/shop">Start Shopping</Link>
                    </Button>
                </div>
            )}
        </div>
    )
}