"use client";

import Image from "next/image";

const Contact = () => {
  // Array of partner logos
  const partnerLogos = [
    {
      src: "/logos/TechFlow-Logo.png",
      alt: "TechFlow Solutions",
      width: 256,
      height: 94,
    },
    {
      src: "/logos/DataPrime-Logo.png",
      alt: "DataPrime Analytics",
      width: 256,
      height: 94,
    },
    {
      src: "/logos/CloudVault-Logo.png",
      alt: "CloudVault Security",
      width: 256,
      height: 94,
    },
    {
      src: "/logos/GreenLeaf-Logo.png",
      alt: "GreenLeaf Innovations",
      width: 256,
      height: 94,
    },
    {
      src: "/logos/NexusHub-Logo.png",
      alt: "NexusHub Consulting",
      width: 256,
      height: 94,
    },
    {
      src: "/logos/QuantumEdge-Logo.png",
      alt: "QuantumEdge Finance",
      width: 256,
      height: 94,
    },
    {
      src: "/logos/StreamLine-Logo.png",
      alt: "StreamLine Logistics",
      width: 256,
      height: 94,
    },
    {
      src: "/logos/PulseCore-Logo.png",
      alt: "PulseCore Health",
      width: 256,
      height: 94,
    },
    {
      src: "/logos/ZenithPay-Logo.png",
      alt: "ZenithPay Solutions",
      width: 256,
      height: 94,
    },
    {
      src: "/logos/VelocityOne-Logo.png",
      alt: "VelocityOne Media",
      width: 256,
      height: 94,
    },
  ];

  // Duplicate the array to create seamless loop
  const duplicatedLogos = [...partnerLogos, ...partnerLogos];

  return (
    <section id="contact" className="bg-white py-16 sm:py-24">
      <div className="max-w-screen-xl px-4 mx-auto sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="contact-heading">
            Trusted by Leading Companies
          </h2>
          <p className="contact-subtitle">
            Join Thousands of Businesses That Rely on Our AI-Powered Solutions
          </p>
        </div>

        {/* Scrolling Marquee */}
        <div className="relative overflow-hidden">
          {/* Gradient overlays for smooth fade effect */}
          <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-white to-transparent z-10"></div>
          
          {/* Scrolling container */}
          <div className="flex space-x-8 lg:space-x-12 animate-marquee">
            {duplicatedLogos.map((logo, index) => (
              <div
                key={`${logo.alt}-${index}`}
                className="flex-shrink-0 flex items-center justify-center h-32 w-64 opacity-70 hover:opacity-100 transition-opacity duration-300"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width}
                  height={logo.height}
                  className="max-h-24 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        :root {
          --contact-font: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI",
                          Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
        }

        .contact-heading {
          font-family: var(--contact-font);
          font-weight: 600;
          font-size: 2.5rem;
          line-height: 1.1;
          letter-spacing: 0.01em;
          text-transform: none;
          color: #0f172a;
          margin-bottom: 1rem;
        }

        .contact-subtitle {
          font-family: var(--contact-font);
          font-weight: 600;
          font-size: 1rem;
          line-height: 1.2;
          letter-spacing: 0.01em;
          text-transform: none;
          color: #0f172a;
          margin-top: 1rem;
        }



        @media (max-width: 640px) {
          .contact-heading {
            font-size: 2rem;
          }
          .contact-subtitle {
            font-size: 0.875rem;
          }
        }

        @keyframes marquee-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee-scroll 20s linear infinite;
          will-change: transform;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }

        @media (max-width: 640px) {
          .animate-marquee {
            animation-duration: 15s;
          }
        }
      `}</style>
    </section>
  );
};

export default Contact;
