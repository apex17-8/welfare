'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User } from 'lucide-react';

interface FamilyMember {
  id: string;
  full_name: string;
  relationship: string;
  date_of_birth: string | null;
  id_number: string | null;
}

export default function FamilyPage() {
  const router = useRouter();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    relationship: '',
    dateOfBirth: '',
    idNumber: '',
  });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch('/api/members/family');
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch family members');
        }
        const data = await res.json();
        setMembers(data.members || []);
      } catch (err) {
        setError('Failed to load family members');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/members/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          relationship: formData.relationship,
          dateOfBirth: formData.dateOfBirth || null,
          idNumber: formData.idNumber || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to add family member');
        return;
      }

      const data = await res.json();
      setMembers([...members, data.member]);
      setFormData({ fullName: '', relationship: '', dateOfBirth: '', idNumber: '' });
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
            <h1 className="text-2xl font-bold text-white">Family Members</h1>
            <p className="text-slate-400 text-sm">Manage your family members in the program</p>
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

        {showForm && (
          <Card className="border-slate-700 bg-slate-800 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Add Family Member</CardTitle>
              <CardDescription className="text-slate-400">
                Register a new family member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-slate-300">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationship" className="text-slate-300">
                    Relationship
                  </Label>
                  <Select
                    value={formData.relationship}
                    onValueChange={(value) =>
                      setFormData({ ...formData, relationship: value })
                    }
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-slate-300">
                    Date of Birth (Optional)
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idNumber" className="text-slate-300">
                    ID Number (Optional)
                  </Label>
                  <Input
                    id="idNumber"
                    value={formData.idNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, idNumber: e.target.value })
                    }
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {submitting ? 'Adding...' : 'Add Member'}
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
              Add Family Member
            </Button>
          </div>
        )}

        {members.length === 0 ? (
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No family members added yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {members.map((member) => (
              <Card key={member.id} className="border-slate-700 bg-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {member.full_name}
                      </h3>
                      <p className="text-slate-400 text-sm capitalize">
                        {member.relationship}
                      </p>
                      {member.date_of_birth && (
                        <p className="text-slate-500 text-xs mt-2">
                          DOB: {new Date(member.date_of_birth).toLocaleDateString()}
                        </p>
                      )}
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
