# B1 AppBuilder - Project TODO

## Phase 1: Landing Page & Design System
- [ ] Configure Tailwind CSS with B1 green color scheme (#00A86B, #008556, #00C47D)
- [ ] Create Header component (sticky, logo, nav, CTA button)
- [ ] Create Hero section (H1, subtitle, URL input, trust badges, phone mockup)
- [ ] Create Features section (4 feature cards with icons)
- [ ] Create How It Works section (3 steps with numbered badges)
- [ ] Create Pricing section (3 tiers with toggle for monthly/annual)
- [ ] Create FAQ section (accordion with 8+ Q&A pairs)
- [ ] Create Footer (4 columns, social icons, copyright)
- [ ] Make landing page fully responsive (mobile-first)
- [ ] Implement smooth scrolling and animations

## Phase 2: Authentication & Database
- [ ] Set up Prisma schema with User, App, Subscription, Payment models
- [ ] Configure database connection
- [ ] Implement NextAuth.js integration
- [ ] Create Login page (email/password, social login)
- [ ] Create Register page (name, email, password, terms checkbox)
- [ ] Create Forgot Password page
- [ ] Create Reset Password page
- [ ] Add password validation and error handling
- [ ] Test auth flow end-to-end

## Phase 3: Conversion Flow
- [ ] Create multi-step wizard component with state management
- [ ] Step 1: URL Entry (input validation, website metadata fetch)
- [ ] Step 2: Platform Selection (iOS/Android/Both radio buttons)
- [ ] Step 3: Customization (app name, icon upload, splash screen, color picker)
- [ ] Step 4: Preview (iPhone & Android mockups)
- [ ] Step 5: Plan Selection (pricing cards)
- [ ] Step 6: Checkout (Stripe/PayPal integration)
- [ ] Step 7: Processing (progress bar, status messages)
- [ ] Step 8: Download (success message, download buttons, redirect to dashboard)

## Phase 4: Payment Integration
- [ ] Set up Stripe API keys and products
- [ ] Implement Stripe Checkout Session creation
- [ ] Create Stripe webhook handler (checkout.session.completed, subscription events)
- [ ] Set up PayPal integration
- [ ] Create PayPal button component
- [ ] Implement PayPal webhook handler
- [ ] Add payment method selection UI
- [ ] Test payment flow with test cards

## Phase 5: User Dashboard
- [ ] Create Dashboard layout with sidebar navigation
- [ ] Overview tab (welcome, stats cards, recent activity)
- [ ] My Apps tab (table with app list, status, actions)
- [ ] Billing tab (current plan, payment method, billing history)
- [ ] Settings tab (profile, password change, notifications, delete account)
- [ ] Implement app download functionality
- [ ] Add edit/delete app actions

## Phase 6: Admin Dashboard
- [ ] Create Admin layout with sidebar navigation
- [ ] Dashboard tab (stats cards, revenue chart, recent conversions)
- [ ] Users tab (user management table, edit plan, suspend, delete)
- [ ] Apps tab (all conversions table, download files, delete)
- [ ] Payments tab (transaction history, filtering, export to CSV)
- [ ] Settings tab (site settings, payment config, email settings, feature flags)
- [ ] Add role-based access control

## Phase 7: Chat Widget & Polish
- [ ] Integrate Crisp Chat widget
- [ ] Configure chat widget colors to match B1 green
- [ ] Add chat widget to layout
- [ ] Test chat functionality
- [ ] Add loading states and error handling throughout
- [ ] Implement toast notifications for user feedback
- [ ] Add email templates for notifications

## Phase 8: Testing & Deployment
- [ ] Write Vitest tests for critical flows
- [ ] Test responsive design on mobile/tablet/desktop
- [ ] Test payment flows (Stripe & PayPal)
- [ ] Test auth flow (login, register, password reset)
- [ ] Test conversion flow end-to-end
- [ ] Create GitHub repository
- [ ] Deploy to Vercel
- [ ] Configure environment variables on Vercel
- [ ] Set up Stripe and PayPal webhooks
- [ ] Perform final QA testing

## Completed Tasks
(None yet)
