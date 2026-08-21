"use client"

import { format, parseISO } from "date-fns"
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatNumber } from "@/lib/format"

export interface ConsumptionPoint {
  date: string
  consumption: number
}

interface ConsumptionChartProps {
  data: ConsumptionPoint[]
  unit: string
  title?: string
  compact?: boolean
}

const chartConfig = {
  consumption: {
    label: "Consumption",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ConsumptionChart({
  data,
  unit,
  title = "Consumption",
  compact = false,
}: ConsumptionChartProps) {
  const chartData = data.map((point) => ({
    ...point,
    label: format(parseISO(point.date), "MMM d"),
  }))

  return (
    <Card>
      <CardHeader className={compact ? "pb-2" : undefined}>
        <CardTitle className={compact ? "text-base" : undefined}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length < 1 ? (
          <div className="flex h-48 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
            Add at least two readings to see consumption.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className={compact ? "h-48 w-full" : "h-72 w-full"}>
            <LineChart accessibilityLayer data={chartData} margin={{ left: 8, right: 12, top: 8, bottom: 4 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} width={48} tickFormatter={(value) => formatNumber(Number(value))} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent labelFormatter={(_, payload) => payload?.[0]?.payload?.label} formatter={(value) => [`${formatNumber(Number(value))} ${unit}`, "Consumption"]} />}
              />
              <Line dataKey="consumption" type="monotone" stroke="var(--color-consumption)" strokeWidth={2} dot={{ r: compact ? 2 : 3 }} activeDot={{ r: 5 }} connectNulls />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

export function getConsumptionPoints(readings: { value: number; reading_date: string }[]): ConsumptionPoint[] {
  const sorted = [...readings].sort((a, b) => a.reading_date.localeCompare(b.reading_date))
  return sorted.slice(1).flatMap((reading, index) => {
    const previous = sorted[index]
    const consumption = reading.value - previous.value
    return consumption >= 0 ? [{ date: reading.reading_date, consumption }] : []
  })
}

export function getLatestReading(readings: { value: number; reading_date: string }[]) {
  return [...readings].sort((a, b) => b.reading_date.localeCompare(a.reading_date))[0] ?? null
}

export function getTotalConsumption(readings: { value: number; reading_date: string }[]) {
  return getConsumptionPoints(readings).reduce((total, point) => total + point.consumption, 0)
}

export function getConsumptionDelta(readings: { value: number; reading_date: string }[], reading: { value: number; reading_date: string }) {
  const previous = [...readings]
    .filter((item) => item.reading_date < reading.reading_date)
    .sort((a, b) => b.reading_date.localeCompare(a.reading_date))[0]
  return previous ? reading.value - previous.value : null
}
