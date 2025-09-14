# 🎯 PRACTICAL ACTION PLAN - Dashboard Implementation

## PHASE 1: DATABASE CHANGES (20 minutes)

### 1. Add Source Deletion Field to job_posting table
```bash
# Connect to api.collabwork.com workspace 10, table 240 (job_posting)
mcp__xano-turbo__add_field_to_schema instance_name="api.collabwork.com" workspace_id=10 table_id=240 field_name="is_source_deleted" field_type="bool" default_value=false required=false
```

### 2. Add Formatted Title Field to morningbrew_jobs table  
```bash
# Connect to api.collabwork.com workspace 10, table 328 (morningbrew_jobs)
mcp__xano-turbo__add_field_to_schema instance_name="api.collabwork.com" workspace_id=10 table_id=328 field_name="formatted_title" field_type="text" required=false nullable=true
```

### 3. Update Status Enum in morningbrew_jobs
```bash
# This requires manual update in Xano UI to add "rejected" to the enum values
# Current: ["suggested", "approved", "published", "archived"]
# New: ["suggested", "approved", "published", "rejected", "archived"]
```

## PHASE 2: COPY EXISTING ENDPOINTS (30 minutes)

### 4. Copy ashley/list-jobs from MicroApp to enhance it
```bash
# First, get the existing endpoint
mcp__xano-turbo__get_api_with_logic instance_name="api.collabwork.com" workspace_id=10 api_group_id=485 api_id=9059 type="xs"

# Then create enhanced version in same API group
mcp__xano-turbo__create_endpoint instance_name="api.collabwork.com" workspace_id=10 api_group_id=485 sdk_code="[ENHANCED VERSION WITH JOINS]"
```

### 5. Copy morningbrew/list-by-brand and enhance it
```bash
# Get existing endpoint
mcp__xano-turbo__get_api_with_logic instance_name="api.collabwork.com" workspace_id=10 api_group_id=485 api_id=9060 type="xs"

# Create enhanced version with new columns and shareable link integration
mcp__xano-turbo__create_endpoint instance_name="api.collabwork.com" workspace_id=10 api_group_id=485 sdk_code="[ENHANCED VERSION WITH FORMULA AND LINKS]"
```

## PHASE 3: CREATE NEW ENDPOINTS (15 minutes)

### 6. Create Formula Update Endpoint
```bash
mcp__xano-turbo__create_endpoint instance_name="api.collabwork.com" workspace_id=10 api_group_id=485 sdk_code="
const endpoint = create('morningbrew-update-formula', 'POST')
  .description('Update formatted title for Morning Brew job')
  .input('job_posting_id', 'int', { required: true })
  .input('formatted_title', 'text', { required: true })
  .dbEdit('morningbrew_jobs', {
    field_name: 'job_posting_id',
    field_value: '$input.job_posting_id',
    data: {
      formatted_title: '$input.formatted_title',
      updated_at: 'now'
    }
  })
  .response({ success: true, updated_at: '$dbEdit.updated_at' });
return endpoint.build().script;
"
```

### 7. Create Status Update Endpoint
```bash
mcp__xano-turbo__create_endpoint instance_name="api.collabwork.com" workspace_id=10 api_group_id=485 sdk_code="
const endpoint = create('morningbrew-update-status', 'POST')
  .description('Update Morning Brew job status including rejected')
  .input('job_posting_id', 'int', { required: true })
  .input('status', 'text', { required: true })
  .dbEdit('morningbrew_jobs', {
    field_name: 'job_posting_id', 
    field_value: '$input.job_posting_id',
    data: {
      status: '$input.status',
      updated_at: 'now'
    }
  })
  .response({ success: true, new_status: '$input.status' });
return endpoint.build().script;
"
```

## PHASE 4: FIND MORNING BREW PARTNER INFO (10 minutes)

### 8. Find Morning Brew's Partner Details
```bash
# Search partner table for Morning Brew
mcp__xano-turbo__browse_table_content instance_name="api.collabwork.com" workspace_id=10 table_id=293 per_page=50

# Look for partner with name containing "Morning Brew" or "MB" 
# Get their partner_eid for link generation
```

## PHASE 5: CREATE BACKGROUND TASK (15 minutes)

### 9. Create Source Deletion Checker Task
```bash
mcp__xano-turbo__create_background_task instance_name="api.collabwork.com" workspace_id=10 task_name="source-deletion-checker" schedule='{"type": "cron", "cron_expression": "0 * * * *"}' custom_logic="
const task = createTask('source-deletion-checker')
  .description('Check if job source URLs are still valid')
  .schedule('0 * * * *')
  .dbQuery('job_posting', {
    filters: {is_source_deleted: false, status: 'ACTIVE'}, 
    per_page: 100
  }, 'jobs')
  .loop('$jobs.items', 'job')
    .try()
      .httpRequest('HEAD', '$job.application_url', {timeout: 5000}, 'response')
      .if('$response.status >= 400')
        .dbEdit('job_posting', {
          field_name: 'id',
          field_value: '$job.id', 
          data: {is_source_deleted: true}
        })
      .endif()
    .catch()
      .log('Source check failed for job: ' + '$job.id')
    .endtry()
  .endloop()
  .return({checked: '$jobs.count', timestamp: 'now'});
return task.build().script;
"
```

## PHASE 6: TEST THE WORKFLOW (20 minutes)

### 10. Test Existing Link Generation
```bash
# Find Morning Brew partner_eid from step 8, then test link generation
mcp__xano-turbo__test_endpoint instance_name="api.collabwork.com" workspace_id=10 endpoint_url="https://api.collabwork.com/api:partners/query/9085" method="POST" payload="{\"job_eid\": \"test-job-123\", \"partner_eid\": \"[MORNING_BREW_EID]\"}"
```

### 11. Verify Click Tracking Works
```bash
# Test the existing click tracking system
mcp__xano-turbo__browse_table_content instance_name="api.collabwork.com" workspace_id=10 table_id=327 per_page=10
# Check clicks table for recent entries
```

## SUMMARY OF ACTIONS:
✅ **Database**: Add 2 fields (is_source_deleted, formatted_title)  
✅ **API Updates**: Enhance 2 existing endpoints with JOIN queries  
✅ **New Endpoints**: Create 2 new endpoints (formula update, status update)  
✅ **Background Task**: Create hourly source deletion checker  
✅ **Integration**: Find Morning Brew partner_eid and test existing link system  

**Total Time Estimate: 2 hours**

Each step has specific MCP commands you can run directly. This is the surgical, practical approach that leverages existing CollabWork systems while meeting all PRD requirements.

---

## DETAILED PRD REQUIREMENTS MAPPING

### Admin Dashboard Requirements (PRD Phase 1)
- ✅ **Feed Source Visibility**: Steps 4-5 (enhance ashley/list-jobs with partner JOIN)
- ✅ **Morning Brew Status**: Steps 4-5 (add morningbrew_jobs status to admin view)
- ✅ **Source Deletion Detection**: Steps 1, 9 (database field + background task)

### Morning Brew Dashboard Requirements (PRD Phase 2)
- ✅ **Column Reorganization**: Step 5 (enhance morningbrew/list-by-brand)
- ✅ **Copy Shareable Link**: Step 8, 10 (find partner_eid, test existing system)
- ✅ **Formula Preview**: Steps 2, 6 (formatted_title field + update endpoint)

### Additional Features (PRD Phase 3)
- ✅ **Formula Editing**: Step 6 (formula update endpoint)
- ✅ **Rejected Status**: Steps 3, 7 (enum update + status endpoint)
- ✅ **Auto-Publishing**: Already exists (30-click threshold in system)

### Integration Points
- ✅ **Existing Link System**: Leverage partner/query/9085 endpoint
- ✅ **Existing Click Tracking**: Use existing clicks table (327)
- ✅ **Existing Functions**: Reuse job_posting/copy-link function