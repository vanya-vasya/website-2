import Receipt from "@/components/pdf/receipt";
import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { receiptId, email, date, tokens, description, amount, currency } = body;

    if (!amount || !currency) {
      return NextResponse.json(
        { error: "Missing required fields: amount, currency" },
        { status: 400 }
      );
    }

    const resolvedReceiptId = receiptId || `rcpt_${Date.now().toString(36)}`;
    const resolvedDate = date || new Date().toISOString();
    const resolvedTokens = tokens ?? 0;
    const resolvedDescription = description || "Nerbixa Generations Purchase";

    // Normalize amount to cents: if user sends 0.05 (EUR decimal) → 5 (cents)
    // If user sends 500 (already cents) → 500 (untouched)
    const amountInCents = Number.isInteger(amount)
      ? amount
      : Math.round(amount * 100);

    const pdfBuffer = await renderToBuffer(
      <Receipt
        receiptId={resolvedReceiptId}
        email={email || ""}
        date={resolvedDate}
        tokens={resolvedTokens}
        description={resolvedDescription}
        amount={amountInCents}
        currency={currency}
      />
    );

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receipt-${resolvedReceiptId}.pdf"`,
        "Content-Length": String(pdfBuffer.byteLength),
      },
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
