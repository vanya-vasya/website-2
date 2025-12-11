"use client";

import axios from "axios";
import { useState } from "react";
import { Zap } from "lucide-react";
import { toast } from "react-hot-toast";
import { useProModal } from "@/hooks/use-pro-modal";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export const BuyGenerationsButton = () => {
  const proModal = useProModal();
  const t = useTranslations();

  return (
    <Button
    onClick={proModal.onOpen}
    variant="premium"
    style={{fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"}}
  >
    {t("common.buyMore")}
    <Zap className="w-4 h-4 ml-2 fill-white" />
  </Button>
  )
}
