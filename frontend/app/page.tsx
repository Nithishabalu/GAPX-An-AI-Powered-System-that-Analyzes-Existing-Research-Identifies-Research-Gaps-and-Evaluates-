import Link from "next/link";

const link = { color: "#5b6080", textDecoration: "none", fontSize: 14 };

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#f4f5fb", color: "#14183c", fontFamily: "system-ui, sans-serif" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1000, margin: "0 auto", padding: "18px 24px" }}>
        <strong style={{ fontSize: 20 }}>GAPX</strong>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <a href="#top" style={link}>Home</a>
          <a href="#about" style={link}>About</a>
          <a href="#how" style={link}>How it works</a>
          <Link href="/login" style={{ ...link, color: "#d6245a", fontWeight: 600 }}>Log in</Link>
        </div>
      </nav>

      <main id="top" style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 680 }}>
          <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, background: "#fdebf1", color: "#d6245a", fontSize: 13, marginBottom: 16 }}>
            AI-powered research analysis
          </div>
          <h1 style={{ fontSize: 48, margin: "0 0 16px", lineHeight: 1.15 }}>
            Discover potential <span style={{ color: "#d6245a" }}>research gaps</span>
          </h1>
          <p style={{ color: "#5b6080", fontSize: 18, margin: "0 0 28px" }}>
            Analyze scholarly literature, compare existing research, and identify potential unexplored areas for your research.
          </p>
          <Link href="/dashboard" style={{ padding: "14px 28px", borderRadius: 8, background: "#d6245a", color: "#fff", textDecoration: "none", fontSize: 16 }}>
            Get started
          </Link>
        </div>
      </main>

      <section id="about" style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px", textAlign: "center" }}>
        <h2>About GAPX</h2>
        <p style={{ color: "#5b6080" }}>
          GAPX retrieves related papers from scholarly platforms, compares them with your research, and uses evidence-grounded AI to surface gaps and future directions.
        </p>
      </section>

      <section id="how" style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px 64px" }}>
        <h2 style={{ textAlign: "center" }}>How it works</h2>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          {[
            ["Provide your research", "Upload a PDF or enter your research idea."],
            ["Choose sources", "Select scholarly platforms and your access level."],
            ["Analyze literature", "Papers are retrieved, ranked, and compared."],
            ["Review gaps", "Get gaps, novelty assessment, and suggestions."],
          ].map(([t, d], i) => (
            <div key={t} style={{ background: "#fff", border: "1px solid #d9dcef", borderRadius: 12, padding: 20 }}>
              <div style={{ width: 28, height: 28, borderRadius: 14, background: "#d6245a", color: "#fff", display: "grid", placeItems: "center", fontSize: 13, marginBottom: 10 }}>{i + 1}</div>
              <strong>{t}</strong>
              <p style={{ color: "#5b6080", fontSize: 14, margin: "6px 0 0" }}>{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}