// Enum-like constants — the single source of truth for string "enums"
// used across the SQLite schema.

export const USER_ROLES = ['USER', 'ADMIN'] as const;
export const PLANS = ['FREE', 'PRO', 'BUSINESS', 'AGENCY'] as const;
export type Plan = (typeof PLANS)[number];

export const ORDER_KINDS = ['CREATOR_SALE', 'ACADEMY_SALE'] as const;
export const ORDER_STATUSES = [
  'PENDING',
  'PAID',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
  'FAILED',
  'CANCELED',
] as const;
export const ORDER_MODES = ['LIVE', 'TEST'] as const;

export const LEDGER_TYPES = [
  'SALE',
  'REFUND',
  'COMMISSION',
  'PLATFORM_FEE',
  'PAYOUT',
  'SUBSCRIPTION',
  'FEE',
  'REVERSAL',
  'ADJUSTMENT',
] as const;
export type LedgerType = (typeof LEDGER_TYPES)[number];

export const LEDGER_ACCOUNTS = [
  'RESELLER_PAYABLE',
  'CREATOR_PAYABLE',
  'PLATFORM_REVENUE',
  'AFFILIATE_PAYABLE',
  'PAYOUT_CLEARING',
] as const;
export type LedgerAccount = (typeof LEDGER_ACCOUNTS)[number];

export const PAYOUT_STATUSES = [
  'PENDING',
  'PROCESSING',
  'PAID',
  'FAILED',
  'REVERSED',
] as const;

export const RESELLER_STATUSES = ['NONE', 'PENDING', 'ACTIVE', 'SUSPENDED'] as const;

export const PAGE_TYPES = ['LANDING', 'LINKINBIO', 'THANKYOU', 'CUSTOM'] as const;
export const FUNNEL_STEP_TYPES = [
  'LANDING',
  'LEAD',
  'SALES',
  'CHECKOUT',
  'UPSELL',
  'DOWNSELL',
  'THANKYOU',
  'DELIVERY',
] as const;

export const COURSE_STATUSES = ['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'] as const;
export const PRODUCT_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

export const LISTING_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;

export const AUTOMATION_TRIGGERS = [
  'user.created',
  'lead.created',
  'purchase.completed',
  'checkout.abandoned',
  'course.started',
  'lesson.completed',
  'course.completed',
  'reseller.sale',
  'affiliate.sale',
  'subscription.created',
  'subscription.cancelled',
  'subscription.payment_failed',
] as const;
export type AutomationTrigger = (typeof AUTOMATION_TRIGGERS)[number];

export const AUTOMATION_ACTIONS = [
  'send_email',
  'add_tag',
  'remove_tag',
  'enroll_course',
  'send_notification',
  'wait',
  'webhook',
  'create_task',
] as const;
export type AutomationActionType = (typeof AUTOMATION_ACTIONS)[number];

export const BLOCK_TYPES = [
  'hero',
  'text',
  'image',
  'video',
  'cta',
  'form',
  'pricing',
  'testimonials',
  'faq',
  'features',
  'countdown',
  'product',
  'course',
  'checkout',
  'social_proof',
  'logos',
  'divider',
  'spacer',
  'link',
] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

export const PAGE_BLOCK_TEMPLATES: Record<BlockType, Record<string, unknown>> = {
  hero: { heading: 'Your headline', subheading: 'Say something that matters.', ctaLabel: 'Start for free', ctaHref: '#', align: 'center' },
  text: { heading: '', body: 'Write your story here…', align: 'left' },
  image: { src: '', alt: '', rounded: true },
  video: { url: '', title: 'Video' },
  cta: { label: 'Get started', href: '#', variant: 'primary' },
  form: { title: 'Join the list', buttonLabel: 'Subscribe', fields: 'email' },
  pricing: { plans: [{ name: 'Free', price: '$0', features: 'Core features', cta: 'Start' }, { name: 'Pro', price: '$29/mo', features: 'Everything + 0% fee', cta: 'Go Pro' }] },
  testimonials: { items: [{ quote: 'Nuvra helped me launch in a weekend.', author: '— Alex, creator' }] },
  faq: { items: [{ q: 'Is Nuvra free?', a: 'Yes. The platform is free to use.' }] },
  features: { title: 'Everything you need', items: [{ title: 'Funnels', body: 'Build in minutes' }, { title: 'CRM', body: 'Know your customers' }, { title: 'Analytics', body: 'Track what matters' }] },
  countdown: { untilDays: 7, label: 'Offer ends in' },
  product: { productId: '', ctaLabel: 'Buy now' },
  course: { courseId: '', ctaLabel: 'View course' },
  checkout: { productId: '', courseId: '' },
  social_proof: { label: 'Trusted by creators', items: ['10k+ signups', '120 countries'] },
  logos: { items: ['Stripe', 'Vercel', 'Postgres'] },
  divider: {},
  spacer: { size: 48 },
  link: { label: 'My website', href: 'https://', icon: 'link' },
};

export const AI_FEATURES = ['funnel_builder', 'course_planner', 'copywriter', 'analytics_assistant'] as const;
export type AIFeature = (typeof AI_FEATURES)[number];

export const CERTIFICATE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
