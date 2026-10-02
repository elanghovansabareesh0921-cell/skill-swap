import { NextResponse } from 'next/server';

export async function GET() {
  const csvHeaders = 'Transaction ID,Date,Type,Description,Amount (Tokens),Amount (Paise),Idempotency Key\n';
  const csvRows = [
    'tx-001,Today 14:15,HOLD,"Escrow hold for Swap Leg 1 with Ravi",-18,1800,idemp-hold-101',
    'tx-002,Yesterday 19:30,PURCHASE,"Razorpay UPI Token Pack purchase",+200,20000,idemp-rzp-200',
    'tx-003,28 Sep 2026 11:00,RELEASE,"Completion payout for UI design session",+45,4500,idemp-rel-099',
  ].join('\n');

  const csvContent = csvHeaders + csvRows;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="skillswap_ledger_statement.csv"',
    },
  });
}
