# SDK Bug Report: `with` Parameter Not Populating Relationship Fields

**Report Date:** 2025-10-29  
**Reporter:** Claude (via user feedback)  
**SDK Version:** Latest (via Xano MCP)  
**Instance:** api.collabwork.com  
**Workspace ID:** 10  
**Endpoint:** ashley/filter-by-partner (ID: 9164)

---

## Issue Summary

When using the `with: ['field_name']` parameter in `dbQuery()`, the SDK successfully generates XanoScript without errors, but the specified relationship field does not appear in the API response. No validation warning is provided about missing or incorrect field names.

---

## Context

**Goal:** Create an endpoint that returns jobs with their associated partner information.

**Table Structure:**
- Table: `job_posting` (ID: 240)
- Field: `partner_id` (type: int, tableref_id: 293)
- Related Table: `partner` (ID: 293)
- Expected Field: `single_partner` (created by "Single Partner" addon)

**Frontend Expectation:**
```javascript
jobs.forEach((job) => {
  const partnerName = job.single_partner?.partner_name;
  const paymentType = (job.cpa || 0) > 0 ? "CPA" : "CPC";
  if (partnerName) {
    feedSources.add(`${partnerName} ${paymentType}`);
  }
});
```

---

## What I Tried

### Attempt 1: Basic `with` Syntax

**SDK Code Submitted:**
```javascript
const endpoint = create('ashley/filter-by-partner', 'POST')
  .description('Filter jobs by partner_id with totals enabled and partner relationship')
  .input('partner_id', 'int', { required: true })
  .input('page', 'int', { default: 1 })
  .input('per_page', 'int', { default: 50 })
  .dbQuery('job_posting', {
    filters: {
      partner_id: '$input.partner_id'
    },
    pagination: {
      page: '$input.page',
      per_page: '$input.per_page',
      totals: true
    },
    with: ['single_partner']
  }, 'jobs')
  .response({
    items: '$jobs.items',
    itemsTotal: '$jobs.itemsTotal',
    itemsReceived: '$jobs.itemsReceived',
    curPage: '$jobs.curPage',
    nextPage: '$jobs.nextPage',
    prevPage: '$jobs.prevPage',
    offset: '$jobs.offset',
    perPage: '$jobs.perPage'
  });

return endpoint.build().script;
```

**Result:**
- ✅ SDK accepted the code
- ✅ Endpoint created successfully
- ✅ No errors in middleware response
- ❌ `single_partner` field not present in API response

**API Test:**
```bash
curl -X POST "https://api.collabwork.com/api:microapp/ashley/filter-by-partner" \
  -H "Content-Type: application/json" \
  -d '{"partner_id":6,"page":1,"per_page":2}' | jq '.items[0].single_partner'
```

**Output:** `null`

---

### Attempt 2: Flat Structure (No Nested Pagination)

**SDK Code Submitted:**
```javascript
const endpoint = create('ashley/filter-by-partner', 'POST')
  .description('Filter jobs by partner_id with totals enabled and partner relationship')
  .input('partner_id', 'int', { required: true })
  .input('page', 'int', { default: 1 })
  .input('per_page', 'int', { default: 50 })
  .dbQuery('job_posting', {
    search: "$db.job_posting.partner_id == $input.partner_id",
    with: ['single_partner'],
    page: '$input.page',
    per_page: '$input.per_page',
    totals: true
  }, 'jobs')
  .var('result', '{}|set:"items":$jobs.items|set:"itemsTotal":$jobs.itemsTotal|set:"itemsReceived":$jobs.itemsReceived|set:"curPage":$jobs.curPage|set:"nextPage":$jobs.nextPage|set:"prevPage":$jobs.prevPage|set:"offset":$jobs.offset|set:"perPage":$jobs.perPage')
  .response('$result');

return endpoint.build().script;
```

**Result:**
- ✅ SDK accepted the code
- ✅ Endpoint updated successfully
- ✅ Middleware warnings about dynamic pagination (expected)
- ❌ `single_partner` field still not present in API response

**Generated XanoScript (excerpt):**
```xanoscript
db.query "job_posting" {
  where = $db.job_posting.partner_id == $input.partner_id
  return = {
    type: "list"
    paging: {
      page: $input.page
      per_page: $input.per_page
      totals: true
      metadata: true
    }
  }
  // Note: No visible 'with' clause in generated output
}
```

---

## Expected Behavior

### What Should Happen

When I use `with: ['single_partner']` in the SDK:

1. ✅ SDK should validate that `single_partner` exists as a relationship field
2. ✅ XanoScript should include the relationship in the query
3. ✅ API response should include `single_partner` object with partner data

### What Actually Happens

1. ✅ SDK accepts any field name without validation
2. ❓ XanoScript generation unclear (can't see if `with` is included)
3. ❌ API response only contains base fields, no `single_partner`

---

## Middleware Response Analysis

**From `update_endpoint` success response:**

```json
{
  "success": true,
  "endpoint_id": 9164,
  "validation_passed": true,
  "middleware_warnings": [
    "⚠️ Dynamic search/sort/offset detected with pagination",
    "   → Fix: Use externalPaging object for clarity"
  ],
  "educational_tips": [
    {
      "pattern": "pagination_field_typos",
      "tip": "Pagination field names were corrected automatically"
    }
  ]
}
```

**What's Missing:**
- No validation that `single_partner` is a valid relationship field
- No warning that the `with` parameter had no effect
- No indication that the relationship wasn't populated

---

## Test Results

**Test 1: Check all fields returned**
```bash
curl -X POST ".../ashley/filter-by-partner" -d '{"partner_id":6}' | jq '.items[0] | keys'
```

**Result:** Only base table fields, no `single_partner`

**Test 2: Check partner data exists**
```bash
# Verified partner ID 6 exists in partner table
# partner_name: "Appcast"
# is_active: true
```

**Test 3: Check partner_id is populated**
```bash
curl -X POST ".../ashley/filter-by-partner" -d '{"partner_id":6}' | jq '.items[0].partner_id'
```

**Result:** `6` (correctly populated)

---

## What Works

✅ Endpoint creation/update  
✅ Basic dbQuery with filters  
✅ Pagination with totals  
✅ String search syntax  
✅ Response object building with `|set:` pipeline  

---

## What Doesn't Work

❌ `with: ['field_name']` parameter  
❌ Relationship field population  
❌ Validation of relationship field names  
❌ Warning when `with` parameter has no effect  

---

## SDK Documentation Check

**From SDK Reference:**
```javascript
// No examples found using `with` parameter in dbQuery
// Searched for: "with", "relationship", "include", "join"
// Found: Only basic query examples without relationships
```

**Implication:** The `with` parameter may not be documented or implemented in the SDK.

---

## Questions for SDK Team

1. **Is `with` parameter supported?**  
   - If yes, what's the correct syntax?
   - If no, what's the alternative for including relationship data?

2. **How should relationship fields be accessed?**  
   - Are they named after the foreign key field (e.g., `partner_id` → `partner_id` object)?
   - Are they named by addon (e.g., `single_partner`)?
   - Is there a naming convention?

3. **Should the SDK validate relationship fields?**  
   - Warn when `with` references a non-existent field?
   - Provide suggestions for available relationship fields?

4. **What's the generated XanoScript?**  
   - Does `with: ['field']` map to something in XanoScript?
   - How can we verify the XanoScript includes the relationship?

---

## Recommended Fixes

### Fix 1: Validate `with` Parameter

Add validation that checks if specified fields exist as relationships:

```javascript
// SDK should check:
const field = 'single_partner';
const tableSchema = getTableSchema(240); // job_posting
const addonFields = getTableAddonFields(240);

if (!tableSchema.fields[field] && !addonFields.includes(field)) {
  throw new ValidationError(
    `Field '${field}' not found in table 'job_posting'. ` +
    `Available relationships: ${addonFields.join(', ')}`
  );
}
```

### Fix 2: Document Relationship Query Syntax

Add clear examples to SDK documentation:

```javascript
// Example: Including relationship data
const endpoint = create('list-jobs-with-partner', 'GET')
  .dbQuery('job_posting', {
    with: ['single_partner'], // ← Document this
    pagination: { page: 1, per_page: 20 }
  }, 'jobs')
  .response({ 
    data: '$jobs.items',
    // Access relationship: $jobs.items[0].single_partner.partner_name
  });
```

### Fix 3: Show Relationship Status in Response

Include debug info about what relationships were requested vs. populated:

```json
{
  "success": true,
  "debug": {
    "relationships_requested": ["single_partner"],
    "relationships_populated": [],
    "relationships_failed": [
      {
        "field": "single_partner",
        "reason": "Field not found in table schema or addons"
      }
    ]
  }
}
```

### Fix 4: Provide Alternative Syntax (If `with` Not Supported)

If `with` isn't the right approach, document the correct way:

```javascript
// Option A: Manual addon call?
.addonCall('single_partner', '$jobs.items', 'jobsWithPartner')

// Option B: Function call?
.callFunction('fetch_partner_data', { jobs: '$jobs.items' }, 'enriched')

// Option C: Explicit join?
.dbJoin('job_posting', 'partner', 'partner_id', 'id', 'jobs')
```

---

## Business Impact

**Severity:** High

**Why It Matters:**
- Cannot build endpoints with related data without manual workarounds
- No way to know if relationship queries will work until testing in production
- Developers waste time trying syntax variations that don't work
- Forces manual XanoScript writing instead of using SDK

---

## Workaround Attempted

**Manual Relationship Fetch:**
```javascript
const endpoint = create('ashley/filter-by-partner', 'POST')
  .input('partner_id', 'int', { required: true })
  .dbQuery('job_posting', { 
    search: "$db.job_posting.partner_id == $input.partner_id" 
  }, 'jobs')
  .dbGet('partner', { id: '$input.partner_id' }, 'partner')
  .var('enriched', '...')  // Manually merge partner into each job
  .response('$enriched');
```

**Status:** Not yet tested - would be complex and inefficient to merge data manually for each record.

---

## Files for Reference

1. Frontend code expecting `single_partner`: `components/job-table-enhanced-v3.tsx:1177-1192`
2. Feed source logic: `components/data-table/data-table-toolbar.tsx:78-84`
3. Type definition: `lib/xano.ts:62`

---

## Related Issues

- MCP Tool: Can't inspect addon configuration to verify field names
- SDK Documentation: No examples of relationship queries
- Validation: No warnings when `with` parameter is ignored
