// SAMPLE DATA. Replace with real results from the backend in later phases.
export const samplePapers = [
  { id: 1, title: "Sample paper 1: closest related approach", source: "IEEE Xplore", year: 2024, score: 0.87, access: "Full text" },
  { id: 2, title: "Sample paper 2: similar method, different domain", source: "OpenAlex", year: 2023, score: 0.81, access: "Full text" },
  { id: 3, title: "Sample paper 3: survey of the area", source: "Semantic Scholar", year: 2023, score: 0.74, access: "Abstract only" },
  { id: 4, title: "Sample paper 4: related dataset study", source: "SpringerLink", year: 2022, score: 0.69, access: "Abstract only" },
  { id: 5, title: "Sample paper 5: partial overlap", source: "ScienceDirect", year: 2021, score: 0.62, access: "Abstract only" },
  { id: 6, title: "Sample paper 6: early foundational work", source: "ACM Digital Library", year: 2020, score: 0.55, access: "Abstract only" },
];

export const sampleRadar = {
  axes: ["Objectives", "Methodology", "Findings", "Limitations", "Novelty"],
  yours: [0.8, 0.7, 0.5, 0.6, 0.85],
  literature: [0.7, 0.8, 0.75, 0.65, 0.4],
};

export const sampleNovelty = 0.72;

export const sampleComparison = [
  { topic: "Objectives", similar: "Most papers target the same core problem.", different: "Your objectives add a goal the papers do not address." },
  { topic: "Methodologies", similar: "Common use of standard machine learning pipelines.", different: "Your method combines techniques that are rarely used together." },
  { topic: "Findings", similar: "Reported accuracy is in a similar range.", different: "Few papers report results on your type of data." },
  { topic: "Limitations", similar: "Small datasets and limited testing are common.", different: "Your design reduces one limitation the papers share." },
];

export const sampleUnresolved = "Sample: problems that remain open across the retrieved papers appear here.";
export const sampleUnderexplored = "Sample: areas covered by few or no retrieved papers appear here.";

export const sampleGaps = [
  { title: "Sample gap 1: limited testing on real-world data", evidence: "Supported by papers 1, 2 and 4." },
  { title: "Sample gap 2: no comparison across methods", evidence: "Supported by papers 2 and 3." },
  { title: "Sample gap 3: scalability is rarely evaluated", evidence: "Supported by papers 5 and 6." },
];

export const sampleSuggestions = [
  "Sample: evaluate the approach on a larger, more varied dataset.",
  "Sample: compare against the closest two methods under the same conditions.",
  "Sample: add a scalability study as a future direction.",
];