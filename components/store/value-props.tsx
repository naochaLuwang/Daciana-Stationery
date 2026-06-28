import { Truck, CreditCard, RotateCcw, Gem } from "lucide-react"

const VALUES = [
    { icon: Truck, label: "Free Shipping", sub: "Above ₹2,999" },
    { icon: CreditCard, label: "Pay on Delivery", sub: "COD available" },
    { icon: RotateCcw, label: "Easy Returns", sub: "Within 3 days" },
    { icon: Gem, label: "Premium Quality", sub: "Curated selection" },
]

export function ValueProps() {
    return (
        <section className="border-b border-slate-50">
            <div className="max-w-[1400px] mx-auto px-4">
                <div className="grid grid-cols-4 gap-0 py-4 sm:py-5">
                    {VALUES.map((item) => (
                        <div key={item.label} className="flex flex-col items-center gap-1 border-r border-slate-50 last:border-r-0">
                            <item.icon className="w-[18px] h-[18px] text-slate-700" strokeWidth={1.2} />
                            <p className="text-[10px] font-semibold text-slate-700 text-center leading-tight">{item.label}</p>
                            <p className="text-[8px] text-slate-400 text-center leading-tight">{item.sub}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
