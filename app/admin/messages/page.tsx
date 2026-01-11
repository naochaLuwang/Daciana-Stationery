import { createClient } from "@/utils/supabase/server"
import { Mail, Clock, User as UserIcon, Trash2 } from "lucide-react"
import { MessageItem } from "./message-item"

export default async function AdminMessagesPage() {
    const supabase = await createClient()

    const { data: messages, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <main className="p-4 md:p-10 max-w-6xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">
                    Customer Inquiries
                </h1>
                <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Inbox</p>
            </header>

            <div className="grid gap-4">
                {messages && messages.length > 0 ? (
                    messages.map((msg) => (
                        <MessageItem key={msg.id} msg={msg} />
                    ))
                ) : (
                    <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                        <Mail className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Your inbox is empty</p>
                    </div>
                )}
            </div>
        </main>
    )
}