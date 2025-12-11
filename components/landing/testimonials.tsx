"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";

const Testimonials = () => {
  const t = useTranslations();
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const testimonials = [
    {
      name: t("testimonials.testimonial1.name"),
      role: t("testimonials.testimonial1.role"),
      image: "/images/testimonials/testimonials-1.png",
      content: t("testimonials.testimonial1.content"),
      color: "from-purple-600 to-pink-600",
    },
    {
      name: t("testimonials.testimonial2.name"),
      role: t("testimonials.testimonial2.role"),
      image: "/images/testimonials/testimonials-2.png",
      content: t("testimonials.testimonial2.content"),
      color: "from-blue-600 to-violet-600",
    },
    {
      name: t("testimonials.testimonial3.name"),
      role: t("testimonials.testimonial3.role"),
      image: "/images/testimonials/testimonials-pet-1.png",
      content: t("testimonials.testimonial3.content"),
      color: "from-green-500 to-teal-600",
    },
    {
      name: t("testimonials.testimonial4.name"),
      role: t("testimonials.testimonial4.role"),
      image: "/images/testimonials/testimonials-4.png",
      content: t("testimonials.testimonial4.content"),
      color: "from-orange-500 to-red-600",
    },
    {
      name: t("testimonials.testimonial5.name"),
      role: t("testimonials.testimonial5.role"),
      image: "/images/testimonials/testimonials-6.png",
      content: t("testimonials.testimonial5.content"),
      color: "from-pink-500 to-rose-600",
    },
    {
      name: t("testimonials.testimonial6.name"),
      role: t("testimonials.testimonial6.role"),
      image: "/images/testimonials/testimonials-pet-2.png",
      content: t("testimonials.testimonial6.content"),
      color: "from-cyan-500 to-blue-600",
    },
    {
      name: t("testimonials.testimonial7.name"),
      role: t("testimonials.testimonial7.role"),
      image: "/images/testimonials/testimonials-8.png",
      content: t("testimonials.testimonial7.content"),
      color: "from-emerald-500 to-green-600",
    },
    {
      name: t("testimonials.testimonial8.name"),
      role: t("testimonials.testimonial8.role"),
      image: "/images/testimonials/testimonials-9.png",
      content: t("testimonials.testimonial8.content"),
      color: "from-violet-500 to-purple-600",
    },
    {
      name: t("testimonials.testimonial9.name"),
      role: t("testimonials.testimonial9.role"),
      image: "/images/testimonials/testimonials-nature-1.png",
      content: t("testimonials.testimonial9.content"),
      color: "from-yellow-500 to-orange-600",
    },
    {
      name: t("testimonials.testimonial10.name"),
      role: t("testimonials.testimonial10.role"),
      image: "/images/testimonials/testimonials-11.png",
      content: t("testimonials.testimonial10.content"),
      color: "from-red-500 to-pink-600",
    },
    {
      name: t("testimonials.testimonial11.name"),
      role: t("testimonials.testimonial11.role"),
      image: "/images/testimonials/testimonials-nature-2.png",
      content: t("testimonials.testimonial11.content"),
      color: "from-teal-500 to-cyan-600",
    },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (autoplay) {
      interval = setInterval(() => {
        setActiveIndex((current) => (current + 1) % testimonials.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoplay, testimonials.length]);

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
    setAutoplay(false);
    // Restart autoplay after 10 seconds of inactivity
    setTimeout(() => setAutoplay(true), 10000);
  };

  // Calculate the visible testimonials (current, prev, next)
  const getPrevIndex = (index: number) =>
    index === 0 ? testimonials.length - 1 : index - 1;
  const getNextIndex = (index: number) =>
    index === testimonials.length - 1 ? 0 : index + 1;

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden py-16 md:py-24 lg:py-32 bg-slate-100"
    >
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]"></div>

      {/* Background elements */}

      <div className="container relative mx-auto px-4">
        <div className="mx-auto flex max-w-3xl flex-col items-center space-y-8 text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-bold text-4xl sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600"
          >
            {t("testimonials.title")}
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
            {t("testimonials.subtitle")}
          </motion.p>
        </div>

        {/* Testimonials Slider */}
        <div className="relative h-[400px] w-full max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => {
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
                      ? "-60%"
                      : "60%",
                  scale: position === "center" ? 1 : 0.85,
                  opacity: position === "center" ? 1 : 0.6,
                  zIndex: position === "center" ? 30 : 10,
                  rotateY:
                    position === "center" ? 0 : position === "left" ? 15 : -15,
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="absolute top-0 left-0 right-0 mx-auto w-full max-w-xl h-[400px] cursor-pointer perspective-1000"
                onClick={() => {
                  if (!isActive) {
                    setActiveIndex(index);
                    setAutoplay(false);
                    setTimeout(() => setAutoplay(true), 10000);
                  }
                }}
              >
                <div className="relative w-full h-full transform-style-3d rounded-2xl shadow-lg overflow-hidden group">
                  {/* Glowing border */}
                  <div
                    className={`absolute -inset-1 rounded-2xl bg-gradient-to-r ${testimonial.color} opacity-25 blur transition-opacity duration-400 group-hover:opacity-100 group-hover:duration-200`}
                  ></div>

                  {/* Content */}
                  <div className="relative h-full p-8 bg-slate-800 rounded-2xl ring-1 ring-gray-900/5 flex flex-col justify-center items-center text-center space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-16 h-16">
                        <Image
                          src={testimonial.image}
                          fill
                          alt={`${testimonial.name} testimonial`}
                          className="rounded-full object-cover border-2 border-gray-600"
                          sizes="64px"
                        />
                      </div>
                      <div>
                        <h3 
                          style={{
                            fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            fontWeight: 600,
                            fontSize: '1.25rem',
                            lineHeight: 1.2,
                            letterSpacing: '0.01em',
                            textTransform: 'none',
                            color: '#ffffff'
                          }}
                        >
                          {testimonial.name}
                        </h3>
                        <p 
                          style={{
                            fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            lineHeight: 1.2,
                            letterSpacing: '0.01em',
                            textTransform: 'none',
                            color: '#9ca3af'
                          }}
                        >
                          {testimonial.role}
                        </p>
                      </div>
                    </div>

                    <p 
                      className="max-w-md"
                      style={{
                        fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        fontWeight: 600,
                        fontSize: '1rem',
                        lineHeight: 1.2,
                        letterSpacing: '0.01em',
                        textTransform: 'none',
                        color: '#d1d5db'
                      }}
                    >
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Navigation dots */}
        <div className="flex justify-center mt-12 space-x-3">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "bg-white w-8"
                  : "bg-gray-500 opacity-50 hover:opacity-75"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
