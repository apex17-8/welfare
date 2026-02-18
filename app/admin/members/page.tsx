'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface Member {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
}

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch('/api/admin/members');
        if (!res.ok) {
          throw new Error('Failed to fetch members');
        }
        const data = await res.json();
        setMembers(data.members || []);
      } catch (err) {
        setError('Failed to load members');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleApprove = async (userId: string) => {
    setProcessingId(userId);
    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'approve' }),
      });

      if (!res.ok) {
        throw new Error('Failed to approve member');
      }

      // Update local state
      setMembers(
        members.map((m) => (m.id === userId ? { ...m, status: 'active' } : m))
      );
    } catch (err) {
      setError('Failed to approve member');
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string) => {
    setProcessingId(userId);
    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'reject' }),
      });

      if (!res.ok) {
        throw new Error('Failed to reject member');
      }

      // Update local state
      setMembers(
        members.map((m) => (m.id === userId ? { ...m, status: 'rejected' } : m))
      );
    } catch (err) {
      setError('Failed to reject member');
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'rejected':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
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
            <h1 className="text-2xl font-bold text-white">Member Management</h1>
            <p className="text-slate-400 text-sm">Approve and manage members</p>
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

        {members.length === 0 ? (
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="p-8 text-center">
              <p className="text-slate-400">No members found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <Card key={member.id} className="border-slate-700 bg-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{member.full_name}</h3>
                        <div className={`flex items-center gap-1 ${getStatusColor(member.status)}`}>
                          {getStatusIcon(member.status)}
                          <span className="text-sm capitalize">{member.status}</span>
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm">{member.email}</p>
                      <p className="text-slate-500 text-xs mt-1">
                        Joined: {new Date(member.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {member.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(member.id)}
                          disabled={processingId === member.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {processingId === member.id ? 'Processing...' : 'Approve'}
                        </Button>
                        <Button
                          onClick={() => handleReject(member.id)}
                          disabled={processingId === member.id}
                          variant="destructive"
                        >
                          {processingId === member.id ? 'Processing...' : 'Reject'}
                        </Button>
                      </div>
                    )}
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
