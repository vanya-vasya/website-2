"use client";

import { cn } from "@/lib/utils";
import { Nunito } from "next/font/google";

import Footer from "@/components/landing/footer";
import Header from "@/components/landing/header";

const nunito = Nunito({
  subsets: ["latin"], // Указываем подмножество латиницы
  weight: ["400"], // Указываем допустимые веса
  display: "swap", // Для улучшенной загрузки шрифта
});
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <main
        className={cn(
          "bg-[#0f172a] text-[#A1AAC9] overflow-x-hidden h-full flex flex-col justify-between",
          nunito.className
        )}
      >
        <Header />
        <div className="flex items-center justify-center pt-[50px] relative">
          <div className="z-10">{children}</div>
          <div className="feature-one__main-content-box z-0 absolute">
            <div className="feature-one__color-overly-1 flaot-bob-y top-[-150px]"></div>
            <div className="feature-one__color-overly-2 flaot-bob-x top-[-250px]"></div>
            <div className="feature-one__color-overly-3 img-bounce top-[-200px]"></div>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
};

export default AuthLayout;
