import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  className?: string;
}

export function ToolCard({ icon: Icon, title, description, href, className }: ToolCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "group relative overflow-hidden rounded-xl border bg-card p-6 transition-colors hover:bg-accent/50",
          className
        )}
      >
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-heading text-xl font-semibold tracking-tight">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        <motion.div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
          initial={false}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </Link>
  );
} 