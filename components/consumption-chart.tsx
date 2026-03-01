"use client"

import { useMemo } from "react"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { Consumer, Reading } from "@/lib/types"

// Resolved colors — CSS variables don't work directly in Recharts
const CHART_COLORS = [
  "oklch(0.646 0.222 41.116)",
  "oklch(0.6 0.118 184.704)",
  "oklch(0.398 0.07 227.392)",
  "oklch(0.828 0.189 84.429)",
  "oklch(0.769 0.188 70.08)",
]

interface ConsumptionPoint {
  month: string
  [consumerId: string]: number | string
}

function computeConsumption(
  consumers: Consumer[],
  readings: Reading[]
): ConsumptionPoint[] {
  // Group readings by consumer_id
  const grouped: Record<string, Reading[]> = {}
  for (const r of readings) {
    if (!grouped[r.consumer_id]) grouped[r.consumer_id] = []
    grouped[r.consumer_id].push(r)
  }

  // Sort each group by reading_date ascending
  for (const key of Object.keys(grouped)) {
    grouped[key].sort(
      (a, b) =>
        new Date(a.reading_date).getTime() - new Date(b.reading_date).getTime()
    )
  }

  // Collect all unique months (YYYY-MM) from deltas across all consumers
  const monthSet = new Set<string>()
  for (const consumer of consumers) {
    const consumerReadings = grouped[consumer.id]
    if (!consumerReadings) continue
    for (let i = 1; i < consumerReadings.length; i++) {
      const date = new Date(consumerReadings[i].reading_date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      monthSet.add(key)
    }
  }

  const sortedMonths = Array.from(monthSet).sort()

  return sortedMonths.map((monthKey) => {
    const date = new Date(monthKey + "-01")
    const label = date.toLocaleString("en-US", {
      month: "short",
      year: "2-digit",
    })

    const point: ConsumptionPoint = { month: label }

    for (const consumer of consumers) {
      const consumerReadings = grouped[consumer.id]
      if (!consumerReadings) continue

      // Find the delta that lands on this month
      for (let i = 1; i < consumerReadings.length; i++) {
        const d = new Date(consumerReadings[i].reading_date)
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
        if (k === monthKey) {
          point[consumer.id] =
            consumerReadings[i].value - consumerReadings[i - 1].value
          break
        }
      }
    }

    return point
  })
}

interface ConsumptionChartProps {
  consumers: Consumer[]
  readings: Reading[]
}

export function ConsumptionChart({
  consumers,
  readings,
}: ConsumptionChartProps) {
  const data = useMemo(
    () => computeConsumption(consumers, readings),
    [consumers, readings]
  )

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {}
    consumers.forEach((c, i) => {
      config[c.id] = {
        label: `${c.name} (${c.unit})`,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }
    })
    return config
  }, [consumers])

  if (consumers.length === 0 || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-balance">
            Consumption per Consumer
          </CardTitle>
          <CardDescription>
            Monthly consumption derived from meter readings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm py-8 text-center">
            Not enough readings to show consumption. Add at least two readings per consumer.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-balance">
          Consumption per Consumer
        </CardTitle>
        <CardDescription>
          Monthly consumption derived from meter readings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <LineChart
            data={data}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    const consumer = consumers.find((c) => c.id === name)
                    return (
                      <span>
                        {Number(value).toLocaleString()} {consumer?.unit ?? ""}
                      </span>
                    )
                  }}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            {consumers.map((consumer, idx) => (
              <Line
                key={consumer.id}
                type="monotone"
                dataKey={consumer.id}
                name={consumer.id}
                stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
