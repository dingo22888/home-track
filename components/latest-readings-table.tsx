"use client"

import Link from "next/link"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Consumer, Reading } from "@/lib/types"
import { formatDate } from "@/lib/format"

type ReadingWithConsumer = Reading & { consumer: Consumer }

const columns: ColumnDef<ReadingWithConsumer>[] = [
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
        {row.original.value} {row.original.consumer.unit}
      </span>
    ),
  },
  {
    accessorKey: "reading_date",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.reading_date),
  },
]

interface LatestReadingsTableProps {
  readings: ReadingWithConsumer[]
}

export function LatestReadingsTable({ readings }: LatestReadingsTableProps) {
  const table = useReactTable({
    data: readings,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Readings</CardTitle>
      </CardHeader>
      <CardContent>
        {readings.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No readings yet. Add your first reading to get started.
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
  )
}
