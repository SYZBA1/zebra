import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Loader2, Check, X, Download, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

type Row = {
  id: string;
  title: string;
  description: string;
  sector: string;
  category: string;
  price_cents: number | null;
  is_premium: boolean;
  created_at: string;
  review_status: string;
  review_ready_at: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  submission_file_name: string | null;
  submission_file_path: string | null;
  owner_name: string;
};

const isMissingColumnError = (err: any) => {
  const msg = String(err?.message || "");
  return (
    (msg.includes("Could not find") && msg.includes("column") && msg.includes("schema cache")) ||
    (msg.includes("column") && msg.includes("does not exist"))
  );
};

const getMissingColumnName = (err: any) => {
  const msg = String(err?.message || "");
  const schemaCacheMatch = msg.match(/'([^']+)' column/);
  if (schemaCacheMatch?.[1]) return schemaCacheMatch[1];

  const pgMatch = msg.match(/column\s+([a-zA-Z0-9_."]+)\s+does not exist/i);
  if (!pgMatch?.[1]) return null;

  const raw = pgMatch[1].replace(/"/g, "");
  const parts = raw.split(".");
  return parts[parts.length - 1] || null;
};

export default function AdminMarketplace() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ title: "", description: "", sector: "", category: "Service", price_cents: 0, is_premium: false });

  const promoteReadyForAdmin = async () => {
    const nowIso = new Date().toISOString();
    const { error } = await supabase
      .from("marketplace_templates")
      .update({ review_status: "pending_admin" })
      .eq("review_status", "under_review")
      .lte("review_ready_at", nowIso);
    if (error && !isMissingColumnError(error)) {
      throw error;
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      await promoteReadyForAdmin();
    } catch (err: any) {
      toast.error(err.message || "Could not update review queue.");
    }

    const { data, error } = await supabase
      .from("marketplace_templates")
      .select("id,title,description,sector,category,price_cents,is_premium,created_at,review_status,review_ready_at,reviewed_at,review_note,submission_file_name,submission_file_path,owner_name")
      .order("created_at", { ascending: false });

    if (error && isMissingColumnError(error)) {
      const cols = [
        "id",
        "title",
        "description",
        "sector",
        "category",
        "price_cents",
        "is_premium",
        "is_verified",
        "owner_type",
        "created_at",
        "owner_name",
      ];

      let fallbackData: any[] | null = null;
      let fallbackError: any = null;

      for (let i = 0; i < cols.length + 2; i++) {
        const { data: d, error: e } = await supabase
          .from("marketplace_templates")
          .select(cols.join(","))
          .order("created_at", { ascending: false });

        if (!e) {
          fallbackData = d || [];
          fallbackError = null;
          break;
        }

        if (!isMissingColumnError(e)) {
          fallbackError = e;
          break;
        }

        const missing = getMissingColumnName(e);
        if (!missing || !cols.includes(missing)) {
          fallbackError = e;
          break;
        }

        cols.splice(cols.indexOf(missing), 1);
        fallbackError = e;
      }

      if (fallbackError) {
        toast.error(fallbackError.message);
        setRows([]);
      } else {
        const mapped = (fallbackData || []).map((row: any) => ({
          ...row,
          review_status: row?.is_verified ? "approved" : (row?.owner_type === "expert" ? "pending_admin" : "approved"),
          review_ready_at: null,
          reviewed_at: null,
          review_note: null,
          submission_file_name: null,
          submission_file_path: null,
          owner_name: row?.owner_name || "Expert",
        }));
        setRows(mapped as Row[]);
      }
    } else if (error) {
      toast.error(error.message);
      setRows([]);
    } else {
      setRows((data || []) as Row[]);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.title || !form.sector) { toast.error("Title and sector required"); return; }
    const { error } = await supabase.from("marketplace_templates").insert({
      ...form,
      is_premium: form.price_cents > 0,
      contents: {},
      custom_titles: {},
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Template added");
    setOpen(false);
    setForm({ title: "", description: "", sector: "", category: "Service", price_cents: 0, is_premium: false });
    load();
  };

  const review = async (row: Row, status: "approved" | "rejected") => {
    setBusyId(row.id);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const reviewerId = userRes.user?.id || null;
      const payload: Record<string, any> = {
        review_status: status,
        reviewed_at: new Date().toISOString(),
        reviewed_by_user_id: reviewerId,
        review_note: notes[row.id] || null,
        is_verified: status === "approved",
      };

      let updateError: any = null;
      for (let i = 0; i < Object.keys(payload).length + 2; i++) {
        const { error } = await supabase
          .from("marketplace_templates")
          .update(payload)
          .eq("id", row.id);
        if (!error) {
          updateError = null;
          break;
        }
        if (!isMissingColumnError(error)) {
          updateError = error;
          break;
        }
        const missing = getMissingColumnName(error);
        if (!missing || !(missing in payload)) {
          updateError = error;
          break;
        }
        delete payload[missing];
        updateError = error;
      }

      if (updateError) throw updateError;
      toast.success(status === "approved" ? "Submission approved and now public." : "Submission rejected.");
      await load();
    } catch (err: any) {
      toast.error(err.message || "Could not update submission status.");
    } finally {
      setBusyId(null);
    }
  };

  const openSubmission = async (row: Row) => {
    if (!row.submission_file_path) return;
    const { data, error } = await supabase.storage
      .from("marketplace-submissions")
      .createSignedUrl(row.submission_file_path, 120);

    if (error || !data?.signedUrl) {
      toast.error(error?.message || "Could not open file.");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    const { error } = await supabase.from("marketplace_templates").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    load();
  };

  const queue = rows.filter((r) => r.review_status === "pending_admin" || r.review_status === "rejected");
  const catalog = rows.filter((r) => r.review_status === "approved" || !r.review_status);
  const underHoldCount = rows.filter((r) => r.review_status === "under_review").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Queue: {queue.filter((r) => r.review_status === "pending_admin").length}</Badge>
          <Badge variant="outline">Under Hold: {underHoldCount}</Badge>
          <Badge variant="default">Public: {catalog.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={load}>
            <RefreshCcw className="h-4 w-4 mr-2" />Refresh
          </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Template</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Marketplace Template</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Sector</Label><Input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} /></div>
                <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              </div>
              <div><Label>Price (cents, 0 = free)</Label><Input type="number" value={form.price_cents} onChange={(e) => setForm({ ...form, price_cents: Number(e.target.value) })} /></div>
              <Button onClick={create} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="space-y-3">
            <h3 className="font-display text-lg font-bold">Expert Submission Review Queue</h3>
            {queue.length === 0 && <p className="text-sm text-muted-foreground">No submissions waiting for review.</p>}
            {queue.map((t) => {
              const readyInMs = t.review_ready_at ? new Date(t.review_ready_at).getTime() - Date.now() : 0;
              const ready = t.review_status !== "under_review" || readyInMs <= 0;
              const mins = Math.max(0, Math.ceil(readyInMs / 60000));
              const holdText = ready ? "Ready for admin review" : `${Math.floor(mins / 60)}h ${mins % 60}m remaining`;

              return (
                <Card key={t.id} className="hover:border-primary/40 transition-colors">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold truncate">{t.title}</h4>
                        <p className="text-xs text-muted-foreground font-mono">{t.owner_name} · {t.sector}</p>
                      </div>
                      <Badge variant={t.review_status === "approved" ? "default" : t.review_status === "rejected" ? "destructive" : "secondary"}>
                        {t.review_status === "under_review" ? "Under Review" : t.review_status === "pending_admin" ? "Pending Admin" : "Rejected"}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>
                    <p className="text-xs text-muted-foreground">Hold timer: {holdText}</p>

                    {t.submission_file_name && (
                      <Button size="sm" variant="outline" onClick={() => openSubmission(t)}>
                        <Download className="h-3.5 w-3.5 mr-1" />Open Uploaded File
                      </Button>
                    )}

                    <div>
                      <Label className="text-xs">Review Note (optional)</Label>
                      <Textarea
                        rows={2}
                        value={notes[t.id] ?? t.review_note ?? ""}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [t.id]: e.target.value }))}
                        placeholder="Add decision note for expert..."
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!ready || busyId === t.id}
                        onClick={() => review(t, "rejected")}
                      >
                        {busyId === t.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5 mr-1" />}
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        disabled={!ready || busyId === t.id}
                        onClick={() => review(t, "approved")}
                      >
                        {busyId === t.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-1" />}
                        Approve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 space-y-3">
            <h3 className="font-display text-lg font-bold">Public Marketplace Catalog</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catalog.map((t) => (
                <Card key={t.id} className="hover:border-primary/40 transition-colors">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold truncate">{t.title}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{t.sector}</p>
                      </div>
                      <Badge variant={t.is_premium ? "default" : "outline"}>{t.is_premium ? `${(t.price_cents / 100).toFixed(2)}` : "Free"}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                      <Button size="sm" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {catalog.length === 0 && <p className="col-span-full text-center text-muted-foreground py-12">No public templates yet.</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
