import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, CheckCircle2, XCircle, Flag } from "lucide-react";
import { toast } from "sonner";

interface Booking {
  id: string;
  full_name: string;
  email: string;
  topic: string;
  description: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  amount_etb: number;
  payment_method: string;
  transaction_ref: string;
  status: string;
  created_at: string;
}

export default function ExpertBookings() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "completed" | "rejected">("all");

  const load = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    const { data } = await supabase
      .from("expert_bookings")
      .select("*")
      .eq("expert_user_id", session.user.id)
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

  return (
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
              <TableHead>Client</TableHead><TableHead>Topic</TableHead><TableHead>Date</TableHead>
              <TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-12">No bookings.</TableCell></TableRow>
              ) : filtered.map(b => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="font-medium text-sm">{b.full_name}</div>
                    <div className="text-xs text-muted-foreground">{b.email}</div>
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    <div className="font-medium text-sm truncate">{b.topic}</div>
                    {b.description && <div className="text-xs text-muted-foreground line-clamp-1">{b.description}</div>}
                  </TableCell>
                  <TableCell className="text-xs">
                    {b.preferred_date || "—"}<br />
                    <span className="text-muted-foreground">{b.preferred_time || ""}</span>
                  </TableCell>
                  <TableCell className="font-mono">ETB {Number(b.amount_etb).toFixed(0)}</TableCell>
                  <TableCell>
                    <Badge variant={b.status === "confirmed" || b.status === "completed" ? "default" : b.status === "rejected" ? "destructive" : "secondary"} className="text-[10px]">
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {(b.status === "pending" || b.status === "pending_approval") && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => update(b.id, "confirmed")} title="Accept">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => update(b.id, "rejected")} title="Reject">
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                      {b.status === "confirmed" && (
                        <Button size="sm" variant="ghost" onClick={() => update(b.id, "completed")} title="Mark complete">
                          <Flag className="h-4 w-4 text-primary" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
