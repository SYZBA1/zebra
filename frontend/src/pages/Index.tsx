import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import ExpertiseSection from "@/components/ExpertiseSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <div id="features">
          <FeaturesSection />
        </div>
        <div id="expertise">
          <ExpertiseSection />
        </div>
        <div id="marketplace">
          <CTASection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
