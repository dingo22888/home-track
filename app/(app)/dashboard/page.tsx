"use client"

import { useEffect, useState } from "react"
import { useHousehold } from "@/lib/household-context"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/page-header"
import { DashboardCards } from "@/components/dashboard-cards"
import { LatestReadingsTable } from "@/components/latest-readings-table"
import { ConsumptionChart, getConsumptionPoints } from "@/components/consumption-chart"
import { EmptyHouseholdState } from "@/components/empty-household-state"
import type { Consumer, Reading } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { activeHousehold, loading: householdLoading } = useHousehold()
  const [consumers, setConsumers] = useState<Consumer[]>([])
  const [latestReadings, setLatestReadings] = useState<
    (Reading & { consumer: Consumer })[]
  >([])
  const [readingsByConsumer, setReadingsByConsumer] = useState<Record<string, Reading[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeHousehold) {
      setConsumers([])
      setLatestReadings([])
      setLoading(false)
      return
    }

    async function fetchData() {
      setLoading(true)
      const supabase = createClient()

      // Fetch consumers for active household
      const { data: consumersData } = await supabase
        .from("consumers")
        .select("*")
        .eq("household_id", activeHousehold!.id)
        .eq("is_active", true)
        .order("name")

      setConsumers(consumersData || [])
      const readingsById: Record<string, Reading[]> = {}

      // Fetch latest reading per consumer using distinct on
      if (consumersData && consumersData.length > 0) {
        const consumerIds = consumersData.map((c) => c.id)
        const { data: readingsData } = await supabase
          .from("readings")
          .select("*, consumer:consumers(*)")
          .in("consumer_id", consumerIds)
          .order("consumer_id")
          .order("reading_date", { ascending: false })

        for (const reading of readingsData || []) {
          const list = readingsById[reading.consumer_id] || []
          list.push(reading as Reading)
          readingsById[reading.consumer_id] = list
        }
        setReadingsByConsumer(readingsById)

        // Get latest reading per consumer (client-side dedup)
        const latestMap = new Map<string, Reading & { consumer: Consumer }>()
        for (const r of readingsData || []) {
          if (!latestMap.has(r.consumer_id)) {
            latestMap.set(r.consumer_id, r as Reading & { consumer: Consumer })
          }
        }
        setLatestReadings(Array.from(latestMap.values()))
      } else {
        setLatestReadings([])
        setReadingsByConsumer({})
      }

      setLoading(false)
    }

    fetchData()
  }, [activeHousehold])

  if (householdLoading || loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!activeHousehold) {
    return <EmptyHouseholdState />
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description={activeHousehold.name}
      />
      <DashboardCards
        consumerCount={consumers.length}
        readingCount={latestReadings.length}
      />
      {consumers.length > 0 && (
        <section className="flex flex-col gap-4" aria-labelledby="consumption-overview">
          <div>
            <h2 id="consumption-overview" className="text-lg font-semibold">Consumption overview</h2>
            <p className="text-sm text-muted-foreground">Recent usage for each consumer.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {consumers.map((consumer) => (
              <ConsumptionChart
                key={consumer.id}
                title={consumer.name}
                unit={consumer.unit}
                compact
                data={getConsumptionPoints(readingsByConsumer[consumer.id] || [])}
              />
            ))}
          </div>
        </section>
      )}
      <LatestReadingsTable readings={latestReadings} />
    </div>
  )
}
