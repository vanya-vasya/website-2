"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar";

export const MobileSidebar = ({
  apiAvailableGenerations = 0,
  apiUsedGenerations = 0,
}: {
  apiAvailableGenerations: number;
  apiUsedGenerations: number;
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger>
        <Menu className="md:hidden text-[#a1aac9]" />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 border-r-0">
        <Sidebar
          apiAvailableGenerations={apiAvailableGenerations}
          apiUsedGenerations={apiUsedGenerations}
        />
      </SheetContent>
    </Sheet>
  );
};
