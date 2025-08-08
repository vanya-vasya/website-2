"use client";
<<<<<<< HEAD
import { motion } from "framer-motion";
import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    company: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: "📧",
      title: "Email Support",
      description: "Get help with your account or creative projects",
      contact: "support@neuvisia.com"
    },
    {
      icon: "💬",
      title: "Live Chat",
      description: "Chat with our creative support team",
      contact: "Available 24/7"
    },
    {
      icon: "📱",
      title: "Social Media",
      description: "Follow us for updates and creative inspiration",
      contact: "@neuvisia"
    }
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Let's Create Something Amazing Together
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Ready to transform your creative process? Get in touch with our team and discover 
            how Neuvisia can help you bring your ideas to life.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Send us a message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-slate-300 mb-2">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                    placeholder="Your company"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300 resize-none"
                    placeholder="Tell us about your creative project or how we can help..."
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25"
                >
                  Send Message
                </button>
              </form>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Get in touch</h3>
              <p className="text-slate-300 leading-relaxed mb-8">
                Whether you have questions about our platform, need help with your creative projects, 
                or want to explore partnership opportunities, we're here to help.
              </p>
            </div>

            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300"
                >
                  <div className="text-2xl">{info.icon}</div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{info.title}</h4>
                    <p className="text-slate-400 text-sm mb-2">{info.description}</p>
                    <p className="text-purple-400 font-medium">{info.contact}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-2xl p-6"
            >
              <h4 className="font-semibold text-white mb-3">Ready to get started?</h4>
              <p className="text-slate-300 text-sm mb-4">
                Join thousands of creators who are already using Neuvisia to bring their ideas to life. 
                Start your creative journey today.
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105">
                Start Creating Free
              </button>
            </motion.div>
          </motion.div>
=======

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
>>>>>>> a45294d20afb85227c67fa96878e37eab6509ebb
        </div>
      </div>
    </section>
  );
};

export default Contact;
