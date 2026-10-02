import { NextResponse } from 'next/server';
import { generateQuoteBreakdown, PricingInput } from '@/lib/pricing';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PricingInput;
    
    if (!body || !body.type || !body.proposerLeg) {
      return NextResponse.json(
        { error: 'Missing required pricing parameters: type and proposerLeg are mandatory.' },
        { status: 400 }
      );
    }

    const quote = generateQuoteBreakdown(body);
    return NextResponse.json(quote);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to calculate quote breakdown.' },
      { status: 500 }
    );
  }
}
