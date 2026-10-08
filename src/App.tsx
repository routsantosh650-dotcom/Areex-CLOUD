/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import {
  ArrowRight,
  Zap,
  Star,
  ExternalLink,
  Search,
  Lock,
  Flame,
  ShieldCheck,
  Copy,
  Check,
  Tag,
  Menu,
  X,
} from 'lucide-react';
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
} from './firebase';
import {
  PLAN_CATEGORIES,
  INITIAL_HOSTING_PLANS,
  INITIAL_COUPONS,
  PLAYER_REVIEWS,
  WHY_AREEX_FEATURES,
  DEFAULT_SITE_CONFIG,
  HERO_MINECRAFT_IMAGE,
  CITADEL_SHOWCASE_IMAGE,
  HARDWARE_RACK_IMAGE,
  CurrencyCode,
  CouponItem,
  SupportTicketItem,
  formatPriceInCurrency,
  HostingPlanItem,
  PlanCategoryKey,
  SiteConfigData,
} from './data/areexData';
import { AreexLogo } from './components/AreexLogo';
import { CurrencySlidebar } from './components/CurrencySlidebar';
import { CinematicLoader } from './components/CinematicLoader';
import { CustomContextMenu } from './components/CustomContextMenu';
import { CustomCursor } from './components/CustomCursor';
import { InteractivePlanCard } from './components/InteractivePlanCard';
import { ContactSection } from './components/ContactSection';
import { LegalSection } from './components/LegalSection';
import { CustomerSupportChat } from './components/CustomerSupportSection';
import { GlobalNetworkMap } from './components/GlobalNetworkMap';
import { LiveUnder60SecondsSection } from './components/LiveUnder60SecondsSection';
import { CheckoutModal, ProvisionedOrderRecord } from './components/CheckoutModal';
import {
  AdminAnalyticsWorkspace,
  AdminTabKey,
} from './components/AdminAnalyticsWorkspace';

const HERO_TYPEWRITER_SEGMENTS = [
  { text: 'MINECRAFT · BOT · KVM VPS · DOMAINS', className: 'text-red-400 font-semibold' },
  { text: ' · ', className: 'text-red-500 font-bold' },
  { text: 'MADE IN INDIA FOR INDIAN GAMERS', className: 'text-slate-100 font-semibold' },
  { text: ' · ', className: 'text-red-500 font-bold' },
  { text: 'AES-256 ENCRYPTED', className: 'text-emerald-400 font-semibold' },
];

const HERO_FULL_TEXT_LENGTH = HERO_TYPEWRITER_SEGMENTS.reduce(
  (acc, seg) => acc + seg.text.length,
  0
);

const HeroTypewriterLine: React.FC = () => {
  const [typedCount, setTypedCount] = useState(0);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (typedCount < HERO_FULL_TEXT_LENGTH) {
      timeoutId = setTimeout(() => {
        setTypedCount((prev) => prev + 1);
      }, 32);
    } else {
      timeoutId = setTimeout(() => {
        setTypedCount(0);
      }, 4200);
    }
    return () => clearTimeout(timeoutId);
  }, [typedCount]);

  let remaining = typedCount;

  return (
    <div
      data-testid="hero-typewriter-line"
      aria-label="MINECRAFT · BOT · KVM VPS · DOMAINS · MADE IN INDIA FOR INDIAN GAMERS · AES-256 ENCRYPTED"
      className="inline-block max-w-full rounded-lg border border-red-500/25 bg-black/55 px-3 py-1.5 font-mono text-[10px] sm:text-xs leading-relaxed tracking-wide backdrop-blur-md shadow-[0_0_25px_rgba(220,38,38,0.2)] text-center break-words"
    >
      {HERO_TYPEWRITER_SEGMENTS.map((seg, idx) => {
        if (remaining <= 0) return null;
        const sliceText = seg.text.slice(0, remaining);
        remaining -= sliceText.length;
        return (
          <span key={idx} className={seg.className}>
            {sliceText}
          </span>
        );
      })}
      <span
        aria-hidden="true"
        className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-red-500 align-middle shadow-[0_0_8px_rgba(239,68,68,0.9)]"
      />
    </div>
  );
};

const LOCAL_PLAN_OVERRIDES_KEY = 'areex_plan_overrides_v2';
const LOCAL_DELETED_PLANS_KEY = 'areex_deleted_plans_v2';

function readLocalPlanOverrides(): HostingPlanItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_PLAN_OVERRIDES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalPlanOverrides(overrides: HostingPlanItem[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_PLAN_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {
    // Ignore storage quota errors
  }
}

function readLocalDeletedPlanIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_DELETED_PLANS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function writeLocalDeletedPlanIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_DELETED_PLANS_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage quota errors
  }
}

function buildMergedPlans(
  baseList: HostingPlanItem[],
  extraOverrides: HostingPlanItem[] = [],
  extraDeletedIds: string[] = []
): HostingPlanItem[] {
  const deletedSet = new Set<string>([
    ...readLocalDeletedPlanIds(),
    ...extraDeletedIds,
  ]);
  const map = new Map<string, HostingPlanItem>();
  baseList.forEach((p) => {
    if (!deletedSet.has(p.id)) {
      map.set(p.id, p);
    }
  });
  readLocalPlanOverrides().forEach((ov) => {
    if (ov && ov.id && !deletedSet.has(ov.id)) {
      map.set(ov.id, ov);
    }
  });
  extraOverrides.forEach((ov) => {
    if (ov && ov.id && !deletedSet.has(ov.id)) {
      map.set(ov.id, ov);
    }
  });
  return Array.from(map.values());
}

export default function App() {
  const [showLoader, setShowLoader] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' || navigator.webdriver) return false;
    return true;
  });

  const [activeCategory, setActiveCategory] = useState<PlanCategoryKey>('premium');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [searchQuery, setSearchQuery] = useState('');
  const [plans, setPlans] = useState<HostingPlanItem[]>(() =>
    buildMergedPlans(INITIAL_HOSTING_PLANS)
  );
  const [siteConfig, setSiteConfig] = useState<SiteConfigData>(DEFAULT_SITE_CONFIG);
  const [discountOffer, setDiscountOffer] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(20);
  const [coupons, setCoupons] = useState<CouponItem[]>(INITIAL_COUPONS);
  const [copiedBoardCoupon, setCopiedBoardCoupon] = useState<string | null>(null);
  const [supportTickets, setSupportTickets] = useState<SupportTicketItem[]>([]);
  const [orders, setOrders] = useState<ProvisionedOrderRecord[]>([]);

  // Modal & Workspace states
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] =
    useState<HostingPlanItem | null>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [workspaceInitialTab, setWorkspaceInitialTab] =
    useState<AdminTabKey>('discount');
  const [supportChatOpen, setSupportChatOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdminSessionUnlocked, setIsAdminSessionUnlocked] = useState(false);

  // Image fallback tracking
  const [heroImgError, setHeroImgError] = useState(false);
  const [citadelImgError, setCitadelImgError] = useState(false);
  const [rackImgError, setRackImgError] = useState(false);

  const cardsContainerRef = useRef<HTMLDivElement | null>(null);
  const heroImageRef = useRef<HTMLImageElement | null>(null);

  // 1. Firebase Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // 2. Fetch server-side Discount Offer Board, Coupons, Plan Overrides, and Support Tickets on mount
  useEffect(() => {
    fetch('/api/discount-board')
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.discountOffer === 'string') {
          setDiscountOffer(d.discountOffer);
        }
        if (typeof d.discountPercent === 'number') {
          setDiscountPercent(d.discountPercent);
        }
      })
      .catch(() => {});

    fetch('/api/coupons')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.coupons) && d.coupons.length > 0) {
          setCoupons(d.coupons);
        }
      })
      .catch(() => {});

    fetch('/api/plans')
      .then((r) => r.json())
      .then((d) => {
        const serverOverrides: HostingPlanItem[] = Array.isArray(d.plans) ? d.plans : [];
        const serverDeleted: string[] = Array.isArray(d.deletedPlanIds)
          ? d.deletedPlanIds.map(String)
          : [];
        if (serverDeleted.length > 0) {
          const mergedDeleted = Array.from(
            new Set([...readLocalDeletedPlanIds(), ...serverDeleted])
          );
          writeLocalDeletedPlanIds(mergedDeleted);
        }
        if (serverOverrides.length > 0) {
          const byId = new Map<string, HostingPlanItem>();
          readLocalPlanOverrides().forEach((p) => byId.set(p.id, p));
          serverOverrides.forEach((p) => {
            if (p && p.id) byId.set(p.id, p);
          });
          writeLocalPlanOverrides(Array.from(byId.values()));
        }
        if (serverOverrides.length > 0 || serverDeleted.length > 0) {
          setPlans((prev) => buildMergedPlans(prev, serverOverrides, serverDeleted));
        }
      })
      .catch(() => {});

    fetch('/api/support/tickets')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.tickets)) {
          setSupportTickets(d.tickets);
        }
      })
      .catch(() => {});
  }, []);

  // 3. Public Firestore Listener for /plans and /siteConfig/main
  useEffect(() => {
    const plansRef = collection(db, 'plans');
    const unsubPlans = onSnapshot(
      plansRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const remotePlans: HostingPlanItem[] = [];
          snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            const descText = String(d.tagline || d.description || '');
            remotePlans.push({
              id: docSnap.id,
              name: String(d.name || 'Plan'),
              tagline: descText,
              description: descText,
              category: (d.category as PlanCategoryKey) || 'budget',
              priceInr: Number(d.priceInr) || 99,
              originalPriceInr: d.originalPriceInr ? Number(d.originalPriceInr) : undefined,
              billingPeriod: d.billingPeriod === '/yr' ? '/yr' : '/mo',
              ram: String(d.ram || '4 GB RAM'),
              cpu: String(d.cpu || '100% CPU'),
              storage: String(d.storage || '25 GB Storage'),
              speed: String(d.speed || '1 Gbps Speed'),
              popular: Boolean(d.popular),
              features: Array.isArray(d.features) ? d.features.map(String) : [],
              sortOrder: Number(d.sortOrder) || 1,
            });
          });
          setPlans((prev) => {
            const baseMap = new Map<string, HostingPlanItem>();
            prev.forEach((p) => baseMap.set(p.id, p));
            remotePlans.forEach((p) => baseMap.set(p.id, p));
            return buildMergedPlans(Array.from(baseMap.values()));
          });
        }
      },
      () => {}
    );

    const configDocRef = doc(db, 'siteConfig', 'main');
    const unsubConfig = onSnapshot(
      configDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const d = docSnap.data();
          setSiteConfig((prev) => ({
            ...prev,
            brandName: String(d.brandName || DEFAULT_SITE_CONFIG.brandName),
            heroTitle: String(d.heroTitle || DEFAULT_SITE_CONFIG.heroTitle),
            heroSubtitle: String(d.heroSubtitle || DEFAULT_SITE_CONFIG.heroSubtitle),
            panelUrl: String(d.panelUrl || DEFAULT_SITE_CONFIG.panelUrl),
            discordUrl: String(d.discordUrl || DEFAULT_SITE_CONFIG.discordUrl),
            storeUrl: String(d.storeUrl || DEFAULT_SITE_CONFIG.storeUrl),
            supportTicketUrl: String(
              d.supportTicketUrl || DEFAULT_SITE_CONFIG.supportTicketUrl
            ),
            founderName: String(d.founderName || DEFAULT_SITE_CONFIG.founderName),
            founderQuote: String(d.founderQuote || DEFAULT_SITE_CONFIG.founderQuote),
            discountOffer:
              typeof d.discountOffer === 'string' ? d.discountOffer : prev.discountOffer,
          }));
          if (typeof d.discountOffer === 'string') {
            setDiscountOffer(d.discountOffer);
          }
        }
      },
      () => {}
    );

    return () => {
      unsubPlans();
      unsubConfig();
    };
  }, []);

  // 4. Authenticated User Orders Listener
  useEffect(() => {
    if (!authReady || !currentUser) return;
    const q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const fetched: ProvisionedOrderRecord[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          fetched.push({
            id: docSnap.id,
            transactionId: `ARX-${docSnap.id.slice(-6).toUpperCase()}`,
            planId: String(d.planId),
            planName: String(d.planName),
            category: String(d.category),
            amountInr: Number(d.amountInr),
            paymentMethod: d.paymentMethod || 'stripe',
            serverHostname: String(d.serverHostname),
            datacenterNode: d.datacenterNode || 'Mumbai IN-West-1',
            encryptedCredentials: String(d.encryptedCredentials),
            encryptionIv: String(d.encryptionIv),
            hmacSignature: 'verified-firestore-record',
            credentials: {
              serverUsername: `areex_${String(d.serverHostname).replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}`,
              serverPassword: '•••••••••••• (AES-256 Protected)',
              dedicatedEndpoint: '103.195.102.48:25565',
              sftpAddress: 'sftp://103.195.102.48:2022',
              rconToken: 'encrypted',
            },
            status: d.status || 'active',
            createdAtIso: new Date().toISOString(),
          });
        });
        if (fetched.length > 0) {
          setOrders((prev) => {
            const byId = new Map<string, ProvisionedOrderRecord>();
            prev.forEach((o) => byId.set(o.id, o));
            fetched.forEach((o) => byId.set(o.id, o));
            return Array.from(byId.values());
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'orders');
      }
    );
    return () => unsub();
  }, [authReady, currentUser]);

  // 5. GSAP Transition when switching plan categories (Hero image + Cards)
  useEffect(() => {
    setHeroImgError(false);

    if (heroImageRef.current) {
      gsap.fromTo(
        heroImageRef.current,
        { opacity: 0.35, scale: 1.05 },
        { opacity: 1, scale: 1, duration: 0.55, ease: 'power2.out' }
      );
    }

    if (!cardsContainerRef.current) return;
    const cards = cardsContainerRef.current.querySelectorAll('[data-plan-card]');
    if (cards.length === 0) return;
    gsap.fromTo(
      cards,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.24,
        stagger: 0.04,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      }
    );
  }, [activeCategory]);

  const isFirebaseAdmin = Boolean(
    currentUser?.emailVerified &&
      (currentUser?.email === 'routsantosh650@gmail.com' ||
        currentUser?.email === 'areexcloud@gmail.com')
  );

  const isAdminUnlocked = isAdminSessionUnlocked || isFirebaseAdmin;

  // Persist order to local state + Firestore (if authenticated)
  const handleOrderCompleted = async (order: ProvisionedOrderRecord) => {
    setOrders((prev) => [order, ...prev]);

    if (currentUser && currentUser.emailVerified) {
      const safeOrderId = order.id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
      const safePlanId = order.planId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
      try {
        await setDoc(doc(db, 'orders', safeOrderId), {
          userId: currentUser.uid,
          planId: safePlanId,
          planName: order.planName.slice(0, 80),
          category: order.category,
          amountInr: Math.min(500000, Math.max(1, Math.round(order.amountInr))),
          paymentMethod: order.paymentMethod,
          serverHostname: order.serverHostname.slice(0, 100),
          datacenterNode: order.datacenterNode,
          encryptedCredentials: order.encryptedCredentials.slice(0, 2048),
          encryptionIv: order.encryptionIv.slice(0, 64),
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        await setDoc(doc(db, 'analytics', `evt_${Date.now()}`), {
          userId: currentUser.uid,
          eventType: 'order_complete',
          category: order.category.slice(0, 60),
          label: order.planName.slice(0, 120),
          valueInr: Math.min(500000, Math.max(0, Math.round(order.amountInr))),
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `orders/${safeOrderId}`);
      }
    }
  };

  // Save Discount Offer Board & Global Cut % (updates live state + backend + Firestore if admin)
  const handleSaveDiscountOffer = async (offerText: string, pct: number) => {
    const cleanOffer = offerText.slice(0, 240);
    const validPct = Math.min(85, Math.max(5, Number(pct) || 20));
    setDiscountOffer(cleanOffer);
    setDiscountPercent(validPct);
    setSiteConfig((prev) => ({ ...prev, discountOffer: cleanOffer }));

    await fetch('/api/discount-board', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discountOffer: cleanOffer,
        discountPercent: validPct,
      }),
    }).catch(() => {});

    if (currentUser && isFirebaseAdmin) {
      try {
        await setDoc(doc(db, 'siteConfig', 'main'), {
          brandName: siteConfig.brandName.slice(0, 60),
          heroTitle: siteConfig.heroTitle.slice(0, 120),
          heroSubtitle: siteConfig.heroSubtitle.slice(0, 300),
          panelUrl: siteConfig.panelUrl.slice(0, 200),
          discordUrl: siteConfig.discordUrl.slice(0, 200),
          storeUrl: siteConfig.storeUrl.slice(0, 200),
          supportTicketUrl: siteConfig.supportTicketUrl.slice(0, 200),
          founderName: siteConfig.founderName.slice(0, 80),
          founderQuote: siteConfig.founderQuote.slice(0, 400),
          discountOffer: cleanOffer,
          updatedBy: currentUser.uid,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'siteConfig/main');
      }
    }
  };

  // Coupon Code Create & Delete
  const handleCreateCoupon = async (coupon: {
    code: string;
    discountPercent: number;
    description: string;
  }) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coupon),
      });
      const data = await res.json();
      if (Array.isArray(data.coupons)) {
        setCoupons(data.coupons);
      }
    } catch {
      setCoupons((prev) => [
        coupon,
        ...prev.filter((c) => c.code !== coupon.code),
      ]);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    try {
      const res = await fetch(`/api/coupons/${encodeURIComponent(code)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (Array.isArray(data.coupons)) {
        setCoupons(data.coupons);
      }
    } catch {
      setCoupons((prev) => prev.filter((c) => c.code !== code));
    }
  };

  // Customer Support Ticket Create & Admin Reply/Update
  const handleCreateSupportTicket = async (payload: {
    customerName: string;
    customerEmail: string;
    discordHandle: string;
    category: string;
    priority: 'normal' | 'high' | 'urgent';
    serverIpOrId: string;
    subject: string;
    message: string;
  }): Promise<SupportTicketItem | null> => {
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (Array.isArray(data.tickets)) {
        setSupportTickets(data.tickets);
      }
      return data.ticket || null;
    } catch {
      return null;
    }
  };

  const handleUpdateSupportTicket = async (
    ticketId: string,
    updates: {
      status: 'open' | 'in_progress' | 'resolved';
      adminReply?: string;
      repliedBy?: string;
    }
  ) => {
    try {
      const res = await fetch(`/api/support/tickets/${encodeURIComponent(ticketId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (Array.isArray(data.tickets)) {
        setSupportTickets(data.tickets);
      }
    } catch {
      setSupportTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, ...updates } : t))
      );
    }
  };

  // No-Code Admin Plan Save (persists custom description, features, priceInr & originalPriceInr cut price)
  const handleSavePlan = async (updatedPlan: HostingPlanItem) => {
    const customDesc = updatedPlan.tagline?.trim() || updatedPlan.description?.trim() || '';
    const normalizedPlan: HostingPlanItem = {
      ...updatedPlan,
      tagline: customDesc,
      description: customDesc,
      features: Array.isArray(updatedPlan.features) ? updatedPlan.features : [],
    };

    // Persist in localStorage overrides & clear from deletedIds if re-added
    const currentDeleted = readLocalDeletedPlanIds().filter((id) => id !== normalizedPlan.id);
    writeLocalDeletedPlanIds(currentDeleted);
    const currentOverrides = readLocalPlanOverrides().filter((p) => p.id !== normalizedPlan.id);
    writeLocalPlanOverrides([...currentOverrides, normalizedPlan]);

    setPlans((prev) => {
      const exists = prev.some((p) => p.id === normalizedPlan.id);
      if (exists) {
        return prev.map((p) => (p.id === normalizedPlan.id ? normalizedPlan : p));
      }
      return [...prev, normalizedPlan];
    });

    await fetch('/api/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: normalizedPlan }),
    }).catch(() => {});

    if (currentUser && isFirebaseAdmin) {
      const safeId = normalizedPlan.id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
      const boundedFeatures = (
        normalizedPlan.features.length > 0 ? normalizedPlan.features : ['24/7 Support']
      )
        .slice(0, 10)
        .map((f) => f.slice(0, 120));

      try {
        await setDoc(doc(db, 'plans', safeId), {
          name: normalizedPlan.name.slice(0, 60),
          tagline: (customDesc || 'Custom Hosting Plan').slice(0, 120),
          category: normalizedPlan.category,
          priceInr: Math.min(500000, Math.max(1, Math.round(normalizedPlan.priceInr))),
          billingPeriod: normalizedPlan.billingPeriod,
          ram: normalizedPlan.ram.slice(0, 40),
          cpu: normalizedPlan.cpu.slice(0, 60),
          storage: normalizedPlan.storage.slice(0, 50),
          speed: normalizedPlan.speed.slice(0, 60),
          popular: Boolean(normalizedPlan.popular),
          features: boundedFeatures,
          sortOrder: Math.min(1000, Math.max(0, Math.round(normalizedPlan.sortOrder))),
          authorId: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `plans/${safeId}`);
      }
    }
  };

  // No-Code Admin Plan Delete
  const handleDeletePlan = async (planId: string) => {
    const nextDeleted = Array.from(new Set([...readLocalDeletedPlanIds(), planId]));
    writeLocalDeletedPlanIds(nextDeleted);
    writeLocalPlanOverrides(readLocalPlanOverrides().filter((p) => p.id !== planId));

    setPlans((prev) => prev.filter((p) => p.id !== planId));
    await fetch(`/api/plans/${encodeURIComponent(planId)}`, {
      method: 'DELETE',
    }).catch(() => {});

    if (currentUser && isFirebaseAdmin) {
      const safeId = planId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
      try {
        await deleteDoc(doc(db, 'plans', safeId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `plans/${safeId}`);
      }
    }
  };

  // No-Code Admin Site Config Save
  const handleSaveSiteConfig = async (newConfig: SiteConfigData) => {
    setSiteConfig(newConfig);
    if (currentUser && isFirebaseAdmin) {
      try {
        await setDoc(doc(db, 'siteConfig', 'main'), {
          brandName: newConfig.brandName.slice(0, 60),
          heroTitle: newConfig.heroTitle.slice(0, 120),
          heroSubtitle: newConfig.heroSubtitle.slice(0, 300),
          panelUrl: newConfig.panelUrl.slice(0, 200),
          discordUrl: newConfig.discordUrl.slice(0, 200),
          storeUrl: newConfig.storeUrl.slice(0, 200),
          supportTicketUrl: newConfig.supportTicketUrl.slice(0, 200),
          founderName: newConfig.founderName.slice(0, 80),
          founderQuote: newConfig.founderQuote.slice(0, 400),
          discountOffer: discountOffer.slice(0, 240),
          updatedBy: currentUser.uid,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'siteConfig/main');
      }
    }
  };

  const activeCategoryMeta =
    PLAN_CATEGORIES.find((c) => c.key === activeCategory) || PLAN_CATEGORIES[1];

  const visiblePlans = plans
    .filter((p) => p.category === activeCategory)
    .filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.ram.toLowerCase().includes(q) ||
        p.cpu.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const hasDiscountOffer = discountOffer.trim().length > 0;

  return (
    <div
      id="top"
      className="min-h-screen w-full max-w-full overflow-x-clip bg-[#090608] text-slate-100"
    >
      {/* Custom Fluid GSAP Cursor */}
      <CustomCursor />

      {/* GSAP Cinematic Hardware Boot Loader */}
      <CinematicLoader visible={showLoader} onComplete={() => setShowLoader(false)} />

      {/* Custom Fluid Right-Click Context Menu (Admin options strictly hidden for normal users) */}
      <CustomContextMenu
        onSelectCategory={(cat) => setActiveCategory(cat)}
        onOpenWorkspace={(tab) => {
          setWorkspaceInitialTab(tab);
          setWorkspaceOpen(true);
        }}
        onReplayLoader={() => setShowLoader(true)}
        onQuickCheckout={() => {
          const elitePlus =
            plans.find((p) => p.id === 'premium_elite_plus') || plans[0];
          setSelectedPlanForCheckout(elitePlus);
        }}
        onOpenSupportChat={() => setSupportChatOpen(true)}
        isAdminUnlocked={isAdminUnlocked}
      />

      {/* Strict 1-Row, 3-Zone Top Bar Contract (Mobile & Desktop Responsive) */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090608]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 py-3">
          {/* Zone 1: Official Areex Cloud Logo + Brand Wordmark */}
          <a
            href="#top"
            className="flex items-center gap-2 sm:gap-3 font-display text-sm sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            <AreexLogo size="sm" />
            <span>{siteConfig.brandName}</span>
          </a>

          {/* Zone 2: Clean text navigation links (Plans, Network Map, Features, Founder, Support, Legal, Contact) */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300"
          >
            <a
              href="#pricing-section"
              className="hover:text-white transition-colors whitespace-nowrap"
            >
              Plans
            </a>
            <a
              href="#network-map-section"
              className="hover:text-white transition-colors whitespace-nowrap"
            >
              Network Map
            </a>
            <a
              href="#architecture-section"
              className="hover:text-white transition-colors whitespace-nowrap"
            >
              Features
            </a>
            <a
              href="#founder-section"
              className="hover:text-white transition-colors whitespace-nowrap"
            >
              Founder
            </a>
            <a
              href="#reviews-section"
              className="hover:text-white transition-colors whitespace-nowrap"
            >
              Reviews
            </a>
            <button
              type="button"
              onClick={() => setSupportChatOpen(true)}
              className="hover:text-white transition-colors whitespace-nowrap"
            >
              24/7 Support
            </button>
            <a
              href="#legal-section"
              className="hover:text-white transition-colors whitespace-nowrap"
            >
              Legal
            </a>
            <a
              href="#contact-section"
              className="hover:text-white transition-colors whitespace-nowrap"
            >
              Contact
            </a>
          </nav>

          {/* Zone 3: Single Compact Currency Slidebar Button + Primary CTA */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <CurrencySlidebar
              currency={currency}
              onCurrencyChange={setCurrency}
              variant="nav"
            />

            {isAdminUnlocked ? (
              <button
                type="button"
                onClick={() => {
                  setWorkspaceInitialTab('discount');
                  setWorkspaceOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-semibold text-white shadow-[0_0_20px_rgba(220,38,38,0.35)] transition-colors hover:bg-red-500 whitespace-nowrap"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Admin Console</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <a
                  href="#pricing-section"
                  className="hidden sm:flex items-center gap-1 rounded-xl bg-red-600 px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-semibold text-white shadow-[0_0_20px_rgba(220,38,38,0.35)] transition-colors hover:bg-red-500 whitespace-nowrap"
                >
                  <Zap className="h-3.5 w-3.5 shrink-0" />
                  <span>Deploy Server</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setWorkspaceInitialTab('discount');
                    setWorkspaceOpen(true);
                  }}
                  title="Authorized 2-Admin Staff Login"
                  aria-label="Authorized 2-Admin Staff Login"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#120a0e] text-slate-400 transition-colors hover:border-red-500/40 hover:text-white shrink-0"
                >
                  <Lock className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle Mobile Navigation Menu"
              className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#120a0e] text-slate-200 hover:border-red-500/40 hover:text-white shrink-0"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Drawer */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile Navigation"
            className="lg:hidden border-t border-white/10 bg-[#0d070a] px-4 py-3 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-200"
          >
            <a
              href="#pricing-section"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg bg-white/5 px-3 py-2 hover:bg-red-600/20 hover:text-white"
            >
              Plans & Pricing
            </a>
            <a
              href="#network-map-section"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg bg-white/5 px-3 py-2 hover:bg-red-600/20 hover:text-white"
            >
              8 Global PoPs Map
            </a>
            <a
              href="#architecture-section"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg bg-white/5 px-3 py-2 hover:bg-red-600/20 hover:text-white"
            >
              Features & Hardware
            </a>
            <a
              href="#founder-section"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg bg-white/5 px-3 py-2 hover:bg-red-600/20 hover:text-white"
            >
              Meet the Founder
            </a>
            <a
              href="#reviews-section"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg bg-white/5 px-3 py-2 hover:bg-red-600/20 hover:text-white"
            >
              Player Reviews
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setSupportChatOpen(true);
              }}
              className="rounded-lg bg-white/5 px-3 py-2 text-left hover:bg-red-600/20 hover:text-white"
            >
              24/7 Support Chat
            </button>
            <a
              href="#legal-section"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg bg-white/5 px-3 py-2 hover:bg-red-600/20 hover:text-white"
            >
              Legal & ToS
            </a>
            <a
              href="#contact-section"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg bg-white/5 px-3 py-2 hover:bg-red-600/20 hover:text-white"
            >
              Contact & Discord
            </a>
          </nav>
        )}
      </header>

      <main className="w-full max-w-full overflow-x-clip">
        {/* 1. HERO SECTION (Dynamic Category Visual Picture + Live Typewriter Line) */}
        <section className="relative min-h-[560px] sm:min-h-[680px] w-full overflow-hidden border-b border-white/10">
          <img
            ref={heroImageRef}
            key={activeCategoryMeta.imageUrl}
            src={heroImgError ? HERO_MINECRAFT_IMAGE : activeCategoryMeta.imageUrl}
            alt={`${activeCategoryMeta.name} — ${activeCategoryMeta.headline}`}
            onError={() => setHeroImgError(true)}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          {/* Measured Contrast Scrim so the category picture shines clearly while text stays crisp */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090608] via-[#090608]/60 to-[#090608]/35" />

          {/* Semantic DOM Content Layer */}
          <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-4 sm:px-6 pt-12 sm:pt-20 pb-12 sm:pb-16 text-center">
            {/* Live Typewriter Effect for MINECRAFT · BOT · KVM VPS · DOMAINS · MADE IN INDIA FOR INDIAN GAMERS · AES-256 ENCRYPTED */}
            <HeroTypewriterLine />

            <h1
              style={{ textWrap: 'balance' }}
              className="mt-5 max-w-4xl font-display text-2xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] break-words"
            >
              {siteConfig.heroTitle}
            </h1>

            <p className="mt-4 sm:mt-5 max-w-2xl text-xs sm:text-lg leading-relaxed text-slate-200">
              {siteConfig.heroSubtitle}
            </p>

            {/* Starting Price Callout in Selected Currency */}
            <div className="mt-6 sm:mt-7 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 font-mono">
              <span className="text-xs sm:text-sm text-slate-300">Starting at</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-red-500 tabular-nums">
                {formatPriceInCurrency(29, currency)}
              </span>
              <span className="text-xs sm:text-sm text-slate-400">/mo</span>
              <span className="mx-1 text-slate-600">·</span>
              <span className="text-xs text-slate-200">
                Minecraft SMPs from {formatPriceInCurrency(69, currency)}/mo
              </span>
            </div>

            {/* Primary Focal CTA + Support CTA */}
            <div className="mt-6 sm:mt-7 flex w-full sm:w-auto flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <a
                href="#pricing-section"
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-red-600 px-6 sm:px-7 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-[0_0_35px_rgba(220,38,38,0.5)] transition-all hover:bg-red-500 whitespace-nowrap"
              >
                <Zap className="h-4 w-4" />
                <span>Get Started — View Plans</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <button
                type="button"
                onClick={() => setSupportChatOpen(true)}
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/20 bg-black/55 px-6 py-3.5 text-xs sm:text-sm font-medium text-slate-100 backdrop-blur-md transition-colors hover:border-red-500/60 hover:text-white whitespace-nowrap"
              >
                <span>24/7 Customer Support</span>
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>

            {/* Bottom Segmented Category Switcher Dock */}
            <div
              role="tablist"
              aria-label="Quick Hosting Category Switcher"
              className="mt-10 sm:mt-14 grid grid-cols-2 sm:flex w-full max-w-4xl sm:flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-white/15 bg-[#0d070a]/90 p-2 shadow-2xl backdrop-blur-xl"
            >
              {PLAN_CATEGORIES.map((cat) => {
                const isSelected = activeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => {
                      setActiveCategory(cat.key);
                    }}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-2.5 sm:px-4 py-2.5 text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="font-mono text-[10px] sm:text-[11px] opacity-75">{cat.indexLabel}.</span>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 2. SIX-CATEGORY PRICING MATRIX + CONDITIONAL DISCOUNT OFFER BOARD & STRIKETHROUGH CUT PRICES */}
        <section id="pricing-section" className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20">
          {/* CONDITIONAL DISCOUNT OFFER BOARD: Only shown when discountOffer has text; completely hidden when empty */}
          {hasDiscountOffer && (
            <div
              data-testid="discount-offer-board"
              className="mb-10 flex flex-col justify-between gap-4 rounded-2xl border border-red-500/50 bg-gradient-to-r from-red-950/90 via-[#1f0910] to-red-950/90 px-6 py-5 shadow-[0_0_40px_rgba(220,38,38,0.25)] lg:flex-row lg:items-center"
            >
              <div className="flex items-start gap-3.5 sm:items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shrink-0 shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-red-400">
                    LIMITED TIME SPECIAL OFFER · PRICE CUTS ACTIVE BELOW
                  </div>
                  <p className="text-sm font-bold text-white sm:text-base">
                    {discountOffer}
                  </p>
                </div>
              </div>

              {/* Active Clickable Coupon Chips inside Discount Board */}
              {coupons.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 font-mono text-[11px] text-amber-400">
                    <Tag className="h-3.5 w-3.5" />
                    <span>Click to Copy Coupon:</span>
                  </span>
                  {coupons.slice(0, 3).map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(c.code);
                        setCopiedBoardCoupon(c.code);
                        setTimeout(() => setCopiedBoardCoupon(null), 1600);
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-black/50 px-2.5 py-1 font-mono text-xs font-bold text-white transition-colors hover:border-red-400 hover:bg-red-600"
                    >
                      <span>{c.code}</span>
                      <span className="text-red-300">(-{c.discountPercent}%)</span>
                      {copiedBoardCoupon === c.code ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3 opacity-75" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col items-start justify-between gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end">
            <div>
              {/* Areex Cloud Plans Brand Emblem Kicker ("logo add kr nav me areexcloudplans ke side me") */}
              <div className="flex items-center gap-2.5">
                <AreexLogo size="sm" />
                <div className="font-mono text-xs font-semibold text-red-400">
                  AREEX CLOUD PLANS · {activeCategoryMeta.indexLabel}.{' '}
                  {activeCategoryMeta.name.toUpperCase()}
                </div>
              </div>

              <h2
                style={{ textWrap: 'balance' }}
                className="mt-2.5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
              >
                {activeCategoryMeta.headline}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                {activeCategoryMeta.description}
              </p>
            </div>

            {/* Search & Single Currency Slidebar Button */}
            <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by RAM, CPU, or tier..."
                  aria-label="Filter hosting plans"
                  className="w-full rounded-xl border border-white/15 bg-[#120a0e] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                />
              </div>

              <CurrencySlidebar
                currency={currency}
                onCurrencyChange={setCurrency}
                variant="inline"
              />
            </div>
          </div>

          {/* 6-Category Filter Tabs */}
          <div className="mt-6 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
            {PLAN_CATEGORIES.map((cat) => {
              const active = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`rounded-lg px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-semibold transition-colors whitespace-nowrap truncate ${
                    active
                      ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                      : 'border border-white/10 bg-[#120a0e] text-slate-400 hover:border-white/25 hover:text-white'
                  }`}
                >
                  {cat.indexLabel}. {cat.name}
                </button>
              );
            })}
          </div>

          {/* Animated Cursor-Interactive Plan Cards Grid */}
          {visiblePlans.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-white/10 bg-[#120a0e] p-12 text-center">
              <p className="text-sm text-slate-300">
                No plans match "{searchQuery}" in {activeCategoryMeta.name}.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div
              ref={cardsContainerRef}
              className="mt-8 grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {visiblePlans.map((plan) => (
                <InteractivePlanCard
                  key={plan.id}
                  plan={plan}
                  categoryName={activeCategoryMeta.name}
                  currency={currency}
                  onCurrencyChange={setCurrency}
                  onSelectPlan={(selected) => setSelectedPlanForCheckout(selected)}
                  hasDiscountOffer={hasDiscountOffer}
                  discountPercent={discountPercent}
                />
              ))}
            </div>
          )}
        </section>

        {/* 2.5 GLOBAL 8 POINTS OF PRESENCE DOT-MATRIX WORLD MAP (Matching Screenshot 855) */}
        <GlobalNetworkMap />

        {/* 2.6 LIVE IN UNDER 60 SECONDS INTERACTIVE BASH TERMINAL (Matching Screenshot 856) */}
        <LiveUnder60SecondsSection />

        {/* 3. WHY CHOOSE AREEX CLOUD (6 KEY FEATURES) + INFRASTRUCTURE BENTO GRID */}
        <section
          id="architecture-section"
          className="border-y border-white/10 bg-[#0d070a] py-14 sm:py-20 overflow-hidden"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <div className="font-mono text-xs text-red-400">
                WHY CHOOSE AREEX CLOUD · ENTERPRISE ARCHITECTURE
              </div>
              <h2
                style={{ textWrap: 'balance' }}
                className="mt-2 font-display text-2xl sm:text-4xl font-bold tracking-tight text-white"
              >
                Engineered for 20.0 TPS Under Heavy Modpack & Network Loads
              </h2>
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-400">
                Every Areex Cloud container runs on liquid-cooled Ryzen 9 9950X and AMD EPYC hardware with full AES-256-GCM database encryption and sub-5ms Indian peering.
              </p>
            </div>

            {/* 6 Key Platform Features from Official Guide */}
            <div className="mt-8 sm:mt-10 grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {WHY_AREEX_FEATURES.map((feat) => (
                <div
                  key={feat.badge}
                  className="rounded-2xl border border-white/10 bg-[#120a0e] p-5 sm:p-6 transition-all duration-200 hover:-translate-y-1 hover:border-red-500/50"
                >
                  <div className="font-mono text-[11px] font-bold text-red-400">
                    {feat.badge}
                  </div>
                  <h3 className="mt-2 font-display text-lg font-bold text-white">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    {feat.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Bento Card 1 (col-span-2) */}
              <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#120a0e] lg:col-span-2">
                <div className="p-5 sm:p-8">
                  <div className="font-mono text-xs text-red-400">
                    INSTANT MODPACK & PLUGIN DEPLOYMENT
                  </div>
                  <h3 className="mt-2 font-display text-xl sm:text-2xl font-bold text-white">
                    Built for RLCraft, All The Mods 9, PaperMC & Velocity Networks
                  </h3>
                  <p className="mt-2 max-w-xl text-xs sm:text-sm text-slate-300">
                    Deploy heavy Forge, Fabric, and NeoForge modpacks with NVMe Gen5 disk throughput, automated hourly snapshots, and free migration from any host.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <a
                      href="#pricing-section"
                      className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-500 whitespace-nowrap"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      <span>Deploy Your Server Now</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setSupportChatOpen(true)}
                      className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-200 hover:border-red-500/40 hover:text-white whitespace-nowrap"
                    >
                      <span>Open 24/7 Support Chat</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="relative h-56 sm:h-64 w-full border-t border-white/10">
                  <img
                    src={citadelImgError ? HERO_MINECRAFT_IMAGE : CITADEL_SHOWCASE_IMAGE}
                    alt="Minecraft crimson citadel build rendered with volumetric shaders"
                    onError={() => setCitadelImgError(true)}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#120a0e] via-transparent to-transparent" />
                </div>
              </div>

              {/* Bento Card 2 (col-span-1): Ryzen 9 9950X Datacenter Hardware */}
              <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#120a0e]">
                <div className="p-5 sm:p-6">
                  <div className="font-mono text-xs text-red-400">
                    MUMBAI & NOIDA HARDWARE
                  </div>
                  <h3 className="mt-2 font-display text-xl font-bold text-white">
                    Ryzen 9 9950X & AMD EPYC Blades
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">
                    5.7 GHz boost clocks paired with DDR5 ECC memory and Samsung Gen5 NVMe arrays deliver sub-5ms ping across India.
                  </p>
                  <dl className="mt-4 space-y-2 border-t border-white/10 pt-4 font-mono text-xs tabular-nums">
                    <div className="flex justify-between">
                      <dt className="text-slate-400">Mumbai IN-West-1</dt>
                      <dd className="text-emerald-400">4.2 ms</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-400">Noida IN-North-1</dt>
                      <dd className="text-emerald-400">9.1 ms</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-400">Singapore SG-1</dt>
                      <dd className="text-emerald-400">28.4 ms</dd>
                    </div>
                  </dl>
                </div>

                <div className="relative h-48 w-full border-t border-white/10">
                  <img
                    src={rackImgError ? CITADEL_SHOWCASE_IMAGE : HARDWARE_RACK_IMAGE}
                    alt="Enterprise liquid-cooled AMD Ryzen and EPYC server rack with crimson LED accents"
                    onError={() => setRackImgError(true)}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {/* Bento Card 3: AES-256-GCM Security */}
              <div className="rounded-2xl border border-white/10 bg-[#120a0e] p-6">
                <div className="font-mono text-xs text-red-400">
                  CRYPTOGRAPHIC VAULT
                </div>
                <h3 className="mt-2 font-display text-xl font-bold text-white">
                  AES-256-GCM Database Encryption
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  All customer SFTP keys, RCON tokens, and billing records are encrypted with 256-bit AES-GCM and verified via HMAC-SHA256 + Zero-Trust Firestore rules.
                </p>
                <div className="mt-5 flex items-center gap-2 font-mono text-xs text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span>256-BIT SCRYPT + GCM VERIFIED</span>
                </div>
              </div>

              {/* Bento Card 4 (col-span-2): 4-Step Buying Flow */}
              <div className="rounded-2xl border border-white/10 bg-[#120a0e] p-6 sm:p-8 lg:col-span-2">
                <div className="font-mono text-xs text-red-400">
                  SEAMLESS BUYING FLOW · RAZORPAY UPI, CARDS, NETBANKING & COUPONS
                </div>
                <h3 className="mt-2 font-display text-xl font-bold text-white">
                  From Plan Selection to Live Server in Under 60 Seconds
                </h3>
                <div className="mt-5 grid gap-4 sm:grid-cols-4 text-xs">
                  <div className="border-l border-red-500/40 pl-3">
                    <div className="font-mono font-bold text-red-400">STEP 01</div>
                    <div className="mt-1 font-semibold text-white">Pick Category & Plan</div>
                    <p className="mt-1 text-slate-400">
                      Choose from Budget, Premium, Exclusive, Bot, VPS, or Domain tiers.
                    </p>
                  </div>
                  <div className="border-l border-red-500/40 pl-3">
                    <div className="font-mono font-bold text-red-400">STEP 02</div>
                    <div className="mt-1 font-semibold text-white">Apply Coupon & Pay</div>
                    <p className="mt-1 text-slate-400">
                      Apply any official coupon code and checkout directly via Razorpay.
                    </p>
                  </div>
                  <div className="border-l border-red-500/40 pl-3">
                    <div className="font-mono font-bold text-red-400">STEP 03</div>
                    <div className="mt-1 font-semibold text-white">Instant Provisioning</div>
                    <p className="mt-1 text-slate-400">
                      Server is created automatically and AES-256 encrypted login is shared.
                    </p>
                  </div>
                  <div className="border-l border-red-500/40 pl-3">
                    <div className="font-mono font-bold text-red-400">STEP 04</div>
                    <div className="mt-1 font-semibold text-white">24/7 Support Desk</div>
                    <p className="mt-1 text-slate-400">
                      Open a Website or Discord ticket anytime for free world migration.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. MEET THE FOUNDER SECTION */}
        <section id="founder-section" className="mx-auto max-w-5xl px-4 sm:px-6 py-14 sm:py-20 overflow-hidden">
          <div className="text-center">
            <div className="font-mono text-xs text-red-400">THE MIND BEHIND AREEX CLOUD</div>
            <h2 className="mt-2 font-display text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Meet the Founder
            </h2>
          </div>

          <div className="mt-8 sm:mt-12 grid grid-cols-1 items-center gap-8 sm:gap-10 rounded-2xl border border-white/10 bg-[#120a0e] p-5 sm:p-10 md:grid-cols-12">
            <div className="flex flex-col items-center text-center md:col-span-4">
              <div className="flex h-36 w-36 items-center justify-center rounded-full border-2 border-red-500/50 bg-gradient-to-br from-red-600 via-red-800 to-[#1a090d] font-display text-4xl font-extrabold text-white shadow-[0_0_50px_rgba(220,38,38,0.35)]">
                PG
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-white">
                {siteConfig.founderName}
              </h3>
              <p className="mt-1 font-mono text-xs text-red-400">
                FOUNDER & CEO · AREEX CLOUD
              </p>
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-slate-300 md:col-span-8">
              <p>
                Hey, I'm <strong className="text-white">{siteConfig.founderName}</strong> — the
                founder of Areex Cloud. I started this journey because I was tired of overpriced,
                unreliable Minecraft hosting that left players frustrated and broke.
              </p>
              <p>
                As a passionate gamer myself, I know what it feels like when your server lags,
                crashes during a boss fight, or goes down at 2 AM with no support in sight. That's
                exactly what Areex Cloud was built to fix.
              </p>
              <p>
                From a single idea to a full hosting platform — every plan, every feature, every
                support ticket is built with one goal:{' '}
                <strong className="text-white">
                  give Indian gamers the world-class server experience they deserve, at a price
                  they can afford.
                </strong>
              </p>

              <blockquote className="mt-6 rounded-xl border-l-2 border-red-500 bg-[#090608] p-5 italic text-slate-200">
                "{siteConfig.founderQuote}"
                <footer className="mt-2 font-mono text-xs not-italic text-red-400">
                  — {siteConfig.founderName}
                </footer>
              </blockquote>

              <div className="pt-2 font-mono text-xs text-slate-400">
                <span>Passionate Gamer</span>
                <span aria-hidden="true" className="mx-2 text-red-500">
                  ·
                </span>
                <span>Cloud Architect</span>
                <span aria-hidden="true" className="mx-2 text-red-500">
                  ·
                </span>
                <span>Made in India</span>
                <span aria-hidden="true" className="mx-2 text-red-500">
                  ·
                </span>
                <span>Startup Builder</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. CUSTOMER REVIEWS SECTION */}
        <section
          id="reviews-section"
          className="border-t border-white/10 bg-[#0d070a] py-14 sm:py-20 overflow-hidden"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center">
              <div className="font-mono text-xs text-red-400">COMMUNITY LOVE</div>
              <h2 className="mt-2 font-display text-2xl sm:text-4xl font-bold tracking-tight text-white">
                What Players Are Saying
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-400">
                Real reviews from real server owners across India.
              </p>
            </div>

            <div className="mt-10 sm:mt-12 grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {PLAYER_REVIEWS.map((rev) => (
                <article
                  key={rev.id}
                  data-plan-card
                  className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#120a0e] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-red-500/50"
                >
                  <div>
                    <div
                      className="flex items-center gap-1 text-amber-400"
                      aria-label={`${rev.rating} out of 5 stars`}
                    >
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <p className="mt-4 text-sm italic leading-relaxed text-slate-200">
                      "{rev.quote}"
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600/20 font-mono text-xs font-bold text-red-400 shrink-0">
                      {rev.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white">{rev.name}</div>
                      <div className="truncate font-mono text-[11px] text-slate-400">
                        {rev.role} · {rev.serverType} · {rev.city}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 6. FLOATING 24/7 CUSTOMER SUPPORT MINI-CHAT WIDGET */}
        <CustomerSupportChat
          discordUrl={siteConfig.discordUrl}
          open={supportChatOpen}
          onToggleOpen={setSupportChatOpen}
        />

        {/* 7. OFFICIAL CONTACT & SOCIAL HUB (Discord, YouTube, Instagram with Logos & Direct Buttons) */}
        <ContactSection
          discordUrl={siteConfig.discordUrl}
          youtubeUrl={siteConfig.youtubeUrl}
          instagramUrl={siteConfig.instagramUrl}
        />

        {/* 8. COMPLETE LEGAL & COMPLIANCE CENTER (ToS, Community Guidelines, Privacy & 24h Refund SLA) */}
        <LegalSection />
      </main>

      {/* Quiet Editorial Footer with Official Areex Cloud Logo */}
      <footer className="border-t border-white/10 bg-[#070406] px-4 sm:px-6 py-10 sm:py-12 text-xs text-slate-400 overflow-hidden">
        <div className="mx-auto flex max-w-7xl flex-col items-center text-center sm:items-center sm:text-left justify-between gap-6 sm:flex-row">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <AreexLogo size="md" />
            <div>
              <div className="font-display text-base font-bold text-white">
                {siteConfig.brandName}
              </div>
              <p className="mt-0.5">
                World-class servers at a price you can afford · Made in India for Indian gamers.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <a href="#pricing-section" className="hover:text-white transition-colors">
              Plans
            </a>
            <button
              type="button"
              onClick={() => setSupportChatOpen(true)}
              className="hover:text-white transition-colors"
            >
              24/7 Support Chat
            </button>
            <a href="#legal-section" className="hover:text-white transition-colors">
              Legal & ToS
            </a>
            <a
              href={siteConfig.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Discord
            </a>
            <a
              href={siteConfig.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              YouTube
            </a>
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Instagram
            </a>
            <button
              type="button"
              onClick={() => {
                setWorkspaceInitialTab('discount');
                setWorkspaceOpen(true);
              }}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-300"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Admin Login (2 Users)</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Multi-Gateway Checkout Modal (Stripe / PayPal / Razorpay UPI + Dynamic Admin Coupons) */}
      <CheckoutModal
        plan={selectedPlanForCheckout}
        currency={currency}
        coupons={coupons}
        onClose={() => setSelectedPlanForCheckout(null)}
        userEmail={currentUser?.email}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Protected 2-Admin Console (Requires Gmail + Password Login) */}
      <AdminAnalyticsWorkspace
        open={workspaceOpen}
        initialTab={workspaceInitialTab}
        onClose={() => setWorkspaceOpen(false)}
        plans={plans}
        onSavePlan={handleSavePlan}
        onDeletePlan={handleDeletePlan}
        siteConfig={siteConfig}
        onSaveSiteConfig={handleSaveSiteConfig}
        discountOffer={discountOffer}
        discountPercent={discountPercent}
        onSaveDiscountOffer={handleSaveDiscountOffer}
        coupons={coupons}
        onCreateCoupon={handleCreateCoupon}
        onDeleteCoupon={handleDeleteCoupon}
        supportTickets={supportTickets}
        onUpdateSupportTicket={handleUpdateSupportTicket}
        orders={orders}
        onAdminSessionChange={setIsAdminSessionUnlocked}
      />
    </div>
  );
}
