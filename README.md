# 🛍️ Style Your Mood - Mobile-First Fashion E-Commerce Web Application

A full-stack, mobile-first fashion e-commerce web application with rich interactive styling, built with **Node.js**, **Express.js**, **EJS templating**, **Tailwind CSS**, and **vanilla JavaScript**.

---

## 🎨 Visual & Design Rules Compliance

1. **Hero Banners & Promotional Graphics (Colors & Patterns Only)**:
   - **Zero external photography** used for promotional banners, category headers, or strips.
   - Designed exclusively with **pure CSS geometric patterns** (polka dots, diagonal stripes, twill weave, houndstooth, chevrons, cyber grids, concentric circles, confetti dots), **vibrant light blue gradients** (sky blue `#0ea5e9`, oceanic blue `#0284c7`, electric cyan `#38bdf8`, soft ice blue `#f0f9ff`, and slate navy `#0f172a`), and **bold typography**.
2. **Product Images (Dummy Placeholders)**:
   - Clean 3:4 portrait aspect ratio placeholder URLs (`https://placehold.co/400x533/f0f9ff/0284c7?text=...`) defined via an easily swappable `imageUrl` field in [`data/products.json`](file:///home/oem/Desktop/gity/data/products.json).
   - Includes automatic inline SVG fallback if an external placeholder service is ever offline or unreachable.

---

## 📱 Mobile-First Features

* **Sticky Top Navigation**:
  - Hamburger menu trigger for mobile drawer
  - Vibrant **Style Your Mood** brand logo with gradient styling
  - Live, expandable search bar with debounced instant filtering
  - Wishlist icon with real-time counter badge
  - Shopping Bag (Cart) icon with real-time counter badge
* **Story-Style Category Scroller**:
  - Horizontal touch-scrollable bar at the top (All Styles, Kurtas & Sets, Sarees, Dresses, Tops & Shirts, Co-ord Sets, Lehengas, Footwear, Handbags, Offers)
  - Circular avatars rendered with **pure CSS patterns and gradients** instead of photos
  - Active category indicator ring with instant client-side catalog filtering
* **Shop by Category Grid (Above Trending Fashion)**:
  - Prominent visual grid featuring 8 curated ladies fashion collections: *Kurtas & Suits*, *Sarees & Drapes*, *Western Dresses*, *Tops & Shirts*, *Co-ord Sets*, *Festive Lehengas*, *Heels & Footwear*, and *Handbags & Clutches*.
  - Styled with pure CSS geometric patterns and light blue gradients.
  - Interactive tap filtering with auto-scroll down to the active product catalog.
* **Patterned Hero Carousel**:
  - High-converting promotional banners (*"INDIA'S BIGGEST WOMEN'S FASHION CARNIVAL"*, *"WESTERN DRESSES & TRENDING CO-ORDS"*, *"GRAND ETHNIC & SAREE UTSAV"*)
  - Live animated countdown timer (`08h : 42m : 19s`)
  - Prev/Next controls, animated indicator dots, and auto-rotation
* **Promotional Bank Offer Strip**:
  - Pure CSS patterned bank offer banner with 1-click coupon code copying (`MOOD100`)
* **2-Column Mobile Product Grid (4-Column on Desktop)**:
  - 3:4 portrait aspect ratio images
  - Floating rating pill at bottom-left (`4.3 ★ | 1.2k`)
  - Floating heart wishlist toggle icon at top-right
  - Bold uppercase Brand Name (Roadster, H&M, Biba, HRX, WROGN, etc.)
  - Muted 1-line product title with ellipsis
  - Discounted price (`₹699`), strikethrough MRP (`₹1499`), and light blue discount badge (`(53% OFF)`)
  - Desktop hover overlay with "ADD TO BAG"
* **Mobile Bottom Action Bar (SORT & FILTER)**:
  - Sticky 50/50 split buttons on mobile screens: **SORT** and **FILTER**
  - **Sort Bottom Sheet**: Slide-up modal with radio options (Recommended, Price: Low to High, Price: High to Low, Customer Rating, Better Discount, What's New)
  - **Filter Bottom Sheet**: 2-column modal (Left: Categories, Brands, Price Range, Discount; Right: checkable options with counts), plus "Clear All" and "Apply"
* **Slide-Over Shopping Bag (Cart) & Wishlist**:
  - Interactive Size Selector popup (S, M, L, XL, XXL) with stock and size chart helper
  - Slide-over bag drawer with quantity modifiers (`+` / `-`), remove actions, and empty states
  - Promo coupon engine supporting `MOOD300` (Flat ₹300 OFF on ₹999+) and `MOOD100` (10% OFF)
  - Accurate price breakdown (Total MRP, Discount on MRP, Coupon Discount, Convenience Fee FREE, Total Payable Amount)
  - 1-click simulated checkout with order celebration feedback
  - Persisted in client `localStorage`
* **Fixed Mobile Bottom Navigation Bar**:
  - App-like bottom bar: **Home**, **Categories**, **Studio**, **Wishlist**, and **Bag**
* **Style Your Mood Studio Lookbook (`/studio`)**:
  - Dedicated trend page showcasing pure CSS pattern outfit palettes, seasonal moodboards, and style inspiration.

---

## 📂 Project Folder Structure

```
gity/
├── data/
│   └── products.json          # 16 realistic clothing items (Men, Women, Kids, Ethnic, Streetwear)
├── public/
│   ├── css/
│   │   └── patterns.css       # Pure CSS geometric patterns, gradients, animations, pills & badges
│   └── js/
│       └── app.js             # Client interactivity (filtering, sorting, cart, wishlist, modals, toasts)
├── views/
│   ├── partials/
│   │   ├── header.ejs         # Sticky top nav with search & dynamic badges
│   │   ├── story-scroller.ejs # Horizontal category scroller with pure CSS pattern avatars
│   │   ├── hero-banner.ejs    # CSS patterned hero carousel with live countdown timer
│   │   ├── promo-strip.ejs    # Pure CSS bank offer strip with click-to-copy promo code
│   │   ├── product-card.ejs   # 3:4 portrait card with floating rating pill & wishlist toggle
│   │   ├── sort-bottom-sheet.ejs # Mobile sort slide-up modal
│   │   ├── filter-bottom-sheet.ejs # Mobile 2-column filter slide-up modal
│   │   ├── size-modal.ejs     # Interactive size selector popup (S, M, L, XL, XXL)
│   │   ├── cart-drawer.ejs    # Slide-over shopping bag with price breakdown & coupon engine
│   │   ├── wishlist-drawer.ejs# Slide-over wishlist drawer with "Move to Bag"
│   │   ├── mobile-bottom-bar.ejs # Fixed mobile action bar (SORT/FILTER) + bottom app navigation
│   │   └── mobile-menu.ejs    # Mobile hamburger drawer navigation
│   ├── index.ejs              # Main catalog page (2-col mobile / 4-col desktop)
│   └── studio.ejs             # Myntra Studio pure CSS pattern trend lookbook
├── package.json               # Node.js project manifest and dependencies
├── server.js                  # Express backend, REST API routes (/api/products with sort & filter)
└── README.md                  # Complete documentation and setup guide
```

---

## 🚀 Step-by-Step Terminal Commands to Run Locally

### 1. Ensure Node.js & npm are in your PATH
If using NVM (Node Version Manager):
```bash
export PATH="/home/oem/.nvm/versions/node/v20.20.2/bin:$PATH"
node -v
npm -v
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server
To start the production server:
```bash
npm start
```
Or start in development mode with auto-reload:
```bash
npm run dev
```

### 4. Open in Browser
Visit:
```
http://localhost:3000
```
And explore the Studio Lookbook at:
```
http://localhost:3000/studio
```

---

## 🖼️ How to Replace Dummy Product Images Later

All dummy products are stored in [`data/products.json`](file:///home/oem/Desktop/gity/data/products.json). To swap in real product photography or CDN URLs, simply update the `imageUrl` property for any item:

```json
{
  "id": 1,
  "brand": "Roadster",
  "title": "Men Slim Fit Washed Denim Trucker Jacket",
  "imageUrl": "/images/products/roadster-jacket.jpg"
}
```
You can place local images in `public/images/products/` and reference them as `/images/products/<filename>.jpg`.

---

## 🧪 Testing the REST API Endpoints

You can test the backend filter and sort engine via `curl` or browser:
```bash
# Get all products
curl http://localhost:3000/api/products

# Filter by category
curl "http://localhost:3000/api/products?category=ethnic"

# Search products
curl "http://localhost:3000/api/products?search=denim"

# Sort by price low-to-high
curl "http://localhost:3000/api/products?sort=price_asc"

# Combined filters (Brand + Price + Discount + Sort)
curl "http://localhost:3000/api/products?brand=H%26M&minDiscount=40&sort=rating"
```

