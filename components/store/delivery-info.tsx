"use client"

import { Truck, RotateCcw, Shield } from "lucide-react"

export function DeliveryInfo() {
    return (
        <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                Policies
            </p>
            <div className="grid grid-cols-3 gap-3">
                {[
                    { icon: Truck, label: "Fast Shipping", desc: "2-5 days" },
                    { icon: RotateCcw, label: "Easy Returns", desc: "30-day policy" },
                    { icon: Shield, label: "Genuine", desc: "100% authentic" },
                ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-1.5 text-center">
                        <item.icon className="w-4 h-4 text-slate-600" strokeWidth={1.5} />
                        <div>
                            <p className="text-[9px] font-bold text-slate-700 leading-tight">{item.label}</p>
                            <p className="text-[8px] text-slate-400 leading-tight">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
