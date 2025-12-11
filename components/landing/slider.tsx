"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Clapperboard, 
  Video, 
  Palette, 
  Paintbrush, 
  Expand, 
  Eraser, 
  FileAudio, 
  Disc, 
  Music, 
  Volume2, 
  Lightbulb, 
  Share2, 
  Calendar, 
  Focus,
  Type 
} from "lucide-react";
import { useTranslations } from "next-intl";

const Slider = () => {
  const t = useTranslations();

  const creatorTools = [
    // Video Creator
    {
      icon: Clapperboard,
      title: t("slider.scriptBuilder"),
      color: "from-cyan-400 via-blue-500 to-indigo-600",
    },
    {
      icon: Video,
      title: t("slider.videoMaker"),
      color: "from-cyan-400 via-blue-500 to-indigo-600",
    },
    // Digital Artist
    {
      icon: Palette,
      title: t("slider.conceptGenerator"),
      color: "from-cyan-400 via-blue-500 to-indigo-600",
    },
    {
      icon: Paintbrush,
      title: t("slider.paintingEnhance"),
      color: "from-cyan-400 via-blue-500 to-indigo-600",
    },
    {
      icon: Expand,
      title: t("slider.canvasExpand"),
      color: "from-cyan-400 via-blue-500 to-indigo-600",
    },
    {
      icon: Eraser,
      title: t("slider.referenceCleanup"),
      color: "from-cyan-400 via-blue-500 to-indigo-600",
    },
    // Musician
    {
      icon: FileAudio,
      title: t("slider.lyricWriter"),
      color: "from-cyan-400 via-blue-500 to-indigo-600",
    },
    {
      icon: Disc,
      title: t("slider.coverArt"),
      color: "from-cyan-400 via-blue-500 to-indigo-600",
    },
    {
      icon: Music,
      title: t("slider.composeAssist"),
      color: "from-cyan-400 via-blue-500 to-indigo-600",
    },
    {
      icon: Volume2,
      title: t("slider.sfxGenerator"),
      color: "from-cyan-400 via-blue-500 to-indigo-600",
    },
    // Content Creator
    {
      icon: Lightbulb,
      title: t("slider.blogIdeas"),
      color: "from-cyan-400 via-blue-500 to-indigo-600",
    },
    {
      icon: Share2,
      title: t("slider.socialGraphics"),
      color: "from-cyan-400 via-blue-500 to-indigo-600",
    },
    {
      icon: Calendar,
      title: t("slider.contentCalendar"),
      color: "from-cyan-400 via-blue-500 to-indigo-600",
    },
    {
      icon: Focus,
      title: t("slider.thumbnailOptimizer"),
      color: "from-cyan-400 via-blue-500 to-indigo-600",
    },
    {
      icon: Type,
      title: t("slider.captionGenerator"),
      color: "from-cyan-400 via-blue-500 to-indigo-600",
    },
  ];

  // Create duplicated array for seamless infinite scrolling
  const duplicatedTools = [...creatorTools, ...creatorTools];

  return (
    <section
      id="features"
      className="relative overflow-hidden py-16 md:py-24 lg:py-32 bg-white"
    >
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]"></div>

      <div className="container relative mx-auto px-4">
        {/* Header */}
        <div className="mx-auto flex max-w-3xl flex-col items-center space-y-8 text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-bold text-4xl sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600"
          >
            {t("slider.title")}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl"
            style={{
              fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: 600,
              fontSize: '1rem',
              lineHeight: 1.2,
              letterSpacing: '0.01em',
              textTransform: 'none',
              color: '#0f172a'
            }}
          >
            {t("slider.subtitle")}
          </motion.p>
        </div>

        {/* Marquee Container */}
        <div className="relative w-full overflow-hidden">
          <div className="flex space-x-16">
            <motion.div
              className="flex space-x-16"
              animate={{
                x: [0, -200 * creatorTools.length],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 80,
                  ease: "linear",
                },
              }}
            >
              {duplicatedTools.map((tool, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-96 h-80 group cursor-pointer"
                >
                  <div className="relative w-full h-full rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">

                    {/* Glowing border on hover */}
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${tool.color} opacity-0 group-hover:opacity-20 blur transition-opacity duration-300 z-10`}
                    ></div>

                    {/* Content */}
                    <div className="absolute inset-0 z-20 p-6 flex flex-col items-center justify-center text-center">
                      <div className="mb-4 relative w-16 h-16 flex items-center justify-center">
                        <div
                          className={`absolute inset-0 rounded-full bg-gradient-to-r ${tool.color} opacity-20 blur-lg`}
                        ></div>
                        <div className={`relative bg-gradient-to-r ${tool.color} p-3 rounded-full backdrop-blur-sm`}>
                          <tool.icon className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      <h3 
                        className="text-lg mb-6"
                        style={{
                          fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          fontWeight: 600,
                          lineHeight: 1.2,
                          letterSpacing: '0.01em',
                          textTransform: 'none',
                          color: '#0f172a'
                        }}
                      >
                        {tool.title}
                      </h3>

                      <Link href="/dashboard">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          className={`px-4 py-2 rounded-full bg-gradient-to-r ${tool.color} text-white font-semibold shadow-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                        >
                          {t("common.getStarted")}
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Slider;
