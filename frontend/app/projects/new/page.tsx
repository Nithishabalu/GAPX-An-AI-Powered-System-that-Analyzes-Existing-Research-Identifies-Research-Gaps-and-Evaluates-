"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { createProject } from "../../../lib/projects";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to create the project.";
}

export default function NewProject() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => (u ? setUser(u) : router.replace("/login")));
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setMsg("");
    try {
      const id = await createProject(user.uid, title.trim(), description.trim());
      router.push(`/projects/${id}`);
    } catch (err: unknown) {
      setMsg(errorMessage(err));
      setBusy(false);
    }
  }

  const input = { padding: 11, border: "1px solid #d9dcef", borderRadius: 8, fontSize: 15, fontFamily: "inherit" };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f5fb", color: "#14183c", fontFamily: "system-ui, sans-serif" }}>
      <main style={{ maxWidth: 520, margin: "0 auto", padding: 24 }}>
        <Link href="/dashboard" style={{ color: "#d6245a" }}>Back to dashboard</Link>
        <h1>New research project</h1>
        <form onSubmit={submit} style={{ display: "grid", gap: 12, background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #d9dcef" }}>
          <input style={input} placeholder="Project title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea style={{ ...input, minHeight: 100 }} placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <button disabled={busy || !user} style={{ padding: 12, border: 0, borderRadius: 8, background: "#d6245a", color: "#fff", fontSize: 15, cursor: "pointer" }}>
            {busy ? "Creating..." : "Create project"}
          </button>
          <p style={{ color: "#b3261e", margin: 0 }}>{msg}</p>
        </form>
      </main>
    </div>
  );
}