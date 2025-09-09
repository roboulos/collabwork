"use client"

import React, { useState, useEffect } from 'react'
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
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
import { Input } from './ui/input'
import { Checkbox } from './ui/checkbox'
import { Badge } from './ui/badge'
import { xanoService, JobPosting, Community } from '@/lib/xano'
import { Loader2 } from 'lucide-react'
import { createJobsColumns } from './jobs-columns'
import { DataTableToolbar } from './data-table/data-table-toolbar'
import { DataTablePagination } from './data-table/data-table-pagination'
import { cn } from '@/lib/utils'

export function JobTableEnhancedV2() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    location: false,
    employment_type: false,
    is_remote: false,
    salary: false,
    description: false,
  })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'posted_at', desc: true }
  ])
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCommunities, setSelectedCommunities] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null)
  const [editFormData, setEditFormData] = useState({
    custom_company_name: '',
    custom_location: '',
    notes: ''
  })

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
    } catch (error) {
      console.error('Error toggling priority:', error)
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
    } catch (error) {
      console.error('Error removing job from MorningBrew:', error)
      await loadJobs()
    }
  }

  const handleEditJob = (job: JobPosting) => {
    setEditingJob(job)
    setEditFormData({
      custom_company_name: job.custom_company_name || '',
      custom_location: job.custom_location || '',
      notes: job.notes || ''
    })
    setEditModalOpen(true)
  }

  const handleUpdateJob = async () => {
    if (!editingJob) return

    try {
      setSubmitting(true)
      
      // Optimistic update
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === editingJob.id
            ? { ...job, ...editFormData }
            : job
        )
      )
      
      setEditModalOpen(false)
      
      await xanoService.updateJob({
        job_posting_id: editingJob.id.toString(),
        ...editFormData
      })
    } catch (error) {
      console.error('Error updating job:', error)
      await loadJobs()
    } finally {
      setSubmitting(false)
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
                is_priority: job.morningbrew?.is_priority || false
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
    } catch (error) {
      console.error('Error submitting jobs:', error)
      await loadJobs()
    } finally {
      setSubmitting(false)
    }
  }

  const columns = createJobsColumns({
    onTogglePriority: handleTogglePriority,
    onRemoveFromMorningBrew: handleRemoveFromMorningBrew,
    onEditJob: handleEditJob
  })

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
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
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
      <Card>
        <div className="p-4">
          <div className="mb-4">
            <h2 className="text-2xl font-bold tracking-tight">Job Postings</h2>
            <p className="text-muted-foreground">
              Manage and curate job listings for MorningBrew newsletters
            </p>
          </div>
          
          <div className="space-y-4">
            <DataTableToolbar 
              table={table} 
              onAddJobs={handleAddJobs}
              filterColumn="title"
              brandOptions={communities.map(c => ({ 
                value: c.id.toString(), 
                label: c.community_name 
              }))}
            />
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id} colSpan={header.colSpan}>
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
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className={cn(
                          "cursor-pointer transition-colors",
                          row.original.morningbrew?.is_priority && "bg-yellow-50/50 hover:bg-yellow-50",
                          row.original.is_morningbrew && !row.original.morningbrew?.is_priority && "bg-blue-50/30 hover:bg-blue-50/50",
                          !row.original.is_morningbrew && "hover:bg-muted/50"
                        )}
                        onClick={() => row.toggleSelected()}
                      >
                        {row.getVisibleCells().map((cell) => (
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
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
          
          <div className="space-y-4 py-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Select MorningBrew Brands:</h3>
              <div className="space-y-2">
                {communities.map((community) => (
                  <label
                    key={community.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
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
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add to Selected Brands
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Job Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Job Details</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Company Name (Override)</label>
              <Input
                placeholder="Leave empty to use original"
                value={editFormData.custom_company_name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, custom_company_name: e.target.value }))}
              />
              {editingJob && (
                <p className="text-xs text-muted-foreground mt-1">
                  Original: {editingJob.custom_company_name || editingJob.company}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Location (Override)</label>
              <Input
                placeholder="Leave empty to use original"
                value={editFormData.custom_location}
                onChange={(e) => setEditFormData(prev => ({ ...prev, custom_location: e.target.value }))}
              />
              {editingJob && (
                <p className="text-xs text-muted-foreground mt-1">
                  Original: {editingJob.custom_location || 
                    (editingJob.location && editingJob.location[0] ? 
                      `${editingJob.location[0].city || ''}${editingJob.location[0].state ? `, ${editingJob.location[0].state}` : ''}` 
                      : 'Remote')}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Notes</label>
              <textarea
                placeholder="Add any notes about this job..."
                value={editFormData.notes}
                onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full p-2 border rounded-md"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateJob} 
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}