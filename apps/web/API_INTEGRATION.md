# API Integration Guide

This document explains how the frontend is integrated with the backend API.

## Overview

The frontend Next.js app communicates with the Express.js backend API running on `http://localhost:3002/api/v1`.

## Architecture

### 1. API Client Layer (`lib/api-client.ts`)
- Centralized HTTP client with error handling
- Automatic token management (stores/retrieves JWT from cookies)
- Automatic authorization header injection
- Handles authentication errors and redirects

### 2. API Functions (`lib/api/`)
Organized by feature:
- `auth.ts` - Authentication (login, register, profile)
- `products.ts` - Product catalog, categories, search
- `cart.ts` - Shopping cart operations
- `orders.ts` - Order management
- `wishlist.ts` - Wishlist operations (can be added)
- `payment.ts` - Payment integration (can be added)

### 3. Auth Context (`contexts/AuthContext.tsx`)
- React Context for global authentication state
- Provides `useAuth()` hook for components
- Handles token persistence and user state

## Setup

### 1. Environment Variables

Create a `.env.local` file in `apps/web/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1
```

For production, update this to your production API URL.

### 2. Make sure backend is running

```bash
cd apps/api
bun run dev
```

The API should be running on `http://localhost:3002`

## Usage Examples

### Authentication

```tsx
import { useAuth } from '@/contexts/AuthContext';

function LoginComponent() {
  const { login, user, isAuthenticated, loading } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login(email, password);
      // User is now logged in, token is stored automatically
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (isAuthenticated) return <div>Welcome {user?.name}!</div>;
  
  return <button onClick={handleLogin}>Login</button>;
}
```

### Fetching Products

```tsx
import { useEffect, useState } from 'react';
import { getProducts, Product } from '@/lib/api/products';

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await getProducts({
          page: 1,
          limit: 20,
          isFeatured: true
        });
        
        if (response.success && response.data) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### Cart Operations

```tsx
import { addToCart, getCart } from '@/lib/api/cart';
import { useAuth } from '@/contexts/AuthContext';

function AddToCartButton({ productId }: { productId: string }) {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    setLoading(true);
    try {
      await addToCart({
        productId,
        quantity: 1
      });
      // Show success message
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button onClick={handleAddToCart} disabled={loading}>
      {loading ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
```

## Available API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/user/profile` - Get current user profile (protected)

### Products (Public)
- `GET /categories` - Get all categories
- `GET /products` - Get products with filters
- `GET /products/:id` - Get single product
- `GET /search?search=query` - Search products

### Cart (Protected)
- `GET /cart` - Get user's cart
- `POST /cart/items` - Add item to cart
- `PUT /cart/items/:itemId` - Update cart item
- `DELETE /cart/items/:itemId` - Remove item from cart
- `DELETE /cart/clear` - Clear entire cart

### Orders (Protected)
- `GET /customer/orders` - Get user's orders
- `GET /customer/orders/:id` - Get single order
- `POST /customer/orders` - Create new order

### Wishlist (Protected)
- `GET /wishlist` - Get user's wishlist
- `POST /wishlist` - Add to wishlist
- `DELETE /wishlist/:productId` - Remove from wishlist

### Payment (Protected)
- `POST /payment/create-order` - Create Razorpay order
- `POST /payment/verify` - Verify payment

## Error Handling

All API functions throw errors that you should catch:

```tsx
try {
  const response = await getProducts();
} catch (error: ApiError) {
  // error.message - User-friendly error message
  // error.statusCode - HTTP status code
  // error.errors - Validation errors (if any)
  
  if (error.statusCode === 401) {
    // User not authenticated
  } else if (error.statusCode === 404) {
    // Resource not found
  }
}
```

## Type Safety

All API functions are fully typed. Import types from the API modules:

```tsx
import type { Product, ProductListParams } from '@/lib/api/products';
import type { User, AuthResponse } from '@/lib/api/auth';
import type { Cart, CartItem } from '@/lib/api/cart';
```

## Next Steps

1. ✅ API client infrastructure - Done
2. ✅ Authentication context - Done
3. ✅ Login page integration - Done
4. ⏳ Product listing integration
5. ⏳ Cart page integration
6. ⏳ Checkout flow integration
7. ⏳ Order history integration
8. ⏳ Wishlist integration

## Notes

- The API client automatically handles JWT tokens
- Tokens are stored in cookies (more secure than localStorage, protected from XSS)
- Cookies are set with `SameSite=Strict` for CSRF protection
- On 401 errors, users are redirected to login
- All API calls include proper error handling
- Types are shared between frontend and backend (via @repo/types if configured)

