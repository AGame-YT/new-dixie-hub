"use client";

import { Icon } from "@/components/Icon";
import type { BadgeItem } from "@/lib/types";

/** ePraise-style recognition: value badges plus a downloadable report. */
export function BadgesReports({
  badges,
  studentName,
  demo
}: {
  badges: BadgeItem[];
  studentName: string;
  demo: boolean;
}) {
  const total = badges.reduce((sum, badge) => sum + badge.count, 0);

  const esc = (v: string) =>
    v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function downloadReport() {
    const date = new Date().toLocaleDateString("en-GB");
    const rows = badges
      .map((b) => `<tr><td>${esc(b.name)}</td><td>${b.count}</td><td>${esc(b.awardedFor)}</td></tr>`)
      .join("");
    const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>Report for ${esc(studentName)}</title>
<style>body{font-family:Raleway,Arial,sans-serif;max-width:720px;margin:40px auto;color:#0f336f}
h1{font-family:"EB Garamond",serif}table{width:100%;border-collapse:collapse}
td,th{padding:8px;border-bottom:1px solid #d7e0eb;text-align:left}</style>
<h1>Dixie Hub report: ${esc(studentName)}</h1><p>${date}${demo ? " · demo data" : ""}</p>
<p>${total} value badges earned.</p>
<table><tr><th>Value</th><th>Badges</th><th>Most recent</th></tr>${rows}</table>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `dixie-report-${studentName.replace(/\s+/g, "-").toLowerCase()}.html`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="badges-reports">
      <ul className="badge-list">
        {badges.map((badge) => (
          <li key={badge.id} className={`badge value-${badge.value}`} title={badge.awardedFor}>
            <span className="badge-medal">
              <Icon name="award" size={26} />
              <b>{badge.count}</b>
            </span>
            <strong>{badge.name}</strong>
          </li>
        ))}
      </ul>
      <div className="report-box">
        <p>
          <strong>{total}</strong> badges earned this year. Download a summary to share at home.
        </p>
        <button type="button" className="button primary small" onClick={downloadReport}>
          <Icon name="download" size={16} /> Download my report
        </button>
      </div>
    </div>
  );
}
