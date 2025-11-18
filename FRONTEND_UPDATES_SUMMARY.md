# Frontend Updates Summary - Feed Source Filter Fix

## Date: 2025-11-18

## Problem Solved
Feed source filter showing 0 results for "Veritone CPA" despite 13,805 Veritone jobs existing in the database with badges displaying correctly.

## Root Cause
The backend addon was using **incorrect syntax** that prevented per-job partner data from being populated:
- ❌ `input: {partner_id: "partner_id"}` (string literal - wrong)
- ❌ `input: {partner_id: $input.partner_id}` (endpoint parameter - single partner for all jobs)
- ✅ `input: {partner_id: $output.partner_id}` (row-level field - per-job partner data)

## Changes Made

### 1. Backend (Xano)

**File:** Endpoint `ashley/search-all-jobs` (ID: 9152)

**Before:**
```xanoscript
addon = [
  {
    name : "Single Partner"
    input: {partner_id: "partner_id"}  // ❌ Wrong
    as   : "single_partner"
  }
]
```

**After:**
```xanoscript
addon = [
  {
    name : "Single Partner"
    input: {partner_id: $output.partner_id}  // ✅ Correct - per-job data
    as   : "items.single_partner"
  }
]
```

**Result:** Each job now gets its own individual partner data based on its `partner_id` field.

### 2. Frontend TypeScript Interface

**File:** `lib/xano.ts` (lines 62-81)

**Updated:** Expanded the `single_partner` interface to include the full partner data structure returned by the API:

```typescript
single_partner?: {
  id?: number;
  partner_name?: string;
  is_active?: boolean;
  code?: string;
  partner_type?: string[];
  attributes?: {
    job_feed_partner?: Array<{
      name?: string;
      feed_id?: number;
      is_active?: boolean;
      feed_type?: string;
      source_url?: string;
      parser_type?: string;
      company_name?: string;
    }>;
  };
  partner_email?: string | null;
  partner_phantom_id?: string | null;
};
```

### 3. Frontend Badge Mapping

**File:** `components/jobs-columns-v4.tsx` (lines 831-839 and 856-864)

**Updated:** Added missing feed IDs to the fallback mapping:

```typescript
const feedIdMap: Record<number, string> = {
  7: "Appcast",
  8: "Appcast",
  26: "Veritone",  // ✅ ADDED: Veritone CPA (13,805 jobs)
  21: "Recruitics",  // ✅ ADDED: Recruitics (15 jobs)
  22: "Job Target",  // ✅ ADDED: Job Target (1 job)
  24: "Direct Employers Association",
};
```

**Note:** The hardcoded map is now just a fallback. Primary data comes from `job.single_partner.partner_name`.

## API Response Structure

**Before (broken):**
```json
{
  "items": [...],
  "single_partner": null  // ❌ Always null
}
```

**After (fixed):**
```json
{
  "items": [
    {
      "id": 4467093,
      "partner_id": 8,
      "feed_id": 26,
      "company": "LocumJobsOnline",
      "single_partner": {  // ✅ Per-job partner data
        "id": 8,
        "partner_name": "Veritone",
        "partner_type": ["JOB_FEED_PARTNER"],
        "attributes": {...}
      }
    },
    {
      "id": 4434698,
      "partner_id": 8,
      "feed_id": 26,
      "single_partner": {  // ✅ Each job has its own partner data
        "id": 8,
        "partner_name": "Veritone",
        ...
      }
    }
  ]
}
```

## Testing Results

### Build Status
```
✓ Compiled successfully in 3.7s
✓ Linting and checking validity of types
✓ Build completed with no TypeScript errors
```

### API Test
```bash
curl -X POST 'https://api.collabwork.com/api:microapp/ashley/search-all-jobs' \
  -H 'Content-Type: application/json' \
  -d '{"page": 1, "per_page": 2, "feed_id": 26}'
```

**Result:** ✅ Returns 2 jobs with `single_partner` populated for each job

## Expected User Impact

1. **Feed Source Badges** - Already working, now powered by API data instead of hardcoded map
2. **Feed Source Filter** - Should now work correctly when selecting "Veritone CPA"
3. **All Feed Filters** - Per-job partner data ensures filters work for mixed partner queries

## Data Coverage

| Feed ID | Partner | Type | Jobs | Status |
|---------|---------|------|------|--------|
| 7 | Appcast | CPC | 211 | ✅ Working |
| 8 | Appcast | CPA | 214 | ✅ Working |
| 26 | Veritone | CPA | 13,805 | ✅ **FIXED** |
| 21 | Recruitics | CPC | 15 | ✅ Added to map |
| 22 | Job Target | CPC | 1 | ✅ Added to map |
| 24 | Direct Employers | CPC | 4,304 | ✅ Working |

## Database Fix Required (CRITICAL)

After implementing the backend and frontend fixes, we discovered a **data inconsistency** in the partner table:

**Problem:** The partner table had incorrect `feed_id` mappings that didn't match actual job data.

**Partner Table Record (ID: 8 - Veritone):**

**Before Fix:**
```json
{
  "attributes": {
    "job_feed_partner": [
      {
        "name": "Veritone CPA",
        "feed_id": 5,  // ❌ WRONG - no jobs with this ID
        "is_active": false
      },
      {
        "name": "Veritone CPC",
        "feed_id": 10,  // ❌ WRONG - no jobs with this ID
        "is_active": true
      }
    ]
  }
}
```

**After Fix:**
```json
{
  "attributes": {
    "job_feed_partner": [
      {
        "name": "Veritone CPA",
        "feed_id": 26,  // ✅ CORRECT - 13,805 jobs
        "is_active": true
      },
      {
        "name": "Veritone CPC",
        "feed_id": 10,  // Kept same (no jobs found)
        "is_active": false
      }
    ]
  }
}
```

**How the Bug Manifested:**
1. Frontend read partner table via `/ashley/list-all-feed-sources` API
2. Dropdown showed "Veritone CPA" mapped to `feed_id: 5`
3. When selected, API query searched for `feed_id: 5`
4. Result: 0 jobs returned (no jobs have `feed_id: 5`)
5. Actual Veritone CPA jobs all have `feed_id: 26`

**Database Update Performed:**
```javascript
// Updated partner table (ID: 293), record ID: 8
{
  "attributes": {
    "job_feed_partner": [
      {
        "name": "Veritone CPA",
        "feed_id": 26,  // Changed from 5 to 26
        "is_active": true,  // Changed from false to true
        "feed_type": "XML",
        "source_url": "https://vendors.pandologic.com/CollabWORK_A/CollabWORK_DynamicCPA.xml",
        "parser_type": "Standard",
        "company_name": "Veritone"
      }
    ]
  }
}
```

## Live Testing Results (Playwright Browser Automation)

1. ✅ **Backend Fixed** - Endpoint returning correct data
2. ✅ **Frontend Updated** - TypeScript interfaces and badge mapping updated
3. ✅ **Build Passing** - No TypeScript errors
4. ✅ **Database Fixed** - Partner table updated with correct feed_id
5. ✅ **Live Testing Passed:**
   - Navigated to http://localhost:3000/dashboard
   - Selected "Veritone CPA" from feed source filter
   - **Result: 13,805 jobs displayed correctly**
   - Console logs confirm: `feed_id: 26` sent to API
   - API returned: 500 jobs (first page of 13,805 total)
   - All badges showing "Veritone CPA" correctly
   - Load time: 1.3 seconds

## Files Modified

1. **Backend (Xano):**
   - Endpoint 9152 (`ashley/search-all-jobs`) - XanoScript addon syntax updated
   - Partner table (ID: 293), Record ID: 8 - Fixed feed_id mapping for Veritone CPA

2. **Frontend:**
   - `lib/xano.ts` - TypeScript interface for `single_partner`
   - `components/jobs-columns-v4.tsx` - Updated badge mapping (2 locations)

3. **Documentation:**
   - `XANO_ADDON_SYNTAX_GUIDE.md` - Comprehensive addon syntax guide
   - `DATA_STRUCTURE_AND_RELATIONSHIPS.md` - Data structure documentation
   - `FRONTEND_UPDATES_SUMMARY.md` - This file (updated with database fix details)

## Key Learning

The difference between `$input` and `$output` in Xano addons:
- `$input.field` = Endpoint parameter (single value for entire request)
- `$output.field` = Row-level field (different value for each record)

This was discovered by examining the working endpoint `ashley/list-jobs` (ID: 9059).
