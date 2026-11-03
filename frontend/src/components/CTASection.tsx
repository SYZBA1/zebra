import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import zebraHero from "@/assets/zebra-hero.jpg";

const STEPS = [
  {
    number: "①",
    title: "Answer 8 questions",
    body: "Tell ZI your sector, location, budget, and goal. No forms. No signup required to start.",
  },
  {
    number: "②",
    title: "Get an honest verdict",
    body: "🟢 Proceed · 🟡 Review first · 🔴 Reconsider — based on real Ethiopian sector data, not guesswork.",
  },
  {
    number: "③",
    title: "Take your next step",
    body: "Get your bank-ready document, book an expert, or explore your market. Everything in one place.",
  },
];

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-28 sm:py-36 relative overflow-hidden">
      {/* Background — zebra stripe image with dark overlay */}
      <div className="absolute inset-0">
        <img src={zebraHero} alt="" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-background/85 backdrop-blur-[2px]" />
      </div>

      <div className="container relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          {/* Eyebrow */}
          <p className="font-mono text-xs tracking-[0.35em] uppercase text-primary mb-5">
            Ready to begin?
          </p>

          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight text-foreground mb-5 leading-[1.08]">
            Don't Guess.<br className="hidden sm:block" /> Decide With Data.
          </h2>

          {/* Sub-headline */}
          <p className="text-base sm:text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            ZI — Zebra Intelligence asks you 8 questions and tells you exactly whether
            your business idea is viable, what it will cost, and what to do next.{" "}
            <span className="text-foreground font-medium">Free. In 30 seconds.</span>
          </p>

          {/* 3-step strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14 text-left">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.number}
                className="rounded-xl border border-border bg-card/55 backdrop-blur-sm p-5 space-y-3"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{s.number}</span>
                  <p className="text-sm font-semibold text-foreground">{s.title}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>

          {/* Social proof quote */}
          <blockquote className="text-sm italic text-muted-foreground mb-10 border-l-2 border-primary/50 pl-4 text-left max-w-xl mx-auto">
            "The only AI business advisor that understands the Ethiopian market — in English and Amharic."
          </blockquote>

          {/* Primary CTA */}
          <Button
            size="lg"
            className="group text-base px-10 py-6 shadow-lg shadow-primary/25 mb-4 w-full sm:w-auto"
            onClick={() => navigate("/phase1")}
          >
            Check If My Idea Is Viable — Free
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>

          {/* Secondary link */}
          <p className="text-sm text-muted-foreground mb-6">
            Already know what you need?{" "}
            <button
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
              onClick={() => navigate("/studio")}
            >
              Browse document tools
            </button>
          </p>

          {/* Trust line */}
          <p className="text-xs text-muted-foreground/70 tracking-wide">
            No account needed to start · Results in under 2 minutes · Powered by 50+ Ethiopian sector benchmarks
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
