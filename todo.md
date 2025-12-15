# B1 AppBuilder - Project TODO

## Phase 1: Landing Page & Design System
- [x] Configure Tailwind CSS with B1 green color scheme (#00A86B, #008556, #00C47D)
- [x] Create Header component (sticky, logo, nav, CTA button)
- [x] Create Hero section (H1, subtitle, URL input, trust badges, phone mockup)
- [x] Create Features section (4 feature cards with icons)
- [x] Create How It Works section (3 steps with numbered badges)
- [x] Create Pricing section (3 tiers with toggle for monthly/annual)
- [x] Create FAQ section (accordion with 8+ Q&A pairs)
- [x] Create Footer (4 columns, social icons, copyright)
- [x] Make landing page fully responsive (mobile-first)
- [x] Implement smooth scrolling and animations

## Phase 2: Authentication & Database
- [x] Set up Prisma schema with User, App, Subscription, Payment models
- [x] Configure database connection
- [x] Implement NextAuth.js integration (Manus OAuth)
- [x] Create Login page (email/password, social login)
- [x] Create Register page (name, email, password, terms checkbox)
- [ ] Create Forgot Password page
- [ ] Create Reset Password page
- [ ] Add password validation and error handling
- [ ] Test auth flow end-to-end

## Phase 3: Conversion Flow
- [x] Create multi-step wizard component with state management
- [x] Step 1: URL Entry (input validation, website metadata fetch)
- [x] Step 2: Platform Selection (iOS/Android/Both radio buttons)
- [x] Step 3: Customization (app name, icon upload, splash screen, color picker)
- [x] Step 4: Preview (iPhone & Android mockups)
- [x] Step 5: Plan Selection (pricing cards)
- [x] Step 6: Checkout (Stripe/PayPal integration)
- [x] Step 7: Processing (progress bar, status messages)
- [x] Step 8: Download (success message, download buttons, redirect to dashboard)

## Phase 4: Payment Integration
- [ ] Set up Stripe API keys and products
- [ ] Implement Stripe Checkout Session creation
- [ ] Create Stripe webhook handler (checkout.session.completed, subscription events)
- [ ] Set up PayPal integration
- [ ] Create PayPal button component
- [ ] Implement PayPal webhook handler
- [ ] Add payment method selection UI (optional during trial)
- [ ] Test payment flow with test cards
- [ ] Make payment optional - allow "Skip for now" during free trial

## Phase 5: User Dashboard
- [x] Create Dashboard layout with sidebar navigation
- [x] Overview tab (welcome, stats cards, recent activity)
- [x] My Apps tab (table with app list, status, actions)
- [x] Billing tab (current plan, payment method, billing history)
- [x] Settings tab (profile, password change, notifications, delete account)
- [x] Implement app download functionality
- [x] Add edit/delete app actions

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
- [x] Add loading states and error handling throughout
- [x] Implement toast notifications for user feedback
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

## QA Fixes Completed
- [x] Fix color scheme - all B1 green colors (#00A86B, #008556, #00C47D)
- [x] Fix Header component styling and colors
- [x] Fix Hero section with correct colors and layout
- [x] Fix Features section with green icons and backgrounds
- [x] Fix Pricing section with green buttons and badges
- [x] Add video section to landing page
- [x] Implement notification system (Toast, NotificationCenter, NotificationSettings)
- [x] Integrate NotificationCenter into Header


## Bug Fixes Completed
- [x] Fix Step 6 (Checkout) - implement payment form and Stripe integration
- [x] Fix Step 7 (Processing) - add timeout and auto-advance to Step 8
- [x] Fix Step 8 (Download) - implement success message and download buttons
- [x] Test conversion flow end-to-end


## Free Trial Feature (14 Days)
- [x] Update database schema - add trialEndsAt, isTrialActive fields to users table
- [x] Update user creation - automatically assign 14-day trial to new users
- [x] Update Dashboard - display trial status and days remaining
- [x] Update Pricing page - highlight Free Trial as first option
- [x] Add trial banner/notification to Dashboard
- [ ] Create trial expiration check logic
- [ ] Implement automatic billing after trial ends
- [ ] Send email notification before trial expires
- [ ] Test free trial flow end-to-end


## QA Fixes - Pixel Perfect Design
- [x] Fix Header - logo, navigation, CTA button, sticky behavior
- [x] Fix Hero Section - typography, colors, layout, animations
- [x] Fix Features Section - grid, cards, icons, hover states
- [x] Fix How It Works Section - steps, icons, spacing
- [x] Fix Pricing Section - cards, toggle, responsive
- [x] Fix FAQ Section - accordion styling
- [x] Fix Footer - layout, colors, responsive
- [x] Fix all responsive breakpoints (mobile, tablet, desktop)
- [x] Add animations (fade-in, float, bounce effects)
- [x] Test cross-browser compatibility


## IMMEDIATE Tasks (From Claude's QA Report)
- [x] Add Chat Widget (floating button + message interface)
- [x] Add SEO meta tags (title, description, OpenGraph, Twitter)
- [x] Add structured data (JSON-LD)
- [x] Implement error boundaries (improved with better UI)
- [x] Add error handling with toast notifications (useApiError hook)
- [x] Create LoadingButton component for consistent loading states
- [ ] Test on mobile devices (iPhone, iPad, Android)
- [ ] Fix responsive design issues
- [ ] Add loading states to all async operations
- [ ] Add ARIA labels for accessibility
- [ ] Test in multiple browsers (Chrome, Firefox, Safari, Edge)

## Bug Fix: Payment Flow (Optional Payment During Free Trial)
- [x] Make payment method optional during free trial
- [x] Add "Skip for now" button to Step 6 (Checkout)
- [x] Allow users to add payment method later in Dashboard
- [x] Update database schema to allow null payment method
- [x] Test free trial flow without payment

## Enhancement: File Uploads & Downloads
- [x] Add App Icon upload to Step 3
- [x] Add Splash Screen upload to Step 3
- [x] Add Screenshots upload to Step 3 (up to 5)
- [x] Add actual download functionality to Step 8
- [x] Add App Details section with permissions
- [x] Add Privacy & Legal info to Step 8

## P0 - Critical Items (This Week)
- [x] iOS Build Workflow - Enhanced GitHub Actions workflow with proper signing
- [x] Error Handling in Backend - Comprehensive error handling in builds router
- [x] Error Display Component - StepEightEnhanced with build status tracking
- [x] Security Hardening Guide - Documentation for security best practices
- [x] iOS Setup Guide - Complete guide for iOS certificate and provisioning setup
- [x] Test First Android Build - Generate keystore and test APK build
- [x] Test First iOS Build - Test IPA generation with certificates
- [x] Apply Claude's Build System Fixes - Install @octokit/rest, update buildWorker_v3.ts, add webhook router
- [x] Database Migration - Create builds table with proper schema
- [x] GitHub Secrets Configuration - Add MANUS_TOKEN, MANUS_OWNER, MANUS_REPO, BACK_API, BACK_URL
- [x] Keystore Generation - Create Android keystore and add to GitHub Secrets
- [ ] Create Android Build Template - Create build-templates/android/ with WebView project
- [ ] Implement Rate Limiting - Add rate limiting to API endpoints
- [ ] Add Error Logging - Implement comprehensive error logging

## P1 - High Priority (Next Week)
- [ ] E2E Tests - Create app → build → download → run
- [ ] Payment Flow Tests - Test free trial and upgrade flow
- [ ] Dashboard Tests - Test all dashboard functionality
- [ ] Add Logging Dashboard - Simple admin view for build queue
- [ ] Implement Build Retry Logic - Automatic retry on build failure
- [ ] Add Build Timeout - Prevent infinite builds

## P2 - Nice to Have (Future)
- [ ] App Store Integration - Auto-publish to App Store
- [ ] Play Store Integration - Auto-publish to Google Play
- [ ] Push Notifications - Add push notification support
- [ ] White-labeling - Support custom branding
- [ ] Analytics Dashboard - Track app metrics
- [ ] OTA Updates - Over-the-air app updates

## Urgent - TypeScript Errors (Before CI Push)
- [ ] Fix StepEightEnhanced.tsx line 376 - 'appName' possibly undefined
- [ ] Fix Convert.tsx line 35 - Remove 'jobId' property reference
- [ ] Fix Convert.tsx line 51 - Remove 'jobId' from StepEightEnhanced props

## Week 1-2: Observability Foundation (Production Roadmap)

### Backend Observability
- [x] Install Sentry + Pino dependencies
- [x] Create server/observability/sentry.ts (PII scrubbing)
- [x] Create server/observability/logger.ts (structured JSON logs)
- [x] Create server/middleware/requestId.ts (request ID tracking)
- [x] Create server/middleware/httpLogger.ts (HTTP request logging)

### Health Endpoints
- [x] Create server/routes/health.ts (/healthz + /readyz)
- [x] Implement DB readiness check with Drizzle

### Frontend Observability
- [x] Install @sentry/react + @sentry/vite-plugin
- [x] Create client/src/observability/sentry.ts
- [x] Update vite.config.ts with Sentry plugin
- [x] Enable sourcemaps in build

### Integration
- [x] Integrate observability into server/_core/index.ts
- [x] Configure middleware order (RequestID → Logging → Health)
- [x] Add health endpoints to Express routes
- [x] Test /healthz and /readyz endpoints
- [ ] Test Sentry error capture (backend + frontend) - Requires SENTRY_DSN
- [ ] Verify sourcemaps upload and stack traces - Requires SENTRY_AUTH_TOKEN

## Phase A: Sentry Account + Alerts Setup

### Documentation Created
- [x] SENTRY_SETUP_CHECKLIST.md - Complete UI walkthrough
- [x] SENTRY_GATES.md - Gate system with success criteria
- [x] scripts/test-sentry.mjs - Automated verification script

### Sentry Project Creation ✅
- [x] Create Sentry account at sentry.io
- [x] Create Frontend project (Platform: React)
- [x] Create Backend project (Platform: Node.js)
- [x] Copy DSN for both projects

### Environment Variables Configuration ✅
- [x] Add SENTRY_DSN to backend env
- [x] Add VITE_SENTRY_DSN to frontend env
- [ ] Add SENTRY_AUTH_TOKEN for CI/sourcemaps (optional)
- [x] Configure SENTRY_ENVIRONMENT (production)
- [x] Configure SENTRY_RELEASE (prod-ready-1.1)

### Alert Rules Setup ✅
- [x] New issue alert configured
- [x] Email notification channel configured

### Verification & Testing ✅
- [x] Create intentional backend error
- [x] Verify error appears in Sentry (<60s)
- [x] Verify stacktrace is not minified (sourcemaps working!)
- [x] Verify no PII in error event (email/JWT/cookies)
- [x] Create intentional frontend error
- [x] Verify frontend error in Sentry
- [x] Test alert notification delivery

### Gates - ALL PASSED ✅
- [x] Both projects created and DSN configured
- [x] Errors captured successfully (backend + frontend)
- [x] Stacktraces readable (sourcemaps working)
- [x] PII scrubbing verified
- [x] Alerts firing correctly

## Phase A: COMPLETED ✅

## Phase B: Staging Environment (Production Roadmap)

### Staging Domain Setup
- [x] Configure staging domain in Manus hosting (using Preview URL as staging)
- [x] Verify staging URL is accessible
- [x] Document staging workflow (STAGING_WORKFLOW.md)

### CI/CD Workflow (Manus Hosting Approach)
- [x] Document manual publish workflow via Manus UI
- [x] Create pre-publish-check.mjs script for verification
- [x] Document checkpoint-based deployment process

### Environment Separation
- [x] Document environment variable strategy (STAGING_WORKFLOW.md)
- [x] SENTRY_ENVIRONMENT configured for production
- [x] Document dev/staging/production differences

### Health Gates
- [x] /healthz endpoint implemented and working
- [x] /readyz endpoint implemented with DB check
- [x] pre-publish-check.mjs includes health verification
- [x] Timeout and retry logic in health check script

### Rollback Procedures
- [x] Document manual rollback steps (ROLLBACK_PROCEDURES.md)
- [x] Document Manus UI rollback method
- [x] Document rollback decision tree
- [x] Document post-rollback verification checklist

### Verification
- [x] Staging (Preview URL) accessible and working
- [x] Health endpoints verified (/healthz, /readyz)
- [x] Sentry capturing errors (Phase A verified)
- [x] Rollback procedures documented

## Phase B: COMPLETED ✅

## Phase B½: Fire Drill (Staging Execution)

### Purpose
Prove that rollback procedures work in practice, not just on paper.

### Fire Drill Steps
- [x] Step 1: Verify staging (Preview URL) is accessible
- [x] Step 2: Confirm health endpoints green (/healthz, /readyz)
- [x] Step 3: Create controlled break (intentional failure)
- [x] Step 4: Execute rollback per ROLLBACK_PROCEDURES.md
- [x] Step 5: Measure RTO (89 seconds total)
- [x] Step 6: Document findings (FIRE_DRILL_REPORT_2025-12-15.md)

### Success Criteria
- [x] Rollback completed (with manual intervention)
- [x] RTO measured: 89 seconds
- [x] Gap found: Rollback only works for checkpointed changes
- [x] Fire Drill report created

### Critical Finding
Manus rollback only restores checkpointed changes. Uncommitted changes require manual recovery.

### Action Items from Fire Drill
- [x] Update ROLLBACK_PROCEDURES.md with checkpoint limitation
- [x] Add manual recovery procedure to documentation (Method 3)
- [ ] Create checkpoint discipline policy

## Phase B½: COMPLETED ✅

## Phase C.0: Backup & Restore Strategy

### Purpose
Establish DB backup/restore as the safety net when rollback fails.

### Backup Implementation
- [x] Investigate DB connection and type (MySQL/TiDB)
- [x] Create backup script (scripts/db-backup.mjs)
- [x] Execute first backup and verify file created
- [x] Document backup location and naming convention

### Restore Implementation
- [x] Create restore script (scripts/db-restore.mjs)
- [x] Test restore to staging environment
- [x] Measure restore RTO (24.6 seconds)
- [x] Verify /readyz green after restore

### Documentation
- [x] Define RPO (≤24 hours)
- [x] Define RTO (≤60 minutes, measured ~60 seconds)
- [x] Create BACKUP_RESTORE_PROCEDURES.md
- [x] Document backup schedule recommendation

### Fire Drill
- [x] Execute DB restore fire drill
- [x] Measure end-to-end RTO (~60 seconds)
- [x] Document findings (BACKUP_RESTORE_REPORT_2025-12-15.md)

### Success Criteria
- [x] Backup script working
- [x] Restore script working
- [x] RTO measured and documented
- [x] /readyz green after restore

## Phase C.0: COMPLETED ✅

## Checkpoint Discipline Policy

### Purpose
Define mandatory checkpoint requirements to ensure rollback capability.

### Document Requirements
- [x] Define when checkpoint is mandatory
- [x] Define who is responsible (Role)
- [x] Define gate: no Publish without checkpoint
- [x] Define exceptions and approval process
- [x] Keep document to one page

### Success Criteria
- [x] Policy document created
- [x] Referenced in ROLLBACK_PROCEDURES.md
- [x] Referenced in STAGING_WORKFLOW.md

## Checkpoint Discipline Policy: COMPLETED ✅
