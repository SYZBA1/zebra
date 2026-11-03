import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Building2, CreditCard, Copy, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { MarketTemplate } from "./TemplatePreviewDialog";

interface Props {
  template: MarketTemplate;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}

type Method = "telebirr" | "cbe" | "stripe";

const ACCOUNTS: Record<Method, { label: string; account: string; icon: any; color: string }> = {
  telebirr: { label: "Telebirr", account: "+251935609090", icon: Smartphone, color: "from-orange-500 to-pink-500" },
  cbe: { label: "Commercial Bank of Ethiopia", account: "1000445798367", icon: Building2, color: "from-amber-600 to-yellow-500" },
  stripe: { label: "Stripe (International Card)", account: "Pay with card via Stripe", icon: CreditCard, color: "from-indigo-500 to-violet-600" },
};

export default function PremiumCheckoutDialog({ template, open, onOpenChange, onSuccess }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState<"method" | "pay" | "confirm" | "success">("method");
  const [method, setMethod] = useState<Method | null>(null);
  const [txRef, setTxRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [delivery, setDelivery] = useState<"download" | "studio">("download");

  const reset = () => {
    setStep("method"); setMethod(null); setTxRef(""); setDelivery("download");
  };

  const amount = (template.price_cents / 100).toFixed(0);
  const acct = method ? ACCOUNTS[method] : null;

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  const submitPayment = async () => {
    if (txRef.trim().length < 6) {
      toast.error("Please enter a valid Transaction ID");
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }

    setSubmitting(true);

    // Auto-validation rule (mock): >=8 alphanumeric chars and not all same char.
    const ref = txRef.trim().toUpperCase();
    const looksValid = /^[A-Z0-9]{8,}$/.test(ref) && !/^(.)\1+$/.test(ref);

    const { error } = await supabase.from("template_purchases").insert({
      user_id: session.user.id,
      template_id: template.id,
      amount_etb: Number(amount),
      payment_method: method!,
      transaction_ref: ref,
      status: looksValid ? "approved" : "pending",
      delivered_at: looksValid ? new Date().toISOString() : null,
    });

    setSubmitting(false);

    if (error) { toast.error(error.message); return; }

    if (looksValid) {
      // Notify user via in-app notification (best-effort)
      // Email delivery handled via admin or future edge function.
      setStep("success");
      toast.success("Payment confirmed!");
    } else {
      setStep("success");
      toast.info("Payment submitted. Awaiting admin validation — you'll be emailed once approved.");
    }
  };

  const finalize = async () => {
    const { parseTemplateDocument, buildContentsFromTemplate } = await import("@/lib/parse-template");
    const { data: fullDoc } = await (supabase.rpc as any)("get_template_full_document", { _template_id: template.id });
    const parsed = parseTemplateDocument((typeof fullDoc === "string" ? fullDoc : "") || "");

    if (delivery === "download") {
      const { exportPDF } = await import("@/lib/export-document");
      const fakeOutline = parsed.titles.map((title, i) => ({ id: String(i + 1), title, children: [] })) as any;
      const { contents } = buildContentsFromTemplate(parsed);
      exportPDF(template.title, fakeOutline, contents, {}, "en");
      onSuccess();
      reset();
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }
    const { contents, customTitles } = buildContentsFromTemplate(parsed);
    const docTypeMap: Record<string, string> = {
      feasibility: "feasibility", business_plan: "business-plan",
      company_profile: "org-structure", org_structure: "org-structure",
      performance: "performance-tracking", business_health: "business-health",
    };
    const { data, error } = await supabase.from("projects").insert({
      user_id: session.user.id,
      name: `${template.title} — My Copy`,
      sector: template.sector, type: "free", template_id: template.id,
      document_type: docTypeMap[template.document_type] || "feasibility",
      contents: contents as any, custom_titles: customTitles as any, language: "en",
    }).select("id").single();
    if (error || !data) { toast.error(error?.message || "Failed"); return; }
    onSuccess(); reset();
    navigate("/studio", { state: { resumeProjectId: data.id } });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-md">
        {step === "method" && (
          <>
            <DialogHeader>
              <DialogTitle>Choose Payment Method</DialogTitle>
              <DialogDescription>
                {template.title} — <span className="font-bold text-foreground">ETB {amount}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              {(Object.keys(ACCOUNTS) as Method[]).map((m) => {
                const A = ACCOUNTS[m];
                const Icon = A.icon;
                return (
                  <button
                    key={m}
                    onClick={() => { setMethod(m); setStep("pay"); }}
                    className="w-full flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-secondary transition-colors text-left"
                  >
                    <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${A.color} flex items-center justify-center shrink-0`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{A.label}</p>
                      <p className="text-xs text-muted-foreground">Pay ETB {amount}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === "pay" && acct && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px]">{acct.label}</Badge>
              </div>
              <DialogTitle>Send Payment to ZEBRA</DialogTitle>
              <DialogDescription>Transfer the amount, then continue to confirm.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="rounded-lg border border-border p-3 bg-secondary/40">
                <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Owner Name</Label>
                <p className="font-semibold">ZEBRA</p>
              </div>
              <div className="rounded-lg border border-border p-3 bg-secondary/40 flex items-center justify-between">
                <div>
                  <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {method === "telebirr" ? "Phone Number" : method === "stripe" ? "Method" : "Account Number"}
                  </Label>
                  <p className="font-mono font-semibold">{acct.account}</p>
                </div>
                {method !== "stripe" && (
                  <Button size="sm" variant="outline" onClick={() => copy(acct.account)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 flex items-center justify-between">
                <div>
                  <Label className="text-[10px] font-mono uppercase tracking-widest text-primary">Amount</Label>
                  <p className="font-display font-bold text-xl">ETB {amount}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => copy(amount)}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Transfer ETB {amount} to the above account, then paste the Transaction ID from your SMS / receipt below.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("method")} className="flex-1">Back</Button>
                <Button onClick={() => setStep("confirm")} className="flex-1">I have paid</Button>
              </div>
            </div>
          </>
        )}

        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Payment</DialogTitle>
              <DialogDescription>Paste the Transaction ID or Reference Number from your receipt.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="txref">Transaction ID</Label>
                <Input
                  id="txref"
                  placeholder="e.g. FT261241RH1Q"
                  value={txRef}
                  onChange={(e) => setTxRef(e.target.value)}
                  className="font-mono"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("pay")} className="flex-1" disabled={submitting}>Back</Button>
                <Button onClick={submitPayment} disabled={submitting} className="flex-1">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Payment"}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "success" && (
          <>
            <DialogHeader>
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-center">Payment Recorded</DialogTitle>
              <DialogDescription className="text-center">
                We'll email you the document and invoice once verified. Choose how you'd like to proceed:
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <button
                onClick={() => { setDelivery("download"); finalize(); }}
                className="w-full p-3 rounded-lg border border-border hover:border-primary text-left"
              >
                <p className="font-semibold text-sm">Download PDF now</p>
                <p className="text-xs text-muted-foreground">Get the printed document immediately.</p>
              </button>
              <button
                onClick={() => { setDelivery("studio"); finalize(); }}
                className="w-full p-3 rounded-lg border border-border hover:border-primary text-left"
              >
                <p className="font-semibold text-sm">Use in Studio</p>
                <p className="text-xs text-muted-foreground">Open in editor with the outline pre-loaded.</p>
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
