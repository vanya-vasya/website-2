import { Zap } from "lucide-react";
import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useProModal } from "@/hooks/use-pro-modal";

export const FreeCounter = ({
  apiUsedGenerations = 0,
  apiAvailableGenerations = 0,
}: {
  apiUsedGenerations: number;
  apiAvailableGenerations: number;
}) => {
  const [mounted, setMounted] = useState(false);
  const proModal = useProModal();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="px-3">
      <Card className="bg-white/10 border-0">
        <CardContent className="py-6">
          <div className="text-center text-sm text-white mb-4 space-y-2">
            <Progress
              className="h-3"
              value={(apiUsedGenerations / apiAvailableGenerations) * 100}
            />
          </div>
          <Button
            onClick={proModal.onOpen}
            variant="premium"
            className="w-full"
            style={{fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"}}
          >
            Buy More
            <Zap className="w-4 h-4 ml-2 fill-white" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
