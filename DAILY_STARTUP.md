# Daily Startup Guide
## Quick Steps to Get The Cage Running

This is your simple checklist for starting the servers each day. Follow these steps in order.

---

## ✅ Pre-Flight Checklist

Before starting, make sure:
- [ ] Docker Desktop is installed and running (look for the whale icon)
- [ ] You're connected to the internet
- [ ] You've opened your Terminal/Command Prompt

---

## 🚀 Startup Steps

### Step 1: Navigate to the Project

Open your terminal and go to the project folder:

```bash
cd /path/to/the-cage
```

**Replace `/path/to/the-cage` with your actual path**, for example:
- Windows: `cd C:\Users\YourName\Documents\research-projects\the-cage`
- Mac/Linux: `cd ~/Documents/research-projects/the-cage`

**Tip:** You can drag the folder from your file explorer into the terminal to auto-fill the path!

---

### Step 2: Start Docker Containers

```bash
docker compose up -d
```

**Wait 1-2 minutes** for containers to fully start.

**Note:** Use `docker compose` (with a space), not `docker-compose` (with hyphen).

✅ **Success looks like:**
```
✔ Container the-cage-mysql-1        Started
✔ Container the-cage-snipeit-1      Started
✔ Container the-cage-nextjs-app-1   Started
```

---

### Step 3: Start the Development Server

```bash
npm run dev
```

**Wait for this message:**
```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

**⚠️ Don't close this terminal!** The server needs to stay running.

---

### Step 4: Open Your Browser

Go to: **http://localhost:3000**

You should see The Cage homepage!

---

## ✅ You're Ready!

The system is now running. You can:
- Visit the main app: http://localhost:3000
- Access Snipe-IT admin: http://localhost:8080
- Start coding and testing!

---

## 🛑 Shutting Down (End of Day)

### Step 1: Stop the Development Server

In the terminal where `npm run dev` is running:
- Press: **Ctrl + C**

### Step 2: Stop Docker Containers

```bash
docker compose down
```

✅ **Success looks like:**
```
✔ Container the-cage-nextjs-app-1   Removed
✔ Container the-cage-snipeit-1      Removed
✔ Container the-cage-mysql-1        Removed
```

---

## ⚠️ Common Issues & Quick Fixes

### "Port 3000 is already in use"

**Fix:** Another instance is running. Find and close other terminal windows, or run:
- Mac/Linux: `lsof -ti:3000 | xargs kill -9`
- Windows: `netstat -ano | findstr :3000` then note the PID and run `taskkill /PID [number] /F`

---

### "docker compose: command not found" or Python errors

**Fix:** 
1. Make sure Docker Desktop is running (check for whale icon)
2. Use `docker compose` (with space) not `docker-compose` (with hyphen)
3. Restart Docker Desktop if still having issues
4. Restart your terminal

---

### "Cannot connect to Docker daemon"

**Fix:**
1. Open Docker Desktop application
2. Wait for it to fully start (whale icon becomes steady)
3. Try the command again

---

### Website Won't Load / Shows Errors

**Fix:**
1. Check terminal where `npm run dev` is running - look for error messages
2. Make sure Docker containers are running: `docker ps` (should show 3 containers)
3. Hard refresh your browser: **Ctrl + Shift + R** (or **Cmd + Shift + R** on Mac)
4. If still broken, restart everything:
   ```bash
   # Stop dev server: Ctrl + C
   docker compose down
   docker compose up -d
   npm run dev
   ```

---

### Docker Containers Won't Start

**Fix:**
1. Check Docker Desktop for error messages
2. Try removing and recreating containers:
   ```bash
   docker compose down -v
   docker compose up -d
   ```
3. If still broken, ask your supervisor

---

### "Module not found" or Package Errors

**Fix:** Dependencies might need reinstalling:
```bash
npm install
npm run dev
```

---

## 📋 Quick Command Reference

| Task | Command |
|------|---------|
| Check if Docker containers are running | `docker ps` |
| View Docker container logs | `docker logs [container-name]` |
| Restart a stuck container | `docker restart [container-name]` |
| See what files you changed | `git status` |
| Pull latest changes from team | `git pull` |
| View database | `npx prisma studio` |

---

## 🆘 When to Ask for Help

Ask your supervisor if:
- Startup fails after trying the fixes above
- You see error messages you don't understand
- Docker containers keep restarting
- The application behaves unexpectedly
- You need to pull updates from the team

**Always include:**
- Screenshot of the error
- What you were doing when it happened
- What you already tried

---

## 💡 Pro Tips

1. **Keep Docker Desktop running** in the background - you don't need to quit it between work sessions
2. **Open two terminal windows** - one for `npm run dev`, another for running commands
3. **Bookmark http://localhost:3000** in your browser for quick access
4. **Save this guide** to your desktop for easy reference

---

**Need more detailed help?** See `RESEARCHER_STARTUP_GUIDE.md` for the full beginner guide.

*Last updated: December 30, 2025*
