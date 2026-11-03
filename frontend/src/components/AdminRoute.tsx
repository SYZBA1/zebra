import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<"loading" | "ok" | "deny" | "unauthenticated">("loading");

  useEffect(() => {
    const check = async (token?: string) => {
      const { data: { session } } = token
        ? { data: { session: null } }  // placeholder, real check below
        : await supabase.auth.getSession();

      const activeSession = session ?? (await supabase.auth.getSession()).data.session;

      if (!activeSession?.user) {
        setState("unauthenticated");
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", activeSession.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setState(data ? "ok" : "deny");
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setState("unauthenticated");
      } else {
        check();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-mono text-sm text-muted-foreground">Verifying access…</p>
      </div>
    );
  }

  // Not logged in → go to login page
  if (state === "unauthenticated") {
    return <Navigate to="/admin/login" replace />;
  }

  // Logged in but not an admin → go to home, not the login screen
  if (state === "deny") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
