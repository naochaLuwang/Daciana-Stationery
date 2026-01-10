import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

interface CategoryCardProps {
    category: {
        id: string
        name: string
        description?: string
        image_url?: string
    }
}

export function CategoryCard({ category }: CategoryCardProps) {
    return (
        <Link href={`/categories/${category.id}`} className="group">
            <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl bg-white">
                <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                    {category.image_url ? (
                        <Image
                            src={category.image_url}
                            alt={category.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <span className="text-4xl font-bold opacity-20">{category.name[0]}</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors">
                                {category.name}
                            </h3>
                            {category.description && (
                                <p className="text-sm text-slate-500 line-clamp-1 mt-1">
                                    {category.description}
                                </p>
                            )}
                        </div>
                        <div className="bg-slate-100 p-2 rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}