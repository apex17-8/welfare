'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingUp } from 'lucide-react';

interface Contribution {
  id: string;
  amount: number;
  description: string | null;
  created_at: string;
}

export default function ContributionsPage() {
  const router = useRouter();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [totalContributed, setTotalContributed] = useState(0);

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
  });

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const res = await fetch('/api/members/contributions');
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch contributions');
        }
        const data = await res.json();
        setContributions(data.contributions || []);
        const total = (data.contributions || []).reduce((sum: number, c: Contribution) => sum + c.amount, 0);
        setTotalContributed(total);
      } catch (err) {
        setError('Failed to load contributions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/members/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          description: formData.description || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to add contribution');
        return;
      }

      const data = await res.json();
      setContributions([data.contribution, ...contributions]);
      setTotalContributed(totalContributed + parseFloat(formData.amount));
      setFormData({ amount: '', description: '' });
      setShowForm(false);
    } catch (err) {
      setError('An error occurred');
      console.error(err);
    } finally {
      setSubmitting(false);
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
          <div>
            <h1 className="text-2xl font-bold text-white">My Contributions</h1>
            <p className="text-slate-400 text-sm">Track your welfare contributions</p>
          </div>
          <Link href="/dashboard">
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

        {/* Summary Card */}
        <Card className="border-slate-700 bg-slate-800 mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-white">Total Contributed</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">KES {totalContributed.toLocaleString()}</div>
            <p className="text-slate-400 text-sm">All-time contributions</p>
          </CardContent>
        </Card>

        {showForm && (
          <Card className="border-slate-700 bg-slate-800 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Add Contribution</CardTitle>
              <CardDescription className="text-slate-400">
                Record a new welfare contribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-slate-300">
                    Amount (KES)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0.00"
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-300">
                    Description (Optional)
                  </Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="e.g., Monthly contribution, Emergency fund"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {submitting ? 'Adding...' : 'Add Contribution'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="border-slate-600"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {!showForm && (
          <div className="mb-6">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Contribution
            </Button>
          </div>
        )}

        {contributions.length === 0 ? (
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="p-8 text-center">
              <TrendingUp className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No contributions recorded yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {contributions.map((contribution) => (
              <Card key={contribution.id} className="border-slate-700 bg-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-2xl font-bold text-white">
                          KES {contribution.amount.toLocaleString()}
                        </span>
                      </div>
                      {contribution.description && (
                        <p className="text-slate-400 text-sm">{contribution.description}</p>
                      )}
                      <p className="text-slate-500 text-xs mt-2">
                        {new Date(contribution.created_at).toLocaleDateString()} at{' '}
                        {new Date(contribution.created_at).toLocaleTimeString()}
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
