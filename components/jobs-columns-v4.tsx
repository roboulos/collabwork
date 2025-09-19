"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { JobPosting } from "@/lib/xano"
import { DataTableColumnHeader } from "./data-table/data-table-column-header"
import { Star, X, Copy, ExternalLink, Check, XIcon, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface JobsColumnsProps {
  onTogglePriority: (jobId: number, currentPriority: boolean) => void
  onRemoveFromMorningBrew: (jobId: number) => void
  onRemoveFromCommunity?: (jobId: number, communityId: number) => void
  onCopyJob: (job: JobPosting) => void
  onStartEdit: (jobId: number, field: string, currentValue: string) => void
  editingCell: { jobId: number; field: string } | null
  editValue: string
  setEditValue: (value: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
}

// Helper components for feed source and MB status badges
const FeedSourceBadge = ({ partnerName, paymentType }: { partnerName?: string, paymentType?: string }) => {
  if (!partnerName) return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800">
      <span className="text-xs text-gray-500">No Feed Source</span>
    </div>
  );
  
  // Display as "Appcast CPA" or "Appcast CPC" as per PRD
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
      paymentType === 'CPA' 
        ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800' 
        : 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800'
    )}>
      <span className="text-gray-700 dark:text-gray-300">{partnerName}</span>
      <span className={cn(
        "font-bold",
        paymentType === 'CPA' 
          ? 'text-green-700 dark:text-green-400' 
          : 'text-blue-700 dark:text-blue-400'
      )}>
        {paymentType || ''}
      </span>
    </div>
  );
};

const MBStatusBadge = ({ status }: { status?: string }) => {
  if (!status) return null;
  
  const statusConfig: Record<string, { 
    label: string; 
    className: string;
  }> = {
    suggested: { 
      label: 'Suggested', 
      className: 'bg-blue-500 text-white border-blue-600' 
    },
    approved: { 
      label: 'Approved', 
      className: 'bg-green-500 text-white border-green-600' 
    },
    published: { 
      label: 'Published', 
      className: 'bg-purple-500 text-white border-purple-600' 
    },
    rejected: { 
      label: 'Rejected', 
      className: 'bg-red-500 text-white border-red-600' 
    },
    archived: { 
      label: 'Archived', 
      className: 'bg-gray-500 text-white border-gray-600' 
    }
  };
  
  const config = statusConfig[status] || { 
    label: status, 
    className: 'bg-gray-500 text-white' 
  };
  
  return (
    <Badge className={cn("text-xs font-medium", config.className)}>
      {config.label}
    </Badge>
  );
};

export const createJobsColumnsV4 = ({
  onTogglePriority,
  onRemoveFromMorningBrew,
  onRemoveFromCommunity,
  onCopyJob,
  onStartEdit,
  editingCell,
  editValue,
  setEditValue,
  onSaveEdit,
  onCancelEdit
}: JobsColumnsProps): ColumnDef<JobPosting>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
    minSize: 40,
    maxSize: 40,
  },
  {
    accessorKey: "company",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company" />
    ),
    cell: ({ row }) => {
      const job = row.original
      const isEditing = editingCell?.jobId === job.id && editingCell?.field === 'company'
      const company = job.custom_company_name || job.company
      const isSourceDeleted = job.morningbrew?.is_source_deleted
      
      if (isEditing) {
        return (
          <div
            className="flex items-center gap-1 bg-background border border-input rounded-md px-2 py-0.5 -mx-1 shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEdit()
                if (e.key === 'Escape') onCancelEdit()
              }}
              className="h-7 text-sm border-0 bg-transparent focus:outline-none"
              autoFocus
              title="Press Enter to save, Esc to cancel"
            />
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onSaveEdit} aria-label="Save">
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onCancelEdit} aria-label="Cancel">
              <XIcon className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        )
      }
      
      return (
        <div 
          className={cn(
            "flex flex-col space-y-0.5 group cursor-text",
            isSourceDeleted && "opacity-60"
          )}
          onDoubleClick={() => onStartEdit(job.id, 'company', company)}
        >
          {isSourceDeleted && (
            <div className="flex items-center gap-1 text-xs mb-0.5">
              <AlertTriangle className="h-3 w-3 text-red-500" />
              <span className="text-red-600 font-medium">Source Deleted</span>
            </div>
          )}
          <span className="font-semibold text-sm leading-tight group-hover:underline group-hover:decoration-dotted">
            {company || 'Unknown Company'}
          </span>
          {job.morningbrew?.cached_company && job.morningbrew.cached_company !== company && (
            <span className="text-xs text-muted-foreground/70 italic">
              was: {job.company}
            </span>
          )}
          {(job.sector || job.industry) && (
            <span className="text-xs text-muted-foreground/80 leading-tight">
              {job.sector && <span>{job.sector}</span>}
              {job.sector && job.industry && <span className="mx-1 opacity-40">•</span>}
              {job.industry && <span>{job.industry}</span>}
            </span>
          )}
        </div>
      )
    },
    enableHiding: true,
    size: 200,
    minSize: 120,
    maxSize: 300,
  },
  {
    accessorKey: "ai_title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Position" />
    ),
    cell: ({ row }) => {
      const job = row.original
      const isEditing = editingCell?.jobId === job.id && editingCell?.field === 'title'
      const title = job.morningbrew?.formatted_title || job.ai_title || job.title
      const isSourceDeleted = job.morningbrew?.is_source_deleted
      
      if (isEditing) {
        return (
          <div
            className="flex items-center gap-1 bg-background border border-input rounded-md px-2 py-0.5 -mx-1 shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEdit()
                if (e.key === 'Escape') onCancelEdit()
              }}
              className="h-7 text-sm border-0 bg-transparent focus:outline-none"
              autoFocus
              title="Press Enter to save, Esc to cancel"
            />
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onSaveEdit} aria-label="Save">
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onCancelEdit} aria-label="Cancel">
              <XIcon className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        )
      }
      
      return (
        <div className={cn("space-y-0.5", isSourceDeleted && "opacity-60")}>
          <div 
            className="group cursor-text"
            onDoubleClick={() => onStartEdit(job.id, 'title', title)}
          >
            {job.application_url && !isSourceDeleted ? (
              <a 
                href={job.application_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="leading-tight">
                  {title || 'Untitled Position'}
                </span>
                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
              </a>
            ) : (
              <span className={cn(
                "font-medium text-sm leading-tight block group-hover:underline group-hover:decoration-dotted",
                isSourceDeleted && "line-through decoration-red-400"
              )}>
                {title || 'Untitled Position'}
              </span>
            )}
            {job.morningbrew?.formatted_title && job.morningbrew.formatted_title !== job.ai_title && (
              <span className="text-xs text-muted-foreground/70 italic">
                was: {job.ai_title || job.title}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground/80">
            {typeof job.ai_confidence_score === 'number' && (
              <span className="tabular-nums">
                AI {job.ai_confidence_score}%
              </span>
            )}
            {job.ai_top_tags?.length ? (
              <>
                <span className="opacity-40">•</span>
                {job.ai_top_tags.slice(0, 2).map((tag: string, i: number) => (
                  <span key={i} className="truncate max-w-[12ch]">{tag}</span>
                ))}
                {job.ai_top_tags.length > 2 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="underline decoration-dotted underline-offset-2 hover:text-foreground transition-colors"
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Show ${job.ai_top_tags.length - 2} more tags`}
                        >
                          +{job.ai_top_tags.length - 2}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {job.ai_top_tags.join(', ')}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </>
            ) : null}
          </div>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const title = row.original.ai_title || row.original.title || ''
      return value.toLowerCase().split(' ').every((term: string) =>
        title.toLowerCase().includes(term)
      )
    },
    size: 280,
    minSize: 180,
    maxSize: 400,
    enableResizing: true,
  },
  {
    accessorKey: "location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ row }) => {
      const job = row.original
      const isEditing = editingCell?.jobId === job.id && editingCell?.field === 'location'
      let location = job.custom_location
      
      if (!location && job.location && Array.isArray(job.location) && job.location.length > 0) {
        const loc = job.location[0]
        const parts = []
        if (loc.city) parts.push(loc.city)
        if (loc.state) parts.push(loc.state)
        if (loc.country && loc.country !== 'United States') parts.push(loc.country)
        location = parts.join(', ')
      }
      
      if (!location && job.is_remote) {
        location = 'Remote'
      }
      
      const displayLocation = job.morningbrew?.cached_location || location || 'Not specified'
      
      if (isEditing) {
        return (
          <div
            className="flex items-center gap-1 bg-background border border-input rounded-md px-2 py-0.5 -mx-1 shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEdit()
                if (e.key === 'Escape') onCancelEdit()
              }}
              className="h-7 text-sm border-0 bg-transparent focus:outline-none"
              autoFocus
              title="Press Enter to save, Esc to cancel"
            />
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onSaveEdit} aria-label="Save">
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onCancelEdit} aria-label="Cancel">
              <XIcon className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        )
      }
      
      return (
        <div 
          className="group cursor-text"
          onDoubleClick={() => onStartEdit(job.id, 'location', displayLocation)}
        >
          <span className="text-sm group-hover:underline group-hover:decoration-dotted">
            {displayLocation}
          </span>
          {job.morningbrew?.cached_location && job.morningbrew.cached_location !== location && (
            <span className="text-xs text-muted-foreground block">
              Original: {location}
            </span>
          )}
        </div>
      )
    },
    enableHiding: true,
    size: 150,
    minSize: 100,
    maxSize: 250,
  },
  {
    accessorKey: "employment_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const job = row.original
      const isEditing = editingCell?.jobId === job.id && editingCell?.field === 'employment_type'
      const type = job.morningbrew?.custom_employment_type || row.getValue("employment_type") as string
      const displayType = type ? type.replace(/_/g, '-').toLowerCase()
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('-') : 'Not specified'
      
      if (isEditing) {
        return (
          <div
            className="flex items-center gap-1 bg-background border border-input rounded-md px-2 py-0.5 -mx-1 shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEdit()
                if (e.key === 'Escape') onCancelEdit()
              }}
              className="h-7 text-sm border-0 bg-transparent focus:outline-none"
              autoFocus
              placeholder="e.g., full-time, part-time, contract"
              title="Press Enter to save, Esc to cancel"
            />
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onSaveEdit} aria-label="Save">
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onCancelEdit} aria-label="Cancel">
              <XIcon className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        )
      }
      
      return (
        <div 
          className={cn(
            "group",
            job.is_morningbrew ? "cursor-text" : "cursor-not-allowed opacity-70"
          )}
          onDoubleClick={() => job.is_morningbrew && onStartEdit(job.id, 'employment_type', type || '')}
          title={!job.is_morningbrew ? "Add to Morning Brew to edit this field" : "Double-click to edit"}
        >
          <Badge variant="outline" className={cn(
            "font-normal",
            job.is_morningbrew && "group-hover:ring-1 group-hover:ring-gray-300"
          )}>
            {displayType}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: true,
    size: 120,
    minSize: 100,
    maxSize: 150,
  },
  {
    accessorKey: "is_remote",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Remote" />
    ),
    cell: ({ row }) => {
      const job = row.original
      const isEditing = editingCell?.jobId === job.id && editingCell?.field === 'is_remote'
      const customRemote = job.morningbrew?.custom_is_remote
      let displayStatus: string
      
      if (customRemote) {
        displayStatus = customRemote
      } else {
        const isRemote = row.getValue("is_remote") as boolean
        displayStatus = isRemote ? "Remote" : "On-site"
      }
      
      if (isEditing) {
        return (
          <div
            className="flex items-center gap-1 bg-background border border-input rounded-md px-2 py-0.5 -mx-1 shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEdit()
                if (e.key === 'Escape') onCancelEdit()
              }}
              className="h-7 text-sm border-0 bg-transparent focus:outline-none cursor-pointer"
              autoFocus
            >
              <option value="Remote">Remote</option>
              <option value="On-site">On-site</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onSaveEdit} aria-label="Save">
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onCancelEdit} aria-label="Cancel">
              <XIcon className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        )
      }
      
      return (
        <div 
          className={cn(
            "group",
            job.is_morningbrew ? "cursor-text" : "cursor-not-allowed opacity-70"
          )}
          onDoubleClick={() => job.is_morningbrew && onStartEdit(job.id, 'is_remote', displayStatus)}
          title={!job.is_morningbrew ? "Add to Morning Brew to edit this field" : "Double-click to edit"}
        >
          <Badge 
            variant="outline" 
            className={cn(
              job.is_morningbrew && "group-hover:ring-1 group-hover:ring-gray-300",
              displayStatus === "Remote" ? "border-green-300 text-green-600" : 
              displayStatus === "Hybrid" ? "border-blue-300 text-blue-600" :
              "border-gray-200 text-gray-400"
            )}
          >
            {displayStatus}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const isRemote = row.getValue(id) as boolean
      if (value.includes("remote")) return isRemote === true
      if (value.includes("onsite")) return isRemote === false
      return true
    },
    enableHiding: true,
  },
  {
    id: "feed_source",
    accessorFn: row => {
      const partnerName = row.single_partner?.partner_name
      const paymentType = (row.cpa || 0) > 0 ? 'CPA' : 'CPC'
      return `${partnerName || 'Unknown'} ${paymentType}`
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Feed Source" />
    ),
    cell: ({ row }) => {
      const job = row.original
      const partnerName = job.single_partner?.partner_name
      const paymentType = (job.cpa || 0) > 0 ? 'CPA' : 'CPC'
      
      return <FeedSourceBadge partnerName={partnerName} paymentType={paymentType} />
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: true,
    size: 140,
  },
  {
    id: "mb_status",
    accessorFn: row => row.morningbrew?.status || 'not_in_mb',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="MB Status" />
    ),
    cell: ({ row }) => {
      const job = row.original
      const status = job.morningbrew?.status
      const clicks = job.morningbrew?.click_count || 0
      
      return (
        <div className="flex flex-col gap-1">
          <MBStatusBadge status={status} />
          {status && clicks > 0 && (
            <div className="text-xs text-muted-foreground">
              {clicks}/30 clicks
              {clicks >= 30 && <span className="text-green-600 font-medium ml-1">✓ Auto-published</span>}
            </div>
          )}
        </div>
      )
    },
    enableHiding: true,
    size: 140,
  },
  {
    id: "cpc",
    accessorFn: row => row.cpc || 0,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CPC" />
    ),
    cell: ({ row }) => {
      const job = row.original
      const cpc = job.cpc || 0
      const paymentType = (job.cpa || 0) > 0 ? 'CPA' : 'CPC'
      const isPaidOnCPC = paymentType === 'CPC'
      
      return (
        <div className="text-center">
          <span className={cn(
            "font-semibold text-sm",
            cpc > 0 && isPaidOnCPC ? "text-blue-700 text-base" : "text-gray-400 text-xs"
          )}>
            ${cpc.toFixed(2)}
          </span>
        </div>
      )
    },
    enableHiding: true,
    size: 80,
  },
  {
    id: "cpa", 
    accessorFn: row => row.cpa || 0,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CPA" />
    ),
    cell: ({ row }) => {
      const job = row.original
      const cpa = job.cpa || 0
      const paymentType = (job.cpa || 0) > 0 ? 'CPA' : 'CPC'
      const isPaidOnCPA = paymentType === 'CPA'
      
      return (
        <div className="text-center">
          <span className={cn(
            "font-semibold text-sm",
            cpa > 0 && isPaidOnCPA ? "text-green-700 text-base" : "text-gray-400 text-xs"
          )}>
            ${cpa.toFixed(2)}
          </span>
        </div>
      )
    },
    enableHiding: true,
    size: 80,
  },
  {
    accessorKey: "salary",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Salary" />
    ),
    cell: ({ row }) => {
      const job = row.original
      if (!job.salary_min && !job.salary_max) {
        return <span className="text-sm text-muted-foreground">-</span>
      }
      
      const formatSalary = (amount: number, period?: string) => {
        // Check if it's hourly rate (typically < 200)
        if (period === 'hour' || (amount < 200 && !period)) {
          return `$${amount}/hour`
        }
        // Otherwise format as annual salary
        if (amount >= 1000) {
          return `$${Math.round(amount / 1000)}k`
        }
        return `$${amount}`
      }
      
      let salaryText = ''
      if (job.salary_min && job.salary_max) {
        salaryText = `${formatSalary(job.salary_min, job.salary_period)} - ${formatSalary(job.salary_max, job.salary_period)}`
      } else if (job.salary_min) {
        salaryText = `${formatSalary(job.salary_min, job.salary_period)}+`
      } else if (job.salary_max) {
        salaryText = `Up to ${formatSalary(job.salary_max, job.salary_period)}`
      }
      
      return (
        <div className="text-sm">
          {salaryText}
        </div>
      )
    },
    enableHiding: true,
  },
  {
    accessorKey: "posted_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Posted" />
    ),
    cell: ({ row }) => {
      const postedAt = row.getValue("posted_at") as number
      if (!postedAt) {
        return <span className="text-sm text-muted-foreground">-</span>
      }
      
      const timestamp = postedAt.toString().length <= 10 ? postedAt * 1000 : postedAt
      const date = new Date(timestamp)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      let timeAgo = ''
      
      if (diffDays === 0) {
        timeAgo = 'Today'
      } else if (diffDays === 1) {
        timeAgo = 'Yesterday'
      } else if (diffDays < 7) {
        timeAgo = `${diffDays}d ago`
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7)
        timeAgo = `${weeks}w ago`
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30)
        timeAgo = `${months}mo ago`
      } else {
        const years = Math.floor(diffDays / 365)
        timeAgo = `${years}y ago`
      }
      
      return (
        <Badge variant="outline" className={`text-xs ${
          diffDays <= 1 ? 'text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700' :
          diffDays < 7 ? 'text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700' :
          diffDays < 30 ? 'text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700' :
          diffDays < 365 ? 'text-red-700 dark:text-red-400 border-red-300 dark:border-red-700' :
          'text-gray-600 dark:text-gray-400'
        }`}>
          {timeAgo}
        </Badge>
      )
    },
    enableHiding: true,
  },
  {
    id: "clicks",
    accessorFn: row => row.morningbrew?.click_count || 0,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Clicks" />
    ),
    cell: ({ row }) => {
      const job = row.original
      const clicks = job.morningbrew?.click_count || 0
      return (
        <div className="text-center">
          <Badge variant={clicks > 0 ? "default" : "secondary"} className="min-w-[2.5rem]">
            {clicks}
          </Badge>
        </div>
      )
    },
    enableHiding: true,
    size: 80,
  },
  {
    id: "morningbrew_brands",
    accessorFn: row => {
      if (!row.is_morningbrew || !row.morningbrew?.community_ids) return []
      return row.morningbrew.community_ids.map(c => c.id.toString())
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="MB Brands" />
    ),
    cell: ({ row }) => {
      const job = row.original
      
      if (!job.is_morningbrew || !job.morningbrew?.community_ids?.length) {
        return null
      }
      
      const brands = job.morningbrew.community_ids
      const visible = brands.slice(0, 2)
      const overflow = brands.length - visible.length
      
      return (
        <div className="flex flex-wrap items-center gap-1">
          {job.morningbrew?.is_priority && (
            <Badge variant="warning" className="font-semibold">
              Priority
            </Badge>
          )}
          {visible.map(c => (
            <div key={c.id} className="group/badge relative inline-flex items-center">
              <Badge variant="secondary" className="text-xs pr-7 py-1 relative">
                {c.community_name}
              </Badge>
              {onRemoveFromCommunity ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    console.log('Button clicked for job', job.id, 'community', c.id)
                    console.log('onRemoveFromCommunity exists?', !!onRemoveFromCommunity)
                    console.log('Calling onRemoveFromCommunity NOW')
                    onRemoveFromCommunity(job.id, c.id)
                    console.log('Called onRemoveFromCommunity - did it work?')
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 hover:bg-destructive/10 rounded p-0.5 z-20 border border-gray-200 dark:border-gray-700"
                  aria-label={`Remove from ${c.community_name}`}
                >
                  <X className="h-3 w-3 text-destructive" />
                </button>
              ) : null}
            </div>
          ))}
          {overflow > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-xs cursor-help">
                    +{overflow}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {brands.map(c => c.community_name).join(', ')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const brandIds = row.getValue(id) as string[]
      if (!brandIds || brandIds.length === 0) return false
      return value.some((v: string) => brandIds.includes(v))
    },
    enableHiding: true,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const job = row.original
      
      return (
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCopyJob(job)
                  }}
                  aria-label="Copy job text for newsletter"
                >
                  <Copy className="h-4 w-4 text-gray-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Copy job text for newsletter
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {job.is_morningbrew && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        onTogglePriority(job.id, job.morningbrew?.is_priority || false)
                      }}
                    >
                      <Star 
                        className={`h-4 w-4 ${
                          job.morningbrew?.is_priority 
                            ? 'fill-yellow-500 text-yellow-500' 
                            : 'text-gray-400'
                        }`}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {job.morningbrew?.is_priority ? "Remove priority" : "Mark as priority"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveFromMorningBrew(job.id)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Remove from MorningBrew
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]