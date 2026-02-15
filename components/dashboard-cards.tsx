import { Gauge, ClipboardList, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardCardsProps {
  consumerCount: number
  readingCount: number
}

export function DashboardCards({
  consumerCount,
  readingCount,
}: DashboardCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Active Consumers
          </CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{consumerCount}</div>
          <p className="text-xs text-muted-foreground">
            Tracked in this household
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Latest Readings
          </CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{readingCount}</div>
          <p className="text-xs text-muted-foreground">
            Consumers with readings
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Coverage</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {consumerCount > 0
              ? Math.round((readingCount / consumerCount) * 100)
              : 0}
            %
          </div>
          <p className="text-xs text-muted-foreground">
            Consumers with at least one reading
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
