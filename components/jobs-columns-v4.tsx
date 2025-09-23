"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  Star,
  X,
  Copy,
  ExternalLink,
  Check,
  XIcon,
  Sparkles,
  Plus,
  Pencil,
} from "lucide-react";

import { DataTableColumnHeader } from "./data-table/data-table-column-header";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { JobPosting } from "@/lib/xano";

interface JobsColumnsProps {
  onTogglePriority: (jobId: number, currentPriority: boolean) => void;
  onRemoveFromMorningBrew: (jobId: number) => void;
  onRemoveFromCommunity?: (jobId: number, communityId: number) => void;
  onCopyJob: (job: JobPosting) => void;
  onStartEdit: (jobId: number, field: string, currentValue: string) => void;
  editingCell: { jobId: number; field: string } | null;
  editValue: string;
  setEditValue: (value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

// Reusable editing component for cleaner AG Grid-like experience
const EditingCell = ({ 
  value, 
  onChange, 
  onSave, 
  onCancel,
  placeholder,
  className = ""
}: {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  placeholder?: string;
  className?: string;
}) => (
  <div
    className={cn(
      "absolute -inset-x-2 -inset-y-3 z-50 flex items-center bg-white dark:bg-gray-900",
      "border-2 border-blue-500 rounded-lg shadow-2xl",
      "min-h-[56px]", // Even more height
      className
    )}
    onClick={(e) => e.stopPropagation()}
  >
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onSave();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
        if (e.key === "Tab") {
          e.preventDefault();
          onSave();
        }
      }}
      onBlur={(e) => {
        // Only save if not clicking on cancel button
        const relatedTarget = e.relatedTarget as HTMLElement;
        if (!relatedTarget?.closest('[aria-label="Cancel"]')) {
          onSave();
        }
      }}
      className="h-full w-full px-5 py-3 text-base border-0 bg-transparent focus:outline-none font-medium text-gray-900 dark:text-gray-100"
      placeholder={placeholder}
      autoFocus
    />
    <div className="flex items-center pr-2">
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
        onClick={onCancel}
        aria-label="Cancel"
        tabIndex={-1}
      >
        <XIcon className="h-4 w-4 text-gray-500" />
      </Button>
    </div>
  </div>
);

// Helper components for feed source and MB status badges
const FeedSourceBadge = ({
  partnerName,
  paymentType,
}: {
  partnerName?: string;
  paymentType?: string;
}) => {
  if (!partnerName)
    return (
      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800">
        <span className="text-xs text-gray-500">No Feed Source</span>
      </div>
    );

  // Display as "Appcast CPA" or "Appcast CPC" as per PRD
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
        paymentType === "CPA"
          ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
          : "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800",
      )}
    >
      <span className="text-gray-700 dark:text-gray-300">{partnerName}</span>
      <span
        className={cn(
          "font-bold",
          paymentType === "CPA"
            ? "text-green-700 dark:text-green-400"
            : "text-blue-700 dark:text-blue-400",
        )}
      >
        {paymentType || ""}
      </span>
    </div>
  );
};

const MBStatusBadge = ({ status }: { status?: string }) => {
  if (!status) return null;

  const statusConfig: Record<
    string,
    {
      label: string;
      className: string;
      icon?: "sparkles" | "plus";
    }
  > = {
    suggested: {
      label: "Curated",
      className: "badge badge-curated",
      icon: "sparkles",
    },
    user_added: {
      label: "Added",
      className: "badge badge-active",
      icon: "plus",
    },
    approved: {
      label: "Approved",
      className: "badge badge-active",
    },
    published: {
      label: "Published",
      className: "badge badge-active",
    },
    archived: {
      label: "Archived",
      className: "badge badge-default",
    },
    deleted: {
      label: "Deleted",
      className: "badge badge-default opacity-50",
    },
    rejected: {
      label: "Rejected",
      className: "badge badge-pending",
    },
    closed: {
      label: "Closed",
      className: "badge badge-default",
    },
  };

  const config = statusConfig[status] || {
    label: status,
    className: "badge badge-default",
  };

  return (
    <span className={config.className}>
      {status === "suggested" && <Sparkles className="h-3 w-3" />}
      {status === "user_added" && <Plus className="h-3 w-3" />}
      {config.label}
    </span>
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
  onCancelEdit,
}: JobsColumnsProps): ColumnDef<JobPosting>[] => {
  console.log("createJobsColumnsV4 called with onStartEdit:", typeof onStartEdit, onStartEdit);
  
  const allColumns: ColumnDef<JobPosting>[] = [
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
    size: 36,
    minSize: 36,
    maxSize: 36,
  },
  {
    accessorKey: "company",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company" />
    ),
    cell: ({ row }) => {
      const job = row.original;
      const isEditing =
        editingCell?.jobId === job.id && editingCell?.field === "company";
      const company = job.custom_company_name || job.company;
      const isSourceDeleted = job.morningbrew?.is_source_deleted;

      return (
        <div
          className={cn("group relative min-h-[40px]", isSourceDeleted && "opacity-60")}
        >
          {isEditing ? (
            <EditingCell
              value={editValue}
              onChange={setEditValue}
              onSave={onSaveEdit}
              onCancel={onCancelEdit}
              placeholder="Enter company name"
            />
          ) : (
            <div className="flex items-center gap-1">
              <div className="flex-1">
                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-tight block">
                  {company || "Unknown Company"}
                </span>
                {job.morningbrew?.cached_company &&
                  job.morningbrew.cached_company !== company && (
                    <span className="text-xs text-muted-foreground/70 italic block mt-0.5">
                      was: {job.company}
                    </span>
                  )}
                {(job.sector || job.industry) && (
                  <span className="text-xs text-muted-foreground/80 leading-tight block mt-1">
                    {job.sector && <span>{job.sector}</span>}
                    {job.sector && job.industry && (
                      <span className="mx-1 opacity-40">•</span>
                    )}
                    {job.industry && <span>{job.industry}</span>}
                  </span>
                )}
              </div>
              {job.is_morningbrew && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartEdit(job.id, "company", company);
                  }}
                  aria-label="Edit company"
                >
                  <Pencil className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                </Button>
              )}
            </div>
          )}
        </div>
      );
    },
    enableHiding: true,
    size: 280,
    minSize: 200,
    maxSize: 400,
  },
  {
    id: "job_formula",
    accessorFn: (row) => {
      const jobTitle =
        row.morningbrew?.formatted_title ||
        row.ai_title ||
        row.title ||
        "Untitled Position";
      const companyName = row.custom_company_name || row.company || "Company";
      const location =
        row.custom_location ||
        (row.location?.[0]
          ? `${row.location[0].city || ""}${row.location[0].state ? `, ${row.location[0].state}` : ""}`
          : "Remote");
      return `${jobTitle} ${companyName} ${location}`;
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Job Formula" />
    ),
    cell: ({ row }) => {
      const job = row.original;
      const isEditing =
        editingCell?.jobId === job.id && editingCell?.field === "title";
      const isSourceDeleted = job.morningbrew?.is_source_deleted;

      // Use formatted_title directly if available
      let displayFormula = "";
      let title = "";
      let company = "";
      let remoteStatus = "";
      
      if (job.morningbrew?.formatted_title) {
        // Use the formatted_title directly - this is what gets updated
        displayFormula = job.morningbrew.formatted_title;
        // Still extract parts for other UI elements if needed
        title = job.ai_title || job.title || "Untitled Position";
        company = job.custom_company_name || job.company || "Company";
        remoteStatus = job.morningbrew?.custom_is_remote || (job.is_remote ? "Remote" : "On-site");
      } else {
        // Fallback: construct formula if formatted_title not available
        title = job.ai_title || job.title || "Untitled Position";
        company = job.custom_company_name || job.company || "Company";
        
        // Determine remote status
        remoteStatus = "On-site";
        if (job.morningbrew?.custom_is_remote) {
          remoteStatus = job.morningbrew.custom_is_remote;
        } else if (job.custom_is_remote) {
          remoteStatus = job.custom_is_remote;
        } else if (job.is_remote) {
          remoteStatus = "Remote";
        }
        
        displayFormula = `${title} - ${company} - ${remoteStatus}`;
      }

      return (
        <div className={cn("space-y-1.5 relative min-h-[40px]", isSourceDeleted && "opacity-60")}>
          {isEditing ? (
            <EditingCell
              value={editValue}
              onChange={setEditValue}
              onSave={onSaveEdit}
              onCancel={onCancelEdit}
              placeholder="Enter job formula (Title - Company - Remote Status)"
            />
          ) : (
          <div className="group relative">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-1 flex-wrap">
                  {job.application_url && !isSourceDeleted ? (
                    <a
                      href={job.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="leading-tight">
                        {displayFormula}
                      </span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  ) : (
                    <span
                      className={cn(
                        "text-sm text-gray-900 dark:text-gray-100 leading-tight",
                        isSourceDeleted && "line-through decoration-red-400",
                      )}
                    >
                      {displayFormula}
                    </span>
                  )}
                </div>
                {job.morningbrew?.formatted_title &&
                  job.morningbrew.formatted_title !== job.ai_title && (
                    <span className="text-xs text-muted-foreground/70 italic">
                      was: {job.ai_title || job.title}
                    </span>
                  )}
              </div>
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopyJob(job);
                        }}
                        aria-label="Copy job text for newsletter"
                      >
                        <Copy className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy for newsletter</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {job.is_morningbrew && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Pass the current formatted_title or construct it
                      const editFormula = job.morningbrew?.formatted_title || displayFormula;
                      onStartEdit(job.id, "title", editFormula);
                    }}
                    aria-label="Edit title"
                  >
                    <Pencil className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const title = row.original.ai_title || row.original.title || "";
      return value
        .toLowerCase()
        .split(" ")
        .every((term: string) => title.toLowerCase().includes(term));
    },
    size: 400,
    minSize: 300,
    maxSize: 550,
    enableResizing: true,
  },
  {
    accessorKey: "location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ row }) => {
      const job = row.original;
      const isEditing =
        editingCell?.jobId === job.id && editingCell?.field === "location";
      
      // Handle custom_location - it might be a string, array, or object
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
          // Handle empty object or single location object
          if (Object.keys(job.custom_location).length === 0) {
            location = ""; // Empty object
          } else {
            const parts = [];
            if (job.custom_location.city) parts.push(job.custom_location.city);
            if (job.custom_location.state) parts.push(job.custom_location.state);
            if (job.custom_location.country && job.custom_location.country !== "United States") {
              parts.push(job.custom_location.country);
            }
            location = parts.join(", ");
          }
        }
      }

      if (
        !location &&
        job.location &&
        Array.isArray(job.location) &&
        job.location.length > 0
      ) {
        const loc = job.location[0];
        const parts = [];
        if (loc.city) parts.push(loc.city);
        if (loc.state) parts.push(loc.state);
        if (loc.country && loc.country !== "United States")
          parts.push(loc.country);
        location = parts.join(", ");
      }

      if (!location && job.is_remote) {
        location = "Remote";
      }

      const displayLocation =
        location || job.morningbrew?.cached_location || "Not specified";

      return (
        <div className="group relative min-h-[40px]">
          {isEditing ? (
            <EditingCell
              value={editValue}
              onChange={setEditValue}
              onSave={onSaveEdit}
              onCancel={onCancelEdit}
              placeholder="Enter location (e.g., New York, NY)"
            />
          ) : (
          <div className="flex items-center gap-1">
            <div className="flex-1">
              <span className="text-sm">
                {displayLocation}
              </span>
              {job.morningbrew?.cached_location &&
                job.morningbrew.cached_location !== location && (
                  <span className="text-xs text-muted-foreground block">
                    Original: {location}
                  </span>
                )}
            </div>
            {job.is_morningbrew && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartEdit(job.id, "location", location || "");
                }}
                aria-label="Edit location"
              >
                <Pencil className="h-3 w-3 text-gray-600 dark:text-gray-400" />
              </Button>
            )}
          </div>
          )}
        </div>
      );
    },
    enableHiding: true,
    size: 220,
    minSize: 180,
    maxSize: 300,
  },
  {
    accessorKey: "employment_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const job = row.original;
      const isEditing =
        editingCell?.jobId === job.id &&
        editingCell?.field === "employment_type";
      const type =
        job.custom_employment_type ||
        job.morningbrew?.custom_employment_type ||
        (row.getValue("employment_type") as string);
      const displayType = type
        ? type
            .replace(/_/g, "-")
            .toLowerCase()
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join("-")
        : "Not specified";

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
                if (e.key === "Enter") onSaveEdit();
                if (e.key === "Escape") onCancelEdit();
              }}
              className="h-7 text-sm border-0 bg-transparent focus:outline-none"
              autoFocus
              placeholder="e.g., full-time, part-time, contract"
              title="Auto-saves when you click outside"
            />
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={onSaveEdit}
              aria-label="Save"
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={onCancelEdit}
              aria-label="Cancel"
            >
              <XIcon className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        );
      }

      return (
        <div
          className={cn(
            "group relative",
            !job.is_morningbrew && "opacity-70",
          )}
        >
          <div className="flex items-center gap-1">
            <Badge
              variant="outline"
              className="font-normal"
            >
              {displayType}
            </Badge>
            {job.is_morningbrew && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartEdit(job.id, "employment_type", type || "");
                }}
                aria-label="Edit employment type"
              >
                <Pencil className="h-3 w-3 text-gray-600 dark:text-gray-400" />
              </Button>
            )}
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableHiding: true,
    size: 220,
    minSize: 180,
    maxSize: 300,
  },
  {
    accessorKey: "is_remote",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Remote" />
    ),
    cell: ({ row }) => {
      const job = row.original;
      const isEditing =
        editingCell?.jobId === job.id && editingCell?.field === "is_remote";
      // Check for custom value first (at root level), then morningbrew nested, then fall back to original
      const customRemote = job.custom_is_remote || job.morningbrew?.custom_is_remote;
      let displayStatus: string;

      if (customRemote) {
        displayStatus = customRemote;
      } else {
        const isRemote = row.getValue("is_remote") as boolean;
        displayStatus = isRemote ? "Remote" : "On-site";
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
                if (e.key === "Enter") onSaveEdit();
                if (e.key === "Escape") onCancelEdit();
              }}
              onBlur={onSaveEdit}
              className="h-7 text-sm border-0 bg-transparent focus:outline-none cursor-pointer"
              autoFocus
            >
              <option value="Remote">Remote</option>
              <option value="On-site">On-site</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={onSaveEdit}
              aria-label="Save"
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={onCancelEdit}
              aria-label="Cancel"
            >
              <XIcon className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        );
      }

      return (
        <div
          className={cn(
            "group relative",
            !job.is_morningbrew && "opacity-70",
          )}
        >
          <div className="flex items-center gap-1">
            <Badge
              variant="outline"
              className={cn(
                "badge", // Use our fixed badge styles
                displayStatus === "Remote"
                  ? "border-green-300 text-green-600 dark:text-green-400 dark:border-green-700"
                  : displayStatus === "Hybrid"
                    ? "border-blue-300 text-blue-600 dark:text-blue-400 dark:border-blue-700"
                    : "badge-onsite", // Use our custom on-site badge class with proper contrast
              )}
            >
              {displayStatus}
            </Badge>
            {job.is_morningbrew && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartEdit(job.id, "is_remote", customRemote || displayStatus);
                }}
                aria-label="Edit remote status"
              >
                <Pencil className="h-3 w-3 text-gray-600 dark:text-gray-400" />
              </Button>
            )}
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const isRemote = row.getValue(id) as boolean;
      if (value.includes("remote")) return isRemote === true;
      if (value.includes("onsite")) return isRemote === false;
      return true;
    },
    enableHiding: true,
  },
  {
    id: "feed_source",
    accessorFn: (row) => {
      const partnerName = row.single_partner?.partner_name;
      const paymentType = (row.cpa || 0) > 0 ? "CPA" : "CPC";
      return `${partnerName || "Unknown"} ${paymentType}`;
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Feed Source" />
    ),
    cell: ({ row }) => {
      const job = row.original;
      const partnerName = job.single_partner?.partner_name;
      const paymentType = (job.cpa || 0) > 0 ? "CPA" : "CPC";

      return (
        <FeedSourceBadge partnerName={partnerName} paymentType={paymentType} />
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableHiding: true,
    size: 200,
  },
  {
    id: "mb_status",
    accessorFn: (row) => row.morningbrew?.status || "not_in_mb",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="MB Status" />
    ),
    cell: ({ row }) => {
      const job = row.original;
      const status = job.morningbrew?.status;
      const clicks = job.morningbrew?.click_count || 0;

      return (
        <div className="flex flex-col gap-1">
          <MBStatusBadge status={status} />
          {status && clicks > 0 && (
            <div className="text-xs text-muted-foreground">
              {clicks}/30 clicks
              {clicks >= 30 && (
                <span className="text-green-600 font-medium ml-1">
                  ✓ Auto-published
                </span>
              )}
            </div>
          )}
        </div>
      );
    },
    enableHiding: true,
    size: 220,
  },
  {
    id: "cpc",
    accessorFn: (row) => row.cpc || 0,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CPC" />
    ),
    cell: ({ row }) => {
      const job = row.original;
      const cpc = job.cpc || 0;
      const paymentType = (job.cpa || 0) > 0 ? "CPA" : "CPC";
      const isPaidOnCPC = paymentType === "CPC";

      return (
        <div className="text-center">
          <span
            className={cn(
              "font-semibold text-sm salary-value",
              cpc > 0 && isPaidOnCPC
                ? "text-base"
                : "text-gray-400 dark:text-gray-600 text-xs",
            )}
          >
            ${cpc.toFixed(2)}
          </span>
        </div>
      );
    },
    enableHiding: true,
    size: 80,
  },
  {
    id: "cpa",
    accessorFn: (row) => row.cpa || 0,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CPA" />
    ),
    cell: ({ row }) => {
      const job = row.original;
      const cpa = job.cpa || 0;
      const paymentType = (job.cpa || 0) > 0 ? "CPA" : "CPC";
      const isPaidOnCPA = paymentType === "CPA";

      return (
        <div className="text-center">
          <span
            className={cn(
              "font-semibold text-sm salary-value",
              cpa > 0 && isPaidOnCPA
                ? "text-base"
                : "text-gray-400 dark:text-gray-600 text-xs",
            )}
          >
            ${cpa.toFixed(2)}
          </span>
        </div>
      );
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
      const job = row.original;
      if (!job.salary_min && !job.salary_max) {
        return <span className="text-sm text-muted-foreground">-</span>;
      }

      const formatSalary = (amount: number, period?: string) => {
        // Check if it's hourly rate (typically < 200)
        if (period === "hour" || (amount < 200 && !period)) {
          return `$${amount}/hour`;
        }
        // Otherwise format as annual salary
        if (amount >= 1000) {
          return `$${Math.round(amount / 1000)}k`;
        }
        return `$${amount}`;
      };

      let salaryText = "";
      if (job.salary_min && job.salary_max) {
        salaryText = `${formatSalary(job.salary_min, job.salary_period)} - ${formatSalary(job.salary_max, job.salary_period)}`;
      } else if (job.salary_min) {
        salaryText = `${formatSalary(job.salary_min, job.salary_period)}+`;
      } else if (job.salary_max) {
        salaryText = `Up to ${formatSalary(job.salary_max, job.salary_period)}`;
      }

      return <div className="text-sm">{salaryText}</div>;
    },
    enableHiding: true,
    size: 200,
    minSize: 150,
    maxSize: 250,
  },
  {
    accessorKey: "posted_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Posted" />
    ),
    cell: ({ row }) => {
      const postedAt = row.getValue("posted_at") as number;
      if (!postedAt) {
        return <span className="text-sm text-muted-foreground">-</span>;
      }

      const timestamp =
        postedAt.toString().length <= 10 ? postedAt * 1000 : postedAt;
      const date = new Date(timestamp);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      let timeAgo = "";

      if (diffDays === 0) {
        timeAgo = "Today";
      } else if (diffDays === 1) {
        timeAgo = "Yesterday";
      } else if (diffDays < 7) {
        timeAgo = `${diffDays}d ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        timeAgo = `${weeks}w ago`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        timeAgo = `${months}mo ago`;
      } else {
        const years = Math.floor(diffDays / 365);
        timeAgo = `${years}y ago`;
      }

      return (
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-medium px-2 py-0.5",
            diffDays <= 1
              ? "bg-green-50 text-green-700 border-green-200"
              : diffDays < 7
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : diffDays < 30
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : diffDays < 365
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-gray-50 text-gray-600 border-gray-200",
          )}
        >
          {timeAgo}
        </Badge>
      );
    },
    enableHiding: true,
  },
  {
    id: "clicks",
    accessorFn: (row) => row.morningbrew?.click_count || 0,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Clicks" />
    ),
    cell: ({ row }) => {
      const job = row.original;
      const clicks = job.morningbrew?.click_count || 0;
      return (
        <Badge
          variant="outline"
          className={cn(
            "flex w-10 h-6 items-center justify-center font-medium text-xs mx-auto",
            clicks > 0
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-gray-50 text-gray-500 border-gray-200",
          )}
        >
          {clicks}
        </Badge>
      );
    },
    enableHiding: true,
    size: 80,
  },
  {
    id: "morningbrew_brands",
    accessorFn: (row) => {
      if (!row.is_morningbrew || !row.morningbrew?.community_ids) return [];
      return row.morningbrew.community_ids.map((c) => c.id.toString());
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="MB Brands" />
    ),
    cell: ({ row }) => {
      const job = row.original;

      if (!job.is_morningbrew || !job.morningbrew?.community_ids?.length) {
        return null;
      }

      const brands = job.morningbrew.community_ids;
      const visible = brands.slice(0, 2);
      const overflow = brands.length - visible.length;

      return (
        <div className="flex flex-wrap items-center gap-1">
          {job.morningbrew?.is_priority && (
            <Badge variant="warning" className="gap-1 px-2 py-0.5 font-semibold text-xs">
              <Star className="h-3 w-3" />
              Priority
            </Badge>
          )}
          {visible.map((c) => (
            <div
              key={c.id}
              className="group/badge relative inline-flex items-center pr-4"
            >
              <span
                className={cn(
                  "badge badge-default",
                  onRemoveFromCommunity ? "pr-7" : "",
                )}
              >
                {c.community_name}
              </span>
              {onRemoveFromCommunity && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onRemoveFromCommunity(job.id, c.id);
                  }}
                  className="absolute -right-0.5 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-0.5 opacity-50 group-hover/badge:opacity-100 hover:opacity-100 transition-opacity hover:bg-red-50 hover:border-red-300 z-10 cursor-pointer"
                  aria-label={`Remove from ${c.community_name}`}
                >
                  <X className="h-2.5 w-2.5 text-gray-600 hover:text-red-600" />
                </button>
              )}
            </div>
          ))}
          {overflow > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="text-xs cursor-help bg-gray-50 text-gray-600 border-gray-200 px-2 py-0.5 font-medium"
                  >
                    +{overflow}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {brands.map((c) => c.community_name).join(", ")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const brandIds = row.getValue(id) as string[];
      if (!brandIds || brandIds.length === 0) return false;
      return value.some((v: string) => brandIds.includes(v));
    },
    enableHiding: true,
    size: 380,
    minSize: 320,
    maxSize: 500,
  },
  {
    id: "actions",
    size: 100,
    minSize: 80,
    maxSize: 120,
    cell: ({ row }) => {
      const job = row.original;

      return (
        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
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
                        e.stopPropagation();
                        onTogglePriority(
                          job.id,
                          job.morningbrew?.is_priority || false,
                        );
                      }}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          job.morningbrew?.is_priority
                            ? "priority-star"
                            : "text-gray-400 hover:text-gray-600 transition-colors"
                        }`}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {job.morningbrew?.is_priority
                      ? "Remove priority"
                      : "Mark as priority"}
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
                        e.stopPropagation();
                        onRemoveFromMorningBrew(job.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove from Morning Brew</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];

  // Return columns in original order
  return allColumns;
};
