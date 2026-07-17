export type CaseStudy = {
  slug: string;
  eyebrow: string;
  title: string;
  thesis: string;
  summary: string;
  status: string;
  accent: string;
  surface: string;
  image: string;
  liveUrl: string;
  sourceUrl: string;
  stack: string[];
  problem: string[];
  approach: Array<{ title: string; description: string }>;
  decisions: string[];
  demonstrates: string[];
  nextSignal: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "options-radar",
    eyebrow: "Fintech / decision support",
    title: "Options Radar",
    thesis: "Market structure, made legible.",
    summary:
      "A focused trading dashboard that brings gamma exposure, max pain, call and put walls, ticker analysis, and risk education into one decision surface.",
    status: "Live experiment",
    accent: "#B7FF3C",
    surface: "#14200F",
    image: "/case-studies/options-radar.png",
    liveUrl: "https://my-trading-app-xi.vercel.app",
    sourceUrl: "https://github.com/silverlion2/my-trading-app",
    stack: ["React", "Vite", "Market data", "Data visualization"],
    problem: [
      "Options traders often assemble a market view from several disconnected indicators, each with its own vocabulary and visual logic.",
      "The product question was not how to show more data. It was how to compress the signals into a surface that helps a person orient quickly without pretending uncertainty has disappeared."
    ],
    approach: [
      {
        title: "Start with orientation",
        description: "Lead with the current ticker and the few structural levels that frame the decision before exposing deeper detail."
      },
      {
        title: "Keep risk in the interface",
        description: "Treat education and risk language as part of the product, not as legal text hidden after the analysis."
      },
      {
        title: "Make signals comparable",
        description: "Use consistent visual hierarchy for gamma exposure, max pain, and option walls so users can scan for alignment and conflict."
      }
    ],
    decisions: [
      "A dashboard rather than a feed, because the job is comparison rather than consumption.",
      "Plain-language labels beside specialist metrics, preserving depth without requiring a glossary-first experience.",
      "A narrow initial scope around market structure instead of attempting to become a full brokerage terminal."
    ],
    demonstrates: ["Product framing", "Financial data UX", "Rapid prototyping", "Risk-aware interface design"],
    nextSignal: "Improve signal provenance and add clearer historical context around each level."
  },
  {
    slug: "shanghai-rave-index",
    eyebrow: "Culture / data product",
    title: "Shanghai Rave Index",
    thesis: "The underground, indexed.",
    summary:
      "A living calendar and field guide for Shanghai techno, house, bass, trance, DJs, venues, tickets, and poster culture.",
    status: "Live and evolving",
    accent: "#E6A6FF",
    surface: "#15131F",
    image: "/case-studies/shanghai-rave-index.png",
    liveUrl: "https://raveindexsh.top/",
    sourceUrl: "https://github.com/silverlion2/shanghai-rave-calendar-2026",
    stack: ["Supabase", "Static web", "Event data", "Editorial curation"],
    problem: [
      "Nightlife information is highly visual, time-sensitive, and scattered across posters, social posts, ticket pages, venue accounts, and word of mouth.",
      "A normal events directory loses the culture; an image feed loses searchability. The opportunity sits between those two forms."
    ],
    approach: [
      {
        title: "Treat posters as data",
        description: "Preserve the visual artifact while extracting the date, venue, lineup, genre, and ticket information people need to act."
      },
      {
        title: "Build for discovery",
        description: "Connect events to venues, artists, and genres so the calendar becomes a map of a scene rather than a list of dates."
      },
      {
        title: "Keep the editorial voice",
        description: "Use naming, curation, and visual texture that belong to nightlife instead of defaulting to generic city-guide polish."
      }
    ],
    decisions: [
      "A calendar-led information architecture, because date is the strongest intent signal for people deciding where to go.",
      "High-contrast poster-forward presentation to retain the identity of each event.",
      "A lightweight publishing system that can evolve with the scene and its irregular source material."
    ],
    demonstrates: ["Messy-data structuring", "Cultural product design", "Information architecture", "Editorial systems"],
    nextSignal: "Deepen venue and artist histories so one night of discovery becomes a durable cultural archive."
  },
  {
    slug: "bioquantix",
    eyebrow: "AI / market intelligence",
    title: "BioQuantix",
    thesis: "Biopharma intelligence without the terminal tax.",
    summary:
      "An AI-assisted research surface for acquisition targets, clinical milestones, pipeline gaps, and emerging asset signals.",
    status: "Active prototype",
    accent: "#77F2E6",
    surface: "#101A1A",
    image: "/case-studies/bioquantix.png",
    liveUrl: "https://pharma-hunter-web.vercel.app",
    sourceUrl: "https://github.com/silverlion2/pharma-hunter-web",
    stack: ["React", "Vite", "M&A research", "Pipeline analysis"],
    problem: [
      "Biopharma business development combines scientific evidence, clinical timelines, company strategy, and deal precedent. The signal is spread across sources built for different audiences.",
      "The product challenge is to help a researcher form and test a thesis while keeping evidence and uncertainty visible."
    ],
    approach: [
      {
        title: "Organize around the decision",
        description: "Frame the experience around target discovery, pipeline gaps, catalysts, and strategic fit rather than around document types."
      },
      {
        title: "Use AI for compression",
        description: "Apply machine assistance where it reduces reading and synthesis load, while keeping the underlying research path inspectable."
      },
      {
        title: "Separate signal from confidence",
        description: "Present emerging patterns as research prompts rather than converting incomplete evidence into false certainty."
      }
    ],
    decisions: [
      "A research terminal metaphor, because users need to move between an overview and evidence-rich drill-downs.",
      "Entity-centered navigation across companies, assets, indications, and milestones.",
      "Explicit prototype status while source coverage and evidence quality continue to improve."
    ],
    demonstrates: ["Domain-aware AI", "Research workflow design", "Healthcare intelligence", "Evidence-centered UX"],
    nextSignal: "Expand source coverage and make every synthesized claim easier to trace and challenge."
  }
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((study) => study.slug === slug);
}
