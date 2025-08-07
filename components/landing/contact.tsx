"use client";

import { useEffect } from "react";

const Contact = () => {
  useEffect(() => {
    const targets = [
      { id: "starsCount", count: 90000, suffix: "+" },
      { id: "downloadsCount", count: 15000, suffix: "+" },
      { id: "sponsorsCount", count: 50, suffix: "+" },
    ];

    const animateCount = (element: HTMLElement, count: number, suffix: string) => {
      let start = 0;
      const duration = 1500;
      const startTime = performance.now();

      const step = (currentTime: number) => {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const value = Math.floor(progress * count);
        element.textContent = `${value}${suffix}`;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          element.textContent = `${count}${suffix}`;
        }
      };

      requestAnimationFrame(step);
    };

    if (typeof window !== "undefined") {
      targets.forEach(({ id, count, suffix }) => {
        const el = document.getElementById(id);
        if (el) {
          animateCount(el, count, suffix);
        }
      });
    }
  }, []);

  return (
    <section id="contact" className="page-title bg-slate-900">
      <div className="dark:bg-gray-900">
        <div className="pt-12 sm:pt-20">
          <div className="max-w-screen-xl px-4 mx-auto sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-extrabold leading-9 text-white sm:text-4xl sm:leading-10">
                Trusted by creators and developers
              </h2>
              <p className="mt-3 text-xl leading-7 text-white-300/10 sm:mt-4">
              Neuvisia powers real-world projects across industries — from design and media to software and marketing.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container bg-slate-900">
        <div className="pb-8 sm:pb-12">
          <div className="relative">
            <div className="absolute inset-0 h-1/2 bg-slate-900"></div>
            <div className="relative max-w-screen-xl px-4 mx-auto sm:px-6 lg:px-8">
              <div className="relative max-w-4xl mt-8 mx-auto group">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 opacity-40 blur-sm transition duration-300 group-hover:opacity-100 group-hover:blur pointer-events-none"></div>
                <dl className="relative bg-slate-800 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                <div className="flex flex-col p-6 text-center">
                    <dt className="order-2 mt-2 text-lg font-medium leading-6 text-white/70">
                      AI-Generated Creations
                    </dt>
                    <dd
                      className="order-1 text-5xl font-extrabold leading-none text-pink-600"
                      id="starsCount"
                    >
                      0
                    </dd>
                  </div>
                  <div className="flex flex-col p-6 text-center">
                    <dt className="order-2 mt-2 text-lg font-medium leading-6 text-white/70">
                      Active Users Monthly
                    </dt>
                    <dd
                      className="order-1 text-5xl font-extrabold leading-none text-pink-600"
                      id="downloadsCount"
                    >
                      0
                    </dd>
                  </div>
                  <div className="flex flex-col p-6 text-center">
                    <dt className="order-2 mt-2 text-lg font-medium leading-6 text-white/70">
                      Countries Using Neuvisia
                    </dt>
                    <dd
                      className="order-1 text-5xl font-extrabold leading-none text-pink-600"
                      id="sponsorsCount"
                    >
                      0
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
