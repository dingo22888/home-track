"use client"

import { useEffect, useState } from "react"
import { useHousehold } from "@/lib/household-context"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/page-header"
import { DashboardCards } from "@/components/dashboard-cards"
import { LatestReadingsTable } from "@/components/latest-readings-table"
import { ConsumptionChart } from "@/components/consumption-chart"
import { EmptyHouseholdState } from "@/components/empty-household-state"
import type { Consumer, Reading } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { activeHousehold, loading: householdLoading } = useHousehold()
  const [consumers, setConsumers] = useState<Consumer[]>([])
  const [allReadings, setAllReadings] = useState<Reading[]>([])
  const [latestReadings, setLatestReadings] = useState<
    (Reading & { consumer: Consumer })[]
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeHousehold) {
      setConsumers([])
      setAllReadings([])
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

      // Fetch latest reading per consumer using distinct on
      if (consumersData && consumersData.length > 0) {
        const consumerIds = consumersData.map((c) => c.id)

        // Fetch ALL readings for the chart
        const { data: allReadingsData } = await supabase
          .from("readings")
          .select("*")
          .in("consumer_id", consumerIds)
          .order("reading_date", { ascending: true })

        setAllReadings(allReadingsData || [])

        // Fetch readings with consumer join for the latest-readings table
        const { data: readingsData } = await supabase
          .from("readings")
          .select("*, consumer:consumers(*)")
          .in("consumer_id", consumerIds)
          .order("consumer_id")
          .order("reading_date", { ascending: false })

        // Get latest reading per consumer (client-side dedup)
        const latestMap = new Map<string, Reading & { consumer: Consumer }>()
        for (const r of readingsData || []) {
          if (!latestMap.has(r.consumer_id)) {
            latestMap.set(r.consumer_id, r as Reading & { consumer: Consumer })
          }
        }
        setLatestReadings(Array.from(latestMap.values()))
      } else {
        setAllReadings([])
        setLatestReadings([])
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
      <ConsumptionChart consumers={consumers} readings={allReadings} />
      <LatestReadingsTable readings={latestReadings} />
    </div>
  )
}
