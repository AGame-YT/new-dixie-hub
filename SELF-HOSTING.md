# Self-hosting from a Chromebook

This guide is for running Dixie Hub using only a web browser, for example on
a school-issued Chromebook where developer mode and the Linux terminal are
turned off. Nothing is installed on the Chromebook. The app runs on free cloud
services that you control from Chrome.

There are two options. You can use one or both.

| | Option 1: Render | Option 2: GitHub Codespaces |
| --- | --- | --- |
| Best for | A link to share with a teacher | Working on the code and seeing changes live |
| Link works when | Always, but it sleeps when idle and takes up to a minute to wake | Only while your codespace is running |
| After an edit | Rebuilds automatically after each push (about 5 minutes) | Updates as soon as you save the file |
| Data (bulletin, roles) | Goes back to demo data on each rebuild or restart | Kept until you delete the codespace |
| Cost | Free plan | Free monthly allowance on personal GitHub accounts |

To show a teacher your progress, use **Option 1**. They get one link that
always shows the latest version you pushed, and nobody has to log in to a
server or restart anything.

> Free plans and allowances change. Check Render's and GitHub's current
> pricing pages before relying on them. A managed Chromebook may block some
> websites. If github.com or render.com won't load, ask the school's IT team.

## What the teacher can open without signing in

Demo mode is on by default, so these pages work with no login:

| Page | Address |
| --- | --- |
| Student hub | `/dashboard?demo=1` |
| Teacher view | `/teacher?demo=1` |
| Bulletin calendar | `/bulletin?demo=1` (edits are not saved in demo mode) |

Add these to the end of whichever address you get below.

---

## Option 1: Render (one link that updates on every push)

[Render](https://render.com) builds the app from GitHub using this repository's
`Dockerfile` and `render.yaml`. Each time you push to the chosen branch, Render
rebuilds and replaces the running app on its own.

### One-time setup

1. Go to [render.com](https://render.com) and choose **Get started**. Sign up
   with your GitHub account.
2. When Render asks for GitHub access, allow it for the
   `new-dixie-hub` repository.
3. In the Render dashboard choose **New** → **Blueprint**.
4. Pick the `new-dixie-hub` repository. Render reads `render.yaml` and shows
   a web service called `dixie-hub` on the **Free** plan.
5. Render asks for `ADMIN_LOCAL_PASSWORD`. Type a strong password and keep it
   somewhere safe. It's the login for `/admin/login`, with the username
   `dixie-admin`.
6. Choose **Deploy Blueprint**. The first build takes about 5–10 minutes. You
   can watch progress in the service's **Logs** tab.
7. When the status shows **Live**, copy the service address from the top of
   the page. It looks like `https://dixie-hub-xxxx.onrender.com`.

Share `https://dixie-hub-xxxx.onrender.com/dashboard?demo=1` with your teacher.

### Deploying a work-in-progress branch

Render deploys the repository's default branch (`main`). To show work that is
still on another branch, open the service → **Settings** → **Build & Deploy**
→ **Branch**, and choose that branch. To publish manually instead, use
**Manual Deploy** → **Deploy latest commit**.

### Things to know about the free plan

- **It sleeps when idle.** After about 15 minutes with no visitors, the first
  visit takes up to a minute while it wakes up. Open the link a minute before
  showing it to someone.
- **Its storage isn't permanent.** The database is reset to demo data every
  time the app rebuilds or restarts. Bulletin notices and roles added there are
  lost. That's fine for showing progress. For real school use, use the school
  server ([DEPLOYMENT.md](DEPLOYMENT.md)) or a paid plan with a persistent disk.

---

## Option 2: GitHub Codespaces (live editing in the browser)

A codespace is a full development computer that runs in GitHub's cloud and
opens in a Chrome tab. This repository includes a `.devcontainer` setup, so
everything installs on its own and the app starts in development mode. In
development mode, any saved change appears in the browser within a second or
two, with no restart.

### Start a codespace

1. Open the repository on GitHub:
   <https://github.com/AGame-YT/new-dixie-hub>
2. Use the branch menu (top left of the file list) to pick the branch you want
   to work on.
3. Choose **Code** → **Codespaces** → **Create codespace on _branch_**.
4. Wait for the first setup to finish (about 3–5 minutes). It runs
   `scripts/dev-setup.sh`, which:
   - creates `.env` with random secrets,
   - installs packages,
   - creates the database and fills it with demo data,
   - prints the local admin login.
5. `npm run dev` then starts in the terminal, and the app opens in a new tab.
   If it doesn't, open the **Ports** tab and choose the globe icon next to
   port 3000.

To see the admin login again, type this in the codespace terminal:

```bash
grep ADMIN_LOCAL .env
```

### Share the live preview with a teacher

Forwarded ports are private by default, so only you can open them. To share:

1. Open the **Ports** tab at the bottom of the codespace.
2. Right-click port **3000** → **Port Visibility** → **Public**.
3. Right-click it again → **Copy Local Address**.
4. Send that address with `/dashboard?demo=1` on the end.

The link only works while the codespace is running. A codespace stops after
30 minutes of inactivity by default. To start it again, go to
[github.com/codespaces](https://github.com/codespaces) and open it. The app
starts again automatically.

### Getting changes made elsewhere

If changes were pushed from somewhere else, for example Claude Code on the
web, pull them into the running codespace:

```bash
git pull
```

The running app picks up the new code straight away. If the change touched
`prisma/schema.prisma` or `package.json`, stop the app with `Ctrl+C`, then run:

```bash
npm install && npx prisma db push && npm run dev
```

### Save your work

A codespace is a separate copy of the code. Commit and push from it (the
**Source Control** icon on the left) before deleting it, or the changes are
lost.

---

## Google sign-in (optional)

The demo needs no Google setup. For students and staff to sign in with their
school Google accounts on either option:

1. Follow **Google OAuth setup** in [README.md](README.md).
2. Add the hosted address as an authorised redirect URI:
   `https://YOUR-ADDRESS/api/auth/callback/google`
3. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`:
   - Render: the service's **Environment** tab.
   - Codespaces: the `.env` file.

The school's Google Workspace administrator may need to allow the app before
students can sign in.

## Handing over to staff

Once it's running, nobody needs to be in the codebase to manage it:

1. Sign in at `/admin/login` with the local admin username and password.
2. Under **People & roles**, add a staff member's school email as **Admin**.
3. That person can now give other staff the **Teacher** or **Admin** role.
   Teachers can then edit the bulletin from `/bulletin`.

Roles take effect within a minute and are kept in the database. On the free
Render plan they reset on each rebuild (see above), so set permanent admins
with the `ADMIN_GOOGLE_EMAILS` setting instead.
