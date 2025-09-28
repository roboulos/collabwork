# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
CollabWork Frontend - A Next.js application for curating job postings for Morning Brew newsletters. Features a two-table system where original job data is preserved while allowing custom field overrides for display.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run linting
npm run lint

# Type checking (via build command)
npm run build
```

## Architecture & Key Patterns

### Tech Stack
- Next.js 15.5.2 with App Router
- TypeScript with strict mode
- React 19
- Tailwind CSS for styling
- Radix UI + shadcn/ui components
- Xano backend (API at https://api.collabwork.com)
- Tanstack Table for data grids

### Key Architecture Decisions

1. **Two-Table Data System**
   - `job_posting`: Original feed data (never modified)
   - `morningbrew_jobs`: Curated jobs with custom field overrides
   - Custom fields (prefixed with `custom_`) override original data for display

2. **Authentication Flow**
   - Login via `/auth/login` → dashboard at `/dashboard`
   - AuthGuard component wraps protected routes
   - Token stored in Axios interceptor for API calls

3. **API Integration Pattern**
   - All API calls go through `lib/xano.ts` service layer
   - Endpoints follow pattern: `/api:microapp/{context}/{action}`
   - Use POST for all operations (Xano convention)

### Critical Files to Understand

- `lib/xano.ts`: API service layer with all endpoint definitions
- `components/job-table-enhanced-v3.tsx`: Main dashboard table component
- `components/jobs-columns-v4.tsx`: Latest column definitions with custom field logic
- `app/dashboard/page.tsx`: Main dashboard entry point
- `CURRENT_STATUS_AND_GOALS.md`: Active development roadmap

### Custom Field Override Pattern

When displaying job data, always check custom fields first:
```typescript
// Display logic pattern used throughout
const displayTitle = job.morningbrew?.formatted_title || job.title;
const displayCompany = job.morningbrew?.custom_company_name || job.company;
const displayRemote = job.morningbrew?.custom_is_remote || (job.is_remote ? 'Yes' : 'No');
```

### Component Structure
- UI components from shadcn/ui in `components/ui/`
- Page-specific components in `components/`
- Data table components in `components/data-table/`

## Current Development Focus

Based on `CURRENT_STATUS_AND_GOALS.md`, the project is actively developing:
1. Job editing UI (backend APIs ready)
2. Job viewing modal for brew users
3. Copy link functionality with job URLs
4. Community-specific job management

## Testing & Validation

No automated tests currently configured. Manual testing workflow:
1. Run `npm run dev` and test locally
2. Check TypeScript compilation with `npm run build`
3. Validate with `npm run lint`

## Important Context

- This is Ashley's workflow tool for curating Morning Brew job newsletters
- Multiple "brands" (communities) can share the same job posting
- Priority jobs get special handling
- Custom fields allow editorial control without modifying source data