import { JobTableEnhancedV3 } from '@/components/job-table-enhanced-v3';
import { Navbar } from '@/components/navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto p-4 md:p-8">
        <JobTableEnhancedV3 />
      </main>
    </div>
  );
}