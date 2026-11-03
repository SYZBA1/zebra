import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Sun, Moon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getStoredTheme, setStoredTheme } from "@/lib/theme";
import ProfileSidebar from "@/components/ProfileSidebar";
import zebraLogoLight from "@/assets/zebra-logo-light.png";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState(getStoredTheme());
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async (uid?: string) => {
      if (!uid) { setIsAdmin(false); return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle();
      setIsAdmin(!!data);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => { setSession(s); checkAdmin(s?.user?.id); });
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); checkAdmin(session?.user?.id); });
    return () => subscription.unsubscribe();
  }, []);

  const handleStudio = () => navigate(session ? "/phase1" : "/auth");
  const toggleTheme = () => { const next = theme === "dark" ? "light" : "dark"; setTheme(next); setStoredTheme(next); };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", onClick: () => navigate("/about") },
    { label: "Blog", onClick: () => navigate("/blog") },
    { label: "Expertise", onClick: () => navigate("/expertise") },
    { label: "Marketplace", onClick: () => navigate("/marketplace") },
    { label: "Contact", onClick: () => navigate("/contact") },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-14 sm:h-16">
        <a href="/" className="flex items-center gap-2">
          <img src={zebraLogoLight} alt="Zebra" className="h-5 sm:h-6 object-contain" />
          <span className="font-display text-lg sm:text-xl font-bold tracking-tighter">ZEBRA</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            link.href ? (
              <a key={link.label} href={link.href} className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors">{link.label}</a>
            ) : (
              <button key={link.label} onClick={link.onClick} className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors">{link.label}</button>
            )
          ))}
          <button onClick={toggleTheme} className="p-1.5 rounded hover:bg-secondary transition-colors">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {isAdmin && (
            <button onClick={() => navigate("/admin/appointments")} className="text-sm font-mono text-primary hover:underline">Admin</button>
          )}
          {session && (
            <ProfileSidebar>
              <button className="p-1.5 rounded-full border border-border hover:bg-secondary transition-colors">
                <User className="h-4 w-4" />
              </button>
            </ProfileSidebar>
          )}
          <Button size="sm" onClick={handleStudio}>Enter Studio</Button>
        </div>

        {/* Mobile hamburger → Sheet sliding drawer */}
        <div className="md:hidden flex items-center gap-2">
          {session && (
            <ProfileSidebar>
              <button className="p-1.5 rounded-full border border-border hover:bg-secondary transition-colors">
                <User className="h-4 w-4" />
              </button>
            </ProfileSidebar>
          )}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="p-1.5">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0">
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
                <SheetTitle className="font-display text-lg font-bold tracking-tighter text-left">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-6 gap-1">
                {navLinks.map((link) => (
                  link.href ? (
                    <a key={link.label} href={link.href} className="text-sm font-mono py-3 px-3 rounded-sm hover:bg-secondary transition-colors" onClick={() => setMobileOpen(false)}>{link.label}</a>
                  ) : (
                    <button key={link.label} className="text-sm font-mono text-left py-3 px-3 rounded-sm hover:bg-secondary transition-colors" onClick={() => { setMobileOpen(false); link.onClick?.(); }}>{link.label}</button>
                  )
                ))}
                <button className="text-sm font-mono text-left py-3 px-3 rounded-sm hover:bg-secondary transition-colors flex items-center gap-2" onClick={toggleTheme}>
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />} Toggle Theme
                </button>
                {isAdmin && (
                  <button className="text-sm font-mono text-left py-3 px-3 rounded-sm text-primary hover:bg-secondary transition-colors" onClick={() => { setMobileOpen(false); navigate("/admin/appointments"); }}>Admin Dashboard</button>
                )}
                <div className="pt-4 border-t border-border mt-2">
                  <Button className="w-full" onClick={() => { setMobileOpen(false); handleStudio(); }}>Enter Studio</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
