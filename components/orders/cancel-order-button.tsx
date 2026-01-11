"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cancelOrderAndRestoreStock } from "@/app/actions/orders"
import { toast } from "sonner"
import { Loader2, XCircle } from "lucide-react"

interface CancelOrderButtonProps {
    orderId: string
    currentStatus: string
}

export function CancelOrderButton({ orderId, currentStatus }: CancelOrderButtonProps) {
    const [loading, setLoading] = useState(false)

    // Only allow cancellation if status is 'pending' or 'processing'
    const isCancellable = !['shipped', 'delivered', 'cancelled'].includes(currentStatus.toLowerCase())

    if (!isCancellable) return null

    const handleCancel = async () => {
        const confirmCancel = confirm(
            "Are you sure you want to cancel your order? This action cannot be undone."
        )

        if (!confirmCancel) return

        setLoading(true)
        try {
            const res = await cancelOrderAndRestoreStock(orderId)
            if (res.success) {
                toast.success("Order cancelled successfully")
                // Refresh page to show updated status
                window.location.reload()
            } else {
                toast.error(res.message || "Failed to cancel order")
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 rounded-xl font-bold text-xs uppercase tracking-wider"
        >
            {loading ? (
                <Loader2 className="w-3 h-3 animate-spin mr-2" />
            ) : (
                <XCircle className="w-3 h-3 mr-2" />
            )}
            Cancel Order
        </Button>
    )
}