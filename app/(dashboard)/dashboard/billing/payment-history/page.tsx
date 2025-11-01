import { FeatureContainer } from "@/components/feature-container";
import { contentStyles } from "@/components/ui/feature-styles";
import { fetchPaymentHistory } from "@/lib/api-limit";

const PaymentHistoryPage = async () => {
  const transactions = await fetchPaymentHistory();
  return (
    <div className="bg-white">
      <FeatureContainer
      title="Payments"
      description={`Payment history made easy, all in one place`}
      iconName={"Banknote"}
    >
      <div className={contentStyles.base}>
        {!transactions || transactions.length === 0 ? (
          <h3 className="text-center text-gray-300">
            It&apos;s empty ¯\_(ツ)_/¯
          </h3>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl">
            <div className="mx-auto max-w-7xl">
              <div className=" py-6">
                <div className="whitespace-nowrap">
                  <div className="flow-root">
                    <div className="-my-2 overflow-x-auto">
                      <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                          <thead>
                            <tr>
                              <th
                                scope="col"
                                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-black sm:pl-0"
                              >
                                ID
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-3.5 text-left text-sm font-semibold text-black"
                              >
                                Payment Date
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-3.5 text-left text-sm font-semibold text-black "
                              >
                                Payment Amouint
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-3.5 text-left text-sm font-semibold text-black"
                              >
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {transactions?.map((transaction, index) => (
                              <tr key={index}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-black sm:pl-0">
                                  {transaction.id.slice(-12)}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-black">
                                  {transaction.paid_at
                                    ? new Intl.DateTimeFormat("ru-RU", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }).format(new Date(transaction.paid_at))
                                    : ""}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-black">
                                  {(transaction.amount ?? 0.0) / 100}{" "}
                                  {transaction.currency}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-black">
                                  {transaction.status
                                    ? transaction.status
                                        .charAt(0)
                                        .toUpperCase() +
                                      transaction.status.slice(1)
                                    : ""}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </FeatureContainer>
    </div>
  );
};

export default PaymentHistoryPage;
