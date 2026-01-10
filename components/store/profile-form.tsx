"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, MapPin, Phone, User } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

export function ProfileForm({ profile }: { profile: any }) {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    // Consolidate all fields into state for a controlled form
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || "",
        phone: profile?.phone || "",
        pincode: profile?.pincode || "",
        street: profile?.street || ""
    })

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()

        // Basic Validation
        if (formData.pincode && formData.pincode.length !== 6) {
            return toast.error("Pincode must be exactly 6 digits")
        }

        setLoading(true)

        const { error } = await supabase
            .from("profiles")
            .update({
                full_name: formData.full_name,
                phone: formData.phone,
                pincode: formData.pincode,
                street: formData.street,
            })
            .eq("id", profile.id)

        if (error) {
            console.error("Update Error:", error)
            toast.error("Could not update profile")
        } else {
            toast.success("Profile updated successfully")
        }
        setLoading(false)
    }

    return (
        <form onSubmit={handleUpdate} className="space-y-6">
            {/* Personal Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="full_name" className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5" /> Full Name
                    </Label>
                    <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Enter your name"
                        className="rounded-xl h-12"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5" /> Phone Number
                    </Label>
                    <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 XXXXX XXXXX"
                        className="rounded-xl h-12"
                        required
                    />
                </div>
            </div>

            <hr className="border-slate-100" />

            {/* Address Details Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Default Shipping Address</h3>

                <div className="space-y-2">
                    <Label htmlFor="pincode" className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" /> Pincode
                    </Label>
                    <Input
                        id="pincode"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                        placeholder="6-digit pincode"
                        maxLength={6}
                        className="rounded-xl h-12 md:w-1/2"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="street">Full Street Address</Label>
                    <Textarea
                        id="street"
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        placeholder="House No, Building Name, Street, Landmark"
                        className="rounded-xl min-h-[100px] resize-none"
                        required
                    />
                    <p className="text-[11px] text-muted-foreground">
                        Providing an accurate address helps us deliver your orders faster.
                    </p>
                </div>
            </div>

            <div className="pt-4">
                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto px-10 bg-black text-white hover:bg-slate-800 rounded-xl h-12 font-bold transition-all active:scale-95"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Save Profile Settings
                </Button>
            </div>
        </form>
    )
}