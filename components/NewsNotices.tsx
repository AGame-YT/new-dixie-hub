import { Icon } from "@/components/Icon";
import type { NewsItem, NoticeItem } from "@/lib/types";

export function NoticesList({ notices }: { notices: NoticeItem[] }) {
  return (
    <ul className="notice-list">
      {notices.map((notice) => (
        <li key={notice.id} className={notice.pinned ? "pinned" : ""}>
          <span className="notice-icon">
            <Icon name={notice.pinned ? "pin" : "notice"} size={17} />
          </span>
          <div>
            <small>
              {notice.audience} · {notice.date}
            </small>
            <strong>{notice.title}</strong>
            <p>{notice.body}</p>
          </div>
        </li>
      ))}
      {notices.length === 0 && (
        <li className="empty-state small">
          <Icon name="bulletin" />
          <p>No notices this week.</p>
        </li>
      )}
    </ul>
  );
}

export function NewsList({ news }: { news: NewsItem[] }) {
  return (
    <ul className="news-feed">
      {news.map((item) => (
        <li key={item.id}>
          <span className={`news-chip ${item.accent}`}>
            <Icon name={item.category === "Sport" ? "trophy" : "news"} size={18} />
          </span>
          <div>
            <small>
              {item.category} · {item.date}
            </small>
            <strong>{item.title}</strong>
            <p>{item.excerpt}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
