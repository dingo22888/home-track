"use client"

import { useMemo, useState } from "react"
import { format, parseISO, differenceInCalendarDays, startOfWeek, startOfMonth, startOfYear } from "date-fns"
import { de } from "date-fns/locale"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { formatNumber } from "@/lib/format"

export type ConsumptionInterval = "day" | "week" | "month" | "year"
export interface ConsumptionPoint { date: string; consumption: number; days: number }
type ReadingLike = { value: number; reading_date: string }
interface ConsumptionChartProps { readings?: ReadingLike[]; data?: ConsumptionPoint[]; unit: string; title?: string; compact?: boolean; defaultInterval?: ConsumptionInterval }

const labels: Record<ConsumptionInterval, string> = { day: "Tag", week: "Woche", month: "Monat", year: "Jahr" }
const chartConfig = { consumption: { label: "Verbrauch", color: "var(--chart-1)" } } satisfies ChartConfig

function bucketStart(date: Date, interval: ConsumptionInterval) {
  if (interval === "day") return format(date, "yyyy-MM-dd")
  if (interval === "week") return format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd")
  if (interval === "year") return format(startOfYear(date), "yyyy-MM-dd")
  return format(startOfMonth(date), "yyyy-MM-dd")
}

export function getConsumptionPoints(readings: ReadingLike[], interval: ConsumptionInterval = "month"): ConsumptionPoint[] {
  const sorted = [...readings].sort((a, b) => a.reading_date.localeCompare(b.reading_date))
  const buckets = new Map<string, number>()
  for (let i = 1; i < sorted.length; i++) {
    const previous = sorted[i - 1]
    const current = sorted[i]
    const delta = current.value - previous.value
    const days = Math.max(1, differenceInCalendarDays(parseISO(current.reading_date), parseISO(previous.reading_date)))
    if (delta < 0) continue
    const normalized = delta / days
    const multiplier = interval === "day" ? 1 : interval === "week" ? 7 : interval === "month" ? 30.4375 : 365.25
    const key = bucketStart(parseISO(current.reading_date), interval)
    buckets.set(key, (buckets.get(key) ?? 0) + normalized * multiplier)
  }
  return [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, consumption]) => ({ date, consumption, days: interval === "day" ? 1 : interval === "week" ? 7 : interval === "month" ? 30 : 365 }))
}

export function getLatestReading(readings: ReadingLike[]) { return [...readings].sort((a, b) => b.reading_date.localeCompare(a.reading_date))[0] ?? null }
export function getTotalConsumption(readings: ReadingLike[]) { return getConsumptionPoints(readings).reduce((sum, point) => sum + point.consumption, 0) }
export function getConsumptionDelta(readings: ReadingLike[], reading: ReadingLike) { const previous = [...readings].filter((item) => item.reading_date < reading.reading_date).sort((a, b) => b.reading_date.localeCompare(a.reading_date))[0]; return previous ? reading.value - previous.value : null }

export function ConsumptionChart({ readings, data, unit, title = "Verbrauch über Zeit", compact = false, defaultInterval = "month" }: ConsumptionChartProps) {
  const [interval, setInterval] = useState<ConsumptionInterval>(defaultInterval)
  const points = useMemo(() => data ?? getConsumptionPoints(readings ?? [], interval), [data, readings, interval])
  const chartData = points.map((point) => ({ ...point, label: format(parseISO(point.date), interval === "year" ? "yyyy" : interval === "day" ? "dd.MM." : "MMM yy", { locale: de }) }))

  return <Card>
    <CardHeader className={compact ? "pb-2" : undefined}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle className={compact ? "text-base" : undefined}>{title}</CardTitle>
        {!data && <ToggleGroup type="single" value={interval} onValueChange={(value) => value && setInterval(value as ConsumptionInterval)} size="sm" variant="outline" aria-label="Verbrauchsintervall">
          {(Object.keys(labels) as ConsumptionInterval[]).map((key) => <ToggleGroupItem key={key} value={key}>{labels[key]}</ToggleGroupItem>)}
        </ToggleGroup>}
      </div>
    </CardHeader>
    <CardContent>
      {chartData.length === 0 ? <p className="flex h-56 items-center justify-center text-sm text-muted-foreground">Noch nicht genügend Ablesungen für ein Diagramm.</p> : <ChartContainer config={chartConfig} className={compact ? "h-48 w-full" : "h-80 w-full"}>
        <AreaChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
          <defs><linearGradient id="consumption-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-consumption)" stopOpacity={0.3} /><stop offset="95%" stopColor="var(--color-consumption)" stopOpacity={0.02} /></linearGradient></defs>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={28} />
          <YAxis tickLine={false} axisLine={false} width={46} tickFormatter={(value) => formatNumber(Number(value))} />
          <ChartTooltip content={<ChartTooltipContent labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ""} formatter={(value, name, item) => [`${formatNumber(Number(value))} ${unit}`, `Verbrauch (${item.payload.days} Tage)`]} />} />
          <Area type="monotone" dataKey="consumption" stroke="var(--color-consumption)" fill="url(#consumption-fill)" strokeWidth={2} />
        </AreaChart>
      </ChartContainer>}
    </CardContent>
  </Card>
}

export { labels as consumptionIntervalLabels }
