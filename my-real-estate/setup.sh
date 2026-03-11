#!/bin/bash
set -e

echo "🔧 Setting up CMS Platform..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install it first:"
  echo "   brew install node@22   (macOS)"
  echo "   https://nodejs.org     (other)"
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --silent

# Create .env if missing (SQLite by default — no database setup needed)
if [ ! -f .env ]; then
  cat > .env << EOF
PAYLOAD_SECRET=$(openssl rand -hex 32)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# To use PostgreSQL instead of SQLite, uncomment:
# POSTGRES_URL=postgres://localhost:5432/my_cms
EOF
  echo "📝 Created .env file"
else
  echo "📝 .env already exists, skipping"
fi

# Create data directory for SQLite
mkdir -p data

# Seed the database
echo "🌱 Seeding database..."
npm run seed

echo ""
echo "✅ Ready! Run: npm run dev"
echo ""
echo "   Homepage:  http://localhost:3000"
echo "   Admin:     http://localhost:3000/admin"
echo "   Login:     admin@platform.com / changeme123"
