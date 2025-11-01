import Hero from "@/components/landing/hero";
import Slider from "@/components/landing/slider";
import Solutions from "@/components/landing/solutions";
import Testimonials from "@/components/landing/testimonials";
import Contact from "@/components/landing/contact";

const LandingPage = () => {
  return (
    <div className="bg-slate-50">
      <Hero />
      <Contact />
      <Solutions />
      <Slider />
      <Testimonials />
    </div>
  );
};

export default LandingPage;
