"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { User, Phone, Lock, ChevronDown, Loader2, CheckCircle2 } from "lucide-react"

export function ProfileForm({ profile }: { profile: any }) {
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [showPasswordSection, setShowPasswordSection] = useState(false)
    const [saved, setSaved] = useState(false)

    const [formData, setFormData] = useState({
        full_name: profile?.full_name || "",
        phone: profile?.phone || "",
    })

    const [passwords, setPasswords] = useState({
        new: "",
        confirm: "",
    })

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const { error } = await supabase
            .from("profiles")
            .update({
                full_name: formData.full_name,
                phone: formData.phone,
            })
            .eq("id", profile?.id)

        if (error) {
            toast.error("Could not update profile")
        } else {
            setSaved(true)
            toast.success("Profile updated")
            router.refresh()
            setTimeout(() => setSaved(false), 3000)
        }
        setLoading(false)
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwords.new.length < 6) return toast.error("Password must be at least 6 characters")
        if (passwords.new !== passwords.confirm) return toast.error("Passwords do not match")
        setPasswordLoading(true)
        const { error } = await supabase.auth.updateUser({ password: passwords.new })
        if (error) {
            toast.error(error.message)
        } else {
            toast.success("Password updated")
            setPasswords({ new: "", confirm: "" })
            setShowPasswordSection(false)
        }
        setPasswordLoading(false)
    }

    return (
        <form onSubmit={handleUpdate} className="space-y-8">
            <div>
                <div className="flex items-center gap-2 mb-5">
                    <User className="h-4 w-4 text-slate-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                        Personal Information
                    </h3>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="full_name" className="text-xs font-semibold text-slate-600">
                            Full Name
                        </Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                id="full_name"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                placeholder="Enter your name"
                                className="h-12 rounded-xl border-slate-200 pl-10"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs font-semibold text-slate-600">
                            Phone Number
                        </Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+91 XXXXX XXXXX"
                                className="h-12 rounded-xl border-slate-200 pl-10"
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button
                    type="submit"
                    disabled={loading}
                    className="h-12 rounded-xl bg-slate-900 px-8 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                        </span>
                    ) : saved ? (
                        <span className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Saved
                        </span>
                    ) : (
                        "Save Changes"
                    )}
                </Button>
            </div>

            <hr className="border-slate-100" />

            <div>
                <button
                    type="button"
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                    className="flex w-full items-center gap-2 text-left"
                >
                    <Lock className="h-4 w-4 text-slate-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                        Change Password
                    </h3>
                    <ChevronDown
                        className={`ml-auto h-4 w-4 text-slate-400 transition-transform ${
                            showPasswordSection ? "rotate-180" : ""
                        }`}
                    />
                </button>
                {showPasswordSection && (
                    <div className="mt-5 space-y-5">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="new-pw" className="text-xs font-semibold text-slate-600">
                                    New Password
                                </Label>
                                <Input
                                    id="new-pw"
                                    type="password"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                    placeholder="Min. 6 characters"
                                    className="h-12 rounded-xl border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-pw" className="text-xs font-semibold text-slate-600">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="confirm-pw"
                                    type="password"
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                    placeholder="Re-enter new password"
                                    className="h-12 rounded-xl border-slate-200"
                                />
                            </div>
                        </div>
                        <Button
                            type="button"
                            onClick={handlePasswordChange}
                            disabled={passwordLoading || !passwords.new || !passwords.confirm}
                            className="h-12 rounded-xl border border-slate-200 bg-white text-xs font-bold uppercase tracking-wider text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98]"
                        >
                            {passwordLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Updating...
                                </span>
                            ) : (
                                "Update Password"
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </form>
    )
}
