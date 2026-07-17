import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EditorialFooter } from "@/components/site/EditorialFooter";
import { PublicSiteNav } from "@/components/site/PublicSiteNav";

export const metadata: Metadata = {
  title: "Now — Silverlion",
  description: "What Silverlion is building, studying, and looking for right now."
};

const signals = [
  {
    code: "BUILD",
    title: "Domain-aware AI",
    body: "Small systems that understand the shape of a specialist decision—its evidence, vocabulary, uncertainty, and consequences."
  },
  {
    code: "STUDY",
    title: "Signals before interfaces",
    body: "How fragmented market, scientific, and cultural information can become a useful decision surface without losing provenance."
  },
  {
    code: "SHIP",
    title: "Narrow products, live early",
    body: "Shortening the distance between a strong domain question and a product that can be tested in the real world."
  }
];

export default function NowPage() {
  return (
    <main className="editorial-shell now-page">
      <PublicSiteNav compact />
      <header className="now-hero">
        <div>
          <span className="signal-kicker"><i /> Current transmission · July 2026</span>
          <h1>What I’m<br />tuning into <em>now.</em></h1>
        </div>
        <p>
          I’m building at the intersection of AI, market intelligence, healthcare, and culture—looking for places where better structure can change the quality of a decision.
        </p>
      </header>

      <section className="now-signal-grid" aria-label="Current areas of focus">
        {signals.map((signal, index) => (
          <article key={signal.code}>
            <div><span>0{index + 1}</span><b>{signal.code}</b></div>
            <h2>{signal.title}</h2>
            <p>{signal.body}</p>
          </article>
        ))}
      </section>

      <section className="now-open">
        <span className="signal-index">Open channel</span>
        <div>
          <h2>I’m interested in collaborators with hard-won domain knowledge.</h2>
          <p>If you know a decision that is still managed through scattered tabs, brittle spreadsheets, or institutional memory, I’d like to hear the shape of it.</p>
          <div className="case-study__actions">
            <a className="signal-button signal-button--primary" href="https://github.com/silverlion2" target="_blank" rel="noreferrer">Find me on GitHub <ArrowUpRight /></a>
            <Link className="signal-button" href="/#work">See selected work</Link>
          </div>
        </div>
      </section>

      <p className="now-note">This is a <a href="https://nownownow.com/about" target="_blank" rel="noreferrer">/now page</a>: a public snapshot, updated when the focus changes.</p>
      <EditorialFooter />
    </main>
  );
}
