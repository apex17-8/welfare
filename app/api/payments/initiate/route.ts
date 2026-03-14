import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { query } from '@/lib/db';
import { initiateSTKPush } from '@/lib/mpesa';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { amount, phoneNumber, description } = await req.json();

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Create payment record in database
    const paymentResult = await query(
      'INSERT INTO payments (user_id, amount, phone_number, status, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, user_id, amount, phone_number, status',
      [session.id, amount, phoneNumber, 'pending']
    );

    if (!paymentResult || paymentResult.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      );
    }

    const payment = paymentResult[0];

    try {
      // Initiate STK Push with M-Pesa
      const stkResponse = await initiateSTKPush(
        phoneNumber,
        amount,
        payment.id,
        description || 'Welfare contribution'
      );

      // Update payment with M-Pesa transaction ID (if available in response)
      if (stkResponse.CheckoutRequestID) {
        await query(
          'UPDATE payments SET mpesa_transaction_id = $1 WHERE id = $2',
          [stkResponse.CheckoutRequestID, payment.id]
        );
      }

      return NextResponse.json(
        {
          success: true,
          paymentId: payment.id,
          checkoutRequestId: stkResponse.CheckoutRequestID,
          message: 'M-Pesa prompt sent to your phone',
        },
        { status: 200 }
      );
    } catch (mpesaError) {
      // If M-Pesa integration fails, mark payment as failed
      await query(
        'UPDATE payments SET status = $1 WHERE id = $2',
        ['failed', payment.id]
      );

      console.error('M-Pesa error:', mpesaError);
      return NextResponse.json(
        { error: 'Failed to initiate payment. Please try again later.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Payment initiation failed' }, { status: 500 });
  }
}
