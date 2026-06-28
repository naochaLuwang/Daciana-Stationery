"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from "lucide-react"

export default function AuthPage() {
    const [loading, setLoading] = useState(false)
    const [mode, setMode] = useState<"login" | "signup">("login")
    const [showPassword, setShowPassword] = useState(false)
    const supabase = createClient()
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectTo = searchParams.get("redirect") || searchParams.get("next") || "/"

    const handleAuth = async (e: React.FormEvent<HTMLFormElement>, type: "login" | "signup") => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const fullName = formData.get("fullName") as string
        const phone = formData.get("phone") as string

        if (type === "signup") {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName, phone } },
            })

            if (error) {
                toast.error(error.message)
            } else if (data.session) {
                toast.success("Account created! Welcome.")
                router.push(redirectTo)
                router.refresh()
            } else {
                toast.success("Signup successful! Please verify your email to log in.")
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) toast.error(error.message)
            else {
                toast.success("Welcome back!")
                router.push(redirectTo)
                router.refresh()
            }
        }
        setLoading(false)
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-slate-200/30 blur-3xl" />
                <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-slate-300/20 blur-3xl" />
                <div className="absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-100/50 blur-3xl" />
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 relative w-full max-w-md duration-700">
                <div className="mx-auto h-1.5 w-16 rounded-full bg-gradient-to-r from-slate-800 to-slate-600" />

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur-xl">
                    <div className="mb-8 text-center">
                        <h1 className="font-daciana text-3xl font-black tracking-[0.15em] text-slate-900">
                            DACIANA
                        </h1>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                            Stationery & Cosmetics
                        </p>
                    </div>

                    <div className="mb-8 flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                        <button
                            type="button"
                            onClick={() => setMode("login")}
                            className={`flex-1 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                                mode === "login"
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("signup")}
                            className={`flex-1 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                                mode === "signup"
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {mode === "login" && (
                        <form onSubmit={(e) => handleAuth(e, "login")} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="login-email" className="text-xs font-medium text-slate-600">
                                    Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="login-email"
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        className="h-11 border-slate-200 pl-10 text-sm transition-colors focus:border-slate-400"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="login-password" className="text-xs font-medium text-slate-600">
                                        Password
                                    </Label>
                                    <button
                                        type="button"
                                        className="text-[11px] font-medium text-slate-400 underline-offset-2 hover:text-slate-700 hover:underline"
                                    >
                                        Forgot?
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="login-password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="h-11 border-slate-200 pl-10 pr-10 text-sm transition-colors focus:border-slate-400"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((p) => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-11 w-full rounded-xl bg-slate-900 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-slate-800"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Authenticating...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Log in
                                        <ArrowRight className="h-4 w-4" />
                                    </span>
                                )}
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <Separator />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-slate-400">or continue with</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="h-11 w-full rounded-xl border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Google
                            </Button>
                        </form>
                    )}

                    {mode === "signup" && (
                        <form onSubmit={(e) => handleAuth(e, "signup")} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="signup-name" className="text-xs font-medium text-slate-600">
                                    Full Name
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="signup-name"
                                        name="fullName"
                                        placeholder="John Doe"
                                        className="h-11 border-slate-200 pl-10 text-sm transition-colors focus:border-slate-400"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="signup-phone" className="text-xs font-medium text-slate-600">
                                    Phone Number
                                </Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="signup-phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        className="h-11 border-slate-200 pl-10 text-sm transition-colors focus:border-slate-400"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="signup-email" className="text-xs font-medium text-slate-600">
                                    Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="signup-email"
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        className="h-11 border-slate-200 pl-10 text-sm transition-colors focus:border-slate-400"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="signup-password" className="text-xs font-medium text-slate-600">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="signup-password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a password"
                                        className="h-11 border-slate-200 pl-10 pr-10 text-sm transition-colors focus:border-slate-400"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((p) => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-11 w-full rounded-xl bg-slate-900 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-slate-800"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Creating Account...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Create Account
                                        <ArrowRight className="h-4 w-4" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    )}
                </div>

                <p className="mt-8 text-center text-[11px] text-slate-400">
                    By continuing, you agree to our{" "}
                    <button type="button" className="underline underline-offset-2 hover:text-slate-600">
                        Terms
                    </button>{" "}
                    &{" "}
                    <button type="button" className="underline underline-offset-2 hover:text-slate-600">
                        Privacy Policy
                    </button>
                </p>
            </div>
        </div>
    )
}
