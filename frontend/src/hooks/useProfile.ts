import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useProfile() {
  const [displayName, setDisplayName] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setUserId(session.user.id);
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", session.user.id)
        .single();
      if (data?.display_name) setDisplayName(data.display_name);
    };
    fetch();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) { setDisplayName(""); setUserId(null); }
      else { setUserId(session.user.id); }
    });
    return () => subscription.unsubscribe();
  }, []);

  return { displayName, userId };
}
