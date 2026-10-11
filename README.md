# Dixie Hub

Dixie Hub is a responsive internal student homepage for Dixie Grammar School. It brings homework, timetable, school email, notices and everyday learning links into one calm Chromebook-friendly dashboard.

The first release is designed for a single Google-authenticated student. It uses live Google Classroom and Gmail data when the relevant APIs are configured and automatically falls back to polished seeded demo data when they are not.

## What is included

- Public hub page with school links, news, notices and Google sign-in
- Personalised dashboard with student name/avatar and today’s overview
- Drag-and-drop homework Kanban board with local status overrides
- Google Classroom read-only service and sync endpoint
- Gmail metadata-only unread email summary service
- Daily and weekly timetable UI with demo provider
- Filterable learning-links directory
- Student preferences and light/dark mode
- Protected staff admin dashboard with audited house-point controls
- Privacy-conscious login, page-view, link-click and homework analytics
- Prometheus metrics with a provisioned Grafana operations dashboard
- Prisma/SQLite schema and seed data
- Docker image, Compose service and Caddy example for `dh.gs-net.co.uk`
- Privacy placeholder and minimal-data service boundaries

## Stack

- Next.js App Router
- TypeScript and React
- NextAuth.js with Google OAuth
- Prisma with SQLite for the prototype
- Plain component-scoped design system in `app/globals.css`
- Native browser drag-and-drop, with an accessible status selector fallback

## Local setup

Requirements: Node.js 22 or newer.

```bash
npm install
copy .env.example .env
npx prisma db push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Until Google credentials are added, use **Explore the demo**. Demo Kanban moves are saved both to SQLite (when available) and to the browser as a graceful offline fallback.

Useful commands:

```bash
npm run typecheck
npm run build
npm run db:push
npm run db:seed
npm run db:studio
```

## Environment

Copy `.env.example` to `.env` and set:

| Variable | Purpose |
| --- | --- |
| `NEXTAUTH_URL` | Local or public canonical URL |
| `NEXTAUTH_SECRET` | Long random secret used to protect auth cookies |
| `DATABASE_URL` | SQLite connection, normally `file:./dev.db` locally |
| `GOOGLE_CLIENT_ID` | Google OAuth web client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `ENABLE_CLASSROOM_API` | Requests Classroom scopes and enables live sync |
| `ENABLE_GMAIL_API` | Requests Gmail metadata scope and enables email summary |
| `ENABLE_CALENDAR_API` | Reserves Calendar read-only access for the future adapter |
| `DEMO_MODE` | Allows the no-account demo and demo persistence endpoint |
| `ALLOWED_GOOGLE_EMAIL` | Optional single-student allow-list for the prototype |
| `ALLOWED_GOOGLE_DOMAIN` | Optional school-domain allow-list |
| `ADMIN_GOOGLE_EMAILS` | Comma-separated Google accounts permitted to use `/admin` |
| `ADMIN_LOCAL_USERNAME` | Local administrator username used before Google OAuth |
| `ADMIN_LOCAL_PASSWORD` | Strong server-only local administrator password |
| `METRICS_BEARER_TOKEN` | Internal secret used by Prometheus to scrape app metrics |
| `GRAFANA_ADMIN_USER` | Separate Grafana administrator username |
| `GRAFANA_ADMIN_PASSWORD` | Separate Grafana administrator password |

Generate a suitable auth secret with:

```bash
openssl rand -base64 32
```

Do not commit `.env`. Google client secrets and OAuth tokens must never be placed in frontend code or public environment variables.

## Google OAuth setup

1. Create or select a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Configure the OAuth consent screen for the test user or school organisation.
3. Create an **OAuth client ID** of type **Web application**.
4. Add these authorised redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://dh.gs-net.co.uk/api/auth/callback/google`
5. Put the client ID and secret in `.env`.
6. Set `NEXTAUTH_URL=https://dh.gs-net.co.uk` on the server.
7. For the one-student prototype, set `ALLOWED_GOOGLE_EMAIL` to the approved account.

The app uses JWT sessions. Google access/refresh tokens remain in the encrypted, HTTP-only NextAuth session cookie and are not exposed through the browser session object. The `OAuthAccount` model stores account metadata only; it intentionally has no access-token or refresh-token fields.

Base OAuth scopes:

```text
openid
email
profile
```

## Google Classroom

Enable the [Google Classroom API](https://console.cloud.google.com/apis/library/classroom.googleapis.com), then set:

```env
ENABLE_CLASSROOM_API=true
```

Read-only scopes requested:

```text
https://www.googleapis.com/auth/classroom.courses.readonly
https://www.googleapis.com/auth/classroom.coursework.me.readonly
https://www.googleapis.com/auth/classroom.student-submissions.me.readonly
```

The `/api/classroom` endpoint:

1. Reads active courses and published coursework.
2. Reads the signed-in student’s own submission state.
3. Creates or updates `HomeworkItem` records.
4. Preserves a local `HomeworkStatusOverride` for New, To Do and In Progress.
5. Lets authoritative Classroom `TURNED_IN` and `RETURNED` states become Submitted and Complete.
6. Returns demo work if credentials, consent or the API are unavailable.

For current scope descriptions and verification requirements, use Google’s official [Classroom authorization guide](https://developers.google.com/workspace/classroom/guides/auth).

## Gmail summary

Gmail access is off by default because Google treats Gmail scopes as sensitive/restricted and school approval may be required. Enable the Gmail API and set:

```env
ENABLE_GMAIL_API=true
```

The app requests:

```text
https://www.googleapis.com/auth/gmail.metadata
```

`/api/email-summary` fetches only a small list of unread message metadata: sender, subject, snippet, received time and important label. It does not persist full email content. See Google’s official [Gmail scope documentation](https://developers.google.com/workspace/gmail/api/auth/scopes) before production use.

Changing an enabled API changes the requested OAuth scope set. Existing test users may need to sign out, revoke the test app’s previous grant, and sign back in to grant the new scopes.

## Demo versus live mode

Demo data lives in:

- `lib/demo-data.ts` — homework, email and timetable
- `lib/config.ts` — links, notices, news and school configuration
- `prisma/seed.ts` — database seed mapping

Live behaviour is controlled independently:

- Classroom enabled + authenticated: live coursework, with demo fallback on errors
- Gmail enabled + authenticated: live unread metadata, with demo fallback on errors
- Timetable: demo provider until Calendar or MIS integration is added
- No Google credentials: public page and full demo dashboard still work

This separation is intentional: no fake item is silently written back to Google.

## Data model

The Prisma schema contains:

- `User`
- `OAuthAccount` metadata (no token values)
- `HomeworkItem`
- `HomeworkStatusOverride`
- `LearningLink`
- `SchoolNotice`
- `SchoolNewsItem`
- `TimetableEntry`
- `House` and audited `HousePointChange`
- `AnalyticsEvent`
- `AdminAuditLog`

SQLite is appropriate for this single-student prototype. Move to PostgreSQL before a larger rollout, especially if multiple app replicas or staff administration are introduced.

## Docker and Caddy deployment

For the complete deploy-key and server walkthrough, see
[`DEPLOYMENT.md`](DEPLOYMENT.md).

The supplied Compose file expects the app and Caddy to share an existing Docker network named `caddy`. If your network has another name, set it before launching:

```bash
set CADDY_NETWORK=your-caddy-network
docker compose up -d --build
```

On Linux:

```bash
CADDY_NETWORK=your-caddy-network docker compose up -d --build
```

The service:

- is named `dixie-hub`
- exposes port `3000` only to the shared Docker network
- mounts `./data` to `/app/data`
- creates/updates and seeds the SQLite database on startup
- has a health endpoint at `/api/health`
- sets the canonical URL to `https://dh.gs-net.co.uk`

Add the contents of `Caddyfile.example` to the server Caddy configuration and reload Caddy. The essential route is:

```caddyfile
dh.gs-net.co.uk {
    reverse_proxy dixie-hub:3000
}
```

Ensure DNS for `dh.gs-net.co.uk` points to the development server before Caddy requests its certificate.

## Editing school content

For the prototype, edit `lib/config.ts` for:

- school identity and support contact
- learning links
- public news
- school notices

Then run `npm run db:seed` to copy the new values into the database seed. The current pages use the version-controlled config directly so changes are easy to review. A staff admin portal can move these reads fully into the database later.

## Security and privacy notes

- OAuth scopes are conditional and read-only.
- Secrets are server-only.
- Access and refresh tokens are not logged or exposed to client components.
- Gmail full message bodies are neither requested nor stored.
- The public site is marked `noindex`.
- The Caddy example adds HSTS, content-type, referrer and permissions headers.
- Demo mode should be disabled for a production school rollout if an unauthenticated preview is not wanted.
- Replace the privacy placeholder with a school-approved notice, retention schedule and data-protection review.
- Add audit logging, formal account lifecycle handling and safeguarding review before multi-student use.

### School-wide Google Workspace note

This version does **not** use domain-wide delegation. A future school-wide rollout would need a dedicated service account or approved Workspace application, Google Admin configuration, carefully limited delegated scopes, governance sign-off and explicit code paths separated from student OAuth. Do not add a service-account private key to this repository.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Public/logged-out student hub |
| `/dashboard` | Personalised hub |
| `/homework` | Full Kanban homework board |
| `/links` | Learning links directory |
| `/settings` | Student preferences/account view |
| `/admin` | Protected staff operations dashboard |
| `/privacy` | Prototype privacy placeholder |
| `/api/classroom` | Classroom sync/fallback |
| `/api/email-summary` | Gmail metadata summary/fallback |
| `/api/timetable` | Timetable provider boundary |
| `/api/homework/[id]` | Persist local status override |
| `/api/health` | Container health check |
| `/api/house-points` | Public current house totals |
| `/api/admin/houses/[id]` | Audited admin house-point update |
| `/api/admin/overview` | Protected admin analytics summary |
| `/api/track` | Minimal first-party activity collection |
| `/api/metrics` | Token-protected Prometheus export |

## Admin analytics and Grafana

The app records deliberately small first-party events: successful login,
page view, outbound learning-link click, homework status movement and Google
sync outcome. It does not record full email content, OAuth tokens, search text,
homework descriptions or precise device/location information.

SQLite remains the source of truth for users, house points and audit records.
Prometheus scrapes aggregate metrics every 30 seconds and retains 180 days of
time-series history. Grafana is automatically provisioned with the
`Dixie Hub Overview` dashboard.

Admin access can use server-only local credentials, or a signed-in Google email
listed in `ADMIN_GOOGLE_EMAILS`. Local credentials exist specifically so the
backend can be used before Workspace OAuth is configured. Grafana uses a
separate administrator credential and anonymous access is disabled.

## Future roadmap

- Domain-wide Google Workspace integration
- Staff admin portal
- Whole-school, year-group and house notices
- Google Calendar integration
- MIS/timetable integration
- Parent view
- Push notifications
- Homework analytics
- Safeguarding-approved messaging
- Chromebook managed homepage deployment
- PostgreSQL, backups and multi-instance deployment
- Staff-managed links, news and notices

Before enabling any school-wide integration, complete Google Workspace admin approval, data protection review, safeguarding review and user testing with students and staff.
