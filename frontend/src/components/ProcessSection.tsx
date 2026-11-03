import { motion } from "framer-motion";

const steps = [
  { number: "01", title: "Initialize", description: "Sign in and define your project's sector and location." },
  { number: "02", title: "Select Framework", description: "Choose a blank outline or purchase a marketplace blueprint." },
  { number: "03", title: "Architect", description: "Navigate nodes, use AI drafting, insert financial models and SWOT." },
  { number: "04", title: "Export", description: "Generate a bank-ready PDF or raw text for stakeholders." },
];

const ProcessSection = () => {
  return (
    <section className="py-32 bg-background">
      <div className="container">
        <div className="mb-20">
          <p className="font-mono text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Workflow
          </p>
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-foreground">
            Idea to document
            <br />
            in four steps.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="border-t-2 border-primary pt-8 pr-8 pb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <span className="font-mono text-5xl font-bold text-muted-foreground/20 block mb-4">
                {step.number}
              </span>
              <h3 className="text-xl font-display font-semibold mb-2 text-foreground">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
