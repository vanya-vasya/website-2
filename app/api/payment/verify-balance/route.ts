import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/lib/db';

// GET - Verify if user's balance has been updated after payment
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const expectedMinBalance = searchParams.get('expectedMinBalance');
    const transactionId = searchParams.get('transactionId');

    // Get user's current balance
    const userResult = await db.query(
      'SELECT "availableGenerations", "usedGenerations" FROM "User" WHERE "clerkId" = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found', balanceUpdated: false },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];
    const currentBalance = user.availableGenerations;

    // If transactionId is provided, check if transaction exists
    if (transactionId) {
      const transactionResult = await db.query(
        'SELECT * FROM "Transaction" WHERE "userId" = $1 AND "tracking_id" = $2 AND "status" = $3',
        [userId, transactionId, 'successful']
      );

      if (transactionResult.rows.length > 0) {
        const transaction = transactionResult.rows[0];
        return NextResponse.json({
          success: true,
          balanceUpdated: true,
          currentBalance,
          transaction: {
            id: transaction.id,
            amount: transaction.amount,
            status: transaction.status,
            paid_at: transaction.paid_at,
          },
        });
      }
    }

    // If expectedMinBalance is provided, check if balance meets the expectation
    if (expectedMinBalance) {
      const minBalance = parseInt(expectedMinBalance);
      const balanceUpdated = currentBalance >= minBalance;

      return NextResponse.json({
        success: true,
        balanceUpdated,
        currentBalance,
        expectedMinBalance: minBalance,
      });
    }

    // Return current balance only
    return NextResponse.json({
      success: true,
      balanceUpdated: false,
      currentBalance,
    });

  } catch (error) {
    console.error('Balance verification error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
