# Research Assistant Startup Guide
## Equipment Checkout System - "The Cage"

**Welcome!** This guide will help you get the equipment checkout system running on your computer, even if you've never written code before. Think of this like following a recipe - we'll go step by step.

---

## 📚 What Is This Project?

The Cage is a website that helps students at SIUE reserve and check out broadcast equipment (cameras, microphones, etc.). It's like an online booking system for equipment, similar to how you might reserve a study room at the library.

### What You'll Be Running

When you "start the servers," you're actually starting several programs that work together:

1. **The Website** (called "Next.js") - This is what students and staff see in their web browser
2. **The Database** (called "Snipe-IT") - This stores all the equipment information and checkout records
3. **Supporting Services** - These help everything work together smoothly

Think of it like a restaurant: the website is the dining room where customers interact, the database is the kitchen where food is prepared, and the supporting services are the supply chain that makes sure everything stays stocked.

---

## 🛠️ Part 1: Installing the Required Software

Before you can run the project, you need to install some software on your computer. This is like making sure you have the right tools before starting a home improvement project.

### Step 1: Install Docker Desktop

**What is Docker?** Docker is like a special container that packages all the software the project needs. Instead of installing 20 different programs, Docker bundles everything together.

**Installation Steps:**

1. Go to [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Click the download button for your operating system:
   - **Windows**: Download "Docker Desktop for Windows"
   - **Mac**: Download "Docker Desktop for Mac"
   - **Linux**: Download "Docker Desktop for Linux"
3. Run the installer (double-click the downloaded file)
4. Follow the installation wizard - just click "Next" and accept the defaults
5. Restart your computer when prompted
6. Open Docker Desktop - you'll see a whale icon in your system tray/menu bar when it's running

**How to verify it worked:**
- Open Docker Desktop - you should see a dashboard with no errors
- The whale icon should be visible and steady (not flashing)

### Step 2: Install Git

**What is Git?** Git is version control software - it helps teams work on code together without overwriting each other's work. Think of it like "Track Changes" in Microsoft Word, but for code.

**Installation Steps:**

1. Go to [https://git-scm.com/downloads](https://git-scm.com/downloads)
2. Download the version for your operating system
3. Run the installer
4. During installation, you can accept all the default options
5. When asked about default editor, choose whatever text editor you're comfortable with (Notepad is fine)

**How to verify it worked:**
- **Windows**: Open "Command Prompt" (search for "cmd" in Start menu)
- **Mac**: Open "Terminal" (search for "Terminal" in Spotlight)
- **Linux**: Open your terminal application
- Type: `git --version`
- You should see something like "git version 2.40.0" (the number might be different)

### Step 3: Install Node.js

**What is Node.js?** Node.js lets you run JavaScript code on your computer (not just in a web browser). JavaScript is the programming language this project uses.

**Installation Steps:**

1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the "LTS" (Long Term Support) version - it has a label like "Recommended for most users"
3. Run the installer
4. Accept all defaults during installation
5. Restart your terminal/command prompt after installation

**How to verify it worked:**
- Open a new terminal/command prompt window (close the old one first!)
- Type: `node --version`
- You should see something like "v20.10.0"
- Type: `npm --version`
- You should see something like "10.2.3"

### Step 4: Install Visual Studio Code (Recommended)

**What is VS Code?** This is a text editor designed for writing code. It's free and much better than Notepad for this kind of work.

**Installation Steps:**

1. Go to [https://code.visualstudio.com/](https://code.visualstudio.com/)
2. Download for your operating system
3. Install it like any other program
4. Open VS Code after installation

---

## 📥 Part 2: Getting the Project Files

Now that you have the tools installed, you need to get the actual project files onto your computer.

### Step 1: Open Your Terminal

- **Windows**: Search for "Command Prompt" or "PowerShell" in the Start menu
- **Mac/Linux**: Open the Terminal application

### Step 2: Navigate to Where You Want the Project

Think of your terminal as a file explorer, but you type commands instead of clicking. The `cd` command means "change directory" (move to a different folder).

```bash
# Example: Go to your Documents folder
cd Documents

# Or create a new folder for your research projects
mkdir research-projects
cd research-projects
```

**Tip:** You can always see where you are by looking at the prompt in your terminal. It usually shows the current folder path.

### Step 3: Clone (Download) the Project

Ask your supervisor for the project's location. You'll run a command like this:

```bash
git clone [PROJECT-URL]
cd the-cage
```

Replace `[PROJECT-URL]` with the actual URL your supervisor provides (it might look like `https://github.com/username/the-cage.git`).

**What just happened?** You downloaded all the project files to your computer. The `cd the-cage` command moved you inside the project folder.

### Step 4: Open the Project in VS Code

If you installed VS Code, you can open the entire project:

```bash
code .
```

The `.` (period) means "current folder" - this opens the project in VS Code.

**Alternative:** Open VS Code, go to File → Open Folder, and select the "the-cage" folder you just downloaded.

---

## 🚀 Part 3: Starting the Servers

This is where the magic happens! You'll start all the services that make the website work.

### Step 1: Install Project Dependencies

First, you need to download all the code libraries this project uses. Think of this like gathering all the ingredients before cooking a meal.

**In your terminal (make sure you're in the the-cage folder):**

```bash
npm install
```

**What's happening?** This reads a "shopping list" (the `package.json` file) and downloads hundreds of small code packages that the project needs. This might take 3-5 minutes.

**You'll know it's done when:**
- You see "added XXX packages" or something similar
- Your terminal shows the command prompt again
- A new folder called `node_modules` appears (you can see this in VS Code's file explorer)

### Step 2: Set Up Environment Variables

**What are environment variables?** These are secret settings and passwords that the application needs to work. They're kept in a special file that never gets shared publicly (for security).

**Create the file:**

1. In the `the-cage` folder, create a new file called `.env`
   - **In VS Code**: Right-click in the file explorer → New File → name it `.env`
   - **Important**: The file name starts with a period! This makes it hidden on some systems.

2. Ask your supervisor for the environment variables and copy them into this `.env` file

The file might look something like this (your supervisor will provide the real values):

```
SNIPEIT_API_KEY=your-secret-key-here
APP_KEY=another-secret-key
DATABASE_URL="file:./data/db_v2.sqlite3"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=yet-another-secret
```

**Why do we need this?** These are like passwords and settings that tell the application how to connect to databases and external services.

### Step 3: Set Up the Database

The project uses something called Prisma to manage data. You need to set it up:

```bash
npx prisma generate
```

**What's happening?** This creates helper code that lets the application talk to the database in a type-safe way.

**You'll know it's done when:**
- You see "✔ Generated Prisma Client"
- No error messages appear

### Step 4: Start Docker Containers

Remember Docker from earlier? Now we'll use it to start the Snipe-IT equipment management system and database.

```bash
docker compose up -d
```

**What does this do?**
- `docker compose` tells Docker to start multiple services at once
- `up` means "start"
- `-d` means "detached" - it runs in the background so you can keep using your terminal

**What's happening?** Docker is downloading and starting:
- Snipe-IT (the equipment management system)
- MySQL (a database that Snipe-IT uses)
- Other supporting services

**This will take 5-10 minutes the first time** because Docker needs to download everything. Subsequent starts will be much faster.

**You'll know it's done when:**
- You see messages like "Container the-cage-snipeit-1 Started"
- The terminal prompt returns
- You can check Docker Desktop and see the containers running (green status)

### Step 5: Start the Next.js Development Server

This starts the actual website:

```bash
npm run dev
```

**Note:** If you see errors about `docker-compose` with Python, use `docker compose` (with a space) instead of `docker-compose` (with hyphen) in all commands.

**What's happening?** This starts a web server on your computer that hosts the equipment checkout website.

**You'll know it's working when:**
- You see "✓ Ready in XXXms"
- You see "○ Local: http://localhost:3000"
- The terminal doesn't return to the prompt (this is normal - the server is running)

**Important:** Don't close this terminal window! The server needs to stay running. If you need to run other commands, open a new terminal window.

---

## 🌐 Part 4: Accessing the Application

Now that everything is running, you can use the website!

### Access the Main Application

1. Open your web browser (Chrome, Firefox, Safari, etc.)
2. Go to: **http://localhost:3000**
3. You should see The Cage homepage!

**What is localhost?** This is a special address that means "this computer." Port 3000 is like an apartment number - it tells your computer which service you want to access.

### Access Snipe-IT (Admin Interface)

1. In your browser, go to: **http://localhost:8080**
2. This is where equipment inventory is managed
3. Ask your supervisor for the login credentials

### Test User Accounts

Ask your supervisor for test account credentials. You'll typically have:
- **Student account**: For testing the student experience (browsing, reserving equipment)
- **Staff account**: For testing the staff/admin functions (checking out equipment, processing returns)

---

## 🎯 Part 5: Typical Development Workflow

Once everything is set up, here's your daily routine:

### Starting Your Work Session

1. **Start Docker containers** (if not already running):
   ```bash
   docker compose up -d
   ```
   Wait 1-2 minutes for services to be ready

2. **Start the Next.js server**:
   ```bash
   npm run dev
   ```
   Wait for "✓ Ready"

3. **Open your browser** to http://localhost:3000

### During Your Work Session

- **Making code changes**: Edit files in VS Code - the website will automatically reload when you save!
- **Viewing console logs**: Check the terminal where `npm run dev` is running - you'll see helpful messages here
- **Checking the database**: You can use `npx prisma studio` to see database contents in a visual interface

### Ending Your Work Session

1. **Stop the Next.js server**:
   - Go to the terminal where `npm run dev` is running
   - Press `Ctrl + C` (both Windows and Mac)

2. **Stop Docker containers**:
   ```bash
   docker compose down
   ```

**Tip:** You can leave Docker Desktop running all the time - it won't hurt anything. But stopping containers when you're done saves computer resources.

---

## 🆘 Part 6: Troubleshooting Common Issues

### "Port 3000 is already in use"

**What this means:** Another program is using port 3000, or you have another instance of the server running.

**Solution:**
1. Look for other terminal windows where you might have started the server
2. Close those terminals or press `Ctrl + C` in them
3. Try starting the server again

**Alternative solution (kill the port):**
- **Mac/Linux**: `lsof -ti:3000 | xargs kill -9`
- **Windows**: `netstat -ano | findstr :3000` then `taskkill /PID [number] /F`

### "docker compose: command not found" or "No module named 'distutils'"

**What this means:** Docker isn't installed correctly, or you're using the old command syntax.

**Solution:**
1. Use `docker compose` (with a space) not `docker-compose` (with hyphen)
2. Make sure Docker Desktop is running (check for the whale icon)
3. Try restarting Docker Desktop
4. Restart your terminal
5. If still not working, you might need to reinstall Docker

### "npm: command not found"

**What this means:** Node.js isn't installed correctly.

**Solution:**
1. Make sure you installed Node.js (see Part 1, Step 3)
2. Restart your terminal
3. Try `node --version` - if this works but npm doesn't, reinstall Node.js

### Website Shows "Error" or Won't Load

**Check these things in order:**

1. **Is the Next.js server running?**
   - Look at the terminal where you ran `npm run dev`
   - Should see "✓ Ready" with no errors

2. **Are Docker containers running?**
   - Open Docker Desktop
   - You should see containers with green "Running" status
   - If they're not running, try `docker-compose up -d` again

3. **Is your .env file set up correctly?**
   - Make sure the `.env` file exists in the project root
   - Double-check that you copied all the values from your supervisor

4. **Clear your browser cache:**
   - Press `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac) to hard reload the page

### Database Errors

**If you see errors about the database:**

```bash
# Reset the database
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate

# Restart the dev server
npm run dev
```

### Docker Container Keeps Restarting

**Check Docker logs:**
1. Open Docker Desktop
2. Click on the container that's having issues
3. Look at the "Logs" tab
4. Take a screenshot of any errors and send to your supervisor

**Or try restarting:**
```bash
docker compose down
docker compose up -d
```

### I Made Changes But Don't See Them

**Try these steps:**

1. **Hard reload your browser**: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. **Check the terminal** where Next.js is running - look for compilation errors
3. **Restart the dev server**: Press `Ctrl + C` in the terminal, then run `npm run dev` again

---

## 📖 Part 7: Learning Resources

### Understanding the Technology Stack

As you work on this project, you might want to learn more about the technologies being used:

**JavaScript/TypeScript Basics:**
- [JavaScript.info](https://javascript.info/) - Comprehensive JavaScript tutorial
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) - Learn TypeScript (JavaScript with types)

**React & Next.js:**
- [React Tutorial](https://react.dev/learn) - Learn React, the UI framework
- [Next.js Tutorial](https://nextjs.org/learn) - Learn Next.js, the framework this project uses

**Terminal/Command Line:**
- [Command Line Crash Course](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Understanding_client-side_tools/Command_line) - Learn terminal basics

**Git:**
- [Git Handbook](https://guides.github.com/introduction/git-handbook/) - Learn version control

### Project-Specific Documentation

**Inside the project folder, check these files:**
- `README.md` - Technical overview of the project
- `QUICK_START.md` - Recent features and changes
- `USER_GUIDE.md` - How to use the application as an end-user
- `CONTRIBUTING.md` - How to contribute code changes

### Video Tutorials to Watch

Search YouTube for these topics:
- "What is Node.js explained simply"
- "What is React.js for beginners"
- "Git and GitHub for beginners"
- "Docker explained in 5 minutes"

---

## ✅ Part 8: Quick Reference - Commands Cheat Sheet

Save this section for quick reference!

### Daily Startup Commands

```bash
# 1. Navigate to project folder
cd /path/to/the-cage

# 2. Start Docker containers
docker compose up -d

# 3. Start development server
npm run dev

# 4. Open browser to: http://localhost:3000
```

### Daily Shutdown Commands

```bash
# 1. Stop dev server (in the terminal where it's running)
# Press: Ctrl + C

# 2. Stop Docker containers
docker compose down
```

### Useful Development Commands

```bash
# Install new dependencies (if package.json changed)
npm install

# View database in browser UI
npx prisma studio

# Reset database (careful! deletes all data)
npx prisma migrate reset

# Check for code errors
npm run lint

# Run tests
npm run test
```

### Useful Docker Commands

```bash
# See running containers
docker ps

# See all containers (including stopped)
docker ps -a

# View container logs
docker logs [container-name]

# Restart a specific container
docker restart [container-name]

# Remove all stopped containers and unused images (cleanup)
docker system prune
```

### Useful Git Commands

```bash
# See what files you've changed
git status

# See what changes you made in files
git diff

# Save your changes
git add .
git commit -m "Description of what you changed"

# Get latest changes from team
git pull

# Send your changes to team
git push
```

---

## 🚨 When to Ask for Help

**Always ask your supervisor when:**

1. You've tried troubleshooting steps above and still have errors
2. You get an error message you don't understand
3. You want to make changes to the database structure
4. You need to add new features or modify existing ones
5. You're not sure if you should commit/push your changes
6. Docker containers won't start and logs show errors
7. You accidentally deleted important files
8. The application is behaving unexpectedly and you can't figure out why

**Good questions to ask:**
- "I'm seeing this error [paste error message]. I tried [what you tried]. What should I do next?"
- "I want to change [specific thing]. What files should I look at?"
- "Is this the expected behavior, or is something broken?"

**Remember:** There are no "stupid questions" in software development. Even experienced developers Google things constantly and ask for help!

---

## 🎓 Final Tips for Success

1. **Take notes**: Keep a document of problems you solved and how you solved them
2. **Read error messages carefully**: They usually tell you what's wrong
3. **Change one thing at a time**: If you change multiple things and something breaks, it's hard to figure out what caused it
4. **Use version control**: Commit your working code often so you can always go back
5. **Test frequently**: Don't write lots of code before testing - test small changes immediately
6. **Keep your terminal open**: The messages there are very helpful for debugging
7. **Don't be afraid to break things**: You can always revert changes with Git
8. **Google is your friend**: Search for error messages - you'll find others had the same problem

---

## 📞 Getting Help

**Project Supervisor:** [Your supervisor's name and contact info will be here]

**Project Documentation:**
- Technical questions: See `README.md`
- Recent changes: See `QUICK_START.md`
- User features: See `USER_GUIDE.md`

**Online Communities:**
- [Stack Overflow](https://stackoverflow.com/) - Search for technical questions
- Next.js Discord - Join the Next.js community
- React Discord - Join the React community

---

**Good luck, and welcome to the team! 🎉**

Remember: Every developer started exactly where you are now. Take it one step at a time, and you'll be surprised how much you learn!

---

*Last updated: December 30, 2025*
