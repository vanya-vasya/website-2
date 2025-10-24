import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prismadb from '@/lib/prismadb';

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
    const user = await prismadb.user.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        availableGenerations: true,
        usedGenerations: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', balanceUpdated: false },
        { status: 404 }
      );
    }

    const currentBalance = user.availableGenerations;

    // If transactionId is provided, check if transaction exists
    if (transactionId) {
      const transaction = await prismadb.transaction.findFirst({
        where: {
          userId: userId,
          tracking_id: transactionId,
          status: 'successful',
        },
      });

      if (transaction) {
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

