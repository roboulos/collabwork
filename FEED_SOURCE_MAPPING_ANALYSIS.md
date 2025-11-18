# Feed Source Mapping Analysis

## Problem Summary

There is a **critical mismatch** between:
1. How the **badge** displays feed sources (using hardcoded `feedIdMap`)
2. How the **filter dropdown** maps feed sources (using partner `job_feed_partner` attributes)
3. What **feed_ids actually exist** in the job_posting database

## Actual Jobs in Database (from 2000 job sample)

| feed_id | partner_id | CPC jobs | CPA jobs | Total | Active in Partner Record |
|---------|------------|----------|----------|-------|--------------------------|
| 7       | 6          | 130      | 0        | 130   | ✅ Yes (Appcast CPC)     |
| 8       | 6          | 0        | 50       | 50    | ✅ Yes (Appcast CPA)     |
| 21      | 14         | 15       | 0        | 15    | ❌ No (inactive)         |
| 22      | 15         | 1        | 0        | 1     | ❌ No (inactive)         |
| 24      | N/A        | 1,754    | 0        | 1,754 | ❓ Not in partner table  |
| 26      | 8          | 0        | 50       | 50    | ❓ Not in partner table  |

**Total jobs analyzed: 2,000**

## Partner Table Configuration

### Partner #6: Appcast
```json
{
  "partner_id": 6,
  "partner_name": "Appcast",
  "job_feed_partner": [
    {
      "name": "appcast-cpc-usa",
      "feed_id": 7,
      "is_active": true
    },
    {
      "name": "appcast-cpa-usa",
      "feed_id": 8,
      "is_active": true
    }
  ]
}
```
✅ **Status: CORRECT** - Both feed_ids (7, 8) match actual jobs and are active.

### Partner #8: Veritone
```json
{
  "partner_id": 8,
  "partner_name": "Veritone",
  "job_feed_partner": [
    {
      "name": "Veritone CPA",
      "feed_id": 5,
      "is_active": false   // ❌ INACTIVE
    },
    {
      "name": "Veritone CPC",
      "feed_id": 10,
      "is_active": true
    }
  ]
}
```
❌ **Status: BROKEN**
- Partner record shows `feed_id: 5` (CPA) and `feed_id: 10` (CPC)
- But actual jobs have `feed_id: 26` (CPA) - 50 jobs!
- `feed_id: 5` has 0 jobs
- `feed_id: 10` has 0 jobs

### Partner #7: Buyer
```json
{
  "partner_id": 7,
  "partner_name": "Buyer",
  "job_feed_partner": [
    {
      "name": "buyer-cpc",
      "feed_id": 9,
      "is_active": true
    },
    {
      "name": "buyer-ads",
      "feed_id": 14,
      "is_active": false
    }
  ]
}
```
❌ **Status: NO JOBS FOUND**
- No jobs with `feed_id: 9` or `feed_id: 14` in database
- Badge shows "Buyer CPC" for jobs with `feed_id: 19` (hardcoded)
- No actual Buyer jobs in the 2000 sample

### Partner #14: Recruitics
```json
{
  "partner_id": 14,
  "partner_name": "Recruitics",
  "job_feed_partner": [
    {
      "name": "Recruitics Raython",
      "feed_id": 21,
      "is_active": false   // ❌ INACTIVE
    }
  ]
}
```
⚠️ **Status: INACTIVE BUT HAS JOBS**
- Partner record shows `feed_id: 21` as **inactive**
- But database has **15 CPC jobs** with `feed_id: 21`
- Should this feed be marked active?

### Partner #15: Job Target
```json
{
  "partner_id": 15,
  "partner_name": "Job Target",
  "job_feed_partner": [
    {
      "name": "JobTarget CPC",
      "feed_id": 22,
      "is_active": false   // ❌ INACTIVE
    }
  ]
}
```
⚠️ **Status: INACTIVE BUT HAS JOBS**
- Partner record shows `feed_id: 22` as **inactive**
- But database has **1 CPC job** with `feed_id: 22`
- Should this feed be marked active?

### Partner #13: Sample
```json
{
  "partner_id": 13,
  "partner_name": "Sample",
  "job_feed_partner": [
    {
      "name": "Sample 01",
      "feed_id": 18,
      "is_active": true,
      "is_testing": true
    },
    {
      "name": "Sample 2",
      "feed_id": 19,
      "is_active": true,
      "is_testing": true
    },
    {
      "name": "Big Test",
      "feed_id": 20,
      "is_active": true,
      "is_testing": true
    }
  ]
}
```
❌ **Status: NO JOBS FOUND**
- No jobs with `feed_id: 18, 19, 20` in database
- These are test feeds, may not have been imported yet

### Partner #12: Zip Recruiter
```json
{
  "partner_id": 12,
  "partner_name": "Zip Recruiter",
  "job_feed_partner": [
    {
      "name": "Zip recruiter",
      "feed_id": 3,
      "is_active": false,   // ❌ INACTIVE
      "is_testing": true
    }
  ]
}
```
❌ **Status: NO JOBS FOUND**
- No jobs with `feed_id: 3` in database
- Feed is marked inactive and testing

## Badge Logic (jobs-columns-v4.tsx lines 858-867)

```typescript
const feedIdMap: Record<number, string> = {
  7: "Appcast",      // ✅ Correct - 130 CPC jobs
  8: "Appcast",      // ✅ Correct - 50 CPA jobs
  10: "Veritone",    // ❌ WRONG - 0 jobs (should be removed)
  5: "Veritone",     // ❌ WRONG - 0 jobs (should be removed)
  19: "Buyer",       // ❌ WRONG - 0 jobs (should be removed)
  9: "Buyer",        // ❌ WRONG - 0 jobs (should be removed)
  24: "Direct Employers Association",  // ⚠️ UNKNOWN - 1,754 jobs but not in partner table!
  23: "Direct Emp",  // ⚠️ UNKNOWN - 0 jobs
};
```

## Missing Mappings

These feed_ids have ACTUAL jobs but are NOT in the badge hardcoded map:

1. **feed_id: 26** - 50 Veritone CPA jobs (partner_id: 8)
2. **feed_id: 24** - 1,754 CPC jobs (partner_id: N/A) - "Direct Employers Association"
3. **feed_id: 21** - 15 Recruitics CPC jobs (partner_id: 14)
4. **feed_id: 22** - 1 Job Target CPC job (partner_id: 15)

## Filter Dropdown Logic (job-table-enhanced-v3.tsx lines 371-405)

The filter dropdown dynamically builds options from partner records:
1. Queries all partners with `partner_type: "JOB_FEED_PARTNER"`
2. Extracts `job_feed_partner` attributes
3. For each feed with CPC/CPA in name, creates separate dropdown options
4. Maps option name to `feed_id` from attributes
5. Falls back to `partner.id` if `feed_id` not found

**Problem**: For Veritone, the partner record has `feed_id: 5` (CPA) and `feed_id: 10` (CPC), but actual jobs have `feed_id: 26`.

## Recommendations

### 1. Fix Veritone Partner Record (CRITICAL)

Update Partner #8 (Veritone) to include the correct feed_id:

```json
{
  "partner_id": 8,
  "partner_name": "Veritone",
  "job_feed_partner": [
    {
      "name": "Veritone CPA",
      "feed_id": 26,        // ✅ CHANGED from 5 to 26
      "is_active": true,    // ✅ CHANGED from false to true
      "feed_type": "XML",
      "source_url": "https://vendors.pandologic.com/CollabWORK_A/CollabWORK_DynamicCPA.xml",
      "parser_type": "Standard",
      "company_name": "Veritone"
    },
    {
      "name": "Veritone CPC",
      "feed_id": 10,
      "is_active": false,   // ❓ No jobs found - should this be removed or is data coming?
      "feed_type": "XML",
      "source_url": "https://vendors.pandologic.com/CollabWORK_A/CollabWORK_A2.xml",
      "parser_type": "Standard",
      "company_name": "Veritone"
    }
  ]
}
```

### 2. Update Badge Hardcoded Map

Update `jobs-columns-v4.tsx` lines 858-867:

```typescript
const feedIdMap: Record<number, string> = {
  7: "Appcast",                          // ✅ Keep - 130 jobs
  8: "Appcast",                          // ✅ Keep - 50 jobs
  26: "Veritone",                        // ✅ ADD - 50 jobs (was feed_id: 5)
  21: "Recruitics",                      // ✅ ADD - 15 jobs
  22: "Job Target",                      // ✅ ADD - 1 job
  24: "Direct Employers Association",    // ✅ Keep - 1,754 jobs
  // Remove these - no jobs:
  // 10: "Veritone",   // ❌ REMOVE - 0 jobs
  // 5: "Veritone",    // ❌ REMOVE - 0 jobs
  // 19: "Buyer",      // ❌ REMOVE - 0 jobs
  // 9: "Buyer",       // ❌ REMOVE - 0 jobs
  // 23: "Direct Emp", // ❌ REMOVE - 0 jobs
};
```

### 3. Investigate feed_id: 24

The largest feed (1,754 jobs) is `feed_id: 24` labeled "Direct Employers Association", but:
- It doesn't appear in ANY partner record
- Jobs have `partner_id: N/A`
- This needs backend investigation - where is this data coming from?

Possible actions:
- Create a partner record for "Direct Employers Association"
- Add `feed_id: 24` to the partner's `job_feed_partner` attributes
- OR identify which existing partner should own this feed

### 4. Mark Inactive Feeds Active

If feeds 21 and 22 should continue receiving jobs:
- Set `is_active: true` for Recruitics `feed_id: 21`
- Set `is_active: true` for Job Target `feed_id: 22`

### 5. Remove the Hardcoded Badge Map Entirely (BEST SOLUTION)

Instead of maintaining a hardcoded `feedIdMap`, the badge should:
1. Get partner_name from `job.single_partner.partner_name` (already available in the relationship)
2. Fall back to the hardcoded map ONLY if relationship is missing

This way:
- Badge logic automatically stays in sync with database
- No need to update hardcoded map when feeds change
- Easier to maintain

## Current Dropdown Options (What Users See)

Based on the dynamic mapping logic, users currently see these options in the Feed Source dropdown:

1. ✅ Appcast CPA (maps to feed_id: 8) - **Works** - 50 jobs
2. ✅ Appcast CPC (maps to feed_id: 7) - **Works** - 130 jobs
3. ❌ Veritone CPA (maps to feed_id: 5) - **Broken** - 0 jobs (should map to 26)
4. ❌ Veritone CPC (maps to feed_id: 10) - **Broken** - 0 jobs
5. ❌ Buyer CPC (maps to feed_id: 9) - **Broken** - 0 jobs
6. ❌ Recruitics (maps to feed_id: 21) - **Hidden** (inactive)
7. ❌ Job Target CPC (maps to feed_id: 22) - **Hidden** (inactive)
8. ❌ Sample (maps to feed_id: 18, 19, 20) - **No jobs** (test data)
9. ❌ Zip Recruiter (maps to feed_id: 3) - **Hidden** (inactive)
10. ❓ **Missing**: Direct Employers Association (feed_id: 24) - 1,754 jobs!

## Test Plan

After fixes are applied:

1. **Test Veritone CPA filter**:
   - Select "Veritone CPA" in dropdown
   - Should show 50 jobs (not 0)
   - Badge should say "Veritone CPA"
   - Console should show: `feed_id: 26`

2. **Test badge consistency**:
   - Load dashboard without filters
   - Find a job with "Veritone CPA" badge
   - Note the company name
   - Filter by "Veritone CPA"
   - Same job should appear in results

3. **Test all active feeds**:
   - Appcast CPA → 50 jobs
   - Appcast CPC → 130 jobs
   - Veritone CPA → 50 jobs
   - Direct Employers Association → 1,754 jobs (after partner record created)
   - Recruitics → 15 jobs (after marked active)
   - Job Target → 1 job (after marked active)
