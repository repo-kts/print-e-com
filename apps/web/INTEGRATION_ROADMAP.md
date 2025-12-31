# Frontend-Backend Integration Roadmap

## Current Status
✅ Authentication (Login/Signup/OAuth) - **COMPLETED**
✅ API Client Infrastructure - **COMPLETED**
✅ Cookie-based token management - **COMPLETED**
✅ Product Listing Page - **COMPLETED** (Phase 1, Step 1)
✅ Product Detail Page - **COMPLETED** (Phase 1, Step 2)
✅ Product Search - **COMPLETED** (Phase 1, Step 3)
✅ Home Page Products - **COMPLETED** (Phase 1, Step 4)

---

## Remaining Tasks

### Phase 1: Products (Core Functionality) 🎯
**Priority: HIGH** - Users need to browse products

#### 1.1 Product Listing Page ✅ **COMPLETED**
- [x] Replace mock data in `/products` page with `getProducts()` API
- [x] Implement filters (category, price, brand, etc.)
- [x] Add pagination controls
- [x] Add loading states and skeletons
- [x] Add error handling (empty states, API errors)

#### 1.2 Product Detail Page ✅ **COMPLETED**
- [x] Replace mock data in `/products/[id]` page with `getProduct(id)` API
- [x] Display real product images, variants, specifications
- [x] Add related products from API
- [x] Track recently viewed products (if user logged in)

#### 1.3 Product Search ✅ **COMPLETED**
- [x] Implement search functionality using API
- [x] Show search query badge with clear button
- [x] Update search bar in header to sync with URL
- [x] Add enhanced no-results message for searches
- [x] Update placeholder text to match business

#### 1.4 Home Page Products ✅ **COMPLETED**
- [x] Enhanced backend API with feature flag filters
- [x] Update `PopularProducts` component with real API data (isFeatured)
- [x] Update `BestSeller` component with real API data (isBestSeller)  
- [x] Update `PrintedBestProduct` component with real API data (isNewArrival)
- [x] Add loading skeletons for all components
- [x] Add product badges (BESTSELLER, NEW)
- [x] Display discount pricing when applicable

#### 1.5 Categories
- [ ] Fetch real categories from `getCategories()` API
- [ ] Update header category navigation
- [ ] Add category filtering to product listing

**Estimated Time: 6-8 hours**

---

### Phase 2: Cart Functionality 🛒
**Priority: HIGH** - Core e-commerce feature

#### 2.1 Add to Cart
- [ ] Connect "Add to Cart" buttons in product cards
- [ ] Connect "Add to Cart" in product detail page
- [ ] Show success notifications/toasts
- [ ] Update cart count in header
- [ ] Handle variants and custom options

#### 2.2 Cart Page
- [ ] Replace mock data with `getCart()` API
- [ ] Implement quantity updates with `updateCartItem()`
- [ ] Implement remove items with `removeFromCart()`
- [ ] Implement clear cart with `clearCart()`
- [ ] Calculate and display totals
- [ ] Add loading states for cart operations

#### 2.3 Cart Context (Optional but Recommended)
- [ ] Create CartContext for global cart state
- [ ] Track cart items count
- [ ] Sync cart across components
- [ ] Handle cart updates in real-time

**Estimated Time: 4-6 hours**

---

### Phase 3: Wishlist 💝
**Priority: MEDIUM** - Nice to have feature

#### 3.1 Create Wishlist API Functions
- [ ] Create `lib/api/wishlist.ts`
- [ ] Add `getWishlist()` function
- [ ] Add `addToWishlist()` function
- [ ] Add `removeFromWishlist()` function
- [ ] Add `checkWishlist()` function

#### 3.2 Integrate Wishlist
- [ ] Add wishlist button to product cards
- [ ] Add wishlist button to product detail page
- [ ] Create wishlist page
- [ ] Show wishlist status (filled/empty heart icon)
- [ ] Handle authentication (redirect to login if not logged in)

**Estimated Time: 3-4 hours**

---

### Phase 4: Checkout & Orders 📦
**Priority: HIGH** - Complete purchase flow

#### 4.1 Address Management
- [ ] Create addresses page
- [ ] Integrate `createAddress()` API
- [ ] List user addresses
- [ ] Set default address
- [ ] Edit/delete addresses

#### 4.2 Checkout Flow
- [ ] Fetch cart items for checkout
- [ ] Select/add shipping address
- [ ] Apply coupon codes
- [ ] Calculate shipping charges
- [ ] Display order summary
- [ ] Create order with `createOrder()` API

#### 4.3 Payment Integration
- [ ] Create `lib/api/payment.ts`
- [ ] Add Razorpay order creation function
- [ ] Add payment verification function
- [ ] Integrate Razorpay checkout on frontend
- [ ] Handle payment success/failure
- [ ] Redirect to order confirmation

#### 4.4 Orders Page
- [ ] Fetch orders with `getMyOrders()` API
- [ ] Display order list
- [ ] Add order status badges
- [ ] Add filters (pending, shipped, delivered, etc.)
- [ ] Add pagination

#### 4.5 Order Detail Page
- [ ] Fetch single order with `getOrder(id)` API
- [ ] Display order items
- [ ] Show order status history
- [ ] Display shipping address
- [ ] Show payment information
- [ ] Add "Track Order" functionality

**Estimated Time: 8-10 hours**

---

### Phase 5: User Profile & Settings ⚙️
**Priority: MEDIUM**

#### 5.1 Profile Page
- [ ] Display user information
- [ ] Add edit profile functionality
- [ ] Upload profile picture (if supported)

#### 5.2 Addresses Page
- [ ] Already covered in Phase 4.1

#### 5.3 Settings Page
- [ ] Change password functionality
- [ ] Email preferences
- [ ] Notification settings
- [ ] Account deletion

**Estimated Time: 3-4 hours**

---

### Phase 6: Additional Features 🌟
**Priority: LOW** - Enhancements

#### 6.1 Reviews & Ratings
- [ ] Create `lib/api/reviews.ts`
- [ ] Display product reviews
- [ ] Add review form
- [ ] Submit review with rating
- [ ] Mark review as helpful

#### 6.2 Coupons
- [ ] Fetch available coupons
- [ ] Apply coupon at checkout
- [ ] Display coupon discount

#### 6.3 Recently Viewed Products
- [ ] Display on product page or home page
- [ ] Auto-tracked when user views products

#### 6.4 Upload Design Feature
- [ ] Implement file upload for custom designs
- [ ] Connect to backend upload endpoint
- [ ] Preview uploaded designs

**Estimated Time: 5-6 hours**

---

### Phase 7: Polish & Optimization 💎
**Priority: LOW**

#### 7.1 Loading States
- [ ] Add skeleton loaders for all data fetching
- [ ] Add spinners for button actions
- [ ] Add progress indicators

#### 7.2 Error Handling
- [ ] Add error boundaries
- [ ] Add toast notifications for errors
- [ ] Add retry mechanisms
- [ ] Add empty states

#### 7.3 Performance
- [ ] Implement image lazy loading
- [ ] Add request caching
- [ ] Optimize re-renders
- [ ] Code splitting

#### 7.4 Responsive Design
- [ ] Test on mobile devices
- [ ] Fix any responsive issues
- [ ] Optimize for tablets

**Estimated Time: 4-5 hours**

---

## Total Estimated Time: 35-45 hours

---

## Recommended Order

### Week 1: Core Features
1. **Day 1-2**: Products Integration (Phase 1)
2. **Day 3**: Cart Integration (Phase 2)
3. **Day 4**: Checkout Flow (Phase 4.1, 4.2)

### Week 2: Complete Purchase Flow
4. **Day 5**: Payment Integration (Phase 4.3)
5. **Day 6**: Orders Integration (Phase 4.4, 4.5)
6. **Day 7**: Wishlist (Phase 3)

### Week 3: Polish
7. **Day 8-9**: Additional Features (Phase 6)
8. **Day 10**: Polish & Testing (Phase 7)

---

## Dependencies

```
Authentication (✅ Done)
    ↓
Products ──→ Cart ──→ Checkout ──→ Payment ──→ Orders
    ↓           ↓
Wishlist    Profile
```

---

## Quick Wins (Start Here) 🚀

1. **Product Listing** - Most visible, immediate impact
2. **Add to Cart** - Basic functionality users expect
3. **Cart Page** - See items before checkout
4. **Checkout** - Complete the purchase flow

---

## Notes

- Each phase can be broken down into smaller tasks
- Test each integration before moving to next
- Keep backend running during development
- Use browser DevTools to debug API calls
- Remove console.logs before production

