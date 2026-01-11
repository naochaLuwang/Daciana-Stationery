"use client"

import { useMemo } from "react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Update interface to match your Supabase schema
interface OrderItem {
    product_name: string
    quantity: number
    unit_price: number // Changed from 'price' to 'unit_price' based on your schema
}

export function BestSellersChart({ orders }: { orders: any[] }) {
    const topProducts = useMemo(() => {
        if (!orders || orders.length === 0) return [];

        const productMap: Record<string, { name: string; sales: number; revenue: number }> = {}

        orders.forEach((order) => {
            // FIX: Your schema uses 'order_items', not 'items'
            const items: OrderItem[] = order.order_items || []

            items.forEach((item) => {
                const name = item.product_name || "Unknown Product"
                if (!productMap[name]) {
                    productMap[name] = { name, sales: 0, revenue: 0 }
                }
                productMap[name].sales += item.quantity
                // FIX: Use unit_price from your schema
                productMap[name].revenue += item.quantity * (item.unit_price || 0)
            })
        })

        return Object.values(productMap)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5)
    }, [orders])

    // Cosmetic-inspired color palette
    const COLORS = ["#0f172a", "#1e293b", "#334155", "#475569", "#64748b"]

    // Fallback UI if no data
    if (topProducts.length === 0) {
        return (
            <Card className="col-span-3">
                <CardHeader><CardTitle className="text-base font-medium">Top 5 Shades</CardTitle></CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
                    No sales data available to display.
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="col-span-3 shadow-sm border-slate-200">
            <CardHeader>
                <CardTitle className="text-base font-black uppercase tracking-tighter">Top 5 Products</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topProducts} layout="vertical" margin={{ left: 20, right: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                width={120}
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                            />
                            <Bar dataKey="sales" radius={[0, 4, 4, 0]} barSize={24}>
                                {topProducts.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}