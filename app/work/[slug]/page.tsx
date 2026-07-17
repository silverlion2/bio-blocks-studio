import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";
import { EditorialFooter } from "@/components/site/EditorialFooter";
import { PublicSiteNav } from "@/components/site/PublicSiteNav";
import { caseStudies, getCaseStudy } from "@/lib/case-studies";

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const study = getCaseStudy((await params).slug);
  if (!study) return {};
  return {
    title: `${study.title} — Silverlion`,
    description: study.summary
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const study = getCaseStudy((await params).slug);
  if (!study) notFound();

  return (
    <main className="editorial-shell" style={{ "--study-accent": study.accent, "--study-surface": study.surface } as React.CSSProperties}>
      <PublicSiteNav compact />
      <article className="case-study">
        <header className="case-study__hero">
          <Link href="/#work" className="case-study__back"><ArrowLeft aria-hidden="true" /> All work</Link>
          <div className="case-study__hero-grid">
            <div>
              <span className="signal-kicker">{study.eyebrow}</span>
              <h1>{study.title}</h1>
              <p className="case-study__thesis">{study.thesis}</p>
            </div>
            <div className="case-study__summary">
              <p>{study.summary}</p>
              <div className="case-study__actions">
                <a className="signal-button signal-button--primary" href={study.liveUrl} target="_blank" rel="noreferrer">
                  Open product <ArrowUpRight aria-hidden="true" />
                </a>
                <a className="signal-button" href={study.sourceUrl} target="_blank" rel="noreferrer">
                  <Github aria-hidden="true" /> Source
                </a>
              </div>
            </div>
          </div>
          <div className="case-study__meta">
            <span><b>Status</b>{study.status}</span>
            <span><b>Role</b>Research · Product · Design · Build</span>
            <span><b>Stack</b>{study.stack.join(" · ")}</span>
          </div>
        </header>

        <figure className="case-study__visual">
          <Image src={study.image} alt={`${study.title} product interface`} fill priority sizes="(max-width: 900px) 100vw, 1200px" />
        </figure>

        <section className="case-study__section case-study__section--split">
          <div><span className="signal-index">01 / Problem</span><h2>Finding the useful signal inside the noise.</h2></div>
          <div className="case-study__prose">{study.problem.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </section>

        <section className="case-study__section">
          <span className="signal-index">02 / Approach</span>
          <div className="case-study__approach-grid">
            {study.approach.map((item, index) => (
              <div key={item.title} className="case-study__approach-card">
                <span>0{index + 1}</span><h3>{item.title}</h3><p>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="case-study__section case-study__section--split">
          <div><span className="signal-index">03 / Decisions</span><h2>Deliberate constraints shaped the product.</h2></div>
          <ol className="case-study__decision-list">
            {study.decisions.map((decision) => <li key={decision}>{decision}</li>)}
          </ol>
        </section>

        <section className="case-study__proof">
          <div><span className="signal-index">04 / Proof of work</span><h2>What this project demonstrates</h2></div>
          <div className="case-study__tags">{study.demonstrates.map((item) => <span key={item}>{item}</span>)}</div>
          <p><b>Next signal:</b> {study.nextSignal}</p>
        </section>
      </article>
      <EditorialFooter />
    </main>
  );
}
