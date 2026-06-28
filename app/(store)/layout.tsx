import { Footer } from "@/components/layout/footer"
import Navbar from "@/components/layout/navbar"
import { BottomNav } from "@/components/layout/bottom-nav"

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pb-16 lg:pb-0">
                {children}
            </main>
            <div className="hidden sm:block">
                <Footer />
            </div>
            <BottomNav />
        </div>
    )
}
