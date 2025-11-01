# Quick Start: Git Configuration for Website-1

## 🎯 One-Line Summary
This project pushes **ONLY** to: `https://github.com/vanya-vasya/website-1`

---

## 🚀 Quick Setup (New Clone)

```bash
# 1. Clone repository
git clone https://github.com/vanya-vasya/website-1.git nerbixa
cd nerbixa

# 2. Install hooks (prevents wrong pushes)
./scripts/install-git-hooks.sh

# 3. Verify configuration
git remote -v

# Expected output:
# origin  https://github.com/vanya-vasya/website-1.git (fetch)
# origin  https://github.com/vanya-vasya/website-1.git (push)
```

---

## 🔍 Verify Current Configuration

```bash
# Check remotes
git remote -v

# Run audit (auto-fixes issues)
./scripts/audit-git-remotes.sh
```

---

## 📝 Normal Workflow

```bash
# 1. Create branch
git checkout -b feature/my-feature

# 2. Make changes
git add .
git commit -m "feat: description"

# 3. Push (protected by hooks)
git push -u origin feature/my-feature
```

---

## 🛡️ Security Features

### ✅ Automatic Protection
- **Pre-push hook**: Blocks unauthorized remotes
- **Audit script**: Detects & fixes wrong configuration
- **CI/CD**: Only deploys from website-1

### ❌ What's Blocked
- Pushing to website-2
- Pushing to any remote except `origin`
- Wrong repository URLs

---

## 🔧 Troubleshooting

### Problem: "Push blocked"
```bash
./scripts/audit-git-remotes.sh
git remote -v
```

### Problem: Wrong remote configured
```bash
# Remove wrong remote
git remote remove website-2

# Fix origin
git remote set-url origin https://github.com/vanya-vasya/website-1.git
```

### Problem: Hooks not working
```bash
# Reinstall hooks
./scripts/install-git-hooks.sh
```

---

## 📊 Current Branch

- **Active:** `website-1-complete-codebase-20251031`
- **Tracking:** `origin/website-1-complete-codebase-20251031`
- **Repository:** https://github.com/vanya-vasya/website-1

---

## 📚 Full Documentation

See `GIT_CONFIGURATION.md` for complete details.

---

## ⚡ Common Commands

```bash
# Check status
git status

# View configured remote
git remote -v

# Audit remotes
./scripts/audit-git-remotes.sh

# Install/reinstall hooks
./scripts/install-git-hooks.sh

# View current branch
git branch -vv

# Push current branch
git push
```

---

## 🔗 Links

- **Repository:** https://github.com/vanya-vasya/website-1
- **Issues:** https://github.com/vanya-vasya/website-1/issues
- **Actions:** https://github.com/vanya-vasya/website-1/actions

---

**Last Updated:** October 31, 2025  
**Policy:** Website-1 Only

