import { createClient } from "@/utils/supabase/server"
import { EditBannerForm } from "@/components/admin/edit-banner-form"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default async function EditBannerPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    const { data: banner } = await supabase
        .from("banners")
        .select("*")
        .eq("id", id)
        .single()

    if (!banner) notFound()

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
                                Edit Banner
                            </h2>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Update homepage carousel slide.
                        </p>
                    </div>
                </div>

                <hr className="my-4" />

                <div className="flex items-center justify-center py-5">
                    <div className="w-full max-w-2xl bg-card p-8 border rounded-xl shadow-sm">
                        <EditBannerForm initialData={banner} />
                    </div>
                </div>
            </div>
        </div>
    )
}
