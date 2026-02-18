// M-Pesa Integration Utilities
// This handles M-Pesa STK Push and payment verification

const MPESA_BASE_URL = 'https://api.safaricom.co.ke';
const SHORTCODE = process.env.MPESA_SHORTCODE || '174379';

interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
}

interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

async function getAccessToken(): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error('M-Pesa credentials not configured');
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  try {
    const response = await fetch(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data: AccessTokenResponse = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('M-Pesa access token error:', error);
    throw error;
  }
}

export async function initiateSTKPush(
  phoneNumber: string,
  amount: number,
  accountReference: string,
  transactionDesc: string
): Promise<STKPushResponse> {
  try {
    const accessToken = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString(
      'base64'
    );

    const payload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.floor(amount),
      PartyA: `254${phoneNumber.slice(-9)}`, // Convert to international format
      PartyB: SHORTCODE,
      PhoneNumber: `254${phoneNumber.slice(-9)}`,
      CallBackURL: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/mpesa-callback`,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
    };

    const response = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`STK Push failed: ${response.statusText}`);
    }

    const data: STKPushResponse = await response.json();
    return data;
  } catch (error) {
    console.error('M-Pesa STK Push error:', error);
    throw error;
  }
}

export async function queryTransactionStatus(
  checkoutRequestId: string
): Promise<any> {
  try {
    const accessToken = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString(
      'base64'
    );

    const payload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    const response = await fetch(
      `${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Query failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('M-Pesa query error:', error);
    throw error;
  }
}

export function validateMpesaCallback(callbackData: any): boolean {
  // Verify the callback came from M-Pesa
  // In production, implement signature verification
  return (
    callbackData &&
    callbackData.Body &&
    callbackData.Body.stkCallback
  );
}
