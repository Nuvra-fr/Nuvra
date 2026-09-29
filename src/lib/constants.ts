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

export const RESELLER_STATUSES = [
  'NONE',
  'PENDING',
  'ACTIVE',
  'SUSPENDED',
] as const;

export const PAGE_TYPES = [
  'LANDING',
  'LINKINBIO',
  'THANKYOU',
  'CUSTOM',
] as const;
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

export const COURSE_STATUSES = [
  'DRAFT',
  'REVIEW',
  'PUBLISHED',
  'ARCHIVED',
] as const;
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

/** Libellés français des blocs, affichés dans l’éditeur de page. */
export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: 'Bannière',
  text: 'Texte',
  image: 'Image',
  video: 'Vidéo',
  cta: 'Bouton',
  form: 'Formulaire',
  pricing: 'Tarifs',
  testimonials: 'Témoignages',
  faq: 'FAQ',
  features: 'Fonctionnalités',
  countdown: 'Compte à rebours',
  product: 'Produit',
  course: 'Formation',
  checkout: 'Paiement',
  social_proof: 'Preuve sociale',
  logos: 'Logos',
  divider: 'Séparateur',
  spacer: 'Espacement',
  link: 'Lien',
};

export const PAGE_BLOCK_TEMPLATES: Record<
  BlockType,
  Record<string, unknown>
> = {
  hero: {
    heading: 'Votre titre',
    subheading: 'Dites quelque chose qui compte.',
    ctaLabel: 'Commencer gratuitement',
    ctaHref: '#',
    align: 'center',
  },
  text: { heading: '', body: 'Racontez votre histoire ici…', align: 'left' },
  image: { src: '', alt: '', rounded: true },
  video: { url: '', title: 'Vidéo' },
  cta: { label: 'Commencer', href: '#', variant: 'primary' },
  form: {
    title: 'Rejoignez la liste',
    buttonLabel: "S'inscrire",
    fields: 'email',
  },
  pricing: {
    plans: [
      {
        name: 'Gratuit',
        price: '0 $',
        features: 'Fonctions essentielles',
        cta: 'Commencer',
      },
      {
        name: 'Pro',
        price: '29 $/mois',
        features: 'Tout + 0 % de commission',
        cta: 'Passer Pro',
      },
    ],
  },
  testimonials: {
    items: [
      {
        quote: "J'ai lancé mon activité en un week-end avec Nuvra.",
        author: '— Alex, créateur',
      },
    ],
  },
  faq: {
    items: [
      { q: 'Nuvra est-il gratuit ?', a: 'Oui. La plateforme est gratuite.' },
    ],
  },
  features: {
    title: 'Tout ce qu’il vous faut',
    items: [
      { title: 'Tunnels', body: 'Montez-les en quelques minutes' },
      { title: 'CRM', body: 'Connaissez vos clients' },
      { title: 'Statistiques', body: 'Suivez ce qui compte' },
    ],
  },
  countdown: { untilDays: 7, label: "L'offre se termine dans" },
  product: { productId: '', ctaLabel: 'Acheter' },
  course: { courseId: '', ctaLabel: 'Voir la formation' },
  checkout: { productId: '', courseId: '' },
  social_proof: {
    label: 'Ils nous font confiance',
    items: ['10 000+ inscriptions', '120 pays'],
  },
  logos: { items: ['Stripe', 'Vercel', 'Postgres'] },
  divider: {},
  spacer: { size: 48 },
  link: { label: 'Mon site', href: 'https://', icon: 'link' },
};

export const AI_FEATURES = [
  'funnel_builder',
  'course_planner',
  'copywriter',
  'analytics_assistant',
] as const;
export type AIFeature = (typeof AI_FEATURES)[number];

export const CERTIFICATE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
