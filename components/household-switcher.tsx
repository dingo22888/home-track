"use client"

import { ChevronsUpDown, Check } from "lucide-react"
import { useHousehold } from "@/lib/household-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function HouseholdSwitcher() {
  const { households, activeHousehold, setActiveHouseholdId, loading } =
    useHousehold()

  if (loading) {
    return (
      <Button variant="outline" className="w-full justify-start" disabled>
        <span className="text-muted-foreground">Loading...</span>
      </Button>
    )
  }

  if (households.length === 0) {
    return (
      <Button variant="outline" className="w-full justify-start" disabled>
        <span className="text-muted-foreground">No households</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          role="combobox"
        >
          <span className="truncate">
            {activeHousehold?.name || "Select household"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {households.map((h) => (
          <DropdownMenuItem
            key={h.id}
            onSelect={() => setActiveHouseholdId(h.id)}
            className="flex items-center justify-between"
          >
            <span className="truncate">{h.name}</span>
            {activeHousehold?.id === h.id && (
              <Check className="h-4 w-4 shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
