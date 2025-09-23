# Complete Xano Tools Analysis - What I Actually See

## How MCP Tools Are Presented to Me

When I look at available tools, I see them in a flat list with:
1. **Tool name**: `mcp__xano-turbo__[operation_name]`
2. **Description**: A brief text description
3. **Parameters**: JSON schema showing required/optional params

Here's EXACTLY what I see for each category:

---

## 1. Database Management Tools (31 tools)

### What I See:
```
mcp__xano-turbo__list_databases
mcp__xano-turbo__get_workspace_details
mcp__xano-turbo__list_tables
mcp__xano-turbo__get_table_details
mcp__xano-turbo__get_table_schema
mcp__xano-turbo__create_table
mcp__xano-turbo__update_table
mcp__xano-turbo__delete_table
mcp__xano-turbo__truncate_table
mcp__xano-turbo__add_field_to_schema
mcp__xano-turbo__rename_schema_field
mcp__xano-turbo__delete_field
mcp__xano-turbo__create_table_reference_field
mcp__xano-turbo__create_basic_field
mcp__xano-turbo__create_media_field
mcp__xano-turbo__create_advanced_field
mcp__xano-turbo__manage_table_indexes
mcp__xano-turbo__manage_search_indexes
mcp__xano-turbo__browse_table_content
mcp__xano-turbo__get_table_record
mcp__xano-turbo__create_table_record
mcp__xano-turbo__update_table_record
mcp__xano-turbo__delete_table_record
mcp__xano-turbo__get_specific_schema_field
mcp__xano-turbo__replace_entire_schema
mcp__xano-turbo__update_table_autocomplete
mcp__xano-turbo__update_table_meta
mcp__xano-turbo__create_btree_index
mcp__xano-turbo__create_search_index
mcp__xano-turbo__analyze_table
mcp__xano-turbo__migrate_content
```

### The Problem I Face:

When I need to "add a field to a table", I see FOUR different options:
- `add_field_to_schema` - Generic, seems like the right one?
- `create_basic_field` - For simple types like text, int, bool
- `create_media_field` - For file/image fields  
- `create_advanced_field` - For complex types like enum, password, decimal

**I have to read the parameters to understand the difference!** Example:

```typescript
create_basic_field: {
  field_type: enum ["text", "int", "bool", "timestamp", "date", "email", "json"]
}

create_advanced_field: {
  field_type: enum ["enum", "password", "decimal", "uuid", "object", "vector", "geo_point"]
}
```

**Why this matters**: I waste time figuring out WHICH tool to use instead of just adding the field.

---

## 2. API/Endpoint Management Tools (25 tools)

### What I See:
```
mcp__xano-turbo__browse_api_groups
mcp__xano-turbo__create_api_group
mcp__xano-turbo__get_api_group
mcp__xano-turbo__update_api_group
mcp__xano-turbo__delete_api_group
mcp__xano-turbo__browse_apis_in_group
mcp__xano-turbo__get_api
mcp__xano-turbo__delete_api
mcp__xano-turbo__get_api_with_logic
mcp__xano-turbo__publish_api
mcp__xano-turbo__update_api
mcp__xano-turbo__list_apis_with_logic
mcp__xano-turbo__get_api_openapi
mcp__xano-turbo__get_apigroup_openapi
mcp__xano-turbo__create_endpoint
mcp__xano-turbo__update_endpoint
mcp__xano-turbo__deploy_operations
mcp__xano-turbo__data_operations
mcp__xano-turbo__schema_operations
mcp__xano-turbo__security_operations
mcp__xano-turbo__function_operations
mcp__xano-turbo__task_operations
mcp__xano-turbo__file_operations
mcp__xano-turbo__publish_operations
mcp__xano-turbo__sdk_reference
```

### The Confusion:

- `create_endpoint` vs `update_api` vs `deploy_operations` - Which one actually creates a new endpoint?
- `get_api` vs `get_api_with_logic` - Why are these separate?
- `update_api` vs `update_endpoint` - What's the difference?

**Real scenario**: To debug our employment_type issue, should I use:
- `get_api_with_logic` to see the code?
- `data_operations` with operation_type: "api_logic"?
- `browse_apis_in_group` then `get_api`?

---

## 3. Function Management Tools (11 tools)

### What I See:
```
mcp__xano-turbo__list_functions
mcp__xano-turbo__get_function_details
mcp__xano-turbo__update_function
mcp__xano-turbo__delete_function
mcp__xano-turbo__publish_function
mcp__xano-turbo__create_xano_function
mcp__xano-turbo__update_xano_function
mcp__xano-turbo__function_operations
mcp__xano-turbo__function_reference
mcp__xano-turbo__canonical_functions
mcp__xano-turbo__create_function (seems to be missing but referenced)
```

### Where Do These Fit?

Functions are used INSIDE endpoints, but the tools don't make this relationship clear. When I see:
- `create_xano_function` - Is this a reusable function?
- `create_endpoint` - Can this call functions?

The hierarchy isn't obvious from the tool names.

---

## 4. Background Task Tools (10 tools)

### What I See:
```
mcp__xano-turbo__list_tasks
mcp__xano-turbo__get_task_details
mcp__xano-turbo__update_task
mcp__xano-turbo__delete_task
mcp__xano-turbo__publish_task
mcp__xano-turbo__activate_task
mcp__xano-turbo__create_background_task
mcp__xano-turbo__update_background_task
mcp__xano-turbo__task_operations
mcp__xano-turbo__task_creation_guide
```

### Similar Pattern:

Like functions, I have both:
- `update_task` 
- `update_background_task`
- `task_operations` with operation: "update"

Three ways to do the same thing?

---

## 5. System Generation Tools (10 tools)

### What I See:
```
mcp__xano-turbo__create_auth_system
mcp__xano-turbo__create_crud_system
mcp__xano-turbo__create_stripe_system
mcp__xano-turbo__stripe_sdk_create_checkout_system
mcp__xano-turbo__stripe_sdk_create_subscription_system
mcp__xano-turbo__stripe_sdk_create_connect_system
mcp__xano-turbo__stripe_sdk_create_checkout_session
mcp__xano-turbo__stripe_sdk_create_subscription
mcp__xano-turbo__migrate_content
mcp__xano-turbo__monitor_workspace
```

### These Are Actually Good!

High-level operations that do multiple things. But notice:
- `create_stripe_system` 
- `stripe_sdk_create_checkout_system`
- `stripe_sdk_create_checkout_session`

Three levels of Stripe integration - which one for what use case?

---

## 6. Monitoring/Debugging Tools (8 tools)

### What I See:
```
mcp__xano-turbo__browse_logs
mcp__xano-turbo__search_logs
mcp__xano-turbo__browse_request_history
mcp__xano-turbo__search_request_history
mcp__xano-turbo__monitor_workspace
mcp__xano-turbo__get_realtime
mcp__xano-turbo__update_realtime
mcp__xano-turbo__file_operations (includes logs?)
```

### The Most Underutilized:

These are CRITICAL for debugging but named like utilities:
- `browse_request_history` - Should be `debug_recent_api_calls`
- `search_logs` - Should be `find_errors`

---

## 7. Documentation/Reference Tools (12 tools)

### What I See:
```
mcp__xano-turbo__canonical_patterns
mcp__xano-turbo__canonical_db_patterns
mcp__xano-turbo__canonical_api_patterns
mcp__xano-turbo__canonical_storage_patterns
mcp__xano-turbo__canonical_functions
mcp__xano-turbo__canonical_tasks
mcp__xano-turbo__sdk_reference
mcp__xano-turbo__syntax_reference
mcp__xano-turbo__docs_index
mcp__xano-turbo__docs_fetch
mcp__xano-turbo__docs_help
mcp__xano-turbo__get_started
```

### Why Are These Tools?

These feel like they should be embedded knowledge, not tools I call. When would I use:
- `canonical_db_patterns` vs `docs_fetch` with section: "canonical/db"?

---

## 8. The "Operations" Meta-Tools (8 tools)

### What I See:
```
mcp__xano-turbo__data_operations
mcp__xano-turbo__schema_operations
mcp__xano-turbo__security_operations
mcp__xano-turbo__deploy_operations
mcp__xano-turbo__function_operations
mcp__xano-turbo__task_operations
mcp__xano-turbo__file_operations
mcp__xano-turbo__publish_operations
```

### These Are Confusing:

Each has an `operation` parameter with multiple options. Example:

```typescript
data_operations: {
  operation_type: enum ["browse_content", "get_script", "field_details", "update_meta", "api_logic"]
}
```

This means `data_operations` with `operation_type: "api_logic"` overlaps with `get_api_with_logic`. Why both?

---

## What Makes a Good MCP Tool Design

### Good Example: Clear Single Purpose
```typescript
mcp__xano-turbo__get_table_schema
Parameters: instance_name, workspace_id, table_id
Purpose: ONE thing - get schema
```

### Bad Example: Swiss Army Knife
```typescript
mcp__xano-turbo__data_operations
Parameters: operation_type, table_id, api_group_id, api_id, field_name, options...
Purpose: 5+ different things depending on operation_type
```

### Good Example: Workflow Tool
```typescript
mcp__xano-turbo__create_crud_system
Parameters: table, features, operations, auth
Purpose: Complete workflow - creates all CRUD endpoints
```

---

## The Core Issue: Parameter Complexity

You mentioned keeping field creation tools separate because of different parameters. Here's what I see:

### Current State (3 tools):
```typescript
create_basic_field: {
  field_name, field_type: ["text", "int", "bool"], validation: {min_length, max_length}
}

create_media_field: {
  field_name, field_type: ["image", "video", "audio"], file_options: {max_size, formats}
}

create_advanced_field: {
  field_name, field_type: ["enum", "password", "decimal"], advanced_options: {values, precision}
}
```

### Alternative: One Tool with Conditional Params
```typescript
add_field: {
  field_name, 
  field_type, // All types
  options: {} // Different based on field_type
}
```

**The MCP Question**: Can parameter schemas be conditional? If not, separate tools make sense.

---

## What Would Actually Help Me

### 1. Tool Naming Convention
```
[action]_[target]_[modifier]

debug_endpoint_logic (not get_api_with_logic)
inspect_table_data (not browse_table_content)
trace_request_flow (not search_request_history)
```

### 2. Explicit Relationships in Descriptions
```typescript
create_endpoint: {
  description: "Create new API endpoint in a group. Use create_api_group first if needed. Can call functions created with create_xano_function."
}
```

### 3. Workflow Hints
```typescript
update_table_record: {
  description: "Update single record in table",
  workflow_hint: "For debugging, use with browse_table_content first to find record ID"
}
```

### 4. Deprecate Overlapping Tools

Instead of:
- `get_api` 
- `get_api_with_logic`
- `data_operations` with operation: "api_logic"

Just have:
- `inspect_endpoint` with parameter `include_logic: true/false`

---

## The Ultimate Test: Our Current Bug

To debug "employment_type field not persisting", I need to:

1. See the endpoint logic → `get_api_with_logic` or `data_operations`?
2. Check table schema → `get_table_schema` or `get_specific_schema_field`?
3. Test with data → `Bash` with curl (no Xano tool needed)
4. Check if saved → `browse_table_content` or `get_table_record`?
5. See recent requests → `browse_request_history` or `search_request_history`?

**Five decisions before I can even start debugging!**

---

## Recommendation: Tool Consolidation Map

### Keep Separate (Different Core Purpose):
- Tables vs APIs vs Functions vs Tasks
- Create vs Read vs Update vs Delete
- Schema vs Data vs Logic

### Merge (Same Purpose, Different Params):
- All field creation → `add_field` with type-specific options
- All log viewing → `inspect_logs` with filters
- All request history → `trace_requests` with filters

### Rename for Clarity:
- `browse_table_content` → `query_table_data`
- `get_api_with_logic` → `inspect_endpoint_code`
- `manage_table_indexes` → `optimize_table_performance`

### Add New Workflow Tools:
- `debug_field_persistence` - Checks schema, endpoint, and data in one call
- `validate_api_contract` - Compares frontend types with backend schema
- `trace_data_flow` - Shows complete path from API to database

The goal: **Fewer tools that do more complete workflows**, not more tools that do atomic operations.