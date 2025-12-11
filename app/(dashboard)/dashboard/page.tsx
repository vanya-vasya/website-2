"use client";

import {
  Sparkles,
  Zap,
  VideoIcon,
  PenTool,
  Music,
  Paintbrush,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { tools, professions, Profession } from "@/constants";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};



export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeFilters, setActiveFilters] = useState<Profession[]>([]);
  const [filteredTools, setFilteredTools] = useState(tools);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const t = useTranslations();

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

  // Handle payment success and NetworkX redirect notifications
  useEffect(() => {
    // Check for multiple payment success parameters
    const paymentStatus = searchParams.get('payment');
    const paymentSuccess = searchParams.get('payment_success');
    const status = searchParams.get('status');
    const orderId = searchParams.get('order_id');
    const token = searchParams.get('token');
    const uid = searchParams.get('uid');
    
    console.log('═════════════════════════════════════════════════════════');
    console.log('📍 Dashboard Page Loaded');
    console.log('Current URL:', window.location.href);
    console.log('Query Parameters:', {
      payment: paymentStatus,
      payment_success: paymentSuccess,
      status: status,
      order_id: orderId,
      token: token,
      uid: uid
    });
    console.log('═════════════════════════════════════════════════════════');
    
    // Handle NetworkX direct redirect with status=successful
    if (status === 'successful' && token && uid) {
      console.log('✅ SUCCESS: NetworkX payment redirect detected!');
      console.log('   - Status:', status);
      console.log('   - Token:', token);
      console.log('   - UID:', uid);
      console.log('   - Showing success notification...');
      
      toast.success(t("dashboard.paymentSuccess"), {
        duration: 5000,
        icon: '🎉',
      });
      
      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('status');
      url.searchParams.delete('token');
      url.searchParams.delete('uid');
      url.searchParams.delete('order_id');
      window.history.replaceState({}, '', url.pathname);
      
      console.log('✅ URL cleaned successfully');
    }
    // Handle payment success from success page
    else if (paymentStatus === 'success' || paymentSuccess === 'true') {
      console.log('✅ SUCCESS: Payment success detected from redirect!');
      console.log('   - Payment Status:', paymentStatus || paymentSuccess);
      console.log('   - Order ID:', orderId);
      console.log('   - Showing success notification...');
      
      toast.success(t("dashboard.paymentSuccess"), {
        duration: 5000,
        icon: '🎉',
      });
      
      // Clean up URL parameters without reloading
      const url = new URL(window.location.href);
      const originalUrl = url.toString();
      
      url.searchParams.delete('payment');
      url.searchParams.delete('payment_success');
      url.searchParams.delete('order_id');
      url.searchParams.delete('token');
      url.searchParams.delete('status');
      url.searchParams.delete('uid');
      
      const cleanedUrl = url.pathname;
      
      console.log('🧹 Cleaning up URL...');
      console.log('   - Original:', originalUrl);
      console.log('   - Cleaned:', cleanedUrl);
      
      window.history.replaceState({}, '', cleanedUrl);
      
      console.log('✅ URL cleaned successfully');
    } else if (paymentStatus && paymentStatus !== 'success') {
      console.log('⚠️  WARNING: Non-success payment status detected:', paymentStatus);
      console.log('   - This should NOT show success notification');
      console.log('   - Order ID:', orderId);
    } else if (!paymentStatus && !status) {
      console.log('ℹ️  INFO: No payment status in URL (normal page load)');
    }
  }, [searchParams, t]);

  useEffect(() => {
    if (activeFilters.length === 0) {
      // Когда фильтры не выбраны, показываем все профессиональные инструменты, исключая базовые
      setFilteredTools(
        tools.filter((tool) => !tool.professions.includes("all"))
      );
    } else {
      // Показываем инструменты, соответствующие выбранным фильтрам
      setFilteredTools(
        tools.filter((tool) =>
          activeFilters.some((filter) => tool.professions.includes(filter))
        )
      );
    }
  }, [activeFilters]);

  const toggleFilter = (profession: Profession) => {
    setActiveFilters((prev) => {
      // Если фильтр уже активен, удаляем его
      if (prev.includes(profession)) {
        return prev.filter((p) => p !== profession);
      }
      // Иначе добавляем его
      return [...prev, profession];
    });
  };

  const checkScrollButtons = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    if (sliderRef.current) {
      const cardWidth = 400; // Approximate card width with gap
      sliderRef.current.scrollBy({
        left: -cardWidth,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      const cardWidth = 400; // Approximate card width with gap
      sliderRef.current.scrollBy({
        left: cardWidth,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const handleScroll = () => checkScrollButtons();
    const slider = sliderRef.current;
    
    if (slider) {
      slider.addEventListener('scroll', handleScroll);
      return () => slider.removeEventListener('scroll', handleScroll);
    }
  }, [filteredTools]);

  return (
    <div className="space-y-8 bg-white">
      <div className="space-y-6 relative max-w-[1350px] mx-auto bg-white">
        <h1 className="text-4xl md:text-6xl font-bold text-center">
          <span 
            className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 inline"
            style={{
              fontFamily: 'var(--contact-font)',
              fontWeight: 600,
              letterSpacing: '0.01em',
              textTransform: 'none'
            }}
          >
            {t("dashboard.title")}
          </span>
        </h1>

        <div className="flex justify-center mb-12">
          <p 
            className="max-w-4xl text-base text-center"
            style={{
              fontFamily: 'var(--contact-font)',
              fontWeight: 600,
              letterSpacing: '0.01em',
              textTransform: 'none',
              color: '#0f172a'
            }}
          >
            {t("dashboard.subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {professions.map((profession) => (
            <button
              key={profession.id}
              onClick={() => toggleFilter(profession.id as Profession)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-500 shadow-lg shadow-indigo-500/20 font-semibold transform",
                profession.bgColor,
                profession.borderColor,
                // Если фильтр активен, применяем эффекты карточек
                activeFilters.includes(profession.id as Profession) 
                  ? "shadow-2xl shadow-indigo-500/40 scale-[1.02] -translate-y-2"
                  : "hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-[1.02] hover:-translate-y-2"
              )}
              style={{
                boxShadow: activeFilters.includes(profession.id as Profession)
                  ? '0 0 0 1px rgba(129, 140, 248, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  : '0 0 0 1px rgba(129, 140, 248, 0.2), 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
              }}
            >
              <profession.icon
                className={cn("h-5 w-5", profession.iconColor)}
              />
              <span className={cn("text-sm", profession.textColor)}>
                {profession.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        {/* Navigation Arrows */}
        <button
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          className={cn(
            "absolute left-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-indigo-500/20 backdrop-blur-sm border border-indigo-500/30 flex items-center justify-center transition-all duration-300",
            canScrollLeft 
              ? "hover:bg-indigo-500/40 hover:border-indigo-400/50 text-white" 
              : "opacity-50 cursor-not-allowed text-gray-500"
          )}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <button
          onClick={scrollRight}
          disabled={!canScrollRight}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-indigo-500/20 backdrop-blur-sm border border-indigo-500/30 flex items-center justify-center transition-all duration-300",
            canScrollRight 
              ? "hover:bg-indigo-500/40 hover:border-indigo-400/50 text-white" 
              : "opacity-50 cursor-not-allowed text-gray-500"
          )}
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Slider Container */}
        <AnimatePresence>
          <motion.div
            ref={sliderRef}
            variants={container}
            initial="hidden"
            animate="show"
            className="flex gap-6 overflow-x-auto scrollbar-hide px-4 py-2 scroll-smooth"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            onScroll={checkScrollButtons}
          >
            {filteredTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                variants={item}
                initial="hidden"
                animate="show"
                exit="hidden"
                layout
                className="flex-shrink-0 w-80 sm:w-96"
              >
                <Card
                  onClick={() => router.push(`${tool.href}?toolId=${tool.id}`)}
                  className="group relative overflow-hidden p-6 shadow-lg shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-500 cursor-pointer border-0 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl glow-card h-full transform hover:scale-[1.02] hover:-translate-y-2"
                  style={{
                    boxShadow: '0 0 0 1px rgba(129, 140, 248, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  {/* Multi-layer glow effects with pulsing animation */}
                  <div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 via-cyan-500 to-indigo-600 opacity-0 group-hover:opacity-30 blur-md transition-all duration-500 z-10 glow-pulse"
                  ></div>
                  
                  {/* Secondary glow layer */}
                  <div
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-300 to-indigo-700 opacity-0 group-hover:opacity-15 blur-xl transition-all duration-700 z-10"
                  ></div>

                  {/* Animated gradient overlay with shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-15 shimmer-effect"></div>

                  {/* Enhanced progress bar */}
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                  
                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>

                  <div className="relative z-20 flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <div
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 opacity-20 blur-lg"
                        ></div>
                        <div className="relative bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 p-3 rounded-full backdrop-blur-sm">
                          <tool.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <h3 className="font-heading font-semibold text-lg bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 transition-all duration-500">
                        {t(`tools.${getToolTranslationKey(tool.id)}.label`, { defaultValue: tool.label })}
                      </h3>
                    </div>

                    <p className="text-sm text-black mb-6 line-clamp-2 flex-grow transition-colors duration-500">
                      {t(`tools.${getToolTranslationKey(tool.id)}.description`, { defaultValue: tool.description })}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-indigo-500/10 group-hover:bg-indigo-500/20 text-black border border-indigo-500/20 group-hover:border-indigo-400/30 transition-all duration-500">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3 transition-transform duration-500 group-hover:rotate-180" />
                          {tool.professions.includes("all")
                            ? t("dashboard.creatorTool")
                            : tool.professions.includes("video")
                            ? t("professions.coDirector")
                            : tool.professions.includes("art")
                            ? t("professions.designPartner")
                            : tool.professions.includes("music")
                            ? t("professions.coComposer")
                            : t("professions.creativePartner")}
                        </span>
                      </span>

                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative py-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-indigo-500/10" />
        </div>
      </div>
      
      <style jsx global>{`
        :root {
          --contact-font: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
      `}</style>
    </div>
  );
}
