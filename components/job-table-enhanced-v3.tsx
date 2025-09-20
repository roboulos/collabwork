"use client";

import React, { useState, useEffect } from "react";

import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  ColumnSizingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";

import { DataTablePagination } from "./data-table/data-table-pagination";
import { DataTableToolbar } from "./data-table/data-table-toolbar";
import { createJobsColumnsV4 } from "./jobs-columns-v4";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { TableSkeleton } from "./ui/skeleton";
import {
  Table,
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

export function JobTableEnhancedV3() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowSelection, setRowSelection] = useState({});
  const [showMorningBrewOnly, setShowMorningBrewOnly] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
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
    location: 280,
    employment_type: 240,
    is_remote: 140,
    salary: 260,
    mb_status: 220,
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

  useEffect(() => {
    if (!isToggling) {
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
  }, [showMorningBrewOnly]); // Reload when toggle changes

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
    try {
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
        // Load all jobs from feeds - DEFAULT VIEW
        const response = await xanoService.listJobs(0);

        // FIX: Extract custom_company_name from morningbrew object if it exists
        const fixedJobs = (response.items || []).map((job: JobPosting) => ({
          ...job,
          custom_company_name:
            job.morningbrew?.custom_company_name || job.custom_company_name,
          custom_location:
            job.morningbrew?.custom_location || job.custom_location,
        }));

        setJobs(fixedJobs);
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
      if (!isToggling) {
        setLoading(false);
      }
    }
  };

  const handleTogglePriority = async (
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
      await loadJobs();
    }
  };

  const handleRemoveFromMorningBrew = async (jobId: number) => {
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
      await loadJobs();
    }
  };

  const handleRemoveFromCommunity = async (
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
      await loadJobs();
    }
  };

  const handleStartEdit = (
    jobId: number,
    field: string,
    currentValue: string,
  ) => {
    setEditingCell({ jobId, field });
    setEditValue(currentValue || "");
  };

  const handleSaveEdit = async () => {
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
        await xanoService.updateJob(updatePayload);
      }

      setToast({ message: "Job updated successfully", type: "success" });
      // RELOAD JOBS TO GET FRESH DATA AFTER UPDATE
      await loadJobs();
    } catch (error) {
      console.error("Error updating job:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      console.error("Error response:", axiosError.response?.data);
      const errorMessage =
        axiosError.response?.data?.message || "Failed to update job";
      setToast({ message: errorMessage, type: "error" });
      await loadJobs();
    } finally {
      setEditingCell(null);
      setEditValue("");
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const handleCopyJobText = async (job: JobPosting) => {
    const title = job.morningbrew?.formatted_title || job.ai_title || job.title;
    const company = job.custom_company_name || job.company;
    const location =
      job.custom_location ||
      (job.location && job.location[0]
        ? `${job.location[0].city || ""}${job.location[0].state ? `, ${job.location[0].state}` : ""}`
        : "Remote");
    const remote = job.is_remote ? " (Remote)" : " (On-site)";

    const formattedText = `${title} at ${company} - ${location}${remote}`;

    try {
      await navigator.clipboard.writeText(formattedText);
      setToast({ message: "Copied to clipboard", type: "success" });
    } catch {
      setToast({ message: "Failed to copy", type: "error" });
    }
  };

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
    ],
  );

  const table = useReactTable({
    data: tableData,
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
      columnSizing,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    columnResizeMode: "onEnd" as const,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  if (loading) {
    return (
      <Card className="shadow-sm border-border/60">
        <div className="p-4">
          <div className="mb-4 animate-fade-in">
            <h2 className="text-2xl font-bold tracking-tight">Job Postings</h2>
            <p className="text-muted-foreground">
              Manage and curate job listings for MorningBrew newsletters
            </p>
          </div>
          <TableSkeleton rows={8} />
        </div>
      </Card>
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
            />

            <div className="flex-1 rounded-lg border bg-white dark:bg-gray-950 shadow-sm overflow-hidden relative mt-4">
              {(isToggling || loading) && (
                <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 z-50 flex items-center justify-center backdrop-blur-sm">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              )}
              <div className="h-full overflow-auto relative">
                <Table className="relative min-w-[2000px]">
                  <TableHeader className="bg-white dark:bg-gray-950 sticky top-0 z-20 border-b-2 border-gray-200 dark:border-gray-700 shadow-sm">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead
                              key={`${headerGroup.id}_${header.id}`}
                              colSpan={header.colSpan}
                              style={{ width: header.getSize() }}
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
                          );
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
                          onClick={(e) => {
                            const target = e.target as HTMLElement;
                            const isButton = target.closest("button");
                            const isLink = target.closest("a");
                            const isCheckbox = target.closest(
                              'input[type="checkbox"]',
                            );
                            const isInput =
                              target.closest('input[type="text"]');

                            if (
                              !isButton &&
                              !isLink &&
                              !isCheckbox &&
                              !isInput
                            ) {
                              row.toggleSelected();
                            }
                          }}
                          className={cn(
                            "group cursor-pointer transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-900/50",
                            row.original.is_morningbrew &&
                              row.original.morningbrew?.is_priority &&
                              "bg-amber-50/30 hover:bg-amber-50/50",
                          )}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={`${row.id}_${cell.column.id}`}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
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
