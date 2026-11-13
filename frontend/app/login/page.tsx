"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../../lib/firebase";

function errorDetails(error: unknown): { code?: string; message: string } {
  if (error instanceof Error) {
    return {
      code: "code" in error && typeof error.code === "string" ? error.code : undefined,
      message: error.message,
    };
  }
  return { message: "Something went wrong. Please try again." };
}

export default function LoginPage() {
  const router = useRouter();
  const [signup, setSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) router.replace("/dashboard");
    });
    return () => unsub();
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      if (signup) {
        const c = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(c.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: unknown) {
      const details = errorDetails(err);
      setMsg(
        details.code === "auth/invalid-credential"
          ? "Wrong email or password."
          : details.code === "auth/email-already-in-use"
          ? "Email already registered. Sign in instead."
          : details.message
      );
      setBusy(false);
    }
  }

  async function google() {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err: unknown) {
      setMsg(errorDetails(err).message);
    }
  }

  async function reset() {
    if (!email) return setMsg("Enter your email first.");
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg("Reset link sent. Check your inbox.");
    } catch (err: unknown) {
      setMsg(errorDetails(err).message);
    }
  }

  const input = { padding: 11, border: "1px solid #d9dcef", borderRadius: 8, fontSize: 15 };
  const btn = { padding: 12, border: 0, borderRadius: 8, background: "#d6245a", color: "#fff", fontSize: 15, cursor: "pointer" };
  const alt = { ...btn, background: "#fff", color: "#14183c", border: "1px solid #d9dcef" };
  const link = { background: "none", border: 0, color: "#d6245a", cursor: "pointer" };

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f4f5fb" }}>
      <form onSubmit={submit} style={{ width: 380, background: "#fff", padding: 28, borderRadius: 12, display: "grid", gap: 12, color: "#14183c" }}>
        <h1 style={{ margin: 0 }}>GAPX</h1>
        <p style={{ margin: 0, color: "#5b6080" }}>
          {signup ? "Create your research workspace" : "Sign in to your research workspace"}
        </p>
        {signup && (
          <input style={input} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        )}
        <input style={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input style={input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
        <button style={btn} disabled={busy}>{signup ? "Create account" : "Sign in"}</button>
        <button style={alt} type="button" onClick={google}>Continue with Google</button>
        <p style={{ color: "#b3261e", margin: 0, minHeight: 20 }}>{msg}</p>
        <button style={link} type="button" onClick={() => setSignup(!signup)}>
          {signup ? "I already have an account" : "Create an account"}
        </button>
        <button style={link} type="button" onClick={reset}>Forgot password?</button>
      </form>
    </main>
  );
}