import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
  Font,
} from "@react-pdf/renderer";

const colors = {
  background: "#0f172a",
  textColor1: "#ffffff",
  textColor2: "#a1aac0",
  textColor3: "#525f7f",
  textColor4: "#687385",
};

Font.register({
  family: "Nunito",
  src: `./public/assets/fonts/Nunito-Regular.ttf`,
});

const styles = StyleSheet.create({
  page: {
    display: "flex",
    justifyContent: "space-between",
    backgroundColor: colors.background,
    padding: 40,
    fontSize: 12,
    fontFamily: "Nunito",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    padding: 0,
    height: 100,
  },
  headerImage: {
    width: 300,
  },
  titleSection: {
    marginTop: 48,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    color: colors.textColor1,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    paddingTop: 4,
    fontSize: 15,
    color: colors.textColor2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 32,
  },
  infoBlock: {
    width: "30%",
  },
  label: {
    color: colors.textColor1,
    fontWeight: 700,
    fontSize: 10,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  value: {
    paddingTop: 6,
    color: colors.textColor2,
    fontSize: 15,
    lineHeight: 1.4,
  },
  summaryTitle: {
    marginTop: 32,
    fontWeight: 700,
    fontSize: 10,
    color: colors.textColor1,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  block: {
    // backgroundColor: colors.background2,
    // borderWidth: 1,
    // borderColor: colors.textColor2,
    // borderRadius: 8,
    // padding: 12,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    // borderBottom: "1px solid #e6ebf1",
    paddingVertical: 8,
  },
  itemRowFirst: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "1px solid #e6ebf1",
    paddingVertical: 8,
  },

  itemText: {
    color: colors.textColor2,
    fontSize: 15,
  },
  footer: {
    marginTop: 40,
    color: colors.textColor2,
    fontSize: 16,
    lineHeight: 1.5,
  },
  companyInfo: {
    color: colors.textColor2,
    textAlign: "center",
  },
  link: {
    color: "#625afa",
    fontWeight: "bold",
    textDecoration: "none",
  },
  legal: {
    marginTop: 20,
    fontSize: 12,
    color: colors.textColor2,
    lineHeight: 1.4,
  },
});

const company = {
  name: "Nerbixa",
  company: "GUΑRΑΝТЕЕD GRЕΑТ SЕRVIСЕ LТD",
  address: "Dept 6162 43 Owston Road, Carcroft, Doncaster, United Kingdom, DN6 8DA",
  website: "nerbixa.com",
  email: "support@nerbixa.com",
  logo: "./public/logos/nerbixa-logo.png", // Official SVG logo
  companyNumber: "15982295",
};

const Receipt = ({
  receiptId = "8978e5a92857",
  email = "johndoe@gmail.com",
  date = `${Date.now()}`,
  tokens,
  description,
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
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View>
        <View style={styles.header}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={company.logo} style={styles.headerImage} />
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>Receipt from {company.name}</Text>
          <Text style={styles.subtitle}>Receipt #{receiptId}</Text>
        </View>

        <View style={styles.infoRow}>
          <View>
            <Text style={styles.label}>Client Email</Text>
            <Text style={styles.value}>{email}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Amount paid</Text>
            <Text style={styles.value}>
              {(amount / 100).toFixed(2)} {currency}
            </Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Date paid</Text>
            <Text style={styles.value}>{date}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Payment method</Text>
            <Text style={styles.value}>Paid by Card</Text>
          </View>
        </View>

        <Text style={styles.summaryTitle}>Summary</Text>

        <View style={styles.block}>
          <View style={styles.itemRowFirst}>
            <Text style={styles.itemText}>{description}</Text>
            <Text style={styles.itemText}>
              {(amount / 100).toFixed(2)} {currency}
            </Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={[styles.itemText, { fontWeight: "bold" }]}>
              Amount paid
            </Text>
            <Text style={[styles.itemText, { fontWeight: "bold" }]}>
              {(amount / 100).toFixed(2)} {currency}
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          If you have any questions contact us at{" "}
          <Link style={styles.link} src={`mailto:${company.email}`}>
            {company.email}
          </Link>
          .
        </Text>

        <Text style={styles.legal}>
          You&apos;re receiving this email because you made a purchase at{" "}
          {company.name}.
        </Text>
      </View>
      <Text style={styles.companyInfo}>
        <Text>
          {company.name} | {company.company} | {company.companyNumber}
          {"\n"}
          {company.address}
          {"\n"}
          Website:{" "}
          <Link style={styles.link} src={`https://${company.website}`}>
            {company.website}
          </Link>{" "}
          | Email:{" "}
          <Link style={styles.link} src={`mailto:${company.email}`}>
            {company.email}
          </Link>
        </Text>
      </Text>
    </Page>
  </Document>
);

export default Receipt;
