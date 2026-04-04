import { redirect } from 'next/navigation';
import { requireAdminUser } from '@/lib/auth';
import { getAdminDashboardData } from '@/lib/admin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  try {
    await requireAdminUser();
  } catch {
    redirect('/sign-in?redirect_url=/admin');
  }

  const data = await getAdminDashboardData();

  return <AdminDashboard data={data} />;
}