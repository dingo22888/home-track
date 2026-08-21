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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { format } from "date-fns"
import { useI18n } from "@/lib/i18n"

interface ReadingFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  consumerId: string
  unit: string
  onSuccess: () => void
}

export function ReadingFormDialog({
  open,
  onOpenChange,
  consumerId,
  unit,
  onSuccess,
}: ReadingFormDialogProps) {
  const { t, language, parseNumber } = useI18n()
  const [value, setValue] = useState("")
  const [readingDate, setReadingDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from("readings").insert({
      consumer_id: consumerId,
      value: parseNumber(value),
      reading_date: readingDate,
      notes: notes || null,
      created_by: user?.id || null,
    })

    if (error) {
      toast.error(error.message)
      setSaving(false)
      return
    }

    toast.success(t("Reading saved"))
    setValue("")
    setReadingDate(format(new Date(), "yyyy-MM-dd"))
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
            <DialogTitle>{t("Add reading")}</DialogTitle>
            <DialogDescription>
              {t("Add a meter reading for this consumer.")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="reading-value">{t("Value")} ({unit})</Label>
              <Input
                id="reading-value"
                type="text"
                inputMode="decimal"
                pattern={language === "de" ? "[0-9.]*[,]?[0-9]*" : "[0-9,]*[.]?[0-9]*"}
                placeholder={language === "de" ? "z. B. 12.345,67" : "e.g. 12,345.67"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="reading-date">{t("Reading date")}</Label>
              <Input
                id="reading-date"
                type="date"
                value={readingDate}
                onChange={(e) => setReadingDate(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="reading-notes">{t("Notes (optional)")}</Label>
              <Textarea
                id="reading-notes"
                placeholder={t("Any notes about this reading...")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? t("Saving...") : t("Save reading")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
