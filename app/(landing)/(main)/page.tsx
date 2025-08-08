import Hero from "@/components/landing/hero";
import HowItWorks from "@/components/landing/slider";
import Solutions from "@/components/landing/solutions";
import Testimonials from "@/components/landing/testimonials";
import FAQ from "@/components/landing/faq";
import Contact from "@/components/landing/contact";

const LandingPage = () => {
  return (
    <div className="bg-slate-900">
      <div className="pt-20">
        <Hero />
      </div>
      <HowItWorks />
      <Solutions />
      <Testimonials />
      <FAQ />
      <Contact />
    </div>
  );
};

export default LandingPage;
