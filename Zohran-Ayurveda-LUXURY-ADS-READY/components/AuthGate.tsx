"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "email" | "phone";

export function AuthGate() {
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("email");
  const [emailMode, setEmailMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const supabase = createClient();
  const excluded = pathname.startsWith("/admin") || pathname.startsWith("/login") || pathname.startsWith("/auth/");

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setOpen(!data.session && !excluded);
      setChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setOpen(!session && !excluded);
      if (session) {
        setMessage("");
        setError("");
      }
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [pathname, excluded]);

  async function oauth(provider: "google" | "azure") {
    setBusy(true); setError(""); setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) setError(error.message);
    setBusy(false);
  }

  async function emailSubmit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(""); setMessage("");
    const result = emailMode === "signin"
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
      : await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
    if (result.error) setError(result.error.message);
    else if (emailMode === "signup" && !result.data.session) setMessage("Account created. Check your email to verify your account.");
    else setOpen(false);
    setBusy(false);
  }

  async function sendOtp() {
    setBusy(true); setError(""); setMessage("");
    const clean = phone.trim();
    const { error } = await supabase.auth.signInWithOtp({ phone: clean });
    if (error) setError(error.message);
    else { setOtpSent(true); setMessage("OTP sent. Enter the code you received."); }
    setBusy(false);
  }

  async function verifyOtp(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(""); setMessage("");
    const { error } = await supabase.auth.verifyOtp({ phone: phone.trim(), token: otp.trim(), type: "sms" });
    if (error) setError(error.message);
    else setOpen(false);
    setBusy(false);
  }

  if (checking || excluded || !open) return null;

  return (
    <div className="authgate" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div className="authgate-backdrop" />
      <div className="authgate-card">
        <div className="authgate-brand">
          <Image src="/logo.png" width={58} height={58} alt="Zohran Ayurveda" />
          <div><span>ZOHRAN AYURVEDA</span><small>Natural • Trusted • Ayurvedic</small></div>
        </div>
        <div className="authgate-head">
          <div className="kicker">Welcome</div>
          <h2 id="welcome-title">Your wellness journey starts here.</h2>
          <p>Sign in to explore products, save your basket and track your orders.</p>
        </div>

        <button className="socialbtn" disabled={busy} onClick={() => oauth("google")}><span className="socialmark googlemark">G</span>Continue with Google</button>
        <button className="socialbtn" disabled={busy} onClick={() => oauth("azure")}><span className="socialmark microsoftmark"><i/><i/><i/><i/></span>Continue with Microsoft</button>

        <div className="authdivider"><span>or continue with</span></div>

        <div className="authswitch">
          <button className={mode === "email" ? "active" : ""} onClick={() => { setMode("email"); setError(""); setMessage(""); }}>Email</button>
          <button className={mode === "phone" ? "active" : ""} onClick={() => { setMode("phone"); setError(""); setMessage(""); }}>Mobile number</button>
        </div>

        {mode === "email" ? (
          <form className="authgate-form" onSubmit={emailSubmit}>
            <input className="input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="input" type="password" placeholder="Password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} required />
            <button className="btn primary authmainbtn" disabled={busy}>{busy ? "Please wait..." : emailMode === "signin" ? "Sign in" : "Create account"}</button>
            <button type="button" className="authlink" onClick={() => { setEmailMode(emailMode === "signin" ? "signup" : "signin"); setError(""); setMessage(""); }}>
              {emailMode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
            </button>
          </form>
        ) : !otpSent ? (
          <div className="authgate-form">
            <input className="input" type="tel" inputMode="tel" placeholder="Mobile number with country code, e.g. +91 9876543210" value={phone} onChange={e => setPhone(e.target.value)} required />
            <button className="btn primary authmainbtn" disabled={busy || !phone.trim()} onClick={sendOtp}>{busy ? "Sending OTP..." : "Send OTP"}</button>
          </div>
        ) : (
          <form className="authgate-form" onSubmit={verifyOtp}>
            <input className="input" inputMode="numeric" autoComplete="one-time-code" placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} maxLength={8} required />
            <button className="btn primary authmainbtn" disabled={busy}>{busy ? "Verifying..." : "Verify & continue"}</button>
            <button type="button" className="authlink" onClick={() => { setOtpSent(false); setOtp(""); }}>Change mobile number</button>
          </form>
        )}

        {error && <div className="autherror">{error}</div>}
        {message && <div className="authsuccess">{message}</div>}
        <p className="authgate-terms">By continuing, you agree to our Terms, Privacy Policy and secure account experience.</p>
      </div>
    </div>
  );
}
