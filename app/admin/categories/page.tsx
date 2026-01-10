import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import Image from "next/image"
import { Plus, Pencil, Trash2, ImageIcon, LinkIcon } from "lucide-react"
import { DeleteCategoryButton } from "@/components/admin/delete-category-button"
import { SearchInput } from "@/components/admin/search-input"

export default async function CategoriesPage({ searchParams }: {
    searchParams: Promise<{ q?: string }>
}) {
    const { q } = await searchParams
    const supabase = await createClient()
    let query = supabase
        .from("categories")
        .select("*, parent:parent_id(name)")
        .order("created_at", { ascending: false })

    // 2. Apply search filter if 'q' exists
    if (q) {
        query = query.ilike("name", `%${q}%`)
    }

    const { data: categories } = await query

    return (
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Categories</h1>
                    <p className="text-sm text-muted-foreground">Manage your product hierarchy and banners.</p>
                </div>
                <div className="flex items-center gap-2 max-w-sm">
                    <SearchInput placeholder="Search categories..." />
                    <Button asChild>
                        <Link href="/admin/categories/add">
                            <Plus className="w-4 h-4 mr-2" /> Add New
                        </Link>
                    </Button>
                </div>

            </div>

            <div className="border rounded-xl bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Parent</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No categories found.
                                </TableCell>
                            </TableRow>
                        )}
                        {categories?.map((cat) => (
                            <TableRow key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell>
                                    <div className="relative w-10 h-10 rounded-md overflow-hidden bg-slate-100 border flex items-center justify-center">
                                        {cat.image_url ? (
                                            <Image
                                                src={cat.image_url}
                                                alt={cat.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="w-5 h-5 text-slate-400" />
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="font-semibold text-slate-900">
                                    {cat.name}
                                </TableCell>
                                <TableCell className="text-muted-foreground font-mono text-xs">
                                    {cat.slug}
                                </TableCell>
                                <TableCell>
                                    {cat.parent?.name ? (
                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                                            {cat.parent.name}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400">—</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="icon" asChild className="h-8 w-8">
                                            <Link href={`/admin/categories/${cat.id}`}>
                                                <LinkIcon className="w-4 h-4 text-slate-600" />

                                            </Link>
                                        </Button>
                                        <Button variant="outline" size="icon" asChild className="h-8 w-8">
                                            <Link href={`/admin/categories/edit/${cat.id}`}>
                                                <Pencil className="w-4 h-4 text-slate-600" />
                                            </Link>
                                        </Button>
                                        <DeleteCategoryButton id={cat.id} name={cat.name} />
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