import Link from "next/link"
import Image from "next/image"

interface Category {
    id: string
    name: string
    slug?: string
    image_url?: string
}

export function CategoryRibbon({ categories }: { categories: Category[] }) {
    if (!categories || categories.length === 0) return null

    return (
        <section className="bg-white border-b border-slate-100">
            <div className="container mx-auto px-4 py-6">
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/categories/${cat.id}`}
                            className="group flex flex-col items-center gap-2 min-w-[80px] sm:min-w-[100px]"
                        >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-slate-100 border-2 border-transparent group-hover:border-primary transition-all duration-300 shadow-sm group-hover:shadow-md">
                                {cat.image_url ? (
                                    <Image
                                        src={cat.image_url}
                                        alt={cat.name}
                                        width={80}
                                        height={80}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-xl font-bold">
                                        {cat.name[0]}
                                    </div>
                                )}
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-slate-600 group-hover:text-primary transition-colors text-center whitespace-nowrap">
                                {cat.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
