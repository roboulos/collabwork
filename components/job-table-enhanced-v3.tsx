"use client"

import React, { useState, useEffect, useMemo } from 'react'
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  ColumnSizingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
} from "@tanstack/react-table"
import { Card } from './ui/card'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { xanoService, JobPosting, Community } from '@/lib/xano'
import { Loader2 } from 'lucide-react'
import { TableSkeleton } from './ui/skeleton'
import { createJobsColumnsV4 } from './jobs-columns-v4'
import { DataTableToolbar } from './data-table/data-table-toolbar'
import { DataTablePagination } from './data-table/data-table-pagination'
import { cn } from '@/lib/utils'
import { Toast } from './ui/toast'

export function JobTableEnhancedV3() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [rowSelection, setRowSelection] = useState({})
  const [showMorningBrewOnly, setShowMorningBrewOnly] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    location: false,
    employment_type: false,
    is_remote: false,
    salary: false,
    description: false,
    cpc: true,
    cpa: true,
    feed_source: true,
    mb_status: true,
    clicks: true,
    payment_source: false,
    post_source: false,
    morningbrew_brands: true,
  })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({})
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'posted_at', desc: true }
  ])
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCommunities, setSelectedCommunities] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  // Toast state
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null)
  
  // Inline editing state
  const [editingCell, setEditingCell] = useState<{jobId: number; field: string} | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    loadJobs()
    loadCommunities()
  }, [])

  const loadCommunities = async () => {
    try {
      const response = await xanoService.getCommunities()
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

  const handleTogglePriority = async (jobId: number, currentPriority: boolean) => {
    // Optimistic update
    setJobs(prevJobs => 
      prevJobs.map(job => {
        if (job.id === jobId && job.morningbrew) {
          return {
            ...job,
            morningbrew: {
              ...job.morningbrew,
              is_priority: !currentPriority
            }
          }
        }
        return job
      })
    )

    try {
      await xanoService.addJobPriority({
        job_posting_id: jobId.toString(),
        community_ids: [],
        notes: '',
        is_priority: !currentPriority,
        priority_reason: !currentPriority ? 'Marked as priority by user' : ''
      })
      setToast({ message: 'Priority updated', type: 'success' })
    } catch (error) {
      console.error('Error toggling priority:', error)
      setToast({ message: 'Failed to update priority', type: 'error' })
      await loadJobs()
    }
  }

  const handleRemoveFromMorningBrew = async (jobId: number) => {
    // Optimistic update
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === jobId 
          ? { ...job, is_morningbrew: false, morningbrew: undefined }
          : job
      )
    )

    try {
      await xanoService.removeJob(jobId.toString())
      setToast({ message: 'Job removed from MorningBrew', type: 'success' })
    } catch (error) {
      console.error('Error removing job from MorningBrew:', error)
      setToast({ message: 'Failed to remove job', type: 'error' })
      await loadJobs()
    }
  }

  const handleStartEdit = (jobId: number, field: string, currentValue: string) => {
    setEditingCell({ jobId, field })
    setEditValue(currentValue || '')
  }

  const handleSaveEdit = async () => {
    if (!editingCell) return

    const job = jobs.find(j => j.id === editingCell.jobId)
    if (!job) return

    // Optimistic update
    setJobs(prevJobs =>
      prevJobs.map(j => {
        if (j.id === editingCell.jobId) {
          if (editingCell.field === 'title') {
            return {
              ...j,
              morningbrew: j.morningbrew ? {
                ...j.morningbrew,
                cached_job_title: editValue
              } : undefined
            }
          } else if (editingCell.field === 'company') {
            return { ...j, custom_company_name: editValue }
          } else if (editingCell.field === 'location') {
            return { ...j, custom_location: editValue }
          }
        }
        return j
      })
    )

    try {
      const updateData: Record<string, string> = {}
      if (editingCell.field === 'company') {
        updateData.custom_company_name = editValue
      } else if (editingCell.field === 'location') {
        updateData.custom_location = editValue
      } else if (editingCell.field === 'title') {
        // You'll need to add an endpoint for updating cached_job_title
        updateData.cached_job_title = editValue
      }

      await xanoService.updateJob({
        job_posting_id: editingCell.jobId.toString(),
        ...updateData
      })
      
      setToast({ message: 'Job updated successfully', type: 'success' })
    } catch (error) {
      console.error('Error updating job:', error)
      setToast({ message: 'Failed to update job', type: 'error' })
      await loadJobs()
    } finally {
      setEditingCell(null)
      setEditValue('')
    }
  }

  const handleCancelEdit = () => {
    setEditingCell(null)
    setEditValue('')
  }

  const handleCopyJobText = async (job: JobPosting) => {
    const title = job.morningbrew?.cached_job_title || job.ai_title || job.title
    const company = job.custom_company_name || job.company
    const location = job.custom_location || 
      (job.location && job.location[0] ? 
        `${job.location[0].city || ''}${job.location[0].state ? `, ${job.location[0].state}` : ''}` 
        : 'Remote')
    const remote = job.is_remote ? ' (Remote)' : ' (On-site)'
    
    const formattedText = `${title} at ${company} - ${location}${remote}`
    
    try {
      await navigator.clipboard.writeText(formattedText)
      setToast({ message: 'Copied to clipboard', type: 'success' })
    } catch (err) {
      setToast({ message: 'Failed to copy', type: 'error' })
    }
  }

  const handleAddJobs = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    if (selectedRows.length === 0) return
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      const communityIds = Array.from(selectedCommunities).map(id => parseInt(id))
      const selectedRows = table.getFilteredSelectedRowModel().rows
      const selectedJobIds = selectedRows.map(row => row.original.id.toString())
      
      // Optimistic update
      const selectedCommunityDetails = communities.filter(c => 
        selectedCommunities.has(c.id.toString())
      )
      
      setJobs(prevJobs => 
        prevJobs.map(job => {
          if (selectedJobIds.includes(job.id.toString())) {
            return {
              ...job,
              is_morningbrew: true,
              morningbrew: {
                community_ids: selectedCommunityDetails.map(c => ({
                  id: c.id,
                  community_name: c.community_name
                })),
                is_priority: job.morningbrew?.is_priority || false,
                status: 'suggested',
                click_count: 0
              }
            }
          }
          return job
        })
      )
      
      // Close modal and reset
      setModalOpen(false)
      setRowSelection({})
      setSelectedCommunities(new Set())
      setNotes('')
      
      // Make API calls
      for (const jobId of selectedJobIds) {
        await xanoService.addJobPriority({
          job_posting_id: jobId,
          community_ids: communityIds,
          notes,
          is_priority: false,
          priority_reason: ''
        })
      }
      
      setToast({ message: `Added ${selectedJobIds.length} jobs to MorningBrew`, type: 'success' })
    } catch (error) {
      console.error('Error submitting jobs:', error)
      setToast({ message: 'Failed to add jobs', type: 'error' })
      await loadJobs()
    } finally {
      setSubmitting(false)
    }
  }

  const columns = React.useMemo(() => createJobsColumnsV4({
    onTogglePriority: handleTogglePriority,
    onRemoveFromMorningBrew: handleRemoveFromMorningBrew,
    onCopyJob: handleCopyJobText,
    onStartEdit: handleStartEdit,
    editingCell,
    editValue,
    setEditValue,
    onSaveEdit: handleSaveEdit,
    onCancelEdit: handleCancelEdit
  }), [editingCell, editValue])

  // Filter jobs based on Morning Brew view toggle
  const filteredJobs = useMemo(() => {
    if (showMorningBrewOnly) {
      return jobs.filter(job => job.is_morningbrew === true)
    }
    return jobs
  }, [jobs, showMorningBrewOnly])

  const table = useReactTable({
    data: filteredJobs,
    columns,
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      columnSizing,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    columnResizeMode: 'onEnd' as const,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  if (loading) {
    return (
      <Card className="shadow-sm border-border/60">
        <div className="p-4">
          <div className="mb-4 animate-fade-in">
            <h2 className="text-2xl font-bold tracking-tight">Job Postings</h2>
            <p className="text-muted-foreground">
              Manage and curate job listings for MorningBrew newsletters
            </p>
          </div>
          <TableSkeleton rows={8} />
        </div>
      </Card>
    )
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <Card className="shadow-lg backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800">
        <div className="p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {showMorningBrewOnly ? 'Morning Brew Curated Jobs' : 'All Job Postings'}
                </h2>
                <p className="text-muted-foreground">
                  {showMorningBrewOnly 
                    ? `Viewing ${filteredJobs.length} jobs curated for Morning Brew`
                    : `Manage and curate job listings from ${jobs.length} available positions`
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <DataTableToolbar 
              table={table} 
              onAddJobs={handleAddJobs}
              filterColumn="ai_title"
              brandOptions={communities.map(c => ({ 
                value: c.id.toString(), 
                label: c.community_name 
              }))}
              showMorningBrewOnly={showMorningBrewOnly}
              onToggleMorningBrewView={async (value) => {
                setIsToggling(true)
                setRowSelection({}) // Reset selection when toggling
                // Use setTimeout to allow UI to update
                setTimeout(() => {
                  setShowMorningBrewOnly(value)
                  setIsToggling(false)
                }, 0)
              }}
            />
            
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm overflow-hidden relative">
              {isToggling && (
                <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 z-50 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              <div className="max-h-[calc(100vh-300px)] overflow-auto">
                <Table>
                  <TableHeader className="bg-white/90 dark:bg-gray-800/90 sticky top-0 z-10 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead 
                            key={`${headerGroup.id}_${header.id}`} 
                            colSpan={header.colSpan}
                            style={{ width: header.getSize() }}
                            className="relative"
                          >
                            {header.isPlaceholder
                              ? null
                              : (
                                <>
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                                  {header.column.getCanResize() && (
                                    <div
                                      onMouseDown={header.getResizeHandler()}
                                      onTouchStart={header.getResizeHandler()}
                                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-primary/20 hover:w-2 transition-all"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  )}
                                </>
                              )}
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody className="divide-y divide-border/50">
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        onClick={(e) => {
                          const target = e.target as HTMLElement
                          const isButton = target.closest('button')
                          const isLink = target.closest('a')
                          const isCheckbox = target.closest('input[type="checkbox"]')
                          const isInput = target.closest('input[type="text"]')
                          
                          if (!isButton && !isLink && !isCheckbox && !isInput) {
                            row.toggleSelected()
                          }
                        }}
                        className={cn(
                          "group cursor-pointer transition-all duration-200",
                          // Priority: subtle left accent instead of full gradient
                          row.original.morningbrew?.is_priority &&
                            "border-l-2 border-l-amber-500 bg-gradient-to-r from-amber-50/20 to-transparent hover:from-amber-50/40 dark:from-amber-500/5 dark:hover:from-amber-500/10",
                          
                          // MorningBrew (non-priority): subtle dot indicator
                          row.original.is_morningbrew && !row.original.morningbrew?.is_priority &&
                            "bg-gradient-to-r from-sky-50/25 to-sky-50/15 hover:from-sky-50/40 hover:to-sky-50/30 dark:from-sky-400/5 dark:to-transparent dark:hover:from-sky-400/10",
                          
                          // Default hover
                          !row.original.is_morningbrew &&
                            "hover:bg-accent/30 dark:hover:bg-accent/20",
                          
                          // Enhanced selection with gradient and ring
                          row.getIsSelected() && [
                            "bg-gradient-to-r from-primary/10 to-transparent dark:from-primary/15 dark:to-transparent",
                            "ring-1 ring-primary/40 ring-inset",
                            "shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]"
                          ]
                        )}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={`${row.id}_${cell.column.id}`}>
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
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                </Table>
              </div>
            </div>
            
            <DataTablePagination table={table} />
          </div>
        </div>
      </Card>

      {/* Add Jobs Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Jobs to MorningBrew</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Select MorningBrew Brands:</h3>
              <div className="space-y-2.5">
                {communities.map((community) => (
                  <label
                    key={community.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-accent p-2 rounded-md transition-colors duration-150"
                  >
                    <Checkbox
                      checked={selectedCommunities.has(community.id.toString())}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCommunities(prev => new Set(prev).add(community.id.toString()))
                        } else {
                          setSelectedCommunities(prev => {
                            const newSet = new Set(prev)
                            newSet.delete(community.id.toString())
                            return newSet
                          })
                        }
                      }}
                    />
                    <span>{community.community_name}</span>
                  </label>
                ))}
              </div>
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
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add to Selected Brands
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}