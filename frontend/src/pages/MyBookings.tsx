import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Calendar, X } from "lucide-react";
import { toast } from "sonner";

interface Booking {
  id: string;
  topic: string;
  description: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  amount_etb: number;
  payment_method: string;
  transaction_ref: string;
  status: string;
  created_at: string;
  experts?: { name: string; title: string; industry: string } | null;
}

const statusVariant = (s: string) =>
  s === "confirmed" || s === "completed" ? "default" : s === "rejected" ? "destructive" : "secondary";

export default function MyBookings() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "completed" | "rejected">("all");

  const load = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }
    const { data, error } = await supabase
      .from("expert_bookings")
      .select("*, experts(name, title, industry)")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const cancel = async (id: string) => {
    const { error } = await supabase.from("expert_bookings").update({ status: "cancelled" }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Booking cancelled");
    load();
  };

  const filtered = rows.filter(r => {
    if (filter === "all") return true;
    if (filter === "pending") return r.status === "pending" || r.status === "pending_approval";
    return r.status === filter;
  });

  const stats = {
    total: rows.length,
    pending: rows.filter(r => r.status === "pending" || r.status === "pending_approval").length,
    confirmed: rows.filter(r => r.status === "confirmed").length,
    spent: rows.filter(r => r.status === "confirmed" || r.status === "completed").reduce((s, r) => s + Number(r.amount_etb), 0),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24 max-w-6xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">My Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your expert sessions and track payment status.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-3 mb-6">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground font-mono">Total</p><p className="text-2xl font-display font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground font-mono">Pending</p><p className="text-2xl font-display font-bold">{stats.pending}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground font-mono">Confirmed</p><p className="text-2xl font-display font-bold">{stats.confirmed}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground font-mono">Spent (ETB)</p><p className="text-2xl font-display font-bold">{stats.spent.toFixed(0)}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-2 flex-wrap">
                {(["all", "pending", "confirmed", "completed", "rejected"] as const).map(f => (
                  <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="capitalize">{f}</Button>
                ))}
              </div>
              <Button size="sm" onClick={() => navigate("/expertise")}>
                <Calendar className="h-4 w-4 mr-2" /> Book new expert
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-muted-foreground py-12 text-sm">
                No bookings yet. <button onClick={() => navigate("/expertise")} className="text-primary underline">Browse experts</button>
              </div>
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Expert</TableHead><TableHead>Topic</TableHead><TableHead>Date</TableHead>
                  <TableHead>Tx Ref</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map(b => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{b.experts?.name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{b.experts?.industry}</div>
                      </TableCell>
                      <TableCell className="max-w-[240px]">
                        <div className="font-medium text-sm truncate">{b.topic}</div>
                        {b.description && <div className="text-xs text-muted-foreground line-clamp-1">{b.description}</div>}
                      </TableCell>
                      <TableCell className="text-xs">
                        {b.preferred_date || "—"}<br />
                        <span className="text-muted-foreground">{b.preferred_time || ""}</span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{b.transaction_ref}</TableCell>
                      <TableCell className="font-mono">ETB {Number(b.amount_etb).toFixed(0)}</TableCell>
                      <TableCell><Badge variant={statusVariant(b.status)} className="text-[10px]">{b.status}</Badge></TableCell>
                      <TableCell>
                        {(b.status === "pending" || b.status === "pending_approval") && (
                          <Button size="sm" variant="ghost" onClick={() => cancel(b.id)} title="Cancel">
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
