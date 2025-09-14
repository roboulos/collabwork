# CollabWork Dashboard Enhancement PRD

## Executive Summary

This PRD outlines the enhancements needed for the CollabWork job curation dashboard system, which serves two primary user groups:
1. **Ashley (Admin)** - Curates and manages job postings from various feeds
2. **Morning Brew Editors** - Select and publish curated jobs in newsletters

The goal is to improve visibility, workflow efficiency, and prevent affiliate link bypass issues that impact revenue.

## Problem Statement

### Current Issues
1. **Limited Visibility**: Admins cannot see which feed jobs come from or their payment types (CPA/CPC)
2. **Status Tracking**: No clear indication of Morning Brew's actions on suggested jobs
3. **Broken Links**: No warning when source jobs are deleted, leading to dead links in newsletters
4. **Revenue Loss**: Editors accidentally copying direct links instead of affiliate URLs
5. **Manual Workflow**: Editors must manually format job titles for newsletters

## User Stories

### Admin (Ashley) Stories
- As an admin, I need to see which feed each job comes from so I can track partner performance
- As an admin, I need to know if a job's source has been deleted so I can remove it before it goes live
- As an admin, I need to see the Morning Brew status of jobs I've suggested to track adoption
- As an admin, I need to distinguish between CPA and CPC jobs to understand revenue potential

### Morning Brew Editor Stories
- As an editor, I need a clear "Copy Shareable Link" button so I don't accidentally bypass affiliate tracking
- As an editor, I need to see a preview of the formatted job title before copying
- As an editor, I need to easily identify which jobs are assigned to my brand
- As an editor, I need to see click counts to track performance

## Functional Requirements

### Phase 1: High Priority Admin Dashboard

#### 1.1 Feed Source Visibility
- Display feed name with payment type (e.g., "Acast CPA", "Ritron CPC")
- Show in a dedicated column in the admin job table
- Color-code CPA vs CPC amounts for quick identification

#### 1.2 Morning Brew Status Integration
- Show MB status (suggested/approved/published/rejected) in admin view
- Visual indicators for each status:
  - Suggested: Blue badge
  - Approved: Green badge
  - Published: Purple badge
  - Rejected: Red badge

#### 1.3 Deleted Source Detection
- Visual indicator when source job is deleted:
  - Gray out the entire row
  - Add "Source Deleted" badge
  - Disable click-through to prevent broken links
- Maintain job visibility for audit trail

### Phase 2: High Priority Morning Brew Dashboard

#### 2.1 Column Reorganization
**New column order:**
1. Formula (formatted job title)
2. Location
3. Assigned Brand
4. Clicks
5. Status
6. Copy Shareable Link (action button)

**Remove:** Individual company/position columns (included in formula)

#### 2.2 Copy Shareable Link Feature
- Prominent button with clear label: "Copy Shareable Link"
- One-click copy of affiliate URL (not direct link)
- Success confirmation on copy
- Button styling to stand out from other actions

#### 2.3 Formula Preview
- Tooltip on hover showing formatted title
- Format: "{Job Title} at {Company} ({Location Status})"
- Example: "Art Therapist at Children's Hospital (Hybrid)"

### Phase 3: Medium Priority Features

#### 3.1 Formula Editing
- Make formatted title editable in admin view
- Auto-save on blur
- Separate from source data (doesn't modify original job/company)

#### 3.2 Auto-Publishing
- Display "Auto-publishes at 30 clicks" indicator
- Automatic status change: Approved → Published at threshold
- Visual progress indicator (e.g., "25/30 clicks")

#### 3.3 Rejected Status
- Add "Rejected" as a status option
- Replace current "Archived" status
- Maintain in filtered view for reference

### Phase 4: Low Priority Enhancements

#### 4.1 Star to Add Feature
- Star icon in "All Jobs" view for Morning Brew users
- Clicking star adds job to their curated list
- Job appears in "Suggested" status

#### 4.2 UI Polish
- Change "All Jobs" button to "Morning Brew Curated Jobs"
- Add job count indicators
- Improve dark mode support

## Technical Requirements

### API Enhancements Needed

#### Xano API Response Updates
```json
{
  "id": 12345,
  "company": "Children's Hospital",
  "title": "Art Therapist",
  
  // NEW REQUIRED FIELDS:
  "feed_name": "Acast CPA",
  "feed_details": {
    "id": 8,
    "name": "Acast",
    "payment_type": "CPA",
    "full_name": "Acast CPA"
  },
  "is_source_deleted": false,
  "payment_type": "CPA",
  "morningbrew_formula": "Art Therapist at Children's Hospital",
  
  // Existing fields maintained...
}
```

### Frontend Updates
- Update TypeScript interfaces
- Modify table column definitions
- Add copy-to-clipboard functionality
- Implement status badges with proper styling
- Add tooltip components

## Success Metrics

1. **Reduced Broken Links**: < 1% of published jobs lead to 404s
2. **Increased Affiliate Revenue**: 0% bypass rate on affiliate links
3. **Improved Efficiency**: 50% reduction in time to curate jobs
4. **Better Visibility**: 100% of jobs show source and status

## Timeline

- **Week 1**: High Priority Admin Features (Feed visibility, status, deleted detection)
- **Week 2**: High Priority MB Dashboard (Column reorg, copy button, preview)
- **Week 3**: Medium Priority Features (Editing, auto-publish, rejected status)
- **Week 4**: Low Priority & Polish

## Dependencies

1. **Xano API Updates**: Required before frontend implementation
2. **User Permissions**: Ensure proper access controls maintained
3. **Data Migration**: Handle existing jobs without new fields gracefully

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| API changes break existing functionality | High | Implement backwards compatibility |
| Editors continue using old workflow | Medium | Training and clear UI changes |
| Performance impact from additional data | Low | Implement efficient queries |

## Future Considerations

1. **Automated Curation**: AI-powered job matching based on brand preferences
2. **Analytics Dashboard**: Detailed performance metrics per feed/partner
3. **Bulk Operations**: Select multiple jobs for status changes
4. **Email Notifications**: Alert on status changes or thresholds

## Appendix

### Current User Flow
1. Ashley reviews incoming jobs from feeds
2. Ashley suggests jobs to Morning Brew brands
3. MB editors review suggested jobs
4. MB editors approve and format job titles
5. MB editors copy title and URL separately
6. Jobs publish to newsletter at 30 clicks or manual trigger

### Improved User Flow
1. Ashley sees complete feed info and suggests jobs
2. System auto-formats job titles
3. MB editors review with all context visible
4. One-click copy of formatted title + affiliate URL
5. Auto-publish at threshold with status tracking
6. Clear indication of any deleted source jobs