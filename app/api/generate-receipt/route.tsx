import Receipt from "@/components/pdf/receipt";
import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { sendReceiptEmail } from "@/lib/receipt-mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { receiptId, email, date, tokens, description, amount, currency } = body;

    if (!email || !amount || !currency) {
      return NextResponse.json(
        { error: "Missing required fields: email, amount, currency" },
        { status: 400 }
      );
    }

    const resolvedReceiptId = receiptId || `rcpt_${Date.now().toString(36)}`;
    const resolvedDate = date || new Date().toISOString();
    const resolvedTokens = tokens ?? 0;
    const resolvedDescription = description || `Nerbixa Generations Purchase`;

    const pdfBuffer = await renderToBuffer(
      <Receipt
        receiptId={resolvedReceiptId}
        email={email}
        date={resolvedDate}
        tokens={resolvedTokens}
        description={resolvedDescription}
        amount={amount}
        currency={currency}
      />
    );

    await sendReceiptEmail({
      receiptId: resolvedReceiptId,
      email,
      date: resolvedDate,
      tokens: resolvedTokens,
      description: resolvedDescription,
      amount,
      currency,
      pdfBuffer: Buffer.from(pdfBuffer),
    });

    return NextResponse.json({
      success: true,
      receiptId: resolvedReceiptId,
      message: `Receipt sent to ${email}`,
    });
  } catch (error) {
    console.error("[generate-receipt] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate receipt",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
