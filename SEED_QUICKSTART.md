# 🌱 Database Seed - Quick Start Guide

This guide helps developers quickly set up the database with test data.

## ⚡ Quick Start (30 seconds)

```bash
# 1. Navigate to the API directory
cd apps/api

# 2. Ensure .env file exists with DATABASE_URL
# (Skip if already configured)
echo 'DATABASE_URL="postgresql://your_username@localhost:5432/ecom"' > .env

# 3. Generate Prisma client
bun run db:generate

# 4. Run migrations (creates tables)
bun run db:migrate

# 5. Seed the database (adds test data)
bun run db:seed
```

That's it! Your database is now populated with test data. 🎉

## 📦 What You Get

After running the seed script, your database will have:

### **10 Products** across 8 categories
- Premium Cotton T-Shirt (5 sizes, ₹499)
- Oversized T-Shirt (4 sizes, ₹699)
- Premium Hoodie (4 sizes, ₹1099)
- Ceramic Coffee Mug (3 colors, ₹249)
- Magic Mug (color-changing, ₹449)
- A3 Premium Poster (₹249)
- Custom Notebook A5 (₹349)
- iPhone Case (3 models, ₹399)
- Canvas Tote Bag (2 colors, ₹349)
- Custom Stickers Pack (3 sizes, ₹79)

### **4 Active Coupons**
- `WELCOME10` - 10% off first order
- `SAVE20` - 20% off on orders ₹1000+
- `FLAT100` - ₹100 off on orders ₹999+
- `BULK50` - 15% off on orders ₹5000+

### **2 Demo Users**
- `admin@example.com` - Admin user
- `customer@example.com` - Regular customer (with address)

### **3 Brands**
- PrintHub
- CustomWear
- ArtPrints

### **12 Categories**
- 4 parent categories (Apparel, Home & Living, Stationery, Accessories)
- 8 sub-categories (T-Shirts, Hoodies, Mugs, Posters, etc.)

## 🔄 Re-running the Seed

The seed script is **idempotent** - you can run it multiple times safely:

```bash
bun run db:seed
```

It will update existing data instead of creating duplicates.

## 🗑️ Reset Database

To completely reset and reseed:

```bash
# This will:
# 1. Drop all tables
# 2. Run all migrations
# 3. Automatically run the seed script
bun run db:migrate reset
```

## 📊 View Your Data

Use Prisma Studio to browse the seeded data:

```bash
bun run db:studio
```

This opens a web interface at http://localhost:5555 where you can:
- Browse all tables
- View relationships
- Edit data
- Run queries

## ✅ Verify Seed Data

After seeding, you should see this output:

```
📊 SEEDING SUMMARY
==================================================
✅ Brands: 3
✅ Categories: 12
✅ Products: 10
✅ Coupons: 4
✅ Demo Users: 2
==================================================
```

## 🚀 Next Steps

1. **Start the API server:**
   ```bash
   cd apps/api
   bun run dev
   ```
   API will be running at http://localhost:4000

2. **Start the frontend:**
   ```bash
   cd apps/web
   bun run dev
   ```
   Frontend will be running at http://localhost:3000

3. **Test the data:**
   - Visit http://localhost:3000/products
   - You should see all 10 products with images, prices, and variants
   - Try filtering by category
   - Test pagination

4. **Test coupons:**
   - Add items to cart
   - Apply coupon codes at checkout

## 🔧 Troubleshooting

### "DATABASE_URL not found"
**Solution:** Create `.env` file in `apps/api/`:
```env
DATABASE_URL="postgresql://username@localhost:5432/ecom"
```

### "Database 'ecom' does not exist"
**Solution:** Create it first:
```bash
createdb ecom
# OR
psql -U your_username -c "CREATE DATABASE ecom;"
```

### "Prisma client not generated"
**Solution:**
```bash
cd apps/api
bun run db:generate
```

### Seed script takes too long
This is normal! The script creates:
- 10 products with images, specs, variants
- 4 brands
- 12 categories
- 4 coupons
- 2 users with addresses

Should complete in 5-10 seconds.

## 📝 Notes

- All product images use placeholder URLs
- Demo users need to be created in Supabase for authentication
- All prices are in INR (₹)
- Stock levels are set high for testing
- Product slugs are SEO-friendly

## 📖 Detailed Documentation

For more details, see:
- [`apps/api/prisma/SEED_README.md`](apps/api/prisma/SEED_README.md) - Complete seed documentation
- [`apps/api/README.md`](apps/api/README.md) - API setup guide
- [`apps/api/prisma/schema.prisma`](apps/api/prisma/schema.prisma) - Database schema

## 🆘 Need Help?

1. Check the seed script: `apps/api/prisma/seed.ts`
2. View schema: `apps/api/prisma/schema.prisma`
3. Check migrations: `apps/api/prisma/migrations/`

---

**Happy coding! 🚀**

