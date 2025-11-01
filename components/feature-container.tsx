"use client";

import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureContainerProps {
  children: React.ReactNode;
  title: string;
  description: string;
  iconName: keyof typeof LucideIcons;
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
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 opacity-20 blur-lg"></div>
            <div className="relative bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 p-3 rounded-full backdrop-blur-sm">
              <IconComponent className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 inline">
            {title}
            </span>
          </h1>
        </div>
        <p className="text-center text-muted-foreground max-w-[700px] mx-auto whitespace-pre-line">
          {description}
        </p>
      </div>

      <motion.div variants={item} className="px-4">
        {children}
      </motion.div>
    </motion.div>
  );
} 