"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import {
    Phone, MapPin, Mail, Instagram,
    Twitter, Facebook, ShieldCheck,
    ArrowRight, Lock
} from "lucide-react"

export function Footer() {
    const supabase = createClient()
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        async function checkAdmin() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single()
                setIsAdmin(data?.is_admin || false)
            }
        }
        checkAdmin()
    }, [])

    return (
        <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2">
                            {/* Replace with your actual logo <Image src="/logo.png" width={40} height={40} alt="Logo" /> */}
                            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-black text-xl italic">
                                S
                            </div>
                            <span className="text-xl font-black tracking-tighter uppercase">YourStore</span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                            Premium essentials designed for the modern lifestyle. Quality materials, ethical production, and fast delivery.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="p-2 bg-slate-50 rounded-full hover:bg-black hover:text-white transition-all"><Instagram className="w-4 h-4" /></Link>
                            <Link href="#" className="p-2 bg-slate-50 rounded-full hover:bg-black hover:text-white transition-all"><Twitter className="w-4 h-4" /></Link>
                            <Link href="#" className="p-2 bg-slate-50 rounded-full hover:bg-black hover:text-white transition-all"><Facebook className="w-4 h-4" /></Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold uppercase text-xs tracking-widest mb-6 text-slate-400">Shop & Info</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/shop" className="hover:translate-x-1 transition-transform inline-block">All Products</Link></li>
                            <li><Link href="/about" className="hover:translate-x-1 transition-transform inline-block">Our Story</Link></li>
                            <li><Link href="/shipping" className="hover:translate-x-1 transition-transform inline-block">Shipping Guide</Link></li>
                            <li><Link href="/contact" className="hover:translate-x-1 transition-transform inline-block">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="font-bold uppercase text-xs tracking-widest mb-6 text-slate-400">Legal</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/terms" className="hover:translate-x-1 transition-transform inline-block">Terms & Conditions</Link></li>
                            <li><Link href="/returns" className="hover:translate-x-1 transition-transform inline-block">Return Policy</Link></li>
                            <li><Link href="/privacy" className="hover:translate-x-1 transition-transform inline-block">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact & Address */}
                    <div className="space-y-6">
                        <h4 className="font-bold uppercase text-xs tracking-widest text-slate-400">Visit Us</h4>
                        <div className="space-y-4 text-sm">
                            <div className="flex gap-3">
                                <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                                <span className="text-slate-600 leading-tight">
                                    123 Fashion Street, Cyber Hub,<br /> Gurgaon, Haryana - 122002
                                </span>
                            </div>
                            <div className="flex gap-3">
                                <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                                <span className="text-slate-600 font-bold">+91 98765 43210</span>
                            </div>
                            <div className="flex gap-3">
                                <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                                <span className="text-slate-600">hello@yourstore.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-tight">
                        © 2026 YourStore Private Limited. All Rights Reserved.
                    </p>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-slate-300">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">SSL Secure</span>
                        </div>

                        {/* Admin Link Icon */}
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter hover:bg-black transition-all"
                                title="Admin Dashboard"
                            >
                                <Lock className="w-3 h-3" />
                                Staff Dashboard
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    )
}