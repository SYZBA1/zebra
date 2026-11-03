import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import zebraLogo from "@/assets/zebra-logo.png";

const About = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16">
      <div className="container max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="font-mono text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">About Us</p>
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-8">
            Building Ethiopia's Business Future
          </h1>
        </motion.div>

        <motion.div className="space-y-8 text-muted-foreground leading-relaxed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="flex justify-center my-8">
            <img src={zebraLogo} alt="Zebra Business Path" className="h-24 object-contain" />
          </div>

          <p className="text-lg">
            Zebra Business Path is Ethiopia's premier AI-powered platform for creating professional feasibility studies 
            and business plans. We combine deep knowledge of the Ethiopian market with cutting-edge AI technology to 
            help entrepreneurs, investors, and organizations bring their visions to life.
          </p>

          <div className="border border-border p-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-3">Our Mission</h2>
            <p>To democratize professional business planning in Ethiopia by providing intelligent tools that make 
            feasibility studies and business plans accessible to everyone—from first-time entrepreneurs to established corporations.</p>
          </div>

          <div className="border border-border p-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-3">Our Vision</h2>
            <p>To become the leading business intelligence platform in East Africa, empowering millions of entrepreneurs 
            with data-driven insights and professional documentation tools.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "Projects Created", value: "2,500+" },
              { label: "Sectors Covered", value: "20+" },
              { label: "Success Rate", value: "94%" },
            ].map((stat) => (
              <div key={stat.label} className="border border-border p-5 text-center">
                <p className="text-3xl font-display font-bold text-primary">{stat.value}</p>
                <p className="text-xs font-mono uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="border border-border p-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-3">Our Team</h2>
            <p>We are a team of business consultants, software engineers, and AI specialists based in Addis Ababa, Ethiopia. 
            Our combined expertise in Ethiopian business regulations, market dynamics, and technology enables us to build 
            tools that truly serve the local market.</p>
          </div>
        </motion.div>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;
