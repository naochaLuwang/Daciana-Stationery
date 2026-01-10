import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export async function LowStockList() {
    const supabase = await createClient()

    // Fetch variants where stock is less than 10
    const { data: lowStockItems } = await supabase
        .from("product_variants")
        .select(`
            id,
            title,
            stock,
            product_id,
            products (name)
        `)
        .lt("stock", 10)
        .order("stock", { ascending: true })
        .limit(6)

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Inventory Alerts
                </CardTitle>
                <Link
                    href="/admin/products"
                    className="text-xs font-bold uppercase text-primary hover:underline flex items-center gap-1"
                >
                    View All <ArrowRight className="w-3 h-3" />
                </Link>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-6">
                    {!lowStockItems || lowStockItems.length === 0 ? (
                        <div className="py-10 text-center text-muted-foreground italic text-sm">
                            All products are well-stocked.
                        </div>
                    ) : (
                        lowStockItems.map((item: any) => {
                            // Calculate a percentage for the progress bar (max 10 for red alerts)
                            const stockPercentage = (item.stock / 10) * 100

                            return (
                                <div key={item.id} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">
                                                {item.products?.name}
                                            </p>
                                            <p className="text-sm font-semibold">{item.title}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-bold ${item.stock <= 2 ? 'text-red-600' : 'text-amber-600'}`}>
                                                {item.stock} left
                                            </span>
                                        </div>
                                    </div>
                                    {/* Visual Stock Indicator */}
                                    <Progress
                                        value={stockPercentage}
                                        className="h-1.5"
                                        // Custom coloring logic based on critical levels
                                        indicatorClassName={item.stock <= 2 ? "bg-red-600" : "bg-amber-500"}
                                    />
                                </div>
                            )
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    )
}