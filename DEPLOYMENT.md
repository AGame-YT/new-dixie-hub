# Dev server deployment

This runbook deploys Dixie Hub at `https://dh.gs-net.co.uk` using Docker
Compose and an existing Caddy container. To run it without a server, from
just a browser, see [SELF-HOSTING.md](SELF-HOSTING.md).

## 1. Create a repository deploy key

Run these commands as the Linux user that will deploy the app:

```bash
install -d -m 700 ~/.ssh
ssh-keygen -t ed25519 \
  -C "dixie-hub deploy key for dh.gs-net.co.uk" \
  -f ~/.ssh/dixie_hub_deploy \
  -N ""
chmod 600 ~/.ssh/dixie_hub_deploy
chmod 644 ~/.ssh/dixie_hub_deploy.pub
cat ~/.ssh/dixie_hub_deploy.pub
```

Copy the displayed public key. In GitHub, open:

`https://github.com/gs-net/dixie-hub/settings/keys`

Choose **Add deploy key**, use the title `dh.gs-net.co.uk dev server`, paste
the public key, and leave **Allow write access** unchecked.

Add GitHub's published Ed25519 host key and a repository-specific SSH alias:

```bash
printf '%s\n' \
  'github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl' \
  >> ~/.ssh/known_hosts
chmod 600 ~/.ssh/known_hosts

cat >> ~/.ssh/config <<'EOF'
Host github-dixie-hub
  HostName github.com
  User git
  IdentityFile ~/.ssh/dixie_hub_deploy
  IdentitiesOnly yes
EOF
chmod 600 ~/.ssh/config
```

Test the key:

```bash
ssh -T git@github-dixie-hub
```

GitHub should confirm successful authentication. The official Ed25519 host-key
fingerprint is:

```text
SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU
```

## 2. Clone the application

```bash
sudo install -d -o "$USER" -g "$USER" /opt/dixie-hub
git clone git@github-dixie-hub:gs-net/dixie-hub.git /opt/dixie-hub
cd /opt/dixie-hub
```

## 3. Configure the environment

```bash
cp .env.example .env
openssl rand -base64 48
nano .env
```

Generate three independent secrets:

```bash
openssl rand -hex 32
openssl rand -hex 32
openssl rand -base64 36
openssl rand -base64 36
```

At minimum, set:

```env
NEXTAUTH_URL=https://dh.gs-net.co.uk
NEXTAUTH_SECRET=paste-the-generated-secret
CADDY_NETWORK=caddy
DATABASE_URL=file:/app/data/dixie-hub.db
METRICS_BEARER_TOKEN=paste-a-hex-secret
GRAFANA_ADMIN_USER=dixie-admin
GRAFANA_ADMIN_PASSWORD=paste-a-separate-password
ADMIN_GOOGLE_EMAILS=admin@school-domain.example
ADMIN_LOCAL_USERNAME=dixie-admin
ADMIN_LOCAL_PASSWORD=paste-a-separate-random-password

DEMO_MODE=true
ENABLE_CLASSROOM_API=false
ENABLE_GMAIL_API=false
ENABLE_CALENDAR_API=false
```

Add the Google client ID, client secret and allowed student email when OAuth is
ready. Keep `.env` readable only by the deployment user:

```bash
chmod 600 .env
```

## 4. Confirm the Caddy network

List Docker networks and identify the external network used by Caddy:

```bash
docker network ls
docker inspect caddy --format '{{json .NetworkSettings.Networks}}'
```

If the network is not named `caddy`, change `CADDY_NETWORK` in `.env`.

## 5. Configure Caddy

Add this site block to the Caddy configuration used by the existing container:

```caddyfile
dh.gs-net.co.uk {
    encode zstd gzip

    handle /grafana/* {
        reverse_proxy dixie-hub-grafana:3000
    }

    handle {
        reverse_proxy dixie-hub:3000
    }

    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
    }
}
```

Make sure DNS for `dh.gs-net.co.uk` points to the dev server, then reload the
existing Caddy service using the command appropriate to its Compose project.
For example:

```bash
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

## 6. Build and start Dixie Hub

```bash
cd /opt/dixie-hub
docker compose up -d --build
docker compose ps
docker compose logs --tail=100 dixie-hub
docker compose logs --tail=100 prometheus
docker compose logs --tail=100 grafana
```

Verify from the server:

```bash
docker compose exec dixie-hub wget -qO- http://127.0.0.1:3000/api/health
curl -I https://dh.gs-net.co.uk
curl -I https://dh.gs-net.co.uk/grafana/login
```

## 7. Configure Google OAuth

In Google Cloud Console, create a Web application OAuth client and add:

```text
https://dh.gs-net.co.uk/api/auth/callback/google
```

Update `.env`:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
ALLOWED_GOOGLE_EMAIL=student@school-domain.example
ADMIN_GOOGLE_EMAILS=admin@school-domain.example
ENABLE_CLASSROOM_API=true
```

Then restart:

```bash
docker compose up -d --build
```

Leave Gmail disabled until the school has approved the Gmail metadata scope.

Before Google OAuth is ready, the administrator signs in at `/admin/login`
using `ADMIN_LOCAL_USERNAME` and `ADMIN_LOCAL_PASSWORD`. Once Google OAuth is
configured, approved Google accounts may also use `/admin`. Under **People &
roles** on `/admin`, give at least one other member of staff the Admin role,
so the hub can be run without whoever set up the server.
Grafana has a separate login at `/grafana/` using `GRAFANA_ADMIN_USER` and
`GRAFANA_ADMIN_PASSWORD`. Keep both admin systems non-public and do not enable
Grafana anonymous access.

## Updating the deployment

```bash
cd /opt/dixie-hub
git pull --ff-only
docker compose up -d --build
docker image prune -f
```

Check health and logs after every update:

```bash
curl -fsS https://dh.gs-net.co.uk/api/health
docker compose logs --tail=100 dixie-hub
```
