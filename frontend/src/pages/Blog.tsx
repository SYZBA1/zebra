import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";

const posts = [
  {
    title: "How to Write a Bank-Ready Feasibility Study in Ethiopia",
    excerpt: "Learn the essential components that Ethiopian banks look for when evaluating feasibility studies for loan approval.",
    date: "2026-02-28",
    category: "Guide",
  },
  {
    title: "Top 10 Growing Sectors for Investment in Ethiopia (2026)",
    excerpt: "Explore the most promising sectors for new business ventures in Ethiopia's rapidly evolving economy.",
    date: "2026-02-20",
    category: "Market Insight",
  },
  {
    title: "AI-Powered Business Planning: A Game Changer for Ethiopian Entrepreneurs",
    excerpt: "How artificial intelligence is transforming the way Ethiopian entrepreneurs create business plans and feasibility studies.",
    date: "2026-02-12",
    category: "Technology",
  },
  {
    title: "Understanding Ethiopian Business Regulations: A Complete Guide",
    excerpt: "Navigate the regulatory landscape with this comprehensive guide to business registration, permits, and compliance in Ethiopia.",
    date: "2026-01-30",
    category: "Regulation",
  },
  {
    title: "From Idea to Execution: The Feasibility Study Roadmap",
    excerpt: "A step-by-step guide to turning your business idea into a structured, professional feasibility study.",
    date: "2026-01-15",
    category: "Guide",
  },
];

const Blog = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16">
      <div className="container max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <p className="font-mono text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">Blog</p>
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-4">Insights & Guides</h1>
          <p className="text-muted-foreground text-lg">Expert guidance on business planning in the Ethiopian market.</p>
        </motion.div>

        <div className="space-y-6">
          {posts.map((post, i) => (
            <motion.article
              key={post.title}
              className="border border-border p-6 hover:bg-secondary/50 transition-colors cursor-pointer group"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-[10px] tracking-widest uppercase text-primary border border-primary/30 px-2 py-0.5">
                  {post.category}
                </span>
                <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <h2 className="font-display text-xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
              <span className="text-sm font-mono text-primary flex items-center gap-1">
                Read More <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </motion.article>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Blog;
