import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Users, MessageSquareQuote, CalendarCheck, Store,
  Wallet, Newspaper, FileText, LogOut, Menu, Search, Bell, Shield, Receipt, Briefcase, Rocket, BookOpen,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/feedback", label: "Reports", icon: MessageSquareQuote },
  { to: "/admin/consultants", label: "Consultants", icon: Briefcase },
  { to: "/admin/appointments", label: "Appointments", icon: CalendarCheck },
  { to: "/admin/marketplace", label: "Marketplace", icon: Store },
  { to: "/admin/studio", label: "Studio", icon: Rocket },
  { to: "/admin/purchases", label: "Purchases", icon: Receipt },
  { to: "/admin/bookings", label: "Expert Bookings", icon: Briefcase },
  { to: "/admin/budgets", label: "Budgets", icon: Wallet },
  { to: "/admin/blog", label: "Blog", icon: Newspaper },
  { to: "/admin/documents", label: "Documents", icon: FileText },
  { to: "/admin/knowledge-base", label: "Knowledge Base", icon: BookOpen },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ""));
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/admin/login", { replace: true });
  };

  const current = NAV.find(n => n.end ? location.pathname === n.to : location.pathname.startsWith(n.to))?.label || "Admin";

  return (
    <div className="dark min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "h-screen sticky top-0 bg-card border-r border-border flex flex-col transition-all duration-200",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <div className="h-16 flex items-center gap-2 px-4 border-b border-border">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-display text-sm font-bold tracking-tight">ZEBRA</div>
              <div className="font-mono text-[10px] text-muted-foreground">Admin Console</div>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-2 border-t border-border">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 sticky top-0 z-10 bg-card/80 backdrop-blur border-b border-border flex items-center gap-4 px-6">
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(c => !c)}>
            <Menu className="h-4 w-4" />
          </Button>
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search here..." className="pl-9 bg-background border-border" />
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
            </Button>
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-secondary">
              <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                {email.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="hidden sm:block leading-tight pr-2">
                <div className="text-xs font-medium truncate max-w-[140px]">{email || "Admin"}</div>
                <div className="text-[10px] font-mono text-muted-foreground">Administrator</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-display font-bold tracking-tight">{current}</h1>
            <p className="text-sm text-muted-foreground font-mono">Manage your platform · {new Date().toLocaleDateString()}</p>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
