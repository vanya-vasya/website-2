import nodemailer from 'nodemailer';
import { log } from '@/lib/log';

export interface ReceiptEmailData {
  receiptId: string;
  email: string;
  date: string;
  tokens: number;
  description: string;
  amount: number;
  currency: string;
  /** Pre-rendered PDF buffer — if provided, skips PDF generation */
  pdfBuffer?: Buffer;
}

const createReceiptTransporter = () =>
  nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.RECEIPT_EMAIL || 'no-reply@nerbixa.com',
      pass: process.env.RECEIPT_EMAIL_PASSWORD,
    },
  });

const generateReceiptHtml = (data: ReceiptEmailData): string => {
  const formattedAmount = `${(data.amount / 100).toFixed(2)} ${data.currency}`;
  const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const f = `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Receipt from Nerbixa</title>
</head>
<body style="margin:0;padding:0;background-color:#1a1f36;font-family:${f};-webkit-font-smoothing:antialiased;">

<span style="display:none!important;max-height:0;max-width:0;overflow:hidden;font-size:1px;line-height:1px;color:#1a1f36;">
Your receipt from Nerbixa #${data.receiptId} &mdash; ${formattedAmount}
</span>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#1a1f36;">
<tr><td align="center" style="padding:48px 20px 40px;">
<table width="480" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;width:100%;">

<!-- ======== Header ======== -->
<tr><td style="padding-bottom:32px;">
  <table cellpadding="0" cellspacing="0" border="0"><tr>
    <td valign="middle" style="width:32px;height:32px;">
      <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#06b6d4,#6366f1);text-align:center;line-height:32px;">
        <span style="color:#fff;font-size:14px;font-weight:700;">N</span>
      </div>
    </td>
    <td style="padding-left:12px;">
      <span style="color:#fff;font-size:16px;font-weight:500;font-family:${f};">Nerbixa</span>
    </td>
  </tr></table>
</td></tr>

<!-- ======== Card 1 — Summary ======== -->
<tr><td>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:12px;background-color:#e3e8ee;padding:1px;">
<tr><td>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fff;border-radius:12px;">
<tr><td style="padding:32px;">
  <p style="margin:0 0 2px;font-family:${f};color:#7a7a7a;font-size:14px;line-height:20px;font-weight:500;">Receipt from Nerbixa</p>
  <p style="margin:0 0 2px;font-family:${f};color:#1a1a1a;font-size:36px;line-height:40px;font-weight:600;">${formattedAmount}</p>
  <p style="margin:0;font-family:${f};color:#7a7a7a;font-size:14px;line-height:24px;font-weight:500;">Paid ${formattedDate}</p>

  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td height="16" style="font-size:1px;line-height:1px;">&nbsp;</td></tr>
    <tr><td height="1" style="background-color:#ebebeb;font-size:1px;line-height:1px;">&nbsp;</td></tr>
    <tr><td height="12" style="font-size:1px;line-height:1px;">&nbsp;</td></tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="font-family:${f};color:#7a7a7a;font-size:14px;line-height:16px;">Receipt number</td>
      <td align="right" style="font-family:${f};color:#1a1a1a;font-size:14px;line-height:16px;">${data.receiptId}</td>
    </tr>
    <tr><td colspan="2" height="8" style="font-size:1px;line-height:1px;">&nbsp;</td></tr>
    <tr>
      <td style="font-family:${f};color:#7a7a7a;font-size:14px;line-height:16px;">Payment method</td>
      <td align="right" style="font-family:${f};color:#1a1a1a;font-size:14px;line-height:16px;">Card</td>
    </tr>
  </table>
</td></tr>
</table>
</td></tr>
</table>
</td></tr>

<tr><td height="20" style="font-size:1px;line-height:1px;">&nbsp;</td></tr>

<!-- ======== Card 2 — Line Items ======== -->
<tr><td>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:12px;background-color:#e3e8ee;padding:1px;">
<tr><td>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fff;border-radius:12px;">
<tr><td style="padding:32px;">

  <p style="margin:0 0 24px;font-family:${f};color:#1a1a1a;font-size:16px;line-height:20px;font-weight:500;">Receipt #${data.receiptId}</p>

  <table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="vertical-align:top;">
      <p style="margin:0;font-family:${f};color:#1a1a1a;font-size:14px;line-height:16px;font-weight:500;">${data.description}</p>
      ${data.tokens > 0 ? `<p style="margin:3px 0 0;font-family:${f};color:#999;font-size:12px;line-height:14px;">Qty: ${data.tokens.toLocaleString()} Generations</p>` : ''}
    </td>
    <td align="right" style="vertical-align:top;white-space:nowrap;">
      <span style="font-family:${f};color:#1a1a1a;font-size:14px;line-height:16px;font-weight:500;">${formattedAmount}</span>
    </td>
  </tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td height="16" style="font-size:1px;line-height:1px;">&nbsp;</td></tr>
    <tr><td height="1" style="background-color:#ebebeb;font-size:1px;line-height:1px;">&nbsp;</td></tr>
    <tr><td height="16" style="font-size:1px;line-height:1px;">&nbsp;</td></tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="font-family:${f};color:#1a1a1a;font-size:14px;line-height:16px;font-weight:500;">Total</td>
    <td align="right" style="font-family:${f};color:#1a1a1a;font-size:14px;line-height:16px;font-weight:500;white-space:nowrap;">${formattedAmount}</td>
  </tr></table>

  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td height="16" style="font-size:1px;line-height:1px;">&nbsp;</td></tr>
    <tr><td height="1" style="background-color:#ebebeb;font-size:1px;line-height:1px;">&nbsp;</td></tr>
    <tr><td height="16" style="font-size:1px;line-height:1px;">&nbsp;</td></tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="font-family:${f};color:#1a1a1a;font-size:14px;line-height:16px;font-weight:500;">Amount paid</td>
    <td align="right" style="font-family:${f};color:#1a1a1a;font-size:14px;line-height:16px;font-weight:500;white-space:nowrap;">${formattedAmount}</td>
  </tr></table>

  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td height="16" style="font-size:1px;line-height:1px;">&nbsp;</td></tr>
    <tr><td height="1" style="background-color:#ebebeb;font-size:1px;line-height:1px;">&nbsp;</td></tr>
    <tr><td height="20" style="font-size:1px;line-height:1px;">&nbsp;</td></tr>
  </table>

  <p style="margin:0 0 12px;font-family:${f};color:#999;font-size:14px;line-height:16px;">
    Questions? Contact us at <a href="mailto:support@nerbixa.com" style="color:#625afa;font-weight:bold;text-decoration:none;">support@nerbixa.com</a>
  </p>
  <p style="margin:0;font-family:${f};color:#999;font-size:14px;line-height:16px;">
    <a href="https://www.nerbixa.com" style="color:#625afa;font-weight:bold;text-decoration:none;">nerbixa.com</a>
  </p>

</td></tr>
</table>
</td></tr>
</table>
</td></tr>

<!-- ======== Footer ======== -->
<tr><td height="32" style="font-size:1px;line-height:1px;">&nbsp;</td></tr>
<tr><td style="text-align:center;">
  <p style="margin:0;font-family:${f};color:rgba(255,255,255,0.5);font-size:12px;line-height:20px;">
    Nerbixa &middot; GUARANTEED GREAT SERVICE LTD &middot; 15982295<br/>
    Dept 6162 43 Owston Road, Carcroft, Doncaster, UK, DN6 8DA<br/>
    <a href="https://www.nerbixa.com" style="color:rgba(255,255,255,0.5);text-decoration:none;">nerbixa.com</a>
  </p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
};

const renderPdfBuffer = async (data: ReceiptEmailData): Promise<Buffer | null> => {
  try {
    const { renderToBuffer } = await import('@react-pdf/renderer');
    const { default: Receipt } = await import('@/components/pdf/receipt');
    const result = await renderToBuffer(
      <Receipt
        receiptId={data.receiptId}
        email={data.email}
        date={data.date}
        tokens={data.tokens}
        description={data.description}
        amount={data.amount}
        currency={data.currency}
      />
    );
    return Buffer.from(result);
  } catch (error) {
    log.warn('receipt_mailer.pdf_generation_failed', {
      receiptId: data.receiptId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
};

export const sendReceiptEmail = async (data: ReceiptEmailData): Promise<void> => {
  const password = process.env.RECEIPT_EMAIL_PASSWORD;
  if (!password) {
    log.warn('receipt_mailer.missing_smtp_credentials', { receiptId: data.receiptId });
    return;
  }

  if (!data.email) {
    log.warn('receipt_mailer.missing_customer_email', { receiptId: data.receiptId });
    return;
  }

  try {
    const html = generateReceiptHtml(data);

    // Use pre-rendered buffer if provided (e.g. from /api/generate-receipt),
    // otherwise render fresh
    const pdfBuffer = data.pdfBuffer ?? (await renderPdfBuffer(data));

    const transporter = createReceiptTransporter();
    const fromEmail = process.env.RECEIPT_EMAIL || 'no-reply@nerbixa.com';

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Nerbixa" <${fromEmail}>`,
      to: data.email,
      subject: `Your receipt from Nerbixa #${data.receiptId}`,
      html,
      attachments: pdfBuffer
        ? [
            {
              filename: `receipt-${data.receiptId}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ]
        : [],
    };

    await transporter.sendMail(mailOptions);

    log.info('receipt_mailer.email_sent', {
      receiptId: data.receiptId,
      to: data.email,
      hasPdfAttachment: !!pdfBuffer,
    });
  } catch (error) {
    // Log but never throw — email failure must not break the payment webhook
    log.error('receipt_mailer.send_failed', {
      receiptId: data.receiptId,
      to: data.email,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
