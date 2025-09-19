# Morning Brew System Implementation Status

## Overview
Implementing the Morning Brew system fixes based on the comprehensive PRD to create one Xano backend driving three frontends (Ashley Admin, Brew Dashboard, Public Board) with proper revenue tracking and unified workflow.

## Key Documents
- **PRD**: `/Users/sboulos/Desktop/ai_projects/brewfrontend/FINAL_REMAINING_FIXES_PRD.md`
- **Xano Plan**: `/Users/sboulos/Desktop/ai_projects/brewfrontend/XANO_IMPLEMENTATION_PLAN.md` (95%+ confidence)
- **Context**: `/Users/sboulos/Desktop/ai_projects/brewfrontend/CONVERSATION_CONTEXT.md`

## System Architecture
- **Xano Backend**: api.collabwork.com (workspace 10)
- **Three Frontends**:
  1. Ashley Admin: `/Users/sboulos/Desktop/ai_projects/ashleyfrontend/ashleyfrontend`
  2. Brew Dashboard: `/Users/sboulos/Desktop/ai_projects/brewfrontend`
  3. Public Board: `/Users/sboulos/Desktop/ai_projects/publicjobsfrontend/brew-public-board`

## Ashley Admin - COMPLETED ✅

### What Was Already Working
1. **Authentication**: Login works, token stored, service methods exist
2. **Feed columns**: feed_source, cpc, cpa already visible
3. **Morning Brew toggle**: Shows MB-specific data when enabled
4. **Service methods**: generateTrackingLink, updateJobField already in `lib/xano.ts`

### What We Fixed
1. **Inline editing** (job-table-enhanced-v3.tsx):
   - Changed from `xanoService.updateJob()` to `xanoService.updateJobField()`
   - Updated field mapping: `cached_job_title` → `formatted_title`
   - Now calls brew/update-details endpoint

2. **Feed filter** (data-table-toolbar.tsx):
   - Added feedOptions prop to interface
   - Added DataTableFacetedFilter for feed_source
   - Updated job-table-enhanced-v3.tsx to pass feedOptions
   - Added filterFn to feed_source column in jobs-columns-v4.tsx

### Files Modified
- `/ashleyfrontend/components/job-table-enhanced-v3.tsx` - inline editing, feed options
- `/ashleyfrontend/components/jobs-columns-v4.tsx` - formatted_title display, filterFn
- `/ashleyfrontend/components/data-table/data-table-toolbar.tsx` - feed filter UI

## Brew Dashboard - TODO

### Service Layer Updates Needed
File: `/Users/sboulos/Desktop/ai_projects/brewfrontend/lib/xano.ts`
- ✅ Already has updateStatus, updateDetails, listBrewJobs methods (lines 305-334)

### Component Updates Needed
File: `/Users/sboulos/Desktop/ai_projects/brewfrontend/components/jobs-data-table.tsx`

1. **CopyLinkButton** (lines 60-120):
   - Update to use `xanoService.generateTrackingLink()`
   - Copy the tracking_link URL
   - Show revenue-protection toast
   - Disable when `job.morningbrew?.is_source_deleted`

2. **handlePublishJob** (lines 247-269):
   - Call `xanoService.updateStatus(jobId, 'published', {manual: true})`

3. **handleRejectJob** (lines 222-245):
   - Call `xanoService.updateStatus(jobId, 'rejected', reason)`

4. **Status badges** (lines 511-544):
   - Add styles for published, rejected, closed statuses

5. **Tabs** (lines 796-838):
   - Add Closed tab
   - Keep Published visible

6. **Feed column**:
   - Add feed column showing partner_name and payment_type
   - Add feed filter to toolbar (lines 840-881)

7. **Display enhancements**:
   - Show "Source Closed" badge when is_source_deleted = true

## Public Job Board - TODO

### Service Layer Updates Needed
File: `/Users/sboulos/Desktop/ai_projects/publicjobsfrontend/brew-public-board/lib/xano-service.ts`
- Add getShareableLink method
- Update trackClick to use shareable_link_id

### Component Updates Needed
File: `/Users/sboulos/Desktop/ai_projects/publicjobsfrontend/brew-public-board/components/job-board.tsx`
- Replace window.open (lines 61-70) with getShareableLink call
- Update job-card-enhanced.tsx to highlight priority jobs

## Xano Backend Status
### Already Built
- ✅ `GET /api:public/t/{token}` endpoint (returns JSON, not true 302 due to SDK)

### Still Needed
1. **P0 - Revenue Tracking**:
   - Update click logging to require shareable_link_id
   - Normalize tracking link generation

2. **P1 - Workflow**:
   - brew/update-status endpoint
   - brew/update-details endpoint  
   - admin/auth/me endpoint
   - Add feed metadata to listing responses
   - Background task for source deletion

## Key Implementation Notes
1. Xano SDK can't do true 302 redirects (headers limitation)
2. All inline edits should use brew/update-details for consistency
3. Feed format: "{partner_name} {CPA|CPC}"
4. Status flow: Suggested → Approved → Published (+ Rejected/Closed)
5. Auto-publish triggers at 30 clicks if status = approved

## Next Session Setup
1. Change to brewfrontend directory: `cd /Users/sboulos/Desktop/ai_projects/brewfrontend`
2. Continue with Brew Dashboard implementation using the TODO list above
3. Then move to Public Job Board
4. Coordinate with Robert on remaining Xano endpoints