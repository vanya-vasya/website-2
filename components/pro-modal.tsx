"use client";

import { useEffect, useState } from "react";
import { Check, Zap } from "lucide-react";
import { toast } from "react-hot-toast";
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
import {
  Checkbox,
  Field,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";

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

export const ProModal = () => {
  const router = useRouter();
  const { userId } = useAuth();
  const { user } = useUser();
  const proModal = useProModal();
  const [loading, setLoading] = useState(false);
  const [generationPrice, setGenerationPrice] = useState(GENERATIONS_PRICE);
  const [generationsCount, setGenerationsCount] = useState(50);
  const [activeButton, setActiveButton] = useState(50);

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
      submitPayment();
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
    setValue("generations", value); // Обновляем значение в форме
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value) && value > 0) {
      setValue("generations", value); // Обновляем значение в форме
    } else {
      setValue("generations", 1); // Установите значение по умолчанию, если значение некорректно
    }
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    setActiveButton(999);
    if ((e.target as HTMLInputElement).value) {
      const value = Number((e.target as HTMLInputElement).value);
      if (!isNaN(value)) {
        setValue("generations", value); // Обновляем значение в форме
      }
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setValue("policies", checked); // Обновляем значение в форме
  };

  useEffect(() => {
    const loadScript = () => {
      const script = document.createElement("script");
      script.src = "https://js.networxpay.com/widget/be_gateway.js";
      script.async = true;
      document.body.appendChild(script);
    };

    loadScript();
  }, []);

  const submitPayment = () => {
    proModal.onClose();
    const params = {
      checkout_url: "https://checkout.networxpay.com",
      checkout: {
        iframe: true,
        test: false,
        transaction_type: "payment",
        public_key: process.env.NEXT_PUBLIC_SHOP_PUBLIC_KEY,
        order: {
          amount: watch("generations") * 5,
          currency: "EUR",
          description: `Neuvisia Top Up (${watch("generations")} Tokens)`,
          tracking_id: userId,
        },
        customer: {
          email: user?.emailAddresses[0].emailAddress || "",
        },
        settings: {
          notification_url: "https://www.neuvisia.com/api/webhooks/payment",
        },
      },

      closeWidget: function (status: any) {
        if (status === "successful") {
          router.refresh();
          toast.success("Generations added successfully");
        }
      },
    };

    if (window.BeGateway) {
      new window.BeGateway(params).createWidget();
    } else {
      console.error("BeGateway script is not loaded");
    }
  };

  return (
    <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
      <DialogContent className="bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="flex justify-center items-center flex-col gap-y-4 pb-2 bg-slate-900">
            <div className="flex items-center gap-x-2 font-bold text-xl text-white bg-slate-900">
              Buy More Generations
              {/* <Badge variant="default" className="uppercase text-sm py-1">
                pro
              </Badge> */}
            </div>
          </DialogTitle>
          <DialogDescription className="text-center pt-2 space-y-2 text-white font-medium">
            {toolsModal.map((tool) => (
              <Card
                key={tool.href}
                className="p-3 border-black/5 flex items-center justify-between bg-slate-800 text-white"
              >
                <div className="flex items-center gap-x-4">
                  <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                    <tool.icon className={cn("w-6 h-6", tool.color)} />
                  </div>
                  <div className="font-semibold text-sm">{tool.label}</div>
                </div>
                <Check className="text-primary w-5 h-5" />
              </Card>
            ))}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="w-full items-center gap-1.5">
            <div className="grid grid-cols-2">
              <p className="text-sm font-medium leading-sm text-white">Price</p>
              <div className="flex gap-2 justify-end">
                <p className="text-sm font-medium leading-sm text-end text-white">
                  {(watch("generations") * generationPrice).toFixed(2)}
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
                      bg-slate-800 text-white
                      ${
                        watch("currency")
                          ? "border-pink-600"
                          : "border-slate-800"
                      }
                      outline-none ring-0 focus:outline-none focus:ring-0 active:ring-0
                      hover:outline-none hover:ring-0 hover:border-slate-800 hover:bg-slate-800
                      focus:border-slate-800 active:border-slate-800
                      transition-none appearance-none shadow-none`}
                    >
                      {watch("currency")}
                    </ListboxButton>
                    <ListboxOptions className="absolute left-0 z-10 mt-1 grid w-full origin-top-right gap-0.5 rounded-md sm:rounded-lg border border-slate-800 bg-slate-800 p-1 shadow-large outline-none dark:border-gray-700 dark:bg-light-dark">
                      {currencies.map((currency, idx) => (
                        <ListboxOption
                          key={idx}
                          className={({ active }) =>
                            `flex cursor-pointer items-center justify-center rounded-md text-sm transition
                            bg-slate-800 text-white
                            ${
                              active
                                ? "border border-pink-600 font-medium"
                                : "border border-transparent hover:border-gray-300"
                            }
                            dark:text-gray-400`
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
            <div className="grid grid-cols-2 pb-2 text-white">
              <p className="text-sm font-medium leading-sm">Generations</p>
              <p className="text-sm font-medium leading-sm text-end">
                {watch("generations")} Generations
              </p>
            </div>
            <Label htmlFor="generations" className="text-white">
              Choose generations option
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
                    "!bg-slate-800 !text-white !border !border-slate-800",
                    "!hover:bg-slate-800 !hover:text-white !hover:border-slate-800",
                    "!focus:bg-slate-800 !focus:text-white !focus:border-slate-800",
                    "!active:bg-slate-800 !active:text-white !active:border-slate-800",
                    "focus:outline-none ring-0 focus:ring-0 active:ring-0 transition-none shadow-none appearance-none",
                    {
                      "!border-pink-600 !text-pink-600 bg-accent":
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
                  "!bg-slate-800 !text-white !border !border-slate-800",
                  "!hover:bg-slate-800 !hover:text-white !hover:border-slate-800",
                  "!focus:bg-slate-800 !focus:text-white !focus:border-slate-800",
                  "!active:bg-slate-800 !active:text-white !active:border-slate-800",
                  "focus:outline-none ring-0 focus:ring-0 active:ring-0 transition-none shadow-none appearance-none",
                  {
                    "!border-pink-600 !text-pink-600 bg-accent":
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
                className="group block w-[1rem] h-[1rem] rounded border border-slate-800 bg-slate-800 data-[checked]:bg-primary"
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
                className={"text-sm leading-loose tracking-tight text-white"}
              >
                I agree to the{" "}
                <a
                  href="/terms-and-conditions"
                  className=" hover:text-primary hover:underline hover:underline-offset-4 "
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy-policy"
                  className=" hover:text-primary hover:underline hover:underline-offset-4 "
                >
                  Privacy Policy
                </a>
                .
              </Label>
            </Field>
            {errors.policies && (
              <p className="text-red-600 text-sm">{errors.policies.message}</p>
            )}
          </div>
          <DialogFooter className="mt-3">
            <Button
              disabled={loading}
              size="lg"
              variant="premium"
              type="submit"
              className="w-full"
            >
              Buy Generations
              <Zap className="w-4 h-4 ml-2 fill-white" />
            </Button>
          </DialogFooter>
        </form>
        <Image
          alt="cards logo"
          className="w-48 m-auto mt-1"
          src={CardLogo.src}
          width={CardLogo.width}
          height={CardLogo.height}
        />
        <Label className="text-center font-normal text-xs text-white/30">
          GROWTHPIXEL LTD - 128 City Road, <br />
          London, United Kingdom, EC1V 2NX
        </Label>
      </DialogContent>
    </Dialog>
  );
};
