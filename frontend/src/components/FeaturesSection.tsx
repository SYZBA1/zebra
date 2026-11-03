import { motion } from "framer-motion";
import { Brain, Map, ShoppingBag, BarChart3, Languages, FileText } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Z Architect AI",
    description:
      "Gemini-powered drafting engine trained as a world-class business consultant for the Ethiopian landscape.",
    tag: "INTELLIGENCE",
  },
  {
    icon: FileText,
    title: "Sector Blueprints",
    description:
      "Pre-configured structural frameworks for 20+ Ethiopian industries — from agriculture to IT.",
    tag: "FRAMEWORKS",
  },
  {
    icon: BarChart3,
    title: "Financial Modeling",
    description:
      "Built-in CAPEX/OPEX mapping, benefit-cost calculators, and ROI projections.",
    tag: "FINANCE",
  },
  {
    icon: Languages,
    title: "Dual-Language",
    description:
      "Seamlessly switch between English and Amharic for both interface and generated content.",
    tag: "BILINGUAL",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description:
      "Buy and sell pre-vetted Discovery Nodes. Monetize your sector expertise.",
    tag: "ECOSYSTEM",
  },
  {
    icon: Map,
    title: "Area Intelligence",
    description:
      "Location-aware generation considering demographics, infrastructure, and regional resources.",
    tag: "CONTEXTUAL",
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeaturesSection = () => {
  return (
    <section className="py-32 bg-card text-card-foreground">
      <div className="container">
        <div className="mb-20">
          <p className="font-mono text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Capabilities
          </p>
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight">
            Built for
            <br />
            precision.
          </h2>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              className="bg-card p-10 group hover:bg-secondary transition-colors duration-300"
              variants={item}
            >
              <div className="flex items-center justify-between mb-8">
                <feature.icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
                <span className="font-mono text-xs tracking-widest text-muted-foreground">
                  {feature.tag}
                </span>
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
