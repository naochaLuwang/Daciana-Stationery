"use client"

import { useState, useEffect } from "react"
import { Star, CheckCircle2 } from "lucide-react"
import { WriteReviewForm } from "./write-review-form"

export function ReviewsSection({
    reviews,
    productId,
    user
}: {
    reviews: any[],
    productId: string,
    user: any
}) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
        : 0

    // Calculate rating breakdown percentages
    const getPercentage = (star: number) => {
        if (reviews.length === 0) return 0
        const count = reviews.filter(r => r.rating === star).length
        return (count / reviews.length) * 100
    }

    return (
        <section className="py-24 border-t border-slate-100" id="reviews">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                {/* Summary Column */}
                <div className="lg:col-span-4 space-y-8">
                    <div>
                        <span className="font-daciana text-primary tracking-[0.4em] uppercase text-[10px] mb-4 block">
                            Client Voices
                        </span>
                        <h2 className="text-3xl font-black tracking-tighter text-slate-900 uppercase mb-6">
                            Reviews
                        </h2>

                        <div className="flex items-end gap-4 mb-6">
                            <span className="text-6xl font-black text-slate-900 leading-none">{avgRating}</span>
                            <div className="pb-1">
                                <div className="flex gap-0.5 mb-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(avgRating)) ? "fill-primary text-primary" : "text-slate-200"}`} />
                                    ))}
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Based on {reviews.length} reviews
                                </p>
                            </div>
                        </div>

                        {/* Rating Progress Bars */}
                        <div className="space-y-2 max-w-[250px]">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <div key={star} className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-slate-400 w-3">{star}</span>
                                    <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-slate-900 rounded-full"
                                            style={{ width: `${getPercentage(star)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Write Review Button/Form Trigger */}
                    <div className="pt-4 border-t border-slate-50">
                        <p className="text-xs text-slate-500 mb-4 italic">Share your thoughts with other clients.</p>
                        <WriteReviewForm productId={productId} user={user} />
                    </div>
                </div>

                {/* Individual Reviews Column */}
                <div className="lg:col-span-8 space-y-12">
                    {reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review.id} className="border-b border-slate-50 pb-12 last:border-0 animate-in fade-in duration-700">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex gap-0.5 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-slate-900 text-slate-900" : "text-slate-200"}`} />
                                            ))}
                                        </div>
                                        <h4 className="font-bold text-slate-900 uppercase text-sm tracking-tight">{review.title}</h4>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium font-mono">
                                        {mounted ? new Date(review.created_at).toLocaleDateString() : '---'}
                                    </span>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed mb-4 italic">
                                    "{review.comment}"
                                </p>
                                <div className="flex items-center gap-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                                        {review.user_name}
                                    </p>
                                    {review.is_verified && (
                                        <div className="flex items-center gap-1 text-primary">
                                            <CheckCircle2 className="w-2.5 h-2.5" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest">Verified Buyer</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 bg-slate-50/50 rounded-3xl text-center border border-dashed border-slate-200">
                            <Star className="w-8 h-8 text-slate-200 mx-auto mb-4" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">No reviews yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}