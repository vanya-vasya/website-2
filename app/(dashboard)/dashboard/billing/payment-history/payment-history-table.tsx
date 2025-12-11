"use client";

import { useTranslations } from "next-intl";
import { Transaction } from "@/lib/api-limit";
import { formatDate, formatCurrency } from "@/lib/format";
import { Locale } from "@/lib/i18n";
import { useEffect, useState } from "react";

interface PaymentHistoryTableProps {
  transactions: Transaction[] | null;
}

export const PaymentHistoryTable = ({ transactions }: PaymentHistoryTableProps) => {
  const t = useTranslations("payments");
  const [currentLocale, setCurrentLocale] = useState<Locale>("en");

  useEffect(() => {
    // Get current locale from cookie
    const localeCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("NEXT_LOCALE="))
      ?.split("=")[1] as Locale | undefined;
    
    if (localeCookie && (localeCookie === "en" || localeCookie === "tr")) {
      setCurrentLocale(localeCookie);
    }
  }, []);

  if (!transactions || transactions.length === 0) {
    return (
      <h3 className="text-center text-gray-300">
        {t("empty")}
      </h3>
    );
  }

  return (
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
                          {t("id")}
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-black"
                        >
                          {t("paymentDate")}
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-black "
                        >
                          {t("paymentAmount")}
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-black"
                        >
                          {t("status")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {transactions.map((transaction, index) => (
                        <tr key={index}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-black sm:pl-0">
                            {transaction.id.slice(-12)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-black">
                            {transaction.paid_at
                              ? formatDate(new Date(transaction.paid_at), currentLocale)
                              : ""}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-black">
                            {transaction.amount
                              ? formatCurrency(
                                  (transaction.amount ?? 0.0) / 100,
                                  currentLocale,
                                  transaction.currency || undefined
                                )
                              : `${(transaction.amount ?? 0.0) / 100} ${transaction.currency}`}
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
  );
};
