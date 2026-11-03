import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarCheck, MessageSquareQuote, Store, Newspaper, Wallet, FileText, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Stats = {
  users: number;
  appointments: number;
  feedback: number;
  templates: number;
  budgets: number;
  posts: number;
  documents: number;
  pendingAppts: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentFeedback, setRecentFeedback] = useState<any[]>([]);
  const [recentAppts, setRecentAppts] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [profiles, appts, fb, tpl, bud, posts, docs, pend, fbList, apList] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("consultant_appointments").select("id", { count: "exact", head: true }),
        supabase.from("visitor_feedback").select("id", { count: "exact", head: true }),
        supabase.from("marketplace_templates").select("id", { count: "exact", head: true }),
        supabase.from("budgets" as any).select("id", { count: "exact", head: true }),
        supabase.from("blog_posts" as any).select("id", { count: "exact", head: true }),
        supabase.from("knowledge_documents").select("id", { count: "exact", head: true }),
        supabase.from("consultant_appointments").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("visitor_feedback").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("consultant_appointments").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      setStats({
        users: profiles.count || 0,
        appointments: appts.count || 0,
        feedback: fb.count || 0,
        templates: tpl.count || 0,
        budgets: bud.count || 0,
        posts: posts.count || 0,
        documents: docs.count || 0,
        pendingAppts: pend.count || 0,
      });
      setRecentFeedback(fbList.data || []);
      setRecentAppts(apList.data || []);
    };
    load();
  }, []);

  const cards = [
    { label: "Total Users", value: stats?.users, icon: Users, hint: "Registered profiles", accent: "text-primary" },
    { label: "Appointments", value: stats?.appointments, icon: CalendarCheck, hint: `${stats?.pendingAppts || 0} pending`, accent: "text-primary" },
    { label: "Feedback", value: stats?.feedback, icon: MessageSquareQuote, hint: "Visitor reports", accent: "text-primary" },
    { label: "Marketplace", value: stats?.templates, icon: Store, hint: "Templates", accent: "text-primary" },
    { label: "Budgets", value: stats?.budgets, icon: Wallet, hint: "Saved budgets", accent: "text-primary" },
    { label: "Blog Posts", value: stats?.posts, icon: Newspaper, hint: "Published & drafts", accent: "text-primary" },
    { label: "Documents", value: stats?.documents, icon: FileText, hint: "Knowledge base", accent: "text-primary" },
    { label: "Activity", value: "Live", icon: TrendingUp, hint: "Real-time backend", accent: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="border-border/50 hover:border-primary/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center ${c.accent}`}>
                  <c.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="text-3xl font-display font-bold tracking-tight">
                {c.value ?? "—"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{c.label}</div>
              <div className="text-[10px] font-mono text-primary mt-2">{c.hint}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Latest Feedback
              <Badge variant="outline" className="font-mono">{recentFeedback.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentFeedback.length === 0 && <p className="text-sm text-muted-foreground">No feedback yet.</p>}
            {recentFeedback.map((f) => (
              <div key={f.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                  {(f.name || "A").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium truncate">{f.name || "Anonymous"}</span>
                    <span className="text-primary font-mono text-xs">{"★".repeat(f.rating)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{f.comment || "No comment"}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Recent Appointments
              <Badge variant="outline" className="font-mono">{recentAppts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAppts.length === 0 && <p className="text-sm text-muted-foreground">No appointments yet.</p>}
            {recentAppts.map((a) => (
              <div key={a.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                  {a.full_name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium truncate">{a.full_name}</span>
                    <Badge variant="outline" className="text-[10px] uppercase">{a.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{a.topic}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
