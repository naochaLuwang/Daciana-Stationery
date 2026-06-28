"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Plus,
    Pencil,
    Trash2,
    Star,
    Home,
    Briefcase,
    MapPin,
    Navigation,
    Loader2,
    Check,
    Truck,
} from "lucide-react"

interface Address {
    id: string
    user_id: string
    label: string
    full_name: string
    phone: string
    pincode: string
    street: string
    city?: string
    state?: string
    area_name?: string
    shipping_method_id?: string | null
    shipping_methods?: any
    is_default: boolean
    created_at: string
}

const LABELS = ["Home", "Work", "Other"] as const
const LABEL_ICONS: Record<string, typeof Home> = { Home, Work: Briefcase, Other: MapPin }

export function AddressBook({ userId }: { userId: string }) {
    const supabase = createClient()
    const [addresses, setAddresses] = useState<Address[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [pincodeLoading, setPincodeLoading] = useState(false)
    const [showShippingPicker, setShowShippingPicker] = useState(true)

    const [form, setForm] = useState({
        label: "Home" as string,
        full_name: "",
        phone: "",
        pincode: "",
        street: "",
        city: "",
        state: "",
        area_name: "",
        shipping_method_id: null as string | null,
    })

    const [shippingMethods, setShippingMethods] = useState<any[]>([])

    const fetchAddresses = useCallback(async () => {
        const { data } = await supabase
            .from("addresses")
            .select("*, shipping_methods:shipping_method_id (*)")
            .eq("user_id", userId)
            .order("is_default", { ascending: false })
            .order("created_at", { ascending: false })
        if (data) setAddresses(data)
        setLoading(false)
    }, [supabase, userId])

    useEffect(() => {
        supabase
            .from("addresses")
            .select("*, shipping_methods:shipping_method_id (*)")
            .eq("user_id", userId)
            .order("is_default", { ascending: false })
            .order("created_at", { ascending: false })
            .then(({ data }) => {
                if (data) setAddresses(data)
                setLoading(false)
            })
    }, [])

    const handlePincodeChange = async (val: string) => {
        const cleaned = val.replace(/\D/g, "").slice(0, 6)
        setForm((f) => ({ ...f, pincode: cleaned }))

        if (cleaned.length === 6) {
            setPincodeLoading(true)

            const { data: zones } = await supabase
                .from("shipping_zones")
                .select("*, shipping_methods(*)")
                .eq("pincode", cleaned)

            if (zones && zones.length > 0) {
                setForm((f) => ({
                    ...f,
                    area_name: zones[0].area_name || zones[0].name || "",
                }))
                setShippingMethods(zones[0].shipping_methods || [])
                            if (zones[0].shipping_methods?.length > 0) {
                                    setShowShippingPicker(true)
                                }
            } else {
                setShippingMethods([])
                setForm((f) => ({ ...f, area_name: "", shipping_method_id: null }))
            }

            try {
                const res = await fetch(
                    `https://api.postalpincode.in/pincode/${cleaned}`
                )
                const data = await res.json()
                if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
                    const po = data[0].PostOffice[0]
                    setForm((f) => ({ ...f, city: po.District, state: po.State }))
                }
            } catch {
                // silently fail — city/state can be typed manually
            }

            setPincodeLoading(false)
        }
    }

    const openAdd = () => {
        setEditingId(null)
        setForm({
            label: "Home",
            full_name: "",
            phone: "",
            pincode: "",
            street: "",
            city: "",
            state: "",
            area_name: "",
            shipping_method_id: null,
        })
        setShippingMethods([])
        setDialogOpen(true)
    }

    const openEdit = (a: Address) => {
        setEditingId(a.id)
        setForm({
            label: a.label,
            full_name: a.full_name,
            phone: a.phone,
            pincode: a.pincode,
            street: a.street,
            city: a.city || "",
            state: a.state || "",
            area_name: a.area_name || "",
            shipping_method_id: a.shipping_method_id || null,
        })
        if (a.pincode?.length === 6) {
            handlePincodeChange(a.pincode)
        }
        setDialogOpen(true)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (form.pincode.length !== 6) return toast.error("Pincode must be 6 digits")
        setSaving(true)

        const payload = {
            label: form.label,
            full_name: form.full_name,
            phone: form.phone,
            pincode: form.pincode,
            street: form.street,
            city: form.city,
            state: form.state,
            area_name: form.area_name,
            shipping_method_id: form.shipping_method_id,
        }

        if (editingId) {
            const { error } = await supabase
                .from("addresses")
                .update(payload)
                .eq("id", editingId)
            if (error) {
                toast.error(error.message)
                setSaving(false)
                return
            }
            toast.success("Address updated")
        } else {
            const isFirst = addresses.length === 0
            const { error } = await supabase.from("addresses").insert({
                ...payload,
                user_id: userId,
                is_default: isFirst,
            })
            if (error) {
                toast.error(error.message)
                setSaving(false)
                return
            }
            toast.success("Address added")
        }

        setSaving(false)
        setDialogOpen(false)
        fetchAddresses()
    }

    const handleDelete = async (id: string) => {
        setDeletingId(id)
        const { error } = await supabase.from("addresses").delete().eq("id", id)
        setDeletingId(null)
        if (error) {
            toast.error(error.message)
            return
        }
        toast.success("Address deleted")
        fetchAddresses()
    }

    const handleSetDefault = async (id: string) => {
        await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId)
        const { error } = await supabase.from("addresses").update({ is_default: true }).eq("id", id)
        if (error) {
            toast.error(error.message)
            return
        }
        toast.success("Default address updated")
        fetchAddresses()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                        Saved Addresses
                    </h3>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-all hover:bg-slate-800 active:scale-[0.97]"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                </button>
            </div>

            {addresses.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-slate-200 py-10 text-center">
                    <MapPin className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-3 text-sm font-medium text-slate-500">
                        No saved addresses
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                        Add an address for faster checkout
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {addresses.map((addr) => {
                        const Icon = LABEL_ICONS[addr.label] || MapPin
                        return (
                            <div
                                key={addr.id}
                                className={`rounded-xl border p-4 transition-colors ${
                                    addr.is_default
                                        ? "border-slate-900 bg-slate-50"
                                        : "border-slate-200 bg-white"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 min-w-0 flex-1">
                                        <span
                                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                                addr.is_default
                                                    ? "bg-slate-900 text-white"
                                                    : "bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-900">
                                                    {addr.label}
                                                </span>
                                                {addr.is_default && (
                                                    <span className="flex items-center gap-1 rounded-full bg-slate-900 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                                                        <Star className="h-2.5 w-2.5" />
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1 text-sm font-medium text-slate-700">
                                                {addr.full_name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {addr.phone}
                                            </p>
                                            <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                                                {addr.street}
                                                {addr.city ? `, ${addr.city}` : ""}
                                                {addr.state ? `, ${addr.state}` : ""}
                                                <br />
                                                Pincode: {addr.pincode}
                                            </p>
                                            {addr.shipping_methods && (
                                                <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                                                    <Truck className="h-3 w-3" />
                                                    {addr.shipping_methods.name}
                                                    {addr.shipping_methods.price > 0
                                                        ? ` — ₹${addr.shipping_methods.price}`
                                                        : " — FREE"}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 flex-col gap-1">
                                        <button
                                            onClick={() => openEdit(addr)}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                            title="Edit"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        {!addr.is_default && (
                                            <>
                                                <button
                                                    onClick={() => handleDelete(addr.id)}
                                                    disabled={deletingId === addr.id}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                                    title="Delete"
                                                >
                                                    {deletingId === addr.id ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleSetDefault(addr.id)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                                    title="Set as default"
                                                >
                                                    <Star className="h-3.5 w-3.5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="rounded-2xl sm:max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-900">
                            {editingId ? "Edit Address" : "Add Address"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <Label className="mb-2 block text-xs font-semibold text-slate-600">
                                Label
                            </Label>
                            <div className="flex gap-2">
                                {LABELS.map((l) => {
                                    const Icon = LABEL_ICONS[l]
                                    return (
                                        <button
                                            type="button"
                                            key={l}
                                            onClick={() =>
                                                setForm((f) => ({ ...f, label: l }))
                                            }
                                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                                                form.label === l
                                                    ? "border-slate-900 bg-slate-50 text-slate-900"
                                                    : "border-slate-200 text-slate-400 hover:border-slate-300"
                                            }`}
                                        >
                                            <Icon className="h-3.5 w-3.5" />
                                            {l}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-600">
                                    Full Name
                                </Label>
                                <Input
                                    value={form.full_name}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            full_name: e.target.value,
                                        }))
                                    }
                                    placeholder="Full Name"
                                    className="h-11 rounded-xl border-slate-200"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-600">
                                    Phone
                                </Label>
                                <Input
                                    value={form.phone}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            phone: e.target.value,
                                        }))
                                    }
                                    placeholder="+91 XXXXX XXXXX"
                                    className="h-11 rounded-xl border-slate-200"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-600">
                                Pincode
                            </Label>
                            <div className="relative">
                                <Navigation
                                    className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                                        pincodeLoading
                                            ? "animate-spin text-blue-500"
                                            : "text-slate-400"
                                    }`}
                                />
                                <Input
                                    value={form.pincode}
                                    onChange={(e) => handlePincodeChange(e.target.value)}
                                    placeholder="6-digit pincode"
                                    maxLength={6}
                                    className="h-11 rounded-xl border-slate-200 pl-10"
                                    required
                                />
                            </div>
                        </div>

                        {shippingMethods.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-600">
                                    Choose Shipping Area
                                </Label>
                                {showShippingPicker ? (
                                    <div className="space-y-1.5">
                                        {shippingMethods.map((m: any) => (
                                            <button
                                                type="button"
                                                key={m.id}
                                                onClick={() => {
                                                    setForm((f) => ({
                                                        ...f,
                                                        shipping_method_id: m.id,
                                                    }))
                                                    setShowShippingPicker(false)
                                                }}
                                                className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all ${
                                                    form.shipping_method_id === m.id
                                                        ? "border-slate-900 bg-slate-50"
                                                        : "border-slate-200"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {form.shipping_method_id === m.id && (
                                                        <Check className="h-3.5 w-3.5 text-slate-900" />
                                                    )}
                                                    <span className="text-xs font-bold text-slate-700">
                                                        {m.name}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-bold text-slate-500">
                                                    ₹{m.price}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (() => {
                                    const selected = shippingMethods.find(
                                        (m) => m.id === form.shipping_method_id
                                    )
                                    if (!selected) return null
                                    return (
                                        <button
                                            type="button"
                                            onClick={() => setShowShippingPicker(true)}
                                            className="flex w-full items-center justify-between rounded-xl border-2 border-slate-900 bg-slate-50 px-4 py-3 text-left transition-all hover:bg-slate-100"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Check className="h-3.5 w-3.5 text-slate-900" />
                                                <span className="text-xs font-bold text-slate-700">
                                                    {selected.name}
                                                </span>
                                            </div>
                                            <span className="text-xs font-bold text-slate-500">
                                                ₹{selected.price}
                                            </span>
                                        </button>
                                    )
                                })()}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-600">
                                Full Street Address
                            </Label>
                            <Textarea
                                value={form.street}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        street: e.target.value,
                                    }))
                                }
                                placeholder="House No, Building, Street, Area"
                                className="min-h-[80px] rounded-xl border-slate-200 resize-none"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-600">
                                    City
                                </Label>
                                <Input
                                    value={form.city}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            city: e.target.value,
                                        }))
                                    }
                                    placeholder="City (auto-detected)"
                                    className="h-11 rounded-xl border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-600">
                                    State
                                </Label>
                                <Input
                                    value={form.state}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            state: e.target.value,
                                        }))
                                    }
                                    placeholder="State (auto-detected)"
                                    className="h-11 rounded-xl border-slate-200"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                                className="flex-1 rounded-xl border-slate-200 text-xs font-bold"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving || !form.shipping_method_id}
                                className="flex-1 rounded-xl bg-slate-900 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800"
                            >
                                {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : editingId ? (
                                    "Update"
                                ) : (
                                    "Save"
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
