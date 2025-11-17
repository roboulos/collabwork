# Complete Implementation Checklist - Oct 31 Meeting

## Visual & UI Improvements (Completed)
- [x] Dark mode polish and visual refinements
- [x] Column headers made readable (light instead of dark)
- [x] Badge styling improvements
- [x] Smoother page transitions (fade instead of white flash)

## Feed Source Filtering
- [ ] Fix feed source dropdown filter to work consistently
- [ ] Resolve issue with multiple feed sources selected simultaneously
- [ ] Ensure feed source filter doesn't keep "first selected" when switching
- [ ] Add Direct Employers Association feed to partner list
- [ ] Investigate missing feeds in Xano data source

## Search Functionality
- [ ] Fix general job search (currently hit-or-miss results)
- [ ] Improve search relevance (e.g., "nurse" should return all nursing jobs)
- [ ] Implement better search algorithm (mentioned trying different search type)
- [ ] Support dual search: by feed source AND by search term
- [ ] Enable search within filtered feed source results

## Date/Timestamp System
- [ ] Add "approved_date" timestamp when job status changes to "approved"
- [ ] Add "closed_date" timestamp when job status changes to "closed"
- [ ] Add "published_date" timestamp when job status changes to "published"
- [ ] Add "curated_date" timestamp when job is first curated

## Closed Tab Improvements
- [ ] Show "Approved" column in Closed tab
- [ ] Display approval date in Closed tab (when was it approved before closing)
- [ ] Handle empty date columns for jobs that were never approved
- [ ] Differentiate between jobs that went straight to closed vs. approved first

## Approved Tab Improvements
- [ ] Fix "Last 7 Days" filter to show jobs approved in last 7 days
- [ ] Ensure approved date displays correctly in Approved view
- [ ] Verify filtering works when no jobs appear despite recent approvals

## Published Tab
- [ ] Add published date column
- [ ] Ensure "Last 7 Days" filter works for published jobs

## Click Count Investigation
- [ ] Investigate jobs showing 25 clicks when they weren't published
- [ ] Verify if issue is visual (frontend limiting to 25) vs. data integrity
- [ ] Check if threshold confusion exists between 25 vs. 30 clicks
- [ ] Confirm click count accuracy tied to tracking system
- [ ] Research if Google Sheet era jobs are causing discrepancy

## Xano View Setup (Ashley's Task)
- [ ] Create Direct Employers view in Xano clicks database
- [ ] Duplicate RTX view structure for Direct Employers
- [ ] Filter by target URL including "de.jobs.net"
- [ ] Verify view shows correct jobs with Summer
- [ ] Keep existing filters (crawler exclusion, IP filtering, etc.)

## App.collabwork.com vs. Brew App Sync
- [ ] Document where app.collabwork.com pulls data from (Andrew to clarify)
- [ ] Investigate why jobs closed in Xano still appear on app.collabwork.com
- [ ] Determine if Upstash or Intelo SS is the data source
- [ ] Assess if sync issue is a priority to fix
- [ ] Consider if improved Versal search could eliminate need for old app

## Communication & Follow-up
- [ ] Ashley to post summary in Slack tech channel
- [ ] Loop Andrew in on app.collabwork.com data source question
- [ ] Robert to update progress on search improvements
- [ ] Ashley to share action items in link group chat
- [ ] Both to review and confirm action items are accurate

## Future Considerations (Not Immediate)
- [ ] Partner login functionality (see earnings, clicks) - not in new app yet
- [ ] Auto-curation feature (manual only in new app currently)
- [ ] Job board sharing functionality improvements
- [ ] Gradual redesign approach (avoid full rebuild)

---

## Priority Order Based on Discussion
1. **Date system** (closed tab showing approval dates)
2. **Search improvements** (general + feed source filtering)
3. **"Last 7 Days" filter fixes**
4. **Click count investigation**
5. **Direct Employers feed integration**
6. **App sync investigation** (lower priority, depends on other improvements)

## Technical Notes

### Date System Implementation
- Store timestamps when status changes occur (approved, closed, published, curated)
- Display appropriate timestamp in each tab view
- Closed tab shows approval date (most important for workflow)
- Approved/Published tabs show their respective dates
- Handle null cases for jobs that skip workflow steps

### Search Architecture
- Current: Two separate search systems (general search + feed source filter)
- Needed: Combined filtering that allows both simultaneously
- Investigation: Better search algorithm for more relevant results
- Goal: Search through filtered results (e.g., search "nurse" within "Appcast" feed)

### Feed Source Filtering Behavior
- Issue: Selecting multiple sources causes first selection to persist
- Root cause: State management when switching between selections
- Solution: Refine filter logic to properly clear previous selections
- Expected: Clean switch between single feed source selections

### App.collabwork.com Mystery
- Old app still in use by some partners
- Pulls from different data source than Xano (Upstash or Intelo SS suspected)
- Jobs closed in Xano don't close on old app
- Long-term solution: Make new Versal app so good the old app becomes unnecessary
