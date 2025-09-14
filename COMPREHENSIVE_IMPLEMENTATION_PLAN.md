# CollabWork Dashboard Enhancement - COMPREHENSIVE IMPLEMENTATION PLAN

## Executive Summary

This implementation plan combines the DASHBOARD_PRD.md requirements with deep analysis of the existing CollabWork system architecture. The plan leverages maximum existing functionality while building the minimal necessary components to meet all PRD requirements.

## Current System Architecture Analysis

### Existing Data Structure
- **Partners Table (293)**: Contains job feed partners (Appcast, Buyer, etc.) with CPC/CPA payment details in attributes field
- **Job Posting Table (240)**: Source job data with feed_id, partner_id, cpc, cpa, application_url, status
- **MorningBrew Jobs Table (328)**: Curation workflow with complete status flow (suggested → approved → published)
- **Shareable Link Table (313)**: Tracks affiliate URLs with tokens for click tracking
- **Link Generation Function**: `job_posting/copy-link` creates tracked affiliate URLs

### Existing Workflow
1. Jobs flow from feed partners into `job_posting` table
2. Ashley suggests jobs by adding to `morningbrew_jobs` table (status: "suggested")
3. MB editors approve jobs (status: "approved")
4. Auto-publish at 30 clicks or manual publish (status: "published")
5. `copy-link` function generates tracked URLs: `https://api.collabwork.com/api:1SHNakFf/jobs?ref={token}`

### Key System Gaps Identified
1. **Admin Dashboard**: Missing feed source visibility and MB status tracking
2. **Source Detection**: No mechanism to detect when source jobs are deleted
3. **MB Dashboard**: Missing "Copy Shareable Link" button and formula generation
4. **Data Integration**: Feed/partner information not surfaced in curated job views

## Implementation Plan

### PHASE 1: High Priority Admin Dashboard (Week 1)

#### 1.1 Backend API Updates

**Modify Admin Job Listing Endpoint**
```javascript
// API Enhancement: /api/admin/jobs
// Add JOIN queries to existing endpoint
const adminJobsQuery = `
  SELECT 
    jp.*,
    p.partner_name,
    p.attributes as feed_attributes,
    mbj.status as morning_brew_status,
    mbj.click_count,
    mbj.approved_at,
    mbj.published_at
  FROM job_posting jp
  LEFT JOIN partner p ON jp.partner_id = p.id
  LEFT JOIN morningbrew_jobs mbj ON jp.id = mbj.job_posting_id
  WHERE jp.status = 'ACTIVE'
  ORDER BY jp.created_at DESC
`;
```

**Add Schema Fields**
```sql
-- Add to job_posting table
ALTER TABLE job_posting ADD COLUMN is_source_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE job_posting ADD COLUMN source_check_last_verified TIMESTAMP;
```

#### 1.2 Frontend Admin Dashboard Updates

**TypeScript Interface Updates**
```typescript
interface AdminJob {
  // Existing fields...
  id: number;
  title: string;
  company: string;
  application_url: string;
  
  // New fields from API enhancement
  feed_name?: string;
  payment_type?: 'CPA' | 'CPC';
  morning_brew_status?: 'suggested' | 'approved' | 'published' | 'archived';
  is_source_deleted: boolean;
  click_count: number;
}
```

**Column Additions**
```typescript
// Add to admin job table
const adminColumns = [
  // Existing columns...
  {
    key: 'feed_source',
    title: 'Feed Source',
    render: (job: AdminJob) => (
      <FeedSourceBadge 
        name={job.feed_name} 
        paymentType={job.payment_type}
      />
    )
  },
  {
    key: 'mb_status',
    title: 'MB Status',
    render: (job: AdminJob) => (
      <MBStatusBadge status={job.morning_brew_status} />
    )
  }
];
```

**Component Implementations**
```typescript
// FeedSourceBadge Component
const FeedSourceBadge = ({ name, paymentType }: { name?: string, paymentType?: 'CPA' | 'CPC' }) => {
  if (!name) return <span className="text-gray-400">Unknown Feed</span>;
  
  const colorClass = paymentType === 'CPA' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {name} {paymentType}
    </span>
  );
};

// MBStatusBadge Component
const MBStatusBadge = ({ status }: { status?: string }) => {
  if (!status) return null;
  
  const statusConfig = {
    suggested: { color: 'bg-blue-100 text-blue-800', text: 'Suggested' },
    approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
    published: { color: 'bg-purple-100 text-purple-800', text: 'Published' },
    archived: { color: 'bg-gray-100 text-gray-800', text: 'Archived' }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig];
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
};
```

#### 1.3 Source Deletion Detection System

**Background Task Implementation**
```javascript
// Xano Function: source-deletion-checker
function sourceDeletedChecker() {
  const jobs = db.query('job_posting', {
    where: 'is_source_deleted = false AND status = "ACTIVE"',
    limit: 100 // Process in batches
  });
  
  jobs.forEach(job => {
    try {
      // Check if source URL still returns 200
      const response = api.request({
        url: job.application_url,
        method: 'HEAD',
        timeout: 5000
      });
      
      if (response.status === 404 || response.status >= 500) {
        db.edit('job_posting', {
          field_name: 'id',
          field_value: job.id,
          data: {
            is_source_deleted: true,
            source_check_last_verified: 'now'
          }
        });
      }
    } catch (error) {
      // Log and continue
      console.log(`Source check failed for job ${job.id}: ${error.message}`);
    }
  });
}

// Schedule to run every hour
```

**Frontend Handling of Deleted Sources**
```typescript
// Update job row rendering
const JobRow = ({ job }: { job: AdminJob }) => {
  const isSourceDeleted = job.is_source_deleted;
  
  return (
    <tr className={isSourceDeleted ? 'opacity-50 bg-gray-50' : ''}>
      <td>
        {isSourceDeleted && (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium mr-2">
            Source Deleted
          </span>
        )}
        {job.title}
      </td>
      {/* Other columns... */}
    </tr>
  );
};
```

### PHASE 2: High Priority Morning Brew Dashboard (Week 2)

#### 2.1 Backend Updates for MB Dashboard

**Add Formula Generation**
```sql
-- Add to morningbrew_jobs table
ALTER TABLE morningbrew_jobs ADD COLUMN formula_title TEXT;
```

**Formula Generation Function**
```javascript
// Xano Function: generate-job-formula
function generateJobFormula(jobPostingId) {
  const job = db.get('job_posting', {
    field_name: 'id',
    field_value: jobPostingId
  });
  
  // Extract location type
  const locationStatus = job.is_remote ? 'Remote' : 
                        job.location?.city ? 'In-Person' : 'Hybrid';
  
  // Generate formula: "Job Title at Company (Location Status)"
  const formula = `${job.title} at ${job.company} (${locationStatus})`;
  
  return formula;
}
```

**MB Dashboard API Endpoint**
```javascript
// Enhanced Morning Brew jobs endpoint
const mbJobsQuery = `
  SELECT 
    mbj.*,
    jp.title,
    jp.company,
    jp.location,
    jp.is_remote,
    p.partner_name,
    p.attributes as feed_attributes
  FROM morningbrew_jobs mbj
  JOIN job_posting jp ON mbj.job_posting_id = jp.id
  LEFT JOIN partner p ON jp.partner_id = p.id
  WHERE mbj.community_ids CONTAINS ? -- Filter by brand
  ORDER BY mbj.created_at DESC
`;
```

#### 2.2 Frontend MB Dashboard Updates

**Column Reorganization**
```typescript
const morningBrewColumns = [
  {
    key: 'formula',
    title: 'Formula',
    render: (job: MBJob) => (
      <div className="relative group">
        <span className="truncate">{job.formula_title}</span>
        <div className="absolute z-10 invisible group-hover:visible bg-black text-white p-2 rounded text-sm whitespace-nowrap top-full left-0 mt-1">
          {job.formula_title}
        </div>
      </div>
    )
  },
  {
    key: 'location',
    title: 'Location',
    render: (job: MBJob) => job.location?.city || 'Remote'
  },
  {
    key: 'brand',
    title: 'Assigned Brand',
    render: (job: MBJob) => getBrandName(job.community_ids)
  },
  {
    key: 'clicks',
    title: 'Clicks',
    render: (job: MBJob) => (
      <div>
        <span className="font-medium">{job.click_count}/30</span>
        {job.click_count >= 30 && (
          <span className="ml-2 text-green-600 text-xs">Auto-Published</span>
        )}
      </div>
    )
  },
  {
    key: 'status',
    title: 'Status',
    render: (job: MBJob) => <MBStatusBadge status={job.status} />
  },
  {
    key: 'actions',
    title: 'Actions',
    render: (job: MBJob) => <CopyShareableLinkButton job={job} />
  }
];
```

**Copy Shareable Link Component**
```typescript
const CopyShareableLinkButton = ({ job }: { job: MBJob }) => {
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const handleCopyLink = async () => {
    setCopying(true);
    
    try {
      // Call the existing copy-link function
      const response = await api.post('/functions/job_posting/copy-link', {
        job_eid: job.job_posting_eid,
        partner_eid: 'morning-brew-partner-eid' // Get from config
      });
      
      await navigator.clipboard.writeText(response.data);
      setCopied(true);
      
      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    } finally {
      setCopying(false);
    }
  };
  
  return (
    <button
      onClick={handleCopyLink}
      disabled={copying || job.is_source_deleted}
      className={`
        px-3 py-1 rounded text-sm font-medium transition-colors
        ${copied 
          ? 'bg-green-500 text-white' 
          : 'bg-blue-500 hover:bg-blue-600 text-white'
        }
        ${job.is_source_deleted ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {copying ? 'Copying...' : copied ? 'Copied!' : 'Copy Shareable Link'}
    </button>
  );
};
```

### PHASE 3: Medium Priority Features (Week 3)

#### 3.1 Formula Editing Capability

**Backend Enhancement**
```javascript
// API endpoint: PUT /api/morningbrew-jobs/:id/formula
const updateFormula = (jobId, newFormula) => {
  db.edit('morningbrew_jobs', {
    field_name: 'id',
    field_value: jobId,
    data: {
      formula_title: newFormula,
      updated_at: 'now'
    }
  });
};
```

**Frontend Enhancement**
```typescript
const EditableFormula = ({ job, onUpdate }: { job: MBJob, onUpdate: (id: number, formula: string) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formula, setFormula] = useState(job.formula_title);
  
  const handleSave = () => {
    onUpdate(job.id, formula);
    setIsEditing(false);
  };
  
  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          className="border rounded px-2 py-1 text-sm flex-1"
        />
        <button onClick={handleSave} className="text-green-600 hover:text-green-800">
          ✓
        </button>
        <button onClick={() => setIsEditing(false)} className="text-red-600 hover:text-red-800">
          ✗
        </button>
      </div>
    );
  }
  
  return (
    <div className="group cursor-pointer" onClick={() => setIsEditing(true)}>
      <span>{job.formula_title}</span>
      <button className="ml-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600">
        ✎
      </button>
    </div>
  );
};
```

#### 3.2 Auto-Publishing Enhancement

**Visual Progress Indicator**
```typescript
const ClickProgress = ({ clickCount }: { clickCount: number }) => {
  const progress = Math.min((clickCount / 30) * 100, 100);
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
        style={{ width: `${progress}%` }}
      />
      <div className="text-xs text-gray-500 mt-1">
        {clickCount}/30 clicks {progress === 100 && '(Auto-published)'}
      </div>
    </div>
  );
};
```

#### 3.3 Rejected Status Implementation

**Backend Update**
```sql
-- Update morningbrew_jobs status enum
ALTER TABLE morningbrew_jobs MODIFY COLUMN status ENUM(
  'suggested',
  'approved', 
  'published',
  'rejected',
  'archived'
);
```

**Frontend Status Handler**
```typescript
const StatusSelector = ({ job, onStatusChange }: { job: MBJob, onStatusChange: (id: number, status: string) => void }) => {
  const statusOptions = [
    { value: 'suggested', label: 'Suggested', color: 'blue' },
    { value: 'approved', label: 'Approved', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
    { value: 'archived', label: 'Archived', color: 'gray' }
  ];
  
  return (
    <select 
      value={job.status}
      onChange={(e) => onStatusChange(job.id, e.target.value)}
      className="border rounded px-2 py-1 text-sm"
    >
      {statusOptions.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
```

### PHASE 4: Technical Infrastructure (Week 4)

#### 4.1 Error Handling & Monitoring

**Error Boundaries**
```typescript
class DashboardErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to monitoring service
    console.error('Dashboard Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="text-red-800 font-semibold">Something went wrong</h2>
          <p className="text-red-600">Please refresh the page and try again.</p>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

#### 4.2 Performance Optimizations

**API Response Caching**
```typescript
// React Query implementation
const useAdminJobs = () => {
  return useQuery(
    ['admin-jobs'],
    fetchAdminJobs,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false
    }
  );
};

const useMorningBrewJobs = (brandId: string) => {
  return useQuery(
    ['mb-jobs', brandId],
    () => fetchMorningBrewJobs(brandId),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000 // 5 minutes
    }
  );
};
```

#### 4.3 Security Enhancements

**Permission Guards**
```typescript
const usePermissions = () => {
  const { user } = useAuth();
  
  return {
    canViewAdminDashboard: user?.role === 'admin',
    canSuggestJobs: ['admin', 'curator'].includes(user?.role),
    canApproveJobs: ['mb_editor', 'admin'].includes(user?.role),
    canCopyLinks: ['mb_editor', 'mb_viewer', 'admin'].includes(user?.role),
    canEditFormulas: ['admin'].includes(user?.role)
  };
};

const ProtectedComponent = ({ children, permission }: { children: React.ReactNode, permission: keyof ReturnType<typeof usePermissions> }) => {
  const permissions = usePermissions();
  
  if (!permissions[permission]) {
    return <div className="text-gray-500">Access denied</div>;
  }
  
  return <>{children}</>;
};
```

## Implementation Timeline

### Week 1: Admin Dashboard Foundation
- [ ] Backend API modifications for feed source visibility
- [ ] Database schema updates for source deletion tracking  
- [ ] Frontend admin dashboard column additions
- [ ] Source deletion detection background task
- [ ] Basic error handling implementation

### Week 2: Morning Brew Dashboard Core
- [ ] Formula generation system
- [ ] MB dashboard column reorganization
- [ ] Copy shareable link button implementation
- [ ] Click progress visualization
- [ ] Status badge improvements

### Week 3: Advanced Features
- [ ] Editable formula functionality
- [ ] Rejected status implementation
- [ ] Auto-publish progress indicators
- [ ] Enhanced error boundaries
- [ ] Performance optimizations

### Week 4: Polish & Production
- [ ] Security audit and permission system
- [ ] Comprehensive testing suite
- [ ] Documentation updates
- [ ] Performance monitoring setup
- [ ] Production deployment

## Success Metrics

1. **Broken Links Reduction**: < 1% of published jobs lead to 404s
2. **Affiliate Revenue Protection**: 0% bypass rate on affiliate links
3. **Workflow Efficiency**: 50% reduction in time to curate jobs
4. **System Visibility**: 100% of jobs show source and status information
5. **User Adoption**: 90%+ of MB editors use new copy link feature

## Risk Mitigation

1. **Data Migration**: Implement gradual rollout with data backfill
2. **API Compatibility**: Use versioned endpoints to maintain backwards compatibility
3. **Performance Impact**: Implement caching and pagination for large datasets
4. **User Training**: Create documentation and training materials
5. **Rollback Plan**: Maintain ability to revert to previous dashboard versions

## Post-Implementation Enhancements

1. **Analytics Dashboard**: Detailed performance metrics per feed/partner
2. **AI Curation**: Automated job suggestion based on brand preferences  
3. **Bulk Operations**: Multi-select for status changes
4. **Email Notifications**: Alerts for status changes and thresholds
5. **Mobile Optimization**: Responsive design for mobile devices

This comprehensive plan leverages the existing CollabWork architecture while building the minimal necessary components to fully satisfy all PRD requirements. The phased approach ensures rapid delivery of high-value features while maintaining system stability and performance.