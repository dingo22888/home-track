"use client"

import { useMemo, useState } from "react"
import {
  addDays,
  addMonths,
  addYears,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns"
import { de } from "date-fns/locale"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { formatNumber } from "@/lib/format"

export type ConsumptionInterval = "day" | "week" | "month" | "year"

export interface ConsumptionPoint {
  date: string
  consumption: number
  days: number
  periodDays: number
  estimated: boolean
}

type ReadingLike = { value: number; reading_date: string }

interface ConsumptionChartProps {
  readings?: ReadingLike[]
  data?: ConsumptionPoint[]
  unit: string
  title?: string
  compact?: boolean
  defaultInterval?: ConsumptionInterval
}

const labels: Record<ConsumptionInterval, string> = {
  day: "Tag",
  week: "Woche",
  month: "Monat",
  year: "Jahr",
}

const chartConfig = {
  consumption: { label: "Verbrauch", color: "var(--chart-1)" },
} satisfies ChartConfig

function bucketStart(date: Date, interval: ConsumptionInterval) {
  if (interval === "day") return format(date, "yyyy-MM-dd")
  if (interval === "week") {
    return format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd")
  }
  if (interval === "year") return format(startOfYear(date), "yyyy-MM-dd")
  return format(startOfMonth(date), "yyyy-MM-dd")
}

function bucketLength(date: Date, interval: ConsumptionInterval) {
  if (interval === "day") return 1
  if (interval === "week") return 7
  if (interval === "year") {
    const start = startOfYear(date)
    return differenceInCalendarDays(addYears(start, 1), start)
  }

  const start = startOfMonth(date)
  return differenceInCalendarDays(addMonths(start, 1), start)
}

function formatBucketLabel(date: string, interval: ConsumptionInterval) {
  const parsed = parseISO(date)
  if (interval === "day") return format(parsed, "dd.MM.yy", { locale: de })
  if (interval === "week") return format(parsed, "'KW' II RRRR", { locale: de })
  if (interval === "year") return format(parsed, "yyyy", { locale: de })
  return format(parsed, "MMM yy", { locale: de })
}

/**
 * Turns cumulative meter readings into period totals.
 *
 * Consumption between two readings is known exactly, but its distribution
 * inside that interval is not. If an interval crosses period boundaries, its
 * delta is distributed evenly per calendar day and marked as estimated. The
 * allocated period values always add up to the original meter delta.
 */
export function getConsumptionPoints(
  readings: ReadingLike[],
  interval: ConsumptionInterval = "month"
): ConsumptionPoint[] {
  const sorted = [...readings].sort((a, b) =>
    a.reading_date.localeCompare(b.reading_date)
  )

  const buckets = new Map<
    string,
    { consumption: number; coveredDates: Set<string>; estimated: boolean }
  >()

  for (let i = 1; i < sorted.length; i++) {
    const previous = sorted[i - 1]
    const current = sorted[i]
    const previousDate = parseISO(previous.reading_date)
    const currentDate = parseISO(current.reading_date)
    const days = differenceInCalendarDays(currentDate, previousDate)
    const delta = current.value - previous.value

    // Same-day duplicates cannot be distributed reliably. A negative delta
    // indicates a meter replacement/reset and starts a new sequence.
    if (days <= 0 || delta < 0) continue

    const dailyConsumption = delta / days
    const allocations = new Map<
      string,
      { consumption: number; coveredDates: Set<string> }
    >()

    // Readings are points in time, so [previousDate, currentDate) is allocated.
    // Example: 22 Feb -> 1 Mar represents the seven days 22-28 Feb.
    for (let dayOffset = 0; dayOffset < days; dayOffset++) {
      const date = addDays(previousDate, dayOffset)
      const dateKey = format(date, "yyyy-MM-dd")
      const key = bucketStart(date, interval)
      const allocation = allocations.get(key) ?? {
        consumption: 0,
        coveredDates: new Set<string>(),
      }

      allocation.consumption += dailyConsumption
      allocation.coveredDates.add(dateKey)
      allocations.set(key, allocation)
    }

    const isEstimated = allocations.size > 1

    for (const [key, allocation] of allocations) {
      const bucket = buckets.get(key) ?? {
        consumption: 0,
        coveredDates: new Set<string>(),
        estimated: false,
      }

      bucket.consumption += allocation.consumption
      for (const date of allocation.coveredDates) {
        bucket.coveredDates.add(date)
      }
      bucket.estimated ||= isEstimated
      buckets.set(key, bucket)
    }
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, bucket]) => ({
      date,
      consumption: bucket.consumption,
      days: bucket.coveredDates.size,
      periodDays: bucketLength(parseISO(date), interval),
      estimated: bucket.estimated,
    }))
}

export function getLatestReading(readings: ReadingLike[]) {
  return [...readings].sort((a, b) =>
    b.reading_date.localeCompare(a.reading_date)
  )[0] ?? null
}

export function getTotalConsumption(readings: ReadingLike[]) {
  const sorted = [...readings].sort((a, b) =>
    a.reading_date.localeCompare(b.reading_date)
  )

  return sorted.slice(1).reduce((total, reading, index) => {
    const delta = reading.value - sorted[index].value
    return delta >= 0 ? total + delta : total
  }, 0)
}

export function getConsumptionDelta(
  readings: ReadingLike[],
  reading: ReadingLike
) {
  const previous = [...readings]
    .filter((item) => item.reading_date < reading.reading_date)
    .sort((a, b) => b.reading_date.localeCompare(a.reading_date))[0]

  return previous ? reading.value - previous.value : null
}

export function ConsumptionChart({
  readings,
  data,
  unit,
  title = "Verbrauch über Zeit",
  compact = false,
  defaultInterval = "month",
}: ConsumptionChartProps) {
  const [interval, setInterval] =
    useState<ConsumptionInterval>(defaultInterval)
  const points = useMemo(
    () => data ?? getConsumptionPoints(readings ?? [], interval),
    [data, readings, interval]
  )
  const chartData = points.map((point) => ({
    ...point,
    label: formatBucketLabel(point.date, interval),
  }))
  const containsEstimates = points.some((point) => point.estimated)

  return (
    <Card>
      <CardHeader className={compact ? "pb-2" : undefined}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className={compact ? "text-base" : undefined}>
            {title}
          </CardTitle>
          {!data && (
            <ToggleGroup
              type="single"
              value={interval}
              onValueChange={(value) =>
                value && setInterval(value as ConsumptionInterval)
              }
              size="sm"
              variant="outline"
              aria-label="Verbrauchsintervall"
            >
              {(Object.keys(labels) as ConsumptionInterval[]).map((key) => (
                <ToggleGroupItem key={key} value={key}>
                  {labels[key]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="flex h-56 items-center justify-center text-sm text-muted-foreground">
            Noch nicht genügend Ablesungen für ein Diagramm.
          </p>
        ) : (
          <>
            <ChartContainer
              config={chartConfig}
              className={compact ? "h-48 w-full" : "h-80 w-full"}
            >
              <BarChart
                data={chartData}
                margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={28}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={46}
                  tickFormatter={(value) => formatNumber(Number(value))}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) =>
                        payload?.[0]?.payload?.label ?? ""
                      }
                      formatter={(value, name, item) => {
                        const point = item.payload as ConsumptionPoint
                        const coverage =
                          point.days === point.periodDays
                            ? `${point.days} Tage`
                            : `${point.days} von ${point.periodDays} Tagen, Teilzeitraum`
                        const estimate = point.estimated
                          ? ", zeitanteilig geschätzt"
                          : ""

                        return [
                          `${formatNumber(Number(value))} ${unit}`,
                          `Verbrauch (${coverage}${estimate})`,
                        ]
                      }}
                    />
                  }
                />
                <Bar
                  dataKey="consumption"
                  fill="var(--color-consumption)"
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((point) => (
                    <Cell
                      key={point.date}
                      fillOpacity={point.estimated ? 0.55 : 0.9}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
            {!compact && containsEstimates && (
              <p className="mt-2 text-xs text-muted-foreground">
                Hellere Balken enthalten zeitanteilig verteilte Werte zwischen
                weiter auseinanderliegenden Ablesungen.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export { labels as consumptionIntervalLabels }
