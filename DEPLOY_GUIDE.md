# Deployment Guide: Garage Platform (guidex.pw)

This guide explains how to set up your server, get SSL certificates, and deploy the project using Docker.

## 📋 Prerequisites
- A Linux VPS (Ubuntu 22.04 or 24.04 recommended).
- Domain `guidex.pw` pointed to your server's IP address (A-record).
- Port 80 and 443 open in your firewall.

---

## 🛠 Step 1: Install Docker
Run these commands to install the latest version of Docker and Docker Compose:

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Docker using official script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Add your user to the docker group (to run without sudo)
sudo usermod -aG docker $USER

# 4. Enable and start Docker
sudo systemctl enable --now docker
```

---

## 🔐 Step 2: Get SSL Certificate (Certbot)
We will use Certbot to get a free SSL certificate from Let's Encrypt. 

> [!IMPORTANT]
> Make sure no other web server (like Apache or another Nginx) is running on port 80 before running this.

```bash
# 1. Install Certbot
sudo apt install certbot -y

# 2. Generate certificate (Replace guidex.pw if needed)
sudo certbot certonly --standalone -d guidex.pw
```
After successful generation, your certificates will be located in `/etc/letsencrypt/live/guidex.pw/`. My Docker configuration is already set up to read them from this exact path.

---

## 🚀 Step 3: Deployment
Now you can deploy the actual application.

1. **Clone/Upload the project** to your server.
2. **Navigate to the root folder** of the project.
3. **Run the setup script**:
   ```bash
   chmod +x setup_docker.sh
   ./setup_docker.sh
   ```

### What the script does:
- It creates the `uploads` folder for product photos.
- It creates a `.env` file for the backend if it doesn't exist.
- It builds all Docker containers.
- **Automated DB**: It starts the Postgres database and automatically runs all scripts in `init-db/`. All tables and initial data will be created automatically.

---

## 🌐 URLs in Production
- **Main Website**: `https://guidex.pw`
- **Admin/Logistics Panel**: `https://guidex.pw/admin/`
- **API (Internal)**: `

`

---

## 🛠 Troubleshooting Commands

### View Logs
If something isn't working, check the logs:
```bash
docker compose logs backend -f    # Backend logs
docker compose logs nginx -f      # Nginx (Proxy) logs


       # Database logs
```

### Restart Services
```bash
docker compose restart
```

### Rebuild after code changes
```bash
docker compose up -d --build
```

---
*Created by Antigravity AI for Garage Platform*
