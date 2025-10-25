#!/bin/bash

# Environment Setup Script
# This script helps you set up environment files for different stages

set -e

ENVS_DIR="$(dirname "$0")"
PROJECT_ROOT="$(dirname "$ENVS_DIR")"

echo "🚀 Environment Setup Script"
echo "=========================="

# Function to copy environment file
copy_env() {
    local env_type=$1
    local source_file="$ENVS_DIR/env.$env_type"
    local target_file="$PROJECT_ROOT/.env.$env_type"
    
    if [ -f "$source_file" ]; then
        cp "$source_file" "$target_file"
        echo "✅ Copied $env_type environment file to .env.$env_type"
    else
        echo "❌ Source file $source_file not found"
        return 1
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [local|staging|production|test|all]"
    echo ""
    echo "Options:"
    echo "  local       - Set up local development environment"
    echo "  staging     - Set up staging environment"
    echo "  production  - Set up production environment"
    echo "  test        - Set up test environment"
    echo "  all         - Set up all environments"
    echo ""
    echo "Examples:"
    echo "  $0 local        # Copy env.local to .env.local"
    echo "  $0 production  # Copy env.production to .env.production"
    echo "  $0 all         # Copy all environment files"
}

# Main logic
case "${1:-}" in
    "local")
        copy_env "local"
        echo ""
        echo "🎉 Local development environment is ready!"
        echo "   You can now run: npm run dev"
        ;;
    "staging")
        copy_env "staging"
        echo ""
        echo "🎉 Staging environment is ready!"
        echo "   Remember to update the database and domain settings"
        ;;
    "production")
        copy_env "production"
        echo ""
        echo "🎉 Production environment is ready!"
        echo "   ⚠️  IMPORTANT: Update all secrets and database credentials"
        echo "   ⚠️  Make sure to use strong, unique passwords"
        ;;
    "test")
        copy_env "test"
        echo ""
        echo "🎉 Test environment is ready!"
        echo "   You can now run: npm test"
        ;;
    "all")
        copy_env "local"
        copy_env "staging"
        copy_env "production"
        copy_env "test"
        echo ""
        echo "🎉 All environments are ready!"
        echo "   Remember to update the production secrets"
        ;;
    *)
        show_usage
        exit 1
        ;;
esac

echo ""
echo "📝 Next steps:"
echo "   1. Review and update the environment variables as needed"
echo "   2. For production: Use strong, unique secrets"
echo "   3. For database: Ensure the database is accessible"
echo "   4. For security: Enable SSL/TLS for production"
