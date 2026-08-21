"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import type { ConsumerType } from "@/lib/types"
import { useI18n } from "@/lib/i18n"

const CONSUMER_TYPES: { value: ConsumerType; label: string; defaultUnit: string }[] = [
  { value: "electricity", label: "Electricity", defaultUnit: "kWh" },
  { value: "gas", label: "Gas", defaultUnit: "m\u00B3" },
  { value: "water", label: "Water", defaultUnit: "m\u00B3" },
  { value: "custom", label: "Custom", defaultUnit: "" },
]

interface ConsumerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  householdId: string
  onSuccess: () => void
}

export function ConsumerFormDialog({
  open,
  onOpenChange,
  householdId,
  onSuccess,
}: ConsumerFormDialogProps) {
  const { t } = useI18n()
  const [name, setName] = useState("")
  const [type, setType] = useState<ConsumerType>("electricity")
  const [unit, setUnit] = useState("kWh")
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  function handleTypeChange(value: ConsumerType) {
    setType(value)
    const found = CONSUMER_TYPES.find((t) => t.value === value)
    if (found && found.defaultUnit) {
      setUnit(found.defaultUnit)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()
    const { error } = await supabase.from("consumers").insert({
      household_id: householdId,
      name,
      type,
      unit,
      location: location || null,
      notes: notes || null,
    })

    if (error) {
      toast.error(error.message)
      setSaving(false)
      return
    }

    toast.success(t("Consumer created"))
    setName("")
    setType("electricity")
    setUnit("kWh")
    setLocation("")
    setNotes("")
    setSaving(false)
    onOpenChange(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("Add consumer")}</DialogTitle>
            <DialogDescription>
              {t("Add a new meter or consumer to track.")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="consumer-name">{t("Name")}</Label>
              <Input
                id="consumer-name"
                placeholder={t("e.g. Kitchen Electricity Meter")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="consumer-type">{t("Type")}</Label>
                <Select value={type} onValueChange={(v) => handleTypeChange(v as ConsumerType)}>
                  <SelectTrigger id="consumer-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONSUMER_TYPES.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {t(item.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="consumer-unit">{t("Unit")}</Label>
                <Input
                  id="consumer-unit"
                  placeholder={t("e.g. kWh")}
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="consumer-location">{t("Location (optional)")}</Label>
              <Input
                id="consumer-location"
                placeholder={t("e.g. Basement")}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="consumer-notes">{t("Notes (optional)")}</Label>
              <Textarea
                id="consumer-notes"
                placeholder={t("Any additional notes...")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? t("Saving...") : t("Add consumer")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
