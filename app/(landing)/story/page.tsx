"use client";

const problemItems = [
  "Creative workflows are scattered — scripts, visuals, music, and social content live in separate apps, each with its own learning curve and subscription.",
  "Solo creators and small teams can\u2019t afford the time, talent, or tools that studios take for granted, so great ideas die in the gap between concept and execution.",
  "Generic AI outputs feel flat and soulless, ignoring the creator\u2019s unique voice, style, and artistic intent.",
  "The industry needs a partner, not a replacement \u2014 one that amplifies human creativity instead of commoditizing it.",
];

const StoryPage = () => (
  <div
    className="min-h-screen bg-white overflow-y-auto"
    style={{
      fontFamily:
        'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }}
  >
    {/* Mission Hero */}
    <section className="bg-white pt-16 pb-14 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-500 mb-4">
          Our Mission
        </p>
        <p className="text-gray-600 text-base leading-relaxed font-normal">
          Unleash every creator&apos;s potential by fusing AI-powered toolkits
          for music, video, art, and content into a single co-creative engine
          that turns raw ideas into polished, production-ready work
        </p>
      </div>
    </section>

    <section className="pb-20 px-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">

        {/* Problem */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 sm:px-10 py-10">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-blue-500 mb-6">
            The Problem We&apos;re Solving
          </h2>
          <ul className="flex flex-col gap-4">
            {problemItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-blue-500" aria-hidden="true" />
                <p className="text-gray-600 text-base leading-relaxed">{item}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Solution */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 sm:px-10 py-10">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-blue-500 mb-4">
            Our Solution
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">
            A unified AI creative hub where every discipline — video scripting,
            music composition, concept art, social content — lives under one
            roof and speaks the same language. Nerbixa pairs genre-aware
            generative models with professional-grade toolkits so creators move
            from spark to finished asset in minutes, not days. Each tool learns
            your style, respects your intent, and delivers output ready for the
            stage, the feed, or the screen.
          </p>
        </div>

        {/* Vision */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 sm:px-10 py-10">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-blue-500 mb-4">
            Our Vision for the Future
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">
            Creation becomes limitless, intuitive, and deeply personal — guided
            by AI that understands your aesthetic DNA, not just your prompt. We
            aim to set the standard for ethical creative AI, proving that
            artistic authenticity and intelligent automation can thrive together
            at any scale.
          </p>
        </div>

      </div>
    </section>
  </div>
);

export default StoryPage;
