# CollabWork Job Board - Implementation Plan
Generated: 2025-01-23

## 🎯 Critical Features Implementation Plan

---

## 1. 🔍 Search Implementation for 2.7 Million Records

### Current Situation
- **Problem**: No search functionality for 2.7M job records
- **Challenge**: Server-side search required due to data volume
- **Current**: Only client-side filtering on loaded page data

### Proposed Solution Architecture

#### A. Backend (Xano) Changes Required
1. **Search Endpoint Enhancement**
   - Modify `/api:microapp/ashley/list-jobs` endpoint
   - Add full-text search parameter
   - Implement search across multiple fields

2. **Search Index Creation**
   ```sql
   -- Create search indexes for performance
   CREATE INDEX idx_jobs_company_text ON job_postings USING gin(to_tsvector('english', company));
   CREATE INDEX idx_jobs_title_text ON job_postings USING gin(to_tsvector('english', title));
   CREATE INDEX idx_jobs_location ON job_postings USING gin(location);
   CREATE INDEX idx_jobs_searchable_text ON job_postings USING gin(to_tsvector('english', searchable_text));
   ```

3. **Search Strategy**
   - **Option 1: PostgreSQL Full-Text Search** (Recommended)
     - Use tsvector for text indexing
     - Combine multiple fields into searchable_text column
     - Support ranking and relevance scoring
   
   - **Option 2: Elasticsearch Integration**
     - Better for complex queries
     - Requires additional infrastructure
     - More expensive but more powerful

4. **Search Fields to Include**
   - company
   - title / ai_title / formatted_title
   - location (city, state)
   - description / ai_description
   - skills / ai_skills
   - employment_type
   - Custom fields (custom_company_name, custom_location)

#### B. Frontend Changes Required
1. **Search Input Integration**
   - Already have search input in DataTableToolbar
   - Need to connect to server-side search
   - Implement debouncing (already in place)

2. **Code Changes Needed**
   ```typescript
   // In job-table-enhanced-v3.tsx
   const loadJobs = async () => {
     // Pass searchQuery to API
     const result = await xanoService.listJobs(
       currentPage,
       pageSize,
       debouncedSearch, // This needs to work
       filters
     );
   };
   ```

3. **Performance Optimizations**
   - Keep virtualization for large result sets
   - Implement search result caching
   - Show search result count
   - Add "searching..." indicator

### Implementation Steps
1. ✅ Frontend already has search UI
2. ⏳ Xano endpoint needs search parameter handling
3. ⏳ Create database indexes
4. ⏳ Test with sample queries
5. ⏳ Optimize based on performance

### Estimated Timeline
- Backend setup: 2-3 hours
- Frontend integration: 1 hour
- Testing & optimization: 2 hours
- **Total: 5-6 hours**

---

## 2. 📝 Job Title Display Improvements

### Current Issues
- Job titles may be too long
- Formatting inconsistencies
- Need better truncation/display logic

### TODO: Awaiting More Details
- [ ] Get specifics on title display requirements
- [ ] Determine truncation rules
- [ ] Define hover behavior for full titles
- [ ] Consider mobile responsiveness

### Potential Solutions
1. **Smart Truncation**
   ```typescript
   const formatJobTitle = (title: string, maxLength: number = 50) => {
     if (title.length <= maxLength) return title;
     return title.substring(0, maxLength - 3) + '...';
   };
   ```

2. **Tooltip for Full Title**
   - Show truncated in cell
   - Full title on hover
   - Already have tooltip components available

3. **Title Hierarchy**
   - Use formatted_title if available
   - Fall back to ai_title
   - Finally use original title

---

## 3. 🏢 Remote/Hybrid/Onsite Editing Feature

### Current State
- `is_remote` is boolean (true/false only)
- No hybrid option
- Not editable in current UI

### Required Changes

#### A. Backend (Xano) Changes
1. **Database Schema Update**
   ```sql
   -- Option 1: Change is_remote to work_arrangement
   ALTER TABLE job_postings 
   ADD COLUMN work_arrangement VARCHAR(20) DEFAULT 'onsite';
   
   -- Migrate existing data
   UPDATE job_postings 
   SET work_arrangement = CASE 
     WHEN is_remote = true THEN 'remote'
     ELSE 'onsite'
   END;
   
   -- Option 2: Add custom_work_arrangement field
   ALTER TABLE job_postings
   ADD COLUMN custom_work_arrangement VARCHAR(20);
   ```

2. **Update API Endpoints**
   - Modify update-job endpoint to handle new field
   - Add validation for allowed values: ['remote', 'hybrid', 'onsite']
   - Update list-jobs to return new field

#### B. Frontend Changes
1. **Update TypeScript Interface**
   ```typescript
   export interface JobPosting {
     // ...existing fields
     work_arrangement?: 'remote' | 'hybrid' | 'onsite';
     custom_work_arrangement?: string;
   }
   ```

2. **Add Editing UI in Column Definition**
   ```typescript
   {
     accessorKey: "work_arrangement",
     header: "Work Type",
     cell: ({ row }) => {
       const job = row.original;
       const isEditing = editingCell?.jobId === job.id && editingCell?.field === "work_arrangement";
       
       if (isEditing) {
         return (
           <Select value={editValue} onValueChange={setEditValue}>
             <SelectTrigger>
               <SelectValue />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="remote">Remote</SelectItem>
               <SelectItem value="hybrid">Hybrid</SelectItem>
               <SelectItem value="onsite">Onsite</SelectItem>
             </SelectContent>
           </Select>
         );
       }
       
       // Display with edit button (only for Morning Brew items)
       return (
         <div className="flex items-center gap-2">
           <Badge variant={getBadgeVariant(job.work_arrangement)}>
             {job.work_arrangement}
           </Badge>
           {job.is_morningbrew && (
             <Button onClick={() => handleStartEdit(job.id, "work_arrangement", job.work_arrangement)}>
               <Pencil className="h-3 w-3" />
             </Button>
           )}
         </div>
       );
     }
   }
   ```

3. **Update Save Handler**
   ```typescript
   const handleSaveEdit = async () => {
     if (editingCell?.field === 'work_arrangement') {
       await xanoService.updateJob({
         job_posting_id: editingCell.jobId.toString(),
         custom_work_arrangement: editValue,
       });
     }
     // ... rest of save logic
   };
   ```

### Implementation Priority
1. **Phase 1**: Add dropdown editing for work arrangement
2. **Phase 2**: Update backend to support three states
3. **Phase 3**: Migrate existing data
4. **Phase 4**: Update filtering/search to include new field

---

## 4. 🚀 Implementation Priority & Timeline

### Week 1 (Immediate)
1. **Day 1-2**: Search Implementation
   - Create Xano search indexes
   - Update API endpoint
   - Test with subset of data

2. **Day 3**: Remote/Hybrid/Onsite Editing
   - Backend schema update
   - Frontend dropdown implementation
   - Testing with Morning Brew items

### Week 2
1. **Day 4-5**: Job Title Display
   - Implement smart truncation
   - Add tooltips
   - Mobile testing

2. **Day 6-7**: Testing & Optimization
   - Load testing with full 2.7M records
   - Search performance optimization
   - User acceptance testing

---

## 5. 🔧 Technical Considerations

### Performance
- **Search**: Must return results in <2 seconds
- **Virtualization**: Keep for handling large result sets
- **Caching**: Implement Redis for frequent searches
- **Pagination**: Maintain server-side pagination

### Database
- **Indexes**: Critical for 2.7M records
- **Partitioning**: Consider if performance degrades
- **Archiving**: Old jobs (>6 months) to separate table

### Security
- **SQL Injection**: Parameterized queries in Xano
- **Rate Limiting**: Prevent search abuse
- **Input Validation**: Sanitize all user inputs

### UX Improvements
- **Loading States**: Clear feedback during operations
- **Error Handling**: Graceful fallbacks
- **Keyboard Navigation**: For power users
- **Bulk Operations**: Select multiple for editing

---

## 6. 📊 Success Metrics

### Performance KPIs
- Search response time: <2s for 95% of queries
- Page load time: <3s initial load
- Scroll performance: 60fps with virtualization

### User Experience KPIs
- Search accuracy: 90%+ relevant results
- Edit success rate: 95%+ successful saves
- Error rate: <1% of operations

---

## 7. 🔄 Next Steps After Implementation

1. **Advanced Search Features**
   - Filters (salary range, date posted)
   - Saved searches
   - Search history

2. **Bulk Operations**
   - Multi-select editing
   - Bulk status changes
   - Export selected

3. **Analytics Dashboard**
   - Search trends
   - Popular jobs
   - Conversion metrics

---

## Notes for Discussion
- [ ] Confirm work_arrangement field approach
- [ ] Discuss search ranking algorithm
- [ ] Review performance requirements
- [ ] Clarify job title display rules
- [ ] Determine caching strategy

---

*This plan is a living document and will be updated as requirements are clarified.*