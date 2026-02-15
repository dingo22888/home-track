"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/page-header"
import { ReadingFormDialog } from "@/components/reading-form-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table"
import { Plus, ArrowLeft } from "lucide-react"
import type { Consumer, Reading } from "@/lib/types"
import { formatDate, formatNumber } from "@/lib/format"

export default function ConsumerDetailPage() {
  const params = useParams()
  const consumerId = params.id as string
  const [consumer, setConsumer] = useState<Consumer | null>(null)
  const [readings, setReadings] = useState<Reading[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    const { data: consumerData } = await supabase
      .from("consumers")
      .select("*")
      .eq("id", consumerId)
      .single()

    setConsumer(consumerData)

    const { data: readingsData } = await supabase
      .from("readings")
      .select("*")
      .eq("consumer_id", consumerId)
      .order("reading_date", { ascending: false })

    setReadings(readingsData || [])
    setLoading(false)
  }, [consumerId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const columns: ColumnDef<Reading>[] = [
    {
      accessorKey: "reading_date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.reading_date),
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => (
        <span className="font-mono">
          {formatNumber(row.original.value)} {consumer?.unit}
        </span>
      ),
    },
    {
      id: "consumption",
      header: "Consumption",
      cell: ({ row }) => {
        const idx = readings.indexOf(row.original)
        if (idx < readings.length - 1) {
          const prev = readings[idx + 1]
          const delta = row.original.value - prev.value
          return (
            <span className={`font-mono ${delta < 0 ? "text-destructive" : ""}`}>
              {delta >= 0 ? "+" : ""}
              {formatNumber(delta)} {consumer?.unit}
            </span>
          )
        }
        return <span className="text-muted-foreground">-</span>
      },
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
    data: readings,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!consumer) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Consumer not found" />
        <Button asChild variant="outline">
          <Link href="/consumers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to consumers
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon">
          <Link href="/consumers">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <PageHeader
          title={consumer.name}
          description={`${consumer.type} - ${consumer.unit}`}
          actions={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add reading
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="capitalize">
              {consumer.type}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unit</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="font-mono text-lg">{consumer.unit}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Location</CardTitle>
          </CardHeader>
          <CardContent>
            <span>{consumer.location || "Not specified"}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reading History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {readings.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              No readings yet. Add your first reading.
            </p>
          ) : (
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
          )}
        </CardContent>
      </Card>

      <ReadingFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        consumerId={consumer.id}
        unit={consumer.unit}
        onSuccess={fetchData}
      />
    </div>
  )
}
