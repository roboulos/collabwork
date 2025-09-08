"use client"

import React, { useState, useEffect } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Checkbox } from './ui/checkbox'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Card, CardHeader } from './ui/card'
import { xanoService, JobPosting, Community } from '@/lib/xano'
import { Loader2, Plus, Star, ChevronLeft, ChevronRight, Search, ArrowUpDown, Settings2, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export function JobTableEnhanced() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCommunities, setSelectedCommunities] = useState<Set<string>>(new Set())
  const [isRecommended, setIsRecommended] = useState(false)
  const [notes, setNotes] = useState('')
  const [priorityReason, setPriorityReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadJobs()
    loadCommunities()
  }, [])

  const loadCommunities = async () => {
    try {
      const response = await xanoService.getCommunities()
      console.log('Communities response:', response)
      setCommunities(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('Error loading communities:', error)
    }
  }

  const loadJobs = async () => {
    try {
      setLoading(true)
      const response = await xanoService.listJobs(0)
      setJobs(response.items || [])
    } catch (error) {
      console.error('Error loading jobs:', error)
    } finally {
      setLoading(false)
    }
  }


  const handleOpenModal = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    if (selectedRows.length === 0) {
      alert('Please select at least one job')
      return
    }
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      const communityIds = Array.from(selectedCommunities).map(id => parseInt(id))
      const selectedRows = table.getFilteredSelectedRowModel().rows
      
      for (const row of selectedRows) {
        const jobId = row.original.id.toString()
        await xanoService.addJobPriority({
          job_posting_id: jobId,
          community_ids: communityIds,
          notes,
          is_priority: isRecommended,
          priority_reason: isRecommended ? priorityReason : ''
        })
      }
      
      setModalOpen(false)
      table.toggleAllRowsSelected(false)
      setSelectedCommunities(new Set())
      setIsRecommended(false)
      setNotes('')
      setPriorityReason('')
      
      await loadJobs()
    } catch (error) {
      console.error('Error submitting jobs:', error)
      alert('Error submitting jobs. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCommunityToggle = (communityId: string) => {
    const newSelection = new Set(selectedCommunities)
    if (newSelection.has(communityId)) {
      newSelection.delete(communityId)
    } else {
      newSelection.add(communityId)
    }
    setSelectedCommunities(newSelection)
  }

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase()
    const company = (job.custom_company_name || job.company || '').toLowerCase()
    const title = (job.title || '').toLowerCase()
    const location = job.custom_location || 
      (job.location && job.location[0] ? 
        `${job.location[0].city || ''} ${job.location[0].state || ''} ${job.location[0].country || ''}` 
        : 'Remote')
    
    return company.includes(query) || 
           title.includes(query) || 
           location.toLowerCase().includes(query)
  })


  const columns: ColumnDef<JobPosting>[] = [
    {
      id: 'select',
      size: 50,
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'company',
      accessorFn: (row) => row.custom_company_name || row.company || '',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Company
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row, getValue }) => {
        const company = getValue() as string
        const job = row.original
        return (
          <div className="space-y-1">
            <div className="font-medium">{company}</div>
            <div className="sm:hidden text-sm text-muted-foreground">{job.title}</div>
          </div>
        )
      },
      size: 200,
      minSize: 150,
    },
    {
      id: 'position',
      accessorFn: (row) => row.title || '',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Position
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      size: 250,
      minSize: 150,
    },
    {
      id: 'location',
      accessorFn: (row) => {
        return row.custom_location || 
          (row.location && row.location[0] ? 
            `${row.location[0].city || ''}${row.location[0].state ? `, ${row.location[0].state}` : ''}${row.location[0].country ? `, ${row.location[0].country}` : ''}` 
            : 'Remote')
      },
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Location
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      size: 200,
      minSize: 100,
    },
    {
      id: 'salary',
      accessorFn: (row) => row.salary_min || 0,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Salary
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const job = row.original
        if (job.salary_min && job.salary_max) {
          return (
            <span className="text-sm">
              ${job.salary_min.toLocaleString()}-${job.salary_max.toLocaleString()} {job.salary_period?.toLowerCase()}
            </span>
          )
        }
        return <span className="text-sm text-muted-foreground">Not specified</span>
      },
      size: 180,
      minSize: 150,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const job = row.original
        return (
          <div className="space-y-1 text-right">
            {job.is_morningbrew === true && job.morningbrew && (
              <div className="flex flex-wrap gap-1 justify-end">
                {job.morningbrew.community_ids.map(c => (
                  <Badge key={c.id} variant="secondary" className="text-xs">
                    {c.community_name}
                  </Badge>
                ))}
              </div>
            )}
            {job.is_priority === true && (
              <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Recommended
              </Badge>
            )}
          </div>
        )
      },
      size: 200,
      minSize: 150,
      enableSorting: false,
    },
  ]

  const table = useReactTable({
    data: filteredJobs,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Card className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm border-b mb-4">
        <CardHeader className="py-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center justify-between sm:justify-start gap-3 flex-wrap sm:flex-nowrap">
                <h2 className="text-lg font-semibold whitespace-nowrap">Job Postings</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-normal text-xs">
                    {filteredJobs.length} jobs
                  </Badge>
                  <Badge 
                    variant="default" 
                    className={`font-normal text-xs transition-opacity ${
                      Object.keys(rowSelection).length > 0 ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {Object.keys(rowSelection).length || 0} selected
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1 sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by company, position, or location..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full h-9"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Settings2 className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-2">Columns</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[150px]">
                      <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {table
                        .getAllColumns()
                        .filter(
                          (column) =>
                            typeof column.accessorFn !== "undefined" &&
                            column.getCanHide() &&
                            column.id !== 'select'
                        )
                        .map((column) => {
                          return (
                            <DropdownMenuCheckboxItem
                              key={column.id}
                              className="capitalize"
                              checked={column.getIsVisible()}
                              onCheckedChange={(value) =>
                                column.toggleVisibility(!!value)
                              }
                            >
                              {column.id}
                            </DropdownMenuCheckboxItem>
                          )
                        })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => table.toggleAllRowsSelected(false)}
                    disabled={table.getFilteredSelectedRowModel().rows.length === 0}
                    className="hidden lg:inline-flex h-9 whitespace-nowrap"
                  >
                    Clear selection
                  </Button>
                  <Button 
                    onClick={handleOpenModal} 
                    disabled={table.getFilteredSelectedRowModel().rows.length === 0}
                    size="sm"
                    className="h-9 whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Add to MorningBrew</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
      </Card>
      
      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow 
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`${
                      row.original.is_morningbrew === true 
                        ? 'bg-yellow-50 hover:bg-yellow-100' 
                        : ''
                    }`}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <p className="text-muted-foreground">
                      {searchQuery ? `No jobs found matching "${searchQuery}"` : 'No jobs found'}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex items-center justify-between px-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 w-[70px]">
                    {table.getState().pagination.pageSize}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {[10, 20, 30, 40, 50, 100].map((pageSize) => (
                    <DropdownMenuItem
                      key={pageSize}
                      onClick={() => table.setPageSize(Number(pageSize))}
                    >
                      {pageSize}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronLeft className="h-4 w-4" />
                <ChevronLeft className="h-4 w-4 -ml-2" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronRight className="h-4 w-4" />
                <ChevronRight className="h-4 w-4 -ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Jobs to MorningBrew</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Select MorningBrew Brands:</h3>
              <div className="space-y-2">
                {communities.length > 0 ? (
                  communities.map((community) => (
                    <label
                      key={community.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <Checkbox
                        checked={selectedCommunities.has(community.id.toString())}
                        onCheckedChange={() => handleCommunityToggle(community.id.toString())}
                      />
                      <span>{community.community_name}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Loading communities...</p>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={isRecommended}
                  onCheckedChange={(checked) => setIsRecommended(!!checked)}
                />
                <span className="font-medium">Mark as Recommended</span>
              </label>
              
              {isRecommended && (
                <textarea
                  placeholder="Why is this recommended?"
                  value={priorityReason}
                  onChange={(e) => setPriorityReason(e.target.value)}
                  className="mt-2 w-full p-2 border rounded-md"
                  rows={2}
                />
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Notes (optional)</label>
              <textarea
                placeholder="Add any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border rounded-md"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={selectedCommunities.size === 0 || submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add to Selected Brands
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}