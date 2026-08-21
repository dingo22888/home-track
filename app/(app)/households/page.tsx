"use client"

import { useState } from "react"
import { useHousehold } from "@/lib/household-context"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, MapPin, Users } from "lucide-react"
import { toast } from "sonner"
import { useI18n } from "@/lib/i18n"

export default function HouseholdsPage() {
  const { t } = useI18n()
  const {
    households,
    memberships,
    activeHousehold,
    setActiveHouseholdId,
    loading,
    refresh,
  } = useHousehold()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [creating, setCreating] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)

    const supabase = createClient()

    // Atomically create the household and the owner membership via a
    // security-definer function to satisfy RLS on both tables.
    const { data: householdId, error } = await supabase.rpc(
      "create_household_with_owner",
      {
        p_name: name,
        p_address: address || null,
      },
    )

    if (error) {
      toast.error(error.message)
      setCreating(false)
      return
    }

    toast.success(t("Household created"))
    setName("")
    setAddress("")
    setOpen(false)
    setCreating(false)
    await refresh()
    if (householdId) {
      setActiveHouseholdId(householdId as string)
    }
  }

  function getRoleForHousehold(householdId: string) {
    return memberships.find((m) => m.household_id === householdId)?.role || "member"
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("Households")}
        description={t("Manage your households")}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("New household")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>{t("Create household")}</DialogTitle>
                  <DialogDescription>
                    {t("Add a new household to start tracking consumption.")}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="household-name">{t("Name")}</Label>
                    <Input
                      id="household-name"
                      placeholder={t("e.g. Main Apartment")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="household-address">
                      {t("Address (optional)")}
                    </Label>
                    <Input
                      id="household-address"
                      placeholder={t("e.g. 123 Main St")}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={creating}>
                    {creating ? t("Creating...") : t("Create")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {households.length === 0 ? (
        <Card className="text-center">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Users className="h-10 w-10 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">{t("No households yet")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("Create your first household to get started.")}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {households.map((h) => (
            <Card
              key={h.id}
              className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                activeHousehold?.id === h.id
                  ? "border-primary ring-1 ring-primary"
                  : ""
              }`}
              onClick={() => setActiveHouseholdId(h.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{h.name}</CardTitle>
                  <Badge variant="outline" className="capitalize">
                    {t(getRoleForHousehold(h.id))}
                  </Badge>
                </div>
                {h.address && (
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {h.address}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {activeHousehold?.id === h.id && (
                  <Badge className="text-xs">{t("Active")}</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
