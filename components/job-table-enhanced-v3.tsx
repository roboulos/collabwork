"use client"

import React, { useState, useEffect } from 'react'
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
import { xanoService, JobPosting, Community, UpdateJobPayload } from '@/lib/xano'
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
    loadCommunities()
  }, [])

  useEffect(() => {
    loadJobs()
  }, [showMorningBrewOnly]) // Reload when toggle changes

  const loadCommunities = async () => {
    try {
      const response = await xanoService.getCommunities()
      setCommunities(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('Error loading communities:', error)
      setToast({ message: 'Failed to load communities', type: 'error' })
      // Set some default communities to prevent empty state
      setCommunities([])
    }
  }

  const loadJobs = async (retryCount = 0) => {
    try {
      setLoading(true)
      if (showMorningBrewOnly) {
        // Load Morning Brew curated jobs
        const response = await xanoService.listMorningBrewJobs(1, '', 100)
        // Transform the data to match our JobPosting interface
        const transformedJobs = (response.items || []).map((mbJob: {
          id: number;
          job_posting_id: number;
          company?: string;
          title?: string;
          location?: Array<{
            city?: string;
            state?: string;
            country?: string;
          }>;
          status?: string;
          click_count?: number;
          community_ids?: number[];
          formatted_title?: string;
          is_source_deleted?: boolean;
          job_posting?: JobPosting;
          cached_feed_source?: string;
          cached_payment_type?: string;
          cached_posted_at?: number;
          cached_cpc?: number;
          cached_cpa?: number;
          created_at?: number;
        }) => {
          // Use job_posting data as base, then override with MB-specific data
          const baseJob = mbJob.job_posting || {} as JobPosting;
          
          // Preserve feed source data when source is deleted
          const feedSource = mbJob.is_source_deleted && mbJob.cached_feed_source
            ? { partner_name: mbJob.cached_feed_source, payment_type: mbJob.cached_payment_type || '' }
            : baseJob.single_partner || { partner_name: '', payment_type: '' };
          
          // Preserve posted date when source is deleted  
          const postedAt = mbJob.is_source_deleted && mbJob.cached_posted_at
            ? mbJob.cached_posted_at
            : baseJob.posted_at || mbJob.created_at || Date.now();

          return {
            // Spread all job_posting fields first
            ...baseJob,
            // Then override with MB-specific fields
            id: mbJob.job_posting_id,
            company: mbJob.company || baseJob.company || '',
            title: mbJob.title || baseJob.title || '',
            ai_title: mbJob.formatted_title || baseJob.ai_title || baseJob.title || '',
            location: mbJob.location || baseJob.location || [],
            is_morningbrew: true,
            // Use preserved feed source data
            single_partner: feedSource,
            cpc: mbJob.cached_cpc !== undefined ? mbJob.cached_cpc : (baseJob.cpc || 0),
            cpa: mbJob.cached_cpa !== undefined ? mbJob.cached_cpa : (baseJob.cpa || 0),
            posted_at: postedAt,
            morningbrew: {
              id: mbJob.id,
              status: mbJob.status || 'suggested',
              click_count: mbJob.click_count || 0,
              community_ids: (mbJob.community_ids || []).map((id: number) => ({
                id: id,
                community_name: communities.find(c => c.id === id)?.community_name || `Brand ${id}`
              })),
              formatted_title: mbJob.formatted_title,
              is_source_deleted: mbJob.is_source_deleted || false
            }
          }
        })
        setJobs(transformedJobs)
      } else {
        // Load all jobs from feeds
        const response = await xanoService.listJobs(0)
        setJobs(response.items || [])
      }
    } catch (error: unknown) {
      console.error('Error loading jobs:', error)
      
      // Retry once on 500 errors
      const axiosError = error as { response?: { status?: number } }
      if (axiosError?.response?.status === 500 && retryCount < 1) {
        console.log('Retrying API call...')
        setTimeout(() => loadJobs(retryCount + 1), 1000)
        return
      }
      
      setToast({ message: 'Failed to load jobs. Please refresh the page.', type: 'error' })
      setJobs([])
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

  const handleRemoveFromCommunity = async (jobId: number, communityId: number) => {
    // Find the job and check how many communities it has
    const job = jobs.find(j => j.id === jobId)
    if (!job || !job.morningbrew) return
    
    const currentCommunities = job.morningbrew.community_ids || []
    const communityName = currentCommunities.find(c => c.id === communityId)?.community_name || 'community'
    
    // If this is the last community, show a friendly message
    if (currentCommunities.length === 1) {
      setToast({ 
        message: `Can't remove last community. Use the X button to remove from Morning Brew entirely.`, 
        type: 'error' 
      })
      return
    }
    
    try {
      await xanoService.removeJobFromCommunity(jobId, communityId)
      setToast({ message: `Removed from ${communityName}`, type: 'success' })
      await loadJobs()
    } catch (error) {
      console.error('API ERROR:', error)
      setToast({ message: 'Failed to remove from community', type: 'error' })
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
                formatted_title: editValue
              } : undefined
            }
          } else if (editingCell.field === 'company') {
            return { ...j, custom_company_name: editValue }
          } else if (editingCell.field === 'location') {
            return { ...j, custom_location: editValue }
          } else if (editingCell.field === 'employment_type') {
            return {
              ...j,
              morningbrew: j.morningbrew ? {
                ...j.morningbrew,
                custom_employment_type: editValue
              } : undefined
            }
          } else if (editingCell.field === 'is_remote') {
            return {
              ...j,
              morningbrew: j.morningbrew ? {
                ...j.morningbrew,
                custom_is_remote: editValue
              } : undefined
            }
          }
        }
        return j
      })
    )

    try {
      // For title field, use the existing brew/update-details endpoint
      if (editingCell.field === 'title') {
        await xanoService.updateJobField(
          editingCell.jobId,
          'formatted_title',
          editValue
        )
      } else {
        // Check if job has morningbrew record for employment_type and is_remote fields
        if ((editingCell.field === 'employment_type' || editingCell.field === 'is_remote') && !job.is_morningbrew) {
          setToast({ message: 'Please add this job to Morning Brew first before editing this field', type: 'error' })
          setEditingCell(null)
          setEditValue('')
          return
        }

        // For all other fields, use ashley/update-job endpoint
        const updatePayload: UpdateJobPayload = {
          job_posting_id: editingCell.jobId.toString()
        }

        if (editingCell.field === 'company') {
          updatePayload.custom_company_name = editValue
        } else if (editingCell.field === 'location') {
          updatePayload.custom_location = editValue
        } else if (editingCell.field === 'employment_type') {
          updatePayload.custom_employment_type = editValue
        } else if (editingCell.field === 'is_remote') {
          updatePayload.custom_is_remote = editValue
        }

        await xanoService.updateJob(updatePayload)
      }
      
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
    const title = job.morningbrew?.formatted_title || job.ai_title || job.title
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
    } catch {
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
    onRemoveFromCommunity: handleRemoveFromCommunity,
    onCopyJob: handleCopyJobText,
    onStartEdit: handleStartEdit,
    editingCell,
    editValue,
    setEditValue,
    onSaveEdit: handleSaveEdit,
    onCancelEdit: handleCancelEdit
  }), [editingCell, editValue])

  const table = useReactTable({
    data: jobs,
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
      
      <Card className={cn(
        "shadow-lg backdrop-blur-sm border",
        showMorningBrewOnly 
          ? "bg-gradient-to-br from-amber-50/95 via-white/95 to-orange-50/95 dark:from-amber-900/20 dark:via-gray-900/90 dark:to-orange-900/20 border-amber-200 dark:border-amber-800"
          : "bg-white/90 dark:bg-gray-900/90 border-gray-200 dark:border-gray-800"
      )}>
        <div className="p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  {showMorningBrewOnly && (
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
                      <span className="text-white text-xl font-bold">☕</span>
                    </div>
                  )}
                  <h2 className="text-2xl font-bold tracking-tight">
                    {showMorningBrewOnly ? 'Morning Brew Curated Jobs' : 'All Job Postings'}
                  </h2>
                </div>
                <p className={cn(
                  "text-sm mt-1",
                  showMorningBrewOnly ? "text-amber-700 dark:text-amber-300" : "text-muted-foreground"
                )}>
                  {showMorningBrewOnly 
                    ? `${jobs.length} handpicked opportunities for Morning Brew readers`
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
              feedOptions={(() => {
                const feedSources = new Set<string>()
                jobs.forEach(job => {
                  const partnerName = job.single_partner?.partner_name
                  const paymentType = (job.cpa || 0) > 0 ? 'CPA' : 'CPC'
                  if (partnerName) {
                    feedSources.add(`${partnerName} ${paymentType}`)
                  }
                })
                return Array.from(feedSources).map(feed => ({
                  value: feed,
                  label: feed
                })).sort((a, b) => a.label.localeCompare(b.label))
              })()}
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
            
            <div className={cn(
              "rounded-lg border shadow-sm overflow-hidden relative",
              showMorningBrewOnly
                ? "border-amber-200 dark:border-amber-800 bg-white/95 dark:bg-gray-800/95"
                : "border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
            )}>
              {isToggling && (
                <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 z-50 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
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
                          // Priority: Enhanced with Morning Brew golden accent
                          row.original.morningbrew?.is_priority && showMorningBrewOnly && [
                            "border-l-4 border-l-gradient-to-b from-amber-400 to-orange-500",
                            "bg-gradient-to-r from-amber-50/40 via-orange-50/20 to-transparent",
                            "hover:from-amber-100/50 hover:via-orange-100/30 dark:from-amber-500/10 dark:hover:from-amber-500/15",
                            "shadow-[inset_0_1px_0_0_rgba(251,191,36,0.1)]"
                          ],
                          
                          // Priority in regular view
                          row.original.morningbrew?.is_priority && !showMorningBrewOnly &&
                            "border-l-2 border-l-amber-500 bg-gradient-to-r from-amber-50/20 to-transparent hover:from-amber-50/40 dark:from-amber-500/5 dark:hover:from-amber-500/10",
                          
                          // MorningBrew (non-priority): More prominent in MB view
                          row.original.is_morningbrew && !row.original.morningbrew?.is_priority && showMorningBrewOnly && [
                            "bg-gradient-to-r from-amber-50/20 to-transparent",
                            "hover:from-amber-50/35 hover:to-orange-50/10",
                            "dark:from-amber-400/5 dark:to-transparent dark:hover:from-amber-400/8"
                          ],
                          
                          // MorningBrew in regular view
                          row.original.is_morningbrew && !row.original.morningbrew?.is_priority && !showMorningBrewOnly &&
                            "bg-gradient-to-r from-sky-50/25 to-sky-50/15 hover:from-sky-50/40 hover:to-sky-50/30 dark:from-sky-400/5 dark:to-transparent dark:hover:from-sky-400/10",
                          
                          // Default hover
                          !row.original.is_morningbrew &&
                            "hover:bg-accent/30 dark:hover:bg-accent/20",
                          
                          // Enhanced selection with gradient and ring
                          row.getIsSelected() && [
                            showMorningBrewOnly 
                              ? "bg-gradient-to-r from-amber-100/30 to-transparent dark:from-amber-500/20 dark:to-transparent"
                              : "bg-gradient-to-r from-primary/10 to-transparent dark:from-primary/15 dark:to-transparent",
                            showMorningBrewOnly 
                              ? "ring-1 ring-amber-400/40 ring-inset"
                              : "ring-1 ring-primary/40 ring-inset",
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