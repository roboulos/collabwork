"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { JobPosting } from "@/lib/xano"
import { DataTableColumnHeader } from "./data-table/data-table-column-header"
import { Star, X, Copy, ExternalLink, Check, XIcon } from 'lucide-react'
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
  onCopyJob: (job: JobPosting) => void
  onStartEdit: (jobId: number, field: string, currentValue: string) => void
  editingCell: { jobId: number; field: string } | null
  editValue: string
  setEditValue: (value: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
}

export const createJobsColumnsV3 = ({
  onTogglePriority,
  onRemoveFromMorningBrew,
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
          className="flex flex-col space-y-1 group cursor-text"
          onDoubleClick={() => onStartEdit(job.id, 'company', company)}
        >
          <span className="font-medium group-hover:underline group-hover:decoration-dotted">
            {company}
          </span>
          {job.morningbrew?.cached_company && job.morningbrew.cached_company !== company && (
            <span className="text-xs text-muted-foreground">
              Original: {job.company}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {job.sector && <span>{job.sector}</span>}
            {job.sector && job.industry && <span className="mx-1 opacity-40">•</span>}
            {job.industry && <span>{job.industry}</span>}
          </span>
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
      const title = job.morningbrew?.cached_job_title || job.ai_title || job.title
      
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
        <div className="space-y-1">
          <div 
            className="group cursor-text"
            onDoubleClick={() => onStartEdit(job.id, 'title', title)}
          >
            {job.application_url ? (
              <a 
                href={job.application_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="group-hover:underline group-hover:decoration-dotted">
                  {title}
                </span>
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="font-medium group-hover:underline group-hover:decoration-dotted">
                {title}
              </span>
            )}
            {job.morningbrew?.cached_job_title && job.morningbrew.cached_job_title !== job.ai_title && (
              <span className="text-xs text-muted-foreground block">
                Original: {job.ai_title || job.title}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground mt-1">
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
          {job.ai_skills && job.ai_skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              <span className="text-xs text-muted-foreground mr-1">Skills:</span>
              {job.ai_skills.slice(0, 4).map((skill: string, index: number) => (
                <span key={index} className="text-xs text-muted-foreground">
                  {skill}{index < Math.min(job.ai_skills!.length - 1, 3) && ','}
                </span>
              ))}
              {job.ai_skills.length > 4 && (
                <span className="text-xs text-muted-foreground">+{job.ai_skills.length - 4}</span>
              )}
            </div>
          )}
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
      
      // Handle custom_location - convert to string if needed
      let location = "";
      if (job.custom_location) {
        if (typeof job.custom_location === 'string') {
          location = job.custom_location;
        } else if (Array.isArray(job.custom_location) && job.custom_location.length > 0) {
          const loc = job.custom_location[0];
          const parts = [];
          if (loc.city) parts.push(loc.city);
          if (loc.state) parts.push(loc.state);
          if (loc.country && loc.country !== "United States") parts.push(loc.country);
          location = parts.join(", ");
        } else if (typeof job.custom_location === 'object' && !Array.isArray(job.custom_location)) {
          // Handle single location object
          const parts = [];
          if (job.custom_location.city) parts.push(job.custom_location.city);
          if (job.custom_location.state) parts.push(job.custom_location.state);
          if (job.custom_location.country && job.custom_location.country !== "United States") {
            parts.push(job.custom_location.country);
          }
          location = parts.join(", ");
        }
      }
      
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
      
      // Ensure displayLocation is always a string
      let displayLocation = location || 'Not specified';
      if (job.morningbrew?.cached_location) {
        displayLocation = typeof job.morningbrew.cached_location === 'string' 
          ? job.morningbrew.cached_location 
          : 'Not specified';
      }
      
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
      const type = row.getValue("employment_type") as string
      const displayType = type ? type.replace(/_/g, '-').toLowerCase()
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('-') : 'Not specified'
      return (
        <Badge variant="outline" className="font-normal">
          {displayType}
        </Badge>
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
      const isRemote = row.getValue("is_remote") as boolean
      return isRemote ? (
        <Badge variant="outline" className="border-green-300 text-green-600">
          Remote OK
        </Badge>
      ) : (
        <Badge variant="outline" className="border-gray-200 text-gray-400">
          On-site
        </Badge>
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
  },
  {
    id: "payment_source",
    accessorFn: row => row.source || row.feed_id || 'Unknown',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Source" />
    ),
    cell: ({ row }) => {
      const job = row.original
      const source = job.source || `Feed ${job.feed_id}` || 'Unknown'
      // Check if source name indicates payment type
      const isCPA = source.toLowerCase().includes('cpa')
      const isCPC = source.toLowerCase().includes('cpc')
      
      return (
        <div className="text-sm">
          <Badge 
            variant="outline" 
            className={cn(
              "font-normal",
              isCPA && "border-purple-300 text-purple-700",
              isCPC && "border-blue-300 text-blue-700"
            )}
          >
            {source}
          </Badge>
        </div>
      )
    },
    enableHiding: true,
  },
  {
    id: "cpc",
    accessorFn: row => row.cpc || 0,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CPC" />
    ),
    cell: ({ row }) => {
      const job = row.original
      const cpc = job.cpc
      const source = job.source || `Feed ${job.feed_id}` || ''
      const isPaidOnCPC = source.toLowerCase().includes('cpc')
      
      return (
        <div className="text-center text-sm">
          {cpc !== undefined && cpc !== null ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className={cn(
                    "font-medium",
                    isPaidOnCPC ? "text-blue-600 font-semibold" : "text-gray-600",
                    cpc > 1 && isPaidOnCPC && "text-blue-700",
                    cpc > 0.5 && isPaidOnCPC && "text-blue-600"
                  )}>
                    ${cpc.toFixed(2)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cost Per Click: ${cpc.toFixed(2)}</p>
                  {isPaidOnCPC && <p className="text-xs text-blue-600">✓ Paid on CPC</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      )
    },
    enableHiding: true,
  },
  {
    id: "cpa",
    accessorFn: row => row.cpa || 0,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CPA" />
    ),
    cell: ({ row }) => {
      const job = row.original
      const cpa = job.cpa
      const source = job.source || `Feed ${job.feed_id}` || ''
      const isPaidOnCPA = source.toLowerCase().includes('cpa')
      
      return (
        <div className="text-center text-sm">
          {cpa !== undefined && cpa !== null && cpa > 0 ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className={cn(
                    "font-medium",
                    isPaidOnCPA ? "text-purple-600 font-semibold" : "text-gray-600",
                    cpa > 5 && isPaidOnCPA && "text-purple-700",
                    cpa > 1 && isPaidOnCPA && "text-purple-600"
                  )}>
                    ${cpa.toFixed(2)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cost Per Acquisition: ${cpa.toFixed(2)}</p>
                  {isPaidOnCPA && <p className="text-xs text-purple-600">✓ Paid on CPA</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      )
    },
    enableHiding: true,
  },
  {
    id: "post_source",
    accessorFn: row => row.post_type || 'Unknown',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Source" />
    ),
    cell: ({ row }) => {
      const job = row.original
      const postType = job.post_type
      const feedId = job.feed_id
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="text-xs">
                {postType === "JOB_FEED" ? `Feed ${feedId}` : postType || "Unknown"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              Post Type: {postType || "Unknown"}
              {feedId && <><br />Feed ID: {feedId}</>}
              {job.partner_id && <><br />Partner ID: {job.partner_id}</>}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    enableHiding: true,
  },
  {
    id: "mb_status",
    accessorFn: row => row.morningbrew?.status || 'zzz_not_in_mb',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="MB Status" />
    ),
    cell: ({ row }) => {
      const job = row.original
      
      if (!job.is_morningbrew || !job.morningbrew) {
        return <span className="text-xs text-muted-foreground">Not in MB</span>
      }
      
      const status = job.morningbrew.status || 'draft'
      const publishedAt = job.morningbrew.published_at
      
      const statusConfig: Record<string, { 
        label: string; 
        variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "purple" | null;
      }> = {
        draft: { 
          label: 'Draft', 
          variant: 'secondary'
        },
        approved: { 
          label: 'Approved', 
          variant: 'success'
        },
        published: { 
          label: 'Published', 
          variant: 'info'
        },
        archived: { 
          label: 'Archived', 
          variant: 'outline'
        }
      }
      
      const config = statusConfig[status] || { 
        label: status, 
        variant: 'secondary' as const
      }
      
      return (
        <div className="flex flex-col items-start gap-1">
          <Badge variant={config.variant} className="text-xs">
            {config.label}
          </Badge>
          {publishedAt && status === 'published' && (
            <span className="text-xs text-muted-foreground">
              {new Date(publishedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )
    },
    enableHiding: true,
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
            <Badge key={c.id} variant="secondary" className="text-xs">
              {c.community_name}
            </Badge>
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