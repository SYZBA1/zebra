import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Loader2, ShieldAlert, Mail, Phone, Calendar, Clock, FileText, History } from "lucide-react";

type Appointment = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  topic: string;
  description: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  language: string;
  status: string;
  created_at: string;
};

type AuditEntry = {
  id: string;
  changed_by: string | null;
  old_status: string | null;
  new_status: string;
  created_at: string;
  changer_name?: string | null;
};

const STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;

const statusVariant = (s: string): "default" | "secondary" | "outline" | "destructive" => {
  switch (s) {
    case "confirmed": return "default";
    case "completed": return "secondary";
    case "cancelled": return "destructive";
    default: return "outline";
  }
};

export default function AdminAppointments() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [items, setItems] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setAuthed(false); setLoading(false); return; }
      setAuthed(true);
      const { data: roleData } = await supabase
        .from("user_roles" as any).select("role")
        .eq("user_id", session.user.id).eq("role", "admin").maybeSingle();
      const admin = !!roleData;
      setIsAdmin(admin);
      if (admin) await load();
      setLoading(false);
    };
    init();
  }, []);

  const load = async () => {
    const { data, error } = await supabase
      .from("consultant_appointments").select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading appointments", description: error.message, variant: "destructive" });
      return;
    }
    setItems((data || []) as Appointment[]);
  };

  const loadAudit = async (appointmentId: string) => {
    setAuditLoading(true);
    const { data, error } = await supabase
      .from("appointment_audit_log" as any)
      .select("id, changed_by, old_status, new_status, created_at")
      .eq("appointment_id", appointmentId)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading audit log", description: error.message, variant: "destructive" });
      setAudit([]);
    } else {
      const entries = ((data || []) as unknown) as AuditEntry[];
      const changerIds = Array.from(new Set(entries.map(e => e.changed_by).filter(Boolean))) as string[];
      if (changerIds.length) {
        const { data: profs } = await supabase
          .from("profiles").select("user_id, display_name")
          .in("user_id", changerIds);
        const nameMap = new Map((profs || []).map((p: any) => [p.user_id, p.display_name]));
        entries.forEach(e => { if (e.changed_by) e.changer_name = nameMap.get(e.changed_by) || null; });
      }
      setAudit(entries);
    }
    setAuditLoading(false);
  };

  const openDetails = (appt: Appointment) => {
    setSelected(appt);
    setAudit([]);
    loadAudit(appt.id);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("consultant_appointments").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    if (selected?.id === id) {
      setSelected({ ...selected, status });
      loadAudit(id);
    }
    toast({ title: "Status updated", description: `Appointment marked ${status}.` });
  };

  if (authed === false) return <Navigate to="/auth" replace />;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              <CardTitle>Access denied</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You don't have admin access. Contact a system administrator to be granted the admin role.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filtered = filter === "all" ? items : items.filter(i => i.status === filter);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Consultant Appointments</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Click a row for full details & change history.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ({items.length})</SelectItem>
                {STATUSES.map(s => (
                  <SelectItem key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)} ({items.filter(i => i.status === s).length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={load}>Refresh</Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requester</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Preferred</TableHead>
                  <TableHead>Lang</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                      No appointments found.
                    </TableCell>
                  </TableRow>
                ) : filtered.map(a => (
                  <TableRow
                    key={a.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => openDetails(a)}
                  >
                    <TableCell>
                      <div className="font-medium">{a.full_name}</div>
                      <div className="text-xs text-muted-foreground">{a.email}</div>
                      {a.phone && <div className="text-xs text-muted-foreground">{a.phone}</div>}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="font-medium truncate">{a.topic}</div>
                      {a.description && (
                        <div className="text-xs text-muted-foreground line-clamp-2">{a.description}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {a.preferred_date || "—"}
                      {a.preferred_time && <div className="text-xs text-muted-foreground">{a.preferred_time}</div>}
                    </TableCell>
                    <TableCell className="uppercase text-xs">{a.language}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(a.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Select value={a.status} onValueChange={(v) => updateStatus(a.id, v)}>
                        <SelectTrigger className="w-36 ml-auto"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.topic}</SheetTitle>
                <SheetDescription>
                  Submitted {new Date(selected.created_at).toLocaleString()}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant(selected.status)}>{selected.status}</Badge>
                  <span className="text-xs uppercase text-muted-foreground">{selected.language}</span>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Requester</div>
                  <div className="space-y-1.5 text-sm">
                    <div className="font-medium">{selected.full_name}</div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" /> {selected.email}
                    </div>
                    {selected.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" /> {selected.phone}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="text-sm font-medium mb-2">Preferred Schedule</div>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {selected.preferred_date || "No preferred date"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      {selected.preferred_time || "No preferred time"}
                    </div>
                  </div>
                </div>

                {selected.description && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm font-medium mb-2 flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5" /> Description
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {selected.description}
                      </p>
                    </div>
                  </>
                )}

                <Separator />

                <div>
                  <div className="text-sm font-medium mb-3 flex items-center gap-2">
                    <History className="h-3.5 w-3.5" /> Status History
                  </div>
                  {auditLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : audit.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No changes recorded yet.</p>
                  ) : (
                    <ol className="space-y-3 border-l-2 border-border pl-4">
                      {audit.map(e => (
                        <li key={e.id} className="relative">
                          <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                          <div className="text-sm">
                            {e.old_status ? (
                              <>
                                <Badge variant="outline" className="mr-1">{e.old_status}</Badge>
                                →
                                <Badge variant={statusVariant(e.new_status)} className="ml-1">{e.new_status}</Badge>
                              </>
                            ) : (
                              <>
                                Created as{" "}
                                <Badge variant={statusVariant(e.new_status)}>{e.new_status}</Badge>
                              </>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {e.changer_name || (e.changed_by ? "Admin" : "System")} · {new Date(e.created_at).toLocaleString()}
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
