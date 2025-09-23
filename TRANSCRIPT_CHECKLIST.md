# Transcript Requirements Checklist

## Status Legend
- ✅ Completed
- ⚠️ In Progress
- ❌ Not Started
- ⏸️ On Hold / Not Priority

---

## 1. Morning Brew Dashboard Tasks

### Display & Formula
- [ ] **Job Display Formula** - Change to "Job Title at Company (Remote Status)" 
  - Priority: HIGH
  - Status: ❌ Not Started
  - Notes: Format example: `Software Engineer at Google (Remote)`

### Status & Publishing
- [x] **"Added" Status Clarity** - Differentiate curated vs self-added jobs
  - Status: ✅ Completed in previous work
  
- [ ] **Auto-publish at 30+ clicks** - Verify automatic move to Published tab
  - Priority: MEDIUM
  - Status: ❌ Needs monitoring
  - Notes: System exists but needs verification
  
### UI Elements
- [ ] **Remove Notes Section** - Not needed by Morning Brew
  - Priority: MEDIUM  
  - Status: ❌ Not Started
  
### Feed Management
- [ ] **Feed Integration** - Attach relevant job feeds to dashboard
  - Priority: HIGH
  - Status: ❌ Not Started
  
- [ ] **Feed Filtering** - Limit to active feeds with jobs
  - Priority: MEDIUM
  - Status: ❌ Not Started

---

## 2. Admin/CollabWork Dashboard Tasks

### Core Functionality
- [ ] **Admin Dashboard** - View and manage all jobs
  - Priority: HIGH
  - Status: ⏸️ On Hold (focus on MB first)
  
- [ ] **Duplicate MB Functions** - Reuse MB features for admin side
  - Priority: LOW
  - Status: ⏸️ On Hold

### Job Management
- [ ] **Close Job Functionality** - Add ability to close jobs
  - Priority: MEDIUM
  - Status: ❌ Not Started
  
- [ ] **Remote Field Editing** - Enable editing of remote status
  - Priority: MEDIUM
  - Status: ❌ Not Started
  
### Filtering & Search
- [ ] **View All Feeds** - See all available job feeds
  - Priority: LOW
  - Status: ❌ Not Started
  
- [ ] **Filter Feeds** - Prioritize/exclude specific feeds
  - Priority: LOW
  - Status: ❌ Not Started

---

## 3. Public Job Board Tasks

- [ ] **Populate Public Board** - Display curated jobs
  - Priority: LOW
  - Status: ⏸️ On Hold (not priority)
  
- [ ] **6 AM City API** - Confirm functionality for partners
  - Priority: LOW
  - Status: ⏸️ On Hold

---

## 4. Data/Backend Tasks

### Critical Issues
- [ ] **Job Count Discrepancy** - Investigate 2.7M vs 115K vs 106K indexed
  - Priority: LOW (but important)
  - Status: ❌ Not Started
  - Notes: Critical for search functionality
  
- [ ] **Upstash Syncing Issue** - Fix database to search index sync
  - Priority: LOW (but important)
  - Status: ❌ Not Started
  
### Search & Processing
- [ ] **Search Functionality** - Build endpoint for all jobs/feeds
  - Priority: LOW
  - Status: ❌ Not Started
  
- [ ] **Feed Processing Failures** - Investigate "failed" statuses
  - Priority: LOW
  - Status: ❌ Not Started

---

## 5. UI/UX Fixes

### Visual Issues - COMPLETED TODAY
- [x] **Action Buttons Not Visible** - Fixed opacity issue
  - Status: ✅ Completed
  - Changed opacity-0 to opacity-60
  
- [x] **Text Editing Overwrite Issue** - Fixed auto-select behavior
  - Status: ✅ Completed
  - Removed onFocus select()
  
- [x] **Badge X Button Overlap** - Fixed positioning
  - Status: ✅ Completed
  - Adjusted positioning and padding

### Visual Issues - FROM PREVIOUS SESSION
- [x] **Row Shifting on Click** - Fixed with box-shadow instead of border
  - Status: ✅ Completed
  
- [x] **Toggle Overlap** - Fixed with proper flex container
  - Status: ✅ Completed
  
- [x] **Modal Transparency** - Fixed with solid backgrounds
  - Status: ✅ Completed
  
- [x] **Table Density** - Improved spacing
  - Status: ✅ Completed

### Copy & Spacing
- [x] **"Morning Brew" Spacing** - Add space between words
  - Status: ✅ Completed in previous work
  
### Edit Functionality
- [ ] **Finicky Edit Button** - Make editing more user-friendly
  - Priority: HIGH
  - Status: ❌ Not Started
  - Notes: User reports difficulty clicking edit

---

## 6. Authentication/User Management

### Access Management
- [x] **Repository Access** - GitHub repos shared with admin@collabor.com
  - Status: ✅ Completed
  
- [ ] **User Creation** - Add 10 specific user emails
  - Priority: LOW
  - Status: ❌ Not Started
  - Notes: Standard password: "collab work@Morning Brew"
  
- [ ] **Password Change Feature** - Allow users to change passwords
  - Priority: LOW
  - Status: ⏸️ On Hold
  
### Setup & Documentation
- [ ] **VS Code Setup Instructions** - Loom video for setup
  - Priority: LOW
  - Status: ❌ Not Started

---

## Summary

### Immediate Priorities (Complete TODAY)
1. ✅ Fix action buttons visibility - DONE
2. ✅ Fix text editing overwrite issue - DONE  
3. ✅ Fix badge X button overlap - DONE
4. ❌ Job formula change to include remote status
5. ❌ Fix finicky edit functionality

### Next Priority (This Week)
1. Remove notes section from MB dashboard
2. Enable remote field editing
3. Verify auto-publish at 30+ clicks

### Lower Priority (Future)
1. Admin dashboard duplication
2. Search functionality for all jobs
3. Data discrepancy investigation
4. User management features

### On Hold
- Public job board population
- Full admin dashboard features
- API improvements

---

## Notes from Transcript
- The team is under time pressure to deliver to Morning Brew
- Focus should be on MB dashboard first, admin features second
- There are significant data issues that need investigation but aren't blocking
- Search functionality is critical but complex due to data volume