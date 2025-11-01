import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface HeadingProps {
  title: string;
  description: string;
  generationPrice?: number;
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
}

export const Heading = ({
  title,
  description,
  generationPrice,
  icon: Icon,
  iconColor,
  bgColor,
}: HeadingProps) => {
  return (
    <div className="sm:flex justify-between mb-4 sm:mb-8">
      <div className="flex gap-x-3 items-center">
        <div className={cn("p-2 w-fit rounded-md", bgColor)}>
          <Icon className={cn("w-10 h-10", iconColor)} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {generationPrice && (
        <div className="mt-4 sm:mt-0 flex items-center text-white-300/10">
          <p className="text-lg font-medium text-muted-foreground">
            <b>Price:</b> {generationPrice} Generations
          </p>
        </div>
      )}
    </div>
  );
};
