"use client"

import {useEffect, useState, useCallback, useMemo} from "react"
import Link from "next/link"
import { useHousehold } from "@/lib/household-context"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table"
import { ClipboardList } from "lucide-react"
import type { Consumer, Reading } from "@/lib/types"
import { formatDate, formatNumber } from "@/lib/format"
import { EmptyHouseholdState } from "@/components/empty-household-state"

type ReadingWithConsumer = Reading & { consumer: Consumer }

export default function ReadingsPage() {
  const { activeHousehold, loading: householdLoading } = useHousehold()
  const [consumers, setConsumers] = useState<Consumer[]>([])
  const [readings, setReadings] = useState<ReadingWithConsumer[]>([])
  const [selectedConsumerId, setSelectedConsumerId] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!activeHousehold) {
      setConsumers([])
      setReadings([])
      setLoading(false)
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data: consumersData } = await supabase
      .from("consumers")
      .select("*")
      .eq("household_id", activeHousehold.id)
      .order("name")

    setConsumers(consumersData || [])

    if (consumersData && consumersData.length > 0) {
      const consumerIds = consumersData.map((c) => c.id)
      let query = supabase
        .from("readings")
        .select("*, consumer:consumers(*)")
        .in("consumer_id", consumerIds)
        .order("reading_date", { ascending: false })
        .limit(100)

      const { data: readingsData } = await query
      setReadings((readingsData as ReadingWithConsumer[]) || [])
    } else {
      setReadings([])
    }

    setLoading(false)
  }, [activeHousehold])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredReadings = useMemo(() => {
    return selectedConsumerId === "all"
        ? readings
        : readings.filter((r) => r.consumer_id === selectedConsumerId)
  }, [selectedConsumerId, readings])

  const columns: ColumnDef<ReadingWithConsumer>[] = [
    {
      accessorKey: "reading_date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.reading_date),
    },
    {
      accessorKey: "consumer.name",
      header: "Consumer",
      cell: ({ row }) => (
        <Link
          href={`/consumers/${row.original.consumer_id}`}
          className="font-medium underline-offset-4 hover:underline"
        >
          {row.original.consumer.name}
        </Link>
      ),
    },
    {
      accessorKey: "consumer.type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="secondary" className="capitalize">
          {row.original.consumer.type}
        </Badge>
      ),
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => (
        <span className="font-mono">
          {formatNumber(row.original.value)} {row.original.consumer.unit}
        </span>
      ),
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.notes || "-"}
        </span>
      ),
    },
  ]

  const table = useReactTable({
    data: filteredReadings,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (householdLoading || loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
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
        title="Readings"
        description={`All readings for ${activeHousehold.name}`}
        actions={
          <Select value={selectedConsumerId} onValueChange={setSelectedConsumerId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by consumer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All consumers</SelectItem>
              {consumers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {filteredReadings.length === 0 ? (
        <Card className="text-center">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <ClipboardList className="h-10 w-10 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">No readings yet</h3>
              <p className="text-sm text-muted-foreground">
                Add readings from the consumer detail page.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
