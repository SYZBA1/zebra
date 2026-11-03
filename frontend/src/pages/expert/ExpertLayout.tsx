import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, CalendarCheck, User, LogOut, Menu, Briefcase, Store, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NAV = [
  { to: "/expert", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/expert/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/expert/marketplace", label: "Marketplace", icon: Store },
  { to: "/expert/studio", label: "Studio", icon: Rocket },
  { to: "/expert/profile", label: "Profile", icon: User },
];

export default function ExpertLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ""));
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/expert/login", { replace: true });
  };

  const current = NAV.find(n => n.end ? location.pathname === n.to : location.pathname.startsWith(n.to))?.label || "Expert";

  return (
    <div className="dark min-h-screen bg-background text-foreground flex">
      <aside className={cn("h-screen sticky top-0 bg-card border-r border-border flex flex-col transition-all duration-200", collapsed ? "w-16" : "w-60")}>
        <div className="h-16 flex items-center gap-2 px-4 border-b border-border">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Briefcase className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-display text-sm font-bold tracking-tight">ZEBRA</div>
              <div className="font-mono text-[10px] text-muted-foreground">Expert Portal</div>
            </div>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t border-border">
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 sticky top-0 z-10 bg-card/80 backdrop-blur border-b border-border flex items-center gap-4 px-6">
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(c => !c)}>
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-secondary">
            <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
              {email.charAt(0).toUpperCase() || "E"}
            </div>
            <div className="hidden sm:block leading-tight pr-2">
              <div className="text-xs font-medium truncate max-w-[140px]">{email || "Expert"}</div>
              <div className="text-[10px] font-mono text-muted-foreground">Consultant</div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-display font-bold tracking-tight">{current}</h1>
            <p className="text-sm text-muted-foreground font-mono">{new Date().toLocaleDateString()}</p>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
