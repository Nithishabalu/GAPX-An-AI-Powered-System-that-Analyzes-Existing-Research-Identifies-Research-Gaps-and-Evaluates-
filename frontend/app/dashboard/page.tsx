"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { listProjects, Project } from "../../lib/projects";

const PHASES = [
  "Authentication & Project",
  "Research Input",
  "Content Processing",
  "Literature Retrieval",
  "Access & Content",
  "Semantic Analysis",
  "AI Gap Analysis",
  "Output & Reporting",
];

const C = { ink: "#14183c", muted: "#5b6080", line: "#d9dcef", bg: "#f4f5fb", accent: "#d6245a" };

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to load projects.";
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) return router.replace("/login");
      setUser(u);
      try {
        setProjects(await listProjects(u.uid));
      } catch (e: unknown) {
        setError(errorMessage(e));
      }
      setLoading(false);
    });
  }, [router]);

  async function logout() {
    await signOut(auth);
    router.replace("/login");
  }

  const card = { background: "#fff", border: `1px solid ${C.line}`, borderRadius: 12, padding: 20 };
  const primary = { padding: "10px 18px", borderRadius: 8, background: C.accent, color: "#fff", textDecoration: "none", fontSize: 15 };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: "system-ui, sans-serif" }}>
      {/* Top bar */}
      <header style={{ background: "#fff", borderBottom: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>GAPX</div>
            <div style={{ fontSize: 13, color: C.muted }}>AI-assisted research gap discovery</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 14, color: C.muted }}>{user?.displayName || user?.email}</span>
            <button
              onClick={logout}
              style={{ padding: "9px 16px", borderRadius: 8, border: `1px solid ${C.line}`, background: "#fff", color: C.ink, cursor: "pointer", fontSize: 14 }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: 24, display: "grid", gap: 24 }}>
        {/* Phase 1: Create New Research Project */}
        <section style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>Create new research project</h2>
            <p style={{ margin: "6px 0 0", color: C.muted, fontSize: 14 }}>
              Starts a project workspace and generates a Project ID (e.g. GAPX-2026-001).
            </p>
          </div>
          <Link href="/projects/new" style={primary}>New research project</Link>
        </section>

        {/* Projects */}
        <section>
          <h2 style={{ fontSize: 18, margin: "0 0 12px" }}>Your projects</h2>
          {error && <p style={{ color: "#b3261e" }}>{error}</p>}
          {loading && <p style={{ color: C.muted }}>Loading...</p>}
          {!loading && !error && projects.length === 0 && (
            <div style={{ ...card, color: C.muted }}>No projects yet. Create your first research project above.</div>
          )}
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {projects.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`} style={{ ...card, textDecoration: "none", color: "inherit", display: "grid", gap: 6 }}>
                <span style={{ color: C.accent, fontSize: 13, fontWeight: 600 }}>{p.id}</span>
                <strong>{p.title}</strong>
                <span style={{ color: C.muted, fontSize: 14 }}>{p.description || "No description"}</span>
                <span style={{ color: C.muted, fontSize: 12 }}>
                  {p.createdAt ? p.createdAt.toDate().toLocaleDateString() : ""}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Workflow overview */}
        <section style={card}>
          <h2 style={{ fontSize: 18, margin: "0 0 12px" }}>GAPX workflow</h2>
          <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
            {PHASES.map((name, i) => (
              <li
                key={name}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, fontSize: 14,
                  border: `1px solid ${C.line}`, background: i === 0 ? "#fdebf1" : "#fff",
                }}
              >
                <span style={{ width: 24, height: 24, borderRadius: 12, background: i === 0 ? C.accent : C.line, color: i === 0 ? "#fff" : C.ink, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600 }}>
                  {i + 1}
                </span>
                {name}
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}