import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Purchase {
  id: string;
  user_id: string;
  template_id: string;
  amount_etb: number;
  payment_method: string;
  transaction_ref: string;
  status: string;
  admin_note: string | null;
  delivered_at: string | null;
  created_at: string;
  marketplace_templates?: { title: string };
}

export default function AdminPurchases() {
  const [rows, setRows] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("template_purchases")
      .select("*, marketplace_templates(title)")
      .order("created_at", { ascending: false });
    setRows((data as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("template_purchases").update({
      status,
      delivered_at: status === "approved" ? new Date().toISOString() : null,
    }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(status === "approved" ? "Approved & user notified" : "Marked as rejected");
    load();
  };

  const filtered = rows.filter(r => filter === "all" ? true : r.status === filter);

  const stats = {
    pending: rows.filter(r => r.status === "pending").length,
    approved: rows.filter(r => r.status === "approved").length,
    revenue: rows.filter(r => r.status === "approved").reduce((s, r) => s + Number(r.amount_etb), 0),
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground font-mono">Pending</p><p className="text-2xl font-display font-bold">{stats.pending}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground font-mono">Approved</p><p className="text-2xl font-display font-bold">{stats.approved}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground font-mono">Revenue (ETB)</p><p className="text-2xl font-display font-bold">{stats.revenue.toFixed(0)}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map(f => (
              <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="capitalize">{f}</Button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Template</TableHead><TableHead>Method</TableHead><TableHead>Tx Ref</TableHead>
                <TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-12">No purchases.</TableCell></TableRow>
                ) : filtered.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-sm">{p.marketplace_templates?.title || p.template_id.slice(0, 8)}</TableCell>
                    <TableCell><Badge variant="outline" className="uppercase text-[10px]">{p.payment_method}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{p.transaction_ref}</TableCell>
                    <TableCell className="font-mono">ETB {Number(p.amount_etb).toFixed(0)}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === "approved" ? "default" : p.status === "rejected" ? "destructive" : "secondary"} className="text-[10px]">
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      {p.status === "pending" && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => updateStatus(p.id, "approved")} title="Approve">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => updateStatus(p.id, "rejected")} title="Reject">
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
