"use client"

import Link from "next/link"
import { Home, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"

export function EmptyHouseholdState() {
  const { t } = useI18n()
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Home className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{t("No household selected")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("Create your first household to start tracking consumption.")}
            </p>
          </div>
          <Button asChild>
            <Link href="/households">
              <Plus className="mr-2 h-4 w-4" />
              {t("Create household")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
