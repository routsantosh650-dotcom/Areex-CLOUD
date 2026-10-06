export type PlanCategoryKey = 'budget' | 'premium' | 'exclusive' | 'bot' | 'vps' | 'domain';

export interface HostingPlanItem {
  id: string;
  name: string;
  tagline: string;
  category: PlanCategoryKey;
  priceInr: number;
  originalPriceInr?: number;
  billingPeriod: '/mo' | '/yr';
  ram: string;
  cpu: string;
  storage: string;
  speed: string;
  popular: boolean;
  features: string[];
  sortOrder: number;
}

export interface CouponItem {
  code: string;
  discountPercent: number;
  description: string;
  createdAt?: string;
}

export interface SupportTicketItem {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  discordHandle: string;
  category: string;
  priority: 'normal' | 'high' | 'urgent';
  serverIpOrId: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  adminReply?: string;
  repliedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_COUPONS: CouponItem[] = [
  {
    code: 'AREEX10',
    discountPercent: 10,
    description: '10% Instant Welcome Discount',
  },
  {
    code: 'INDIA20',
    discountPercent: 20,
    description: '20% Founder Launch Discount',
  },
  {
    code: 'CHAMPION30',
    discountPercent: 30,
    description: '30% Premium & Exclusive Network Offer',
  },
];

export interface CategoryMeta {
  key: PlanCategoryKey;
  indexLabel: string;
  name: string;
  headline: string;
  audience: string;
  description: string;
  imageUrl: string;
  imageCaption: string;
}

export interface PlayerReview {
  id: string;
  initials: string;
  name: string;
  role: string;
  serverType: string;
  city: string;
  rating: number;
  quote: string;
}

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyMeta {
  code: CurrencyCode;
  symbol: string;
  label: string;
  rateFromInr: number;
}

export const CURRENCIES: CurrencyMeta[] = [
  { code: 'INR', symbol: '₹', label: '₹ INR', rateFromInr: 1 },
  { code: 'USD', symbol: '$', label: '$ USD', rateFromInr: 0.012 },
  { code: 'EUR', symbol: '€', label: '€ EUR', rateFromInr: 0.011 },
  { code: 'GBP', symbol: '£', label: '£ GBP', rateFromInr: 0.0095 },
];

export function formatPriceInCurrency(priceInr: number, currency: CurrencyCode): string {
  const meta = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
  if (currency === 'INR') {
    return `₹${Math.round(priceInr)}`;
  }
  const converted = priceInr * meta.rateFromInr;
  return `${meta.symbol}${converted < 10 ? converted.toFixed(2) : converted.toFixed(1)}`;
}

export function getPlanCutPriceInr(
  plan: HostingPlanItem,
  discountPercent: number = 20
): number {
  if (plan.originalPriceInr && plan.originalPriceInr > plan.priceInr) {
    return Math.round(plan.originalPriceInr);
  }
  const validPct = Math.min(85, Math.max(5, discountPercent || 20));
  return Math.max(plan.priceInr + 20, Math.round(plan.priceInr / (1 - validPct / 100)));
}

export interface SiteConfigData {
  brandName: string;
  heroTitle: string;
  heroSubtitle: string;
  panelUrl: string;
  discordUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  storeUrl: string;
  supportTicketUrl: string;
  founderName: string;
  founderQuote: string;
  discountOffer: string;
}

export const HERO_MINECRAFT_IMAGE =
  '/src/assets/images/minecraft_cherry_hero_1791297555092.jpg';
export const CITADEL_SHOWCASE_IMAGE =
  '/src/assets/images/minecraft_crimson_citadel_1791297573028.jpg';
export const HARDWARE_RACK_IMAGE =
  '/src/assets/images/datacenter_ryzen_blade_1791297587652.jpg';
export const BOT_HOSTING_IMAGE =
  '/src/assets/images/discord_bot_hosting_hub_1791306773682.jpg';
export const VPS_SERVER_IMAGE =
  '/src/assets/images/kvm_vps_server_matrix_1791306793276.jpg';
export const DOMAIN_DNS_IMAGE =
  '/src/assets/images/domain_dns_network_1791306806619.jpg';

export const DEFAULT_SITE_CONFIG: SiteConfigData = {
  brandName: 'Areex Cloud',
  heroTitle: 'World-Class Minecraft & Cloud Servers Built for Indian Gamers',
  heroSubtitle:
    'Powered by Ryzen 9 9950X & AMD EPYC processors in Mumbai, Noida & Singapore datacenters. Sub-5ms Indian ping, instant modpack deployment, AES-256 encrypted security, and 24/7 DDoS protection.',
  panelUrl: 'https://areexcloud.site',
  discordUrl: 'https://discord.gg/pV25HWmZwZ',
  youtubeUrl: 'https://www.youtube.com/@areex_cloud',
  instagramUrl: 'https://www.instagram.com/areex_cloud/',
  storeUrl: 'https://areexcloud.site/store',
  supportTicketUrl: 'https://discord.gg/pV25HWmZwZ',
  founderName: 'Piyush Garai',
  founderQuote:
    "The best servers aren't built by the richest players — they're built by the most passionate ones. Give everyone the tools, and watch what they create.",
  discountOffer: '',
};

export const PLAN_CATEGORIES: CategoryMeta[] = [
  {
    key: 'budget',
    indexLabel: '01',
    name: 'Budget Plans',
    headline: 'High-Value Entry & SMP Hosting',
    audience: 'Beginners and small friend groups',
    description:
      'Unbeatable price-to-performance ratios with NVMe storage, Pterodactyl panel access, and instant setup for survival SMPs.',
    imageUrl: HERO_MINECRAFT_IMAGE,
    imageCaption: 'MINECRAFT SURVIVAL SMP · NVME GEN5 & PTERODACTYL PANEL',
  },
  {
    key: 'premium',
    indexLabel: '02',
    name: 'Premium Plans',
    headline: 'Built for Champions',
    audience: 'Growing communities, modded servers',
    description:
      'High-performance plans with maximum resources for large networks, heavy Forge/Fabric modpacks, and serious server owners.',
    imageUrl: CITADEL_SHOWCASE_IMAGE,
    imageCaption: 'HEAVY MODPACKS & FLAGSHIP NETWORKS · UP TO 256GB RAM',
  },
  {
    key: 'exclusive',
    indexLabel: '03',
    name: 'Exclusive Plans',
    headline: 'Dedicated Ryzen 9 9950X Clusters',
    audience: 'Large networks and serious projects',
    description:
      'Unshared high-frequency Ryzen 9 9950X threads, DDR5 ECC memory, and multi-terabit Anycast mitigation for flagship networks.',
    imageUrl: HARDWARE_RACK_IMAGE,
    imageCaption: 'LIQUID-COOLED RYZEN 9 9950X (5.7 GHZ) · DEDICATED CORES',
  },
  {
    key: 'bot',
    indexLabel: '04',
    name: 'Bot Plans',
    headline: 'Always-On Discord & Telemetry Bots',
    audience: 'Discord and other bots, 24/7 uptime',
    description:
      'Zero-sleep Node.js, Python, Java, and Go containers with Git auto-pull, Redis caching, and 99.99% uptime SLA.',
    imageUrl: BOT_HOSTING_IMAGE,
    imageCaption: '24/7 DISCORD BOT CONTAINERS · NODE.JS, PYTHON, JAVA & GO',
  },
  {
    key: 'vps',
    indexLabel: '05',
    name: 'VPS Plans',
    headline: 'Your Own Virtual Server',
    audience: 'Developers and advanced users',
    description:
      'Full root SSH access with KVM hardware virtualization. Host Minecraft proxy networks, web clusters, or custom workloads powered by AMD EPYC & Intel Xeon.',
    imageUrl: VPS_SERVER_IMAGE,
    imageCaption: 'KVM VIRTUAL PRIVATE SERVERS · FULL ROOT SSH & AMD EPYC',
  },
  {
    key: 'domain',
    indexLabel: '06',
    name: 'Domain Plans',
    headline: 'Custom Server & Brand Domains',
    audience: 'Custom domains for servers or brands',
    description:
      'Replace raw IP numbers with a memorable server address like play.yourserver.in with pre-configured SRV records and Cloudflare DDoS DNS.',
    imageUrl: DOMAIN_DNS_IMAGE,
    imageCaption: 'GLOBAL ANYCAST DNS · AUTO MINECRAFT SRV (.IN / .COM / .GG)',
  },
];

export const INITIAL_HOSTING_PLANS: HostingPlanItem[] = [
  // 1. BUDGET PLANS (Matching Screenshot 841 + PDF)
  {
    id: 'budget_pro',
    name: 'Pro',
    tagline: 'Starter survival SMPs & friend groups',
    category: 'budget',
    priceInr: 69,
    billingPeriod: '/mo',
    ram: '4 GB RAM',
    cpu: '150% CPU',
    storage: '25 GB Storage',
    speed: '1 Gbps Speed',
    popular: false,
    features: [
      '4 GB DDR4 RAM',
      '150% CPU Allocation',
      '1 Gbps Network Speed',
      '25 GB NVMe Storage',
      'DDoS Protection',
      'Pterodactyl Panel',
      '24/7 Support',
    ],
    sortOrder: 1,
  },
  {
    id: 'budget_max',
    name: 'Max',
    tagline: 'Best value for 10–20 player SMPs',
    category: 'budget',
    priceInr: 129,
    billingPeriod: '/mo',
    ram: '8 GB RAM',
    cpu: '250% CPU',
    storage: '50 GB Storage',
    speed: '1 Gbps Speed',
    popular: true,
    features: [
      '8 GB DDR4 RAM',
      '250% CPU Allocation',
      '1 Gbps Network Speed',
      '50 GB NVMe Storage',
      'Unlimited Databases',
      'Pterodactyl Panel',
      '24/7 Support',
    ],
    sortOrder: 2,
  },
  {
    id: 'budget_titan',
    name: 'Titan',
    tagline: 'Plugin-rich Paper & Purpur servers',
    category: 'budget',
    priceInr: 199,
    billingPeriod: '/mo',
    ram: '12 GB RAM',
    cpu: '350% CPU',
    storage: '80 GB Storage',
    speed: '1 Gbps Speed',
    popular: false,
    features: [
      '12 GB DDR4 RAM',
      '350% CPU Allocation',
      '1 Gbps Network Speed',
      '80 GB NVMe Storage',
      'Unlimited Databases',
      'Auto Backups',
      '24/7 Priority Support',
    ],
    sortOrder: 3,
  },
  {
    id: 'budget_sudopodia',
    name: 'Sudopodia',
    tagline: 'Mid-sized communities & modpacks',
    category: 'budget',
    priceInr: 279,
    billingPeriod: '/mo',
    ram: '16 GB RAM',
    cpu: '500% CPU',
    storage: '120 GB Storage',
    speed: '1 Gbps Speed',
    popular: false,
    features: [
      '16 GB DDR4 RAM',
      '500% CPU Allocation',
      '1 Gbps Network Speed',
      '120 GB NVMe Storage',
      'Unlimited Databases',
      'Auto Backups',
      '24/7 Priority Support',
    ],
    sortOrder: 4,
  },
  {
    id: 'budget_infinity',
    name: 'Infinity',
    tagline: 'Heavy worlds & multi-verse setups',
    category: 'budget',
    priceInr: 349,
    billingPeriod: '/mo',
    ram: '24 GB RAM',
    cpu: '650% CPU',
    storage: '160 GB Storage',
    speed: '1 Gbps Speed',
    popular: false,
    features: [
      '24 GB DDR4 RAM',
      '650% CPU Allocation',
      '1 Gbps Network Speed',
      '160 GB NVMe Storage',
      'Auto Backups',
      'Free Migration',
      '24/7 VIP Support',
    ],
    sortOrder: 5,
  },
  {
    id: 'budget_omega',
    name: 'Omega',
    tagline: 'The ultimate budget beast',
    category: 'budget',
    priceInr: 449,
    billingPeriod: '/mo',
    ram: '32 GB RAM',
    cpu: '800% CPU',
    storage: '200 GB Storage',
    speed: '1 Gbps Speed',
    popular: false,
    features: [
      '32 GB RAM',
      '800% CPU',
      '1 Gbps Speed',
      '200 GB Storage',
      'Unlimited Databases',
      'DDoS Protection',
      'Hourly Backups',
      'Free Migration',
      '24/7 VIP Support',
    ],
    sortOrder: 6,
  },

  // 2. PREMIUM PLANS (Exact from Screenshots 842 & 843)
  {
    id: 'premium_elite',
    name: 'Elite',
    tagline: 'High performance gaming',
    category: 'premium',
    priceInr: 399,
    billingPeriod: '/mo',
    ram: '24 GB RAM',
    cpu: '700% CPU',
    storage: '350 GB Storage',
    speed: '2 Gbps Speed',
    popular: false,
    features: [
      '24 GB RAM',
      '700% CPU',
      '2 Gbps Speed',
      '350 GB Storage',
      'Unlimited Databases',
      'Advanced DDoS',
      'Auto Backups',
      '24/7 VIP Support',
    ],
    sortOrder: 1,
  },
  {
    id: 'premium_elite_plus',
    name: 'Elite Plus',
    tagline: 'Maximum gaming power',
    category: 'premium',
    priceInr: 499,
    billingPeriod: '/mo',
    ram: '32 GB RAM',
    cpu: '800% CPU',
    storage: '500 GB Storage',
    speed: '5 Gbps Speed',
    popular: true,
    features: [
      '32 GB RAM',
      '800% CPU',
      '5 Gbps Speed',
      '500 GB Storage',
      'Unlimited Databases',
      'Advanced DDoS',
      'Auto Backups',
      'Free Migration',
      '24/7 VIP Support',
    ],
    sortOrder: 2,
  },
  {
    id: 'premium_enterprise',
    name: 'Enterprise',
    tagline: 'For serious server networks',
    category: 'premium',
    priceInr: 649,
    billingPeriod: '/mo',
    ram: '48 GB RAM',
    cpu: '1200% CPU',
    storage: '750 GB Storage',
    speed: '5 Gbps Speed',
    popular: false,
    features: [
      '48 GB RAM',
      '1200% CPU',
      '5 Gbps Speed',
      '750 GB Storage',
      'Unlimited Databases',
      'Enterprise DDoS',
      'Hourly Backups',
      'Free Migration',
      'Custom Domain',
      '24/7 VIP Support',
    ],
    sortOrder: 3,
  },
  {
    id: 'premium_enterprise_plus',
    name: 'Enterprise Plus',
    tagline: 'Top-tier network hosting',
    category: 'premium',
    priceInr: 799,
    billingPeriod: '/mo',
    ram: '64 GB RAM',
    cpu: '1600% CPU',
    storage: '1 TB Storage',
    speed: '5 Gbps Speed',
    popular: false,
    features: [
      '64 GB RAM',
      '1600% CPU',
      '5 Gbps Speed',
      '1 TB Storage',
      'Unlimited Databases',
      'Enterprise DDoS',
      'Hourly Backups',
      'Free Migration',
      'Custom Domain',
      'Dedicated IP',
    ],
    sortOrder: 4,
  },
  {
    id: 'premium_titan',
    name: 'Titan',
    tagline: 'Unmatched raw power',
    category: 'premium',
    priceInr: 1299,
    billingPeriod: '/mo',
    ram: '128 GB RAM',
    cpu: '3200% CPU',
    storage: '2 TB Storage',
    speed: '10 Gbps Speed',
    popular: false,
    features: [
      '128 GB RAM',
      '3200% CPU',
      '10 Gbps Speed',
      '2 TB Storage',
      'Unlimited Databases',
      'Enterprise DDoS',
      'Hourly Backups',
      'Free Migration',
      'Custom Domain',
      'Dedicated IP',
    ],
    sortOrder: 5,
  },
  {
    id: 'premium_titan_max',
    name: 'Titan Max',
    tagline: 'The absolute pinnacle',
    category: 'premium',
    priceInr: 2499,
    billingPeriod: '/mo',
    ram: '256 GB RAM',
    cpu: '6400% CPU',
    storage: '4 TB Storage',
    speed: '10 Gbps Speed',
    popular: false,
    features: [
      '256 GB RAM',
      '6400% CPU',
      '10 Gbps Speed',
      '4 TB Storage',
      'Unlimited Databases',
      'Enterprise DDoS',
      'Hourly Backups',
      'Custom Domain',
      '2x Dedicated IPs',
      'Dedicated Account Manager',
    ],
    sortOrder: 6,
  },

  // 3. EXCLUSIVE PLANS (Category 3 in PDF)
  {
    id: 'exclusive_core',
    name: 'Sovereign Core',
    tagline: 'Dedicated Ryzen 9 9950X threads',
    category: 'exclusive',
    priceInr: 1499,
    billingPeriod: '/mo',
    ram: '64 GB DDR5',
    cpu: '1600% Ryzen 9 9950X',
    storage: '1 TB NVMe Gen5',
    speed: '10 Gbps Uplink',
    popular: false,
    features: [
      '64 GB DDR5 6000MHz RAM',
      '1600% Pinned Ryzen 9 9950X',
      '1 TB Samsung Gen5 NVMe',
      'Velocity / BungeeCord Ready',
      '17.2 Tbps CosmicGuard DDoS',
      'Dedicated IPv4 Included',
      'Direct Engineer Slack/Discord Line',
    ],
    sortOrder: 1,
  },
  {
    id: 'exclusive_matrix',
    name: 'Sovereign Matrix',
    tagline: 'Multi-lobby & 300+ player networks',
    category: 'exclusive',
    priceInr: 2799,
    billingPeriod: '/mo',
    ram: '128 GB DDR5',
    cpu: '3200% Ryzen 9 9950X',
    storage: '2 TB NVMe Gen5',
    speed: '10 Gbps Uplink',
    popular: true,
    features: [
      '128 GB DDR5 6000MHz RAM',
      '3200% Pinned Ryzen 9 9950X',
      '2 TB Gen5 NVMe RAID-10',
      'Multi-Node Split Allocation',
      '2x Dedicated IPv4 Addresses',
      'Automated Offsite S3 Backups',
      '24/7 Priority Architecture Support',
    ],
    sortOrder: 2,
  },
  {
    id: 'exclusive_apex',
    name: 'Bare Metal Apex',
    tagline: 'Full physical node isolation',
    category: 'exclusive',
    priceInr: 4999,
    billingPeriod: '/mo',
    ram: '256 GB DDR5 ECC',
    cpu: '6400% Dedicated',
    storage: '4 TB NVMe RAID',
    speed: '25 Gbps Anycast',
    popular: false,
    features: [
      '256 GB DDR5 ECC Memory',
      'Full Physical Node Isolation',
      '4 TB Enterprise NVMe RAID-10',
      '25 Gbps Redundant Uplink',
      'Custom Hardware L7 Firewall',
      '4x Dedicated IPv4 Subnet',
      'Dedicated Account Manager',
    ],
    sortOrder: 3,
  },

  // 4. BOT PLANS (Category 4 in PDF)
  {
    id: 'bot_starter',
    name: 'Bot Nano',
    tagline: 'Single Discord bot with 24/7 uptime',
    category: 'bot',
    priceInr: 29,
    billingPeriod: '/mo',
    ram: '1 GB RAM',
    cpu: '100% CPU',
    storage: '5 GB NVMe',
    speed: '1 Gbps Speed',
    popular: false,
    features: [
      '1 GB DDR4 RAM',
      '100% vCPU Thread',
      '5 GB NVMe Storage',
      'Node.js, Python, Java, Go',
      'Auto-Restart on Crash',
      'Pterodactyl Bot Console',
    ],
    sortOrder: 1,
  },
  {
    id: 'bot_pro',
    name: 'Bot Pulse',
    tagline: 'Music, moderation & economy bots',
    category: 'bot',
    priceInr: 59,
    billingPeriod: '/mo',
    ram: '2 GB RAM',
    cpu: '200% CPU',
    storage: '15 GB NVMe',
    speed: '2 Gbps Speed',
    popular: true,
    features: [
      '2 GB DDR5 RAM',
      '200% High-Clock CPU',
      '15 GB NVMe Storage',
      'Lavalink & Audio Ready',
      'Git Webhook Auto-Deploy',
      'Free MySQL & Redis Instance',
      '24/7 Priority Support',
    ],
    sortOrder: 2,
  },
  {
    id: 'bot_cluster',
    name: 'Bot Shards',
    tagline: 'Verified bots in 2,500+ servers',
    category: 'bot',
    priceInr: 119,
    billingPeriod: '/mo',
    ram: '4 GB RAM',
    cpu: '400% CPU',
    storage: '35 GB NVMe',
    speed: '5 Gbps Speed',
    popular: false,
    features: [
      '4 GB DDR5 RAM',
      '400% Dedicated CPU',
      '35 GB NVMe Storage',
      'Multi-Shard Load Balancing',
      'Hourly Automated Backups',
      'Dedicated Outbound IP',
      '24/7 VIP Support',
    ],
    sortOrder: 3,
  },

  // 5. VPS PLANS (Exact from Screenshots 844 & 845)
  {
    id: 'vps_starter',
    name: 'Starter VPS',
    tagline: 'Entry-level VPS hosting',
    category: 'vps',
    priceInr: 149,
    billingPeriod: '/mo',
    ram: '4 GB RAM',
    cpu: '2 CPU Cores',
    storage: '50 GB Disk',
    speed: 'Intel Xeon E5',
    popular: false,
    features: [
      '4 GB RAM',
      '2 CPU Cores',
      '50 GB Disk',
      'Intel Xeon E5',
      'Non-DDoS Protected',
      'Full Root Access',
      'KVM Virtualization',
      'Instant Deploy',
    ],
    sortOrder: 1,
  },
  {
    id: 'vps_micro',
    name: 'Micro VPS',
    tagline: 'Perfect for small projects',
    category: 'vps',
    priceInr: 299,
    billingPeriod: '/mo',
    ram: '8 GB RAM',
    cpu: '3 CPU Cores',
    storage: '100 GB Disk',
    speed: 'Intel Xeon E5',
    popular: false,
    features: [
      '8 GB RAM',
      '3 CPU Cores',
      '100 GB Disk',
      'Intel Xeon E5',
      'Basic DDoS Protection',
      'Full Root Access',
      'KVM Virtualization',
      'Instant Deploy',
    ],
    sortOrder: 2,
  },
  {
    id: 'vps_macro',
    name: 'Macro VPS',
    tagline: 'Mid-range power',
    category: 'vps',
    priceInr: 499,
    billingPeriod: '/mo',
    ram: '16 GB RAM',
    cpu: '6 CPU Cores',
    storage: '200 GB Disk',
    speed: 'Intel Xeon',
    popular: true,
    features: [
      '16 GB RAM',
      '6 CPU Cores',
      '200 GB Disk',
      'Intel Xeon',
      'Standard DDoS',
      'Full Root Access',
      'KVM Virtualization',
      'Weekly Backups',
    ],
    sortOrder: 3,
  },
  {
    id: 'vps_mega',
    name: 'Mega VPS',
    tagline: 'For demanding workloads',
    category: 'vps',
    priceInr: 749,
    billingPeriod: '/mo',
    ram: '24 GB RAM',
    cpu: '8 CPU Cores',
    storage: '300 GB Disk',
    speed: 'Intel Xeon / AMD EPYC',
    popular: false,
    features: [
      '24 GB RAM',
      '8 CPU Cores',
      '300 GB Disk',
      'Intel Xeon / AMD EPYC',
      'Standard DDoS',
      'Full Root Access',
      'KVM Virtualization',
      'Daily Backups',
    ],
    sortOrder: 4,
  },
  {
    id: 'vps_large',
    name: 'Large VPS',
    tagline: 'High-performance computing',
    category: 'vps',
    priceInr: 999,
    billingPeriod: '/mo',
    ram: '32 GB RAM',
    cpu: '10 CPU Cores',
    storage: '400 GB Disk',
    speed: 'AMD EPYC 7B13',
    popular: false,
    features: [
      '32 GB RAM',
      '10 CPU Cores',
      '400 GB Disk',
      'AMD EPYC 7B13',
      'Advanced DDoS',
      'Full Root Access',
      'KVM Virtualization',
      'Daily Backups',
    ],
    sortOrder: 5,
  },
  {
    id: 'vps_ultra',
    name: 'Ultra VPS',
    tagline: 'Next-level raw performance',
    category: 'vps',
    priceInr: 1499,
    billingPeriod: '/mo',
    ram: '48 GB RAM',
    cpu: '12 CPU Cores',
    storage: '600 GB Disk',
    speed: 'AMD EPYC 7B13',
    popular: false,
    features: [
      '48 GB RAM',
      '12 CPU Cores',
      '600 GB Disk',
      'AMD EPYC 7B13',
      'Advanced DDoS',
      'Full Root Access',
      'KVM Virtualization',
      'Daily Backups',
    ],
    sortOrder: 6,
  },
  {
    id: 'vps_titan',
    name: 'Titan VPS',
    tagline: 'Maximum VPS power',
    category: 'vps',
    priceInr: 1999,
    billingPeriod: '/mo',
    ram: '64 GB RAM',
    cpu: '16 CPU Cores',
    storage: '800 GB Disk',
    speed: 'AMD EPYC 7B13',
    popular: false,
    features: [
      '64 GB RAM',
      '16 CPU Cores',
      '800 GB Disk',
      'AMD EPYC 7B13',
      'Advanced DDoS',
      'Full Root Access',
      'KVM Virtualization',
      'Hourly Backups',
    ],
    sortOrder: 7,
  },

  // 6. DOMAIN PLANS (Category 6 in PDF)
  {
    id: 'domain_in',
    name: '.in Server Domain',
    tagline: 'Official Indian registry for local communities',
    category: 'domain',
    priceInr: 449,
    billingPeriod: '/yr',
    ram: 'Unlimited DNS',
    cpu: 'Auto SRV Setup',
    storage: 'WHOIS Privacy',
    speed: 'Cloudflare Anycast',
    popular: false,
    features: [
      '1 Year .in Registration',
      'One-Click Minecraft SRV Record',
      'Play Subdomain (play.yourname.in)',
      'Cloudflare DDoS Protected DNS',
      'Free WHOIS Privacy Shield',
      'Instant Propagation',
    ],
    sortOrder: 1,
  },
  {
    id: 'domain_com',
    name: '.com Global Domain',
    tagline: 'The gold standard for flagship server brands',
    category: 'domain',
    priceInr: 899,
    billingPeriod: '/yr',
    ram: 'Unlimited DNS',
    cpu: 'Auto SRV Setup',
    storage: 'DNSSEC + SSL',
    speed: 'Cloudflare Anycast',
    popular: true,
    features: [
      '1 Year .com Registration',
      'Automated Minecraft SRV + A Records',
      'Unlimited Subdomains (play, store, map)',
      'DNSSEC Cryptographic Signing',
      'Free Auto-Renewing TLS/SSL',
      '24/7 DNS Support',
    ],
    sortOrder: 2,
  },
  {
    id: 'domain_gg',
    name: '.gg / .net Gaming Domain',
    tagline: 'Built for competitive esports & PvP networks',
    category: 'domain',
    priceInr: 1299,
    billingPeriod: '/yr',
    ram: 'Unlimited DNS',
    cpu: 'Auto SRV Setup',
    storage: 'Custom Glue DNS',
    speed: 'Cloudflare Anycast',
    popular: false,
    features: [
      '1 Year .gg or .net Registration',
      'Pre-wired SRV & Bungee Proxy Routing',
      'Custom Vanity Nameservers',
      'Zero-Latency Edge DNS Resolution',
      'Full Domain Transfer Lock',
      '24/7 VIP Support',
    ],
    sortOrder: 3,
  },
];

// Exact 6 player reviews from Screenshot 846
export const PLAYER_REVIEWS: PlayerReview[] = [
  {
    id: 'rev_rahul',
    initials: 'RK',
    name: 'Rahul K.',
    role: 'Server Owner',
    serverType: 'RLCraft Network',
    city: 'Mumbai',
    rating: 5,
    quote:
      "Zero lag with 30 players and RLCraft running. Best Minecraft hosting I've tried in India. Setup took under a minute — I was shocked.",
  },
  {
    id: 'rev_aryan',
    initials: 'AS',
    name: 'Aryan S.',
    role: 'Server Owner',
    serverType: 'Survival SMP',
    city: 'Delhi',
    rating: 5,
    quote:
      'The support team migrated my 6GB world in under an hour for free. The professionalism was unreal. Switched from another host and never looking back.',
  },
  {
    id: 'rev_priya',
    initials: 'PM',
    name: 'Priya M.',
    role: 'Server Owner',
    serverType: 'Creative Hub',
    city: 'Bangalore',
    rating: 5,
    quote:
      'Been on the Pro plan for 5 months. 100% uptime. My players have never complained about lag even once. Areex Cloud is genuinely unmatched.',
  },
  {
    id: 'rev_vikram',
    initials: 'VT',
    name: 'Vikram T.',
    role: 'Network Owner',
    serverType: 'ATM9 Server',
    city: 'Pune',
    rating: 5,
    quote:
      "I run a 50-player network with ATM9 and it's butter smooth. The Pterodactyl panel is so clean. Piyush and his team are legends fr.",
  },
  {
    id: 'rev_nikhil',
    initials: 'NK',
    name: 'Nikhil K.',
    role: 'Server Owner',
    serverType: 'Skyblock Network',
    city: 'Chennai',
    rating: 5,
    quote:
      'Started on the Budget plan, upgraded to Premium within a week because my server grew so fast. The process was seamless. 10/10 would recommend.',
  },
  {
    id: 'rev_siddharth',
    initials: 'SR',
    name: 'Siddharth R.',
    role: 'VPS User',
    serverType: 'Multi-game Server',
    city: 'Hyderabad',
    rating: 5,
    quote:
      'The VPS plan is insane value. Full root access, AMD EPYC processor, and DDoS protection — all for ₹149. Nothing else comes close at this price.',
  },
];

export const TERMS_OF_SERVICE_ITEMS = [
  {
    title: '01. Lawful Use Only',
    detail:
      'All Areex Cloud game servers, bot containers, VPS instances, and domain registrations are provided strictly for lawful gaming, community, and software operations under Indian and international cyber law.',
  },
  {
    title: '02. Zero-Tolerance Abuse Policy',
    detail:
      'Outbound DDoS attacks, port scanning, hacking tools, unauthorized cryptocurrency mining, phishing pages, and malware distribution are strictly prohibited and trigger immediate automated suspension.',
  },
  {
    title: '03. Prepaid Billing & Renewal Window',
    detail:
      'All plans operate on a prepaid billing cycle. Customers must renew prior to the invoice due date; unpaid server instances are archived for 72 hours and permanently purged after 7 days.',
  },
  {
    title: '04. 24-Hour Satisfaction & Refund Policy',
    detail:
      'Full refunds are eligible within 24 hours of initial server provisioning if hardware specifications fail to match the subscribed tier and the instance bandwidth has not been abused.',
  },
  {
    title: '05. Fair Resource Allocation',
    detail:
      'Customers must operate within the memory, CPU thread, and NVMe storage boundaries of their subscribed tier. Automated safeguards prevent noisy-neighbor spikes across shared nodes.',
  },
  {
    title: '06. Terms Revisions',
    detail:
      'Areex Cloud reserves the right to refine these terms to protect platform stability; continued operation of an active service constitutes acceptance of updated terms.',
  },
];

export const COMMUNITY_GUIDELINES_ITEMS = [
  {
    title: '01. Mutual Respect & Zero Harassment',
    detail:
      'Treat all players, server owners, and staff with respect. Harassment, hate speech, doxxing, or spam across our Discord and support channels is never tolerated.',
  },
  {
    title: '02. Dedicated Channel Discipline',
    detail:
      'Use the designated Discord channels for plan inquiries, node announcements, community showcases, and technical discussions to keep the server organized.',
  },
  {
    title: '03. Official Ticket-Only Support',
    detail:
      'All billing, migration, and technical support happens exclusively through the official Support Ticket channel. Do not direct-message staff members for account support.',
  },
  {
    title: '04. No Unsolicited Advertising',
    detail:
      'Do not advertise external hosting services, unauthorized marketplaces, or unapproved Discord links in community channels or member DMs.',
  },
  {
    title: '05. Credential & Payment Security',
    detail:
      'Never share your Pterodactyl Panel password, SFTP keys, or payment receipts in public channels. Areex Cloud staff will never ask for your plaintext password.',
  },
  {
    title: '06. Staff & Discord ToS Compliance',
    detail:
      'Follow moderator guidance and adhere strictly to Discord Terms of Service and Community Guidelines at all times.',
  },
];

export const PRIVACY_POLICY_ITEMS = [
  {
    title: '01. Minimal Data Collection',
    detail:
      'Areex Cloud collects only essential account metadata: registered email address, billing transaction IDs, server hostname preferences, and security login audit timestamps.',
  },
  {
    title: '02. AES-256-GCM Credential Encryption',
    detail:
      'All SFTP keys, Pterodactyl game panel passwords, and RCON secrets are encrypted at rest using 256-bit AES-GCM with scrypt key derivation and HMAC-SHA256 integrity verification.',
  },
  {
    title: '03. Zero Third-Party Data Selling',
    detail:
      'We never sell, rent, or trade customer personal data, player IP logs, or world files to third-party advertisers or data brokers under any circumstances.',
  },
  {
    title: '04. World File & Database Sovereignty',
    detail:
      'Your Minecraft worlds, plugin configurations, MySQL databases, and Discord bot source code remain 100% your intellectual property. Staff only access containers when explicitly requested via a support ticket.',
  },
  {
    title: '05. Payment Gateway Isolation',
    detail:
      'Credit card numbers, UPI PINs, and PayPal credentials are processed directly by PCI-DSS Level 1 certified gateways (Razorpay, Stripe, PayPal) and never touch Areex Cloud storage.',
  },
  {
    title: '06. Indian DPDP Act 2023 Compliance',
    detail:
      'Customers may request a complete export or permanent erasure of their account records at any time through our official Legal & Privacy Support Desk.',
  },
];

export const REFUND_SLA_POLICY_ITEMS = [
  {
    title: '01. 24-Hour Money-Back Guarantee',
    detail:
      'New customers are eligible for a 100% no-questions-asked refund within 24 hours of their first server deployment if the node fails to deliver promised hardware specifications.',
  },
  {
    title: '02. 99.9% Network Uptime SLA',
    detail:
      'Our Mumbai, Noida, and Singapore datacenters are backed by a 99.9% monthly uptime guarantee. Unscheduled downtime exceeding 45 minutes qualifies for automatic billing credit.',
  },
  {
    title: '03. Non-Refundable Registrations',
    detail:
      'Custom domain registrations (.in, .com, .gg, .net) and dedicated IPv4 subnet allocations are registered directly with upstream registries and cannot be refunded once provisioned.',
  },
  {
    title: '04. Seamless Plan Upgrades & Downgrades',
    detail:
      'You can upgrade from Budget to Premium, Exclusive, or VPS tiers at any time with prorated billing and zero world data loss.',
  },
  {
    title: '05. Chargeback & Dispute Resolution',
    detail:
      'Opening an unauthorized payment chargeback without contacting our 24/7 Billing Support Desk first results in automatic container lock until resolved.',
  },
  {
    title: '06. Free World Migration Guarantee',
    detail:
      'Switching from another host? Our engineers migrate your entire world, plugins, and databases for free within 60 minutes of ticket submission.',
  },
];

export const WHY_AREEX_FEATURES = [
  {
    badge: '01 · UPTIME',
    title: '99.9% Uptime Guarantee',
    description:
      'Redundant power feeds and high-availability KVM hypervisors keep your Minecraft SMP and Discord bots online 24/7 without surprise reboots.',
  },
  {
    badge: '02 · SECURITY',
    title: 'Enterprise DDoS Protection',
    description:
      'Multi-layered 17.2 Tbps CosmicGuard & Path.net Anycast mitigation absorbs volumetric UDP/TCP floods and L7 bot attacks in under 1 millisecond.',
  },
  {
    badge: '03 · SPEED',
    title: 'Instant 60-Second Setup',
    description:
      'Automated Pterodactyl container provisioning deploys your server, allocates your port, and encrypts your login credentials in under 60 seconds.',
  },
  {
    badge: '04 · STORAGE',
    title: 'Gen5 NVMe SSD Storage',
    description:
      'Blazing-fast enterprise NVMe arrays eliminate chunk-loading stutter, world-save lag spikes, and slow modpack boot times.',
  },
  {
    badge: '05 · CONTROL',
    title: 'Pterodactyl Game Panel',
    description:
      'Clean, powerful control panel featuring 1-click Paper, Purpur, Forge, Fabric, RLCraft & ATM9 installers, real-time console, and SFTP access.',
  },
  {
    badge: '06 · SUPPORT',
    title: '24/7 Support & Free Migration',
    description:
      'Real Indian gaming engineers available round-the-clock via Website Support Tickets and Discord — plus 100% free world migration from any host.',
  },
];

export const SUPPORT_FAQ_ITEMS = [
  {
    question: 'How fast is my server deployed after payment?',
    answer:
      'Your server is provisioned automatically within 30 to 60 seconds after checkout via Razorpay UPI, Stripe Card, or PayPal. Your AES-256 encrypted Pterodactyl login and SFTP credentials appear immediately on screen.',
  },
  {
    question: 'How do I claim Free Server Migration from my old host?',
    answer:
      'Simply open a Support Ticket in our Customer Support section below (or on our official Discord) and select "Free World Migration". Our engineers will transfer your world folders, plugins, and databases in under 1 hour at zero cost.',
  },
  {
    question: 'How do Coupon Codes and Discount Offers work?',
    answer:
      'Whenever an active promotion is live on the Discount Offer Board above the Plans section, you will see the original price crossed out alongside the discounted price. You can also enter any official promo code (like AREEX10, INDIA20, or custom codes) during checkout for instant savings.',
  },
  {
    question: 'Can I host heavy modpacks like RLCraft, ATM9, or Cobblemon?',
    answer:
      'Yes! Our Premium (Elite / Elite Plus) and Exclusive (Ryzen 9 9950X) plans are specifically tuned for heavy Forge, NeoForge, and Fabric modpacks with high single-core clock speeds and Gen5 NVMe storage.',
  },
  {
    question: 'What is your 24-Hour Refund Policy?',
    answer:
      'If you are not satisfied with your server performance within the first 24 hours of deployment, submit a Billing & Refund Ticket and we will process a full 100% refund.',
  },
];

