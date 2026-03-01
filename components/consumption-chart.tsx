"use client"

import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
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
import {
  consumers,
  readings,
  computeConsumption,
  type Consumer,
  type Reading,
} from "@/lib/mock-data"

// ── Resolved colors (CSS vars don't work directly in Recharts) ───────────────

const CHART_COLORS = [
  "oklch(0.646 0.222 41.116)", // chart-1 (warm orange)
  "oklch(0.6 0.118 184.704)",  // chart-2 (teal)
  "oklch(0.398 0.07 227.392)", // chart-3 (deep blue)
  "oklch(0.828 0.189 84.429)", // chart-4 (gold)
  "oklch(0.769 0.188 70.08)",  // chart-5 (amber)
]

function buildChartConfig(consumerList: Consumer[]): ChartConfig {
  const config: ChartConfig = {}
  consumerList.forEach((c, i) => {
    config[c.id] = {
      label: `${c.name} (${c.unit})`,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }
  })
  return config
}

interface ConsumptionChartProps {
  consumerList?: Consumer[]
  readingList?: Reading[]
}

export function ConsumptionChart({
  consumerList = consumers,
  readingList = readings,
}: ConsumptionChartProps) {
  const data = computeConsumption(consumerList, readingList)
  const chartConfig = buildChartConfig(consumerList)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-balance">
          Consumption per Consumer
        </CardTitle>
        <CardDescription>Monthly consumption derived from meter readings</CardDescription>
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
                    const consumer = consumerList.find((c) => c.id === name)
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
            {consumerList.map((consumer, idx) => (
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
