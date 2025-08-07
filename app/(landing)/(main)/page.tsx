import Hero from "@/components/landing/hero";
import Slider from "@/components/landing/slider";
import Solutions from "@/components/landing/solutions";
import Testimonials from "@/components/landing/testimonials";
import FAQ from "@/components/landing/faq";
import Contact from "@/components/landing/contact";

const LandingPage = () => {
  return (
    <div className="bg-slate-900">
      <Hero />
      <Slider />
      <FAQ />
      <Solutions />
      <Testimonials />
      <Contact />
    </div>
  );
};

export default LandingPage;
