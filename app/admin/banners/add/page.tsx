import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { BannerForm } from "@/components/admin/banner-form"

export default function AddBannerPage() {
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild className="-ml-2">
                                <Link href="/admin/banners">
                                    <ChevronLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <h2 className="text-3xl font-bold tracking-tight">
                                Create Banner
                            </h2>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Add a new slide to the homepage carousel.
                        </p>
                    </div>
                </div>

                <hr className="my-4" />

                <div className="flex items-center justify-center py-5">
                    <div className="w-full max-w-2xl bg-card p-8 border rounded-xl shadow-sm">
                        <BannerForm />
                    </div>
                </div>
            </div>
        </div>
    )
}
