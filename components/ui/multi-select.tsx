"use client"

import * as React from "react"
import { X, Check, ChevronsUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function MultiSelect({ options = [], selected = [], onChange, placeholder = "Select..." }: any) {
    const [open, setOpen] = React.useState(false)
    const safeSelected = Array.isArray(selected) ? selected : []

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className="flex min-h-[40px] w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer">
                    <div className="flex flex-wrap gap-1">
                        {safeSelected.length > 0 ? (
                            safeSelected.map((val: string) => (
                                <Badge key={val} variant="secondary">
                                    {options.find((o: any) => o.value === val)?.label}
                                    <X className="ml-1 h-3 w-3 cursor-pointer" onClick={(e) => {
                                        e.stopPropagation();
                                        onChange(safeSelected.filter(i => i !== val));
                                    }} />
                                </Badge>
                            ))
                        ) : <span className="text-muted-foreground">{placeholder}</span>}
                    </div>
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandList>
                        <CommandEmpty>No results.</CommandEmpty>
                        <CommandGroup>
                            {options.map((opt: any) => (
                                <CommandItem key={opt.value} onSelect={() => {
                                    onChange(safeSelected.includes(opt.value)
                                        ? safeSelected.filter(s => s !== opt.value)
                                        : [...safeSelected, opt.value])
                                }}>
                                    <Check className={cn("mr-2 h-4 w-4", safeSelected.includes(opt.value) ? "opacity-100" : "opacity-0")} />
                                    {opt.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}