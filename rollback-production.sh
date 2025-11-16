#!/bin/bash

# Production Rollback Script for Stock Dashboard
# Quick rollback to previous version in case of issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
S3_BUCKET="fx-stock-dashboard-prod"
REGION="us-east-1"
BACKUP_PREFIX="backups/$(date +%Y/%m/%d)"

echo -e "${RED}🔄 Production Rollback Script${NC}"
echo -e "${RED}==============================${NC}"
echo ""

# Function to ask for confirmation
confirm() {
    while true; do
        read -p "$(echo -e ${YELLOW}$1 ${NC}[y/N]: )" yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            "" ) return 1;;
            * ) echo "Please answer yes (y) or no (n).";;
        esac
    done
}

# Check if backup exists
check_backup() {
    echo -e "${BLUE}Checking for recent backups...${NC}"
    
    # List recent backups
    aws s3 ls s3://${S3_BUCKET}/backups/ --recursive | tail -10
    
    if [[ $? -ne 0 ]]; then
        echo -e "${RED}❌ No backups found or S3 access error${NC}"
        exit 1
    fi
}

# Restore from backup
restore_backup() {
    read -p "Enter backup timestamp (YYYY-MM-DD-HHMMSS) or 'latest' for most recent: " backup_time
    
    if [[ "${backup_time}" == "latest" ]]; then
        # Find the most recent backup
        backup_path=$(aws s3 ls s3://${S3_BUCKET}/backups/ --recursive | sort | tail -1 | awk '{print $4}')
    else
        backup_path="backups/${backup_time}/"
    fi
    
    if [[ -z "${backup_path}" ]]; then
        echo -e "${RED}❌ Backup not found${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}Restoring from: ${backup_path}${NC}"
    
    if confirm "⚠️  This will replace the current production deployment. Continue?"; then
        # Create backup of current state before rollback
        current_backup="backups/pre-rollback-$(date +%Y-%m-%d-%H%M%S)/"
        echo "Creating backup of current state..."
        aws s3 sync s3://${S3_BUCKET}/ s3://${S3_BUCKET}/${current_backup} --exclude "backups/*"
        
        # Restore from backup
        echo "Restoring from backup..."
        aws s3 sync s3://${S3_BUCKET}/${backup_path} s3://${S3_BUCKET}/ --delete --exclude "backups/*"
        
        echo -e "${GREEN}✅ Rollback completed${NC}"
        echo "Current state backed up to: ${current_backup}"
    else
        echo -e "${YELLOW}Rollback cancelled${NC}"
    fi
}

# Git rollback option
git_rollback() {
    echo -e "${BLUE}Recent commits:${NC}"
    git log --oneline -10
    
    read -p "Enter commit hash to rollback to: " commit_hash
    
    if [[ -z "${commit_hash}" ]]; then
        echo -e "${RED}❌ No commit hash provided${NC}"
        exit 1
    fi
    
    if confirm "⚠️  This will create a new commit that reverts to ${commit_hash}. Continue?"; then
        git revert --no-edit HEAD..${commit_hash}
        echo -e "${GREEN}✅ Git rollback completed${NC}"
        echo "Now run ./deploy-production.sh to deploy the rolled-back version"
    else
        echo -e "${YELLOW}Git rollback cancelled${NC}"
    fi
}

# Quick health check
health_check() {
    echo -e "${BLUE}Running health check...${NC}"
    
    # Test website
    if curl -s -o /dev/null -w "%{http_code}" "http://${S3_BUCKET}.s3-website-${REGION}.amazonaws.com" | grep -q "200"; then
        echo -e "${GREEN}✅ Website is responding${NC}"
    else
        echo -e "${RED}❌ Website is not responding${NC}"
    fi
    
    # Test API
    if curl -s "https://7kiye42406.execute-api.us-east-1.amazonaws.com/prod/stocks?limit=1" | grep -q "stocks"; then
        echo -e "${GREEN}✅ API is responding${NC}"
    else
        echo -e "${RED}❌ API is not responding${NC}"
    fi
}

# Main menu
main() {
    echo "What would you like to do?"
    echo "1. Check recent backups"
    echo "2. Rollback from S3 backup"
    echo "3. Git rollback (revert commits)"
    echo "4. Health check"
    echo "5. Exit"
    
    read -p "Choose option (1-5): " choice
    
    case $choice in
        1)
            check_backup
            ;;
        2)
            restore_backup
            ;;
        3)
            git_rollback
            ;;
        4)
            health_check
            ;;
        5)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            main
            ;;
    esac
}

main "$@"