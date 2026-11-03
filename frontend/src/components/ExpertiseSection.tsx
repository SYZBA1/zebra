import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search, ArrowRight, BadgeCheck, TrendingUp, Building2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ExpertCard from "@/components/expertise/ExpertCard";
import { supabase } from "@/integrations/supabase/client";

const valueProps = [
  { icon: TrendingUp, title: "Guaranteed ROI", text: "Data-driven insights to hit your revenue targets — built for 100,000 ETB+ monthly profit goals." },
  { icon: Building2, title: "B2B Approval Flows", text: "Reports formatted for bank and investor approval, aligned with dual-approval payment logic." },
  { icon: Layers, title: "Industry Breadth", text: "Coverage across all 50 Ethiopian business sectors in our project scope." },
];

const ExpertiseSection = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [verifiedExperts, setVerifiedExperts] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("experts")
        .select("*")
        .eq("verified", true)
        .order("rating", { ascending: false })
        .limit(3);
      setVerifiedExperts(data || []);
      setLoaded(true);
    };
    load();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/expertise${query ? `?q=${encodeURIComponent(query)}` : ""}`);
  };

  // Rule 2: if no verified experts registered by admin, hide the entire showcase section
  if (loaded && verifiedExperts.length === 0) {
    return (
      <section className="py-24 sm:py-32 bg-background">
        <div className="container">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BadgeCheck className="h-5 w-5 text-primary" />
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">For Professionals</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">Are you an Expert?</h3>
              <p className="text-muted-foreground max-w-xl">
                Join Zebra to access 100+ investment leads monthly and grow your consulting practice.
              </p>
            </div>
            <Button size="lg" onClick={() => navigate("/expert/login")}>
              Join as Expert <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="container">
        <motion.div
          className="max-w-3xl mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">Expertise</p>
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-foreground mb-6">
            Connect with Verified<br />Industry Experts
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Access a network of certified professionals ready to scale your business
            with data-backed feasibility studies and strategic consulting.
          </p>
        </motion.div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-12 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find an expert for your sector — e.g. Agro, SaaS, Mining…"
              className="pl-10 h-12"
            />
          </div>
          <Button type="submit" size="lg" className="h-12">
            Search Experts <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {/* Rule 2: Always exactly 3 experts, 1 row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {verifiedExperts.map((e) => (
            <ExpertCard
              key={e.id}
              expert={{
                id: e.id,
                name: e.name,
                title: e.title,
                industry: e.industry,
                bio: e.bio,
                rating: e.rating,
                appointments: e.appointments,
                priceEtb: e.price_etb,
                verified: e.verified,
                online: e.online,
                initials: e.initials,
                tags: e.tags || [],
              } as any}
              onBook={() => navigate("/expertise")}
              onPortfolio={() => navigate("/expertise")}
            />
          ))}
        </div>

        <div className="flex justify-center mb-20">
          <Button variant="outline" size="lg" onClick={() => navigate("/expertise")}>
            View All Experts <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {valueProps.map((v, i) => (
            <motion.div
              key={v.title}
              className="rounded-xl border border-border bg-card p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <v.icon className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BadgeCheck className="h-5 w-5 text-primary" />
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">For Professionals</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">Are you an Expert?</h3>
            <p className="text-muted-foreground max-w-xl">
              Join Zebra to access 100+ investment leads monthly and grow your consulting practice.
            </p>
          </div>
          <Button size="lg" onClick={() => navigate("/expert/login")}>
            Join as Expert <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ExpertiseSection;
