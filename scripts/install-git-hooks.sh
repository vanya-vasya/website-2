#!/bin/bash

# Install Git Hooks for Website-1 Policy Enforcement
# This script installs pre-push hooks to prevent unauthorized pushes

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  Git Hooks Installation${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    exit 1
fi

GIT_DIR=$(git rev-parse --git-dir)
HOOKS_DIR="$GIT_DIR/hooks"
PRE_PUSH_HOOK="$HOOKS_DIR/pre-push"

echo -e "${BLUE}📍 Git directory:${NC} $GIT_DIR"
echo -e "${BLUE}📁 Hooks directory:${NC} $HOOKS_DIR"
echo ""

# Create hooks directory if it doesn't exist
if [ ! -d "$HOOKS_DIR" ]; then
    echo -e "${YELLOW}📁 Creating hooks directory...${NC}"
    mkdir -p "$HOOKS_DIR"
fi

# Backup existing hook if present
if [ -f "$PRE_PUSH_HOOK" ]; then
    echo -e "${YELLOW}⚠️  Existing pre-push hook found${NC}"
    BACKUP_FILE="$PRE_PUSH_HOOK.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${BLUE}💾 Creating backup: $BACKUP_FILE${NC}"
    cp "$PRE_PUSH_HOOK" "$BACKUP_FILE"
fi

# Create pre-push hook
echo -e "${BLUE}📝 Creating pre-push hook...${NC}"

cat > "$PRE_PUSH_HOOK" << 'HOOK_EOF'
#!/bin/bash

# Pre-Push Hook: Website-1 Only Policy
# Prevents pushing to unauthorized remotes

ALLOWED_REPO="https://github.com/vanya-vasya/website-1.git"
ALLOWED_REMOTE="origin"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get the remote being pushed to
remote="$1"
url="$2"

# If no remote specified, use origin
if [ -z "$remote" ]; then
    remote="origin"
fi

# Get the actual URL
if [ -z "$url" ]; then
    url=$(git remote get-url "$remote" 2>/dev/null)
fi

echo ""
echo "🔒 Checking push destination..."
echo "Remote: $remote"
echo "URL: $url"
echo ""

# Check if remote is allowed
if [ "$remote" != "$ALLOWED_REMOTE" ]; then
    echo -e "${RED}❌ PUSH BLOCKED${NC}"
    echo ""
    echo -e "${YELLOW}Unauthorized remote: $remote${NC}"
    echo -e "${YELLOW}Only '$ALLOWED_REMOTE' is allowed${NC}"
    echo ""
    echo -e "${GREEN}Allowed configuration:${NC}"
    echo "  Remote: $ALLOWED_REMOTE"
    echo "  URL: $ALLOWED_REPO"
    echo ""
    echo "Fix this by running:"
    echo "  ./scripts/audit-git-remotes.sh"
    echo ""
    exit 1
fi

# Check if URL matches
if [ "$url" != "$ALLOWED_REPO" ]; then
    echo -e "${RED}❌ PUSH BLOCKED${NC}"
    echo ""
    echo -e "${YELLOW}URL mismatch detected${NC}"
    echo "  Current: $url"
    echo "  Expected: $ALLOWED_REPO"
    echo ""
    echo "Fix this by running:"
    echo "  git remote set-url origin $ALLOWED_REPO"
    echo "  ./scripts/audit-git-remotes.sh"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Push destination verified${NC}"
echo "Proceeding with push to website-1..."
echo ""

exit 0
HOOK_EOF

# Make hook executable
chmod +x "$PRE_PUSH_HOOK"

echo -e "${GREEN}✅ Pre-push hook installed successfully${NC}"
echo ""

# Test the hook
echo -e "${BLUE}🧪 Testing hook installation...${NC}"
if [ -x "$PRE_PUSH_HOOK" ]; then
    echo -e "${GREEN}✅ Hook is executable${NC}"
else
    echo -e "${RED}❌ Hook is not executable${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}✨ Installation Complete!${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo -e "${BLUE}Installed hooks:${NC}"
echo "  • pre-push: Blocks unauthorized pushes"
echo ""
echo -e "${BLUE}What happens now:${NC}"
echo "  • Pushes to website-1 (origin): ✅ Allowed"
echo "  • Pushes to other remotes: ❌ Blocked"
echo ""
echo -e "${YELLOW}Note: Hooks are local to this clone${NC}"
echo -e "${YELLOW}Run this script on each new clone${NC}"
echo ""

