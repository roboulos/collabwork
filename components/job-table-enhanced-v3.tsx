"use client";

import React, { useState, useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  ColumnSizingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
  Table as TanstackTable,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { LoadingOverlay } from "./ui/loading-overlay";

import { DataTablePagination } from "./data-table/data-table-pagination";
import { DataTableToolbar } from "./data-table/data-table-toolbar";
import { createJobsColumnsV4 } from "./jobs-columns-v4";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Toast } from "./ui/toast";

import { cn } from "@/lib/utils";
import {
  xanoService,
  JobPosting,
  Community,
  UpdateJobPayload,
} from "@/lib/xano";
import "../styles/table-theme.css";

// Virtualized table component  
interface VirtualizedTableProps {
  table: TanstackTable<JobPosting>;
  columns: ColumnDef<JobPosting>[];
}

function VirtualizedTable({ table, columns }: VirtualizedTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52, // Match CSS min-height
    overscan: 5, // Reduced overscan for better performance with huge datasets
    // Enable smooth scroll handling for large datasets
    scrollMargin: 200,
    // Improve measurement caching
    measureElement: typeof window !== 'undefined' && rows.length > 1000 
      ? undefined  // Skip measuring for very large datasets
      : (element) => element?.getBoundingClientRect().height || 52,
  });

  const virtualItems = virtualizer.getVirtualItems();
  
  // Column sizing is available from table state if needed
  // const columnSizing = table.getState().columnSizing;

  // Get column definitions with explicit widths for perfect alignment
  const columnHeaders = table.getFlatHeaders();
  
  return (
    <div ref={parentRef} className="h-full overflow-auto relative">
      <div className="min-w-[2000px]">
        {/* Sticky header with solid background */}
        <div className="sticky top-0 z-30 bg-white dark:bg-gray-950 border-b-2 border-gray-200 dark:border-gray-700 shadow-md">
          <table className="w-full table-fixed bg-white dark:bg-gray-950">
            <colgroup>
              {columnHeaders.map((header) => (
                <col
                  key={header.id}
                  style={{
                    width: header.getSize(),
                  }}
                />
              ))}
            </colgroup>
            <TableHeader className="bg-gray-50 dark:bg-gray-900">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={`${headerGroup.id}_${header.id}`}
                  colSpan={header.colSpan}
                  className="relative"
                >
                  {header.isPlaceholder ? null : (
                    <>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
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
              ))}
            </TableRow>
          ))}
        </TableHeader>
          </table>
        </div>
        
        {/* Table body with same column structure */}
        <table className="w-full table-fixed relative">
          <colgroup>
            {columnHeaders.map((header) => (
              <col
                key={header.id}
                style={{
                  width: header.getSize(),
                }}
              />
            ))}
          </colgroup>
          <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          ) : (
            <>
              {/* Virtual spacer before - only if we're scrolled down */}
              {virtualItems.length > 0 && virtualItems[0]?.index > 0 && (
                <tr>
                  <td colSpan={columns.length} style={{ height: `${virtualItems[0].start}px` }} />
                </tr>
              )}
              
              {/* Render visible rows */}
              {virtualItems.map((virtualItem) => {
                const row = rows[virtualItem.index];
                return (
                  <TableRow
                    key={row.id}
                    ref={(node) => {
                      if (node && virtualizer.measureElement) {
                        virtualizer.measureElement(node);
                      }
                    }}
                    data-selected={row.getIsSelected()}
                    data-priority={(row.original as JobPosting).morningbrew?.is_priority || false}
                    data-morningbrew={(row.original as JobPosting).is_morningbrew || false}
                    className="job-row"
                    onClick={(e: React.MouseEvent<HTMLTableRowElement>) => {
                      if (e.detail === 2) return;
                      const target = e.target as HTMLElement;
                      const isButton = target.closest("button");
                      const isLink = target.closest("a");
                      const isCheckbox = target.closest('input[type="checkbox"]');
                      const isInput = target.closest('input[type="text"]');

                      if (!isButton && !isLink && !isCheckbox && !isInput) {
                        row.toggleSelected();
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={`${row.id}_${cell.column.id}`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
              
              {/* Virtual spacer after */}
              {virtualItems.length > 0 && 
                virtualItems[virtualItems.length - 1]?.index < rows.length - 1 && (
                <tr>
                  <td 
                    colSpan={columns.length} 
                    style={{ 
                      height: `${virtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1]?.end || 0)}px` 
                    }} 
                  />
                </tr>
              )}
            </>
          )}
        </TableBody>
        </table>
      </div>
    </div>
  );
}

export function JobTableEnhancedV3() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowSelection, setRowSelection] = useState({});
  const [showMorningBrewOnly, setShowMorningBrewOnly] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const loadingRef = useRef(false);
  
  // Server-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(500); // Increased to test virtualization
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    location: true,
    employment_type: true,
    is_remote: true,
    salary: true,
    description: true,
    cpc: true,
    cpa: true,
    feed_source: true,
    mb_status: true,
    clicks: true,
    payment_source: true,
    post_source: true,
    morningbrew_brands: true,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({
    select: 45,
    company: 320,
    job_formula: 500,
    location: 180,  // Reduced from 280
    employment_type: 100,  // Reduced from 240
    is_remote: 140,
    salary: 120,  // Reduced from 260
    mb_status: 100,  // Reduced from 220
    morningbrew_brands: 480,
    clicks: 90,
    cpc: 100,
    cpa: 100,
    feed_source: 200,
    posted_at: 110,
    actions: 110,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "posted_at", desc: true },
  ]);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCommunities, setSelectedCommunities] = useState<Set<string>>(
    new Set(),
  );
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Inline editing state
  const [editingCell, setEditingCell] = useState<{
    jobId: number;
    field: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    loadCommunities();
  }, []);

  // Handle search on Enter key
  const handleSearch = (value: string) => {
    setDebouncedSearch(value);
    setCurrentPage(1); // Reset to first page on search
  };

  useEffect(() => {
    if (!isToggling) {
      // Clear cached data when switching views for fresh load
      setJobs([]);
      setTotalItems(0);
      loadJobs();
    }
    // Update column visibility based on view
    if (showMorningBrewOnly) {
      // Hide these columns in Morning Brew view
      setColumnVisibility((prev) => ({
        ...prev,
        cpc: false,
        cpa: false,
        salary: false,
        feed_source: false,
      }));
    } else {
      // Show all columns in default view
      setColumnVisibility((prev) => ({
        ...prev,
        cpc: true,
        cpa: true,
        salary: true,
        feed_source: true,
      }));
    }
  }, [showMorningBrewOnly, currentPage, pageSize, debouncedSearch, isToggling]); // Added isToggling to dependencies

  const loadCommunities = async () => {
    try {
      const response = await xanoService.getCommunities();
      setCommunities(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error loading communities:", error);
      setToast({ message: "Failed to load communities", type: "error" });
      // Set some default communities to prevent empty state
      setCommunities([]);
    }
  };

  const loadJobs = async (retryCount = 0) => {
    // Prevent duplicate calls
    if (loadingRef.current) {
      console.log("Already loading, skipping duplicate call");
      return;
    }
    
    try {
      loadingRef.current = true;
      // Don't set loading if we're toggling views to prevent flash
      if (!isToggling) {
        setLoading(true);
      }
      if (showMorningBrewOnly) {
        // Load Morning Brew curated jobs
        const response = await xanoService.listMorningBrewJobs(1, "", 100);

        const transformedJobs = (response.items || []).map(
          (mbJob: {
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
            is_priority?: boolean;  // Add this field to the type
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
            morningbrew?: {
              custom_company_name?: string;
              custom_location?: string;
              custom_employment_type?: string;
              custom_is_remote?: string;
            };
          }) => {
            // Use job_posting data as base, then override with MB-specific data
            const baseJob = mbJob.job_posting || ({} as JobPosting);

            // Preserve feed source data when source is deleted
            const feedSource =
              mbJob.is_source_deleted && mbJob.cached_feed_source
                ? {
                    partner_name: mbJob.cached_feed_source,
                    payment_type: mbJob.cached_payment_type || "",
                  }
                : baseJob.single_partner || {
                    partner_name: "",
                    payment_type: "",
                  };

            // Preserve posted date when source is deleted
            const postedAt =
              mbJob.is_source_deleted && mbJob.cached_posted_at
                ? mbJob.cached_posted_at
                : baseJob.posted_at || mbJob.created_at || Date.now();

            return {
              // Spread all job_posting fields first
              ...baseJob,
              // Then override with MB-specific fields
              id: mbJob.job_posting_id,
              company: baseJob.company || mbJob.company || "",
              title: mbJob.title || baseJob.title || "",
              ai_title:
                mbJob.formatted_title ||
                baseJob.ai_title ||
                baseJob.title ||
                "",
              location: mbJob.location || baseJob.location || [],
              is_morningbrew: true,
              // Get custom fields from morningbrew object (where they're actually stored)
              custom_company_name:
                mbJob.morningbrew?.custom_company_name ||
                baseJob.custom_company_name,
              custom_location:
                mbJob.morningbrew?.custom_location || baseJob.custom_location,
              // Use preserved feed source data
              single_partner: feedSource,
              cpc:
                mbJob.cached_cpc !== undefined
                  ? mbJob.cached_cpc
                  : baseJob.cpc || 0,
              cpa:
                mbJob.cached_cpa !== undefined
                  ? mbJob.cached_cpa
                  : baseJob.cpa || 0,
              posted_at: postedAt,
              morningbrew: {
                id: mbJob.id,
                status: mbJob.status || "suggested",
                click_count: mbJob.click_count || 0,
                is_priority: mbJob.is_priority || false,  // Include the priority flag!
                community_ids: (mbJob.community_ids || []).map(
                  (id: number) => ({
                    id: id,
                    community_name:
                      communities.find((c) => c.id === id)?.community_name ||
                      `Brand ${id}`,
                  }),
                ),
                formatted_title: mbJob.formatted_title,
                is_source_deleted: mbJob.is_source_deleted || false,
                custom_employment_type:
                  mbJob.morningbrew?.custom_employment_type,
                custom_is_remote: mbJob.morningbrew?.custom_is_remote,
              },
            };
          },
        );
        setJobs(transformedJobs);
      } else {
        // Load jobs with pagination - DEFAULT VIEW
        console.log(`Fetching ${pageSize} records from API...`);
        const startTime = Date.now();
        
        console.log("Calling listJobs with search:", debouncedSearch);
        const response = await xanoService.listJobs(
          currentPage,
          pageSize,
          debouncedSearch,
          {} // TODO: Convert columnFilters to proper format
        );
        console.log("Search response:", response);
        
        const loadTime = Date.now() - startTime;
        console.log(`API Response - page: ${currentPage}, pageSize: ${pageSize}`);
        console.log(`Response items count: ${response.items?.length || response.length}`);
        console.log(`Load time: ${loadTime}ms`);

        // Handle pagination response
        if (response.items) {
          // FIX: Extract custom fields from morningbrew object if it exists
          const fixedJobs = (response.items || []).map((job: JobPosting) => ({
            ...job,
            custom_company_name:
              job.morningbrew?.custom_company_name || job.custom_company_name,
            custom_location:
              job.morningbrew?.custom_location || job.custom_location,
            // Add the missing custom employment type and remote fields
            morningbrew: job.morningbrew ? {
              ...job.morningbrew,
              custom_employment_type: job.morningbrew.custom_employment_type,
              custom_is_remote: job.morningbrew.custom_is_remote
            } : job.morningbrew
          }));

          setJobs(fixedJobs);
          // Since Xano doesn't return itemsTotal, we'll use a different approach
          // If there's a nextPage, we know there are more records
          if (response.nextPage) {
            // Estimate total items based on current page and the fact there's more
            // This ensures pagination controls work
            setTotalItems((currentPage + 5) * pageSize); // Show at least 5 more pages
          } else {
            // We're on the last page
            setTotalItems((currentPage - 1) * pageSize + response.itemsReceived);
          }
        } else {
          // Fallback for APIs that return array directly
          setJobs(response);
          setTotalItems(response.length);
        }
      }
    } catch (error: unknown) {
      console.error("Error loading jobs:", error);

      // Retry once on 500 errors
      const axiosError = error as { response?: { status?: number } };
      if (axiosError?.response?.status === 500 && retryCount < 1) {
        console.log("Retrying API call...");
        setTimeout(() => loadJobs(retryCount + 1), 1000);
        return;
      }

      setToast({
        message: "Failed to load jobs. Please refresh the page.",
        type: "error",
      });
      setJobs([]);
    } finally {
      loadingRef.current = false;
      if (!isToggling) {
        setLoading(false);
      }
    }
  };

  const handleTogglePriority = React.useCallback(async (
    jobId: number,
    currentPriority: boolean,
  ) => {
    // Optimistic update
    setJobs((prevJobs) =>
      prevJobs.map((job) => {
        if (job.id === jobId && job.morningbrew) {
          return {
            ...job,
            morningbrew: {
              ...job.morningbrew,
              is_priority: !currentPriority,
            },
          };
        }
        return job;
      }),
    );

    try {
      await xanoService.addJobPriority({
        job_posting_id: jobId.toString(),
        community_ids: [],
        notes: "",
        is_priority: !currentPriority,
        priority_reason: !currentPriority ? "Marked as priority by user" : "",
      });
      setToast({ message: "Priority updated", type: "success" });
    } catch (error) {
      console.error("Error toggling priority:", error);
      setToast({ message: "Failed to update priority", type: "error" });
      // Revert the optimistic update on error
      setJobs((prevJobs) =>
        prevJobs.map((job) => {
          if (job.id === jobId) {
            return {
              ...job,
              morningbrew: job.morningbrew
                ? { ...job.morningbrew, is_priority: currentPriority }
                : undefined,
            };
          }
          return job;
        }),
      );
    }
  }, []);

  const handleRemoveFromMorningBrew = React.useCallback(async (jobId: number) => {
    // Optimistic update
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId
          ? { ...job, is_morningbrew: false, morningbrew: undefined }
          : job,
      ),
    );

    try {
      await xanoService.removeJob(jobId.toString());
      setToast({ message: "Job removed from MorningBrew", type: "success" });
    } catch (error) {
      console.error("Error removing job from MorningBrew:", error);
      setToast({ message: "Failed to remove job", type: "error" });
      // Revert the optimistic update on error
      const originalJob = jobs.find(j => j.id === jobId);
      if (originalJob) {
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job.id === jobId ? originalJob : job
          ),
        );
      }
    }
  }, [jobs]);

  const handleRemoveFromCommunity = React.useCallback(async (
    jobId: number,
    communityId: number,
  ) => {
    // Find the job and check how many communities it has
    const job = jobs.find((j) => j.id === jobId);
    if (!job || !job.morningbrew) return;

    const currentCommunities = job.morningbrew.community_ids || [];
    const communityName =
      currentCommunities.find((c) => c.id === communityId)?.community_name ||
      "community";

    // If this is the last community, show a friendly message
    if (currentCommunities.length === 1) {
      setToast({
        message: `Can't remove last community. Use the X button to remove from Morning Brew entirely.`,
        type: "error",
      });
      return;
    }

    // Optimistic update - remove the community from the job immediately
    setJobs((prevJobs) =>
      prevJobs.map((j) => {
        if (j.id === jobId && j.morningbrew) {
          return {
            ...j,
            morningbrew: {
              ...j.morningbrew,
              community_ids:
                j.morningbrew.community_ids?.filter(
                  (c) => c.id !== communityId,
                ) || [],
            },
          };
        }
        return j;
      }),
    );

    try {
      await xanoService.removeJobFromCommunity(jobId, communityId);
      setToast({ message: `Removed from ${communityName}`, type: "success" });
    } catch (error) {
      console.error("API ERROR:", error);
      setToast({ message: "Failed to remove from community", type: "error" });
      // Revert the optimistic update on error
      const originalJob = jobs.find(j => j.id === jobId);
      if (originalJob) {
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job.id === jobId ? originalJob : job
          ),
        );
      }
    }
  }, [jobs]);

  const handleStartEdit = React.useCallback(
    (jobId: number, field: string, currentValue: string) => {
      console.log("handleStartEdit called with:", { jobId, field, currentValue });
      setEditingCell({ jobId, field });
      setEditValue(currentValue || "");
    },
    [],
  );

  const handleSaveEdit = React.useCallback(async () => {
    if (!editingCell) return;

    const job = jobs.find((j) => j.id === editingCell.jobId);
    if (!job) return;

    // Optimistic update
    setJobs((prevJobs) =>
      prevJobs.map((j) => {
        if (j.id === editingCell.jobId) {
          if (editingCell.field === "title") {
            return {
              ...j,
              morningbrew: j.morningbrew
                ? {
                    ...j.morningbrew,
                    formatted_title: editValue,
                  }
                : undefined,
            };
          } else if (editingCell.field === "company") {
            return { ...j, custom_company_name: editValue };
          } else if (editingCell.field === "location") {
            return { ...j, custom_location: editValue };
          } else if (editingCell.field === "employment_type") {
            return {
              ...j,
              morningbrew: j.morningbrew
                ? {
                    ...j.morningbrew,
                    custom_employment_type: editValue,
                  }
                : undefined,
            };
          } else if (editingCell.field === "is_remote") {
            return {
              ...j,
              morningbrew: j.morningbrew
                ? {
                    ...j.morningbrew,
                    custom_is_remote: editValue,
                  }
                : undefined,
            };
          }
        }
        return j;
      }),
    );

    try {
      // For title field, use the existing brew/update-details endpoint
      if (editingCell.field === "title") {
        await xanoService.updateJobField(
          editingCell.jobId,
          "formatted_title",
          editValue,
        );
      } else {
        // Check if job has morningbrew record for employment_type and is_remote fields
        if (
          (editingCell.field === "employment_type" ||
            editingCell.field === "is_remote") &&
          !job.is_morningbrew
        ) {
          setToast({
            message:
              "Please add this job to Morning Brew first before editing this field",
            type: "error",
          });
          setEditingCell(null);
          setEditValue("");
          return;
        }

        // For all other fields, use ashley/update-job endpoint
        const updatePayload: UpdateJobPayload = {
          job_posting_id: editingCell.jobId.toString(),
        };

        if (editingCell.field === "company") {
          updatePayload.custom_company_name = editValue;
        } else if (editingCell.field === "location") {
          updatePayload.custom_location = editValue;
        } else if (editingCell.field === "employment_type") {
          updatePayload.custom_employment_type = editValue;
        } else if (editingCell.field === "is_remote") {
          updatePayload.custom_is_remote = editValue;
        }

        console.log("Updating job with payload:", updatePayload);
        console.log("Current job data before update:", {
          id: job.id,
          is_morningbrew: job.is_morningbrew,
          custom_employment_type: job.morningbrew?.custom_employment_type,
          custom_is_remote: job.morningbrew?.custom_is_remote,
          employment_type: job.employment_type,
          is_remote: job.is_remote
        });
        
        const updateResponse = await xanoService.updateJob(updatePayload);
        console.log("Update response from API:", updateResponse);
      }

      setToast({ message: "Job updated successfully", type: "success" });
      // Don't reload all data - the local state update above is sufficient
      console.log("Job updated locally without full reload");
    } catch (error) {
      console.error("Error updating job:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      console.error("Error response:", axiosError.response?.data);
      const errorMessage =
        axiosError.response?.data?.message || "Failed to update job";
      setToast({ message: errorMessage, type: "error" });
      // On error, revert the local state back
      setJobs(jobs);
    } finally {
      setEditingCell(null);
      setEditValue("");
    }
  }, [editingCell, editValue, jobs]);

  const handleCancelEdit = React.useCallback(() => {
    setEditingCell(null);
    setEditValue("");
  }, []);

  const handleCopyJobText = React.useCallback(async (job: JobPosting) => {
    const title = job.morningbrew?.formatted_title || job.ai_title || job.title;
    const company = job.custom_company_name || job.company;
    
    // Determine work type - check custom field first, then fallback to is_remote
    let workType = "On-site"; // default
    if (job.morningbrew?.custom_is_remote) {
      workType = job.morningbrew.custom_is_remote; // Use Ashley's edited value (Remote/Hybrid/On-site)
    } else if (job.is_remote) {
      workType = "Remote";
    }

    const formattedText = `${title} at ${company} (${workType})`;

    try {
      await navigator.clipboard.writeText(formattedText);
      setToast({ message: "Copied to clipboard", type: "success" });
    } catch {
      setToast({ message: "Failed to copy", type: "error" });
    }
  }, []);

  const handleAddJobs = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) return;
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const communityIds = Array.from(selectedCommunities).map((id) =>
        parseInt(id),
      );
      const selectedRows = table.getFilteredSelectedRowModel().rows;
      const selectedJobIds = selectedRows.map((row) =>
        row.original.id.toString(),
      );

      // Optimistic update
      const selectedCommunityDetails = communities.filter((c) =>
        selectedCommunities.has(c.id.toString()),
      );

      setJobs((prevJobs) =>
        prevJobs.map((job) => {
          if (selectedJobIds.includes(job.id.toString())) {
            return {
              ...job,
              is_morningbrew: true,
              morningbrew: {
                community_ids: selectedCommunityDetails.map((c) => ({
                  id: c.id,
                  community_name: c.community_name,
                })),
                is_priority: job.morningbrew?.is_priority || false,
                status: "suggested",
                click_count: 0,
              },
            };
          }
          return job;
        }),
      );

      // Close modal and reset
      setModalOpen(false);
      setRowSelection({});
      setSelectedCommunities(new Set());
      setNotes("");

      // Make API calls
      for (const jobId of selectedJobIds) {
        await xanoService.addJobPriority({
          job_posting_id: jobId,
          community_ids: communityIds,
          notes,
          is_priority: false,
          priority_reason: "",
        });
      }

      setToast({
        message: `Added ${selectedJobIds.length} jobs to MorningBrew`,
        type: "success",
      });
      
      // Refresh data to show the updated state
      await loadJobs();
      
      // Clear selection and close modal
      setRowSelection({});
      setModalOpen(false);
    } catch (error) {
      console.error("Error submitting jobs:", error);
      setToast({ message: "Failed to add jobs", type: "error" });
      await loadJobs();
    } finally {
      setSubmitting(false);
    }
  };

  // Use jobs directly for the table
  const tableData = jobs;

  const columns = React.useMemo(
    () =>
      createJobsColumnsV4({
        onTogglePriority: handleTogglePriority,
        onRemoveFromMorningBrew: handleRemoveFromMorningBrew,
        onRemoveFromCommunity: handleRemoveFromCommunity,
        onCopyJob: handleCopyJobText,
        onStartEdit: handleStartEdit,
        editingCell,
        editValue,
        setEditValue,
        onSaveEdit: handleSaveEdit,
        onCancelEdit: handleCancelEdit,
      }),
    [
      editingCell,
      editValue,
      handleTogglePriority,
      handleRemoveFromMorningBrew,
      handleRemoveFromCommunity,
      handleCopyJobText,
      handleStartEdit,
      handleSaveEdit,
      handleCancelEdit,
      setEditValue,
    ],
  );

  const table = useReactTable({
    data: tableData,
    columns,
    pageCount: totalItems > 0 ? Math.ceil(totalItems / pageSize) : -1, // -1 for unknown page count
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      columnSizing,
      pagination: {
        pageIndex: currentPage - 1, // 0-indexed for TanStack
        pageSize,
      },
    },
    manualPagination: true, // Enable server-side pagination
    manualFiltering: true, // Enable server-side filtering
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' 
        ? updater({ pageIndex: currentPage - 1, pageSize })
        : updater;
      
      const newPage = newPagination.pageIndex + 1;
      const newPageSize = newPagination.pageSize;
      
      // Only update if values actually changed
      if (newPage !== currentPage) {
        setCurrentPage(newPage);
      }
      if (newPageSize !== pageSize) {
        setPageSize(newPageSize);
      }
    },
    columnResizeMode: "onEnd" as const,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // Show full-page loading on initial load
  if (loading && jobs.length === 0) {
    return (
      <div className="relative h-screen">
        <LoadingOverlay 
          type="loading" 
          message="Loading job listings..."
        />
      </div>
    );
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

      <div className="flex flex-col h-[calc(100vh-64px)]">
        <div className="flex-1 overflow-hidden px-6 pt-6">
          <div
            className="flex flex-col"
            style={{ height: "calc(100vh - 104px)" }}
          >
            <DataTableToolbar
              table={table}
              onAddJobs={handleAddJobs}
              filterColumn="job_formula"
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={handleSearch}
              brandOptions={communities.map((c) => ({
                value: c.id.toString(),
                label: c.community_name,
              }))}
              feedOptions={(() => {
                const feedSources = new Set<string>();
                jobs.forEach((job) => {
                  const partnerName = job.single_partner?.partner_name;
                  const paymentType = (job.cpa || 0) > 0 ? "CPA" : "CPC";
                  if (partnerName) {
                    feedSources.add(`${partnerName} ${paymentType}`);
                  }
                });
                return Array.from(feedSources)
                  .map((feed) => ({
                    value: feed,
                    label: feed,
                  }))
                  .sort((a, b) => a.label.localeCompare(b.label));
              })()}
              showMorningBrewOnly={showMorningBrewOnly}
              onToggleMorningBrewView={(value) => {
                setIsToggling(true);
                setRowSelection({}); // Reset selection when toggling
                // Small delay to prevent flash
                setTimeout(() => {
                  setShowMorningBrewOnly(value);
                  setTimeout(() => setIsToggling(false), 100);
                }, 50);
              }}
              totalItems={totalItems}
            />

            <div className={cn(
              "flex-1 rounded-lg border bg-white dark:bg-gray-950 shadow-sm overflow-hidden relative mt-4 table-container",
              showMorningBrewOnly && "morningbrew-view"
            )}>
              {(isToggling || (loading && jobs.length > 0)) && (
                <LoadingOverlay 
                  type={isToggling ? "toggle" : debouncedSearch ? "search" : "loading"}
                  message={
                    isToggling 
                      ? showMorningBrewOnly 
                        ? "Switching to all jobs..." 
                        : "Loading Morning Brew jobs..."
                      : debouncedSearch 
                        ? `Searching for "${debouncedSearch}"...`
                        : undefined
                  }
                />
              )}
              <VirtualizedTable table={table} columns={columns} />
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <DataTablePagination table={table} />
            </div>
          </div>
        </div>
      </div>

      {/* Add Jobs Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Jobs to MorningBrew</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <h3 className="text-sm font-medium mb-3">
                Select MorningBrew Brands:
              </h3>
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
                          setSelectedCommunities((prev) =>
                            new Set(prev).add(community.id.toString()),
                          );
                        } else {
                          setSelectedCommunities((prev) => {
                            const newSet = new Set(prev);
                            newSet.delete(community.id.toString());
                            return newSet;
                          });
                        }
                      }}
                    />
                    <span>{community.community_name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Notes (optional)
              </label>
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
  );
}
