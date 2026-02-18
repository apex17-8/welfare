'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  full_name: string;
  phone_number: string;
  created_at: string;
  mpesa_receipt?: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch('/api/admin/members'); // Reuse to get initial data
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }
        // In a real scenario, we'd fetch payments here
        // For now, we'll show a placeholder
        setPayments([]);
      } catch (err) {
        setError('Failed to load payments');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    }
  };

  const filteredPayments = payments.filter(
    (p) => filter === 'all' || p.status === filter
  );

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
          <div>
            <h1 className="text-2xl font-bold text-white">Payment Management</h1>
            <p className="text-slate-400 text-sm">Track and manage member payments</p>
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

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'pending', 'completed', 'failed'] as const).map((f) => (
            <Button
              key={f}
              onClick={() => setFilter(f)}
              variant={filter === f ? 'default' : 'outline'}
              className={filter === f ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-600'}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>

        {filteredPayments.length === 0 ? (
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="p-8 text-center">
              <p className="text-slate-400">
                {payments.length === 0 ? 'No payments recorded yet' : 'No payments match the selected filter'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <Card key={payment.id} className="border-slate-700 bg-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">{payment.full_name}</h3>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded text-sm border ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm">{payment.phone_number}</p>
                      <p className="text-slate-500 text-xs mt-1">
                        {new Date(payment.created_at).toLocaleDateString()} at{' '}
                        {new Date(payment.created_at).toLocaleTimeString()}
                      </p>
                      {payment.mpesa_receipt && (
                        <p className="text-slate-500 text-xs mt-1">
                          Receipt: {payment.mpesa_receipt}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">
                        KES {payment.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
