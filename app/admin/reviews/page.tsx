import { createClient } from "@/utils/supabase/server"
import { Star, Trash2, CheckCircle, XCircle, ShieldCheck } from "lucide-react"
import { deleteReview, toggleVerification, approveReview } from "./actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function ReviewModeratorPage() {
    const supabase = await createClient()

    // Fetch reviews - No changes here, but ensure your SQL policy allows this select
    const { data: reviews } = await supabase
        .from("product_reviews")
        .select(`
            *,
            products(name, thumbnail_url)
        `)
        .order("is_approved", { ascending: true })
        .order("created_at", { ascending: false })

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Review Moderator</h1>
                    <p className="text-sm text-slate-500">Curate client feedback and manage verification status.</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</p>
                        <p className="text-xl font-bold">{reviews?.length || 0}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Pending</p>
                        <p className="text-xl font-bold">{reviews?.filter(r => !r.is_approved).length || 0}</p>
                    </div>
                </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <th className="p-4">Product</th>
                            <th className="p-4">Review Detail</th>
                            <th className="p-4">Author Info</th>
                            <th className="p-4">Visibility</th>
                            <th className="p-4">Trust Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {reviews?.map((review) => (
                            <tr
                                key={review.id}
                                className={`text-sm transition-colors ${!review.is_approved ? 'bg-amber-50/30' : 'hover:bg-slate-50'}`}
                            >
                                <td className="p-4 max-w-[180px]">
                                    <div className="font-bold text-slate-900 truncate">{review.products?.name}</div>
                                    <div className="text-[9px] text-slate-400 font-mono uppercase">ID: {review.id.split('-')[0]}</div>
                                </td>

                                <td className="p-4">
                                    <div className="flex gap-0.5 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                                        ))}
                                    </div>
                                    <div className="max-w-[320px]">
                                        <p className="font-black text-[11px] uppercase tracking-tight text-slate-900 mb-1">{review.title}</p>
                                        <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 italic">"{review.comment}"</p>
                                    </div>
                                </td>

                                <td className="p-4 whitespace-nowrap">
                                    <div className="text-xs font-bold text-slate-900 uppercase tracking-tight">{review.user_name}</div>
                                    <div className="text-[10px] text-slate-400 font-medium">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </div>
                                </td>

                                <td className="p-4">
                                    {review.is_approved ? (
                                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 uppercase text-[9px] font-black tracking-widest">
                                            Published
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-amber-100/50 text-amber-700 border-amber-200 uppercase text-[9px] font-black tracking-widest animate-pulse">
                                            Pending
                                        </Badge>
                                    )}
                                </td>

                                <td className="p-4 whitespace-nowrap">
                                    {review.is_verified ? (
                                        <span className="flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-widest">
                                            <ShieldCheck className="w-3.5 h-3.5" /> Verified
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-slate-300 text-[10px] font-black uppercase tracking-widest">
                                            <XCircle className="w-3.5 h-3.5" /> Standard
                                        </span>
                                    )}
                                </td>

                                <td className="p-4 text-right">
                                    <div className="flex justify-end items-center gap-2">
                                        {/* THE APPROVE FORM */}
                                        {!review.is_approved && (
                                            <form action={approveReview}>
                                                <input type="hidden" name="id" value={review.id} />
                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    className="h-8 bg-slate-900 hover:bg-black text-white text-[10px] uppercase font-black tracking-widest px-4 rounded-lg"
                                                >
                                                    Approve
                                                </Button>
                                            </form>
                                        )}

                                        {/* THE VERIFICATION FORM */}
                                        <form action={toggleVerification.bind(null, review.id, review.is_verified)}>
                                            <Button variant="outline" size="sm" className="h-8 text-[9px] uppercase font-black border-slate-200">
                                                {review.is_verified ? "Unverify" : "Verify User"}
                                            </Button>
                                        </form>

                                        {/* THE DELETE FORM */}
                                        <form action={deleteReview.bind(null, review.id)}>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}