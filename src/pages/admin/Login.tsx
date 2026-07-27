import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

type Mode = "signin" | "signup" | "mfa" | "enrol";

export default function AdminLogin() {
  const nav = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) await routeSignedIn();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function routeSignedIn() {
    // Check AAL — if MFA is required but not satisfied, prompt for code
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totp = factors?.totp?.[0];
      if (totp) {
        setFactorId(totp.id);
        const { data: ch } = await supabase.auth.mfa.challenge({ factorId: totp.id });
        if (ch) setChallengeId(ch.id);
        setMode("mfa");
        return;
      }
    }

    // No factor yet? Force enrolment
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const verified = factors?.totp?.find((f) => f.status === "verified");
    if (!verified) {
      const { data: enrol, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Admin TOTP" });
      if (error) { toast.error(error.message); return; }
      setFactorId(enrol.id);
      setQr(enrol.totp.qr_code);
      setSecret(enrol.totp.secret);
      setMode("enrol");
      return;
    }

    await ensureAdminAndGo();
  }

  async function ensureAdminAndGo() {
    // Try bootstrap (idempotent: returns already-admin or promotes if list empty)
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const res = await fetch(`https://pmwnxcyltqbdziwufwxs.supabase.co/functions/v1/admin-bootstrap`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        toast.error(body?.error ?? "Not authorized as admin");
        await supabase.auth.signOut();
        return;
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Bootstrap failed");
      return;
    }
    nav("/admin");
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    await routeSignedIn();
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/admin/login` },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Account created. Sign in below.");
    setMode("signin");
  }

  async function handleVerifyMfa(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId || !challengeId) return;
    setLoading(true);
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    await ensureAdminAndGo();
  }

  async function handleEnrolVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setLoading(true);
    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId });
    if (chErr || !ch) { setLoading(false); toast.error(chErr?.message ?? "Challenge failed"); return; }
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: ch.id, code });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("2FA enabled.");
    await ensureAdminAndGo();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Admin</h1>
          <p className="text-sm text-muted-foreground">
            {mode === "signin" && "Sign in to the orders dashboard."}
            {mode === "signup" && "Create the admin account (first-time only)."}
            {mode === "mfa" && "Enter the 6-digit code from your authenticator app."}
            {mode === "enrol" && "Scan the QR with Google Authenticator / Authy, then enter the 6-digit code."}
          </p>
        </div>

        {mode === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-3">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
            <button type="button" className="text-xs text-muted-foreground underline" onClick={() => setMode("signup")}>
              First time? Create admin account
            </button>
          </form>
        )}

        {mode === "signup" && (
          <form onSubmit={handleSignUp} className="space-y-3">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password (min 8 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
            <button type="button" className="text-xs text-muted-foreground underline" onClick={() => setMode("signin")}>
              Back to sign in
            </button>
          </form>
        )}

        {mode === "mfa" && (
          <form onSubmit={handleVerifyMfa} className="space-y-3">
            <Input inputMode="numeric" pattern="[0-9]*" maxLength={6} placeholder="123456"
              value={code} onChange={(e) => setCode(e.target.value)} required />
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Verifying..." : "Verify"}</Button>
          </form>
        )}

        {mode === "enrol" && (
          <form onSubmit={handleEnrolVerify} className="space-y-3">
            {qr && <img src={qr} alt="TOTP QR" className="mx-auto w-48 h-48 border rounded" />}
            {secret && <p className="text-xs text-center text-muted-foreground break-all">Or enter manually: <code>{secret}</code></p>}
            <Input inputMode="numeric" pattern="[0-9]*" maxLength={6} placeholder="6-digit code"
              value={code} onChange={(e) => setCode(e.target.value)} required />
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Verifying..." : "Enable 2FA"}</Button>
          </form>
        )}
      </Card>
    </div>
  );
}