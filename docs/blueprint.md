# **App Name**: VoucherVerse

## Core Features:

- Dynamic Landing Page: Render the landing page dynamically based on the JSON configuration in the public folder, defining page title, route, and sections.
- Global Context: Manage business data, design settings (font, color scheme, spacing), and global session state (like email for voucher claim) through a global context provider.
- Product Listing with Vouchers: Display products with linked voucher and rating data. Shows real-time available claims for promos, utilizing Supabase data joins for combined results.
- Secure Voucher Claim: Enable users to enter their email and claim a voucher through a modal.  Checks if the email has already been used and saves the claim, while also preventing duplicate claims via RPC.
- Real-time Claim Count: Provide real-time updates of the claimed count using Supabase subscriptions, updating the UI automatically.
- API Layer for Data: Implement secure API routes for all database operations, ensuring data is returned in JSON format. Includes endpoints for product listings, testimonials, services, and voucher claims.
- Animated UI Elements: Incorporate Framer Motion for section fade-ins, hover animations on products, claim count updates, and modal transitions.

## Style Guidelines:

- The main purpose of this app is related to marketing; additionally, it handles data, user data in particular. This suggests to me a desire to establish confidence while conveying exciting promotional content. I suggest a dark color scheme. The primary color should be vibrant and eye-catching: a saturated Purple (#9F5FBC).
- The background color will be a very desaturated version of purple, for a dark theme look: Dark Purple (#262329).
- The accent color will be analogous to purple, in the blue range, with greater brightness and saturation: Electric Blue (#7DF9FF).
- Font: 'Space Grotesk', a sans-serif for headlines and shorter pieces of body text; 'Inter' as a fallback font for body text
- Code font: 'Source Code Pro', a monospace font for displaying code snippets
- Use modern, minimalist icons to represent different product categories and voucher types.
- Maintain a clean, mobile-first responsive design with clear sections and intuitive navigation.  Use a grid-based system for product listings.
- Use subtle animations to enhance user experience, such as fade-in effects for sections and hover animations for products. Make sure that claiming notifications or confirmations will use brief and eye-catching animations to signify user interaction with the webpage.