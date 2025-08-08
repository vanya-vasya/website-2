"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is Neuvisia and how does it work?",
      answer: "Neuvisia is an AI-powered creative platform designed specifically for creators. Simply describe what you want to create, choose your style preferences, and our advanced AI generates professional-quality content in seconds. No technical skills required - just your imagination and our AI."
    },
    {
      question: "What types of content can I create with Neuvisia?",
      answer: "Neuvisia supports video scripts, digital artwork, music compositions, and written content. Whether you're a video creator, digital artist, musician, or content creator, we have specialized tools for your creative needs. From YouTube scripts to album covers, concept art to social media posts."
    },
    {
      question: "Is there a free plan available?",
      answer: "Yes! We offer a generous free tier that allows you to explore our platform and create your first few pieces of content. You can upgrade to our premium plans anytime to unlock unlimited generations and advanced features."
    },
    {
      question: "How does the AI understand my creative vision?",
      answer: "Our AI has been trained on millions of creative works and understands natural language descriptions. Simply tell us what you want to create in plain English - like 'a cinematic video script about space exploration' or 'a vibrant digital painting of a futuristic city' - and our AI will bring your vision to life."
    },
    {
      question: "Can I use the content I create commercially?",
      answer: "Absolutely! All content you create with Neuvisia is yours to use however you want - for personal projects, commercial work, or client projects. We believe creators should own their creations."
    },
    {
      question: "What makes Neuvisia different from other AI tools?",
      answer: "Neuvisia is built specifically for creative professionals with specialized tools for different creative domains. Unlike general AI tools, we understand the unique needs of video creators, artists, musicians, and content creators. Our platform is designed to enhance your creative workflow, not replace it."
    },
    {
      question: "Do you offer customer support?",
      answer: "Yes! We provide 24/7 customer support through live chat, email, and our comprehensive help center. Our team of creative professionals is here to help you get the most out of Neuvisia and answer any questions about your creative projects."
    },
    {
      question: "Can I collaborate with team members on projects?",
      answer: "Our team plans include collaboration features that allow you to share projects, work together on creative briefs, and manage team workflows. Perfect for agencies, studios, and creative teams."
    }
  ];

  return (
    <section id="faq" className="py-20 bg-gradient-to-b from-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Everything you need to know about Neuvisia and how it can transform your creative process.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div
                className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between focus:outline-none"
                >
                  <h3 className="text-lg font-semibold text-white pr-4">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0">
                    <svg
                      className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-6">
                        <div className="pt-2 border-t border-white/10">
                          <p className="text-slate-300 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-4">
              Still Have Questions?
            </h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Our support team is here to help you get started and make the most of Neuvisia. 
              Reach out anytime - we're here for your creative journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25">
                Contact Support
              </button>
              <button className="px-8 py-4 border-2 border-slate-600 text-slate-300 font-semibold rounded-xl hover:border-purple-500 hover:text-purple-400 transition-all duration-300">
                View Documentation
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
