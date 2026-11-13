"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { getProject, Project } from "../../../lib/projects";

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) return router.replace("/login");
      try {
        const p = await getProject(projectId);
        setProject(p);
        setState(p ? "ready" : "missing");
      } catch {
        setState("missing");
      }
    });
  }, [projectId, router]);

  return (
    <div style={{ minHeight: "100vh", background: "#f4f5fb", color: "#14183c", fontFamily: "system-ui, sans-serif" }}>
      <main style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
        <Link href="/dashboard" style={{ color: "#d6245a" }}>Back to dashboard</Link>
        {state === "loading" && <p>Loading...</p>}
        {state === "missing" && <p>Project not found.</p>}
        {state === "ready" && project && (
          <>
            <h1 style={{ marginBottom: 4 }}>{project.title}</h1>
            <div style={{ color: "#d6245a", fontWeight: 600 }}>{project.id}</div>
            <p>{project.description}</p>
            <div style={{ marginTop: 24, padding: 16, border: "1px dashed #d9dcef", borderRadius: 10, color: "#5b6080", background: "#fff" }}>
              Phase 2 (Research Input: upload PDF or enter idea) goes here.
            </div>
          </>
        )}
      </main>
    </div>
  );
}