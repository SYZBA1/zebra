import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarCheck, Clock, CheckCircle2, Wallet } from "lucide-react";

export default function ExpertDashboard() {
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, completed: 0, revenue: 0 });

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from("expert_bookings")
        .select("status, amount_etb")
        .eq("expert_user_id", session.user.id);
      const rows = data || [];
      setStats({
        pending: rows.filter(r => r.status === "pending" || r.status === "pending_approval").length,
        confirmed: rows.filter(r => r.status === "confirmed").length,
        completed: rows.filter(r => r.status === "completed").length,
        revenue: rows.filter(r => r.status === "confirmed" || r.status === "completed").reduce((s, r) => s + Number(r.amount_etb || 0), 0),
      });
    })();
  }, []);

  const cards = [
    { label: "Pending", value: stats.pending, icon: Clock },
    { label: "Confirmed", value: stats.confirmed, icon: CalendarCheck },
    { label: "Completed", value: stats.completed, icon: CheckCircle2 },
    { label: "Revenue (ETB)", value: stats.revenue.toFixed(0), icon: Wallet },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <Card key={c.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-mono">{c.label}</p>
                <c.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-display font-bold mt-2">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-display font-bold text-lg mb-2">Welcome to your Expert Portal</h3>
          <p className="text-sm text-muted-foreground">
            Manage incoming consultation bookings, accept or reject requests, and update your public profile so clients can find you.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
