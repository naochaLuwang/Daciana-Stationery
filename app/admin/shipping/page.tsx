"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, MapPin, Truck, Clock } from "lucide-react"
import { toast } from "sonner"

export default function ShippingAdmin() {
    const supabase = createClient()
    const [zones, setZones] = useState<any[]>([])
    const [newZone, setNewZone] = useState({ name: "", pincode: "", description: "" })

    useEffect(() => { fetchZones() }, [])

    async function fetchZones() {
        const { data } = await supabase
            .from('shipping_zones')
            .select('*, shipping_methods(*)')
            .order('created_at', { ascending: false })
        if (data) setZones(data)
    }

    async function addZone() {
        if (!newZone.name || !newZone.pincode) {
            return toast.error("Name and Pincode are required")
        }
        const { error } = await supabase
            .from('shipping_zones')
            .insert([newZone])

        if (error) toast.error("Error creating zone")
        else {
            toast.success("Zone created successfully")
            setNewZone({ name: "", pincode: "", description: "" })
            fetchZones()
        }
    }

    return (
        <div className="container mx-auto py-10 space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Shipping & Pincode Logic</h1>

            <Card className="bg-slate-50/50">
                <CardHeader><CardTitle className="text-lg">Create Pincode Zone</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                        placeholder="Area Name (e.g. Porompat)"
                        value={newZone.name}
                        onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                    />
                    <Input
                        placeholder="Pincode (e.g. 795001)"
                        value={newZone.pincode}
                        onChange={(e) => setNewZone({ ...newZone, pincode: e.target.value })}
                    />
                    <Input
                        placeholder="Short description"
                        value={newZone.description}
                        onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
                    />
                    <Button onClick={addZone} className="w-full">Create Zone</Button>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {zones.map((zone) => (
                    <ZoneCard key={zone.id} zone={zone} refresh={fetchZones} />
                ))}
            </div>
        </div>
    )
}

function ZoneCard({ zone, refresh }: { zone: any, refresh: () => void }) {
    const supabase = createClient()
    const [method, setMethod] = useState({ name: "", price: "", time: "" })
    const [isDeleting, setIsDeleting] = useState(false)

    async function deleteZone() {
        const confirmDelete = window.confirm(`Are you sure you want to delete the zone "${zone.name}" and all its shipping rates?`);
        if (!confirmDelete) return;

        setIsDeleting(true);
        const { error } = await supabase
            .from('shipping_zones')
            .delete()
            .eq('id', zone.id);

        if (error) {
            toast.error("Error deleting zone: " + error.message);
            setIsDeleting(false);
        } else {
            toast.success("Zone deleted successfully");
            refresh(); // Refresh the list in the parent
        }
    }

    async function addMethod() {
        if (!method.name || !method.price) return toast.error("Fill method details")
        const { error } = await supabase
            .from('shipping_methods')
            .insert([{
                zone_id: zone.id,
                name: method.name,
                price: parseFloat(method.price),
                delivery_time_label: method.time || "3-5 Days"
            }])

        if (error) toast.error("Error adding method")
        else {
            toast.success("Shipping rate added")
            setMethod({ name: "", price: "", time: "" })
            refresh()
        }
    }

    return (
        <Card className="overflow-hidden border-2">
            <CardHeader className="bg-white border-b flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-md flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" /> {zone.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-mono mt-1">Pincode: {zone.pincode}</p>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                    onClick={deleteZone}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                {zone.shipping_methods.map((m: any) => (
                    <div key={m.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border">
                        <div className="space-y-1">
                            <p className="text-sm font-bold">{m.name} — ₹{m.price}</p>
                            <p className="text-[10px] flex items-center gap-1 text-slate-500 uppercase">
                                <Clock className="w-3 h-3" /> {m.delivery_time_label}
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={async () => {
                            await supabase.from('shipping_methods').delete().eq('id', m.id);
                            refresh();
                        }}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                    </div>
                ))}

                <div className="pt-4 border-t space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add New Rate</p>
                    <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Method (e.g. Express)" value={method.name} onChange={(e) => setMethod({ ...method, name: e.target.value })} className="h-9" />
                        <Input placeholder="Price" type="number" value={method.price} onChange={(e) => setMethod({ ...method, price: e.target.value })} className="h-9" />
                        <Input placeholder="Time (e.g. 1-2 Days)" value={method.time} onChange={(e) => setMethod({ ...method, time: e.target.value })} className="col-span-2 h-9" />
                    </div>
                    <Button variant="outline" size="sm" onClick={addMethod} className="w-full">Add Shipping Rate</Button>
                </div>
            </CardContent>
        </Card>
    )
}