'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

type PaymentStep = 'form' | 'processing' | 'success' | 'error';

export default function PaymentPage() {
  const router = useRouter();
  const [step, setStep] = useState<PaymentStep>('form');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    amount: '',
    phoneNumber: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStep('processing');

    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      setStep('error');
      return;
    }

    if (!formData.phoneNumber) {
      setError('Phone number is required');
      setStep('error');
      return;
    }

    if (formData.phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      setStep('error');
      return;
    }

    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          phoneNumber: formData.phoneNumber,
          description: formData.description || 'Welfare contribution',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to initiate payment');
        setStep('error');
        return;
      }

      setSuccessMessage(
        'M-Pesa prompt sent to your phone. Enter your PIN to complete the payment.'
      );
      setStep('success');
      setFormData({ amount: '', phoneNumber: '', description: '' });

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setStep('error');
    }
  };

  const handleReset = () => {
    setStep('form');
    setError('');
    setSuccessMessage('');
    setFormData({ amount: '', phoneNumber: '', description: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Make Payment</h1>
            <p className="text-slate-400 text-sm">Pay using M-Pesa</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="border-slate-600">
              Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {step === 'form' && (
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Payment Details</CardTitle>
              <CardDescription className="text-slate-400">
                Enter your payment information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-slate-300">
                    Amount (KES)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="1"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="e.g., 500"
                    required
                    className="bg-slate-700 border-slate-600 text-white text-lg"
                  />
                  <p className="text-slate-400 text-xs">Minimum amount: KES 1</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-slate-300">
                    M-Pesa Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    placeholder="e.g., 254712345678 or 0712345678"
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <p className="text-slate-400 text-xs">
                    Use the phone number registered with M-Pesa
                  </p>
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
                    placeholder="e.g., Monthly welfare contribution"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
                >
                  Proceed to Payment
                </Button>
              </form>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 text-sm">
                <p className="font-semibold mb-2">How it works:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Enter the amount and M-Pesa phone number</li>
                  <li>Click "Proceed to Payment"</li>
                  <li>You'll receive an M-Pesa prompt on your phone</li>
                  <li>Enter your M-Pesa PIN to complete the payment</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'processing' && (
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="p-12 text-center">
              <Loader className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-semibold text-white mb-2">Processing Payment</h2>
              <p className="text-slate-400">Please wait while we initiate your M-Pesa payment...</p>
            </CardContent>
          </Card>
        )}

        {step === 'success' && (
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Payment Initiated</h2>
              <p className="text-slate-300 mb-4">{successMessage}</p>
              <p className="text-slate-400 text-sm mb-6">
                You will be redirected to your dashboard shortly...
              </p>
              <Button onClick={handleReset} className="bg-blue-600 hover:bg-blue-700">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'error' && (
          <Card className="border-red-700/30 bg-slate-800">
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
              <p className="text-red-400 mb-6">{error}</p>
              <Button onClick={handleReset} className="bg-blue-600 hover:bg-blue-700">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
