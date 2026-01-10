"use client"
import { useEffect } from "react"
import { useCart } from "@/components/store/use-cart"
import { createClient } from "@/utils/supabase/client"

export function ShippingSelector() {
    const { shippingMethods, setShippingMethods, selectedShippingId, setSelectedShipping } = useCart()
    const supabase = createClient()

    useEffect(() => {
        async function fetchShipping() {
            const { data } = await supabase
                .from('shipping_methods')
                .select('*')
                .eq('is_active', true)

            if (data) {
                setShippingMethods(data)
                // Auto-select first method if none selected
                if (!selectedShippingId && data.length > 0) {
                    setSelectedShipping(data[0].id, data[0].price)
                }
            }
        }
        fetchShipping()
    }, [])

    return (
        <div className="space-y-3 mt-6">
            <label className="text-sm font-bold text-slate-700 uppercase">Shipping Method</label>
            <div className="space-y-2">
                {shippingMethods.map((method) => (
                    <div
                        key={method.id}
                        onClick={() => setSelectedShipping(method.id, method.price)}
                        className={`flex justify-between items-center p-3 border rounded-xl cursor-pointer transition-all ${selectedShippingId === method.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "hover:border-slate-300"
                            }`}
                    >
                        <div>
                            <p className="font-medium text-sm">{method.name}</p>
                            <p className="text-xs text-slate-500">{method.delivery_time_label}</p>
                        </div>
                        <span className="font-bold text-sm">₹{method.price}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}