# Xano Addon Syntax Guide - Single Partner Relationship

## Overview

This guide documents the **correct syntax** for using Xano addons to populate related data in API endpoints. Specifically, this covers how to use the "Single Partner" addon to enrich job_posting records with partner information.

---

## The Problem

Jobs in `job_posting` table have a `partner_id` field (foreign key) that references the `partner` table. We need to include the full partner details (partner_name, attributes, etc.) in API responses without manually joining tables.

**Solution:** Use Xano's addon feature to automatically populate partner data for each job.

---

## Data Structure

### Tables Involved

**job_posting** (ID: 240)
- `id` - Primary key
- `partner_id` - Foreign key → partner.id
- `feed_id` - Specific feed within partner
- Other job fields...

**partner** (ID: 293)
- `id` - Primary key
- `partner_name` - Display name (e.g., "Veritone", "Appcast")
- `partner_type` - Array of types
- `attributes` - JSON with nested data

### Example Data Flow
```
job_posting.partner_id: 8 → partner.id: 8 → partner_name: "Veritone"
```

---

## The Addon Definition

The "Single Partner" addon is already defined in Xano:

```xanoscript
addon "Single Partner" {
  input {
    int partner_id? {
      table = "partner"
    }
  }

  stack {
    db.query partner {
      where = $db.partner.id == $input.partner_id
      return = {type: "single"}
    }
  }
}
```

**What this means:**
- Takes a `partner_id` as input
- Queries the `partner` table where `id` matches the input
- Returns a **single partner record**

---

## ✅ CORRECT Syntax for Using Addons

### Per-Job Partner Data (RECOMMENDED)

```xanoscript
query "my-endpoint" verb=POST {
  stack {
    db.query job_posting {
      return = {type: "list", paging: {page: 1, per_page: 10}}

      output = [
        "itemsTotal"
        "itemsReceived"
        "items.*"
      ]

      addon = [
        {
          name : "Single Partner"                    // ← Addon name (exact match)
          input: {partner_id: $output.partner_id}    // ← Uses ROW-LEVEL field (per-job!)
          as   : "items.single_partner"              // ← Nested under items array
        }
      ]
    } as $result
  }

  response = $result
}
```

**Key Points:**
- ✅ Uses `$output.partner_id` to reference **each job's partner_id field**
- ✅ Provides **different partner data for each job**
- ✅ No endpoint input parameter needed
- ✅ Partner data nested as `items.single_partner` in response

### Single Partner Per Request (Alternative)

```xanoscript
query "my-endpoint" verb=POST {
  input {
    int partner_id?  // ← REQUIRED: Endpoint must accept partner_id input
  }

  stack {
    db.query job_posting {
      return = {type: "list", paging: {page: 1, per_page: 10}}

      output = [
        "itemsTotal"
        "itemsReceived"
        "items.*"
      ]

      addon = [
        {
          name : "Single Partner"                   // ← Addon name (exact match)
          input: {partner_id: $input.partner_id}    // ← Uses endpoint parameter
          as   : "single_partner"                   // ← Root-level field
        }
      ]
    } as $result
  }

  response = $result
}
```

**Key Points:**
- ✅ Uses `$input.partner_id` from endpoint parameters
- ❌ **All jobs get the SAME partner data** (limitation)
- ✅ Useful when filtering by specific partner
- ✅ Partner data at root level of response

### In SDK Code (sdk_builder Tool)

```json
{
  "type": "endpoint",
  "name": "my-endpoint",
  "method": "POST",
  "operations": [
    {"method": "input", "args": ["partner_id", "int"]},
    {"method": "dbQuery", "args": ["job_posting", {
      "page": 1,
      "per_page": 10,
      "addons": [{
        "name": "Single Partner",
        "input": {"partner_id": "$input.partner_id"},
        "as": "single_partner"
      }]
    }, "result"]},
    {"method": "response", "args": ["$result"]}
  ]
}
```

---

## How to Call the Endpoint

### cURL Example

```bash
curl -X POST "https://api.collabwork.com/api:microapp/my-endpoint" \
  -H "Content-Type: application/json" \
  -d '{"partner_id": 8, "page": 1, "per_page": 10}'
```

### Response Structure

```json
{
  "itemsReceived": 2,
  "curPage": 1,
  "items": [
    {
      "id": 4467093,
      "partner_id": 8,
      "feed_id": 26,
      "company": "LocumJobsOnline",
      "title": "Physician Job..."
    }
  ],
  "single_partner": {
    "id": 8,
    "partner_name": "Veritone",
    "partner_type": ["JOB_FEED_PARTNER"],
    "attributes": {
      "job_feed_partner": [...]
    }
  }
}
```

**Key Points:**
- ✅ `single_partner` appears at the **root level** of the response
- ✅ Contains the full partner record for the passed `partner_id`
- ✅ All jobs in the `items` array share this same partner data

---

## ❌ Common Mistakes

### 1. Missing Input Parameter

```xanoscript
// ❌ WRONG - No input parameter defined
query "my-endpoint" verb=POST {
  input {}  // ← Missing partner_id!

  stack {
    db.query job_posting {
      addon = [
        {
          name: "Single Partner"
          input: {partner_id: $input.partner_id}  // ← This will be null!
          as: "single_partner"
        }
      ]
    }
  }
}
```

**Result:** `single_partner` will be `null` in response.

### 2. Using Field Name Instead of Input Variable

```xanoscript
// ❌ WRONG - Trying to use field name directly
addon = [
  {
    name: "Single Partner"
    input: {partner_id: "partner_id"}  // ← String won't work
    as: "single_partner"
  }
]
```

**Result:** Addon fails silently, `single_partner` is `null`.

### 3. Wrong Addon Name

```xanoscript
// ❌ WRONG - Addon name must match exactly
addon = [
  {
    name: "singlePartner"  // ← Case matters!
    input: {partner_id: $input.partner_id}
    as: "single_partner"
  }
]
```

**Result:** Error or null response.

---

## Two Approaches for Partner Data

### Approach 1: Per-Job Partner Data (✅ RECOMMENDED)

Use `$output.partner_id` to get **individual partner data for each job**:

```xanoscript
addon = [
  {
    name : "Single Partner"
    input: {partner_id: $output.partner_id}  // ← Row-level field reference
    as   : "items.single_partner"
  }
]
```

**When to use:**
- ✅ Need different partner data for each job
- ✅ Displaying mixed feeds from multiple partners
- ✅ Default dashboard view (unfiltered)

**Result:**
```json
{
  "items": [
    {
      "id": 1,
      "partner_id": 8,
      "single_partner": {"id": 8, "partner_name": "Veritone"}
    },
    {
      "id": 2,
      "partner_id": 6,
      "single_partner": {"id": 6, "partner_name": "Appcast"}
    }
  ]
}
```

### Approach 2: Single Partner Per Request

Use `$input.partner_id` for **one partner across all jobs**:

```xanoscript
addon = [
  {
    name : "Single Partner"
    input: {partner_id: $input.partner_id}  // ← Endpoint parameter
    as   : "single_partner"
  }
]
```

**When to use:**
- ✅ Filtering by specific partner (e.g., "Show me Veritone jobs")
- ✅ All jobs in response have same partner_id
- ❌ NOT for mixed partner queries

**Result:**
```json
{
  "items": [
    {"id": 1, "partner_id": 8},
    {"id": 2, "partner_id": 8}
  ],
  "single_partner": {"id": 8, "partner_name": "Veritone"}
}
```

---

## Tested Examples

### Working Test Endpoint (ID: 9180)

**Endpoint:** `test-addon`
**URL:** `https://api.collabwork.com/api:microapp/test-addon`

**XanoScript:**
```xanoscript
query "test-addon" verb=GET {
  input {
    int partner_id?
  }

  stack {
    db.query job_posting {
      return = {type: "list", paging: {page: 1, per_page: 2}}
      output = [
        "itemsTotal"
        "itemsReceived"
        "curPage"
        "nextPage"
        "prevPage"
        "offset"
        "perPage"
        "items.*"
      ]

      addon = [
        {
          name : "Single Partner"
          input: {partner_id: $input.partner_id}
          as   : "single_partner"
        }
      ]
    } as $result
  }

  response = $result
}
```

**Test Command:**
```bash
curl "https://api.collabwork.com/api:microapp/test-addon?partner_id=8"
```

**Result:** ✅ Returns partner data for Veritone (id: 8)

---

## ✅ SOLUTION CONFIRMED

**After extensive testing and reviewing working endpoints (ashley/list-jobs - ID: 9059), we've confirmed:**

- ✅ Addon syntax `input: {partner_id: $output.partner_id}` provides **per-job partner data**
- ✅ Each job gets its own individual partner record
- ✅ No endpoint input parameter needed
- ✅ Works for all queries (filtered and unfiltered)

**The working pattern from ashley/list-jobs:**

```xanoscript
addon = [
  {
    name  : "Single Partner"
    input : {partner_id: $output.partner_id}  // ← Row-level field reference
    as    : "items.single_partner"
  }
]
```

## Implementation Guide

### Step 1: Update Endpoint with Per-Job Addon

Use `$output.partner_id` for row-level partner data:

```xanoscript
query "ashley/search-all-jobs" verb=POST {
  input {
    int page?
    int per_page?
    text search?
    int feed_id?
  }

  stack {
    db.query job_posting {
      where = $db.job_posting.feed_id == $input.feed_id
      return = {type: "list", paging: {page: $input.page, per_page: $input.per_page}}

      output = [
        "itemsTotal"
        "itemsReceived"
        "items.*"
      ]

      addon = [
        {
          name : "Single Partner"
          input: {partner_id: $output.partner_id}  // ← Per-job partner data
          as   : "items.single_partner"
        }
      ]
    } as $result
  }

  response = $result
}
```

### Step 2: Update Frontend to Use Per-Job Partner Data

```typescript
// OLD (root-level partner - BROKEN):
const partnerName = response.single_partner?.partner_name;

// NEW (per-job partner - WORKING):
const partnerName = job.single_partner?.partner_name;
```

### Step 3: Remove Hardcoded Feed Map (Optional)

With per-job partner data, you can eliminate hardcoded mappings:

```typescript
// jobs-columns-v4.tsx
// Before (hardcoded):
const feedIdMap: Record<number, string> = {
  7: "Appcast",
  8: "Appcast",
  26: "Veritone",
  // ...
};

// After (dynamic):
const partnerName = job.single_partner?.partner_name || "Unknown Feed";
```

---

## Key Takeaways

✅ **Per-job addon syntax:** `input: {partner_id: $output.partner_id}`
✅ **Single-partner syntax:** `input: {partner_id: $input.partner_id}`
✅ **Response field:** Defined by `as: "items.single_partner"` (per-job) or `as: "single_partner"` (single)
✅ **Use `$output` for:** Row-level field references (each job gets individual data)
✅ **Use `$input` for:** Endpoint parameter references (all jobs share same data)
❌ **Cannot use:** String field names directly (e.g., `"partner_id"`)

---

**Last Updated:** 2025-11-18 (CORRECTED with $output.partner_id discovery)
**Tested On:** Xano Instance 10, API Group 485
**Working Endpoints:**
- 9059 (ashley/list-jobs) - ✅ Per-job partner data with `$output.partner_id`
- 9180 (test-addon) - ✅ Single partner with `$input.partner_id`
