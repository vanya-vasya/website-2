"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import classNames from "classnames";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useProModal } from "@/hooks/use-pro-modal";
import { GENERATIONS_PRICE, toolsModal } from "@/constants";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { currencies, currenciesRate, Currency } from "@/constants/index";
import Image from "next/image";
import CardLogo from "@/public/card-logo.png";
import { z } from "zod";
import { useAuth, useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NetworkPaymentWidget } from "@/components/secure-processor-payment-widget";
import {
  Checkbox,
  Field,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { useTranslations } from "next-intl";

const formSchema = z.object({
  generations: z
    .number()
    .positive({ message: "Generations count must be positive" })
    .min(1, { message: "At least one generation is required" }),
  currency: z.enum(currencies),
  policies: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

/**
 * Currency routing logic:
 * - USD → payment processed in USD
 * - All other currencies → payment processed in EUR
 */
const getPaymentCurrency = (selectedCurrency: Currency): "USD" | "EUR" => {
  return selectedCurrency === "USD" ? "USD" : "EUR";
};

/**
 * Get the payment amount in the routed currency
 * - USD: convert display amount to USD
 * - Others: convert display amount to EUR
 */
const getPaymentAmount = (displayAmount: number, selectedCurrency: Currency): number => {
  const paymentCurrency = getPaymentCurrency(selectedCurrency);
  
  if (selectedCurrency === paymentCurrency) {
    // No conversion needed (USD → USD or EUR → EUR)
    return displayAmount;
  }
  
  // Convert from selected currency to EUR (base) then to payment currency
  const amountInEUR = displayAmount / currenciesRate[selectedCurrency];
  
  if (paymentCurrency === "EUR") {
    return amountInEUR;
  }
  
  // Convert EUR to USD
  return amountInEUR * currenciesRate["USD"];
};

export const ProModal = () => {
  const router = useRouter();
  const { userId } = useAuth();
  const { user } = useUser();
  const proModal = useProModal();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [generationPrice, setGenerationPrice] = useState(GENERATIONS_PRICE);
  const [generationsCount, setGenerationsCount] = useState(50);
  const [activeButton, setActiveButton] = useState(50);
  const [showPaymentWidget, setShowPaymentWidget] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      generations: 50,
      currency: "EUR",
      policies: false,
    },
  });

  const onSubmit = async () => {
    try {
      setLoading(true);
      // Show payment widget
      setShowPaymentWidget(true);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = (currency: Currency) => {
    setValue("currency", currency);
    setGenerationPrice(GENERATIONS_PRICE * currenciesRate[currency]);
  };

  const handleButtonClick = (value: number) => {
    setActiveButton(value);
    setValue("generations", value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value) && value > 0) {
      setValue("generations", value);
    } else {
      setValue("generations", 1);
    }
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    setActiveButton(999);
    if ((e.target as HTMLInputElement).value) {
      const value = Number((e.target as HTMLInputElement).value);
      if (!isNaN(value)) {
        setValue("generations", value);
      }
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setValue("policies", checked);
  };

  // Payment widget handlers
  const handlePaymentSuccess = (transactionData: any) => {
    console.log('Payment successful:', transactionData);
    proModal.onClose();
    setShowPaymentWidget(false);
    router.refresh();
    toast.success(t("common.paymentSuccess"));
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    setShowPaymentWidget(false);
    toast.error("Payment failed. Please try again.");
  };

  const handlePaymentCancel = () => {
    console.log('Payment canceled');
    setShowPaymentWidget(false);
    toast("Payment was canceled");
  };

  const handleBackToForm = () => {
    setShowPaymentWidget(false);
  };

  const handleModalClose = () => {
    setShowPaymentWidget(false);
    proModal.onClose();
  };

  // Calculate payment values
  const selectedCurrency = watch("currency");
  const displayAmount = watch("generations") * generationPrice;
  const paymentCurrency = getPaymentCurrency(selectedCurrency);
  const paymentAmount = getPaymentAmount(displayAmount, selectedCurrency);

  return (
    <Dialog open={proModal.isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="bg-white border-gray-200" style={{fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"}}>
        <DialogHeader>
          <DialogTitle className="flex justify-center items-center flex-col gap-y-4 pb-2 bg-white">
            <div className="flex items-center gap-x-2 font-bold text-xl text-gray-900 bg-white">
              {showPaymentWidget ? t("common.completePayment") : t("common.buyMore")}
            </div>
          </DialogTitle>
          {!showPaymentWidget && (
            <DialogDescription className="text-center pt-2 text-gray-700 font-medium">
              <div className="grid grid-cols-2 gap-3">
                {toolsModal.map((tool) => (
                  <Card
                    key={tool.href}
                    className="p-4 border-gray-200 flex flex-col items-center justify-center bg-white text-gray-900 hover:shadow-md transition-shadow"
                  >
                    <div className="p-3 w-fit rounded-lg bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 mb-3">
                      <tool.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="font-semibold text-sm text-center">
                      {tool.label === "Co-Director" ? t("professions.coDirector") :
                       tool.label === "Design Partner" ? t("professions.designPartner") :
                       tool.label === "Co-Composer" ? t("professions.coComposer") :
                       tool.label === "Creative Partner" ? t("professions.creativePartner") :
                       tool.label}
                    </div>
                  </Card>
                ))}
              </div>
            </DialogDescription>
          )}
        </DialogHeader>
        
        {showPaymentWidget ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                onClick={handleBackToForm}
                variant="outline"
                size="sm"
                className="text-black border-gray-300 hover:bg-gray-50"
              >
                {t("common.backToSelection")}
              </Button>
              <div className="text-black text-sm">
                {watch("generations")} {t("common.generations")} - {paymentAmount.toFixed(2)} {paymentCurrency}
              </div>
            </div>
            
            <NetworkPaymentWidget
              amount={paymentAmount}
              currency={paymentCurrency}
              orderId={`gen_${userId}_${Date.now()}`}
              description={`Nerbixa Generations Purchase (${watch("generations")} Tokens)`}
              customerEmail={user?.emailAddresses[0].emailAddress || ""}
              userId={userId || ""}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handlePaymentCancel}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
          <div className="w-full items-center gap-1.5">
            <div className="grid grid-cols-2">
              <p className="text-sm font-medium leading-sm text-black">Price</p>
              <div className="flex gap-2 justify-end">
                <p className="text-sm font-medium leading-sm text-end text-black">
                  {displayAmount.toFixed(2)}
                </p>
                <Listbox
                  {...register("currency")}
                  value={watch("currency")}
                  onChange={handleCurrencyChange}
                  disabled={loading}
                >
                  <div className="relative">
                    <ListboxButton
                      className={`w-[60px] h-[24px] text-center rounded-md sm:rounded-lg
                      border text-sm font-medium flex items-center justify-center
                      bg-white text-black
                      ${
                        watch("currency")
                          ? "border-cyan-500"
                          : "border-gray-300"
                      }
                      outline-none ring-0 focus:outline-none focus:ring-0 active:ring-0
                      hover:outline-none hover:ring-0 hover:border-gray-400 hover:bg-gray-50
                      focus:border-gray-400 active:border-gray-400
                      transition-all duration-200 appearance-none shadow-sm`}
                    >
                      {watch("currency")}
                    </ListboxButton>
                    <ListboxOptions className="absolute left-0 z-10 mt-1 grid w-full origin-top-right gap-0.5 rounded-md sm:rounded-lg border border-gray-300 bg-white p-1 shadow-lg outline-none">
                      {currencies.map((currency, idx) => (
                        <ListboxOption
                          key={idx}
                          className={({ active }) =>
                            `flex cursor-pointer items-center justify-center rounded-md text-sm transition
                            bg-white text-black
                            ${
                              active
                                ? "bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white font-medium"
                                : "border border-transparent hover:bg-gray-50"
                            }`
                          }
                          value={currency}
                        >
                          {currency}
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </div>
                </Listbox>
              </div>
            </div>
            <div className="grid grid-cols-2 pb-2 text-black">
              <p className="text-sm font-medium leading-sm">{t("common.generations")}</p>
              <p className="text-sm font-medium leading-sm text-end">
                {watch("generations")} {t("common.generations")}
              </p>
            </div>
            <Label htmlFor="generations" className="text-black">
              {t("common.chooseOption")}
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full pt-2">
              {[50, 100, 500].map((value) => (
                <Button
                  key={value}
                  type="button"
                  disabled={loading}
                  onClick={() => handleButtonClick(value)}
                  variant="ghost"
                  className={classNames(
                    "!bg-white !text-gray-700 !border !border-gray-300",
                    "!hover:bg-gray-50 !hover:text-gray-900 !hover:border-gray-400",
                    "!focus:bg-gray-50 !focus:text-gray-900 !focus:border-gray-400",
                    "!active:bg-gray-50 !active:text-gray-900 !active:border-gray-400",
                    "focus:outline-none ring-0 focus:ring-0 active:ring-0 transition-all duration-300 shadow-sm",
                    {
                      "!bg-gradient-to-r !from-cyan-400 !via-blue-500 !to-indigo-600 !text-white !border-transparent !shadow-lg":
                        activeButton === value,
                    }
                  )}
                >
                  {value}
                </Button>
              ))}
              <Input
                disabled={loading}
                type="number"
                id="generations"
                placeholder="Other"
                {...register("generations", { valueAsNumber: true })}
                onClick={handleInputClick}
                onChange={handleInputChange}
                min={1}
                className={classNames(
                  "text-center pl-6 py-2 text-sm font-medium",
                  "!bg-white !text-gray-700 !border !border-gray-300",
                  "!hover:bg-gray-50 !hover:text-gray-900 !hover:border-gray-400",
                  "!focus:bg-gray-50 !focus:text-gray-900 !focus:border-gray-400",
                  "!active:bg-gray-50 !active:text-gray-900 !active:border-gray-400",
                  "focus:outline-none ring-0 focus:ring-0 active:ring-0 transition-all duration-300 shadow-sm",
                  {
                    "!bg-gradient-to-r !from-cyan-400 !via-blue-500 !to-indigo-600 !text-white !border-transparent !shadow-lg":
                      activeButton === 999,
                  }
                )}
              />
            </div>
            {errors.generations && (
              <p className="text-red-600 text-sm pt-1">
                {errors.generations.message}
              </p>
            )}
          </div>
          <div className="mt-3">
            <Field className="flex items-center gap-2">
              <Checkbox
                {...register("policies")}
                checked={watch("policies")}
                onChange={handleCheckboxChange}
                className="group block w-[1rem] h-[1rem] rounded border border-gray-300 bg-white data-[checked]:bg-gradient-to-r data-[checked]:from-cyan-400 data-[checked]:via-blue-500 data-[checked]:to-indigo-600"
              >
                <svg
                  className="stroke-white opacity-0 group-data-[checked]:opacity-100"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Checkbox>
              <Label
                className={"text-sm leading-loose tracking-tight text-gray-700"}
              >
                {t("common.iAgree")}{" "}
                <a
                  href="/terms-and-conditions"
                  className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent hover:underline hover:underline-offset-4"
                >
                  {t("common.termsOfService")}
                </a>{" "}
                {t("common.and")}{" "}
                <a
                  href="/privacy-policy"
                  className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent hover:underline hover:underline-offset-4"
                >
                  {t("common.privacyPolicy")}
                </a>
                .
              </Label>
            </Field>
            {errors.policies && (
              <p className="text-red-600 text-sm">{errors.policies.message}</p>
            )}
          </div>
          <DialogFooter className="mt-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button
                disabled={loading}
                size="lg"
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-500 hover:via-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {t("common.buyGenerations")}
                <Zap className="w-4 h-4 ml-2 fill-white" />
              </Button>
            </motion.div>
          </DialogFooter>
        </form>
        )}
        
        {!showPaymentWidget && (
          <>
            <Image
              alt="cards logo"
              className="w-48 m-auto mt-1"
              src={CardLogo.src}
              width={CardLogo.width}
              height={CardLogo.height}
            />
            <Label className="text-center font-normal text-xs text-black">
            GUΑRΑΝТЕЕD GRЕΑТ SЕRVIСЕ LТD - Dept 6162 43 Owston Road, Carcroft, Doncaster, United Kingdom, DN6 8DA
            </Label>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
