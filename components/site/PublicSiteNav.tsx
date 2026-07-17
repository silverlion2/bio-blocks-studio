import Link from "next/link";

export function PublicSiteNav({ compact = false }: { compact?: boolean }) {
  return (
    <nav aria-label="Primary navigation" className={compact ? "signal-nav signal-nav--compact" : "signal-nav"}>
      <Link href="/" className="signal-nav__mark" aria-label="Silverlion home">
        SL<span aria-hidden="true">/</span>26
      </Link>
      <div className="signal-nav__links">
        <Link href="/#work">Work</Link>
        <Link href="/now">Now</Link>
        <a href="https://github.com/silverlion2" target="_blank" rel="noreferrer">GitHub</a>
      </div>
    </nav>
  );
}
