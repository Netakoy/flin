import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/user';
import BottomNav from '@/components/bottom-nav';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/select-user');

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="pb-20 max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
