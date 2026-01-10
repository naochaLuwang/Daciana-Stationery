import {
    CircleDollarSign,
    ShoppingCart,
    TrendingUp,
    Users,
    CreditCard
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Order {
    total: number
    status: string
    created_at: string
}

export function StatsCards({ orders }: { orders: Order[] }) {
    // 1. Calculate Revenue (only from successful/delivered orders if preferred)
    const totalRevenue = orders.reduce((acc, order) => acc + Number(order.total), 0)

    // 2. Calculate Average Order Value (AOV)
    const aov = orders.length > 0 ? totalRevenue / orders.length : 0

    // 3. Count Pending vs Total
    const pendingOrders = orders.filter(o => o.status === 'pending').length

    const stats = [
        {
            label: "Total Revenue",
            value: `₹${totalRevenue.toLocaleString('en-IN')}`,
            description: "Total sales in selected range",
            icon: CircleDollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            label: "Total Orders",
            value: orders.length,
            description: "Successful transactions",
            icon: ShoppingCart,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            label: "Avg. Order Value",
            value: `₹${Math.round(aov).toLocaleString('en-IN')}`,
            description: "Average spent per order",
            icon: TrendingUp,
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            label: "Pending Orders",
            value: pendingOrders,
            description: "Needs fulfillment",
            icon: CreditCard,
            color: "text-amber-600",
            bg: "bg-amber-50"
        }
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.label} className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            {stat.label}
                        </CardTitle>
                        <div className={`p-2 rounded-lg ${stat.bg}`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                            {stat.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}