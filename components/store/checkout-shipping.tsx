"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/components/store/use-cart"
import { createClient } from "@/utils/supabase/client"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Truck, AlertCircle, MapPin } from "lucide-react"

export function CheckoutShipping({ pincode }: { pincode: string }) {
    const { setSelectedShipping, selectedShippingId } = useCart()
    const [methods, setMethods] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [areaName, setAreaName] = useState("")
    const supabase = createClient()

    useEffect(() => {
        if (pincode.length === 6) {
            fetchMethods()
        } else {
            setMethods([])
            setSelectedShipping(null, 0)
        }
    }, [pincode])

    async function fetchMethods() {
        setLoading(true)
        const { data, error } = await supabase
            .from('shipping_zones')
            .select('name, shipping_methods(*)')
            .eq('pincode', pincode)
            .eq('shipping_methods.is_active', true)
            .single()

        if (data) {
            setMethods(data.shipping_methods)
            setAreaName(data.name)
            // Auto-select first method
            if (data.shipping_methods.length > 0) {
                setSelectedShipping(data.shipping_methods[0].id, Number(data.shipping_methods[0].price))
            }
        } else {
            setMethods([])
            setAreaName("")
        }
        setLoading(false)
    }

    if (pincode.length < 6) return (
        <div className="p-4 border rounded-xl bg-slate-50 text-slate-500 text-sm flex gap-2 items-center">
            <AlertCircle className="w-4 h-4" /> Enter pincode to see shipping options
        </div>
    )

    if (loading) return <div className="animate-pulse h-20 bg-slate-100 rounded-xl" />

    if (methods.length === 0) return (
        <div className="p-4 border border-red-100 rounded-xl bg-red-50 text-red-600 text-sm">
            Sorry, we don't deliver to <strong>{pincode}</strong> yet.
        </div>
    )

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                <MapPin className="w-4 h-4" /> Delivering to {areaName}
            </div>

            <RadioGroup
                value={selectedShippingId || ""}
                onValueChange={(id) => {
                    const m = methods.find(method => method.id === id)
                    setSelectedShipping(id, Number(m.price))
                }}
            >
                {methods.map((m) => (
                    <div key={m.id} className="flex items-center space-x-3 p-4 border rounded-xl bg-white hover:border-primary transition-all cursor-pointer">
                        <RadioGroupItem value={m.id} id={m.id} />
                        <Label htmlFor={m.id} className="flex-grow flex justify-between cursor-pointer">
                            <div>
                                <p className="font-bold">{m.name}</p>
                                <p className="text-xs text-slate-500">{m.delivery_time_label}</p>
                            </div>
                            <span className="font-bold">₹{Number(m.price)}</span>
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        </div>
    )
}