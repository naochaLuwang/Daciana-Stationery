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

    const getPercentage = (star: number) => {
        if (reviews.length === 0) return 0
        const count = reviews.filter(r => r.rating === star).length
        return (count / reviews.length) * 100
    }

    return (
        <section id="reviews">
            {/* Header */}
            <div className="mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                    REVIEWS
                </p>
                <h3 className="text-[26px] font-light text-slate-900 tracking-tight leading-none mt-0.5">
                    Customer Reviews
                </h3>
            </div>

            {/* Rating Summary */}
            {reviews.length > 0 && (
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                    <span className="text-4xl font-bold text-slate-900">{avgRating}</span>
                    <div>
                        <div className="flex gap-0.5 mb-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                    key={i}
                                    className={`w-3.5 h-35 ${i <= Math.round(Number(avgRating)) ? "fill-slate-900 text-slate-900" : "text-slate-200"}`}
                                />
                            ))}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400">
                            Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                        </p>
                    </div>

                    {/* Mini breakdown */}
                    <div className="flex-1 max-w-[120px] space-y-1 ml-auto">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} className="flex items-center gap-1.5">
                                <span className="text-[9px] font-bold text-slate-400 w-2">{star}</span>
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
            )}

            {/* Write Review */}
            <div className="mb-8">
                <WriteReviewForm productId={productId} user={user} />
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} className="border-b border-slate-50 pb-6 last:border-0">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star
                                            key={i}
                                            className={`w-3 h-3 ${i <= review.rating ? "fill-slate-900 text-slate-900" : "text-slate-200"}`}
                                        />
                                    ))}
                                </div>
                                {review.is_verified && (
                                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600">
                                        <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                                    </span>
                                )}
                                <span className="text-[9px] text-slate-400 ml-auto">
                                    {mounted ? new Date(review.created_at).toLocaleDateString() : ""}
                                </span>
                            </div>
                            {review.title && (
                                <p className="text-sm font-bold text-slate-900 mb-1">{review.title}</p>
                            )}
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {review.comment}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 mt-2">{review.user_name}</p>
                        </div>
                    ))
                ) : (
                    <div className="py-12 text-center">
                        <Star className="w-6 h-6 text-slate-200 mx-auto mb-3" />
                        <p className="text-xs font-bold text-slate-400">No reviews yet</p>
                    </div>
                )}
            </div>
        </section>
    )
}
