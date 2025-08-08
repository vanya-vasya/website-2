import Link from "next/link";
import Image from "next/image";

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
          <div className="mb-8">
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
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
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
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-slate-700">
            <p className="text-slate-400 text-sm mb-4">Trusted by creators worldwide</p>
            <div className="flex justify-center items-center gap-8 opacity-60">
              <div className="text-slate-500 text-sm">✓ No credit card required</div>
              <div className="text-slate-500 text-sm">✓ Free tier available</div>
              <div className="text-slate-500 text-sm">✓ 24/7 support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 w-4 h-4 bg-purple-400 rounded-full animate-bounce"></div>
      <div className="absolute top-3/4 right-20 w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-1000"></div>
      <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-500"></div>
    </section>
  );
};

export default Hero;
