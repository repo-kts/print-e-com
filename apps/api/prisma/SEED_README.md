# Database Seed Script

This comprehensive seed script populates your database with realistic e-commerce data for development and testing.

## What Gets Seeded?

### 🏢 Brands (3)
- PrintHub
- CustomWear
- ArtPrints

### 📂 Categories (12)
**Parent Categories (4):**
- Apparel
- Home & Living
- Stationery
- Accessories

**Sub-Categories (8):**
- T-Shirts
- Hoodies
- Mugs
- Posters
- Notebooks
- Stickers
- Phone Cases
- Tote Bags

### 🛍️ Products (10)
Each product includes:
- ✅ Multiple images with display order
- ✅ Detailed specifications
- ✅ Searchable attributes
- ✅ Tags for categorization
- ✅ Multiple variants (sizes, colors)
- ✅ Stock management
- ✅ Pricing (base, selling, MRP)
- ✅ SEO-friendly slugs
- ✅ Feature flags (isFeatured, isNewArrival, isBestSeller)

**Products List:**
1. Premium Cotton T-Shirt (5 sizes, 500 units)
2. Oversized T-Shirt (4 sizes, 300 units)
3. Premium Hoodie (4 sizes, 200 units)
4. Ceramic Coffee Mug (3 colors, 1000 units)
5. Magic Mug (300 units)
6. A3 Premium Poster (2 variants, 500 units)
7. Custom Notebook A5 (400 units)
8. iPhone Case (3 models, 300 units)
9. Canvas Tote Bag (2 colors, 500 units)
10. Custom Stickers Pack (3 sizes, 2000 units)

### 🎟️ Coupons (4)
- **WELCOME10** - 10% off for first-time users
- **SAVE20** - 20% off on orders above ₹1000
- **FLAT100** - Flat ₹100 off on orders above ₹999
- **BULK50** - 15% off for bulk orders above ₹5000

### 👥 Demo Users (2)
- **Admin:** admin@example.com (Super Admin)
- **Customer:** customer@example.com (with sample address)

## How to Run

### Prerequisites
Make sure you have:
- PostgreSQL database running
- `.env` file configured with `DATABASE_URL`
- Prisma migrations applied

### Run the Seed Script

```bash
# From the api directory
cd apps/api

# Run the seed script
bun run db:seed

# OR use npm/yarn
npm run db:seed
# yarn db:seed
```

### First Time Setup (Complete Flow)

```bash
# 1. Navigate to API directory
cd apps/api

# 2. Make sure .env file exists with DATABASE_URL
# DATABASE_URL="postgresql://username:password@localhost:5432/ecom"

# 3. Generate Prisma client
bun run db:generate

# 4. Run migrations
bun run db:migrate

# 5. Seed the database
bun run db:seed
```

## Features

### ✅ Idempotent
The script can be run multiple times safely. It uses `upsert` operations to avoid duplicate entries.

### ✅ Comprehensive Data
- Real-world product descriptions
- Proper pricing structure (basePrice, sellingPrice, MRP)
- Multiple product variants
- Stock management
- Product images with alt text
- Detailed specifications
- Searchable attributes
- Category hierarchy

### ✅ Ready for Testing
All data is ready to use for:
- Frontend development
- API testing
- E-commerce flow testing
- Order placement
- Cart operations
- Search and filtering

## Database State After Seeding

```
📊 SEEDING SUMMARY
==================================================
✅ Brands: 3
✅ Categories: 12 (4 parent + 8 sub-categories)
✅ Products: 10 (with variants, images, specs)
✅ Coupons: 4
✅ Demo Users: 2
==================================================
```

## Customization

To add more products, edit the `productsData` array in `seed.ts`:

```typescript
{
  name: "Your Product Name",
  slug: "your-product-slug",
  shortDescription: "Brief description",
  description: "Full description",
  basePrice: 999,
  sellingPrice: 799,
  mrp: 1199,
  categorySlug: "t-shirts", // Use existing category slug
  brandSlug: "customwear", // Use existing brand slug
  sku: "YOUR-SKU",
  stock: 100,
  isFeatured: true,
  images: [...],
  specifications: [...],
  attributes: [...],
  tags: [...],
  variants: [...]
}
```

## Resetting Database

To reset and reseed:

```bash
# Drop and recreate database
bun run db:migrate reset

# This will:
# 1. Drop the database
# 2. Create it again
# 3. Run all migrations
# 4. Run the seed script automatically
```

## Troubleshooting

### Issue: "Environment variable not found: DATABASE_URL"
**Solution:** Create `.env` file in `apps/api/` with:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ecom"
```

### Issue: "Unique constraint failed"
**Solution:** The script is idempotent, but if you're having issues:
```bash
# Reset the database completely
bun run db:migrate reset
```

### Issue: "Database does not exist"
**Solution:** Create the database first:
```bash
createdb ecom
# OR using psql
psql -U your_username -c "CREATE DATABASE ecom;"
```

## Next Steps

After seeding:

1. **Start the API server:**
   ```bash
   cd apps/api
   bun run dev
   ```

2. **Start the frontend:**
   ```bash
   cd apps/web
   bun run dev
   ```

3. **Test the data:**
   - Browse to http://localhost:3000/products
   - View Prisma Studio: `bun run db:studio`

4. **Login for testing:**
   - Use Supabase auth to create accounts
   - Or use the demo emails (setup in Supabase first)

## Notes

- All image URLs use placeholders. Replace with real image URLs in production.
- Demo user passwords are managed by Supabase, not this script.
- Product slugs are unique and SEO-friendly.
- Stock levels are set high for testing purposes.
- All prices are in INR (Indian Rupees).

## Support

For issues or questions, check:
- Main README: `apps/api/README.md`
- Prisma docs: https://www.prisma.io/docs
- Schema: `apps/api/prisma/schema.prisma`

