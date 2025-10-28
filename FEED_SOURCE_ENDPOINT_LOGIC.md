# Feed Source Search Endpoint Logic

## Problem
The frontend sends `feed_source` parameter (partner_id) to filter jobs by partner, but the current endpoint doesn't handle this filtering.

## Solution
Update the `ashley/search-all-jobs_clone` endpoint (ID: 9163) to add partner_id filtering.

## Endpoint Logic (XanoScript/SDK)

```javascript
const endpoint = create('ashley/search-all-jobs_clone', 'POST')
  .description('Search all jobs with optional feed source (partner) filtering')
  .input('page', 'int', { default: 1 })
  .input('per_page', 'int', { default: 50, max: 100 })
  .input('search', 'text', { required: false })
  .input('feed_source', 'int', { required: false })
  
  // Build filters object
  .var('filters', {})
  
  // Add partner_id filter if feed_source is provided
  .if('$input.feed_source', () => {
    endpoint.var('filters.partner_id', '$input.feed_source');
  })
  
  // Add search filter if provided
  .if('$input.search', () => {
    endpoint.var('filters.searchable_text', { search: '$input.search' });
  })
  
  // Query job_posting with filters and pagination
  .dbQuery('job_posting', {
    filters: '$filters',
    pagination: { 
      page: '$input.page', 
      per_page: '$input.per_page' 
    }
  }, 'jobs')
  
  // Return paginated response
  .response({
    items: '$jobs.items',
    curPage: '$jobs.curPage',
    nextPage: '$jobs.nextPage',
    prevPage: '$jobs.prevPage',
    offset: '$jobs.offset',
    itemsTotal: '$jobs.itemsTotal',
    itemsReceived: '$jobs.itemsReceived'
  });

return endpoint.build().script;
```

## Deployment Steps

1. **Go to CollabWork Xano instance**: api.collabwork.com
2. **Navigate to**: Workspace 10 → API Group 485 (😊 Sept2025 MicroApp) → Endpoint 9163
3. **Update the endpoint** with the logic above
4. **Test with curl**:

```bash
# Test without feed_source (should return all jobs)
curl -X POST https://api.collabwork.com/api:microapp/ashley/search-all-jobs_clone \
  -H "Content-Type: application/json" \
  -d '{"page": 1, "per_page": 10, "search": ""}'

# Test with feed_source (should filter by partner_id)
curl -X POST https://api.collabwork.com/api:microapp/ashley/search-all-jobs_clone \
  -H "Content-Type: application/json" \
  -d '{"page": 1, "per_page": 10, "search": "", "feed_source": 123}'
```

## Key Points

1. **partner_id field**: In `job_posting` table, this is a tableref to the `partner` table (ID: 293)
2. **feed_source parameter**: Frontend passes the partner ID as `feed_source`
3. **Filtering logic**: When `feed_source` is provided, filter `job_posting.partner_id = $input.feed_source`
4. **Search combination**: Both search and feed_source can work together

## Frontend Context

The frontend (lib/xano.ts:163) already sends the `feed_source` parameter:
```typescript
feed_source: filters?.feed_source || ''
```

So once the endpoint logic is updated, filtering will work automatically.
