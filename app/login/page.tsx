"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { UserPlus, LogIn, Mail, Lock, User } from "lucide-react"

export default function AuthPage() {
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleAuth = async (e: React.FormEvent<HTMLFormElement>, type: 'login' | 'signup') => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const fullName = formData.get('fullName') as string

        if (type === 'signup') {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName } }
            })
            if (error) toast.error(error.message)
            else toast.success("Signup successful! Check your email.")
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) toast.error(error.message)
            else {
                toast.success("Welcome back!")
                router.push("/")
                router.refresh()
            }
        }
        setLoading(false)
    }

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
            <Card className="w-full max-w-md shadow-lg border-slate-200">
                <Tabs defaultValue="login" className="w-full">
                    <CardHeader className="text-center">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            Dariciana Stationery
                        </CardTitle>
                        <CardDescription>
                            Enter your details to continue
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <TabsContent value="login">
                            <form onSubmit={(e) => handleAuth(e, 'login')} className="space-y-4">
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input name="email" type="email" placeholder="Email" className="pl-10" required />
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input name="password" type="password" placeholder="Password" className="pl-10" required />
                                    </div>
                                </div>
                                <Button className="w-full mt-2" type="submit" disabled={loading}>
                                    <LogIn className="mr-2 h-4 w-4" /> {loading ? "Authenticating..." : "Login"}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup">
                            <form onSubmit={(e) => handleAuth(e, 'signup')} className="space-y-4">
                                <div className="space-y-2">
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input name="fullName" placeholder="Full Name" className="pl-10" required />
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input name="email" type="email" placeholder="Email" className="pl-10" required />
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input name="password" type="password" placeholder="Password" className="pl-10" required />
                                    </div>
                                </div>
                                <Button className="w-full mt-2" type="submit" disabled={loading}>
                                    <UserPlus className="mr-2 h-4 w-4" /> {loading ? "Creating Account..." : "Create Account"}
                                </Button>
                            </form>
                        </TabsContent>
                    </CardContent>
                </Tabs>
            </Card>
        </div>
    )
}