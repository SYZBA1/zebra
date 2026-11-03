import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Star } from "lucide-react";

export default function AdminFeedback() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("visitor_feedback").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setRows(data || []);
      setLoading(false);
    });
  }, []);

  const avg = rows.length ? (rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(1) : "—";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-5"><div className="text-3xl font-bold">{rows.length}</div><div className="text-xs text-muted-foreground mt-1">Total reports</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-3xl font-bold">{avg} ★</div><div className="text-xs text-muted-foreground mt-1">Average rating</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-3xl font-bold">{rows.filter(r => r.rating >= 4).length}</div><div className="text-xs text-muted-foreground mt-1">Positive (4-5★)</div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : rows.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No feedback submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {rows.map((f) => (
                <div key={f.id} className="flex items-start gap-4 pb-4 border-b border-border last:border-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold shrink-0">
                    {(f.name || "A").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-medium text-sm">{f.name || "Anonymous"}</span>
                      {f.email && <span className="text-xs text-muted-foreground">{f.email}</span>}
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < f.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground ml-auto">{new Date(f.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{f.comment || <em>No comment</em>}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
