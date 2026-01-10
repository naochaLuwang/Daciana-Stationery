"use client"

import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function CustomerTable({ customers }: { customers: any[] }) {
    return (
        <div className="rounded-md border">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                    <tr>
                        <th className="p-4 text-left font-bold uppercase text-[10px]">Customer</th>
                        <th className="p-4 text-left font-bold uppercase text-[10px]">Status</th>
                        <th className="p-4 text-left font-bold uppercase text-[10px]">Orders</th>
                        <th className="p-4 text-left font-bold uppercase text-[10px]">Total Spend</th>
                        <th className="p-4 text-right font-bold uppercase text-[10px]">Joined</th>
                        <th className="w-[50px]"></th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map((customer) => {
                        const totalSpend = customer.orders.reduce((acc: number, o: any) => acc + Number(o.total), 0)

                        return (
                            <tr key={customer.id} className="border-b hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <div className="font-medium">{customer.full_name || "Anonymous"}</div>
                                    <div className="text-xs text-muted-foreground">{customer.email}</div>
                                </td>
                                <td className="p-4">
                                    <Badge variant={customer.orders.length > 0 ? "default" : "secondary"} className="text-[10px]">
                                        {customer.orders.length > 0 ? "RECURRING" : "LEAD"}
                                    </Badge>
                                </td>
                                <td className="p-4 font-mono">{customer.orders.length}</td>
                                <td className="p-4 font-bold text-emerald-600">₹{totalSpend.toLocaleString()}</td>
                                <td className="p-4 text-right text-muted-foreground">
                                    {format(new Date(customer.created_at), "MMM dd, yyyy")}
                                </td>
                                <td className="p-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => window.location.href = `mailto:${customer.email}`}>
                                                <Mail className="mr-2 h-4 w-4" /> Email Customer
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>View Order History</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}