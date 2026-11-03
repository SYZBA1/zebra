import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Send, Sparkles, Target, BarChart3, MessageSquare, ShoppingBag, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const feedbackSchema = z.object({
  name: z.string().trim().max(100).optional(),
  email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

const Flyer = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = feedbackSchema.safeParse({ name, email, rating, comment });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Please give a rating");
      return;
    }
    setSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
      const response = await fetch(`${API_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, rating, comment }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? `HTTP ${response.status}`);
      toast.success("Thanks for your feedback! 🦓");
      setRating(0); setName(""); setEmail(""); setComment("");
    } catch (err) {
      console.error(err);
      toast.error("Could not send feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const features = [
    { icon: Sparkles, title: "AI Studio", desc: "Draft feasibility & business plans in minutes" },
    { icon: Target, title: "6-Pillar Diagnostic", desc: "Market, Ops, Finance, Legal, Risk, Strategy" },
    { icon: ShoppingBag, title: "Marketplace", desc: "Bank-ready blueprints by sector" },
    { icon: MessageSquare, title: "Live Chat + 1:1", desc: "AI assistant + real consultants" },
    { icon: BarChart3, title: "Bilingual", desc: "Full English & Amharic support" },
    { icon: FileText, title: "Export Ready", desc: "PDF & DOCX, NBE / CBE compliant" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container max-w-5xl">
          {/* Hero / Flyer */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 md:p-12 mb-12"
          >
            <div className="absolute inset-0 opacity-5 zebra-stripes pointer-events-none" />
            <div className="relative">
              <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-4">
                ZEBRA · Business Intelligence Engine
              </p>
              <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-4">
                Bank-ready business plans.<br />
                <span className="text-primary">Built for Ethiopia.</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mb-6">
                Feasibility studies, business plans, and growth strategies powered by AI —
                tailored for Telebirr, CBE, NBE rules, and 50+ Ethiopian sectors.
                English & Amharic. Free to start.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" onClick={() => navigate("/studio")}>Start Free</Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/marketplace")}>
                  Browse Templates
                </Button>
              </div>
            </div>
          </motion.section>

          {/* Features grid */}
          <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors"
              >
                <f.icon className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-display font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </section>

          {/* Feedback section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-primary/30 bg-card p-8 md:p-10"
          >
            <div className="flex items-start gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-mono text-xs tracking-widest uppercase text-primary">Visitors — we'd love your feedback</p>
                <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight mt-1">
                  Tell us what you think (under 30 seconds)
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Your feedback helps Zebra serve Ethiopian entrepreneurs better.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Stars */}
              <div>
                <label className="text-sm font-mono text-muted-foreground mb-2 block">Rating *</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHover(n)}
                      onMouseLeave={() => setHover(0)}
                      className="p-1 transition-transform hover:scale-110"
                      aria-label={`${n} stars`}
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          n <= (hover || rating) ? "fill-primary text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                />
                <Input
                  type="email"
                  placeholder="Your email (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                />
              </div>
              <Textarea
                placeholder="Quick comment (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                rows={3}
              />
              <Button type="submit" disabled={submitting || rating === 0} className="w-full sm:w-auto">
                <Send className="h-4 w-4 mr-2" />
                {submitting ? "Sending…" : "Send Feedback"}
              </Button>
            </form>
          </motion.section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Flyer;
