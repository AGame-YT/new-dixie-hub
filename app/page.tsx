import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { Icon } from "@/components/Icon";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ValuesPillars } from "@/components/ValuesPillars";
import { AnalyticsBeacon } from "@/components/AnalyticsBeacon";
import { TrackedLink } from "@/components/TrackedLink";
import { googleAuthConfigured } from "@/lib/auth";
import {
  learningLinks,
  schoolConfig,
  schoolNews,
  schoolNotices
} from "@/lib/config";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const primaryLinks = learningLinks.filter((link) =>
    [
      "classroom",
      "gmail",
      "drive",
      "calendar",
      "cognitive-education",
      "library",
      "it-help",
      "wellbeing"
    ].includes(link.id)
  );

  return (
    <div className="public-page">
      <AnalyticsBeacon />
      <header className="public-header">
        <BrandMark />
        <nav aria-label="Public navigation">
          <a href={schoolConfig.website} target="_blank" rel="noreferrer">
            School website
          </a>
          <a href="#news">News</a>
          <a href="#notices">Notices</a>
          <ThemeToggle />
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />
          <div className="hero-copy">
            <img
              className="hero-school-logo"
              src="/brand/dixie-logo.png"
              alt="The Dixie Grammar School"
            />
            <span className="hero-kicker">
              <span /> The student homepage
            </span>
            <h1>
              Fulfilling your potential,
              <br />
              every <em>day at Dixie.</em>
            </h1>
            <p>
              Homework, timetable, school email and the links you use every day,
              brought together around the values that define our school.
            </p>
            <div className="hero-actions">
              {googleAuthConfigured ? (
                <Link
                  className="button google-button"
                  href="/api/auth/signin/google?callbackUrl=/dashboard"
                >
                  <span className="google-g">G</span>
                  Sign in with Google
                </Link>
              ) : (
                <span className="button google-button disabled" aria-disabled>
                  <span className="google-g">G</span>
                  Google sign-in needs setup
                </span>
              )}
              <Link className="button secondary" href="/dashboard?demo=1">
                Explore the demo <Icon name="arrow" size={17} />
              </Link>
            </div>
            <p className="signin-note">
              <Icon name="check" size={16} />
              Sign in with your school Google account to see homework, timetable
              and email summary.
            </p>
          </div>

          <div className="hero-dashboard" aria-hidden="true">
            <div className="mock-window">
              <div className="mock-top">
                <BrandMark compact />
                <span />
                <span />
              </div>
              <div className="mock-body">
                <div className="mock-greeting">
                  <div>
                    <small>GOOD MORNING</small>
                    <strong>Ready for the day, Alex?</strong>
                  </div>
                  <span className="mock-date">20 JUN</span>
                </div>
                <div className="mock-stats">
                  <div><b>3</b><span>Due soon</span></div>
                  <div><b>5</b><span>Lessons</span></div>
                  <div><b>2</b><span>Unread</span></div>
                </div>
                <div className="mock-columns">
                  <div>
                    <span>TO DO</span>
                    <article><i className="plum" /><b>Macbeth analysis</b><small>English · Today</small></article>
                    <article><i className="blue" /><b>Quadratic equations</b><small>Maths · Tomorrow</small></article>
                  </div>
                  <div>
                    <span>IN PROGRESS</span>
                    <article><i className="green" /><b>Rates of reaction</b><small>Chemistry · Fri</small></article>
                  </div>
                </div>
              </div>
            </div>
            <div className="floating-card floating-homework">
              <span className="link-icon amber"><Icon name="homework" /></span>
              <div><b>Homework updated</b><small>3 items due this week</small></div>
            </div>
            <div className="floating-card floating-next">
              <small>NEXT LESSON · 09:50</small>
              <b>Mathematics</b>
              <span>Room M4 · Mr Shah</span>
            </div>
          </div>
        </section>

        <div className="public-values-wrap">
          <ValuesPillars />
        </div>

        <section className="public-section quick-links-section">
          <div className="public-section-heading">
            <div>
              <span className="eyebrow">Start here</span>
              <h2>Your everyday links</h2>
            </div>
            <Link href="/links?demo=1" className="text-link">
              View all resources <Icon name="arrow" size={16} />
            </Link>
          </div>
          <div className="public-quick-grid">
            {primaryLinks.map((link) => (
              <TrackedLink
                href={link.url}
                target={link.url.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer"
                key={link.id}
                className="public-quick-card"
                trackingId={link.id}
                trackingLabel={link.title}
              >
                <span className={`link-icon ${link.colour}`}>
                  <Icon name={link.icon} />
                </span>
                <strong>{link.title}</strong>
                <small>{link.description}</small>
                <Icon name="external" size={15} className="quick-external" />
              </TrackedLink>
            ))}
          </div>
        </section>

        <section className="public-section split-section">
          <div id="news" className="public-panel">
            <div className="public-section-heading">
              <div>
                <span className="eyebrow">Around school</span>
                <h2>Latest news</h2>
              </div>
              <a
                href="https://www.dixie.org.uk/news-events"
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                More news <Icon name="arrow" size={16} />
              </a>
            </div>
            <div className="news-list">
              {schoolNews.map((item) => (
                <article className="news-card" key={item.id}>
                  <span className={`news-art ${item.accent}`}>
                    <Icon name={item.category === "Sport" ? "star" : "spark"} size={31} />
                  </span>
                  <div>
                    <span>{item.category} · {item.date}</span>
                    <h3>{item.title}</h3>
                    <p>{item.excerpt}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div id="notices" className="public-panel notice-public-panel">
            <div className="public-section-heading">
              <div>
                <span className="eyebrow">Don&apos;t miss</span>
                <h2>School notices</h2>
              </div>
            </div>
            <div className="notices-list">
              {schoolNotices.map((notice) => (
                <article className="notice-card" key={notice.id}>
                  <span className={notice.pinned ? "notice-icon pinned" : "notice-icon"}>
                    <Icon name={notice.pinned ? "pin" : "bell"} size={18} />
                  </span>
                  <div>
                    <span>{notice.audience} · {notice.date}</span>
                    <h3>{notice.title}</h3>
                    <p>{notice.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <BrandMark />
        <p>Internal student hub for Dixie Grammar School.</p>
        <div>
          <Link href="/privacy">Privacy</Link>
          <a href="mailto:itsupport@dixie.org.uk">IT help</a>
          <span>© {new Date().getFullYear()} Dixie Grammar School</span>
        </div>
      </footer>
    </div>
  );
}
