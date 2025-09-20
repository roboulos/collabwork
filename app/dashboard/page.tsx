import { JobTableEnhancedV3 } from '@/components/job-table-enhanced-v3';
import { Navbar } from '@/components/navbar';
import { AuthGuard } from '@/components/auth-guard';

export default function Dashboard() {
  return (
    <AuthGuard>
      <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50/30 to-white dark:from-gray-900 dark:via-purple-950/20 dark:to-black">
        <Navbar />
        <main className="flex-1 overflow-hidden">
          <JobTableEnhancedV3 />
        </main>
      </div>
    </AuthGuard>
  );
}