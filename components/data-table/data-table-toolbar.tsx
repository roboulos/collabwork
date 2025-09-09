"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { Plus } from 'lucide-react'

interface Props<TData> {
  table: Table<TData>
  onAddJobs?: () => void
  filterColumn?: string
  brandOptions?: Array<{ value: string; label: string }>
}

export function DataTableToolbar<TData>({ 
  table, 
  onAddJobs,
  filterColumn = "title",
  brandOptions = []
}: Props<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-2">
          <Input
            placeholder="Search positions..."
            value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(filterColumn)?.setFilterValue(event.target.value)
            }
            className="h-8 w-full sm:w-[150px] lg:w-[250px]"
          />
          {table.getColumn("morningbrew_brands") && brandOptions.length > 0 && (
            <DataTableFacetedFilter
              column={table.getColumn("morningbrew_brands")}
              title="MorningBrew Brands"
              options={brandOptions}
            />
          )}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <Cross2Icon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {onAddJobs && (
            <Button 
              onClick={onAddJobs}
              disabled={!table.getFilteredSelectedRowModel().rows.length}
              size="sm"
              className="h-8"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add to MorningBrew
            </Button>
          )}
          <DataTableViewOptions table={table} />
        </div>
      </div>
    </div>
  )
}