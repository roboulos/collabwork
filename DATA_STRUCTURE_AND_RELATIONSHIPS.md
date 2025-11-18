# Complete Data Structure and Relationships

## Executive Summary

**The Problem:** Jobs in the `job_posting` table have BOTH a `partner_id` AND a `feed_id`. These are **two different things** that work together to identify where a job came from.

**The Relationship:**
```
job_posting.partner_id → partner.id → partner.attributes.job_feed_partner[].feed_id
```

---

## Table Schemas

### `job_posting` Table (ID: 240)

**Key Fields:**
- `id` (int) - Primary key
- `partner_id` (int) - **References partner table (tableref_id: 293)**
- `feed_id` (int) - **Specific feed within that partner**
- `cpc` (decimal) - Cost per click
- `cpa` (decimal) - Cost per acquisition
- `company` (text) - Company name from feed
- `title` (text) - Job title
- 48 total fields

**Critical Understanding:**
- `partner_id` points to WHO provides the jobs (Veritone, Appcast, etc.)
- `feed_id` identifies WHICH FEED within that partner (CPC vs CPA, different regions, etc.)

---

### `partner` Table (ID: 293)

**Key Fields:**
- `id` (int) - Primary key
- `partner_name` (text) - Display name (e.g., "Veritone", "Appcast")
- `partner_type` (enum list) - e.g., `["JOB_FEED_PARTNER"]`
- `attributes` (json) - Contains nested `job_feed_partner` array
- `is_active` (bool)

**The `job_feed_partner` Attribute Structure:**
```json
{
  "job_feed_partner": [
    {
      "name": "Veritone CPA",
      "feed_id": 26,
      "is_active": true,
      "feed_type": "XML",
      "source_url": "https://...",
      "parser_type": "Standard",
      "company_name": "Veritone"
    }
  ]
}
```

---

## ACTUAL DATA: Partner #8 (Veritone)

```json
{
  "id": 8,
  "partner_name": "Veritone",
  "is_active": true,
  "partner_type": ["JOB_FEED_PARTNER"],
  "attributes": {
    "job_feed_partner": [
      {
        "name": "Veritone CPA",
        "feed_id": 5,           // ❌ WRONG - actual jobs have feed_id: 26
        "is_active": false,     // ❌ WRONG - should be true
        "feed_type": "XML",
        "source_url": "https://vendors.pandologic.com/CollabWORK_A/CollabWORK_DynamicCPA.xml",
        "parser_type": "Standard",
        "company_name": "Veritone"
      },
      {
        "name": "Veritone CPC",
        "feed_id": 10,          // ❌ No jobs found with this feed_id
        "is_active": true,
        "feed_type": "XML",
        "source_url": "https://vendors.pandologic.com/CollabWORK_A/CollabWORK_A2.xml",
        "parser_type": "Standard",
        "company_name": "Veritone"
      }
    ]
  }
}
```

---

## ACTUAL DATA: Sample Jobs with feed_id 26

```json
{
  "id": 4467093,
  "partner_id": 8,        // ← Points to Veritone in partner table
  "feed_id": 26,          // ← Specific feed (Veritone CPA)
  "company": "LocumJobsOnline",
  "cpc": 0,
  "cpa": 6.34             // ← This is a CPA job
}
```

**Analysis:**
- Job has `partner_id: 8` → This job belongs to Veritone
- Job has `feed_id: 26` → This is the Veritone CPA feed
- Job has `cpa: 6.34` → Confirms it's a CPA job, not CPC
- **But partner record says `feed_id: 5` for Veritone CPA!** ← This is the mismatch

---

## The Data Flow (How It Should Work)

### 1. Job Ingestion
```
XML Feed URL → Parser → Creates job_posting record
                          ├── partner_id: 8
                          └── feed_id: 26
```

### 2. Frontend Display (Current - Broken)
```
Badge needs partner_name → Looks up hardcoded feedIdMap
                            ├── feed_id: 26 NOT in map
                            └── Shows "No Feed Source"
```

### 3. Frontend Display (Fixed - With Addon)
```
Badge needs partner_name → API returns single_partner addon
                            ├── job.partner_id: 8
                            ├── Addon queries partner table where id = 8
                            ├── Returns partner_name: "Veritone"
                            └── Badge shows "Veritone CPA"
```

### 4. Feed Source Filter (Current - Broken)
```
User selects "Veritone CPA" → Frontend maps to feed_id from partner record
                               ├── Finds partner #8 with "Veritone CPA"
                               ├── Gets feed_id: 5 from attributes
                               ├── Calls API with feed_id: 5
                               └── Returns 0 jobs (no jobs have feed_id: 5!)
```

### 5. Feed Source Filter (Fixed)
```
User selects "Veritone CPA" → Frontend maps to feed_id from partner record
                               ├── Finds partner #8 with "Veritone CPA"
                               ├── Gets feed_id: 26 from attributes (CORRECTED)
                               ├── Calls API with feed_id: 26
                               └── Returns 13,805 jobs ✅
```

---

## The Complete Feed Landscape

### Partner #6: Appcast ✅ WORKING
```json
{
  "id": 6,
  "partner_name": "Appcast",
  "job_feed_partner": [
    {"name": "appcast-cpc-usa", "feed_id": 7, "is_active": true},   // ✅ 211 jobs
    {"name": "appcast-cpa-usa", "feed_id": 8, "is_active": true}    // ✅ 214 jobs
  ]
}
```

### Partner #7: Buyer
```json
{
  "id": 7,
  "partner_name": "Buyer",
  "job_feed_partner": [
    {"name": "buyer-cpc", "feed_id": 9, "is_active": true},         // ❌ 0 jobs
    {"name": "buyer-ads", "feed_id": 14, "is_active": false}        // ❌ 0 jobs
  ]
}
```

### Partner #8: Veritone ❌ BROKEN
```json
{
  "id": 8,
  "partner_name": "Veritone",
  "job_feed_partner": [
    {"name": "Veritone CPA", "feed_id": 5, "is_active": false},     // ❌ WRONG - should be 26
    {"name": "Veritone CPC", "feed_id": 10, "is_active": true}      // ❌ 0 jobs
  ]
}
```
**Actual data in job_posting table:**
- `feed_id: 26` → 13,805 Veritone CPA jobs (cpa > 0)
- `feed_id: 5` → 0 jobs
- `feed_id: 10` → 0 jobs

### Partner #14: Recruitics
```json
{
  "id": 14,
  "partner_name": "Recruitics",
  "job_feed_partner": [
    {"name": "Recruitics Raython", "feed_id": 21, "is_active": false}  // ⚠️ 15 jobs but marked inactive
  ]
}
```

### Partner #15: Job Target
```json
{
  "id": 15,
  "partner_name": "Job Target",
  "job_feed_partner": [
    {"name": "JobTarget CPC", "feed_id": 22, "is_active": false}    // ⚠️ 1 job but marked inactive
  ]
}
```

### feed_id: 24 - Direct Employers Association
```
❓ MYSTERY FEED
- 4,304 jobs in database (LARGEST FEED!)
- partner_id: 0 (not associated with any partner)
- Not in ANY partner record
- Needs investigation
```

---

## What We're Trying to Achieve

### Goal: Display Partner Name in Badge

**Current Problem:**
```javascript
// jobs-columns-v4.tsx lines 858-867
const feedIdMap: Record<number, string> = {
  7: "Appcast",      // ✅ Works
  8: "Appcast",      // ✅ Works
  10: "Veritone",    // ❌ No jobs with feed_id 10
  5: "Veritone",     // ❌ No jobs with feed_id 5
  24: "Direct Employers Association",  // ✅ Works but hardcoded
  // Missing feed_id: 26 (13,805 Veritone CPA jobs!)
};
```

**Solution: Use Single Partner Addon**

The addon should:
1. Take the job's `partner_id` field (e.g., 8)
2. Query the `partner` table where `id = 8`
3. Return the partner record with `partner_name: "Veritone"`
4. Frontend displays "Veritone CPA" in badge

**Addon Input/Output:**
```
Input:  {partner_id: 8}
Output: {id: 8, partner_name: "Veritone", partner_type: ["JOB_FEED_PARTNER"]}
```

---

## The Fix Required

### 1. Fix Partner Record (CRITICAL)
Update Partner #8 to have correct feed_id:

```json
{
  "id": 8,
  "partner_name": "Veritone",
  "job_feed_partner": [
    {
      "name": "Veritone CPA",
      "feed_id": 26,        // ✅ CHANGE from 5 to 26
      "is_active": true,    // ✅ CHANGE from false to true
      "feed_type": "XML",
      "source_url": "https://vendors.pandologic.com/CollabWORK_A/CollabWORK_DynamicCPA.xml",
      "parser_type": "Standard",
      "company_name": "Veritone"
    }
  ]
}
```

### 2. Create/Verify "Single Partner" Addon
**Table:** `job_posting` (ID: 240)
**Name:** "Single Partner"
**Input:** Maps `partner_id` field
**Returns:** Partner record from `partner` table

### 3. Update Endpoint (DONE ✅)
Endpoint `ashley/search-all-jobs` already configured with:
```xanoscript
addon = [
  {
    name : "Single Partner"
    input: {partner_id: "partner_id"}
    as   : "single_partner"
  }
]
```

### 4. Update Frontend Badge Map
Add missing feed_ids to `jobs-columns-v4.tsx`:
```javascript
const feedIdMap: Record<number, string> = {
  7: "Appcast",
  8: "Appcast",
  26: "Veritone",     // ✅ ADD THIS
  21: "Recruitics",   // ✅ ADD THIS
  22: "Job Target",   // ✅ ADD THIS
  24: "Direct Employers Association",
  // Remove: 5, 10, 9, 19, 23 (no jobs)
};
```

---

## Verification Steps

After fixes are applied:

1. **Test Single Partner Addon:**
```bash
curl -X POST "https://api.collabwork.com/api:microapp/ashley/search-all-jobs" \
  -H "Content-Type: application/json" \
  -d '{"page": 1, "per_page": 1, "feed_id": 26}'
```
Expected: `single_partner` field should contain `{id: 8, partner_name: "Veritone"}`

2. **Test Feed Filter:**
- Select "Veritone CPA" in dropdown
- Should show 13,805 jobs
- Badge should say "Veritone CPA"

3. **Verify All Feeds:**
- Appcast CPA → 214 jobs
- Appcast CPC → 211 jobs
- Veritone CPA → 13,805 jobs
- Direct Employers → 4,304 jobs
