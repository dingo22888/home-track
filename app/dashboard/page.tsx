import { ConsumptionChart } from "@/components/consumption-chart"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h2>
        <p className="text-sm text-muted-foreground">
          Overview of household consumption across all meters.
        </p>
      </div>
      <ConsumptionChart />
    </div>
  )
}
