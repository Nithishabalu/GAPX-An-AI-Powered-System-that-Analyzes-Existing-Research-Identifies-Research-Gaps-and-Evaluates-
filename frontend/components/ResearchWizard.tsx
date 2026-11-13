"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveWizard } from "../lib/wizard";

type Step = "input" | "sources" | "access" | "platforms" | "processing";

const C = { ink: "#14183c", muted: "#5b6080", line: "#d9dcef", accent: "#d6245a", soft: "#fdebf1" };

const SOURCES = [
  { id: "ieee", name: "IEEE Xplore", desc: "Engineering, technology, computing, electronics and related research", auth: true },
  { id: "sciencedirect", name: "ScienceDirect / Elsevier", desc: "Scientific, technical, medical and multidisciplinary research", auth: true },
  { id: "springer", name: "SpringerLink", desc: "Scientific, technical, medical and academic research publications", auth: true },
  { id: "acm", name: "ACM Digital Library", desc: "Computing and information technology research", auth: true },
  { id: "semanticscholar", name: "Semantic Scholar", desc: "AI-assisted discovery of scholarly research and academic papers", auth: false },
  { id: "openalex", name: "OpenAlex", desc: "Open scholarly metadata covering research worldwide", auth: false },
];

const STAGES = [
  ["Process Research Input", "Preparing the uploaded PDF or research idea"],
  ["Generate Research Queries", "Creating research-focused search queries"],
  ["Search Scholarly Literature", "Retrieving relevant literature from selected sources"],
  ["Prepare Literature Analysis", "Preparing papers for semantic analysis"],
  ["Semantic Analysis", "Ranking papers against your research profile"],
  ["RAG Context", "Preparing relevant literature and evidence for grounded AI analysis"],
  ["Research Gap Detection", "Identifying unexplored areas, limitations, and potential research gaps"],
  ["Novelty Assessment", "Evaluating the research idea against the analyzed literature"],
  ["Research Suggestions", "Generating possible improvements and directions for future research"],
];

const card = { background: "#fff", border: `1px solid ${C.line}`, borderRadius: 12, padding: 20 };
const input = { padding: 10, border: `1px solid ${C.line}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", width: "100%", boxSizing: "border-box" as const };
const primary = { padding: "11px 22px", border: 0, borderRadius: 8, background: C.accent, color: "#fff", fontSize: 15, cursor: "pointer" };
const ghost = { padding: "11px 22px", borderRadius: 8, border: `1px solid ${C.line}`, background: "#fff", color: C.ink, fontSize: 15, cursor: "pointer" };

export default function ResearchWizard({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("input");
  const [part, setPart] = useState<"a" | "b">("a");
  const [file, setFile] = useState<File | null>(null);
  const [idea, setIdea] = useState({ title: "", problem: "", objectives: "", methodology: "" });
  const [sources, setSources] = useState<string[]>([]);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState("");

  const toggle = (list: string[], set: (v: string[]) => void, id: string) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const inputValid = !!file || (idea.title.trim() !== "" && idea.problem.trim() !== "");
  const authSources = SOURCES.filter((s) => s.auth && sources.includes(s.id));

  function startProcessing() {
    setPart("a");
    setProgress(0);
    setFinished(false);
    setStep("processing");
  }

  function afterAccess() {
    if (hasAccess && authSources.length > 0) setStep("platforms");
    else startProcessing();
  }

  // Save the user's input and choices once, when processing starts
  useEffect(() => {
    if (step !== "processing") return;
    saveWizard(projectId, {
      inputType: file ? "pdf" : "idea",
      pdfFileName: file ? file.name : null,
      idea: file ? null : idea,
      selectedSources: sources,
      hasAuthorizedAccess: !!hasAccess,
      authorizedPlatforms: hasAccess ? platforms : [],
      status: "input-ready",
    }).catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Demo progress for each part. Replace with real FastAPI backend calls in later phases.
  useEffect(() => {
    if (step !== "processing") return;
    const t = setInterval(() => setProgress((p) => (p >= 100 ? 100 : p + 2)), 120);
    return () => clearInterval(t);
  }, [step, part]);

  const heading = (badge: string, title: string, sub: string) => (
    <div style={{ textAlign: "center", marginBottom: 20 }}>
      <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, background: C.soft, color: C.accent, fontSize: 12, marginBottom: 10 }}>
        {badge}
      </span>
      <h2 style={{ margin: "0 0 6px" }}>{title}</h2>
      <p style={{ margin: 0, color: C.muted, fontSize: 14 }}>{sub}</p>
    </div>
  );

  const nav = (back: (() => void) | null, next: () => void, ok: boolean, label = "Continue") => (
    <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
      {back && <button style={ghost} onClick={back}>Back</button>}
      <button style={{ ...primary, opacity: ok ? 1 : 0.5, cursor: ok ? "pointer" : "not-allowed" }} disabled={!ok} onClick={next}>
        {label}
      </button>
    </div>
  );

  const choiceCard = (selected: boolean) => ({
    ...card, cursor: "pointer", textAlign: "left" as const, display: "block", width: "100%",
    borderColor: selected ? C.accent : C.line, background: selected ? C.soft : "#fff",
  });

  const sourceGrid = (items: typeof SOURCES, list: string[], set: (v: string[]) => void) => (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
      {items.map((s) => (
        <label key={s.id} style={choiceCard(list.includes(s.id))}>
          <input type="checkbox" checked={list.includes(s.id)} onChange={() => toggle(list, set, s.id)} style={{ marginRight: 8 }} />
          <strong>{s.name}</strong>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>{s.desc}</div>
        </label>
      ))}
    </div>
  );

  if (step === "input")
    return (
      <section>
        {heading("Research Input", "Start your research analysis", "Choose how you want to provide your research")}
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          <div style={card}>
            <h3 style={{ marginTop: 0 }}>Upload research PDF</h3>
            <p style={{ color: C.muted, fontSize: 14 }}>Upload an existing research paper, proposal, thesis, or report.</p>
            <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            {file && <p style={{ fontSize: 13, color: C.accent }}>{file.name}</p>}
          </div>
          <div style={{ ...card, display: "grid", gap: 10 }}>
            <h3 style={{ margin: 0 }}>Enter research idea</h3>
            <p style={{ margin: 0, color: C.muted, fontSize: 14 }}>Enter your research topic, problem, or idea manually.</p>
            <input style={input} placeholder="Title" value={idea.title} onChange={(e) => setIdea({ ...idea, title: e.target.value })} />
            <textarea style={{ ...input, minHeight: 70 }} placeholder="Problem statement" value={idea.problem} onChange={(e) => setIdea({ ...idea, problem: e.target.value })} />
            <textarea style={{ ...input, minHeight: 50 }} placeholder="Objectives" value={idea.objectives} onChange={(e) => setIdea({ ...idea, objectives: e.target.value })} />
            <textarea style={{ ...input, minHeight: 50 }} placeholder="Methodology" value={idea.methodology} onChange={(e) => setIdea({ ...idea, methodology: e.target.value })} />
          </div>
        </div>
        {!inputValid && <p style={{ textAlign: "center", color: C.muted, fontSize: 13 }}>Upload a PDF, or enter a title and problem statement.</p>}
        {nav(null, () => setStep("sources"), inputValid)}
      </section>
    );

  if (step === "sources")
    return (
      <section>
        {heading("Literature Access", "Select scholarly sources", "Choose the scholarly platforms you want to search for literature related to your research")}
        {sourceGrid(SOURCES, sources, setSources)}
        {nav(() => setStep("input"), () => setStep("access"), sources.length > 0)}
      </section>
    );

  if (step === "access")
    return (
      <section>
        {heading("Literature Access", "Do you have authorized access?", "Some scholarly platforms may require institutional or personal subscription access for certain content")}
        <div style={{ display: "grid", gap: 12, maxWidth: 560, margin: "0 auto" }}>
          <button style={choiceCard(hasAccess === true)} onClick={() => setHasAccess(true)}>
            <strong>Yes, I have authorized access</strong>
            <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>I have legitimate subscription or institutional access to one or more selected platforms.</div>
          </button>
          <button style={choiceCard(hasAccess === false)} onClick={() => setHasAccess(false)}>
            <strong>No, I don&apos;t have subscription access</strong>
            <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Continue using publicly available metadata, abstracts, and permitted open-access content.</div>
          </button>
        </div>
        {nav(() => setStep("sources"), afterAccess, hasAccess !== null)}
      </section>
    );

  if (step === "platforms")
    return (
      <section>
        {heading("Authorized Access", "Select your authorized platforms", "Select the platforms for which you have legitimate subscription or institutional access")}
        {sourceGrid(authSources, platforms, setPlatforms)}
        {nav(() => setStep("access"), startProcessing, platforms.length > 0)}
      </section>
    );

  const list = part === "a" ? STAGES.slice(0, 4) : STAGES.slice(4);
  const offset = part === "a" ? 0 : 4;
  const current = Math.min(list.length - 1, Math.floor(progress / (100 / list.length)));
  const done = progress >= 100;

  return (
    <section>
      {heading("Research Analysis", "Preparing your research analysis", part === "a" ? "Processing your research input" : "Analyzing the literature")}
      <div style={{ height: 10, background: C.line, borderRadius: 5, overflow: "hidden", maxWidth: 640, margin: "0 auto" }}>
        <div style={{ width: `${progress}%`, height: "100%", background: C.accent, transition: "width .12s" }} />
      </div>
      <p style={{ textAlign: "center", fontSize: 13, color: C.muted }}>{progress}%</p>
      <div style={{ display: "grid", gap: 8, maxWidth: 640, margin: "0 auto" }}>
        {list.map(([name, desc], i) => {
          const active = i <= current || done;
          return (
            <div key={name} style={{ ...card, padding: 12, display: "flex", gap: 12, alignItems: "center", opacity: active ? 1 : 0.55 }}>
              <span style={{ width: 28, height: 28, borderRadius: 14, background: active ? C.accent : C.line, color: active ? "#fff" : C.ink, display: "grid", placeItems: "center", fontSize: 13, flexShrink: 0 }}>
                {offset + i + 1}
              </span>
              <div>
                <strong style={{ fontSize: 14 }}>{name}</strong>
                <div style={{ color: C.muted, fontSize: 12 }}>{desc}</div>
              </div>
            </div>
          );
        })}
      </div>
      {error && <p style={{ color: "#b3261e", textAlign: "center" }}>{error}</p>}
      {done && part === "a" && nav(null, () => { setProgress(0); setPart("b"); }, true, "Continue to analysis")}
      {done && part === "b" && !finished && nav(null, () => router.push(`/projects/${projectId}/results`), true, "View research results")}
      {finished && (
        <div style={{ ...card, maxWidth: 640, margin: "24px auto 0", textAlign: "center", color: C.muted }}>
          Your input and choices are saved. The results page connects here in the next phases.
        </div>
      )}
    </section>
  );
}