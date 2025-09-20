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
      className: "bg-purple-50 text-purple-700 border-purple-200 font-medium",
      icon: "sparkles",
    },
    user_added: {
      label: "Added",
      className: "bg-blue-50 text-blue-700 border-blue-200 font-medium",
      icon: "plus",
    },
    approved: {
      label: "Approved",
      className: "bg-green-100 text-green-700 border-green-300",
    },
    published: {
      label: "Published",
      className: "bg-blue-100 text-blue-700 border-blue-300",
    },
    archived: {
      label: "Archived",
      className: "bg-gray-200 text-gray-600 border-gray-400",
    },
    deleted: {
      label: "Deleted",
      className: "bg-red-100 text-red-700 border-red-300",
    },
    rejected: {
      label: "Rejected",
      className: "bg-orange-100 text-orange-700 border-orange-300",
    },
    closed: {
      label: "Closed",
      className: "bg-gray-300 text-gray-800 border-gray-500",
    },
  };

  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-700 border-gray-300",
  };

  return (
    <Badge
      className={cn(
        config.className,
        "border inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs",
      )}
    >
      {status === "suggested" && <Sparkles className="h-3 w-3" />}
      {status === "user_added" && <Plus className="h-3 w-3" />}
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
  onCancelEdit,
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
              title="Press Enter to save, Esc to cancel"
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
          className={cn("group cursor-text", isSourceDeleted && "opacity-60")}
          onDoubleClick={() => onStartEdit(job.id, "company", company)}
        >
          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-tight group-hover:underline group-hover:decoration-dotted block">
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
              title="Press Enter to save, Esc to cancel"
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

      const title =
        job.morningbrew?.formatted_title || job.ai_title || job.title;

      return (
        <div className={cn("space-y-1.5", isSourceDeleted && "opacity-60")}>
          <div
            className="group cursor-text"
            onDoubleClick={() => onStartEdit(job.id, "title", title)}
          >
            {job.application_url && !isSourceDeleted ? (
              <a
                href={job.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="leading-tight font-medium">
                  {title || "Untitled Position"}
                </span>
                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
              </a>
            ) : (
              <span
                className={cn(
                  "font-semibold text-sm text-gray-900 dark:text-gray-100 leading-tight block group-hover:underline group-hover:decoration-dotted",
                  isSourceDeleted && "line-through decoration-red-400",
                )}
              >
                {title || "Untitled Position"}
              </span>
            )}
            {job.morningbrew?.formatted_title &&
              job.morningbrew.formatted_title !== job.ai_title && (
                <span className="text-xs text-muted-foreground/70 italic">
                  was: {job.ai_title || job.title}
                </span>
              )}
          </div>
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
      let location = job.custom_location;

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
        job.morningbrew?.cached_location || location || "Not specified";

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
              title="Press Enter to save, Esc to cancel"
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
          className="group cursor-text"
          onDoubleClick={() => onStartEdit(job.id, "location", displayLocation)}
        >
          <span className="text-sm group-hover:underline group-hover:decoration-dotted">
            {displayLocation}
          </span>
          {job.morningbrew?.cached_location &&
            job.morningbrew.cached_location !== location && (
              <span className="text-xs text-muted-foreground block">
                Original: {location}
              </span>
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
              title="Press Enter to save, Esc to cancel"
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
            "group",
            job.is_morningbrew
              ? "cursor-text"
              : "cursor-not-allowed opacity-70",
          )}
          onDoubleClick={() =>
            job.is_morningbrew &&
            onStartEdit(job.id, "employment_type", type || "")
          }
          title={
            !job.is_morningbrew
              ? "Add to Morning Brew to edit this field"
              : "Double-click to edit"
          }
        >
          <Badge
            variant="outline"
            className={cn(
              "font-normal",
              job.is_morningbrew &&
                "group-hover:ring-1 group-hover:ring-gray-300",
            )}
          >
            {displayType}
          </Badge>
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
      const customRemote = job.morningbrew?.custom_is_remote;
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
            "group",
            job.is_morningbrew
              ? "cursor-text"
              : "cursor-not-allowed opacity-70",
          )}
          onDoubleClick={() =>
            job.is_morningbrew &&
            onStartEdit(job.id, "is_remote", displayStatus)
          }
          title={
            !job.is_morningbrew
              ? "Add to Morning Brew to edit this field"
              : "Double-click to edit"
          }
        >
          <Badge
            variant="outline"
            className={cn(
              job.is_morningbrew &&
                "group-hover:ring-1 group-hover:ring-gray-300",
              displayStatus === "Remote"
                ? "border-green-300 text-green-600"
                : displayStatus === "Hybrid"
                  ? "border-blue-300 text-blue-600"
                  : "border-gray-200 text-gray-400",
            )}
          >
            {displayStatus}
          </Badge>
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
              "font-semibold text-sm",
              cpc > 0 && isPaidOnCPC
                ? "text-blue-700 text-base"
                : "text-gray-400 text-xs",
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
              "font-semibold text-sm",
              cpa > 0 && isPaidOnCPA
                ? "text-green-700 text-base"
                : "text-gray-400 text-xs",
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
            <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-medium px-2 py-0.5">
              <Star className="h-3 w-3 mr-1 fill-amber-500" />
              Priority
            </Badge>
          )}
          {visible.map((c) => (
            <div
              key={c.id}
              className="group/badge relative inline-flex items-center"
            >
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-medium bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 transition-colors py-0.5",
                  onRemoveFromCommunity ? "pr-7" : "px-2",
                )}
              >
                {c.community_name}
              </Badge>
              {onRemoveFromCommunity && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onRemoveFromCommunity(job.id, c.id);
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-0.5 opacity-50 group-hover/badge:opacity-100 hover:opacity-100 transition-opacity hover:bg-red-50 hover:border-red-300 z-10 cursor-pointer"
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
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopyJob(job);
                  }}
                  aria-label="Copy job text for newsletter"
                >
                  <Copy className="h-4 w-4 text-gray-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy job text for newsletter</TooltipContent>
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
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-gray-400"
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
                  <TooltipContent>Remove from MorningBrew</TooltipContent>
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
