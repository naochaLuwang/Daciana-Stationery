import { Badge } from "@/components/ui/badge"

export function RecentOrdersTable({ orders }: { orders: any[] }) {
    return (
        <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
                <thead>
                    <tr className="border-b transition-colors hover:bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-bold text-muted-foreground uppercase text-[10px]">Order ID</th>
                        <th className="h-12 px-4 text-left align-middle font-bold text-muted-foreground uppercase text-[10px]">Customer</th>
                        <th className="h-12 px-4 text-left align-middle font-bold text-muted-foreground uppercase text-[10px]">Status</th>
                        <th className="h-12 px-4 text-left align-middle font-bold text-muted-foreground uppercase text-[10px]">Total</th>
                    </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                    {orders.length === 0 ? (
                        <tr><td colSpan={4} className="h-24 text-center text-muted-foreground">No orders found in this range.</td></tr>
                    ) : (
                        orders.map((order) => (
                            <tr key={order.id} className="border-b transition-colors hover:bg-muted/50">
                                <td className="p-4 align-middle font-medium font-mono text-xs">#{order.id.slice(0, 8)}</td>
                                <td className="p-4 align-middle">{order.profiles?.full_name || "Guest"}</td>
                                <td className="p-4 align-middle">
                                    <Badge variant={order.status === 'delivered' ? 'default' : 'outline'} className="uppercase text-[9px]">
                                        {order.status}
                                    </Badge>
                                </td>
                                <td className="p-4 align-middle font-bold text-green-600">₹{order.total}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}