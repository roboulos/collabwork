# Ashley Feedback Issues Checklist - Critical

## 🚨 Critical Context
- **Two separate frontends:**
  - `/ashleyfrontend` - Admin/curation dashboard (where Ashley curates)  
  - `/brewfrontend` - Morning Brew's actual dashboard (where error is happening)
- **React Error #31** is happening on BREW FRONTEND side, not admin side

---

## 1. 🔴 CRITICAL - Brew Frontend Crash

### Issue
- **Location:** `/Users/sboulos/Desktop/ai_projects/brewfrontend`
- **Error:** React error #31 - "object with keys {}" 
- **When:** When Morning Brew users try to expand job details
- **API Error:** Failed to load `/api:microapp/job-clicks-by-hash` (500 error)
- **Console:** "No shareable link found for job 1983274"

### Investigation Needed
- [x] Check brewfrontend for empty object rendering - FOUND ISSUE
- [x] Investigate job-clicks-by-hash endpoint - Working but returns 500 for missing links
- [ ] Check if our pagination changes affected brew frontend
- [x] Verify data structure compatibility - ISSUE FOUND: custom_location is object, not string

### Root Cause Identified
The `custom_location` field is being sent as an object from the backend but the brew frontend expects a string. When React tries to render the object directly, it throws error #31.

### Fix Required
In `/Users/sboulos/Desktop/ai_projects/brewfrontend/components/jobs-data-table.tsx`:
- Lines 625, 683: Need to handle custom_location as object/array/string like we did in admin frontend
- Convert object to string format before rendering

### Status: ✅ FIXED - Completed
- Fixed in all table components (job-table.tsx, job-table-simple.tsx, morningbrew-job-table.tsx, job-table-enhanced.tsx, job-table-enhanced-fixed.tsx, jobs-data-table.tsx)
- Created formatLocation utility to handle polymorphic data
- Build successful, no compilation errors

---

## 2. 🟡 HIGH - Job Formula Display

### Issue Clarified
- Job Formula is a specific column that was only showing the job title
- Ashley wanted it to show: "Job Title - Company - Remote Status"
- Previously showed just the title with a link

### Fix Applied ✅  
- [x] Job Formula column now displays: "Title - Company - Remote Status"
- [x] Entire formula is ONE unified format (all link or all text)
- [x] Copy button moved from actions column into Job Formula column
- [x] Copy button appears on hover for ALL jobs (not just MB ones)
- [x] Edit pencil still only shows for Morning Brew jobs

### Visual Changes
- **Job Formula column:** Shows complete formula as single cohesive text/link
- **Formatting:** If job has application URL, entire formula is blue clickable link. Otherwise plain text
- **Copy button:** Moved to Job Formula column, appears on hover for all jobs
- **Clean look:** No mixed formatting - clearly one piece of information

### Status: ✅ FIXED - Job formula displays correctly with copy button

---

## 3. 🟡 HIGH - Brew Frontend Job Cards - Show Remote Instead of Location

### Issue Clarified
- In the BREW frontend (Morning Brew's dashboard), job cards show location under the title
- Example: "Pharmacist" then "Grand Junction, Colorado" on second line
- Ashley wants Remote status shown instead of physical location

### Fix Applied ✅
- [x] Changed brew frontend job cards to display remote status instead of location
- [x] Now shows: "{Company Name} • Remote" or "{Company Name} • On-site"
- [x] Location data still available in tooltip when hovering

### Visual Changes
- **Brew Frontend Job Cards:** Second line now shows company and remote status
- **Before:** "Acme Corp • San Francisco, CA"  
- **After:** "Acme Corp • Remote"

### Status: ✅ FIXED - Brew frontend shows remote status instead of location

---

## 4. 🟡 HIGH - Search Functionality Broken

### Issue
- Search for "marketing" returns mostly non-marketing jobs
- Search is critical for curation workflow

### Root Cause Identified ✅
- Search index `common_search` was missing the `company` field
- Search was only checking: title, ai_title, description, location, searchable_text
- NOT searching company names (e.g., "Marketing Agency" wouldn't match)

### Fix Applied
- [x] Added `company` field to search index with priority 1
- [x] Index rebuild attempted multiple times (2.7 million records causing issues)
- [ ] **IN PROGRESS:** Robert manually rebuilding index - may need multiple attempts due to record volume
- [ ] Need to test after rebuild completes successfully

### Current Issue
- Index rebuild failing due to 2.7 million records
- Xano requiring multiple attempts to add new index
- Manual process ongoing
- **Update 9/23:** Robert has tried 3 times, takes up to 10 minutes each attempt with silent failures
- This is the same index rebuild issue - adding company field to common_search index

### Status: 🔧 Fix In Progress - Index rebuild challenging due to data volume

---

## 5. 🟡 HIGH - Edit Capability in Admin View

### Issue Clarified ✅
- **Editing DOES work** - pencil icon is available for ALL jobs
- **UX confusion:** Ashley thought editing wasn't available because she was looking at jobs NOT in Morning Brew
- **Root problem:** No clear visual indicator showing which jobs are "in Morning Brew"

### Current State
- Jobs NOT in MB: Only show pencil icon
- Jobs IN MB: Show star + X + pencil icons
- Only subtle difference is presence of star/X buttons

### Solution Applied ✅
- [x] Added subtle visual indicators for Morning Brew jobs in CollabWork view
- [x] Jobs in Morning Brew now show:
  - Thin orange left border (1px)
  - Very subtle blue-tinted background (using existing selected-hover color)
  - Combined with existing star/X buttons in actions column
- [x] Priority jobs (starred) show:
  - Thicker orange left border (3px)
  - Yellow glow effect around the star icon
  - Full orange border when both selected and priority

### Visual Changes Explanation for Ashley/Summer
- **CollabWork View:** Jobs added to Morning Brew now have a thin orange line on the left side
- **Priority (starred) jobs:** Show a thicker orange accent and yellow star glow
- **Morning Brew View:** Keeps existing orange accent at top of table
- This makes it immediately clear which jobs are in the Morning Brew curation list

### Status: ✅ FIXED - Visual indicators added

---

## 5.1 🟡 HIGH - Link Click Area Issue

### Issue
- Job title links were extending across entire column width
- Clicking anywhere in the row would trigger the link instead of selecting the row
- Poor UX for row selection

### Fix Applied ✅
- Changed link display from `flex` to `inline-flex`
- Links now only clickable on the actual text and icon
- Row selection works properly outside of link area

### Status: ✅ FIXED - Link click areas constrained to text only

---

## 6. 🟠 MEDIUM - Feed Filter Issues

### Issue Clarified by Robert
- Feed filter at top of page only operates on CURRENTLY LOADED data (client-side filtering)
- With 2.7 million records, we use pagination - not all data loads at once on the page
- Filter dropdown only shows feeds present in the current loaded page (e.g., just "Appcast")
- Other feeds exist in database but aren't visible in dropdown since they're not in loaded data
- Ashley wants to filter by feed source across ALL 2.7M records, not just the ~100-1000 loaded
- Currently Ashley has to use search to find other feeds, but this requires knowing what to search for

### Root Cause
- **Client-side filtering limitation:** Filter only operates on data already fetched to the browser
- **Pagination constraint:** Only a small subset of records loaded at any time
- **Missing server-side filtering:** API needs to support filtering at database level

### Investigation Completed ✅
- [x] **API Support:** The API already accepts a `filters` object parameter
- [x] **Current Implementation:** Frontend passes empty {} for filters (line 512 in job-table-enhanced-v3.tsx)
- [x] **TODO Comment Found:** "TODO: Convert columnFilters to proper format" 
- [x] **Feed Source Column:** Currently extracts from `single_partner.partner_name` field
- [x] **Filter Function:** Already defined in columns but only works on loaded data
- [x] **9/23 Update:** Examined API endpoint logic - confirmed API needs modification to support feed filtering

### API Fix Being Applied (9/23)
1. **Input added:** Added `feed_source` text input parameter to ashley/list-jobs endpoint ✅
2. **Filter implementation:** Added filter `morningbrew_jobs.feed_id = $input.feed_source` ✅
3. **Data structure clarified:** 
   - Partners can have multiple feeds (e.g., Appcast has feeds 7 & 8)
   - job_posting.feed_id links to specific feeds, not just partners
   - Frontend should pass numeric feed_id, not partner name
4. **Performance issue discovered:** 
   - Filter causes timeout/hang due to 2.7M records + 2000 per_page + 3 addon queries per record
   - Potentially running 6000+ queries when filter is applied
   - Need to either: reduce per_page limit, add index on feed_id, or optimize query structure
5. **Latest update (9/23 evening):**
   - Changed input type from text to integer - still times out
   - Tried separate query for feed filter - still doesn't work
   - **BLOCKED:** Feed filtering is non-functional due to performance issues with 2.7M records
   - Need database optimization (index on feed_id) or query restructuring

### Potential Solutions Identified
1. **Server-side filtering:** ✅ IN PROGRESS - Adding to ashley/list-jobs endpoint
2. **Pre-populate dropdown:** Create ashley/get-feed-sources endpoint to list all available feeds
3. **Frontend change:** Update filters object to pass feed_source value

### Is This Connected to the Index Issue? 

**Not directly connected, but both share the same root challenge:**
- **Search Index Issue:** Failing to rebuild because of 2.7M records (timeout/memory)
- **Feed Filter Issue:** Can't filter because only ~100-1000 records load client-side
- **Common Problem:** Both need efficient server-side handling of 2.7M records

### What The Solution Looks Like

**IMMEDIATE FIX (IN PROGRESS):**
1. Server-side filtering in the API
   - ✅ Added `feed_source` input parameter
   - ✅ Added filter to query: `morningbrew_jobs.feed_id = $input.feed_source`
   - Frontend already has the structure, just needs to pass the filter value (numeric feed_id)

2. Pre-populate the feed dropdown (NEXT STEP)
   - Add new API endpoint: `ashley/get-feed-sources`
   - Query partners table and extract all feeds from attributes.job_feed_partner array
   - Return format: `[{feed_id: 7, feed_name: "Appcast CPC USA", partner_name: "Appcast"}]`
   - Cache result for performance
   - Load this list when page loads to populate dropdown with ALL feeds

**CODE CHANGES NEEDED:**
```typescript
// In job-table-enhanced-v3.tsx line 512, change from:
filters: {} // TODO: Convert columnFilters to proper format

// To:
filters: {
  feed_source: columnFilters.find(f => f.id === 'feed_source')?.value // This will be the numeric feed_id
}

// The feed dropdown needs to be structured like:
// <option value="7">Appcast CPC USA</option>
// <option value="8">Appcast CPA USA</option>
// <option value="9">Buyer CPC</option>
// Where value is the feed_id (numeric)
```

**LONG-TERM FIX:**
- Add database index on partner_id/partner_name columns
- Consider materialized view for feed sources
- Implement server-side faceted search

### Status: 🔴 BLOCKED - Performance issue prevents feed filtering from working

---

## 7. 🟢 LOW - Remove Test Communities

### Issue
- Test communities still visible in dashboard

### Tasks
- [ ] Identify test communities
- [ ] Remove or hide test data
- [ ] Verify only real communities show

### Status: ❌ Not Started

---

## Progress Tracking

### Completed Today
- ✅ Fixed is_remote field saving
- ✅ Fixed Morning Brew view showing all as "On-site"
- ✅ Fixed field alignment issues
- ✅ Changed "Ashley View" to "CollabWork View"
- ✅ Fixed UI issues (buttons, badges, editing)
- ✅ **FIXED REACT ERROR #31** - Brew frontend crash resolved
- ✅ **IDENTIFIED SEARCH ISSUE** - Missing company field in search index
- 🔧 **APPLIED SEARCH FIX** - Added company field to index (rebuilding)

### Currently Investigating
- 🔍 Edit capability in admin view (checking if already enabled)

### Blocked/Waiting
- ⏸️ Need list of feeds from Summer
- ⏸️ Need confirmation on which test communities to remove

---

## Key Questions for Team

1. **For Summer:** Which feeds should be enabled/visible?
2. **For Ashley:** Is the error consistent with specific jobs or random?
3. **Technical:** Did our pagination/data structure changes break brew frontend?

---

## Next Steps Priority Order

1. **URGENT:** Fix brew frontend crash (blocking MB users)
2. **HIGH:** Fix search functionality (blocking curation)
3. **HIGH:** Enable editing in admin view (workflow efficiency)
4. **MEDIUM:** Fix feed filters and job formula
5. **LOW:** Cleanup test data

---

## Notes
- Changes to admin frontend may have inadvertently affected brew frontend
- Need to ensure data structure compatibility between both frontends
- Search is critical for curation workflow - needs immediate attention

---

## Status Summary (as of 9/23 evening)

### ✅ COMPLETED
1. **React Error #31 in Brew Frontend** - Fixed by handling polymorphic custom_location data
2. **Job Formula Display** - Now shows "Title - Company - Remote Status" with copy button
3. **Brew Frontend Remote Status** - Cards now show remote status instead of location
4. **Visual Indicators** - Morning Brew jobs have orange accent, priority jobs have glow
5. **Link Click Areas** - Constrained to text only for better UX

### 🔧 IN PROGRESS / BLOCKED
1. **Search Index (Company Field)** - Added to index but rebuild failing due to 2.7M records
2. **Feed Filter** - API modified but timing out due to performance issues

### ❌ NOT STARTED
1. **Remove Test Communities** - Waiting for list from Summer

### 🚨 KEY BLOCKERS
1. **Database Performance** - Both search and feed filter issues stem from 2.7M record volume
2. **Index Rebuilds** - Xano struggles with large dataset indexing
3. **Query Optimization** - Current query structure with addons causes timeouts

### 📋 RECOMMENDED NEXT STEPS
1. Add database index on `feed_id` column in job_posting table
2. Reduce `per_page` from 2000 to 100 in ashley/list-jobs
3. Consider removing or optimizing addon queries
4. Implement caching for frequently accessed data
5. Create dedicated filtered endpoints with optimized queries