import Hero from "@/components/landing/hero";
<<<<<<< HEAD
import HowItWorks from "@/components/landing/slider";
=======
import Slider from "@/components/landing/slider";
>>>>>>> a45294d20afb85227c67fa96878e37eab6509ebb
import Solutions from "@/components/landing/solutions";
import Testimonials from "@/components/landing/testimonials";
import FAQ from "@/components/landing/faq";
import Contact from "@/components/landing/contact";

const LandingPage = () => {
  return (
    <div className="bg-slate-900">
<<<<<<< HEAD
      <div className="pt-20">
        <Hero />
      </div>
      <HowItWorks />
      <Solutions />
      <Testimonials />
      <FAQ />
=======
      <Hero />
      <Slider />
      <FAQ />
      <Solutions />
      <Testimonials />
>>>>>>> a45294d20afb85227c67fa96878e37eab6509ebb
      <Contact />
    </div>
  );
};

export default LandingPage;
