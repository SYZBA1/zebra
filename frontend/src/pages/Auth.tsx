import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Mail } from "lucide-react";
import zebraLogo from "@/assets/zebra-logo.png";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // Likely unconfirmed email — offer to resend
          if (
            error.message.toLowerCase().includes("invalid login credentials") ||
            error.message.toLowerCase().includes("email not confirmed")
          ) {
            toast.error(
              "Login failed. If you just registered, please confirm your email first. Check your inbox (and spam folder).",
              { duration: 7000 }
            );
          } else {
            throw error;
          }
          return;
        }
        navigate("/studio");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });
        if (error) throw error;

        // identities being empty means the email is already registered
        if (data.user && data.user.identities?.length === 0) {
          toast.error("This email is already registered. Please sign in instead.");
          setIsLogin(true);
          return;
        }

        setEmailSent(true);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth` },
      });
      if (error) throw error;
      toast.success("Confirmation email resent! Check your inbox and spam folder.");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setResendLoading(false);
    }
  };

  // ── "Check your email" screen ──────────────────────────────────────────────
  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-md p-8 border border-border text-center">
          <div className="flex justify-center mb-6">
            <img src={zebraLogo} alt="Zebra Business Path" className="h-16 object-contain" />
          </div>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tighter mb-2">
            Confirm your email
          </h1>
          <p className="text-muted-foreground text-sm font-mono mb-2">
            We sent a confirmation link to
          </p>
          <p className="font-semibold mb-6">{email}</p>
          <p className="text-muted-foreground text-xs font-mono mb-8">
            Click the link in the email to activate your account. If you don't see it, check your <span className="text-foreground">spam / junk</span> folder.
          </p>

          <Button
            variant="outline"
            className="w-full mb-3"
            onClick={handleResend}
            disabled={resendLoading}
          >
            {resendLoading ? "Sending..." : "Resend confirmation email"}
          </Button>
          <button
            onClick={() => { setEmailSent(false); setIsLogin(true); }}
            className="text-sm font-mono text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  // ── Login / Sign-up form ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md p-8 border border-border">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </button>

        <div className="flex justify-center mb-6">
          <img src={zebraLogo} alt="Zebra Business Path" className="h-16 object-contain" />
        </div>

        <h1 className="font-display text-3xl font-bold tracking-tighter mb-2 text-center">
          {isLogin ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-muted-foreground text-sm font-mono mb-8 text-center">
          {isLogin ? "Sign in to access the Studio" : "Sign up to start architecting"}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div>
              <Label htmlFor="displayName" className="font-mono text-xs uppercase tracking-widest">
                Display Name
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                required={!isLogin}
              />
            </div>
          )}
          <div>
            <Label htmlFor="email" className="font-mono text-xs uppercase tracking-widest">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="password" className="font-mono text-xs uppercase tracking-widest">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
          </Button>
        </form>

        {isLogin && (
          <p className="text-center text-xs text-muted-foreground mt-4 font-mono">
            Getting "Invalid credentials"?{" "}
            <button
              type="button"
              onClick={() => { setIsLogin(false); setEmailSent(false); }}
              className="text-foreground underline underline-offset-4 hover:text-foreground/80"
            >
              Resend confirmation email
            </button>
          </p>
        )}

        <p className="text-center text-sm text-muted-foreground mt-4 font-mono">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-foreground underline underline-offset-4 hover:text-foreground/80"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
