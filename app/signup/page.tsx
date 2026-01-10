"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"

export default function SignupPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [fullName, setFullName] = useState("")
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // 1. Sign up the user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName } // Stores in user metadata
            }
        })

        if (error) {
            toast.error(error.message)
        } else {
            toast.success("Check your email for the confirmation link!")
            router.push("/login")
        }
        setLoading(false)
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8 border p-8 rounded-2xl bg-white shadow-sm">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Create an account</h1>
                    <p className="text-slate-500 text-sm">Join us to start shopping</p>
                </div>
                <form onSubmit={handleSignup} className="space-y-4">
                    <Input placeholder="Full Name" required onChange={(e) => setFullName(e.target.value)} />
                    <Input type="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} />
                    <Input type="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
                    <Button className="w-full" type="submit" disabled={loading}>
                        {loading ? "Creating account..." : "Sign Up"}
                    </Button>
                </form>
                <p className="text-center text-sm">
                    Already have an account? <Link href="/login" className="text-primary font-bold">Login</Link>
                </p>
            </div>
        </div>
    )
}