'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, Clock, TrendingUp, DollarSign } from 'lucide-react';
import { MobileNav, DesktopNav } from '@/components/mobile-nav';

interface Stats {
  totalMembers: number;
  activeMembers: number;
  pendingApprovals: number;
  totalContributions: number;
  totalPayments: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (!res.ok) {
          if (res.status === 403) {
            router.push('/dashboard');
            return;
          }
          throw new Error('Failed to fetch stats');
        }
        const data = await res.json();
        setStats(data.stats);
      } catch (err) {
        setError('Failed to load statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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
          <h1 className="text-2xl font-bold text-white">Pure Path Admin</h1>
          <MobileNav isAdmin={true} onLogout={handleLogout} />
          <DesktopNav isAdmin={true} onLogout={handleLogout} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded text-red-500">
            {error}
          </div>
        )}

        {/* Statistics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Members</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.totalMembers || 0}</div>
              <p className="text-xs text-slate-400">All registered members</p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Active Members</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.activeMembers || 0}</div>
              <p className="text-xs text-slate-400">Approved and active</p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.pendingApprovals || 0}</div>
              <p className="text-xs text-slate-400">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Contributions</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">KES {stats?.totalContributions || 0}</div>
              <p className="text-xs text-slate-400">This month</p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">KES {stats?.totalPayments || 0}</div>
              <p className="text-xs text-slate-400">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/members">
            <Card className="border-slate-700 bg-slate-800 hover:bg-slate-700/80 transition cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white">Member Management</CardTitle>
                <CardDescription className="text-slate-400">
                  Approve and manage members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Manage Members
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/payments">
            <Card className="border-slate-700 bg-slate-800 hover:bg-slate-700/80 transition cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white">Payment Management</CardTitle>
                <CardDescription className="text-slate-400">
                  Track and process payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  View Payments
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/reports">
            <Card className="border-slate-700 bg-slate-800 hover:bg-slate-700/80 transition cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white">Reports</CardTitle>
                <CardDescription className="text-slate-400">
                  View system reports and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  View Reports
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
