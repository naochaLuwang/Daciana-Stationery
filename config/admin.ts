import {
    LayoutDashboard,
    ShoppingBag,
    FolderTree,
    Settings,
    Users,
    PackageSearch, // Better for Inventory
    Truck,         // Better for Shipping
    ClipboardList, Mail,
    Star, // Better for Orders
    Image,
} from "lucide-react"

export const adminConfig = {
    sidebarNav: [
        { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { title: "Products", href: "/admin/products", icon: ShoppingBag },
        { title: "Categories", href: "/admin/categories", icon: FolderTree },
        { title: "Banners", href: "/admin/banners", icon: Image },
        { title: "Orders", href: "/admin/orders", icon: ClipboardList },
        { title: "Inventory", href: "/admin/inventory", icon: PackageSearch },
        { title: "Customers", href: "/admin/customers", icon: Users },
        { title: "Shipping", href: "/admin/shipping", icon: Truck },
        { title: "Messages", href: "/admin/messages", icon: Mail },
        { title: "Reviews", href: "/admin/reviews", icon: Star },
        { title: "Legal Settings", href: "/admin/settings/legal", icon: Settings },
    ],
}