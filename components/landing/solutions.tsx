import { motion } from "framer-motion";
import Link from "next/link";

const Solutions = () => {
  const solutions = [
    {
      icon: "🎬",
      title: "Video Creators",
      subtitle: "Cinematic Excellence",
      description: "Generate professional video scripts, storyboards, and complete video content. From YouTube videos to cinematic productions.",
      features: ["Script Generation", "Storyboard Creation", "Video Editing", "Voiceover Production"],
      color: "from-purple-600 to-pink-600",
      bgColor: "from-purple-500/10 to-pink-500/10"
    },
    {
      icon: "🎨",
      title: "Digital Artists",
      subtitle: "Visual Masterpieces",
      description: "Create stunning artwork, illustrations, and concept designs. Transform your ideas into breathtaking visual content.",
      features: ["Concept Art", "Illustration", "Character Design", "Background Art"],
      color: "from-blue-600 to-cyan-600",
      bgColor: "from-blue-500/10 to-cyan-500/10"
    },
    {
      icon: "🎵",
      title: "Musicians",
      subtitle: "Sonic Innovation",
      description: "Compose original music, beats, and soundtracks. From background music to full compositions.",
      features: ["Music Composition", "Beat Generation", "Soundtrack Creation", "Audio Mixing"],
      color: "from-green-600 to-emerald-600",
      bgColor: "from-green-500/10 to-emerald-500/10"
    },
    {
      icon: "📝",
      title: "Content Creators",
      subtitle: "Engaging Stories",
      description: "Craft compelling copy, blogs, and social media content. Connect with your audience through powerful storytelling.",
      features: ["Copywriting", "Blog Creation", "Social Media", "Content Strategy"],
      color: "from-orange-600 to-red-600",
      bgColor: "from-orange-500/10 to-red-500/10"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
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
            Built for Every Creator
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Whether you're a video creator, digital artist, musician, or content creator, 
            we have specialized tools designed specifically for your creative needs.
          </p>
        </motion.div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className={`relative p-8 bg-gradient-to-br ${solution.bgColor} backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-2`}>
                {/* Header */}
                <div className="flex items-start space-x-4 mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${solution.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}>
                    {solution.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{solution.title}</h3>
                    <p className={`text-sm font-medium bg-gradient-to-r ${solution.color} bg-clip-text text-transparent`}>
                      {solution.subtitle}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-300 mb-6 leading-relaxed">
                  {solution.description}
                </p>

                {/* Features */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {solution.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 bg-gradient-to-r ${solution.color} rounded-full`}></div>
                      <span className="text-sm text-slate-400">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href="/dashboard"
                  className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${solution.color} text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105`}
                >
                  Explore Tools
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                {/* Hover Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${solution.color} rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
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
          className="text-center"
        >
          <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Transform Your Creative Process?
            </h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Join thousands of creators who are already using Neuvisia to bring their ideas to life. 
              Start creating professional content in minutes, not hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25"
              >
                Start Creating Now
              </Link>
              <Link
                href="#testimonials"
                className="px-8 py-4 border-2 border-slate-600 text-slate-300 font-semibold rounded-xl hover:border-purple-500 hover:text-purple-400 transition-all duration-300"
              >
                See Success Stories
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Solutions;
