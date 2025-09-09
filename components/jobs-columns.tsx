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
          <span className="text-xs text-muted-foreground sm:hidden">
            {job.title}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Position" />
    ),
    cell: ({ row }) => {
      const job = row.original
      return job.application_url ? (
        <a 
          href={job.application_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {job.title}
          <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <span>{job.title}</span>
      )
    },
    filterFn: (row, id, value) => {
      return value.toLowerCase().split(' ').every((term: string) =>
        row.getValue(id)?.toString().toLowerCase().includes(term)
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
      const location = job.custom_location || 
        (job.location && job.location[0] ? 
          `${job.location[0].city || ''}${job.location[0].state ? `, ${job.location[0].state}` : ''}` 
          : 'Remote')
      return <span className="text-sm">{location}</span>
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
      return (
        <Badge variant="outline" className="font-normal">
          {type || 'Not specified'}
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
      
      const formatSalary = (amount: number) => {
        if (amount >= 1000) {
          return `$${Math.round(amount / 1000)}k`
        }
        return `$${amount}`
      }
      
      let salaryText = ''
      if (job.salary_min && job.salary_max) {
        salaryText = `${formatSalary(job.salary_min)} - ${formatSalary(job.salary_max)}`
      } else if (job.salary_min) {
        salaryText = `${formatSalary(job.salary_min)}+`
      } else if (job.salary_max) {
        salaryText = `Up to ${formatSalary(job.salary_max)}`
      }
      
      return (
        <div className="text-sm">
          {salaryText}
          {job.salary_period && (
            <span className="text-muted-foreground">/{job.salary_period}</span>
          )}
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
        return <span className="text-xs text-muted-foreground">—</span>
      }
      
      return (
        <div className="flex flex-wrap items-center gap-1">
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