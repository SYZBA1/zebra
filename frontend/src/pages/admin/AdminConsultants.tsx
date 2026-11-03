import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Check, X, Star, Briefcase, Loader2, Search, Mail } from "lucide-react";

type Expert = {
  id: string;
  user_id: string | null;
  name: string;
  title: string;
  industry: string;
  bio: string;
  price_etb: number;
  rating: number;
  appointments: number;
  verified: boolean;
  online: boolean;
  initials: string;
  tags: string[];
  created_at: string;
};

export default function AdminConsultants() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("experts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    const list = (data || []) as Expert[];
    setExperts(list);
    const userIds = list.map(e => e.user_id).filter(Boolean) as string[];
    if (userIds.length) {
      const { data: profs } = await supabase
        .from("profiles").select("user_id, display_name").in("user_id", userIds);
      const map: Record<string, string> = {};
      (profs || []).forEach((p: any) => { map[p.user_id] = p.display_name || ""; });
      setEmails(map);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const approve = async (e: Expert) => {
    if (!e.user_id) { toast.error("No linked user account."); return; }
    setBusy(e.id);
    const { error: rErr } = await supabase
      .from("user_roles").insert({ user_id: e.user_id, role: "expert" as any });
    if (rErr && !rErr.message.includes("duplicate")) {
      toast.error(rErr.message); setBusy(null); return;
    }
    const { error: uErr } = await supabase
      .from("experts").update({ verified: true }).eq("id", e.id);
    if (uErr) { toast.error(uErr.message); setBusy(null); return; }
    toast.success(`${e.name} approved — portal access granted.`);
    setBusy(null);
    load();
  };

  const deny = async (e: Expert) => {
    if (!confirm(`Deny and remove ${e.name}'s application?`)) return;
    setBusy(e.id);
    if (e.user_id) {
      await supabase.from("user_roles").delete()
        .eq("user_id", e.user_id).eq("role", "expert" as any);
    }
    const { error } = await supabase.from("experts").delete().eq("id", e.id);
    if (error) { toast.error(error.message); setBusy(null); return; }
    toast.success("Application denied.");
    setBusy(null);
    load();
  };

  const revoke = async (e: Expert) => {
    if (!confirm(`Revoke ${e.name}'s portal access? They can re-apply later.`)) return;
    setBusy(e.id);
    if (e.user_id) {
      await supabase.from("user_roles").delete()
        .eq("user_id", e.user_id).eq("role", "expert" as any);
    }
    await supabase.from("experts").update({ verified: false, online: false }).eq("id", e.id);
    toast.success("Access revoked.");
    setBusy(null);
    load();
  };

  const filter = (verified: boolean) =>
    experts
      .filter(e => e.verified === verified)
      .filter(e => {
        if (!search) return true;
        const s = search.toLowerCase();
        return e.name.toLowerCase().includes(s)
          || e.industry.toLowerCase().includes(s)
          || e.title.toLowerCase().includes(s);
      });

  const pending = filter(false);
  const verified = filter(true);

  if (loading) {
    return <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>;
  }

  const Card_ = ({ e, isPending }: { e: Expert; isPending: boolean }) => (
    <Card className="border-border/60 hover:border-primary/40 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold shrink-0">
            {e.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold truncate">{e.name}</h3>
              {e.verified ? (
                <Badge variant="default" className="text-[10px]">Verified</Badge>
              ) : (
                <Badge variant="outline" className="text-[10px]">Pending</Badge>
              )}
              {e.online && <Badge variant="secondary" className="text-[10px]">Online</Badge>}
            </div>
            <p className="text-xs text-muted-foreground truncate">{e.title} · {e.industry}</p>
            {e.user_id && emails[e.user_id] && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Mail className="h-3 w-3" /> {emails[e.user_id]}
              </p>
            )}
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{e.bio}</p>
            <div className="flex items-center gap-4 mt-3 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="h-3 w-3 text-primary" /> {e.rating}</span>
              <span>{e.appointments} sessions</span>
              <span>ETB {e.price_etb}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          {isPending ? (
            <>
              <Button size="sm" onClick={() => approve(e)} disabled={busy === e.id} className="flex-1">
                <Check className="h-4 w-4 mr-1" /> Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => deny(e)} disabled={busy === e.id} className="flex-1">
                <X className="h-4 w-4 mr-1" /> Deny
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => revoke(e)} disabled={busy === e.id} className="ml-auto">
              Revoke access
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search experts by name, industry…" value={search}
          onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending applications
            <Badge variant="secondary" className="ml-2">{pending.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="verified">
            Verified portfolio
            <Badge variant="secondary" className="ml-2">{verified.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pending.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No pending expert applications.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {pending.map(e => <Card_ key={e.id} e={e} isPending />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="verified" className="mt-6">
          {verified.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-sm">No verified experts yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {verified.map(e => <Card_ key={e.id} e={e} isPending={false} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
