import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ExpertRoute = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<"loading" | "ok" | "deny" | "unauthenticated">("loading");

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setState("unauthenticated");
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "expert")
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
        <p className="font-mono text-sm text-muted-foreground">Verifying expert access…</p>
      </div>
    );
  }

  // Not logged in → go to expert login page
  if (state === "unauthenticated") {
    return <Navigate to="/expert/login" replace />;
  }

  // Logged in but not an expert → go to home, not the user auth screen
  if (state === "deny") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ExpertRoute;
