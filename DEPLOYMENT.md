# Deployment Guide (EC2 + Vercel)

This project is deployed as:

- **Server (API + redirect):** AWS EC2 (Amazon Linux + PM2 + Nginx)
- **Client (React frontend):** Vercel

---

## 1) The flow we are using

1. Launch Amazon Linux EC2 instance
2. SSH in
3. Install Node, clone repo, install deps
4. Configure `.env`
5. Run server with PM2
6. Configure Nginx reverse proxy (`80/443` -> `5000`)
7. Attach Elastic IP
8. Point domain `A` record to Elastic IP
9. Push to GitHub (`main`) for CI/CD updates

---

## 2) EC2 setup (one-time, Amazon Linux)

### A) Launch + SSH

- Create Amazon Linux EC2
- Open inbound ports: `22`, `80`, `443`
- SSH:

```bash
ssh -i <path-to-key.pem> ec2-user@<EC2_PUBLIC_IP>
```

### B) Install runtime + clone repo

```bash
sudo dnf update -y
sudo dnf install -y git curl nginx nodejs
sudo npm install -g pm2
corepack enable

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
- `CLIENT_URL=https://<your-vercel-domain>`
- `SERVER_URL=https://api.yourdomain.com`
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

Create config:

```bash
sudo nano /etc/nginx/sites-available/beakon
```

Use:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

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

Enable + reload:

```bash
sudo ln -s /etc/nginx/sites-available/beakon /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
```

---

## 4) Elastic IP + domain mapping

1. In AWS, allocate Elastic IP
2. Associate with your EC2 instance
3. In DNS provider, create:
   - `A` record: `api.yourdomain.com` -> `<ELASTIC_IP>`

Test:

```bash
curl http://api.yourdomain.com/api/health
```

Then add HTTPS (Certbot) as next step.

---

## 5) Vercel frontend setup (one-time)

1. Import GitHub repo into Vercel
2. Set **Root Directory** = `client`
3. Framework = Create React App
4. Env var:
   - `REACT_APP_API_URL=https://api.yourdomain.com`
5. Deploy

---

## 6) GitHub Actions deployment integration

Set GitHub repo secrets:

- `EC2_HOST` -> EC2 DNS / Elastic IP
- `EC2_USER` -> usually `ec2-user`
- `EC2_SSH_KEY` -> private key (`.pem` content)
- `EC2_APP_DIR` -> e.g. `/home/ubuntu/beakon`
- `PM2_PROCESS_NAME` -> `beakon-server`
- `HEALTHCHECK_URL` -> `https://api.yourdomain.com/api/health` (or http if TLS not yet set)

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
   - `https://api.yourdomain.com/api/health`
   - frontend loads
   - link creation + redirect works

---

## Notes for Amazon Linux versions

- **Amazon Linux 2023:** commands above (`dnf`) work as-is.
- **Amazon Linux 2:** replace `dnf` with `yum`, and install Node 20 with NodeSource if needed.
