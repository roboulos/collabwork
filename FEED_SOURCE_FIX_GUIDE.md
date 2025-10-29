# Feed Source Fix - Implementation Guide

## Problem Summary
Feed sources aren't appearing in the UI because the API endpoint doesn't include partner relationship data (`single_partner` field).

## Root Cause
- Frontend expects: `job.single_partner?.partner_name`
- API returns: Jobs with only `partner_id` field
- The `with: ['single_partner']` SDK parameter doesn't populate relationship data

## Solution
Manually fetch partner data and attach it to each job in the response.

## Implementation Steps

### Option 1: Copy XanoScript Directly (Recommended)

1. Go to Xano: https://app.xano.com
2. Navigate to: **Workspace 10** → **API Group 485** (😊 Sept2025 MicroApp) → **Endpoint 9164** (ashley/filter-by-partner)
3. Switch to **XanoScript** tab
4. Replace the entire endpoint code with the XanoScript below
5. Click **Save**
6. Test with curl (see Testing section)

**XanoScript to Use:**
```xanoscript
// Filter jobs by partner_id and attach partner relationship data
query "ashley/filter-by-partner" verb=POST {
  input {
    int partner_id
    int page?=1
    int per_page?=50
  }

  stack {
    // Get jobs filtered by partner_id
    db.query job_posting {
      where = $db.job_posting.partner_id == $input.partner_id
      return = {
        type  : "list"
        paging: {
          page    : $input.page
          per_page: $input.per_page
          totals  : true
        }
      }
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
    } as $jobs
    
    // Fetch the partner data once
    db.get partner {
      where = $db.partner.id == $input.partner_id
    } as $partner
    
    // Build enriched items array with partner attached to each job
    var $enriched {
      value = []
    }
    
    // Loop through each job and attach partner
    for $job in $jobs.items {
      var $job_with_partner {
        value = $job
          |set:"single_partner":$partner
      }
      
      var $enriched {
        value = $enriched|push:$job_with_partner
      }
    }
    
    // Build final response with enriched items
    var $result {
      value = {}
        |set:"items":$enriched
        |set:"itemsTotal":$jobs.itemsTotal
        |set:"itemsReceived":$jobs.itemsReceived
        |set:"curPage":$jobs.curPage
        |set:"nextPage":$jobs.nextPage
        |set:"prevPage":$jobs.prevPage
        |set:"offset":$jobs.offset
        |set:"perPage":$jobs.perPage
    }
  }

  response = $result
}
```

### Option 2: Use Xano Visual Editor

If you prefer visual editor:

1. Navigate to endpoint as above
2. **Add Step: Database Request** → **Get Single Record**
   - Table: `partner`
   - Filter: `id` = `$input.partner_id`
   - Variable name: `partner`

3. **Add Step: Variable** → **Create Variable**
   - Name: `enriched`
   - Value: `[]` (empty array)

4. **Add Step: Loop** → **For Each**
   - Array: `$jobs.items`
   - Item variable: `job`
   - Inside loop:
     - **Add Variable**: `job_with_partner` = `$job|set:"single_partner":$partner`
     - **Set Variable**: `enriched` = `$enriched|push:$job_with_partner`

5. **Modify Response**
   - Change `items` from `$jobs.items` to `$enriched`

## Testing

### Test 1: Verify single_partner Field Appears
```bash
curl -X POST "https://api.collabwork.com/api:microapp/ashley/filter-by-partner" \
  -H "Content-Type: application/json" \
  -d '{"partner_id":6,"page":1,"per_page":2}' | jq '.items[0].single_partner'
```

**Expected Output:**
```json
{
  "id": 6,
  "partner_name": "Appcast",
  "is_active": true,
  "partner_type": ["JOB_FEED_PARTNER"]
}
```

**Current Output:** `null` ❌

### Test 2: Verify Full Response Structure
```bash
curl -X POST "https://api.collabwork.com/api:microapp/ashley/filter-by-partner" \
  -H "Content-Type: application/json" \
  -d '{"partner_id":6,"page":1,"per_page":2}' | jq '{
    itemsTotal: .itemsTotal,
    itemsReceived: .itemsReceived,
    first_job_title: .items[0].title,
    first_job_partner: .items[0].single_partner.partner_name
  }'
```

**Expected Output:**
```json
{
  "itemsTotal": 500,
  "itemsReceived": 2,
  "first_job_title": "Director Therapy Operations",
  "first_job_partner": "Appcast"
}
```

## Frontend Verification

After updating the endpoint:

1. Go to http://localhost:3000
2. Log in with testadmin@collabwork.com / password
3. Observe feed source filter should now appear in the toolbar
4. Click "Feed Source" filter
5. Should see options like "Appcast CPA", "Appcast CPC", etc.
6. Select a feed source - jobs should remain visible with proper filtering

## Why This Solution Works

1. **Fetches partner once** - Efficient, only one db.get call
2. **Attaches to each job** - Creates the `single_partner` field frontend expects
3. **Preserves pagination** - All pagination metadata passes through correctly
4. **No SDK limitations** - Pure XanoScript avoids SDK relationship issues

## Files Referenced

- Frontend code: `components/job-table-enhanced-v3.tsx:1177-1192`
- Type definition: `lib/xano.ts:62`
- XanoScript source: `filter-by-partner-xanoscript.xs`

## Bug Reports Filed

- `MCP_BUG_REPORT_ADDONS.md` - Documents MCP tool limitations
- `SDK_BUG_REPORT_WITH_PARAMETER.md` - Documents `with` parameter issues

## Alternative Fix (If Partner Field Name is Different)

If the "Single Partner" addon creates a different field name:

1. List all fields in actual response:
```bash
curl -X POST ".../ashley/filter-by-partner" -d '{"partner_id":6}' | jq '.items[0] | keys'
```

2. Look for partner-related fields
3. Update frontend to use correct field name in `job-table-enhanced-v3.tsx:1179`

## Performance Note

This solution fetches the partner record once per page request, which is optimal since:
- All jobs on a page have the same partner_id (endpoint filters by partner)
- Attaching in a loop is fast (in-memory operation)
- No N+1 query problem
