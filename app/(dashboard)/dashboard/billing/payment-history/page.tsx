import { FeatureContainer } from "@/components/feature-container";
import { contentStyles } from "@/components/ui/feature-styles";
import { fetchPaymentHistory } from "@/lib/api-limit";
import { getTranslations } from "next-intl/server";
import { PaymentHistoryTable } from "./payment-history-table";

const PaymentHistoryPage = async () => {
  const transactions = await fetchPaymentHistory();
  const t = await getTranslations("payments");

  return (
    <div className="bg-white">
      <FeatureContainer
      title={t("title")}
      description={t("description")}
      iconName={"Banknote"}
    >
      <div className={contentStyles.base}>
        <PaymentHistoryTable transactions={transactions} />
      </div>
    </FeatureContainer>
    </div>
  );
};

export default PaymentHistoryPage;
