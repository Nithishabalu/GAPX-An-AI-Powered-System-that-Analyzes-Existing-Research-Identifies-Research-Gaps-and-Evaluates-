"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { getProject, Project } from "../lib/projects";
import {
  samplePapers, sampleRadar, sampleNovelty, sampleComparison,
  sampleUnresolved, sampleUnderexplored, sampleGaps, sampleSuggestions,
} from "../lib/sampleResults";

const C = { ink: "#14183c", muted: "#5b6080", line: "#d9dcef", accent: "#d6245a", soft: "#fdebf1" };
const card = { background: "#fff", border: `1px solid ${C.line}`, borderRadius: 12, padding: 20 };
const h2 = { margin: "0 0 12px", fontSize: 18 };
const btn = { padding: "10px 18px", border: 0, borderRadius: 8, background: C.accent, color: "#fff", fontSize: 14, cursor: "pointer", textDecoration: "none" };

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const W = 480, H = 220, pad = 30;
  const bw = (W - pad * 2) / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = H - pad - t * (H - pad * 2);
        return (
          <g key={t}>
            <line x1={pad} x2={W - pad} y1={y} y2={y} stroke={C.line} />
            <text x={4} y={y + 4} fontSize="10" fill={C.muted}>{t}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const h = d.value * (H - pad * 2);
        const x = pad + i * bw + bw * 0.2;
        return (
          <g key={d.label}>
            <rect x={x} y={H - pad - h} width={bw * 0.6} height={h} fill={C.accent} rx={3} />
            <text x={x + bw * 0.3} y={H - pad - h - 5} textAnchor="middle" fontSize="10" fill={C.ink}>{d.value.toFixed(2)}</text>
            <text x={x + bw * 0.3} y={H - 10} textAnchor="middle" fontSize="11" fill={C.muted}>{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Radar({ axes, a, b }: { axes: string[]; a: number[]; b: number[] }) {
  const cx = 180, cy = 160, r = 100, n = axes.length;
  const pt = (v: number, i: number) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + r * v * Math.cos(ang), cy + r * v * Math.sin(ang)];
  };
  const poly = (vals: number[]) => vals.map((v, i) => pt(v, i).join(",")).join(" ");
  return (
    <svg viewBox="0 0 360 320" style={{ width: "100%" }}>
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <polygon key={t} points={axes.map((_, i) => pt(t, i).join(",")).join(" ")} fill="none" stroke={C.line} />
      ))}
      {axes.map((name, i) => {
        const [x, y] = pt(1.18, i);
        const [lx, ly] = pt(1, i);
        return (
          <g key={name}>
            <line x1={cx} y1={cy} x2={lx} y2={ly} stroke={C.line} />
            <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fill={C.muted}>{name}</text>
          </g>
        );
      })}
      <polygon points={poly(b)} fill="#5b6080" fillOpacity={0.15} stroke="#5b6080" strokeWidth={2} />
      <polygon points={poly(a)} fill={C.accent} fillOpacity={0.25} stroke={C.accent} strokeWidth={2} />
      <rect x={90} y={300} width={10} height={10} fill={C.accent} />
      <text x={105} y={309} fontSize="11" fill={C.ink}>Your research</text>
      <rect x={195} y={300} width={10} height={10} fill="#5b6080" />
      <text x={210} y={309} fontSize="11" fill={C.ink}>Literature average</text>
    </svg>
  );
}

function Network({ papers }: { papers: typeof samplePapers }) {
  const cx = 200, cy = 150, r = 110;
  const pts = papers.map((p, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / papers.length;
    return { ...p, x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
  return (
    <svg viewBox="0 0 400 300" style={{ width: "100%" }}>
      {pts.map((p) => (
        <line key={"l" + p.id} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={C.accent} strokeOpacity={0.35} strokeWidth={1 + p.score * 5} />
      ))}
      {pts.map((p) => (
        <g key={p.id}>
          <circle cx={p.x} cy={p.y} r={15} fill="#fff" stroke={C.accent} strokeWidth={2} />
          <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="11" fill={C.ink}>P{p.id}</text>
        </g>
      ))}
      <circle cx={cx} cy={cy} r={28} fill={C.accent} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fill="#fff">Yours</text>
    </svg>
  );
}

function Gauge({ value }: { value: number }) {
  const len = Math.PI * 90;
  const label = value >= 0.7 ? "High novelty" : value >= 0.4 ? "Moderate novelty" : "Low novelty";
  return (
    <svg viewBox="0 0 220 140" style={{ width: "100%", maxWidth: 320 }}>
      <path d="M 20 110 A 90 90 0 0 1 200 110" fill="none" stroke={C.line} strokeWidth={18} strokeLinecap="round" />
      <path d="M 20 110 A 90 90 0 0 1 200 110" fill="none" stroke={C.accent} strokeWidth={18} strokeLinecap="round" strokeDasharray={`${value * len} ${len}`} />
      <text x={110} y={100} textAnchor="middle" fontSize="30" fontWeight="700" fill={C.ink}>{Math.round(value * 100)}%</text>
      <text x={110} y={125} textAnchor="middle" fontSize="12" fill={C.muted}>{label}</text>
    </svg>
  );
}

export default function ResultsClient({ projectId }: { projectId: string }) {
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

  const extra = (project ?? {}) as unknown as { selectedSources?: string[]; inputType?: string };
  const cell = { padding: "10px 12px", borderBottom: `1px solid ${C.line}`, textAlign: "left" as const, verticalAlign: "top" as const, fontSize: 14 };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f5fb", color: C.ink, fontFamily: "system-ui, sans-serif" }}>
      <style>{`@media print { .no-print { display: none !important; } body { background: #fff; } }`}</style>
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: 24, display: "grid", gap: 20 }}>
        <div className="no-print">
          <Link href={`/projects/${projectId}`} style={{ color: C.accent }}>Back to project</Link>
        </div>
        {state === "loading" && <p>Loading...</p>}
        {state === "missing" && <p>Project not found.</p>}
        {state === "ready" && project && (
          <>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
              <div>
                <h1 style={{ margin: "0 0 4px" }}>{project.title}</h1>
                <div style={{ color: C.accent, fontWeight: 600 }}>{project.id} &middot; Research gap report</div>
              </div>
              <button className="no-print" style={btn} onClick={() => window.print()}>Download PDF report</button>
            </header>

            <div className="no-print" style={{ ...card, background: C.soft, borderColor: C.accent, fontSize: 14 }}>
              This page shows sample data. Real papers, gaps and scores appear once the backend is connected.
            </div>

            <section style={card}>
              <h2 style={h2}>Summary</h2>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                {[
                  ["Project ID", project.id],
                  ["Input", extra.inputType === "pdf" ? "Research PDF" : "Research idea"],
                  ["Sources searched", String(extra.selectedSources?.length ?? 0)],
                  ["Papers analyzed", String(samplePapers.length)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ color: C.muted, fontSize: 12 }}>{k}</div>
                    <div style={{ fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
            </section>

            <section style={card}>
              <h2 style={h2}>Relevant papers</h2>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>{["#", "Title", "Source", "Year", "Similarity", "Access"].map((h) => (
                      <th key={h} style={{ ...cell, color: C.muted, fontWeight: 600 }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {samplePapers.map((p) => (
                      <tr key={p.id}>
                        <td style={cell}>P{p.id}</td>
                        <td style={cell}>{p.title}</td>
                        <td style={cell}>{p.source}</td>
                        <td style={cell}>{p.year}</td>
                        <td style={cell}>{p.score.toFixed(2)}</td>
                        <td style={cell}>{p.access}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section style={card}>
              <h2 style={h2}>Comparative analysis</h2>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>{["", "Similarities", "Differences"].map((h) => (
                      <th key={h} style={{ ...cell, color: C.muted, fontWeight: 600 }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {sampleComparison.map((r) => (
                      <tr key={r.topic}>
                        <td style={{ ...cell, fontWeight: 600 }}>{r.topic}</td>
                        <td style={cell}>{r.similar}</td>
                        <td style={cell}>{r.different}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", marginTop: 16 }}>
                <div style={{ background: "#f4f5fb", borderRadius: 8, padding: 12, fontSize: 14 }}>
                  <strong>Unresolved problems</strong>
                  <div style={{ color: C.muted, marginTop: 4 }}>{sampleUnresolved}</div>
                </div>
                <div style={{ background: "#f4f5fb", borderRadius: 8, padding: 12, fontSize: 14 }}>
                  <strong>Underexplored areas</strong>
                  <div style={{ color: C.muted, marginTop: 4 }}>{sampleUnderexplored}</div>
                </div>
              </div>
            </section>

            <section style={card}>
              <h2 style={h2}>Candidate research gaps</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {sampleGaps.map((g, i) => (
                  <div key={g.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ width: 26, height: 26, borderRadius: 13, background: C.accent, color: "#fff", display: "grid", placeItems: "center", fontSize: 12, flexShrink: 0 }}>{i + 1}</span>
                    <div>
                      <strong>{g.title}</strong>
                      <div style={{ color: C.muted, fontSize: 13 }}>{g.evidence}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={card}>
              <h2 style={h2}>Graphical analytics</h2>
              <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                <div>
                  <h3 style={{ fontSize: 14, color: C.muted }}>Bar chart: similarity by paper</h3>
                  <BarChart data={samplePapers.map((p) => ({ label: `P${p.id}`, value: p.score }))} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, color: C.muted }}>Radar chart: your research vs. literature</h3>
                  <Radar axes={sampleRadar.axes} a={sampleRadar.yours} b={sampleRadar.literature} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, color: C.muted }}>Network graph: paper relationships</h3>
                  <Network papers={samplePapers} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, color: C.muted }}>Gauge chart: novelty assessment</h3>
                  <Gauge value={sampleNovelty} />
                </div>
              </div>
            </section>

            <section style={card}>
              <h2 style={h2}>AI research suggestions</h2>
              <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6 }}>
                {sampleSuggestions.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}