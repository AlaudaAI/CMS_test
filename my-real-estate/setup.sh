#!/bin/bash
set -e

echo "🔧 Setting up CMS Platform..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install it first:"
  echo "   brew install node@22"
  exit 1
fi

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
  echo "❌ PostgreSQL not found. Install it first:"
  echo "   brew install postgresql@17 && brew services start postgresql@17"
  exit 1
fi

# Check PostgreSQL is running
if ! pg_isready -q 2>/dev/null; then
  echo "❌ PostgreSQL isn't running. Start it:"
  echo "   brew services start postgresql@17"
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --silent

# Create database (ignore if exists)
DB_NAME="cms_platform"
createdb "$DB_NAME" 2>/dev/null && echo "🗄️  Created database: $DB_NAME" || echo "🗄️  Database $DB_NAME already exists"

# Create .env if missing
if [ ! -f .env ]; then
  cat > .env << EOF
POSTGRES_URL=postgres://localhost:5432/$DB_NAME
PAYLOAD_SECRET=$(openssl rand -hex 32)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EOF
  echo "📝 Created .env file"
else
  echo "📝 .env already exists, skipping"
fi

# Seed the database
echo "🌱 Seeding database..."
npm run seed

echo ""
echo "✅ Ready! Run: npm run dev"
echo ""
echo "   Homepage:  http://localhost:3000"
echo "   Admin:     http://localhost:3000/admin"
echo "   Login:     admin@platform.com / changeme123"
