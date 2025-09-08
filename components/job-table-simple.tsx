"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Checkbox } from './ui/checkbox'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Card, CardHeader } from './ui/card'
import { xanoService, JobPosting, Community } from '@/lib/xano'
import { Loader2, Plus, Star, Search, ArrowUpDown, ArrowUp, ArrowDown, Settings2, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

type SortConfig = {
  key: keyof JobPosting | 'company' | 'position' | 'location' | 'salary'
  direction: 'asc' | 'desc'
}

type ColumnVisibility = {
  company: boolean
  position: boolean
  location: boolean
  salary: boolean
  status: boolean
}

export function JobTableSimple() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCommunities, setSelectedCommunities] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    company: true,
    position: true,
    location: true,
    salary: true,
    status: true,
  })

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

  const handleJobSelection = (jobId: string) => {
    setSelectedJobIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(jobId)) {
        newSet.delete(jobId)
      } else {
        newSet.add(jobId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedJobIds.size === filteredAndSortedJobs.length && filteredAndSortedJobs.length > 0) {
      setSelectedJobIds(new Set())
    } else {
      const allIds = new Set(filteredAndSortedJobs.map(job => job.id.toString()))
      setSelectedJobIds(allIds)
    }
  }

  const handleOpenModal = () => {
    if (selectedJobIds.size === 0) {
      alert('Please select at least one job')
      return
    }
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      const communityIds = Array.from(selectedCommunities).map(id => parseInt(id))
      const selectedCommunityDetails = communities.filter(c => 
        selectedCommunities.has(c.id.toString())
      )
      
      // Optimistically update the UI
      const jobIdsToUpdate = Array.from(selectedJobIds)
      setJobs(prevJobs => 
        prevJobs.map(job => {
          if (jobIdsToUpdate.includes(job.id.toString())) {
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
      
      // Close modal and reset state immediately
      setModalOpen(false)
      setSelectedJobIds(new Set())
      setSelectedCommunities(new Set())
      setNotes('')
      
      // Make API calls in the background
      for (const jobId of jobIdsToUpdate) {
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
      alert('Error submitting jobs. Please try again.')
      // Revert the optimistic update on error
      await loadJobs()
    } finally {
      setSubmitting(false)
    }
  }

  const handleCommunityToggle = (communityId: string) => {
    setSelectedCommunities(prev => {
      const newSet = new Set(prev)
      if (newSet.has(communityId)) {
        newSet.delete(communityId)
      } else {
        newSet.add(communityId)
      }
      return newSet
    })
  }

  const handleRemoveFromMorningBrew = async (jobId: number) => {
    // Optimistically update the UI
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
      alert('Error removing job from MorningBrew. Please try again.')
      // Revert the optimistic update on error
      await loadJobs()
    }
  }

  const handleTogglePriority = async (jobId: number, currentPriority: boolean) => {
    // Optimistically update the UI
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
      // Call the API to toggle priority
      await xanoService.addJobPriority({
        job_posting_id: jobId.toString(),
        community_ids: [],
        notes: '',
        is_priority: !currentPriority,
        priority_reason: !currentPriority ? 'Marked as priority by user' : ''
      })
    } catch (error) {
      console.error('Error toggling priority:', error)
      alert('Error updating job priority. Please try again.')
      // Revert the optimistic update on error
      await loadJobs()
    }
  }

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return prev.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null
      }
      return { key, direction: 'asc' }
    })
  }

  const toggleColumn = (column: keyof ColumnVisibility) => {
    setColumnVisibility(prev => ({
      ...prev,
      [column]: !prev[column]
    }))
  }

  // Filter and sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs.filter(job => {
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

    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: string | number | null | undefined
        let bVal: string | number | null | undefined

        switch (sortConfig.key) {
          case 'company':
            aVal = a.custom_company_name || a.company || ''
            bVal = b.custom_company_name || b.company || ''
            break
          case 'position':
            aVal = a.title || ''
            bVal = b.title || ''
            break
          case 'location':
            aVal = a.custom_location || (a.location?.[0]?.city || 'Remote')
            bVal = b.custom_location || (b.location?.[0]?.city || 'Remote')
            break
          case 'salary':
            aVal = a.salary_min || 0
            bVal = b.salary_min || 0
            break
          default:
            return 0
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [jobs, searchQuery, sortConfig])

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
                    {filteredAndSortedJobs.length} jobs
                  </Badge>
                  <Badge 
                    variant="default" 
                    className={`font-normal text-xs transition-opacity ${
                      selectedJobIds.size > 0 ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {selectedJobIds.size} selected
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
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                      {Object.entries(columnVisibility).map(([key, visible]) => (
                        <DropdownMenuCheckboxItem
                          key={key}
                          className="capitalize"
                          checked={visible}
                          onCheckedChange={() => toggleColumn(key as keyof ColumnVisibility)}
                        >
                          {key}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedJobIds(new Set())}
                    disabled={selectedJobIds.size === 0}
                    className="hidden lg:inline-flex h-9 whitespace-nowrap"
                  >
                    Clear selection
                  </Button>
                  <Button 
                    onClick={handleOpenModal} 
                    disabled={selectedJobIds.size === 0}
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
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedJobIds.size === filteredAndSortedJobs.length && filteredAndSortedJobs.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                {columnVisibility.company && (
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('company')}
                      className="h-auto p-0 font-medium"
                    >
                      Company
                      {sortConfig?.key === 'company' ? (
                        sortConfig.direction === 'asc' ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                      )}
                    </Button>
                  </TableHead>
                )}
                {columnVisibility.position && (
                  <TableHead className="hidden sm:table-cell">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('position')}
                      className="h-auto p-0 font-medium"
                    >
                      Position
                      {sortConfig?.key === 'position' ? (
                        sortConfig.direction === 'asc' ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                      )}
                    </Button>
                  </TableHead>
                )}
                {columnVisibility.location && (
                  <TableHead className="hidden md:table-cell">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('location')}
                      className="h-auto p-0 font-medium"
                    >
                      Location
                      {sortConfig?.key === 'location' ? (
                        sortConfig.direction === 'asc' ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                      )}
                    </Button>
                  </TableHead>
                )}
                {columnVisibility.salary && (
                  <TableHead className="hidden lg:table-cell">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('salary')}
                      className="h-auto p-0 font-medium"
                    >
                      Salary
                      {sortConfig?.key === 'salary' ? (
                        sortConfig.direction === 'asc' ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                      )}
                    </Button>
                  </TableHead>
                )}
                {columnVisibility.status && (
                  <TableHead className="text-right">Status</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedJobs.map((job) => (
                <TableRow 
                  key={job.id}
                  className={`cursor-pointer group ${
                    job.is_morningbrew === true 
                      ? 'bg-yellow-50 hover:bg-yellow-100' 
                      : selectedJobIds.has(job.id.toString())
                      ? 'bg-green-50 hover:bg-green-100'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleJobSelection(job.id.toString())}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedJobIds.has(job.id.toString())}
                      onCheckedChange={() => handleJobSelection(job.id.toString())}
                    />
                  </TableCell>
                  {columnVisibility.company && (
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div>{job.custom_company_name || job.company}</div>
                        <div className="sm:hidden text-sm text-muted-foreground">{job.title}</div>
                      </div>
                    </TableCell>
                  )}
                  {columnVisibility.position && (
                    <TableCell className="hidden sm:table-cell">{job.title}</TableCell>
                  )}
                  {columnVisibility.location && (
                    <TableCell className="hidden md:table-cell">
                      {job.custom_location || (job.location && job.location[0] ? 
                        `${job.location[0].city || ''}${job.location[0].state ? `, ${job.location[0].state}` : ''}${job.location[0].country ? `, ${job.location[0].country}` : ''}` 
                        : 'Remote')}
                    </TableCell>
                  )}
                  {columnVisibility.salary && (
                    <TableCell className="hidden lg:table-cell">
                      {job.salary_min && job.salary_max ? (
                        <span className="text-sm">
                          ${job.salary_min.toLocaleString()}-${job.salary_max.toLocaleString()} {job.salary_period?.toLowerCase()}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not specified</span>
                      )}
                    </TableCell>
                  )}
                  {columnVisibility.status && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {job.is_morningbrew === true && (
                          <>
                            <div className="flex flex-wrap gap-1">
                              {job.morningbrew && job.morningbrew.community_ids.map(c => (
                                <Badge key={c.id} variant="secondary" className="text-xs">
                                  {c.community_name}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-7 w-7 p-0 ${
                                  job.morningbrew?.is_priority ? '' : 'opacity-0 group-hover:opacity-100'
                                } transition-opacity`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleTogglePriority(job.id, job.morningbrew?.is_priority || false)
                                }}
                                title={job.morningbrew?.is_priority ? "Remove priority" : "Mark as priority"}
                              >
                                <Star 
                                  className={`h-4 w-4 ${
                                    job.morningbrew?.is_priority ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'
                                  }`}
                                />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveFromMorningBrew(job.id)
                                }}
                                title="Remove from MorningBrew"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filteredAndSortedJobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <p className="text-muted-foreground">
                      {searchQuery ? `No jobs found matching "${searchQuery}"` : 'No jobs found'}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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