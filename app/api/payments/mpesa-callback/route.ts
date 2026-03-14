import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { validateMpesaCallback } from '@/lib/mpesa';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate callback
    if (!validateMpesaCallback(body)) {
      console.warn('Invalid M-Pesa callback', body);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const stkCallback = body.Body.stkCallback;
    const resultCode = stkCallback.ResultCode;
    const checkoutRequestId = stkCallback.CheckoutRequestID;

    // Find payment by checkout request ID (stored as mpesa_transaction_id)
    const payments = await query(
      'SELECT id, user_id, amount FROM payments WHERE mpesa_transaction_id = $1',
      [checkoutRequestId]
    );

    if (!payments || payments.length === 0) {
      console.warn('Payment not found for checkout ID:', checkoutRequestId);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const payment = payments[0];

    if (resultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata;
      const items = callbackMetadata.Item;

      let mpesaReceiptNumber = '';
      let mpesaTransactionDate = '';
      let mpesaAmount = 0;

      // Extract metadata
      items.forEach((item: any) => {
        switch (item.Name) {
          case 'MpesaReceiptNumber':
            mpesaReceiptNumber = item.Value;
            break;
          case 'TransactionDate':
            mpesaTransactionDate = item.Value;
            break;
          case 'Amount':
            mpesaAmount = item.Value;
            break;
        }
      });

      // Update payment record (only status field exists in database)
      await query(
        'UPDATE payments SET status = $1, updated_at = NOW() WHERE id = $2',
        ['completed', payment.id]
      );

      // Create audit log (use correct columns: user_id, entity_type, entity_id, action)
      await query(
        'INSERT INTO audit_logs (user_id, entity_type, entity_id, action, new_values, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
        [
          payment.user_id,
          'payment',
          payment.id,
          'payment_completed',
          JSON.stringify({ mpesaReceipt: mpesaReceiptNumber, amount: mpesaAmount }),
        ]
      );

      // Create contribution record
      await query(
        'INSERT INTO contributions (user_id, amount, contribution_type, status, created_at) VALUES ($1, $2, $3, $4, NOW())',
        [payment.user_id, mpesaAmount, 'payment', 'completed']
      );

      console.log(`Payment completed for user ${payment.user_id}:`, mpesaReceiptNumber);
    } else {
      // Payment failed
      const resultDesc = stkCallback.ResultDesc || 'Payment failed';

      await query(
        'UPDATE payments SET status = $1, updated_at = NOW() WHERE id = $2',
        ['failed', payment.id]
      );

      // Create audit log
      await query(
        'INSERT INTO audit_logs (user_id, entity_type, entity_id, action, new_values, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
        [
          payment.user_id,
          'payment',
          payment.id,
          'payment_failed',
          JSON.stringify({ resultCode, resultDesc }),
        ]
      );

      console.log('[v0] Payment failed for user', payment.user_id, ':', resultDesc);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    // Return success to acknowledge receipt - M-Pesa shouldn't retry on application errors
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
