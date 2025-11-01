"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CodeSnippet from "@/components/ui/CodeSnippet"; 
import ChatInterface from "@/components/ui/ChatInterface"; 
import Image from 'next/image';
import Link from "next/link";

const creativeTools = [
  {
    title: "Co-Composer",
    description: "Create original music and melodies for your projects with AI-powered composition",
    image: "/images/resource/music/music-production.jpg",
    type: "image",
    color: "from-cyan-400 via-blue-500 to-indigo-600",
  },
  {
    title: "Co-Director", 
    description: "Create professional video scripts, storyboards and scenarios for your next production",
    image: "/images/resource/video-production.jpg",
    type: "image",
    color: "from-cyan-400 via-blue-500 to-indigo-600",
  },
  {
    title: "Design Partner",
    description: "Generate stunning concept art and illustrations for your creative projects",
    image: "/images/resource/tiktok.jpg",
    type: "image", 
    color: "from-cyan-400 via-blue-500 to-indigo-600",
  },
  {
    title: "Creative Partner",
    description: "Generate engaging social media posts, captions, and content calendars for your brand",
    image: "/images/resource/digital_artist.jpg",
    type: "image",
    color: "from-cyan-400 via-blue-500 to-indigo-600",
  },
];

const Solutions = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (autoplay) {
      interval = setInterval(() => {
        setActiveIndex((current) => (current + 1) % creativeTools.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoplay]);

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
    setAutoplay(false);
    // Restart autoplay after 10 seconds of inactivity
    setTimeout(() => setAutoplay(true), 10000);
  };

  // Calculate the visible tools (current, prev, next)
  const getPrevIndex = (index: number) =>
    index === 0 ? creativeTools.length - 1 : index - 1;
  const getNextIndex = (index: number) =>
    index === creativeTools.length - 1 ? 0 : index + 1;

  return (
    <section id="solutions"  className="relative overflow-hidden py-16 md:py-24 lg:py-32 bg-slate-50">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]"></div>

      {/* Background elements */}

      <div className="container relative mx-auto px-4">
        <div className="mx-auto flex max-w-3xl flex-col items-center space-y-8 text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
            style={{
              fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              fontWeight: 600,
              fontSize: '2.5rem',
              lineHeight: 1.1,
              letterSpacing: '0.01em',
              textTransform: 'none',
              color: '#0f172a',
              marginBottom: '1rem'
            }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">
              It is your AI creative assistant
            </span>
          </motion.h2>
        </div>

        {/* 3D Card Slider */}
        <div className="relative h-[500px] w-full max-w-6xl mx-auto">
          {creativeTools.map((tool, index) => {
            // Determine if this card is active, previous, or next
            const isActive = index === activeIndex;
            const isPrev = index === getPrevIndex(activeIndex);
            const isNext = index === getNextIndex(activeIndex);
            const isVisible = isActive || isPrev || isNext;

            if (!isVisible) return null;

            let position: "center" | "left" | "right";
            if (isActive) position = "center";
            else if (isPrev) position = "left";
            else position = "right";

            return (
              <motion.div
                key={index}
                initial={false}
                animate={{
                  x:
                    position === "center"
                      ? 0
                      : position === "left"
                      ? "-55%"
                      : "55%",
                  scale: position === "center" ? 1 : 0.8,
                  opacity: position === "center" ? 1 : 0.6,
                  zIndex: position === "center" ? 30 : 10,
                  rotateY:
                    position === "center" ? 0 : position === "left" ? 15 : -15,
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="absolute top-0 left-0 right-0 mx-auto w-full max-w-2xl h-[500px] cursor-pointer perspective-1000"
                onClick={() => {
                  if (!isActive) {
                    setActiveIndex(index);
                    setAutoplay(false);
                    setTimeout(() => setAutoplay(true), 10000);
                  }
                }}
              >
                <div className="relative w-full h-full transform-style-3d rounded-2xl shadow-lg overflow-hidden">
                  {/* Background content */}
                  <div className="absolute inset-0 z-0">
                    {tool.type === "image" && tool.image ? (
                      <Image
                        src={tool.image}
                        alt={tool.title}
                        width={800}
                        height={600}
                        className="absolute inset-0 h-full w-full object-cover object-center"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 h-full w-full bg-slate-800">
                        <ChatInterface />
                      </div>
                    )}
                  </div>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-transparent z-10"></div>

                  {/* Glowing border */}
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${tool.color} opacity-0 hover:opacity-20 blur transition-opacity`}
                  ></div>

                  {/* Content */}
                  <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end">
                    <div className="text-left">
                      <h3 className="mb-4 text-3xl font-extrabold leading-9 text-white sm:text-4xl sm:leading-10">
                        {tool.title}
                      </h3>

                      <p 
                        className="mb-6 max-w-md text-white"
                        style={{
                          fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                          fontWeight: 600,
                          fontSize: '1rem',
                          lineHeight: 1.2,
                          letterSpacing: '0.01em',
                          textTransform: 'none'
                        }}
                      >
                        {tool.description}
                      </p>

                      <Link href="/dashboard">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          className={`px-6 py-3 rounded-full bg-gradient-to-r ${tool.color} text-white font-semibold shadow-lg`}
                        >
                          Explore
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Navigation dots */}
        <div className="flex justify-center mt-12 space-x-4">
          {creativeTools.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "bg-white w-8"
                  : "bg-gray-500 opacity-50 hover:opacity-75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solutions;
