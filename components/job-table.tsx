"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Checkbox } from './ui/checkbox'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Card, CardHeader } from './ui/card'
import { xanoService, JobPosting, Community } from '@/lib/xano'
import { Loader2, Plus, Star, ChevronLeft, ChevronRight, Search } from 'lucide-react'

export function JobTable() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCommunities, setSelectedCommunities] = useState<Set<string>>(new Set())
  const [isRecommended, setIsRecommended] = useState(false)
  const [notes, setNotes] = useState('')
  const [priorityReason, setPriorityReason] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const loadCommunities = useCallback(async () => {
    try {
      const response = await xanoService.getCommunities()
      console.log('Communities response:', response)
      setCommunities(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('Error loading communities:', error)
    }
  }, [])

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true)
      const response = await xanoService.listJobs(page)
      setJobs(response.items || [])
      setTotalPages(response.pageTotal || 1)
    } catch (error) {
      console.error('Error loading jobs:', error)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    loadJobs()
    loadCommunities()
  }, [page, loadJobs, loadCommunities])


  const handleJobSelection = (jobId: number) => {
    const jobIdStr = jobId.toString()
    const newSelection = new Set(selectedJobs)
    if (newSelection.has(jobIdStr)) {
      newSelection.delete(jobIdStr)
    } else {
      newSelection.add(jobIdStr)
    }
    setSelectedJobs(newSelection)
  }

  const handleSelectAll = () => {
    const allFilteredJobIds = filteredJobs.map(job => job.id.toString())
    const allSelected = allFilteredJobIds.every(id => selectedJobs.has(id))
    
    if (allSelected) {
      // Deselect all filtered jobs
      const newSelection = new Set(selectedJobs)
      allFilteredJobIds.forEach(id => newSelection.delete(id))
      setSelectedJobs(newSelection)
    } else {
      // Select all filtered jobs
      const newSelection = new Set(selectedJobs)
      allFilteredJobIds.forEach(id => newSelection.add(id))
      setSelectedJobs(newSelection)
    }
  }

  const handleOpenModal = () => {
    if (selectedJobs.size === 0) {
      alert('Please select at least one job')
      return
    }
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      const communityIds = Array.from(selectedCommunities).map(id => parseInt(id))
      
      for (const jobId of selectedJobs) {
        await xanoService.addJobPriority({
          job_posting_id: jobId,
          community_ids: communityIds,
          notes,
          is_priority: isRecommended,
          priority_reason: isRecommended ? priorityReason : ''
        })
      }
      
      setModalOpen(false)
      setSelectedJobs(new Set())
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


  if (loading && page === 0) {
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
                      selectedJobs.size > 0 ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {selectedJobs.size || 0} selected
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedJobs(new Set())}
                    disabled={selectedJobs.size === 0}
                    className="hidden lg:inline-flex h-9 whitespace-nowrap"
                  >
                    Clear selection
                  </Button>
                  <Button 
                    onClick={handleOpenModal} 
                    disabled={selectedJobs.size === 0}
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={filteredJobs.length > 0 && filteredJobs.every(job => selectedJobs.has(job.id.toString()))}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="hidden sm:table-cell">Position</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="hidden lg:table-cell">Salary</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {filteredJobs.map((job) => (
              <TableRow 
                key={job.id} 
                className={`cursor-pointer ${
                  job.is_morningbrew === true 
                    ? 'bg-yellow-50 hover:bg-yellow-100' 
                    : selectedJobs.has(job.id.toString()) 
                      ? 'bg-green-50 hover:bg-green-100' 
                      : ''
                }`}
                onClick={() => handleJobSelection(job.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedJobs.has(job.id.toString())}
                    onCheckedChange={() => handleJobSelection(job.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div className="space-y-1">
                    <div>{job.custom_company_name || job.company}</div>
                    <div className="sm:hidden text-sm text-muted-foreground">{job.title}</div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{job.title}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {job.custom_location || (job.location && job.location[0] ? 
                    `${job.location[0].city || ''}${job.location[0].state ? `, ${job.location[0].state}` : ''}${job.location[0].country ? `, ${job.location[0].country}` : ''}` 
                    : 'Remote')}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {job.salary_min && job.salary_max ? (
                    <span className="text-sm">
                      ${job.salary_min.toLocaleString()}-${job.salary_max.toLocaleString()} {job.salary_period?.toLowerCase()}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not specified</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="space-y-1">
                    {job.is_morningbrew === true && job.morningbrew && (
                      <div className="flex flex-wrap gap-1">
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
                </TableCell>
              </TableRow>
            ))}
            {filteredJobs.length === 0 && !loading && (
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
        
        <div className="p-4 border-t">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">{page}</span>
                <span className="text-sm text-muted-foreground">of</span>
                <span className="text-sm font-medium">{totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
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