"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  MessageSquare,
  Music,
  FileAudio,
  FileVideo2,
  FileImage,
  Wand2,
  ImageMinus,
  Scissors,
  PaintBucket,
  ArchiveRestore,
  Layers,
  Sparkles,
  ChevronDown,
  BrushIcon,
  Mic,
  Coins,
  Banknote,
} from "lucide-react";
import Image from "next/image";
import { UsageProgress } from "./usage-progress";
import { tools } from "@/constants";

// Инструменты для видео-креаторов
const videoCreatorTools = tools.filter((tool) =>
  tool.professions.includes("video")
);

// Инструменты для цифровых художников
const digitalArtistTools = tools.filter((tool) =>
  tool.professions.includes("art")
);

// Инструменты для музыкантов
const musicianTools = tools.filter((tool) =>
  tool.professions.includes("music")
);

// Инструменты для контент-креаторов
const contentCreatorTools = tools.filter((tool) =>
  tool.professions.includes("content")
);

// Общие инструменты
const commonTools = tools.filter((tool) => tool.professions.includes("all"));

export function MainNav({
  initialUsedGenerations,
  initialAvailableGenerations,
}: {
  initialUsedGenerations: number;
  initialAvailableGenerations: number;
}) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-8">
        <Link
          href="/dashboard"
          className="hidden items-center space-x-2 md:flex"
        >
          <Image src="/logo.png" alt="Neuvisia Logo" width={150} height={50} />
        </Link>

        <NavigationMenu>
          <NavigationMenuList className="space-x-1">
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent hover:bg-violet-900/40 focus:bg-violet-900/40 data-[state=open]:bg-violet-900/40 text-white hover:text-violet-200">
                <FileVideo2 className="mr-2 h-4 w-4 text-violet-400" />
                Video Creators
              </NavigationMenuTrigger>
              <NavigationMenuContent className="bg-gray-900/90 backdrop-blur-xl border border-violet-500/20 rounded-xl overflow-hidden">
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {videoCreatorTools.map((item) => (
                    <ListItem
                      key={item.id}
                      id={item.id}
                      title={item.label}
                      href={item.href}
                      icon={item.icon}
                      color="text-violet-300"
                      bgColor="bg-violet-500/20"
                    >
                      {item.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent hover:bg-pink-900/40 focus:bg-pink-900/40 data-[state=open]:bg-pink-900/40 text-white hover:text-pink-200">
                <BrushIcon className="mr-2 h-4 w-4 text-pink-400" />
                Digital Artists
              </NavigationMenuTrigger>
              <NavigationMenuContent className="bg-gray-900/90 backdrop-blur-xl border border-pink-500/20 rounded-xl overflow-hidden">
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {digitalArtistTools.map((item) => (
                    <ListItem
                      key={item.id}
                      id={item.id}
                      title={item.label}
                      href={item.href}
                      icon={item.icon}
                      color="text-pink-300"
                      bgColor="bg-pink-500/20"
                    >
                      {item.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent hover:bg-blue-900/40 focus:bg-blue-900/40 data-[state=open]:bg-blue-900/40 text-white hover:text-blue-200">
                <FileAudio className="mr-2 h-4 w-4 text-blue-400" />
                Musicians
              </NavigationMenuTrigger>
              <NavigationMenuContent className="bg-gray-900/90 backdrop-blur-xl border border-blue-500/20 rounded-xl overflow-hidden">
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {musicianTools.map((item) => (
                    <ListItem
                      key={item.id}
                      id={item.id}
                      title={item.label}
                      href={item.href}
                      icon={item.icon}
                      color="text-blue-300"
                      bgColor="bg-blue-500/20"
                    >
                      {item.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent hover:bg-emerald-900/40 focus:bg-emerald-900/40 data-[state=open]:bg-emerald-900/40 text-white hover:text-emerald-200">
                <PaintBucket className="mr-2 h-4 w-4 text-emerald-400" />
                Content Creators
              </NavigationMenuTrigger>
              <NavigationMenuContent className="bg-gray-900/90 backdrop-blur-xl border border-emerald-500/20 rounded-xl overflow-hidden">
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {contentCreatorTools.map((item) => (
                    <ListItem
                      key={item.id}
                      id={item.id}
                      title={item.label}
                      href={item.href}
                      icon={item.icon}
                      color="text-emerald-300"
                      bgColor="bg-emerald-500/20"
                    >
                      {item.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href={"/dashboard/billing/payment-history"}>
                <div className="cursor-pointer group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 group bg-transparent hover:bg-amber-900/40 focus:bg-amber-900/40 data-[state=open]:bg-amber-900/40 text-white hover:text-amber-200">
                  <Banknote className="mr-2 h-4 w-4 text-amber-400" />
                  Payment History
                </div>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    icon: any;
    color?: string;
    bgColor?: string;
    id?: string;
  }
>(
  (
    {
      className,
      title,
      children,
      icon: Icon,
      color = "text-indigo-300",
      bgColor = "bg-indigo-500/20",
      id,
      href,
      ...props
    },
    ref
  ) => {
    // Use the ID directly as the toolId when available
    const toolId = id;

    // Construct the complete href with toolId parameter
    let fullHref = href || "";

    // Only add the toolId if it exists and the URL doesn't already have a toolId parameter
    if (toolId && href && !href.includes("?toolId=")) {
      // If the URL already has parameters, add toolId with &, otherwise with ?
      fullHref = href.includes("?")
        ? `${href}&toolId=${toolId}`
        : `${href}?toolId=${toolId}`;
    }

    return (
      <li>
        <NavigationMenuLink asChild>
          <Link
            ref={ref}
            href={fullHref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors text-white hover:bg-slate-800/50 hover:text-slate-50 focus:bg-slate-800/50 focus:text-slate-50",
              className
            )}
            {...props}
          >
            <div className="flex items-center gap-4 mb-2">
              <div className={cn("p-1.5 rounded-lg", bgColor)}>
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <div className="text-sm font-medium leading-none">{title}</div>
            </div>
            <p className="line-clamp-2 text-sm leading-snug text-white/70">
              {children}
            </p>
          </Link>
        </NavigationMenuLink>
      </li>
    );
  }
);
ListItem.displayName = "ListItem";
