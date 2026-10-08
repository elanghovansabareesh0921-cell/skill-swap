import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      // Return default initial wallet
      return NextResponse.json({
        wallet: {
          userId,
          availablePaise: 4500,
          heldPaise: 1800,
          lifetimeEarnedPaise: 24000,
          lifetimeSpentPaise: 8200,
        },
        transactions: [],
      });
    }

    const { data: initialWallet, error: walletError } = await admin
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    let walletData = initialWallet;

    // If wallet doesn't exist yet, initialize it
    if (!walletData || walletError) {
      const { data: newWallet } = await admin
        .from('wallets')
        .upsert({
          user_id: userId,
          available_paise: 5000, // 50 SP welcome bonus
          held_paise: 0,
          lifetime_earned_paise: 0,
          lifetime_spent_paise: 0,
        })
        .select()
        .single();

      walletData = newWallet;
    }

    // Fetch transactions
    const { data: txData } = await admin
      .from('ledger_transactions')
      .select('*')
      .or(`source_wallet_id.eq.${userId},dest_wallet_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(30);

    const transactions = (txData || []).map((t) => ({
      id: t.id,
      referenceId: t.reference_id,
      type: t.transaction_type,
      amountPaise: Number(t.amount_paise),
      timestamp: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: t.metadata?.description || `${t.transaction_type} transaction`,
      idempotencyKey: t.idempotency_key,
    }));

    return NextResponse.json({
      wallet: {
        userId,
        availablePaise: Number(walletData?.available_paise || 0),
        heldPaise: Number(walletData?.held_paise || 0),
        lifetimeEarnedPaise: Number(walletData?.lifetime_earned_paise || 0),
        lifetimeSpentPaise: Number(walletData?.lifetime_spent_paise || 0),
      },
      transactions,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch wallet';
    console.error('Wallet balance error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
