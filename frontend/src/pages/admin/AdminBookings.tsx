import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Booking {
  id: string;
  full_name: string;
  email: string;
  topic: string;
  amount_etb: number;
  payment_method: string;
  transaction_ref: string;
  status: string;
  created_at: string;
  expert_user_id: string | null;
  experts?: { name: string; industry: string };
}

export default function AdminBookings() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "rejected" | "completed">("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("expert_bookings")
      .select("*, experts(name, industry)")
      .order("created_at", { ascending: false });
    setRows((data as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const update = async (id: string, status: string) => {
    const { error } = await supabase.from("expert_bookings").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Marked ${status}`);
    load();
  };

  const filtered = rows.filter(r => {
    if (filter === "all") return true;
    if (filter === "pending") return r.status === "pending" || r.status === "pending_approval";
    return r.status === filter;
  });

  const stats = {
    pending: rows.filter(r => r.status === "pending" || r.status === "pending_approval").length,
    confirmed: rows.filter(r => r.status === "confirmed" || r.status === "completed").length,
    revenue: rows.filter(r => r.status === "confirmed" || r.status === "completed").reduce((s, r) => s + Number(r.amount_etb), 0),
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground font-mono">Pending</p><p className="text-2xl font-display font-bold">{stats.pending}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground font-mono">Confirmed</p><p className="text-2xl font-display font-bold">{stats.confirmed}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground font-mono">Revenue (ETB)</p><p className="text-2xl font-display font-bold">{stats.revenue.toFixed(0)}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {(["all", "pending", "confirmed", "completed", "rejected"] as const).map(f => (
              <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="capitalize">{f}</Button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Client</TableHead><TableHead>Expert</TableHead><TableHead>Topic</TableHead>
                <TableHead>Method</TableHead><TableHead>Tx Ref</TableHead><TableHead>Amount</TableHead>
                <TableHead>Status</TableHead><TableHead></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-12">No bookings.</TableCell></TableRow>
                ) : filtered.map(b => (
                  <TableRow key={b.id}>
                    <TableCell><div className="font-medium text-sm">{b.full_name}</div><div className="text-xs text-muted-foreground">{b.email}</div></TableCell>
                    <TableCell className="text-sm">{b.experts?.name || "—"}</TableCell>
                    <TableCell className="max-w-[220px] truncate text-sm">{b.topic}</TableCell>
                    <TableCell><Badge variant="outline" className="uppercase text-[10px]">{b.payment_method}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{b.transaction_ref}</TableCell>
                    <TableCell className="font-mono">ETB {Number(b.amount_etb).toFixed(0)}</TableCell>
                    <TableCell>
                      <Badge variant={b.status === "confirmed" || b.status === "completed" ? "default" : b.status === "rejected" ? "destructive" : "secondary"} className="text-[10px]">
                        {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(b.status === "pending" || b.status === "pending_approval") && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => update(b.id, "confirmed")} title="Confirm">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => update(b.id, "rejected")} title="Reject">
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
