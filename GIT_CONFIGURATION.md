# Git Configuration - Website-1 Only Policy

## Overview
This project is configured to push commits **exclusively** to the GitHub repository:
```
https://github.com/vanya-vasya/website-1
```

## Current Configuration

### Remote Repository
- **Name:** origin
- **URL:** https://github.com/vanya-vasya/website-1.git
- **Purpose:** Primary and only allowed repository for this codebase

### Active Branch
- **Branch:** website-1-complete-codebase-20251031
- **Tracking:** origin/website-1-complete-codebase-20251031

## Policy Enforcement

### 1. Automated Audit Script
Run the audit script to verify and enforce remote configuration:

```bash
./scripts/audit-git-remotes.sh
```

This script will:
- ✅ Verify that only website-1 is configured
- ❌ Detect unauthorized remotes
- 🔄 Fix configuration automatically (with confirmation)
- 📊 Generate audit report

### 2. Pre-Push Hook
A Git hook prevents pushing to unauthorized remotes:

```bash
# Install the hook (one-time setup)
./scripts/install-git-hooks.sh
```

The hook will:
- Block pushes to any remote other than `origin` (website-1)
- Display error message with correct repository
- Prevent accidental pushes to wrong repositories

### 3. CI/CD Configuration

#### GitHub Actions
- **File:** `.github/workflows/deploy.yml`
- **Configured for:** website-1 repository only
- **Deployment:** Automated on push to main and feature branches

#### Vercel Configuration
- **File:** `vercel.json`
- **Framework:** Next.js
- **Build:** Automated from website-1 repository

#### Package.json
Repository metadata is configured to reference website-1:
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/vanya-vasya/website-1.git"
  },
  "bugs": {
    "url": "https://github.com/vanya-vasya/website-1/issues"
  },
  "homepage": "https://github.com/vanya-vasya/website-1#readme"
}
```

## Usage Instructions

### Clone the Repository
```bash
git clone https://github.com/vanya-vasya/website-1.git
cd website-1
```

### Verify Configuration
```bash
# Check remotes
git remote -v

# Should show:
# origin  https://github.com/vanya-vasya/website-1.git (fetch)
# origin  https://github.com/vanya-vasya/website-1.git (push)
```

### Run Audit
```bash
# Audit and fix configuration
./scripts/audit-git-remotes.sh
```

### Normal Git Workflow
```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to website-1 (protected by hooks)
git push -u origin feature/my-feature
```

## Security Measures

### 1. Remote Lock
Only `origin` pointing to website-1 is allowed. Any other remote will be:
- Detected by audit script
- Blocked by pre-push hook
- Flagged in CI/CD logs

### 2. Audit Reports
Generate audit reports on:
- Every deployment
- Manual script execution
- Pre-commit hooks (optional)

### 3. CI/CD Integration
GitHub Actions workflows are configured to:
- Pull only from website-1
- Deploy only from website-1
- Report configuration issues

## Troubleshooting

### Problem: Push Blocked
```
❌ Error: Pushing to unauthorized remote
```

**Solution:**
```bash
./scripts/audit-git-remotes.sh
git remote -v  # Verify configuration
```

### Problem: Multiple Remotes Detected
```
❌ Found unauthorized remote: website-2
```

**Solution:**
```bash
git remote remove website-2
./scripts/audit-git-remotes.sh  # Verify fix
```

### Problem: Wrong Repository URL
```
❌ Remote URL mismatch
```

**Solution:**
```bash
git remote set-url origin https://github.com/vanya-vasya/website-1.git
```

## Maintenance

### Regular Audits
Run monthly audits:
```bash
# Add to cron or run manually
./scripts/audit-git-remotes.sh
```

### Update Hooks
Keep Git hooks updated:
```bash
./scripts/install-git-hooks.sh
```

### Verify CI/CD
Check GitHub Actions:
```bash
# View workflow status
gh workflow view "Deploy Nerbixa (Website 1)"
```

## Additional Resources

- **Repository:** https://github.com/vanya-vasya/website-1
- **Issues:** https://github.com/vanya-vasya/website-1/issues
- **Pull Requests:** https://github.com/vanya-vasya/website-1/pulls
- **Actions:** https://github.com/vanya-vasya/website-1/actions

## Contact & Support

For configuration issues or policy updates, contact the repository maintainers.

---

**Last Updated:** October 31, 2025  
**Policy Version:** 1.0  
**Enforced Repository:** https://github.com/vanya-vasya/website-1

