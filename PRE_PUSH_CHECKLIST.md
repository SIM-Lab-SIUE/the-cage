# Pre-Push Checklist: The Cage

Complete this checklist before pushing to GitHub to ensure the codebase is production-ready.

## 🔒 Security Audit

- [ ] **Verify `.gitignore` is complete:**
  - [ ] `.env` files excluded (`.env`, `.env.local`, `.snipeit.env`)
  - [ ] Secrets not in code (no API keys hardcoded)
  - [ ] Build artifacts excluded (`.next/`, `node_modules/`, `dist/`)
  - Run: `git status --porcelain` - should show no .env files

- [ ] **No hardcoded secrets:**
  - Search for: API keys, passwords, tokens in source code
  - All sensitive values should use environment variables
  - Run: `grep -r "password\|secret\|apiKey" src/ --include="*.ts" --include="*.tsx"`

- [ ] **Check for TODOs and FIXMEs:**
  - Review all comments with TODO, FIXME, XXX, HACK
  - Decide if they should be addressed or converted to GitHub Issues
  - Run: `grep -r "TODO\|FIXME\|XXX\|HACK" src/`

## 🧹 Code Quality

- [ ] **Linting passes:**
  ```bash
  npm run lint
  ```
  - Address all errors (not just warnings)
  - Current known warnings are acceptable (unused imports in template code)

- [ ] **TypeScript compiles without errors:**
  ```bash
  npm run build
  ```
  - Should complete with "✓ Generating static pages"
  - No type errors in console

- [ ] **Tests pass:**
  ```bash
  npm test
  ```
  - All unit tests passing
  - No failing snapshot tests

- [ ] **No console.log statements in production code:**
  - Debug logs should use proper logging library or be removed
  - Exception: Intentional logging in services for diagnostics

## 📝 Documentation

- [ ] **README.md is up-to-date:**
  - [ ] Installation instructions work
  - [ ] Environment variables documented
  - [ ] API endpoints documented
  - [ ] Tech stack accurate

- [ ] **CONTRIBUTING.md exists and is complete:**
  - [ ] Development setup instructions
  - [ ] Code standards documented
  - [ ] PR process outlined

- [ ] **LICENSE file exists:**
  - [ ] MIT License in place
  - [ ] Copyright attribution correct

- [ ] **.env.example is present:**
  - [ ] All required variables documented
  - [ ] Comments explain each variable
  - [ ] No actual secrets in the file

- [ ] **DEVELOPER_LOG.md is current:**
  - [ ] Recent architectural decisions recorded
  - [ ] Known issues documented
  - [ ] Next steps outlined

## 🐳 Docker Verification

- [ ] **Docker builds successfully:**
  ```bash
  docker compose build
  ```

- [ ] **All containers start and run:**
  ```bash
  docker compose up -d
  docker compose ps
  ```
  - All containers should show "Up" status
  - No "Restarting" or "Exited" containers

- [ ] **Services are accessible:**
  - [ ] Next.js app: http://localhost:3000 (responds 200 or 404, not connection error)
  - [ ] Snipe-IT admin: http://localhost:8080 (login page loads)
  - [ ] MySQL: `docker compose exec mysql mysql -u root -p<password> -e "SELECT 1;"`

- [ ] **Database migrations applied:**
  ```bash
  docker compose exec nextjs-app npx prisma migrate status
  ```
  - Should show "All migrations have been applied"

- [ ] **No sensitive data in images:**
  - [ ] .env not copied into Dockerfile
  - [ ] Build logs don't expose secrets
  - [ ] Run: `docker history the-cage-nextjs-app | grep -i "env\|key\|password"`

## 📊 Git Hygiene

- [ ] **Commit history is clean:**
  ```bash
  git log --oneline -10
  ```
  - Messages are clear and descriptive
  - No accidental commits (node_modules, build artifacts, .env)

- [ ] **All changes staged and committed:**
  ```bash
  git status
  ```
  - Should return "nothing to commit, working tree clean" OR show only intentional uncommitted files

- [ ] **No merge conflicts:**
  ```bash
  git diff --name-only --diff-filter=U
  ```
  - Should return nothing

- [ ] **Branch is up-to-date with main:**
  ```bash
  git fetch origin
  git status
  ```
  - Should show "Your branch is ahead of 'origin/main' by X commits" or "up-to-date"

## 🚀 Pre-Push Verification

- [ ] **Run final build:**
  ```bash
  npm run build 2>&1 | tail -20
  ```
  - Completes with "✓ Generating static pages"
  - No errors in output

- [ ] **Run final lint:**
  ```bash
  npm run lint 2>&1 | grep error
  ```
  - No errors returned (warnings are acceptable)

- [ ] **Verify .gitignore excludes everything needed:**
  ```bash
  git check-ignore -v <file>  # for specific files
  ```

- [ ] **Test Git operations:**
  ```bash
  git push origin --dry-run  # Simulates push without actually sending
  ```

## 📋 Codebase Completeness

- [ ] **All required files present:**
  - [ ] `README.md` - Project documentation
  - [ ] `CONTRIBUTING.md` - Development guidelines
  - [ ] `LICENSE` - MIT License
  - [ ] `.env.example` - Environment template
  - [ ] `.gitignore` - Git exclusions
  - [ ] `package.json` - Dependencies
  - [ ] `tsconfig.json` - TypeScript config
  - [ ] `next.config.ts` - Next.js config
  - [ ] `docker-compose.yml` - Container orchestration
  - [ ] `Dockerfile` - Container build

- [ ] **src/ structure is organized:**
  - [ ] `src/app/` - Pages and layout
  - [ ] `src/app/api/` - API routes (reserve, availability, checkout, admin)
  - [ ] `src/components/` - React components
  - [ ] `src/services/` - Business logic and API wrappers
  - [ ] `src/lib/` - Utilities and helpers
  - [ ] `src/config/` - Configuration (branding, etc.)
  - [ ] `prisma/schema.prisma` - Database schema

- [ ] **No placeholder or test files left:**
  - Search for "test", "temp", "tmp", "demo", "example"
  - Remove or document any testing utilities

## 🎯 Feature Completeness

- [ ] **Phase 2 requirements implemented:**
  - [ ] Branding system (config-driven themes)
  - [ ] Authentication (NextAuth with mock provider)
  - [ ] API Wall (service layer)
  - [ ] Snipe-IT integration (asset fetching)
  - [ ] Shadow database (Prisma models)
  - [ ] Reservation logic (3-block limit, overlap detection)
  - [ ] Calendar component (FullCalendar integration)
  - [ ] Equipment catalog (grid display)
  - [ ] API endpoints (reserve, availability, checkout, fines)
  - [ ] Admin scanner (QR code support)
  - [ ] Rules engine (business logic)
  - [ ] Injection system (CSS variable theming)

- [ ] **Known limitations documented:**
  - [ ] Azure AD not yet configured (mock provider active)
  - [ ] RBAC pending (email-based admin check in place)
  - [ ] Production PostgreSQL not yet set up
  - [ ] QR code generation pending
  - [ ] Record in DEVELOPER_LOG.md and/or GitHub Issues

## 🔗 GitHub Preparation

- [ ] **Repository is configured:**
  - [ ] Remote origin is set: `git remote -v`
  - [ ] Branch is correct: `git branch`

- [ ] **GitHub repo exists:**
  - [ ] Created on github.com with same name
  - [ ] Description set: "SIUE Mass Communications Equipment Checkout System"
  - [ ] Topics added: `next.js`, `react`, `snipe-it`, `equipment-management`

- [ ] **README visible in repo:**
  - [ ] Push will make README render as homepage
  - [ ] Verify formatting with local preview if needed

- [ ] **Issues are ready for tracking:**
  - [ ] Create GitHub Issues for known limitations
  - [ ] Link any TODOs to issues
  - [ ] Add labels: `enhancement`, `bug`, `documentation`, `azure-ad`, etc.

## ✅ Final Verification

Run this comprehensive check before pushing:

```bash
# 1. Verify git status is clean
git status

# 2. Run linting
npm run lint

# 3. Run tests
npm test

# 4. Verify build succeeds
npm run build

# 5. Verify Docker setup
docker compose up -d --build
docker compose ps
docker compose down

# 6. Simulate push
git push origin --dry-run --all

# 7. Create summary
echo "Ready to push!" && \
git log --oneline -5 && \
echo "---" && \
git status
```

## 📤 Push Command

Once all checks pass:

```bash
# Push to main branch
git push origin main

# Or if on a feature branch
git push origin feature/branch-name
```

---

**Status**: Use this checklist for final verification before major releases to GitHub.

**Last Updated**: December 27, 2025
