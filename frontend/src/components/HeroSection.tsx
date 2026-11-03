import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import zebraHero from "@/assets/zebra-hero.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={zebraHero}
          alt="Zebra crossing pattern"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
      </div>

      <div className="container relative z-10 py-24">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-mono text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6">
              Digital Studio for Ethiopia
            </p>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-8xl lg:text-9xl font-display font-bold tracking-tighter leading-[0.85] mb-8 text-foreground"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            ZEBRA
          </motion.h1>

          <motion.div
            className="w-24 h-1 bg-foreground mb-8"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ transformOrigin: "left" }}
          />

          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Architect, structure, and draft comprehensive feasibility studies 
            and business plans tailored for the Ethiopian market. AI-powered. 
            Bank-ready.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Button size="lg" className="group text-lg px-8 py-6" onClick={() => navigate("/phase1")}>
              Start Architecting
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-foreground/20 text-foreground hover:bg-foreground/10" onClick={() => navigate("/marketplace")}>
              Explore Marketplace
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Decorative stripe */}
      <div className="absolute bottom-0 left-0 right-0 h-2 zebra-stripes" />
    </section>
  );
};

export default HeroSection;
