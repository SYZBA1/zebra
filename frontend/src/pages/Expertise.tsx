import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ExpertCard from "@/components/expertise/ExpertCard";
import BookExpertDialog, { type BookingExpert } from "@/components/expertise/BookExpertDialog";
import { experts as seedExperts, type Expert } from "@/lib/experts-data";
import { toast } from "sonner";

interface DBExpert {
  id: string;
  user_id: string | null;
  name: string;
  title: string;
  industry: string;
  bio: string;
  tags: string[];
  price_etb: number;
  years_experience: number;
  rating: number;
  appointments: number;
  approval_rate: number;
  offering: string;
  deliverable: string;
  verified: boolean;
  online: boolean;
  accent: string;
  initials: string;
}

// Adapt DB row to legacy Expert shape so ExpertCard works unchanged
const toCardExpert = (d: DBExpert): Expert => ({
  id: d.id, name: d.name, title: d.title, industry: d.industry, tags: d.tags || [],
  rating: Number(d.rating), appointments: d.appointments, approvalRate: d.approval_rate,
  yearsExperience: d.years_experience, priceETB: Number(d.price_etb),
  offering: d.offering || "Consulting Session", deliverable: d.deliverable || "Expert advice",
  bio: d.bio, online: d.online, verified: d.verified, initials: d.initials, accent: d.accent,
});

const Expertise = () => {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [industry, setIndustry] = useState("All");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [rows, setRows] = useState<DBExpert[]>([]);
  const [bookingExpert, setBookingExpert] = useState<BookingExpert | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.title = "Expertise · Verified Industry Experts | ZEBRA";
    (async () => {
      const { data } = await supabase.from("experts").select("*").order("rating", { ascending: false });
      setRows((data as any) || []);
    })();
  }, []);

  const allCard = useMemo(() => {
    if (rows.length) return rows.map(r => ({ card: toCardExpert(r), user_id: r.user_id, price_etb: Number(r.price_etb) }));
    return seedExperts.map(e => ({ card: e, user_id: null, price_etb: e.priceETB }));
  }, [rows]);

  const industries = useMemo(
    () => ["All", ...Array.from(new Set(allCard.map(e => e.card.industry)))],
    [allCard],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allCard.filter(({ card }) => {
      if (industry !== "All" && card.industry !== industry) return false;
      if (onlineOnly && !card.online) return false;
      if (!q) return true;
      return (
        card.name.toLowerCase().includes(q) ||
        card.title.toLowerCase().includes(q) ||
        card.industry.toLowerCase().includes(q) ||
        card.tags.some(t => t.toLowerCase().includes(q))
      );
    });
  }, [query, industry, onlineOnly, allCard]);

  const handleBook = (e: Expert) => {
    const match = allCard.find(x => x.card.id === e.id);
    setBookingExpert({
      id: e.id, user_id: match?.user_id ?? null,
      name: e.name, title: e.title, price_etb: match?.price_etb ?? e.priceETB,
    });
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <section className="container py-16 sm:py-20">
          <p className="font-mono text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">Expertise</p>
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-foreground mb-6 max-w-3xl">
            Verified Industry Experts for the Ethiopian Market
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mb-8">
            Browse vetted consultants across 50 Ethiopian business sectors. Book a live appointment,
            request a feasibility study, or commission a bank-ready business plan.
          </p>

          <div className="flex flex-col lg:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, sector, or skill…" className="pl-10 h-12" />
            </div>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)}
              className="h-12 px-4 rounded-md border border-input bg-background text-sm text-foreground">
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            <Button variant={onlineOnly ? "default" : "outline"} size="lg" className="h-12"
              onClick={() => setOnlineOnly(v => !v)}>
              {onlineOnly ? "Online Only ✓" : "Online Only"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Showing <span className="text-foreground font-semibold">{filtered.length}</span> of {allCard.length} experts
          </p>
        </section>

        <section className="container pb-24">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              No experts match your filters. Try widening your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(({ card }) => (
                <ExpertCard key={card.id} expert={card} onBook={handleBook}
                  onPortfolio={(ex) => toast.message(`${ex.name}'s portfolio`, { description: "Portfolio viewer coming soon." })} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
      <BookExpertDialog expert={bookingExpert} open={open} onOpenChange={setOpen} />
    </div>
  );
};

export default Expertise;
