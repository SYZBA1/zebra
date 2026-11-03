import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CalendarCheck } from "lucide-react";

const schema = z.object({
  full_name: z.string().trim().min(2, "Name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  topic: z.string().trim().min(2, "Topic required").max(150),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  preferred_date: z.string().optional().or(z.literal("")),
  preferred_time: z.string().max(20).optional().or(z.literal("")),
});

interface Props {
  conversationId?: string;
  initialTopic?: string;
  language: string;
  onBooked: () => void;
}

export default function AppointmentForm({ conversationId, initialTopic, language, onBooked }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    topic: initialTopic ?? "",
    description: "",
    preferred_date: "",
    preferred_time: "",
  });

  const t = (en: string, am: string) => (language === "am" ? am : en);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error(t("Please sign in", "እባክዎ ይግቡ")); setSubmitting(false); return; }

    const { error } = await supabase.from("consultant_appointments").insert({
      user_id: session.user.id,
      conversation_id: conversationId ?? null,
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      topic: parsed.data.topic,
      description: parsed.data.description || null,
      preferred_date: parsed.data.preferred_date || null,
      preferred_time: parsed.data.preferred_time || null,
      language,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("Appointment requested! We'll be in touch.", "ቀጠሮ ተመዝግቧል! በቅርቡ እንገናኛለን።"));
    onBooked();
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <CalendarCheck className="h-4 w-4 text-primary" />
        {t("Book a Zebra consultant", "የዜብራ አማካሪ ቀጠሮ")}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <Label className="text-xs">{t("Full name", "ሙሉ ስም")} *</Label>
          <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={100} />
        </div>
        <div>
          <Label className="text-xs">{t("Email", "ኢሜይል")} *</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} />
        </div>
        <div>
          <Label className="text-xs">{t("Phone", "ስልክ")}</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={30} />
        </div>
        <div className="col-span-2">
          <Label className="text-xs">{t("Topic", "ርዕስ")} *</Label>
          <Input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} maxLength={150} />
        </div>
        <div>
          <Label className="text-xs">{t("Preferred date", "የተመረጠ ቀን")}</Label>
          <Input type="date" value={form.preferred_date} onChange={(e) => setForm({ ...form, preferred_date: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs">{t("Time", "ሰዓት")}</Label>
          <Input placeholder="10:00" value={form.preferred_time} onChange={(e) => setForm({ ...form, preferred_time: e.target.value })} maxLength={20} />
        </div>
        <div className="col-span-2">
          <Label className="text-xs">{t("Details", "ዝርዝር")}</Label>
          <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={1000} />
        </div>
      </div>
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {t("Request appointment", "ቀጠሮ ጠይቅ")}
      </Button>
    </form>
  );
}
