'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ContributionData {
  month: string;
  count: number;
  total: number;
}

interface TopContributor {
  id: string;
  full_name: string;
  contribution_count: number;
  total_amount: number;
}

interface RecentPayment {
  id: string;
  amount: number;
  status: string;
  full_name: string;
  created_at: string;
}

interface PaymentStat {
  status: string;
  count: number;
}

interface MemberStatus {
  status: string;
  count: number;
}

interface ReportsData {
  monthlyContributions: ContributionData[];
  paymentStats: PaymentStat[];
  memberDistribution: MemberStatus[];
  topContributors: TopContributor[];
  recentPayments: RecentPayment[];
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

export default function ReportsPage() {
  const router = useRouter();
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('/api/admin/reports/overview');
        if (!res.ok) {
          throw new Error('Failed to fetch reports');
        }
        const reportData = await res.json();
        setData(reportData);
      } catch (err) {
        setError('Failed to load reports');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
            <p className="text-slate-400 text-sm">View system reports and analytics</p>
          </div>
          <Link href="/admin">
            <Button variant="outline" className="border-slate-600">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded text-red-500">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Monthly Contributions Chart */}
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Monthly Contributions</CardTitle>
                <CardDescription className="text-slate-400">
                  Contribution trend over the last 12 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.monthlyContributions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                    <Legend />
                    <Bar dataKey="total" fill="#8b5cf6" name="Total Amount (KES)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Payment Status Distribution */}
              <Card className="border-slate-700 bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Payment Status</CardTitle>
                  <CardDescription className="text-slate-400">
                    Last 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.paymentStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.status}: ${entry.count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {data.paymentStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Member Distribution */}
              <Card className="border-slate-700 bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Member Status</CardTitle>
                  <CardDescription className="text-slate-400">
                    Members by approval status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.memberDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.status}: ${entry.count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {data.memberDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Contributors */}
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Top Contributors</CardTitle>
                <CardDescription className="text-slate-400">
                  Members with highest contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topContributors.map((contributor, index) => (
                    <div key={contributor.id} className="flex items-center justify-between p-3 rounded bg-slate-700/50">
                      <div>
                        <p className="text-white font-semibold">
                          {index + 1}. {contributor.full_name}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {contributor.contribution_count} contributions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">
                          KES {contributor.total_amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Recent Payments</CardTitle>
                <CardDescription className="text-slate-400">
                  Latest payment transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 rounded bg-slate-700/50">
                      <div className="flex-1">
                        <p className="text-white font-semibold">{payment.full_name}</p>
                        <p className="text-slate-400 text-sm">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">KES {payment.amount.toLocaleString()}</p>
                        <p className={`text-xs capitalize ${
                          payment.status === 'completed'
                            ? 'text-green-400'
                            : payment.status === 'failed'
                            ? 'text-red-400'
                            : 'text-yellow-400'
                        }`}>
                          {payment.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
