# Deployment Guide (EC2 + Vercel)

This project is deployed as:

- **Server (API + redirect):** AWS EC2 (Amazon Linux + PM2 + Nginx) — **Elastic IP** `17.32.298.16`, **public DNS** `ec2-13-62-208-136.eu-north-1.compute.amazonaws.com`
- **Client (React frontend):** Vercel at **`https://beakn.lol`**
- **API (public):** **`https://api.beakn.lol`** — health: **`https://api.beakn.lol/api/health`**

---

## 1) The flow we are using

1. Launch Amazon Linux EC2 instance
2. SSH in
3. Install Node, clone repo, install deps
4. Configure `.env`
5. Run server with PM2
6. Configure Nginx reverse proxy (`80/443` -> `5000`)
7. Attach Elastic IP (`17.32.298.16`)
8. Point DNS (`api.beakn.lol` → Elastic IP; apex/www → Vercel)
9. Push to GitHub (`main`) for CI/CD updates

---

## 2) EC2 setup (one-time, Amazon Linux)

### Private GitHub repo access (if repo is private)

Recommended: use a **GitHub Deploy Key** (SSH).

On EC2:

```bash
ssh-keygen -t ed25519 -C "ec2-beakon-deploy"
cat ~/.ssh/id_ed25519.pub
```

Then in GitHub:

1. Repo -> **Settings** -> **Deploy keys** -> **Add deploy key**
2. Paste the public key
3. Enable **Read access** (or write only if needed)

Clone with SSH URL:

```bash
git clone git@github.com:<owner>/<repo>.git beakon
```

Optional test:

```bash
ssh -T git@github.com
```

Fallback option: clone over HTTPS with a GitHub Personal Access Token (PAT), but SSH deploy keys are preferred for servers.

---

### A) Launch + SSH

- Create Amazon Linux EC2
- Open inbound ports: `22`, `80`, `443`
- SSH (use Elastic IP or public DNS):

```bash
ssh -i <path-to-key.pem> ec2-user@13.62.208.136
```

### B) Install runtime + clone repo

```bash
sudo dnf update -y
sudo dnf install -y git nginx nodejs
sudo npm install -g pm2
sudo npm install -g pnpm

git clone <YOUR_GITHUB_REPO_URL> beakon
cd beakon/server
pnpm install --frozen-lockfile
```

### C) Configure environment

```bash
cp .env.example .env
nano .env
```

Set:

- `PORT=5000`
- `MONGO_URI=<production mongo uri>`
- `JWT_SECRET=<strong random secret>`
- `JWT_EXPIRES_IN=7d`
- `CLIENT_URL=https://beakn.lol`
- `SERVER_URL=https://api.beakn.lol`
- `NODE_ENV=production`

### D) Start API with PM2

```bash
pm2 start index.js --name beakon-server
pm2 startup
pm2 save
```

When PM2 prints a `sudo` command after `pm2 startup`, run that command once.

Verify local health:

```bash
curl http://localhost:5000/api/health
```

---

## 3) Nginx reverse proxy

On Amazon Linux, site configs usually live under **`/etc/nginx/conf.d/`**.

```bash
sudo nano /etc/nginx/conf.d/beakon.conf
```

Use (HTTP first; add HTTPS with Certbot after DNS resolves):

```nginx
server {
    listen 80;
    server_name api.beakn.lol;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Test + reload:

```bash
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
```

If nginx warns about `server_names_hash_bucket_size`, add inside the `http { }` block of `/etc/nginx/nginx.conf`:

```nginx
server_names_hash_bucket_size 128;
```

---

## 4) Elastic IP + domain mapping

1. In AWS, allocate Elastic IP and associate with the EC2 instance (**`17.32.298.16`** for this deployment).
2. In DNS (e.g. Namecheap):
   - **`A`** record: **`api.beakn.lol`** → **`17.32.298.16`**
   - **`beakn.lol`** / **`www`** → Vercel (per Vercel’s DNS instructions for the frontend).
3. After DNS propagates, obtain TLS for the API (e.g. `certbot --nginx -d api.beakn.lol`).

Test (HTTPS after certificates):

```bash
curl https://api.beakn.lol/api/health
```

---

## 5) Vercel frontend setup (one-time)

1. Import GitHub repo into Vercel
2. Set **Root Directory** = `client`
3. Framework = Create React App
4. Attach custom domain **`beakn.lol`**
5. Env var:
   - `REACT_APP_API_URL=https://api.beakn.lol`
6. Deploy

---

## 6) GitHub Actions deployment integration

Set GitHub repo secrets:

- `EC2_HOST` → `17.32.298.16` or `ec2-17-32-298-16.eu-north-1.compute.amazonaws.com`
- `EC2_USER` → `ec2-user`
- `EC2_SSH_KEY` → private key (`.pem` content)
- `EC2_APP_DIR` → `/home/ec2-user/beakon`
- `PM2_PROCESS_NAME` → `beakon-server`
- `HEALTHCHECK_URL` → `https://api.beakn.lol/api/health`

CD workflow behavior:

1. Wait for CI success on `main`
2. SSH to EC2
3. Pull latest `main`
4. Install deps + build client
5. Restart PM2 process
6. Run health check

---

## 7) Normal deploy process

1. Commit + push to `main`
2. CI runs (lint/test/build gates)
3. CD deploys backend to EC2
4. Vercel auto-deploys frontend
5. Verify:
   - `https://api.beakn.lol/api/health`
   - `https://beakn.lol` loads
   - Link creation + redirect works

---

## Notes for Amazon Linux versions

- **Amazon Linux 2023:** commands above (`dnf`) work as-is.
- **Amazon Linux 2:** replace `dnf` with `yum`, and install Node 20 with NodeSource if needed.
