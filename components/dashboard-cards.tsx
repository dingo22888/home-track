"use client"

import { Gauge, ClipboardList, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"

interface DashboardCardsProps {
  consumerCount: number
  readingCount: number
}

export function DashboardCards({
  consumerCount,
  readingCount,
}: DashboardCardsProps) {
  const { t, formatNumber } = useI18n()
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {t("Active Consumers")}
          </CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(consumerCount, 0)}</div>
          <p className="text-xs text-muted-foreground">
            {t("Tracked in this household")}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {t("Latest Readings")}
          </CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(readingCount, 0)}</div>
          <p className="text-xs text-muted-foreground">
            {t("Consumers with readings")}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{t("Coverage")}</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(consumerCount > 0
              ? Math.round((readingCount / consumerCount) * 100)
              : 0, 0)}
            %
          </div>
          <p className="text-xs text-muted-foreground">
            {t("Consumers with at least one reading")}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
