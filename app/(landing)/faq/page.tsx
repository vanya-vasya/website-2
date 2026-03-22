"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

type FaqItem = {
  question: string;
  answer: string;
};

const faqItems: FaqItem[] = [
  {
    question: "How can Nerbixa help me as a creative professional?",
    answer:
      "Nerbixa brings together AI-powered tools built specifically for video creators, digital artists, musicians, and content creators. From script writing and concept art to music composition, voiceovers, and social media content — everything you need to move faster and create smarter is in one place.",
  },
  {
    question: "Can I use Nerbixa for commercial projects?",
    answer:
      "Yes. Content you generate on Nerbixa is yours — full stop. Use it freely for personal or commercial work, with no restrictions on how you monetize or publish what you create.",
  },
  {
    question: "Do I need to be technically skilled to use Nerbixa?",
    answer:
      "No technical background required. Just describe what you have in mind, and Nerbixa handles the rest. The platform is built for creatives, not engineers — so the focus stays on your vision, not the tooling.",
  },
  {
    question: "How do you ensure the quality of AI-generated creative content?",
    answer:
      "Our models are trained on high-quality, profession-specific creative material and continuously improved to meet real industry standards. Whether you're producing video, art, music, or written content, the output is built to hold up professionally.",
  },
  {
    question: "Can I customize the AI-generated content for my specific needs?",
    answer:
      "Absolutely. Every tool on Nerbixa supports detailed prompts and adjustable parameters, so you stay in creative control. AI accelerates the process — your direction shapes the result.",
  },
  {
    question: "How much do different generations cost?",
    answer:
      "Generations range from 1 to 5 credits depending on the content type. Full pricing details are available on our website.",
  },
];

const FaqAccordionItem = ({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <div
    className="border-b border-gray-200 last:border-b-0"
    style={{ fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
  >
    <button
      type="button"
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      aria-expanded={isOpen}
      aria-controls={`faq-answer-${index}`}
      id={`faq-question-${index}`}
      tabIndex={0}
      className="w-full flex items-center justify-between py-6 text-left gap-4 group focus:outline-none"
    >
      <span
        className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200"
        style={{ lineHeight: 1.4 }}
      >
        {item.question}
      </span>
      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors duration-200">
        {isOpen ? (
          <Minus className="w-4 h-4 text-blue-600" aria-hidden="true" />
        ) : (
          <Plus className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors duration-200" aria-hidden="true" />
        )}
      </span>
    </button>
    <div
      id={`faq-answer-${index}`}
      role="region"
      aria-labelledby={`faq-question-${index}`}
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? "max-h-96 pb-6" : "max-h-0"
      }`}
    >
      <p className="text-gray-600 text-base leading-relaxed">{item.answer}</p>
    </div>
  </div>
);

const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
    >
      {/* Hero Section */}
      <section className="bg-white pt-16 pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
            style={{ lineHeight: 1.15, letterSpacing: "-0.02em" }}
          >
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            Find answers to common questions about Nerbixa&apos;s AI-powered creative platform
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 sm:px-10">
            {faqItems.map((item, index) => (
              <FaqAccordionItem
                key={index}
                item={item}
                index={index}
                isOpen={openIndex === index}
                onToggle={() => handleToggle(index)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FaqPage;
