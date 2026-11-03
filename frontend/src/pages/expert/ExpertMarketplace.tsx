import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, UploadCloud, FileText } from "lucide-react";

type DocType = "business_plan" | "feasibility" | "company_profile" | "org_structure" | "performance" | "business_health";

const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: "business_plan", label: "Business Plan" },
  { value: "feasibility", label: "Feasibility" },
  { value: "company_profile", label: "Company Profile" },
  { value: "org_structure", label: "Org Structure" },
  { value: "performance", label: "Performance" },
  { value: "business_health", label: "Business Health" },
];

type Submission = {
  id: string;
  title: string;
  sector: string;
  document_type: string;
  review_status: string;
  review_ready_at: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  submission_file_name: string | null;
  submission_file_path: string | null;
  created_at: string;
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

const statusLabel = (status: string) => {
  if (status === "under_review") return "Under Review (2h hold)";
  if (status === "pending_admin") return "Pending Admin";
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return status;
};

const statusVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
  if (status === "approved") return "default";
  if (status === "rejected") return "destructive";
  if (status === "pending_admin") return "secondary";
  return "outline";
};

function formatRemaining(reviewReadyAt: string | null) {
  if (!reviewReadyAt) return "--";
  const ms = new Date(reviewReadyAt).getTime() - Date.now();
  if (ms <= 0) return "Ready for admin review";
  const totalMinutes = Math.ceil(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m remaining`;
}

export default function ExpertMarketplace() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<Submission[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    sector: "",
    category: "Consulting",
    documentType: "business_plan" as DocType,
    summary: "",
    priceEtb: "0",
  });

  const load = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setRows([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("marketplace_templates")
      .select("id,title,sector,document_type,review_status,review_ready_at,reviewed_at,review_note,submission_file_name,submission_file_path,created_at")
      .eq("submitted_by_user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      if (isMissingColumnError(error)) {
        const fallback = await supabase
          .from("marketplace_templates")
          .select("id,title,sector,document_type,created_at")
          .eq("submitted_by_user_id", userId)
          .order("created_at", { ascending: false });

        if (fallback.error) {
          toast.error(fallback.error.message);
          setRows([]);
        } else {
          const mapped = (fallback.data || []).map((row: any) => ({
            ...row,
            review_status: "pending_admin",
            review_ready_at: null,
            reviewed_at: null,
            review_note: null,
            submission_file_name: null,
            submission_file_path: null,
          }));
          setRows(mapped as Submission[]);
        }
      } else {
        toast.error(error.message);
        setRows([]);
      }
    } else {
      setRows((data || []) as Submission[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setRows((prev) => [...prev]);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const pendingCount = useMemo(
    () => rows.filter((r) => r.review_status === "under_review" || r.review_status === "pending_admin").length,
    [rows]
  );

  const submit = async () => {
    if (!form.title || !form.description || !form.sector) {
      toast.error("Title, description, and sector are required.");
      return;
    }
    if (!file) {
      toast.error("Please attach the template file before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Please sign in again.");

      try {
        // ensure-marketplace-submissions-bucket is handled server-side
        // The storage bucket should be pre-configured in Supabase dashboard
      } catch {
        // continue regardless
      }

      let uploadedFilePath: string | null = null;
      let uploadedFileName: string | null = null;

      const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
      const objectPath = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const uploadRes = await supabase.storage
        .from("marketplace-submissions")
        .upload(objectPath, file, { upsert: false, contentType: file.type || "application/octet-stream" });

      if (uploadRes.error) {
        const msg = (uploadRes.error.message || "").toLowerCase();
        if (msg.includes("bucket") && msg.includes("not found")) {
          toast.warning("Storage bucket is missing, but your submission was saved for admin review.");
        } else {
          throw uploadRes.error;
        }
      } else {
        uploadedFilePath = objectPath;
        uploadedFileName = file.name;
      }

      const readyAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
      const ownerName =
        (user.user_metadata?.display_name as string | undefined) || user.email?.split("@")[0] || "Expert";

      const payload: Record<string, any> = {
        title: form.title,
        description: form.description,
        sector: form.sector,
        category: form.category,
        document_type: form.documentType,
        summary: form.summary || null,
        owner_name: ownerName,
        owner_type: "expert",
        is_premium: Number(form.priceEtb || "0") > 0,
        price_cents: Math.round(Number(form.priceEtb || "0") * 100),
        contents: {},
        custom_titles: {},
        submitted_by_user_id: user.id,
        submission_file_name: uploadedFileName,
        submission_file_path: uploadedFilePath,
        review_status: "under_review",
        review_ready_at: readyAt,
        is_verified: false,
      };

      let insertError: any = null;
      for (let i = 0; i < Object.keys(payload).length + 2; i++) {
        const { error } = await supabase.from("marketplace_templates").insert(payload as any);
        if (!error) {
          insertError = null;
          break;
        }
        if (!isMissingColumnError(error)) {
          insertError = error;
          break;
        }
        const missing = getMissingColumnName(error);
        if (!missing || !(missing in payload)) {
          insertError = error;
          break;
        }
        delete payload[missing];
        insertError = error;
      }

      if (insertError) throw insertError;

      setRows((prev) => [
        {
          id: crypto.randomUUID(),
          title: form.title,
          sector: form.sector,
          document_type: form.documentType,
          review_status: (payload.review_status as string | undefined) || "pending_admin",
          review_ready_at: (payload.review_ready_at as string | undefined) || null,
          reviewed_at: null,
          review_note: null,
          submission_file_name: uploadedFileName,
          submission_file_path: uploadedFilePath,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      toast.success(
        uploadedFilePath
          ? "Submission uploaded. It will stay under review for 2 hours, then move to admin review."
          : "Submission saved for review. File upload will be available after storage setup is completed."
      );
      setFile(null);
      setForm({
        title: "",
        description: "",
        sector: "",
        category: "Consulting",
        documentType: "business_plan",
        summary: "",
        priceEtb: "0",
      });
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Could not submit template.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-bold tracking-tight">Submit Marketplace File</h3>
              <p className="text-sm text-muted-foreground">
                Upload your document template. It is held for 2 hours, then routed to admins for final approval.
              </p>
            </div>
            <Badge variant="secondary">Pending: {pendingCount}</Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <Label>Sector</Label>
              <Input value={form.sector} onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))} placeholder="e.g. Agro, Manufacturing" />
            </div>
            <div>
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
            </div>
            <div>
              <Label>Price (ETB, 0 for free)</Label>
              <Input type="number" min={0} value={form.priceEtb} onChange={(e) => setForm((f) => ({ ...f, priceEtb: e.target.value }))} />
            </div>
            <div>
              <Label>Document Type</Label>
              <select
                value={form.documentType}
                onChange={(e) => setForm((f) => ({ ...f, documentType: e.target.value as DocType }))}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {DOC_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Template File</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md,.rtf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <p className="text-[11px] text-muted-foreground mt-1">Allowed: PDF, DOC, DOCX, TXT, MD, RTF</p>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              placeholder="Describe what this template helps businesses produce."
            />
          </div>
          <div>
            <Label>Summary (optional)</Label>
            <Textarea
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              rows={3}
              placeholder="Short summary shown in the marketplace card."
            />
          </div>

          <Button onClick={submit} disabled={submitting} className="w-full sm:w-auto">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UploadCloud className="h-4 w-4 mr-2" />}
            Submit For Review
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold tracking-tight">My Submissions</h3>
            <Button variant="outline" size="sm" onClick={load}>
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="py-10 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading submissions...
            </div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">No submissions yet.</p>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => (
                <div key={row.id} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{row.title}</p>
                      <p className="text-xs text-muted-foreground">{row.sector} · {row.document_type}</p>
                    </div>
                    <Badge variant={statusVariant(row.review_status)}>{statusLabel(row.review_status)}</Badge>
                  </div>

                  <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-4">
                    <span>Submitted: {new Date(row.created_at).toLocaleString()}</span>
                    <span>Hold timer: {formatRemaining(row.review_ready_at)}</span>
                    {row.reviewed_at && <span>Reviewed: {new Date(row.reviewed_at).toLocaleString()}</span>}
                  </div>

                  {row.review_note && (
                    <p className="text-sm bg-secondary/60 rounded-md p-3">
                      <span className="font-semibold">Admin note:</span> {row.review_note}
                    </p>
                  )}

                  {row.submission_file_name && (
                    <p className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> {row.submission_file_name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Review Flow</p>
          <ul className="space-y-1">
            <li>1. Upload and submit your file.</li>
            <li>2. System keeps it under review for 2 hours.</li>
            <li>3. It moves to admin queue for approval.</li>
            <li>4. After admin approves, it appears publicly in Marketplace.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
