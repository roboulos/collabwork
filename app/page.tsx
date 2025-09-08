import { JobTableSimple } from '@/components/job-table-simple';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-8">
        <JobTableSimple />
      </div>
    </main>
  );
}