"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import "../../styles/table-theme.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { Plus, Coffee } from 'lucide-react'
import { Switch } from "@/components/ui/switch"

interface Props<TData> {
  table: Table<TData>
  onAddJobs?: () => void
  filterColumn?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  onSearchSubmit?: (value: string) => void
  brandOptions?: Array<{ value: string; label: string }>
  feedOptions?: Array<{ value: string; label: string }>
  showMorningBrewOnly?: boolean
  onToggleMorningBrewView?: (value: boolean) => void
  totalItems?: number
}

export function DataTableToolbar<TData>({ 
  table, 
  onAddJobs,
  filterColumn = "title",
  searchValue,
  onSearchChange,
  onSearchSubmit,
  brandOptions = [],
  feedOptions = [],
  showMorningBrewOnly = false,
  onToggleMorningBrewView,
  totalItems
}: Props<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-2">
          <Input
            placeholder="Search positions... (Press Enter)"
            value={searchValue ?? (table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              // Update the input value without triggering search
              if (onSearchChange) {
                onSearchChange(event.target.value);
              } else {
                table.getColumn(filterColumn)?.setFilterValue(event.target.value);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                // Trigger the actual search on Enter
                if (onSearchSubmit) {
                  onSearchSubmit(event.currentTarget.value);
                } else if (onSearchChange) {
                  // Fallback for compatibility
                  onSearchChange(event.currentTarget.value);
                }
              }
            }}
            className="h-10 w-full sm:w-[150px] lg:w-[250px]"
          />
          {table.getColumn("morningbrew_brands") && brandOptions.length > 0 && (
            <DataTableFacetedFilter
              column={table.getColumn("morningbrew_brands")}
              title="Morning Brew Brands"
              options={brandOptions}
            />
          )}
          {table.getColumn("feed_source") && feedOptions.length > 0 && (
            <DataTableFacetedFilter
              column={table.getColumn("feed_source")}
              title="Feed Source"
              options={feedOptions}
            />
          )}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-10 px-4"
            >
              Reset
              <Cross2Icon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {/* Record count display */}
          {totalItems !== undefined && (
            <span className="text-sm text-muted-foreground flex-shrink-0 min-w-[100px]">
              {new Intl.NumberFormat().format(totalItems)} records
            </span>
          )}
          
          {onToggleMorningBrewView && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {!showMorningBrewOnly && (
                <span className="view-indicator ashley-view">
                  <Coffee className="h-4 w-4" />
                  Ashley View
                </span>
              )}
              <Switch
                id="mb-view"
                checked={showMorningBrewOnly}
                onCheckedChange={onToggleMorningBrewView}
                className="view-toggle"
                thumbClassName="view-toggle-thumb"
                data-state={showMorningBrewOnly ? "checked" : "unchecked"}
              />
              {showMorningBrewOnly && (
                <span className="view-indicator morningbrew-view">
                  <Coffee className="h-4 w-4" />
                  Morning Brew View
                </span>
              )}
            </div>
          )}
          {onAddJobs && (
            <Button 
              onClick={onAddJobs}
              disabled={!table.getFilteredSelectedRowModel().rows.length}
              size="default"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add to Morning Brew
            </Button>
          )}
          <DataTableViewOptions table={table} />
        </div>
      </div>
    </div>
  )
}