"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { JobPosting } from "@/lib/xano"
import { DataTableColumnHeader } from "./data-table/data-table-column-header"
import { Star, X, Pencil, ExternalLink } from 'lucide-react'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface JobsColumnsProps {
  onTogglePriority: (jobId: number, currentPriority: boolean) => void
  onRemoveFromMorningBrew: (jobId: number) => void
  onEditJob: (job: JobPosting) => void
}

export const createJobsColumns = ({
  onTogglePriority,
  onRemoveFromMorningBrew,
  onEditJob
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
  },
  {
    accessorKey: "company",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company" />
    ),
    cell: ({ row }) => {
      const job = row.original
      const company = job.custom_company_name || job.company
      return (
        <div className="flex flex-col space-y-1">
          <span className="font-medium">{company}</span>
          <span className="text-xs text-muted-foreground">
            {job.sector && (
              <Badge variant="outline" className="mr-1 text-xs">
                {job.sector}
              </Badge>
            )}
            {job.industry && (
              <span className="text-xs">{job.industry}</span>
            )}
          </span>
        </div>
      )
    },
    enableHiding: true,
  },
  {
    accessorKey: "ai_title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Position" />
    ),
    cell: ({ row }) => {
      const job = row.original
      const title = job.ai_title || job.title
      return (
        <div className="space-y-1">
          <div>
            {job.application_url ? (
              <a 
                href={job.application_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {title}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="font-medium">{title}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {job.ai_confidence_score !== undefined && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        job.ai_confidence_score >= 80 
                          ? 'border-green-300 text-green-700' 
                          : job.ai_confidence_score >= 60 
                          ? 'border-yellow-300 text-yellow-700'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      AI {job.ai_confidence_score}%
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    AI Confidence: {job.ai_confidence_score}%
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {job.ai_top_tags?.slice(0, 3).map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
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
  },
  {
    accessorKey: "location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ row }) => {
      const job = row.original
      
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
      
      return <span className="text-sm">{location || 'Not specified'}</span>
    },
    enableHiding: true,
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
      
      return <span className="text-sm">{timeAgo}</span>
    },
    enableHiding: true,
  },
  {
    id: "clicks",
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
    id: "cpc",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CPC" />
    ),
    cell: ({ row }) => {
      const job = row.original
      const cpc = job.cpc
      return (
        <div className="text-center text-sm">
          {cpc !== undefined && cpc !== null ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="font-medium">${cpc.toFixed(2)}</span>
                </TooltipTrigger>
                <TooltipContent>
                  Cost Per Click: ${cpc.toFixed(2)}
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CPA" />
    ),
    cell: ({ row }) => {
      const job = row.original
      const cpa = job.cpa
      return (
        <div className="text-center text-sm">
          {cpa !== undefined && cpa !== null && cpa > 0 ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="font-medium">${cpa.toFixed(2)}</span>
                </TooltipTrigger>
                <TooltipContent>
                  Cost Per Acquisition: ${cpa.toFixed(2)}
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
    id: "source",
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
    id: "mb_published",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="MB Published" />
    ),
    cell: ({ row }) => {
      const job = row.original
      const publishedAt = job.morningbrew?.published_at
      
      if (!publishedAt || !job.is_morningbrew) {
        return <span className="text-sm text-muted-foreground">—</span>
      }
      
      const timestamp = publishedAt.toString().length <= 10 ? publishedAt * 1000 : publishedAt
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
      } else {
        const weeks = Math.floor(diffDays / 7)
        timeAgo = `${weeks}w ago`
      }
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className="text-sm">{timeAgo}</span>
            </TooltipTrigger>
            <TooltipContent>
              Published: {date.toLocaleDateString()}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
        return <span className="text-xs text-muted-foreground">Not in MB</span>
      }
      
      return (
        <div className="flex flex-wrap items-center gap-1">
          {job.morningbrew?.status && (
            <Badge 
              variant="outline"
              className={`text-xs ${
                job.morningbrew.status === 'published' 
                  ? 'border-green-300 text-green-700'
                  : job.morningbrew.status === 'approved'
                  ? 'border-blue-300 text-blue-700'
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              {job.morningbrew.status.charAt(0).toUpperCase() + job.morningbrew.status.slice(1)}
            </Badge>
          )}
          {job.morningbrew?.is_priority && (
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
              Priority
            </Badge>
          )}
          {job.morningbrew?.community_ids.map(c => (
            <Badge key={c.id} variant="secondary" className="text-xs">
              {c.community_name}
            </Badge>
          ))}
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
        <div className="flex items-center justify-end gap-1">
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
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditJob(job)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Edit job details
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]