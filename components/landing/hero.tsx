import Link from "next/link";
import Image from "next/image";
<<<<<<< HEAD
import { motion } from "framer-motion";

const Hero = () => {
  const features = [
    {
      icon: "🎬",
      title: "Video Creation",
      description: "Generate scripts, storyboards, and complete video content"
    },
    {
      icon: "🎨",
      title: "Digital Art",
      description: "Create stunning artwork, illustrations, and concept designs"
    },
    {
      icon: "🎵",
      title: "Music Production",
      description: "Compose original music, beats, and soundtracks"
    },
    {
      icon: "📝",
      title: "Content Writing",
      description: "Craft engaging copy, blogs, and social media content"
    }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Unleash Your
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Creative Genius
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              The world's most advanced AI platform for creators. Transform your ideas into 
              <span className="text-purple-400 font-semibold"> professional content</span> in seconds.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link
              href="/dashboard"
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
            >
              <span className="relative z-10">Start Creating Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 border-2 border-slate-600 text-slate-300 font-semibold rounded-2xl hover:border-purple-500 hover:text-purple-400 transition-all duration-300"
            >
              See How It Works
            </Link>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="group relative p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-16 pt-8 border-t border-slate-700"
          >
            <p className="text-slate-400 text-sm mb-4">Trusted by creators worldwide</p>
            <div className="flex justify-center items-center gap-8 opacity-60">
              <div className="text-slate-500 text-sm">✓ No credit card required</div>
              <div className="text-slate-500 text-sm">✓ Free tier available</div>
              <div className="text-slate-500 text-sm">✓ 24/7 support</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 w-4 h-4 bg-purple-400 rounded-full animate-bounce"></div>
      <div className="absolute top-3/4 right-20 w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-1000"></div>
      <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-500"></div>
=======

const Hero = () => {
  const timeline = [
    {
      name: "Sign in",
      description:
        "Access your Creator Studio account quickly and securely. Start bringing your creative visions to life.",
      date: "1",
      dateTime: "2021-08",
    },
    {
      name: "Choose your creative profession",
      description:
        "Select from Video Creator, Digital Artist, Musician, or Content Creator to access specialized tools.",
      date: "2",
      dateTime: "2021-12",
    },
    {
      name: "Describe your creative vision",
      description:
        "Tell us what you want to create - whether it's a video script, concept art, song lyrics, or social media content.",
      date: "3",
      dateTime: "2022-02",
    },
    {
      name: "Generate professional creative content instantly",
      description:
        "From video scripts to album covers, animations to social graphics - create professional content in seconds.",
      date: "4",
      dateTime: "2022-12",
    },
  ];
  return (
    <section id="home" className="feature-one animate__flip pb-16 bg-slate-900">
      <div className="mx-auto px-2 sm:px-4">
        <div className="feature-one__color-overly-1 flaot-bob-y top-[-150px]"></div>
        <div className="feature-one__inner">
          <h2 className="feature-one__title font-semibold">
            AI-Powered Platform for <br />
            <p className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 inline">
              Creative Professionals
            </p>
          </h2>
          <div className="flex justify-center mb-12">
            <p className="max-w-4xl">
              Neuvisia is your creative AI assistant — a powerful platform
              designed specifically for video creators, digital artists,
              musicians, and content creators. Transform concepts into stunning
              videos, artwork, music, and content with specialized tools for
              your creative profession.
            </p>
          </div>
          <div className="feature-one__btn-box">
            <Link
              href="/dashboard"
              className="thm-btn feature-one__btn bg-slate-800 border border-slate-800 text-white transition duration-200"
            >
              <i className="fal fa-plus"></i> Access Creator Studio
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-16 max-w-7xl px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0 text-white flex justify-center">
          Elevate your creative process in four simple steps
        </h1>
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 overflow-hidden lg:mx-0 lg:max-w-none lg:grid-cols-4 mt-6">
          {timeline.map((item) => (
            <div key={item.name}>
              <time
                dateTime={item.dateTime}
                className="flex items-center text-sm font-semibold leading-6 text-white-300/10"
              >
                <svg
                  viewBox="0 0 4 4"
                  className="mr-4 h-1 w-1 flex-none"
                  aria-hidden="true"
                >
                  <circle cx={2} cy={2} r={2} fill="#db2777" />
                </svg>
                {item.date}
                <div
                  className="absolute -ml-2 h-px w-screen -translate-x-full bg-pink-600 sm:-ml-4 lg:static lg:-mr-6 lg:ml-8 lg:w-auto lg:flex-auto lg:translate-x-0"
                  aria-hidden="true"
                />
              </time>
              <p className="mt-6 text-lg font-semibold leading-8 tracking-tight text-white-300/10">
                {item.name}
              </p>
              <p className="mt-1 text-base leading-7 text-white-300/10">
                {item.description}
              </p>
            </div>
          ))}
          <div className="feature-one__color-overly-2 float-bob-x top-[50px] right-[30px]"></div>
        </div>
      </div>
      <div className="feature-one__color-overly-3 img-bounce absolute top-[300px] left-[250px]"></div>
>>>>>>> a45294d20afb85227c67fa96878e37eab6509ebb
    </section>
  );
};

export default Hero;
