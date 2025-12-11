"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const Hero = () => {
  const t = useTranslations();

  return (
    <section 
      id="home" 
      className="feature-one animate__flip pb-16 relative overflow-hidden"
             style={{
         backgroundImage: 'url(/assets/images/hero-waves-bg.jpg)',
         backgroundSize: 'cover',
         backgroundPosition: 'center',
         backgroundRepeat: 'no-repeat',
         minHeight: '50vh'
       }}
    >
      {/* Content overlay */}
      <div className="relative z-10 mx-auto px-2 sm:px-4 flex items-center" style={{ minHeight: '50vh' }}>
        <div className="feature-one__inner w-full">
          <h2 className="hero-heading text-center">
            {t("hero.title")} <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">
              {t("hero.titleHighlight")}
            </span>
          </h2>
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
              {t("hero.subtitle")}
            </p>
          </div>
          <div className="feature-one__btn-box">
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white shadow-lg"
                style={{ 
                  fontFamily: 'var(--contact-font)', 
                  fontWeight: 600,
                  letterSpacing: '0.01em'
                }}
              >
                {t("common.getStarted")}
              </motion.button>
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        :root {
          --contact-font: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .hero-heading {
          font-family: var(--contact-font);
          font-weight: 600;
          font-size: 2.5rem;
          line-height: 1.1;
          letter-spacing: 0.01em;
          text-transform: none;
          color: #0f172a;
          margin-bottom: 1rem;
        }

        @media (max-width: 640px) {
          .hero-heading {
            font-size: 2rem;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
