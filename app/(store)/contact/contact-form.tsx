"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

export function ContactForm() {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const form = e.currentTarget
        const formData = new FormData(e.currentTarget)

        const { error } = await supabase
            .from('contact_messages')
            .insert({
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message'),
            })

        if (error) {
            toast.error("Something went wrong. Please try again.")
        } else {
            toast.success("Message sent! We'll get back to you shortly.")
            form.reset()
        }
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Name</Label>
                    <Input id="name" name="name" required placeholder="Your full name" className="rounded-xl border-slate-100 h-12 focus:ring-slate-900" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</Label>
                    <Input id="email" name="email" type="email" required placeholder="email@example.com" className="rounded-xl border-slate-100 h-12 focus:ring-slate-900" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="subject" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</Label>
                <Input id="subject" name="subject" required placeholder="How can we help?" className="rounded-xl border-slate-100 h-12 focus:ring-slate-900" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="message" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message</Label>
                <Textarea id="message" name="message" required placeholder="Write your message here..." className="rounded-xl border-slate-100 min-h-[150px] resize-none focus:ring-slate-900" />
            </div>

            <Button
                disabled={loading}
                className="w-full bg-slate-900 text-white hover:bg-black h-14 rounded-xl font-bold uppercase tracking-[0.2em] text-[11px] transition-all active:scale-95"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Send Inquiry
            </Button>
        </form>
    )
}