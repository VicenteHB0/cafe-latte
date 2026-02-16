import { StaffMenu } from '@/components/StaffMenu';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function MenuPage() {
  const session = await auth();
  
  if (!session) {
     redirect('/login');
  }

  return <StaffMenu username={session.user.name || session.user.username} role={session.user.role} />;
}
