"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Video,
  Palette,
  Music,
  Lightbulb,
  Menu,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UsageProgress } from "@/components/usage-progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useProModal } from "@/hooks/use-pro-modal";
import Image from "next/image";
import { tools } from "@/constants";
import { useTranslations } from "next-intl";

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

export function MobileNav({
  initialUsedGenerations,
  initialAvailableGenerations,
}: {
  initialUsedGenerations: number;
  initialAvailableGenerations: number;
}) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = React.useState(false);
  const [videoToolsOpen, setVideoToolsOpen] = React.useState(false);
  const [artToolsOpen, setArtToolsOpen] = React.useState(false);
  const [musicToolsOpen, setMusicToolsOpen] = React.useState(false);
  const [contentToolsOpen, setContentToolsOpen] = React.useState(false);
  const pathname = usePathname();

  const proModal = useProModal();

  // Helper function to convert kebab-case tool ID to camelCase translation key
  const getToolTranslationKey = (toolId: string): string => {
    const idMap: Record<string, string> = {
      "video-script": "videoScript",
      "video-creation": "videoCreation",
      "digital-painting": "digitalPainting",
      "canvas-expansion": "canvasExpansion",
      "art-reference": "artReference",
      "thumbnail-optimizer": "thumbnailOptimizer",
      "song-lyrics": "lyricWriter",
      "album-cover": "coverArt",
      "music-composition": "composeAssist",
      "sound-effects": "sfxGenerator",
      "blog-ideas": "blogIdeas",
      "social-graphics": "socialGraphics",
      "content-calendar": "contentPlanner",
      "caption-generator": "captionGenerator",
      "chat-assistant": "chatAssistant",
      "image-generation": "imageGeneration",
      "image-restore": "imageRestore",
      "image-background-removal": "imageBackgroundRemoval",
      "image-generative-fill": "imageGenerativeFill",
      "image-object-recolor": "imageObjectRecolor",
      "image-object-remove": "imageObjectRemove",
      "video-generation": "videoGeneration",
      "music-generation": "musicGeneration",
      "speech-generation": "speechGeneration",
      "concept-art": "designPartner",
    };
    return idMap[toolId] || toolId;
  };

  return (
    <div 
      style={{
        fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}
    >
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden h-10 w-10 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-300"
            style={{
              fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
            }}
          >
            <Menu className="h-5 w-5 text-black" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[300px] p-0 bg-white border-r border-gray-200"
          style={{
            fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
          }}
        >
          <SheetHeader className="p-5 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <Image
                src="/logos/nerbixa-logo.png"
                alt="Nerbixa Logo"
                width={150}
                height={50}
              />
            </div>
          </SheetHeader>

        <div className="flex flex-col h-[calc(100vh-4rem)]">
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="w-full mb-4">
                <UsageProgress
                  initialUsedGenerations={initialUsedGenerations}
                  initialAvailableGenerations={initialAvailableGenerations}
                />
              </div>
            </div>

            <Collapsible
              open={videoToolsOpen}
              onOpenChange={setVideoToolsOpen}
              className="border-y border-gray-200"
            >
              <CollapsibleTrigger 
                className="flex w-full items-center justify-between p-4 font-medium text-black hover:bg-gray-50 transition-colors"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}
              >
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-blue-600" />
                  {t("professions.coDirector")}
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform duration-200 text-blue-600",
                    videoToolsOpen && "rotate-90"
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 p-2 bg-gray-50">
                {videoCreatorTools.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm hover:bg-gray-100 transition-colors",
                      pathname === item.href
                        ? "bg-gray-100 text-black"
                        : "text-black"
                    )}
                    style={{
                      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    <div className="h-7 w-7 rounded-md bg-blue-100 flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    {t(`tools.${getToolTranslationKey(item.id)}.label`, { defaultValue: item.label })}
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>

            <Collapsible
              open={artToolsOpen}
              onOpenChange={setArtToolsOpen}
              className="border-b border-gray-200"
            >
              <CollapsibleTrigger 
                className="flex w-full items-center justify-between p-4 font-medium text-black hover:bg-gray-50 transition-colors"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}
              >
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-blue-600" />
                  {t("professions.designPartner")}
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform duration-200 text-blue-600",
                    artToolsOpen && "rotate-90"
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 p-2 bg-gray-50">
                {digitalArtistTools.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm hover:bg-gray-100 transition-colors",
                      pathname === item.href
                        ? "bg-gray-100 text-black"
                        : "text-black"
                    )}
                    style={{
                      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    <div className="h-7 w-7 rounded-md bg-blue-100 flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    {t(`tools.${getToolTranslationKey(item.id)}.label`, { defaultValue: item.label })}
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>

            <Collapsible
              open={musicToolsOpen}
              onOpenChange={setMusicToolsOpen}
              className="border-b border-gray-200"
            >
              <CollapsibleTrigger 
                className="flex w-full items-center justify-between p-4 font-medium text-black hover:bg-gray-50 transition-colors"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}
              >
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-blue-600" />
                  {t("professions.coComposer")}
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform duration-200 text-blue-600",
                    musicToolsOpen && "rotate-90"
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 p-2 bg-gray-50">
                {musicianTools.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm hover:bg-gray-100 transition-colors",
                      pathname === item.href
                        ? "bg-gray-100 text-black"
                        : "text-black"
                    )}
                    style={{
                      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    <div className="h-7 w-7 rounded-md bg-blue-100 flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    {t(`tools.${getToolTranslationKey(item.id)}.label`, { defaultValue: item.label })}
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>

            <Collapsible
              open={contentToolsOpen}
              onOpenChange={setContentToolsOpen}
              className="border-b border-gray-200"
            >
              <CollapsibleTrigger 
                className="flex w-full items-center justify-between p-4 font-medium text-black hover:bg-gray-50 transition-colors"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  {t("professions.creativePartner")}
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform duration-200 text-blue-600",
                    contentToolsOpen && "rotate-90"
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 p-2 bg-gray-50">
                {contentCreatorTools.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm hover:bg-gray-100 transition-colors",
                      pathname === item.href
                        ? "bg-gray-100 text-black"
                        : "text-black"
                    )}
                    style={{
                      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    <div className="h-7 w-7 rounded-md bg-blue-100 flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    {t(`tools.${getToolTranslationKey(item.id)}.label`, { defaultValue: item.label })}
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
            <Link
              href={"https://nerbixa.com/dashboard/billing/payment-history"}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex w-full items-center p-4 font-medium text-black hover:bg-gray-50 transition-colors",
                pathname === "/dashboard/billing/payment-history"
                  ? "bg-gray-100 text-black"
                  : "text-black"
              )}
              style={{
                fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}
            >
              <div className="h-7 w-7 rounded-md flex items-center mr-3">
                <Banknote className="h-4 w-4 text-blue-600" />
              </div>
              {t("dashboardNav.payments")}
            </Link>
          </div>

          {/* <div className="p-4 border-t border-gray-200">
            <div
              className="rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 p-4 cursor-pointer"
              onClick={() => {
                proModal.onOpen();
                setIsOpen(false);
              }}
            >
              <div className="flex items-center gap-2 text-indigo-600 mb-2">
                <Zap className="h-4 w-4" />
                <p className="text-sm font-medium">Creator Pro Plan</p>
              </div>
              <p className="text-xs text-gray-600">
                Unlimited access to all creative tools and priority rendering
              </p>
            </div>
          </div> */}
        </div>
      </SheetContent>
    </Sheet>
    </div>
  );
}
