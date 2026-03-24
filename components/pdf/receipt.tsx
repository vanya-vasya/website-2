import React from "react";
import path from "path";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Inter",
  fonts: [
    {
      src: path.join(process.cwd(), "public", "assets", "fonts", "Nunito-Regular.ttf"),
      fontWeight: 400,
    },
    {
      src: path.join(process.cwd(), "public", "assets", "fonts", "Nunito-Regular.ttf"),
      fontWeight: 700,
    },
  ],
});

const C = {
  navy: "#1a1f36",
  navyLight: "#242b45",
  white: "#ffffff",
  gray100: "#f6f9fc",
  gray200: "#e3e8ee",
  gray400: "#8898aa",
  gray600: "#525f7f",
  gray900: "#1a1f36",
  accent: "#625afa",
  green: "#0ea47a",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: C.white,
    fontFamily: "Inter",
    fontSize: 10,
    color: C.gray900,
  },

  // ── Header ──────────────────────────────────────
  header: {
    backgroundColor: C.navy,
    paddingHorizontal: 40,
    paddingVertical: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  companyName: {
    color: C.white,
    fontSize: 14,
    fontWeight: 700,
    marginLeft: 10,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerLabel: {
    color: "#8892b0",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  receiptNumber: {
    color: C.white,
    fontSize: 11,
    fontWeight: 700,
    marginTop: 2,
  },

  // ── Amount block ─────────────────────────────────
  amountSection: {
    backgroundColor: C.gray100,
    paddingHorizontal: 40,
    paddingVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: C.gray200,
  },
  amountLabel: {
    color: C.gray400,
    fontSize: 10,
    marginBottom: 6,
  },
  amountValue: {
    color: C.navy,
    fontSize: 32,
    fontWeight: 700,
    marginBottom: 4,
  },
  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  paidDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.green,
    marginRight: 5,
  },
  paidText: {
    color: C.green,
    fontSize: 10,
    fontWeight: 700,
  },

  // ── Body ─────────────────────────────────────────
  body: {
    paddingHorizontal: 40,
    paddingTop: 28,
    paddingBottom: 20,
  },

  // ── Info grid ────────────────────────────────────
  infoGrid: {
    flexDirection: "row",
    marginBottom: 28,
  },
  infoCell: {
    flex: 1,
  },
  infoLabel: {
    color: C.gray400,
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    color: C.navy,
    fontSize: 10,
    fontWeight: 700,
  },

  // ── Section title ─────────────────────────────────
  sectionTitle: {
    color: C.gray400,
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.gray200,
  },

  // ── Table ─────────────────────────────────────────
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.gray200,
  },
  tableRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 10,
  },
  tableLeft: {
    flex: 1,
    paddingRight: 20,
  },
  tableRight: {
    minWidth: 80,
    textAlign: "right",
  },
  tableDesc: {
    color: C.navy,
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 2,
  },
  tableSubtext: {
    color: C.gray400,
    fontSize: 9,
  },
  tableAmount: {
    color: C.navy,
    fontSize: 10,
    fontWeight: 700,
    textAlign: "right",
  },
  tableAmountSub: {
    color: C.gray400,
    fontSize: 9,
    textAlign: "right",
  },

  // ── Total ─────────────────────────────────────────
  totalSection: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: C.navy,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalLabel: {
    color: C.gray600,
    fontSize: 10,
  },
  totalValue: {
    color: C.gray600,
    fontSize: 10,
    textAlign: "right",
  },
  totalPaidRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  totalPaidLabel: {
    color: C.navy,
    fontSize: 11,
    fontWeight: 700,
  },
  totalPaidValue: {
    color: C.navy,
    fontSize: 11,
    fontWeight: 700,
    textAlign: "right",
  },

  // ── Support note ──────────────────────────────────
  supportNote: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: C.gray200,
    color: C.gray400,
    fontSize: 9,
    lineHeight: 1.5,
  },

  // ── Footer ────────────────────────────────────────
  footer: {
    backgroundColor: C.gray100,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: C.gray200,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: {
    flex: 1,
  },
  footerCompany: {
    color: C.gray600,
    fontSize: 8,
    fontWeight: 700,
    marginBottom: 2,
  },
  footerAddress: {
    color: C.gray400,
    fontSize: 8,
    lineHeight: 1.5,
  },
  footerRight: {
    alignItems: "flex-end",
  },
  footerContact: {
    color: C.gray400,
    fontSize: 8,
    textAlign: "right",
    lineHeight: 1.5,
  },
  footerAccent: {
    color: C.accent,
    fontSize: 8,
  },
});

const company = {
  name: "Nerbixa",
  legal: "GUARANTEED GREAT SERVICE LTD",
  number: "15982295",
  address: "Dept 6162, 43 Owston Road, Carcroft\nDoncaster, United Kingdom, DN6 8DA",
  website: "nerbixa.com",
  email: "support@nerbixa.com",
  logo: path.join(process.cwd(), "public", "logos", "nerbixa-logo.png"),
};

const formatAmount = (amount: number, currency: string) =>
  `${(amount / 100).toFixed(2)} ${currency}`;

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const Receipt = ({
  receiptId = "rcpt_000000000000",
  email = "",
  date = new Date().toISOString(),
  tokens = 0,
  description = "Nerbixa Generations Purchase",
  amount,
  currency,
}: {
  receiptId?: string;
  email: string;
  date: string;
  tokens: number;
  description: string;
  amount: number;
  currency: string;
}) => {
  const amountStr = formatAmount(amount, currency);
  const dateStr = formatDate(date);

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image src={company.logo} style={styles.logo} />
            <Text style={styles.companyName}>{company.name}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerLabel}>Receipt</Text>
            <Text style={styles.receiptNumber}>#{receiptId}</Text>
          </View>
        </View>

        {/* ── Amount ── */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Amount paid</Text>
          <Text style={styles.amountValue}>{amountStr}</Text>
          <View style={styles.paidBadge}>
            <View style={styles.paidDot} />
            <Text style={styles.paidText}>Paid {dateStr}</Text>
          </View>
        </View>

        {/* ── Body ── */}
        <View style={styles.body}>

          {/* Info grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Receipt number</Text>
              <Text style={styles.infoValue}>{receiptId}</Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{dateStr}</Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Payment method</Text>
              <Text style={styles.infoValue}>Card</Text>
            </View>
            {email ? (
              <View style={styles.infoCell}>
                <Text style={styles.infoLabel}>Billed to</Text>
                <Text style={styles.infoValue}>{email}</Text>
              </View>
            ) : null}
          </View>

          {/* Summary table */}
          <Text style={styles.sectionTitle}>Summary</Text>

          <View style={styles.tableRow}>
            <View style={styles.tableLeft}>
              <Text style={styles.tableDesc}>{description}</Text>
              {tokens > 0 ? (
                <Text style={styles.tableSubtext}>
                  {tokens.toLocaleString()} Generation{tokens !== 1 ? "s" : ""}
                </Text>
              ) : null}
            </View>
            <View style={styles.tableRight}>
              <Text style={styles.tableAmount}>{amountStr}</Text>
            </View>
          </View>

          {/* Total */}
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{amountStr}</Text>
            </View>
            <View style={styles.totalPaidRow}>
              <Text style={styles.totalPaidLabel}>Total paid</Text>
              <Text style={styles.totalPaidValue}>{amountStr}</Text>
            </View>
          </View>

          {/* Support note */}
          <Text style={styles.supportNote}>
            {"If you have any questions about this receipt, please contact us at "}
            {company.email}
            {". You're receiving this because you made a purchase on "}
            {company.website}.
          </Text>

        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerCompany}>
              {company.name} · {company.legal} · {company.number}
            </Text>
            <Text style={styles.footerAddress}>{company.address}</Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.footerContact}>
              {company.website}{"\n"}{company.email}
            </Text>
          </View>
        </View>

      </Page>
    </Document>
  );
};

export default Receipt;
