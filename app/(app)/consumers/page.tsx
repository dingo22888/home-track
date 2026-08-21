"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useHousehold } from "@/lib/household-context"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/page-header"
import { ConsumerFormDialog } from "@/components/consumer-form-dialog"
import { Button } from "@/components/ui/button"
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
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table"
import { Plus, Gauge } from "lucide-react"
import type { Consumer } from "@/lib/types"
import { EmptyHouseholdState } from "@/components/empty-household-state"
import { useI18n } from "@/lib/i18n"

function getColumns(t: (source: string) => string): ColumnDef<Consumer>[] {
  return [
  {
    accessorKey: "name",
    header: t("Name"),
    cell: ({ row }) => (
      <Link
        href={`/consumers/${row.original.id}`}
        className="font-medium underline-offset-4 hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "type",
    header: t("Type"),
    cell: ({ row }) => (
      <Badge variant="secondary" className="capitalize">
        {t(row.original.type)}
      </Badge>
    ),
  },
  {
    accessorKey: "unit",
    header: t("Unit"),
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.unit}</span>
    ),
  },
  {
    accessorKey: "location",
    header: t("Location"),
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.location || "-"}
      </span>
    ),
  },
  {
    accessorKey: "is_active",
    header: t("Status"),
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? "default" : "outline"}>
        {t(row.original.is_active ? "Active" : "Inactive")}
      </Badge>
    ),
  },
  ]
}

export default function ConsumersPage() {
  const { t } = useI18n()
  const { activeHousehold, loading: householdLoading } = useHousehold()
  const [consumers, setConsumers] = useState<Consumer[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  async function fetchConsumers() {
    if (!activeHousehold) {
      setConsumers([])
      setLoading(false)
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("consumers")
      .select("*")
      .eq("household_id", activeHousehold.id)
      .order("name")

    setConsumers(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchConsumers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeHousehold])

  const table = useReactTable({
    data: consumers,
    columns: getColumns(t),
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
        title={t("Consumers")}
        description={t("Meters and consumers in {name}", { name: activeHousehold.name })}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("Add consumer")}
          </Button>
        }
      />

      {consumers.length === 0 ? (
        <Card className="text-center">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Gauge className="h-10 w-10 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">{t("No consumers yet")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("Add your first meter or consumer to start tracking.")}
              </p>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("Add consumer")}
            </Button>
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

      <ConsumerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        householdId={activeHousehold.id}
        onSuccess={fetchConsumers}
      />
    </div>
  )
}
