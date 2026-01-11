import { createClient } from "@/utils/supabase/server"
import { DateRangePicker } from "@/components/admin/date-range-picker"
import { StatsCards } from "@/components/admin/stats-cards"
import { RecentOrdersTable } from "@/components/admin/recent-orders-table"
import { LowStockList } from "@/components/admin/low-stock-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { BestSellersChart } from "@/components/admin/bestseller-chart"

export default async function AdminDashboard({
    searchParams
}: {
    searchParams: Promise<{ from?: string; to?: string }>
}) {
    // 1. Await SearchParams (Next.js 15 requirement)
    const { from, to } = await searchParams
    const supabase = await createClient()

    // 2. Define Date Boundaries
    const startDate = from
        ? new Date(from).toISOString()
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const endDate = to
        ? new Date(to).toISOString()
        : new Date().toISOString()

    // 3. Fetch Orders (Filtering by the bridge table profile name)
    const { data: orders, error } = await supabase
        .from("orders")
        .select(`
            *,
            order_items(*),
            profiles (
                full_name
            )
        `)
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Dashboard Fetch Error:", error)
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            {/* TOP BAR */}
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground text-sm">
                        Performance overview from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <DateRangePicker />
                </div>
            </div>

            {/* STATS CARDS (Revenue, AOV, etc.) */}
            <StatsCards orders={orders || []} />


            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* RECENT ORDERS - LEFT SIDE (4 COLS) */}
                <Card className="col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Orders</CardTitle>
                        <span className="text-xs text-muted-foreground">Showing last 5</span>
                    </CardHeader>
                    <CardContent>
                        <RecentOrdersTable orders={orders?.slice(0, 5) || []} />
                    </CardContent>
                </Card>

                {/* LOW STOCK ALERT - RIGHT SIDE (3 COLS) */}
                <div className="col-span-3">
                    <Suspense fallback={
                        <Card className="h-full flex items-center justify-center">
                            <Loader2 className="animate-spin text-muted-foreground" />
                        </Card>
                    }>
                        <LowStockList />
                    </Suspense>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                {/* Revenue Chart - Takes 4 columns */}
                <div className="md:col-span-4">
                    <RevenueChart orders={orders || []} startDate={startDate} endDate={endDate} />
                </div>

                {/* Best Sellers - Takes 3 columns */}
                <div className="md:col-span-3">
                    <BestSellersChart orders={orders || []} />
                </div>
            </div>



        </div>
    )
}