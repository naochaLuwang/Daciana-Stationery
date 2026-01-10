"use client"

import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { toast } from "sonner"
import { useCart } from "../store/use-cart"
// REMOVED: import { clear } from "console" (This was wrong)

export function SignOutButton() {
    const supabase = createClient()
    const clearCart = useCart((state) => state.clearCart)

    const handleSignOut = async () => {
        try {
            // 1. Clear the cart state and storage FIRST
            clearCart();

            // 2. Sign out from Supabase
            const { error } = await supabase.auth.signOut();

            if (error) throw error;

            toast.success("Signed out successfully");

            // 3. The "Nuclear" reload
            // This ensures no leftover Zustand memory exists
            setTimeout(() => {
                window.location.replace("/");
            }, 100); // 100ms delay gives LocalStorage time to settle

        } catch (error) {
            console.error(error);
            toast.error("Error signing out");
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-slate-500 hover:text-red-600 hover:bg-red-50"
        >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
        </Button>
    )
}