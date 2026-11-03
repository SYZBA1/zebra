import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Rocket } from "lucide-react";
import { toast } from "sonner";

export default function ExpertProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exists, setExists] = useState(false);
  const [form, setForm] = useState({
    name: "", title: "", industry: "", bio: "",
    tags: "", price_etb: 500, years_experience: 0,
    offering: "", deliverable: "", online: false, verified: false,
  });

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("experts").select("*").eq("user_id", session.user.id).maybeSingle();
      if (data) {
        setExists(true);
        setForm({
          name: data.name, title: data.title, industry: data.industry, bio: data.bio,
          tags: (data.tags || []).join(", "), price_etb: Number(data.price_etb),
          years_experience: data.years_experience, offering: data.offering, deliverable: data.deliverable,
          online: data.online, verified: data.verified,
        });
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSaving(false); return; }
    const payload = {
      user_id: session.user.id,
      name: form.name, title: form.title, industry: form.industry, bio: form.bio,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      price_etb: form.price_etb, years_experience: form.years_experience,
      offering: form.offering, deliverable: form.deliverable, online: form.online,
      initials: form.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "EX",
    };
    const { error } = exists
      ? await supabase.from("experts").update(payload).eq("user_id", session.user.id)
      : await supabase.from("experts").insert(payload as any);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile saved");
    setExists(true);
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <Card>
      <CardContent className="p-6 space-y-4 max-w-3xl">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg">Your Public Profile</h3>
          <Badge variant={form.verified ? "default" : "secondary"}>{form.verified ? "Verified" : "Awaiting verification"}</Badge>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Industry</Label><Input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Bio</Label><Textarea rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} /></div>
          <div><Label>Primary Offering</Label><Input value={form.offering} onChange={e => setForm({ ...form, offering: e.target.value })} /></div>
          <div><Label>Deliverable</Label><Input value={form.deliverable} onChange={e => setForm({ ...form, deliverable: e.target.value })} /></div>
          <div><Label>Price per session (ETB)</Label><Input type="number" value={form.price_etb} onChange={e => setForm({ ...form, price_etb: Number(e.target.value) })} /></div>
          <div><Label>Years of experience</Label><Input type="number" value={form.years_experience} onChange={e => setForm({ ...form, years_experience: Number(e.target.value) })} /></div>
          <div className="flex items-center gap-3 md:col-span-2 pt-2">
            <Switch checked={form.online} onCheckedChange={(v) => setForm({ ...form, online: v })} />
            <Label>Available for new bookings</Label>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={() => navigate("/expert/studio")}>
            <Rocket className="h-4 w-4 mr-2" />
            Go to Studio
          </Button>
          <Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Profile</Button>
        </div>
      </CardContent>
    </Card>
  );
}
