"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { getProject, Project } from "../lib/projects";
import ResearchWizard from "./ResearchWizard";

export default function ProjectClient({ projectId }: { projectId: string }) {
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
      <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <Link href="/dashboard" style={{ color: "#d6245a" }}>Back to dashboard</Link>
        {state === "loading" && <p>Loading...</p>}
        {state === "missing" && <p>Project not found.</p>}
        {state === "ready" && project && (
          <>
            <h1 style={{ marginBottom: 4 }}>{project.title}</h1>
            <div style={{ color: "#d6245a", fontWeight: 600, marginBottom: 24 }}>{project.id}</div>
            <ResearchWizard projectId={project.id} />
          </>
        )}
      </main>
    </div>
  );
}