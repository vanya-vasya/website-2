"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { useProModal } from "@/hooks/use-pro-modal";
import { Sparkles } from "lucide-react";

interface UsageProgressProps {
  initialUsedGenerations: number;
  initialAvailableGenerations: number;
}

export function UsageProgress({
  initialUsedGenerations,
  initialAvailableGenerations,
}: UsageProgressProps) {
  const [usedGenerations, setUsedGenerations] = React.useState<number>(
    initialUsedGenerations
  );
  const [availableGenerations, setAvailableGenerations] =
    React.useState<number>(initialAvailableGenerations);

  const usagePercentage = (usedGenerations / availableGenerations) * 100;
  const proModal = useProModal();

  return (
    <div
      className="relative overflow-hidden p-3 cursor-pointer border-0 bg-white/5 backdrop-blur-sm rounded-xl h-full"
      onClick={proModal.onOpen}
    >


      <div className="relative z-20 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-black">
          <div className="flex items-center gap-1.5">
            <div className="relative w-6 h-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 opacity-20 blur-lg"></div>
              <div className="relative bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 p-1.5 rounded-full backdrop-blur-sm">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <span className="font-medium">Credits</span>
          </div>
          <span className="font-bold text-black">
            {usedGenerations}/{availableGenerations}
          </span>
        </div>

        <div className="relative w-full h-2 rounded-full overflow-hidden bg-gray-800/60">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-black">
          <span className="font-medium">{Math.round(usagePercentage) || 0}% Used</span>
          <span className="font-medium">
            Click to upgrade
          </span>
        </div>
      </div>
    </div>
  );
}
