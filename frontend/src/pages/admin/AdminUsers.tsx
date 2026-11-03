import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";

export default function AdminUsers() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data: profs } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const roleMap = new Map<string, string[]>();
      (roles || []).forEach((r: any) => {
        const arr = roleMap.get(r.user_id) || [];
        arr.push(r.role);
        roleMap.set(r.user_id, arr);
      });
      setRows((profs || []).map((p: any) => ({ ...p, roles: roleMap.get(p.user_id) || ["user"] })));
      setLoading(false);
    })();
  }, []);

  const filtered = rows.filter(r =>
    !q ||
    (r.display_name || "").toLowerCase().includes(q.toLowerCase()) ||
    (r.company_name || "").toLowerCase().includes(q.toLowerCase()) ||
    (r.phone_number || "").includes(q)
  );

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="relative max-w-sm">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search users..." className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-12">No users found.</TableCell></TableRow>
              ) : filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                        {(u.display_name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{u.display_name || "Unnamed"}</div>
                        <div className="text-xs text-muted-foreground font-mono">{u.user_id.slice(0, 8)}…</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{u.company_name || "—"}</TableCell>
                  <TableCell className="text-sm font-mono">{u.phone_number || "—"}</TableCell>
                  <TableCell>
                    {u.roles.map((r: string) => (
                      <Badge key={r} variant={r === "admin" ? "default" : "outline"} className="mr-1 capitalize">{r}</Badge>
                    ))}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
