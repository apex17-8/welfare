'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileNav, DesktopNav } from '@/components/mobile-nav';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Pure Path</h1>
          <MobileNav isAdmin={false} onLogout={handleLogout} userName={user?.fullName} />
          <DesktopNav isAdmin={false} onLogout={handleLogout} userName={user?.fullName} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-slate-400">
                Manage your welfare account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/pay" className="block">
                <Button className="w-full bg-green-600 hover:bg-green-700 mb-2">
                  Make Payment
                </Button>
              </Link>
              <Link href="/dashboard/contributions">
                <Button variant="outline" className="w-full border-slate-600">
                  View Contributions
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-white">My Contributions</CardTitle>
              <CardDescription className="text-slate-400">
                Track your welfare payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">KES 0</div>
              <p className="text-slate-400 text-sm">Total contributed this month</p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-white">My Family</CardTitle>
              <CardDescription className="text-slate-400">
                Family members in the program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">0</div>
              <p className="text-slate-400 text-sm">Registered members</p>
              <Link href="/dashboard/family">
                <Button variant="outline" className="w-full mt-4 border-slate-600">
                  Manage Family
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {user?.role === 'admin' && (
          <div className="mt-8">
            <Link href="/admin">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Go to Admin Dashboard
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
