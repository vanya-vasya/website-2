"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  tokens: string;
  tokenRate?: string;
  generations?: string;
  features: string[];
  popular: boolean;
  color: string;
}

const pricingTiers: PricingTier[] = [
  {
    id: "Tracker",
    name: "Your Own Tracker",
    description: "For a quick start",
    price: "£20",
    tokens: "100 Tokens",
    discount: "Standard Rate",
    features: [
      "Macros Generations"
    ],
    popular: false,
    color: "from-purple-600 to-pink-600",
  },
  {
    id: "master-chef",
    name: "Your Own Chef",
    description: "Best value for regular use",
    price: "£40",
    tokens: "220 Tokens",
    discount: "10% Token Discount",
    features: [
      "Recipe Generations"
    ],
    popular: true,
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "master-nutritionist",
    name: "Your Own Nutritionist",
    description: "Maximum value package",
    price: "£60",
    tokens: "360 Tokens",
    discount: "20% Token Discount",
    features: [
      "Consulting Generations"
    ],
    popular: false,
    color: "from-blue-600 to-violet-600",
  },
  {
    id: "custom",
    name: "Custom Amount",
    description: "Perfect for your specific needs",
    price: "",
    tokens: "",
    tokenRate: "£0.20 per token",
    features: [
      "Pay Exactly What You Want"
    ],
    popular: false,
    color: "from-orange-500 to-red-600",
  }
];

const Pricing = () => {
  const [customAmount, setCustomAmount] = useState("");

  return (
    <section
      id="pricing"
      className="relative overflow-hidden py-16 md:py-24 lg:py-32 bg-slate-100"
    >
      <div className="container relative mx-auto px-4">
        <div className="mx-auto flex max-w-4xl flex-col items-center space-y-8 text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center"
            style={{
              fontFamily: 'var(--contact-font)',
              fontWeight: 600,
              fontSize: '2.5rem',
              lineHeight: 1.1,
              letterSpacing: '0.01em',
              textTransform: 'none',
              color: '#1e293b', // slate-900 for light background
              marginBottom: '1rem'
            }}
          >
            Pay-As-You-Go
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl text-base text-center"
            style={{
              fontFamily: 'var(--contact-font)',
              fontWeight: 600,
              letterSpacing: '0.01em',
              textTransform: 'none',
              color: '#475569' // slate-600 for light background
            }}
          >
            Just pay-as-you-go tokens, with bigger packs for better value
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className={`relative rounded-2xl p-6 bg-white shadow-lg border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 h-full flex flex-col ${
                tier.popular 
                  ? "border-green-400 ring-2 ring-green-400 ring-opacity-50" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Popular
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="flex flex-col flex-1 space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <h3 
                    className="text-xl font-bold text-slate-900"
                    style={{
                      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    }}
                  >
                    {tier.name}
                  </h3>
                  <p 
                    className="text-slate-600 text-sm"
                    style={{
                      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    }}
                  >
                    {tier.description}
                  </p>
                </div>

                {/* Price */}
                {tier.id !== "custom" && (
                  <div className="text-center space-y-1">
                    <div 
                      className="text-4xl font-bold text-slate-900"
                      style={{
                        fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      }}
                    >
                      {tier.price}
                    </div>
                    {tier.tokens && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                          <p 
                            className="text-green-600 font-semibold"
                            style={{
                              fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            }}
                          >
                            {tier.tokens}
                          </p>
                          {tier.discount && (
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              tier.discount === "Standard Rate" 
                                ? "bg-gray-100 text-gray-700"
                                : "bg-green-100 text-green-700"
                            }`}>
                              {tier.discount}
                            </span>
                          )}
                        </div>
                        {tier.tokenRate && (
                          <p 
                            className="text-slate-500 text-xs"
                            style={{
                              fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            }}
                          >
                            {tier.tokenRate}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Custom Amount Input */}
                {tier.id === "custom" && (
                  <div className="text-center space-y-1">
                    <div className="relative">
                      <label htmlFor={`custom-amount-${tier.id}`} className="sr-only">
                        Enter custom amount in pounds
                      </label>
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 font-semibold pointer-events-none" style={{ color: '#000' }}>£</span>
                      <input
                        id={`custom-amount-${tier.id}`}
                        type="number"
                        placeholder="25"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-2 border-2 rounded-lg text-center text-2xl font-bold transition-all duration-200 bg-white focus:outline-none focus:ring-2"
                        style={{
                          fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          borderColor: '#000',
                          color: '#000',
                        }}
                        onFocus={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.style.borderColor = '#000';
                          target.style.boxShadow = '0 0 0 2px rgba(0, 0, 0, 0.2)';
                        }}
                        onBlur={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.style.borderColor = '#000';
                          target.style.boxShadow = 'none';
                        }}
                        onMouseOver={(e) => {
                          const target = e.target as HTMLInputElement;
                          if (document.activeElement !== target) {
                            target.style.borderColor = 'rgba(0, 0, 0, 0.8)';
                          }
                        }}
                        onMouseOut={(e) => {
                          const target = e.target as HTMLInputElement;
                          if (document.activeElement !== target) {
                            target.style.borderColor = '#000';
                          }
                        }}
                        aria-describedby={`token-rate-${tier.id}`}
                      />
                    </div>
                    <div className="space-y-2 mt-2">
                      {tier.tokenRate && (
                        <p 
                          id={`token-rate-${tier.id}`}
                          className="text-slate-500 text-xs"
                          style={{
                            fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          }}
                        >
                          {tier.tokenRate}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Features */}
                <div className="flex-1 space-y-3">
                  <h4 
                    className="text-sm font-semibold text-slate-900 uppercase tracking-wide"
                    style={{
                      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    }}
                  >
                    What&apos;s Included
                  </h4>
                  <ul className="space-y-2">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span 
                          className="text-slate-600 text-sm"
                          style={{
                            fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          }}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Button */}
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                      tier.popular
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
                        : "bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900"
                    }`}
                    style={{
                      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    }}
                  >
                    {tier.id === "custom" ? "Choose Amount" : "Begin"}
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        :root {
          --contact-font: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
      `}</style>
    </section>
  );
};

export default Pricing;
