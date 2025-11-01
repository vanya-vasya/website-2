import Receipt from "@/components/pdf/receipt";
import { renderToStream } from "@react-pdf/renderer";
import { NextResponse } from "next/server";

// Для POST-запроса с данными в body
export async function POST(req: Request) {
  const body = await req.json();

  // Пример: ожидаем поля invoiceId, email, date, tokens, description, amount, currency
  const { receiptId, email, date, tokens, description, amount, currency } =
    body;

  // Передаем данные в компонент Invoice
  const stream = await renderToStream(
    <Receipt
      receiptId={receiptId}
      email={email}
      date={date}
      tokens={tokens}
      description={description}
      amount={amount}
      currency={currency}
    />
  );

  return new NextResponse(stream as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="receipt-${
        receiptId || "receipt"
      }.pdf"`,
    },
  });
}
