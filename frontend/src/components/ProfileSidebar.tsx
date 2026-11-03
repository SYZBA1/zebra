import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { User, Bell, Briefcase, FileText, ShoppingBag, LogOut, Check, Calendar } from "lucide-react";

interface ProfileSidebarProps {
  children: React.ReactNode;
}

interface Profile {
  display_name: string | null;
  company_name: string | null;
  phone_number: string | null;
  avatar_url: string | null;
}

interface Project {
  id: string;
  name: string;
  sector: string;
  document_type: string;
  updated_at: string;
  contents: any;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
}

const ProfileSidebar = ({ children }: ProfileSidebarProps) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({ display_name: null, company_name: null, phone_number: null, avatar_url: null });
  const [email, setEmail] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setEmail(session.user.email || "");

      const { data: prof } = await supabase.from("profiles").select("*").eq("user_id", session.user.id).single();
      if (prof) {
        setProfile(prof as any);
        setEditName(prof.display_name || "");
        setEditCompany(prof.company_name || "");
        setEditPhone((prof as any).phone_number || "");
      }

      const { data: projs } = await supabase.from("projects").select("*").eq("user_id", session.user.id).order("updated_at", { ascending: false });
      if (projs) setProjects(projs as any);

      const { data: notifs } = await supabase.from("notifications").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(20);
      if (notifs) setNotifications(notifs as any);
    };
    load();

    // Real-time notifications
    const channel = supabase.channel("notifications-rt").on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications" },
      (payload) => {
        setNotifications((prev) => [payload.new as Notification, ...prev]);
        toast.info((payload.new as Notification).title);
      }
    ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { error } = await supabase.from("profiles").update({
      display_name: editName,
      company_name: editCompany,
      phone_number: editPhone,
    } as any).eq("user_id", session.user.id);
    setSaving(false);
    if (error) toast.error("Failed to save");
    else { toast.success("Profile updated"); setProfile({ ...profile, display_name: editName, company_name: editCompany, phone_number: editPhone }); }
  };

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true } as any).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const completedProjects = projects.filter((p) => {
    const contents = p.contents as Record<string, string>;
    return Object.keys(contents).length > 5;
  });

  const getInitials = (name: string | null) => (name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[440px] p-0">
        <SheetHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarFallback className="bg-primary text-primary-foreground font-display font-bold">
                {getInitials(profile.display_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-left font-display">{profile.display_name || "User"}</SheetTitle>
              <p className="text-xs font-mono text-muted-foreground truncate">{email}</p>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="account" className="flex flex-col h-[calc(100vh-120px)]">
          <TabsList className="mx-6 mt-3 grid grid-cols-3">
            <TabsTrigger value="account" className="text-xs gap-1"><User className="h-3 w-3" /> Account</TabsTrigger>
            <TabsTrigger value="hub" className="text-xs gap-1"><Briefcase className="h-3 w-3" /> Hub</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs gap-1 relative">
              <Bell className="h-3 w-3" /> Alerts
              {unreadCount > 0 && <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[9px] flex items-center justify-center">{unreadCount}</Badge>}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-6 py-4">
            <TabsContent value="account" className="mt-0 space-y-4">
              <div>
                <Label className="font-mono text-xs uppercase tracking-widest">Display Name</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="font-mono text-xs uppercase tracking-widest">Company</Label>
                <Input value={editCompany} onChange={(e) => setEditCompany(e.target.value)} className="mt-1" placeholder="Your company name" />
              </div>
              <div>
                <Label className="font-mono text-xs uppercase tracking-widest">Phone Number</Label>
                <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="mt-1" placeholder="+251 9..." />
              </div>
              <div>
                <Label className="font-mono text-xs uppercase tracking-widest">Email</Label>
                <Input value={email} disabled className="mt-1 opacity-60" />
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? "Saving..." : "Save Profile"}</Button>
              <Button variant="outline" className="w-full gap-2" onClick={handleLogout}><LogOut className="h-4 w-4" /> Sign Out</Button>
            </TabsContent>

            <TabsContent value="hub" className="mt-0 space-y-6">
              <div>
                <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" /> Completed Studies ({completedProjects.length})
                </h4>
                {completedProjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No completed studies yet.</p>
                ) : (
                  <div className="space-y-2">
                    {completedProjects.map((p) => (
                      <button key={p.id} onClick={() => navigate("/studio")}
                        className="w-full text-left border border-border rounded-sm p-3 hover:bg-secondary transition-colors">
                        <p className="text-sm font-bold truncate">{p.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{p.sector} · {p.document_type}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5" /> Resume Studies
                </h4>
                {projects.filter((p) => Object.keys(p.contents as any || {}).length <= 5).length === 0 ? (
                  <p className="text-sm text-muted-foreground">All projects are complete.</p>
                ) : (
                  <div className="space-y-2">
                    {projects.filter((p) => Object.keys(p.contents as any || {}).length <= 5).map((p) => (
                      <button key={p.id} onClick={() => navigate("/studio")}
                        className="w-full text-left border border-border rounded-sm p-3 hover:bg-secondary transition-colors">
                        <p className="text-sm font-bold truncate">{p.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{p.sector} · In Progress</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" /> Expert Bookings
                </h4>
                <Button variant="outline" className="w-full" onClick={() => navigate("/bookings")}>
                  My Bookings
                </Button>
              </div>

              <div>
                <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <ShoppingBag className="h-3.5 w-3.5" /> Marketplace
                </h4>
                <Button variant="outline" className="w-full" onClick={() => navigate("/marketplace")}>
                  Browse Templates
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0 space-y-2">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No notifications yet.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={`border border-border p-3 rounded-sm transition-colors ${n.is_read ? "opacity-60" : "bg-secondary/50"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold">{n.title}</p>
                        {n.message && <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>}
                        <p className="text-[10px] font-mono text-muted-foreground mt-1">
                          {new Date(n.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {!n.is_read && (
                        <button onClick={() => markRead(n.id)} className="text-primary hover:text-primary/80">
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileSidebar;
