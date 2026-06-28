import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import Image from "next/image"
import { Plus, Pencil, ImageIcon } from "lucide-react"
import { DeleteBannerButton } from "@/components/admin/delete-banner-button"
import { Badge } from "@/components/ui/badge"

export default async function BannersPage() {
    const supabase = await createClient()

    const { data: banners } = await supabase
        .from("banners")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })

    return (
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Banners</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage homepage carousel slides.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/banners/add">
                        <Plus className="w-4 h-4 mr-2" /> Add New
                    </Link>
                </Button>
            </div>

            <div className="border rounded-xl bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[120px]">Image</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>CTA</TableHead>
                            <TableHead>Link</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {banners?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No banners found.
                                </TableCell>
                            </TableRow>
                        )}
                        {banners?.map((banner) => (
                            <TableRow
                                key={banner.id}
                                className="hover:bg-slate-50/50 transition-colors"
                            >
                                <TableCell>
                                    <div className="relative w-20 h-12 rounded-md overflow-hidden bg-slate-100 border flex items-center justify-center">
                                        {banner.image_url ? (
                                            <Image
                                                src={banner.image_url}
                                                alt={banner.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div
                                                className={`w-full h-full bg-gradient-to-r ${banner.bg_color}`}
                                            />
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="font-semibold text-slate-900">
                                    {banner.title}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                    {banner.cta}
                                </TableCell>
                                <TableCell className="text-muted-foreground font-mono text-xs">
                                    {banner.href}
                                </TableCell>
                                <TableCell className="text-center">
                                    {banner.sort_order}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={banner.is_active ? "default" : "secondary"}
                                    >
                                        {banner.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            asChild
                                            className="h-8 w-8"
                                        >
                                            <Link href={`/admin/banners/edit/${banner.id}`}>
                                                <Pencil className="w-4 h-4 text-slate-600" />
                                            </Link>
                                        </Button>
                                        <DeleteBannerButton
                                            id={banner.id}
                                            title={banner.title}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
