import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Building2, CreditCard, Copy, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

export interface BookingExpert {
  id: string;
  user_id?: string | null;
  name: string;
  title: string;
  price_etb: number;
}

interface Props {
  expert: BookingExpert | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type Method = "telebirr" | "cbe" | "stripe";

const ACCOUNTS: Record<Method, { label: string; account: string; icon: any; color: string }> = {
  telebirr: { label: "Telebirr", account: "+251935609090", icon: Smartphone, color: "from-orange-500 to-pink-500" },
  cbe: { label: "Commercial Bank of Ethiopia", account: "1000445798367", icon: Building2, color: "from-amber-600 to-yellow-500" },
  stripe: { label: "Stripe (International Card)", account: "Pay with card via Stripe", icon: CreditCard, color: "from-indigo-500 to-violet-600" },
};

const detailsSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional(),
  topic: z.string().trim().min(2).max(150),
  description: z.string().trim().max(1000).optional(),
});

export default function BookExpertDialog({ expert, open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState<"details" | "method" | "pay" | "confirm" | "success">("details");
  const [method, setMethod] = useState<Method | null>(null);
  const [txRef, setTxRef] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [details, setDetails] = useState({
    full_name: "", email: "", phone: "", topic: "", description: "",
    preferred_date: "", preferred_time: "",
  });

  const reset = () => {
    setStep("details"); setMethod(null); setTxRef("");
    setDetails({ full_name: "", email: "", phone: "", topic: "", description: "", preferred_date: "", preferred_time: "" });
  };

  if (!expert) return null;
  const amount = Number(expert.price_etb).toFixed(0);
  const acct = method ? ACCOUNTS[method] : null;
  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied"); };

  const goPayment = () => {
    const parsed = detailsSchema.safeParse(details);
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid input"); return; }
    setStep("method");
  };

  const submitPayment = async () => {
    if (txRef.trim().length < 6) { toast.error("Enter a valid Transaction ID"); return; }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { onOpenChange(false); navigate("/auth"); return; }

    setSubmitting(true);
    const { error } = await supabase.from("expert_bookings").insert({
      user_id: session.user.id,
      expert_id: expert.id,
      expert_user_id: expert.user_id ?? null,
      full_name: details.full_name,
      email: details.email,
      phone: details.phone || null,
      topic: details.topic,
      description: details.description || null,
      preferred_date: details.preferred_date || null,
      preferred_time: details.preferred_time || null,
      amount_etb: Number(amount),
      payment_method: method!,
      transaction_ref: txRef.trim().toUpperCase(),
      status: "pending_approval",
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }

    setStep("success");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        {step === "details" && (
          <>
            <DialogHeader>
              <DialogTitle>Book {expert.name}</DialogTitle>
              <DialogDescription>{expert.title} — <span className="font-bold text-foreground">ETB {amount}</span> / session</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2"><Label className="text-xs">Full name</Label>
                  <Input value={details.full_name} onChange={e => setDetails({ ...details, full_name: e.target.value })} maxLength={100} /></div>
                <div><Label className="text-xs">Email</Label>
                  <Input type="email" value={details.email} onChange={e => setDetails({ ...details, email: e.target.value })} maxLength={255} /></div>
                <div><Label className="text-xs">Phone</Label>
                  <Input value={details.phone} onChange={e => setDetails({ ...details, phone: e.target.value })} maxLength={30} /></div>
                <div className="col-span-2"><Label className="text-xs">Topic</Label>
                  <Input value={details.topic} onChange={e => setDetails({ ...details, topic: e.target.value })} maxLength={150} /></div>
                <div><Label className="text-xs">Preferred date</Label>
                  <Input type="date" value={details.preferred_date} onChange={e => setDetails({ ...details, preferred_date: e.target.value })} /></div>
                <div><Label className="text-xs">Time</Label>
                  <Input placeholder="10:00" value={details.preferred_time} onChange={e => setDetails({ ...details, preferred_time: e.target.value })} maxLength={20} /></div>
                <div className="col-span-2"><Label className="text-xs">Details</Label>
                  <Textarea rows={2} value={details.description} onChange={e => setDetails({ ...details, description: e.target.value })} maxLength={1000} /></div>
              </div>
              <Button className="w-full" onClick={goPayment}>Continue to payment</Button>
            </div>
          </>
        )}

        {step === "method" && (
          <>
            <DialogHeader>
              <DialogTitle>Choose Payment Method</DialogTitle>
              <DialogDescription>Booking with {expert.name} — <span className="font-bold text-foreground">ETB {amount}</span></DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              {(Object.keys(ACCOUNTS) as Method[]).map(m => {
                const A = ACCOUNTS[m]; const Icon = A.icon;
                return (
                  <button key={m} onClick={() => { setMethod(m); setStep("pay"); }}
                    className="w-full flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-secondary transition-colors text-left">
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
              <Button variant="outline" className="w-full" onClick={() => setStep("details")}>Back</Button>
            </div>
          </>
        )}

        {step === "pay" && acct && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1"><Badge variant="outline" className="text-[10px]">{acct.label}</Badge></div>
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
                  <Button size="sm" variant="outline" onClick={() => copy(acct.account)}><Copy className="h-3.5 w-3.5" /></Button>
                )}
              </div>
              <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 flex items-center justify-between">
                <div>
                  <Label className="text-[10px] font-mono uppercase tracking-widest text-primary">Amount</Label>
                  <p className="font-display font-bold text-xl">ETB {amount}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => copy(amount)}><Copy className="h-3.5 w-3.5" /></Button>
              </div>
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
              <DialogDescription>Paste the Transaction ID from your receipt.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="txref">Transaction ID</Label>
                <Input id="txref" placeholder="e.g. FT261241RH1Q" value={txRef}
                  onChange={(e) => setTxRef(e.target.value)} className="font-mono" autoFocus />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("pay")} className="flex-1" disabled={submitting}>Back</Button>
                <Button onClick={submitPayment} disabled={submitting} className="flex-1">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Booking"}
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
              <DialogTitle className="text-center">Booking Submitted</DialogTitle>
              <DialogDescription className="text-center">
                We've sent your request to {expert.name} and the ZEBRA admin team. You'll receive an email confirmation once the payment is verified and the expert accepts.
              </DialogDescription>
            </DialogHeader>
            <Button className="w-full" onClick={() => { reset(); onOpenChange(false); }}>Done</Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
