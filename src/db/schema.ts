// Nuvra — Drizzle ORM schema (SQLite)
// Money is always integer cents. Enum-like fields are TS-validated strings.
// See src/lib/constants.ts for the canonical value lists.

import { randomUUID } from 'node:crypto';
import { integer, sqliteTable, text, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
const id = () => text('id').$defaultFn(() => randomUUID()).primaryKey();
const createdAt = () =>
  integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date());
const updatedAt = () =>
  integer('updated_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()).$onUpdateFn(() => new Date());
const bool = (name: string, dflt = false) => integer(name, { mode: 'boolean' }).notNull().$defaultFn(() => dflt);
const int = (name: string, dflt = 0) => integer(name, { mode: 'number' }).notNull().$defaultFn(() => dflt);
const js = (name: string, dflt: unknown = '{}') =>
  text(name).notNull().$defaultFn(() => JSON.stringify(dflt));

// ───────────── AUTH & TENANCY ─────────────

export const users = sqliteTable('users', {
  id: id(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('USER'), // USER | ADMIN
  status: text('status').notNull().default('ACTIVE'), // ACTIVE | SUSPENDED
  emailVerifiedAt: integer('email_verified_at', { mode: 'timestamp_ms' }),
  stripeCustomerId: text('stripe_customer_id').unique(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const profiles = sqliteTable('profiles', {
  id: id(),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  username: text('username').notNull().unique(), // Nuvra Link /@username
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  website: text('website'),
  goal: text('goal'),
  onboardingStep: int('onboarding_step', 0),
  publicProfile: bool('public_profile', true),
});

export const workspaces = sqliteTable('workspaces', {
  id: id(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  ownerId: text('owner_id').notNull(),
  plan: text('plan').notNull().default('FREE'), // FREE | PRO | BUSINESS | AGENCY
  isPlatform: bool('is_platform', false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const memberships = sqliteTable(
  'memberships',
  {
    id: id(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('OWNER'), // OWNER | ADMIN | MEMBER
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('memberships_user_ws_uq').on(t.userId, t.workspaceId)],
);

export const sessions = sqliteTable(
  'sessions',
  {
    id: id(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: createdAt(),
    ip: text('ip'),
    userAgent: text('user_agent'),
  },
  (t) => [index('sessions_user_idx').on(t.userId)],
);

export const passwordResetTokens = sqliteTable('password_reset_tokens', {
  id: id(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  usedAt: integer('used_at', { mode: 'timestamp_ms' }),
  createdAt: createdAt(),
});

export const emailVerificationTokens = sqliteTable('email_verification_tokens', {
  id: id(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  usedAt: integer('used_at', { mode: 'timestamp_ms' }),
  createdAt: createdAt(),
});

// ───────────── BILLING ─────────────

export const subscriptionPlans = sqliteTable('subscription_plans', {
  id: id(),
  code: text('code').notNull().unique(), // FREE | PRO | BUSINESS | AGENCY
  name: text('name').notNull(),
  description: text('description'),
  priceCents: int('price_cents', 0),
  currency: text('currency').notNull().default('usd'),
  interval: text('interval').notNull().default('month'),
  features: js('features', {}),
  active: bool('active', true),
  sortOrder: int('sort_order', 0),
});

export const subscriptions = sqliteTable('subscriptions', {
  id: id(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  planId: text('plan_id').notNull().references(() => subscriptionPlans.id),
  status: text('status').notNull().default('active'), // active | trialing | past_due | canceled | incomplete
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripePriceId: text('stripe_price_id'),
  currentPeriodEnd: integer('current_period_end', { mode: 'timestamp_ms' }),
  cancelAtPeriodEnd: bool('cancel_at_period_end', false),
  canceledAt: integer('canceled_at', { mode: 'timestamp_ms' }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const coupons = sqliteTable('coupons', {
  id: id(),
  code: text('code').notNull().unique(),
  percentOff: int('percent_off'),
  amountOffCents: int('amount_off_cents'),
  maxRedemptions: int('max_redemptions'),
  redeemedCount: int('redeemed_count', 0),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }),
  active: bool('active', true),
  createdAt: createdAt(),
});

// ───────────── PRODUCTS & COURSES ─────────────

export const products = sqliteTable(
  'products',
  {
    id: id(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    type: text('type').notNull().default('DIGITAL'), // DIGITAL | SERVICE | AUDIO | TEMPLATE
    priceCents: int('price_cents', 0),
    currency: text('currency').notNull().default('usd'),
    status: text('status').notNull().default('DRAFT'), // DRAFT | PUBLISHED | ARCHIVED
    coverUrl: text('cover_url'),
    downloadUrl: text('download_url'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('products_ws_status_idx').on(t.workspaceId, t.status)],
);

export const courses = sqliteTable(
  'courses',
  {
    id: id(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    priceCents: int('price_cents', 0),
    currency: text('currency').notNull().default('usd'),
    status: text('status').notNull().default('DRAFT'), // DRAFT | REVIEW | PUBLISHED | ARCHIVED
    coverUrl: text('cover_url'),
    level: text('level').notNull().default('beginner'),
    category: text('category'),
    isAcademy: bool('is_academy', false),
    syllabus: text('syllabus'),
    publishedAt: integer('published_at', { mode: 'timestamp_ms' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('courses_ws_status_idx').on(t.workspaceId, t.status),
    index('courses_status_pub_idx').on(t.status, t.publishedAt),
  ],
);

export const courseModules = sqliteTable(
  'course_modules',
  {
    id: id(),
    courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    position: int('position', 0),
    createdAt: createdAt(),
  },
  (t) => [index('course_modules_course_idx').on(t.courseId, t.position)],
);

export const lessons = sqliteTable(
  'lessons',
  {
    id: id(),
    courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    moduleId: text('module_id').references(() => courseModules.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    type: text('type').notNull().default('text'), // text | video | file | quiz
    content: text('content'),
    resourceUrl: text('resource_url'),
    durationMin: int('duration_min'),
    position: int('position', 0),
    isPreview: bool('is_preview', false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('lessons_course_idx').on(t.courseId, t.position)],
);

export const quizzes = sqliteTable('quizzes', {
  id: id(),
  lessonId: text('lesson_id').notNull().unique().references(() => lessons.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default('Quiz'),
  passingScore: int('passing_score', 70),
  questions: js('questions', []), // [{question, options[], answerIndex}]
  createdAt: createdAt(),
});

export const enrollments = sqliteTable(
  'enrollments',
  {
    id: id(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    orderId: text('order_id').references(() => orders.id, { onDelete: 'set null' }),
    source: text('source').notNull().default('PURCHASE'), // PURCHASE | FREE | SEED | ACADEMY | ADMIN
    progressPct: int('progress_pct', 0),
    completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex('enrollments_user_course_uq').on(t.userId, t.courseId),
    index('enrollments_course_idx').on(t.courseId),
  ],
);

export const lessonProgress = sqliteTable(
  'lesson_progress',
  {
    id: id(),
    enrollmentId: text('enrollment_id').notNull().references(() => enrollments.id, { onDelete: 'cascade' }),
    lessonId: text('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
    completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
    secondsSpent: int('seconds_spent', 0),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex('lesson_progress_enr_lesson_uq').on(t.enrollmentId, t.lessonId)],
);

export const quizAttempts = sqliteTable('quiz_attempts', {
  id: id(),
  enrollmentId: text('enrollment_id').notNull().references(() => enrollments.id, { onDelete: 'cascade' }),
  quizId: text('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  scorePct: int('score_pct', 0),
  answers: js('answers', {}),
  createdAt: createdAt(),
});

export const certificates = sqliteTable('certificates', {
  id: id(),
  enrollmentId: text('enrollment_id').notNull().unique().references(() => enrollments.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  code: text('code').notNull().unique(),
  issuedAt: createdAt(),
});

// ───────────── PAGES & FUNNELS ─────────────

export const funnels = sqliteTable(
  'funnels',
  {
    id: id(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    status: text('status').notNull().default('DRAFT'), // DRAFT | PUBLISHED
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('funnels_ws_idx').on(t.workspaceId)],
);

export const pages = sqliteTable(
  'pages',
  {
    id: id(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    funnelId: text('funnel_id').references(() => funnels.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    type: text('type').notNull().default('LANDING'), // LANDING | LINKINBIO | THANKYOU | CUSTOM
    status: text('status').notNull().default('DRAFT'), // DRAFT | PUBLISHED
    content: js('content', { blocks: [] }),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    views: int('views', 0),
    position: int('position', 0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex('pages_ws_slug_uq').on(t.workspaceId, t.slug),
    index('pages_ws_status_idx').on(t.workspaceId, t.status),
  ],
);

export const funnelSteps = sqliteTable(
  'funnel_steps',
  {
    id: id(),
    funnelId: text('funnel_id').notNull().references(() => funnels.id, { onDelete: 'cascade' }),
    pageId: text('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
    stepType: text('step_type').notNull(), // LANDING | LEAD | SALES | CHECKOUT | UPSELL | DOWNSELL | THANKYOU | DELIVERY
    position: int('position', 0),
  },
  (t) => [
    uniqueIndex('funnel_steps_fn_page_uq').on(t.funnelId, t.pageId),
    index('funnel_steps_fn_idx').on(t.funnelId, t.position),
  ],
);

export const pageViews = sqliteTable(
  'page_views',
  {
    id: id(),
    pageId: text('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
    visitorId: text('visitor_id'),
    referrer: text('referrer'),
    path: text('path'),
    createdAt: createdAt(),
  },
  (t) => [index('page_views_page_idx').on(t.pageId, t.createdAt)],
);

// ───────────── CRM ─────────────

export const contacts = sqliteTable(
  'contacts',
  {
    id: id(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    name: text('name'),
    phone: text('phone'),
    tags: js('tags', []),
    status: text('status').notNull().default('LEAD'), // LEAD | CUSTOMER | STUDENT | UNSUBSCRIBED
    source: text('source'),
    userId: text('user_id'),
    notes: text('notes'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex('contacts_ws_email_uq').on(t.workspaceId, t.email),
    index('contacts_ws_status_idx').on(t.workspaceId, t.status),
  ],
);

export const contactActivities = sqliteTable(
  'contact_activities',
  {
    id: id(),
    contactId: text('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    summary: text('summary'),
    meta: js('meta', {}),
    createdAt: createdAt(),
  },
  (t) => [index('contact_activities_contact_idx').on(t.contactId, t.createdAt)],
);

// ───────────── ORDERS, PAYMENTS, LEDGER ─────────────

export const orders = sqliteTable(
  'orders',
  {
    id: id(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
    buyerUserId: text('buyer_user_id').references(() => users.id, { onDelete: 'set null' }),
    contactId: text('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
    resellerId: text('reseller_id'), // reseller_profiles.id when Academy sale attributed
    couponId: text('coupon_id').references(() => coupons.id, { onDelete: 'set null' }),
    number: text('number').notNull().unique(), // NV-2026-000123
    kind: text('kind').notNull().default('CREATOR_SALE'), // CREATOR_SALE | ACADEMY_SALE
    status: text('status').notNull().default('PENDING'), // PENDING | PAID | REFUNDED | PARTIALLY_REFUNDED | FAILED | CANCELED
    mode: text('mode').notNull().default('TEST'), // LIVE | TEST
    currency: text('currency').notNull().default('usd'),
    subtotalCents: int('subtotal_cents', 0),
    discountCents: int('discount_cents', 0),
    platformFeeCents: int('platform_fee_cents', 0),
    totalCents: int('total_cents', 0),
    buyerEmail: text('buyer_email').notNull(),
    buyerName: text('buyer_name'),
    affiliateCode: text('affiliate_code'), // creator affiliate attribution
    paymentRef: text('payment_ref'),
    paidAt: integer('paid_at', { mode: 'timestamp_ms' }),
    refundedAt: integer('refunded_at', { mode: 'timestamp_ms' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('orders_ws_status_idx').on(t.workspaceId, t.status, t.createdAt),
    index('orders_reseller_idx').on(t.resellerId),
  ],
);

export const orderItems = sqliteTable(
  'order_items',
  {
    id: id(),
    orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
    kind: text('kind').notNull().default('PRODUCT'), // PRODUCT | COURSE | ACADEMY
    productId: text('product_id').references(() => products.id, { onDelete: 'set null' }),
    courseId: text('course_id').references(() => courses.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    priceCents: int('price_cents', 0),
    quantity: int('quantity', 1),
  },
  (t) => [index('order_items_order_idx').on(t.orderId)],
);

export const payments = sqliteTable(
  'payments',
  {
    id: id(),
    orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull().default('stripe'), // stripe | test
    reference: text('reference'),
    amountCents: int('amount_cents', 0),
    status: text('status').notNull().default('SUCCEEDED'), // SUCCEEDED | FAILED | REQUIRES_ACTION
    raw: text('raw'),
    createdAt: createdAt(),
  },
  (t) => [index('payments_order_idx').on(t.orderId)],
);

export const refunds = sqliteTable(
  'refunds',
  {
    id: id(),
    orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
    amountCents: int('amount_cents', 0),
    reason: text('reason'),
    provider: text('provider').notNull().default('test'),
    reference: text('reference'),
    status: text('status').notNull().default('SUCCEEDED'),
    createdAt: createdAt(),
  },
  (t) => [index('refunds_order_idx').on(t.orderId)],
);

/// Append-only ledger — balances are always reconstructable by summing.
export const ledgerEntries = sqliteTable(
  'ledger_entries',
  {
    id: id(),
    group: text('group').notNull(), // atomic operation id
    type: text('type').notNull(), // SALE | REFUND | COMMISSION | PLATFORM_FEE | PAYOUT | SUBSCRIPTION | FEE | REVERSAL | ADJUSTMENT
    account: text('account').notNull(), // RESELLER_PAYABLE | CREATOR_PAYABLE | PLATFORM_REVENUE | AFFILIATE_PAYABLE | PAYOUT_CLEARING
    direction: text('direction').notNull(), // CREDIT | DEBIT
    amountCents: int('amount_cents', 0), // always > 0
    currency: text('currency').notNull().default('usd'),
    userId: text('user_id'),
    workspaceId: text('workspace_id'),
    orderId: text('order_id').references(() => orders.id, { onDelete: 'set null' }),
    payoutId: text('payout_id'),
    refType: text('ref_type'),
    refId: text('ref_id'),
    description: text('description').notNull(),
    mode: text('mode').notNull().default('TEST'), // LIVE | TEST
    meta: js('meta', {}),
    createdAt: createdAt(),
  },
  (t) => [
    index('ledger_user_account_idx').on(t.userId, t.account, t.createdAt),
    index('ledger_order_idx').on(t.orderId),
    index('ledger_group_idx').on(t.group),
    index('ledger_ws_idx').on(t.workspaceId, t.createdAt),
  ],
);

export const payouts = sqliteTable(
  'payouts',
  {
    id: id(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    amountCents: int('amount_cents', 0),
    currency: text('currency').notNull().default('usd'),
    status: text('status').notNull().default('PENDING'), // PENDING | PROCESSING | PAID | FAILED | REVERSED
    method: text('method'),
    reference: text('reference'),
    note: text('note'),
    periodStart: integer('period_start', { mode: 'timestamp_ms' }),
    periodEnd: integer('period_end', { mode: 'timestamp_ms' }),
    processedAt: integer('processed_at', { mode: 'timestamp_ms' }),
    createdAt: createdAt(),
  },
  (t) => [index('payouts_user_status_idx').on(t.userId, t.status)],
);

// ───────────── RESELLER & AFFILIATES ─────────────

export const resellerProfiles = sqliteTable('reseller_profiles', {
  id: id(),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('NONE'), // NONE | PENDING | ACTIVE | SUSPENDED
  code: text('code').notNull().unique(),
  activatedAt: integer('activated_at', { mode: 'timestamp_ms' }),
  academyOrderId: text('academy_order_id'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [index('reseller_status_idx').on(t.status)]);

export const affiliatePrograms = sqliteTable('affiliate_programs', {
  id: id(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  commissionBps: int('commission_bps', 3000),
  cookieDays: int('cookie_days', 30),
  active: bool('active', true),
  createdAt: createdAt(),
});

export const affiliates = sqliteTable(
  'affiliates',
  {
    id: id(),
    programId: text('program_id').notNull().references(() => affiliatePrograms.id, { onDelete: 'cascade' }),
    code: text('code').notNull().unique(),
    email: text('email'),
    userId: text('user_id'),
    name: text('name'),
    createdAt: createdAt(),
  },
  (t) => [index('affiliates_program_idx').on(t.programId)],
);

export const affiliateClicks = sqliteTable(
  'affiliate_clicks',
  {
    id: id(),
    affiliateId: text('affiliate_id').notNull().references(() => affiliates.id, { onDelete: 'cascade' }),
    visitorId: text('visitor_id'),
    referrer: text('referrer'),
    path: text('path'),
    createdAt: createdAt(),
  },
  (t) => [index('affiliate_clicks_idx').on(t.affiliateId, t.createdAt)],
);

export const affiliateSales = sqliteTable(
  'affiliate_sales',
  {
    id: id(),
    affiliateId: text('affiliate_id').notNull().references(() => affiliates.id, { onDelete: 'cascade' }),
    orderId: text('order_id').notNull().unique(),
    commissionBps: int('commission_bps', 0),
    commissionCents: int('commission_cents', 0),
    status: text('status').notNull().default('PENDING'), // PENDING | APPROVED | PAID | REVERSED
    createdAt: createdAt(),
  },
  (t) => [index('affiliate_sales_idx').on(t.affiliateId, t.status)],
);

// ───────────── MARKETPLACE ─────────────

export const marketplaceListings = sqliteTable(
  'marketplace_listings',
  {
    id: id(),
    courseId: text('course_id').unique().references(() => courses.id, { onDelete: 'cascade' }),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    targetType: text('target_type').notNull().default('COURSE'),
    targetId: text('target_id'),
    title: text('title').notNull(),
    description: text('description'),
    coverUrl: text('cover_url'),
    priceCents: int('price_cents', 0),
    category: text('category'),
    level: text('level'),
    creatorName: text('creator_name'),
    status: text('status').notNull().default('PENDING'), // PENDING | APPROVED | REJECTED
    featured: bool('featured', false),
    sponsoredUntil: integer('sponsored_until', { mode: 'timestamp_ms' }),
    views: int('views', 0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('listings_status_idx').on(t.status, t.createdAt), index('listings_cat_idx').on(t.category)],
);

export const reviews = sqliteTable(
  'reviews',
  {
    id: id(),
    listingId: text('listing_id').notNull().references(() => marketplaceListings.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(),
    rating: int('rating', 5),
    comment: text('comment'),
    status: text('status').notNull().default('PUBLISHED'),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('reviews_listing_user_uq').on(t.listingId, t.userId)],
);

// ───────────── EMAIL & AUTOMATIONS ─────────────

export const emailCampaigns = sqliteTable('email_campaigns', {
  id: id(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  segment: text('segment').notNull().default('ALL'), // ALL | LEADS | CUSTOMERS | STUDENTS | tag:x
  status: text('status').notNull().default('DRAFT'), // DRAFT | SCHEDULED | SENDING | SENT
  scheduledAt: integer('scheduled_at', { mode: 'timestamp_ms' }),
  sentAt: integer('sent_at', { mode: 'timestamp_ms' }),
  sentCount: int('sent_count', 0),
  openCount: int('open_count', 0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const emailSequences = sqliteTable('email_sequences', {
  id: id(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  triggerEvent: text('trigger_event').notNull(),
  active: bool('active', false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const emailSequenceSteps = sqliteTable('email_sequence_steps', {
  id: id(),
  sequenceId: text('sequence_id').notNull().references(() => emailSequences.id, { onDelete: 'cascade' }),
  delayHours: int('delay_hours', 0),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  position: int('position', 0),
});

export const emailLogs = sqliteTable(
  'email_logs',
  {
    id: id(),
    workspaceId: text('workspace_id'),
    toEmail: text('to_email').notNull(),
    subject: text('subject').notNull(),
    body: text('body').notNull(),
    channel: text('channel').notNull().default('OUTBOX'), // OUTBOX | RESEND | SMTP
    status: text('status').notNull().default('QUEUED'), // QUEUED | SCHEDULED | SENT | FAILED
    error: text('error'),
    relatedTo: text('related_to'),
    scheduledAt: integer('scheduled_at', { mode: 'timestamp_ms' }),
    createdAt: createdAt(),
  },
  (t) => [index('email_logs_status_idx').on(t.status, t.createdAt)],
);

export const automations = sqliteTable(
  'automations',
  {
    id: id(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    triggerEvent: text('trigger_event').notNull(),
    triggerConfig: js('trigger_config', {}),
    active: bool('active', false),
    runCount: int('run_count', 0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('automations_ws_active_idx').on(t.workspaceId, t.active)],
);

export const automationActions = sqliteTable(
  'automation_actions',
  {
    id: id(),
    automationId: text('automation_id').notNull().references(() => automations.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // send_email | add_tag | remove_tag | enroll_course | send_notification | wait | webhook | create_task
    config: js('config', {}),
    position: int('position', 0),
  },
  (t) => [index('automation_actions_fn_idx').on(t.automationId, t.position)],
);

export const automationRuns = sqliteTable(
  'automation_runs',
  {
    id: id(),
    automationId: text('automation_id').notNull().references(() => automations.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('COMPLETED'), // COMPLETED | FAILED | SKIPPED
    context: js('context', {}),
    error: text('error'),
    createdAt: createdAt(),
  },
  (t) => [index('automation_runs_fn_idx').on(t.automationId, t.createdAt)],
);

// ───────────── NOTIFICATIONS, EVENTS, AUDIT ─────────────

export const notifications = sqliteTable(
  'notifications',
  {
    id: id(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    workspaceId: text('workspace_id'),
    type: text('type').notNull().default('system'),
    title: text('title').notNull(),
    body: text('body'),
    link: text('link'),
    readAt: integer('read_at', { mode: 'timestamp_ms' }),
    createdAt: createdAt(),
  },
  (t) => [index('notifications_user_idx').on(t.userId, t.readAt, t.createdAt)],
);

export const domainEvents = sqliteTable(
  'domain_events',
  {
    id: id(),
    name: text('name').notNull(),
    workspaceId: text('workspace_id'),
    userId: text('user_id'),
    payload: js('payload', {}),
    createdAt: createdAt(),
    processedAt: integer('processed_at', { mode: 'timestamp_ms' }),
  },
  (t) => [index('domain_events_name_idx').on(t.name, t.createdAt), index('domain_events_ws_idx').on(t.workspaceId, t.createdAt)],
);

export const stripeEvents = sqliteTable('stripe_events', {
  id: text('id').primaryKey(), // stripe event id
  type: text('type').notNull(),
  payload: text('payload').notNull(),
  processedAt: integer('processed_at', { mode: 'timestamp_ms' }),
  error: text('error'),
  createdAt: createdAt(),
});

export const auditLogs = sqliteTable(
  'audit_logs',
  {
    id: id(),
    actorUserId: text('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    target: text('target'),
    meta: js('meta', {}),
    ip: text('ip'),
    createdAt: createdAt(),
  },
  (t) => [index('audit_logs_created_idx').on(t.createdAt)],
);

// ───────────── AI, TEMPLATES, DOMAINS, SETTINGS ─────────────

export const aiUsage = sqliteTable(
  'ai_usage',
  {
    id: id(),
    workspaceId: text('workspace_id').notNull(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    feature: text('feature').notNull(),
    model: text('model'),
    creditsUsed: int('credits_used', 1),
    tokensIn: int('tokens_in', 0),
    tokensOut: int('tokens_out', 0),
    createdAt: createdAt(),
  },
  (t) => [index('ai_usage_ws_idx').on(t.workspaceId, t.createdAt), index('ai_usage_user_idx').on(t.userId, t.createdAt)],
);

export const templates = sqliteTable('templates', {
  id: id(),
  kind: text('kind').notNull(), // PAGE | FUNNEL | EMAIL | COURSE | AUTOMATION | LINKINBIO
  name: text('name').notNull(),
  category: text('category'),
  description: text('description'),
  content: text('content').notNull(),
  premium: bool('premium', false),
  active: bool('active', true),
  createdAt: createdAt(),
});

export const customDomains = sqliteTable('custom_domains', {
  id: id(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  domain: text('domain').notNull().unique(),
  status: text('status').notNull().default('PENDING'), // PENDING | VERIFIED | ACTIVE | FAILED
  verificationToken: text('verification_token'),
  verifiedAt: integer('verified_at', { mode: 'timestamp_ms' }),
  createdAt: createdAt(),
});

/// Admin-editable configuration (prices, commissions, flags, limits).
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().$onUpdateFn(() => new Date()),
});

// ── Row type aliases (inferred from the tables above) ──
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Workspace = typeof workspaces.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Payout = typeof payouts.$inferSelect;
export type LedgerEntry = typeof ledgerEntries.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
