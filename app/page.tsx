import { JobTableEnhancedV2 } from '@/components/job-table-enhanced-v2';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-8">
        <JobTableEnhancedV2 />
      </div>
    </main>
  );
}