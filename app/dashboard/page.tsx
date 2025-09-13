import { JobTableEnhancedV3 } from '@/components/job-table-enhanced-v3';
import { Navbar } from '@/components/navbar';
import { AuthGuard } from '@/components/auth-guard';

export default function Dashboard() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50/30 to-white dark:from-gray-900 dark:via-purple-950/20 dark:to-black">
        <Navbar />
        <main className="container mx-auto p-4 md:p-8">
          <JobTableEnhancedV3 />
        </main>
      </div>
    </AuthGuard>
  );
}