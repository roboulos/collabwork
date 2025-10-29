# MCP Tool Bug Report: Addon Management

**Report Date:** 2025-10-29  
**Reporter:** Claude (via user feedback)  
**MCP Tool Version:** Latest (as of 2025-10-29)  
**Instance:** api.collabwork.com  
**Workspace ID:** 10

---

## Issue Summary

The MCP tool's addon management functions have critical gaps that prevent proper investigation and configuration of Xano addons, specifically when trying to understand relationship fields.

---

## Issue 1: `get_addon` Returns 404 for Listed Addons

### What I Tried

After successfully listing addons with `list_addons`, I attempted to get details about a specific addon:

```javascript
mcp__xano-mcp__get_addon({
  instance_name: "api.collabwork.com",
  workspace_id: 10,
  addon_id: 14
})
```

### Expected Result

Detailed information about the "Single Partner" addon, including:
- Configuration details
- Which tables it applies to
- Field names it creates
- How to use it in queries

### Actual Result

```
Addon Details:

ID: undefined
Name: undefined
Type: undefined
Status: 404
Version: unknown
Created: unknown
```

### Why This Is a Problem

1. **No way to inspect addon configuration** - Can't see how the addon works
2. **No mapping to table fields** - Can't determine what field names addons create
3. **Can't troubleshoot relationship queries** - When `with: ['field_name']` doesn't work, there's no way to verify the correct field name

---

## Issue 2: `list_addons` Doesn't Provide Addon IDs

### What I Got

```
• Job is in Job Posting Table (custom) - active
• Single Morning Brew Record For Job Posting (custom) - active
• Job Is In Morning Brew List (custom) - active
...
• Single Partner (custom) - active
...
```

### What's Missing

- **Addon IDs** - No way to know which ID to pass to `get_addon`
- **Table associations** - Which tables does each addon apply to?
- **Field names created** - What virtual fields does each addon create?
- **Configuration status** - Is the addon properly configured?

### Impact

Without addon IDs in the list, there's no way to:
1. Get detailed information about a specific addon
2. Update or configure an addon
3. Troubleshoot when relationship fields don't appear in queries

---

## Issue 3: No Documentation on Addon-Created Fields

### Context

When building an endpoint, I needed to include a relationship field `single_partner` that should be created by the "Single Partner" addon. However:

1. The `get_table_schema` tool doesn't show addon-created fields
2. The `list_addons` tool doesn't show what fields each addon creates
3. No way to discover the correct field name to use in `with: []` parameter

### What I Needed

A way to answer: "What fields does the 'Single Partner' addon create on the `job_posting` table?"

### What I Tried

- ✅ `list_tables` - Works
- ✅ `get_table_schema` - Works but doesn't show addon fields
- ✅ `list_addons` - Works but doesn't show field names or IDs
- ❌ `get_addon` - Returns 404
- ❌ No other tool available to inspect addon configuration

---

## Recommended Fixes

### Fix 1: Make `list_addons` Include IDs

```json
{
  "addons": [
    {
      "id": 14,
      "name": "Single Partner",
      "type": "custom",
      "status": "active",
      "applies_to_tables": [240, 329],
      "creates_fields": ["single_partner"],
      "description": "Creates a relationship field to fetch partner data"
    }
  ]
}
```

### Fix 2: Fix `get_addon` to Return Valid Data

When an addon is listed, `get_addon` should successfully fetch its details using the ID from the list.

### Fix 3: Add Addon Information to `get_table_schema`

Include a section showing addon-created fields:

```json
{
  "schema": [...],
  "addon_fields": [
    {
      "field_name": "single_partner",
      "addon_name": "Single Partner",
      "addon_id": 14,
      "type": "relationship",
      "references_table": "partner"
    }
  ]
}
```

### Fix 4: Add New Tool - `get_table_addon_fields`

A dedicated tool to show which addons affect a specific table and what fields they create:

```javascript
mcp__xano-mcp__get_table_addon_fields({
  instance_name: "api.collabwork.com",
  workspace_id: 10,
  table_id: 240
})
```

Should return:
```json
{
  "table_name": "job_posting",
  "addon_fields": [
    {
      "addon_id": 14,
      "addon_name": "Single Partner",
      "field_name": "single_partner",
      "usage_in_queries": "with: ['single_partner']"
    }
  ]
}
```

---

## Business Impact

**Severity:** High

**Why It Matters:**
- Developers can't troubleshoot relationship queries when fields don't appear
- No way to discover correct field names for addon-created relationships
- Wastes development time trying different field name variations
- Blocks implementation of features that depend on addon relationships

---

## Reproduction Steps

1. Call `list_addons` for any workspace
2. Note there are no IDs in the response
3. Attempt to call `get_addon` with any reasonable ID
4. Observe 404 error
5. Try to determine what field name an addon creates - no tool available

---

## Current Workaround

1. Manual testing with curl to see what fields appear in API responses
2. Trial and error with different field name variations in `with: []`
3. Directly inspecting Xano UI (defeats purpose of MCP automation)

---

## Related Context

This issue was discovered while trying to implement a feed source filter that requires the `single_partner` relationship field. The SDK code generation worked perfectly, but debugging why the relationship wasn't populating was impossible due to these MCP limitations.
