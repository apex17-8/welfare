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

    // Find payment by checkout request ID
    const payments = await query(
      'SELECT id, user_id, amount FROM payments WHERE mpesa_checkout_id = $1',
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

      // Update payment record
      await query(
        'UPDATE payments SET status = $1, mpesa_receipt = $2, mpesa_transaction_date = $3, updated_at = NOW() WHERE id = $4',
        ['completed', mpesaReceiptNumber, mpesaTransactionDate, payment.id]
      );

      // Create audit log
      await query(
        'INSERT INTO audit_logs (action, entity_type, entity_id, details, created_at) VALUES ($1, $2, $3, $4, NOW())',
        [
          'payment_completed',
          'payment',
          payment.id,
          JSON.stringify({ mpesaReceipt: mpesaReceiptNumber, amount: mpesaAmount }),
        ]
      );

      // Update contribution record
      await query(
        'INSERT INTO contributions (user_id, amount, description, created_at) VALUES ($1, $2, $3, NOW())',
        [payment.user_id, mpesaAmount, `M-Pesa payment: ${mpesaReceiptNumber}`]
      );

      console.log(`Payment completed for user ${payment.user_id}:`, mpesaReceiptNumber);
    } else {
      // Payment failed
      const resultDesc = stkCallback.ResultDesc || 'Payment failed';

      await query(
        'UPDATE payments SET status = $1, mpesa_error = $2, updated_at = NOW() WHERE id = $3',
        ['failed', resultDesc, payment.id]
      );

      // Create audit log
      await query(
        'INSERT INTO audit_logs (action, entity_type, entity_id, details, created_at) VALUES ($1, $2, $3, $4, NOW())',
        [
          'payment_failed',
          'payment',
          payment.id,
          JSON.stringify({ resultCode, resultDesc }),
        ]
      );

      console.log(`Payment failed for user ${payment.user_id}:`, resultDesc);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    // Return success to acknowledge receipt - M-Pesa shouldn't retry on application errors
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
