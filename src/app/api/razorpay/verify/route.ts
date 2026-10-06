import { NextResponse } from 'next/server';
import crypto from 'crypto';

const cleanEnv = (val?: string) => val ? val.replace(/['"]/g, '').trim() : undefined;

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();
    const key_secret = cleanEnv(process.env.RAZORPAY_KEY_SECRET);

    if (!key_secret) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Implement HMAC-SHA256 signature verification
    const hmac = crypto.createHmac('sha256', key_secret);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');
    
    if (generatedSignature === razorpay_signature) {
      // Signature is valid. 
      return NextResponse.json({ success: true, message: 'Payment verified successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Verification Error:', error);
    return NextResponse.json({ error: 'Signature verification failed' }, { status: 500 });
  }
}
