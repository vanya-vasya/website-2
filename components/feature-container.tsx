"use client";

import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureContainerProps {
  children: React.ReactNode;
  title: string;
  description: string;
  iconName: keyof typeof LucideIcons;
  iconColor?: string;
  bgColor?: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function FeatureContainer({
  children,
  title,
  description,
  iconName,
  iconColor = "text-primary",
  bgColor = "bg-primary/10",
}: FeatureContainerProps) {
  const IconComponent = LucideIcons[iconName] as React.ComponentType<{ className?: string }>;
  
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4 justify-center">
          <div className={cn("p-2.5 rounded-lg", bgColor)}>
            <IconComponent className={cn("w-6 h-6", iconColor)} />
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 inline">
            {title}
            </span>
          </h1>
        </div>
        <p className="text-center text-muted-foreground max-w-[500px] mx-auto">
          {description}
        </p>
      </div>

      <motion.div variants={item} className="px-4">
        {children}
      </motion.div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-2 text-xs text-muted-foreground">
            Powered by advanced AI models
          </span>
        </div>
      </div>
    </motion.div>
  );
} 