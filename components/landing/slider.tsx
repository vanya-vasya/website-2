"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Clapperboard, 
  Video, 
  Mic2, 
  Palette, 
  Paintbrush, 
  Expand, 
  Eraser, 
  FileAudio, 
  Disc, 
  Music, 
  Volume2, 
  Mic, 
  Lightbulb, 
  Share2, 
  Calendar, 
  Focus,
  Type 
} from "lucide-react";

const creatorTools = [
  // Video Creator
  {
    icon: Clapperboard,
    title: "Script Builder",
    color: "from-cyan-400 via-blue-500 to-indigo-600",
  },
  {
    icon: Video,
    title: "Video Maker",
    color: "from-cyan-400 via-blue-500 to-indigo-600",
  },
  {
    icon: Mic2,
    title: "AI Voiceover",
    color: "from-cyan-400 via-blue-500 to-indigo-600",
  },
  // Digital Artist
  {
    icon: Palette,
    title: "Concept Generator",
    color: "from-cyan-400 via-blue-500 to-indigo-600",
  },
  {
    icon: Paintbrush,
    title: "Painting Enhance",
    color: "from-cyan-400 via-blue-500 to-indigo-600",
  },
  {
    icon: Expand,
    title: "Canvas Expand",
    color: "from-cyan-400 via-blue-500 to-indigo-600",
  },
  {
    icon: Eraser,
    title: "Reference Cleanup",
    color: "from-cyan-400 via-blue-500 to-indigo-600",
  },
  // Musician
  {
    icon: FileAudio,
    title: "Lyric Writer",
    color: "from-cyan-400 via-blue-500 to-indigo-600",
  },
  {
    icon: Disc,
    title: "Cover Art",
    color: "from-cyan-400 via-blue-500 to-indigo-600",
  },
  {
    icon: Music,
    title: "Compose Assist",
    color: "from-cyan-400 via-blue-500 to-indigo-600",
  },
  {
    icon: Volume2,
    title: "SFX Generator",
    color: "from-cyan-400 via-blue-500 to-indigo-600",
  },
  {
    icon: Mic,
    title: "Melody Maker",
    color: "from-cyan-400 via-blue-500 to-indigo-600",
  },
  // Content Creator
  {
    icon: Lightbulb,
    title: "Blog Ideas",
    color: "from-cyan-400 via-blue-500 to-indigo-600",
  },
  {
    icon: Share2,
    title: "Social Graphics",
    color: "from-cyan-400 via-blue-500 to-indigo-600",
  },
  {
    icon: Calendar,
    title: "Content Calendar",
    color: "from-cyan-400 via-blue-500 to-indigo-600",
  },
  {
    icon: Focus,
    title: "Thumbnail Optimizer",
    color: "from-cyan-400 via-blue-500 to-indigo-600",
  },
  {
    icon: Type,
    title: "Caption Generator",
    color: "from-cyan-400 via-blue-500 to-indigo-600",
  },
];

const Slider = () => {
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
            Toolkits
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
            Toolkits built for every creative discipline. From video to music to art and content, our AI platform delivers pro-grade tools tailored to how you work
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
                          Get Started
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

