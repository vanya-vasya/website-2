"use client";

import { Mail, Clock, Lightbulb } from "lucide-react";

type ContactCard = {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  detail: string;
};

const contactCards: ContactCard[] = [
  {
    icon: Mail,
    title: "Email Support",
    subtitle: "For general questions and support",
    detail: "info@nerbixa.com",
  },
  {
    icon: Clock,
    title: "Response Time",
    subtitle: "We typically respond within 24 hours",
    detail: "",
  },
  {
    icon: Lightbulb,
    title: "Feedback & Ideas",
    subtitle: "Have an idea for a new feature? We\u2019re all ears",
    detail: "",
  },
];

const ContactPage = () => (
  <div
    className="min-h-screen bg-white"
    style={{
      fontFamily:
        'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }}
  >
    {/* Hero */}
    <section className="bg-white pt-16 pb-12 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1
          className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
          style={{ lineHeight: 1.15, letterSpacing: "-0.02em" }}
        >
          Get in touch
        </h1>
        <p className="text-lg text-gray-500 font-medium">
          Have a question or feedback?
        </p>
        <p className="text-base text-gray-400 mt-2">
          We would love to hear from you
        </p>
      </div>
    </section>

    {/* Contact Section */}
    <section className="pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 sm:px-10 py-10">
          <h2
            className="text-xl font-bold text-gray-900 mb-2"
            style={{ letterSpacing: "-0.01em" }}
          >
            Contact Information
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Get in touch with our team. We&apos;re here to help with your
            creative journey.
          </p>

          <div className="flex flex-col gap-6">
            {contactCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="flex items-start gap-4 p-5 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                    <Icon className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-0.5">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-500">{card.subtitle}</p>
                    {card.detail && (
                      <a
                        href={`mailto:${card.detail}`}
                        className="inline-block mt-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 focus:outline-none focus:underline"
                        tabIndex={0}
                        aria-label={`Send email to ${card.detail}`}
                      >
                        {card.detail}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default ContactPage;
