import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface StatementTxRow {
  id: string;
  created_at?: string;
  transaction_type?: string;
  metadata?: { description?: string };
  amount_paise?: number;
  idempotency_key?: string;
}

export async function GET() {
  const csvHeaders = 'Transaction ID,Date,Type,Description,Amount (Tokens),Amount (Paise),Idempotency Key\n';
  let csvRows = '';

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('ledger_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    const rows = (data || []) as StatementTxRow[];

    if (rows.length > 0) {
      csvRows = rows
        .map((tx) => {
          const id = tx.id;
          const date = tx.created_at ? new Date(tx.created_at).toISOString() : 'N/A';
          const type = tx.transaction_type || 'TRANSACTION';
          const desc = (tx.metadata?.description || `Transaction ${id}`).replace(/"/g, '""');
          const amountPaise = tx.amount_paise || 0;
          const amountTokens = (amountPaise / 100).toFixed(2);
          const idemp = tx.idempotency_key || '';
          return `"${id}","${date}","${type}","${desc}",${amountTokens},${amountPaise},"${idemp}"`;
        })
        .join('\n');
    } else {
      csvRows = '"INFO-001","' + new Date().toISOString() + '","INFO","No transactions recorded yet in ledger",0,0,"INITIAL"';
    }
  } catch {
    csvRows = '"ERR-001","' + new Date().toISOString() + '","ERROR","Failed to fetch live ledger transactions",0,0,"FALLBACK"';
  }

  const csvContent = csvHeaders + csvRows;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="skillswap_ledger_statement.csv"',
    },
  });
}
