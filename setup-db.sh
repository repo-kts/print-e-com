#!/bin/bash

# Database Setup Script for Print E-Commerce Platform
# This script automates the database setup process

set -e  # Exit on any error

echo "🚀 Print E-Commerce - Database Setup Script"
echo "============================================"
echo ""

# Check if we're in the right directory
if [ ! -d "apps/api" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Navigate to API directory
cd apps/api

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found in apps/api/"
    echo "📝 Creating .env template..."
    echo ""
    cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ecom"

# Server
PORT=4000
NODE_ENV=development

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Razorpay (Get keys from: https://dashboard.razorpay.com/)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Supabase (Optional - Get from: https://app.supabase.com/)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
EOF
    echo "✅ Created .env template"
    echo "⚠️  IMPORTANT: Please update the DATABASE_URL and other credentials in apps/api/.env"
    echo ""
    read -p "Press Enter after you've updated the .env file..."
fi

echo ""
echo "📦 Step 1: Generating Prisma Client..."
bun run db:generate

echo ""
echo "🗄️  Step 2: Running Database Migrations..."
bun run db:migrate

echo ""
echo "🌱 Step 3: Seeding Database with Test Data..."
bun run db:seed

echo ""
echo "============================================"
echo "✅ Database Setup Complete!"
echo "============================================"
echo ""
echo "📊 Your database now has:"
echo "  • 3 Brands"
echo "  • 12 Categories"
echo "  • 10 Products (with images, specs, variants)"
echo "  • 4 Active Coupons"
echo "  • 2 Demo Users"
echo ""
echo "🎯 Next Steps:"
echo "  1. Start the API server:"
echo "     cd apps/api && bun run dev"
echo ""
echo "  2. Start the frontend:"
echo "     cd apps/web && bun run dev"
echo ""
echo "  3. Browse products:"
echo "     http://localhost:3000/products"
echo ""
echo "  4. View database (Prisma Studio):"
echo "     cd apps/api && bun run db:studio"
echo ""
echo "📖 Documentation:"
echo "  • Quick Start: ./SEED_QUICKSTART.md"
echo "  • Full Docs: ./apps/api/prisma/SEED_README.md"
echo ""
echo "Happy coding! 🚀"

