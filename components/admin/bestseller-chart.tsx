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

interface OrderItem {
    product_name: string
    quantity: number
    price: number
}

export function BestSellersChart({ orders }: { orders: any[] }) {
    const topProducts = useMemo(() => {
        const productMap: Record<string, { name: string; sales: number; revenue: number }> = {}

        // 1. Flatten all items from all orders into a single tally
        orders.forEach((order) => {
            // Assumes your 'orders' table has a JSONB column 'items' or a linked 'order_items' table
            const items: OrderItem[] = order.items || []

            items.forEach((item) => {
                if (!productMap[item.product_name]) {
                    productMap[item.product_name] = { name: item.product_name, sales: 0, revenue: 0 }
                }
                productMap[item.product_name].sales += item.quantity
                productMap[item.product_name].revenue += item.quantity * item.price
            })
        })

        // 2. Sort by sales and take top 5
        return Object.values(productMap)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5)
    }, [orders])

    // Cosmetic-inspired color palette for the bars
    const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"]

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle className="text-base font-medium">Top 5 Shades (by Volume)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                width={100}
                                tick={{ fontSize: 11, fontWeight: 500 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            />
                            <Bar dataKey="sales" radius={[0, 4, 4, 0]} barSize={30}>
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