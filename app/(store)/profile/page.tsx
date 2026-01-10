import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/store/profile-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Phone, Mail, Calendar, ShieldCheck } from "lucide-react"

export default async function ProfilePage() {
    const supabase = await createClient()

    // Get Auth User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Get Profile Data
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-black mb-8">My Account</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Account Overview */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="border-none bg-slate-50 shadow-none rounded-3xl">
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-widest text-slate-500 font-bold">
                                Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span className="text-sm truncate font-medium">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-600">
                                    Joined {new Date(profile?.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            {profile?.is_admin && (
                                <div className="flex items-center gap-3 text-blue-600">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span className="text-sm font-bold uppercase">Administrator</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Update Form */}
                <div className="md:col-span-2">
                    <Card className="rounded-3xl border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ProfileForm profile={profile} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}