"use client"

import { useMemo } from "react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { format, eachDayOfInterval, startOfDay, isSameDay } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Order {
    total: number
    created_at: string
}

interface RevenueChartProps {
    orders: Order[]
    startDate: string
    endDate: string
}

export function RevenueChart({ orders, startDate, endDate }: RevenueChartProps) {
    const chartData = useMemo(() => {
        // 1. Create an array of every day in the selected range
        const allDays = eachDayOfInterval({
            start: new Date(startDate),
            end: new Date(endDate),
        })

        // 2. Map through days and sum revenue for each
        return allDays.map((day) => {
            const dayRevenue = orders
                .filter((order) => isSameDay(new Date(order.created_at), day))
                .reduce((sum, order) => sum + Number(order.total), 0)

            return {
                date: format(day, "MMM dd"),
                revenue: dayRevenue,
            }
        })
    }, [orders, startDate, endDate])

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle className="text-base font-medium">Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: "#888" }}
                                minTickGap={30}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: "#888" }}
                                tickFormatter={(value) => `₹${value}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                formatter={(value: number | string | undefined) => {
                                    const numericValue = Number(value) || 0;
                                    return [`₹${numericValue.toLocaleString()}`, "Revenue"];
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}