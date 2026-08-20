import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PublicSiteNav } from "@/components/site/PublicSiteNav";

export const metadata: Metadata = {
  title: "Now — Silverlion",
  description: "What Silverlion is building, studying, and looking for right now."
};

const workSignals = [
  {
    code: "BUILD",
    title: "Biopharma intelligence",
    body: "Developing BioQuantix around acquisition targets, clinical milestones, pipeline gaps, and evidence that can be traced rather than merely summarized."
  },
  {
    code: "METHOD",
    title: "Evidence-centered AI",
    body: "Studying how specialist AI products can compress research while keeping sources, uncertainty, and the path to a conclusion visible."
  },
  {
    code: "WRITE",
    title: "Research notes",
    body: "Turning product decisions into reusable ideas about domain research, decision interfaces, and building narrow tools that earn trust."
  }
];

const personalSignals = [
  {
    code: "CULTURE",
    title: "Mapping Shanghai after dark",
    body: "Outside work, I maintain Shanghai Rave Index—a personal archive and discovery tool for the city’s electronic music scene, its venues, artists, nights, and poster culture."
  }
];

export default function NowPage() {
  return (
    <main className="editorial-shell now-page">
      <PublicSiteNav compact />
      <header className="now-hero">
        <div>
          <span className="signal-kicker"><i /> Current transmission · August 2026</span>
          <h1>What I’m<br />tuning into <em>now.</em></h1>
        </div>
        <p>
          Professionally, I’m focused on domain-aware AI and decision intelligence for healthcare, markets, and knowledge work. Personal cultural projects live in their own lane below.
        </p>
      </header>

      <section className="now-lane" aria-labelledby="work-now-heading">
        <div className="now-lane__header">
          <span className="signal-index">01 / Career</span>
          <h2 id="work-now-heading">At work</h2>
          <p>The professional thread: building software that helps specialists navigate consequential, evidence-heavy decisions.</p>
        </div>
        <div className="now-signal-grid" aria-label="Current professional focus">
          {workSignals.map((signal, index) => (
            <article key={signal.code}>
              <div><span>0{index + 1}</span><b>{signal.code}</b></div>
              <h3>{signal.title}</h3>
              <p>{signal.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="now-lane now-lane--personal" aria-labelledby="personal-now-heading">
        <div className="now-lane__header">
          <span className="signal-index">02 / Personal</span>
          <h2 id="personal-now-heading">After hours</h2>
          <p>Curiosity, city life, and things I make because I care about the scene—not because they define my career.</p>
        </div>
        <div className="now-personal-grid">
          {personalSignals.map((signal) => (
            <article key={signal.code}>
              <div><b>{signal.code}</b><span>Personal field project</span></div>
              <h3>{signal.title}</h3>
              <p>{signal.body}</p>
              <Link href="/work/shanghai-rave-index">Read the field note <ArrowUpRight /></Link>
            </article>
          ))}
        </div>
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
    </main>
  );
}
