#!/bin/bash

# Git Remote Audit & Enforcement Script
# This script ensures that only the website-1 repository is configured as a remote
# Repository: https://github.com/vanya-vasya/website-1

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ALLOWED_REPO="https://github.com/vanya-vasya/website-1.git"
ALLOWED_REMOTE_NAME="origin"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  Git Remote Audit & Enforcement${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    exit 1
fi

echo -e "${BLUE}📍 Current directory:${NC} $(pwd)"
echo ""

# Get all remotes
echo -e "${BLUE}🔍 Checking configured remotes...${NC}"
REMOTES=$(git remote)

if [ -z "$REMOTES" ]; then
    echo -e "${YELLOW}⚠️  No remotes configured${NC}"
    echo -e "${BLUE}➕ Adding website-1 as origin...${NC}"
    git remote add origin "$ALLOWED_REPO"
    echo -e "${GREEN}✅ Added origin -> $ALLOWED_REPO${NC}"
    exit 0
fi

# Display current remotes
echo -e "${BLUE}Current remotes:${NC}"
git remote -v
echo ""

# Check for unauthorized remotes
UNAUTHORIZED_REMOTES=()
CORRECT_REMOTE_FOUND=false

for remote in $REMOTES; do
    REMOTE_URL=$(git remote get-url "$remote")
    
    if [ "$remote" = "$ALLOWED_REMOTE_NAME" ] && [ "$REMOTE_URL" = "$ALLOWED_REPO" ]; then
        CORRECT_REMOTE_FOUND=true
        echo -e "${GREEN}✅ Valid remote found: $remote -> $REMOTE_URL${NC}"
    else
        UNAUTHORIZED_REMOTES+=("$remote:$REMOTE_URL")
        echo -e "${RED}❌ Unauthorized remote: $remote -> $REMOTE_URL${NC}"
    fi
done

echo ""

# Handle unauthorized remotes
if [ ${#UNAUTHORIZED_REMOTES[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found ${#UNAUTHORIZED_REMOTES[@]} unauthorized remote(s)${NC}"
    echo ""
    echo -e "${BLUE}Do you want to remove unauthorized remotes? (y/n)${NC}"
    read -r RESPONSE
    
    if [[ "$RESPONSE" =~ ^[Yy]$ ]]; then
        for remote_info in "${UNAUTHORIZED_REMOTES[@]}"; do
            REMOTE_NAME="${remote_info%%:*}"
            echo -e "${YELLOW}🗑️  Removing: $REMOTE_NAME${NC}"
            git remote remove "$REMOTE_NAME"
            echo -e "${GREEN}✅ Removed: $REMOTE_NAME${NC}"
        done
    else
        echo -e "${YELLOW}⚠️  Skipping removal of unauthorized remotes${NC}"
    fi
fi

# Ensure origin is set correctly
if ! $CORRECT_REMOTE_FOUND; then
    echo -e "${YELLOW}⚠️  Origin remote not configured correctly${NC}"
    
    if git remote | grep -q "^origin$"; then
        echo -e "${BLUE}🔄 Updating origin URL...${NC}"
        git remote set-url origin "$ALLOWED_REPO"
    else
        echo -e "${BLUE}➕ Adding origin remote...${NC}"
        git remote add origin "$ALLOWED_REPO"
    fi
    echo -e "${GREEN}✅ Origin configured: $ALLOWED_REPO${NC}"
fi

echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}✨ Audit complete!${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo -e "${BLUE}Final configuration:${NC}"
git remote -v
echo ""
echo -e "${GREEN}✅ All remotes are now compliant with policy${NC}"
echo -e "${BLUE}📝 Policy: Only website-1 repository allowed${NC}"
echo -e "${BLUE}🔗 Repository: $ALLOWED_REPO${NC}"

