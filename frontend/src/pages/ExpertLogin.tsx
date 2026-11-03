import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Briefcase } from "lucide-react";

export default function ExpertLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { document.title = "Expert Portal | ZEBRA"; }, []);

  const goExpertHome = async (uid: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "expert").maybeSingle();
    if (data) {
      navigate("/expert");
    } else {
      // Rule 1: not approved as expert → sign out and send to user auth
      await supabase.auth.signOut();
      toast.info("Your expert application is awaiting admin approval. Please sign in via the user portal.");
      navigate("/auth", { replace: true });
    }
  };

  const handleForgotPassword = async () => {
    if (!email) { toast.error("Enter your email address first, then click Forgot password."); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset email sent. Check your inbox and follow the link.");
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) await goExpertHome(data.user.id);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: {
            data: { display_name: name, expert_application: { industry } },
            emailRedirectTo: `${window.location.origin}/expert`,
          },
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from("experts").insert({
            user_id: data.user.id, name: name || email,
            title: "New Consultant", industry: industry || "General",
            bio: "Pending profile completion.",
            verified: false, online: false,
            initials: (name || email).slice(0, 2).toUpperCase(),
          } as any);
        }
        toast.success("Application received. An admin will verify your account shortly.");
        setIsLogin(true);
      }
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 border border-border rounded-2xl bg-card">
        <button onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center mb-3">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Expert Portal</h1>
          <p className="text-muted-foreground text-xs font-mono mt-1">
            {isLogin ? "Sign in to manage bookings" : "Apply to join the verified network"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <>
              <div>
                <Label className="text-xs">Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label className="text-xs">Industry / Specialty</Label>
                <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Agro-Processing" required />
              </div>
            </>
          )}
          <div>
            <Label className="text-xs">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Password</Label>
              {isLogin && (
                <button type="button" onClick={handleForgotPassword}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 font-mono">
                  Forgot password?
                </button>
              )}
            </div>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "Loading…" : isLogin ? "Sign In" : "Submit Application"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6 font-mono">
          {isLogin ? "Want to join as an expert?" : "Already approved?"}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-foreground underline underline-offset-4">
            {isLogin ? "Apply" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
