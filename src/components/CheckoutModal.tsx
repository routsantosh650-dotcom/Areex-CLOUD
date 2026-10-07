import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Copy,
  Check,
  Smartphone,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import {
  HostingPlanItem,
  CurrencyCode,
  CouponItem,
  INITIAL_COUPONS,
  formatPriceInCurrency,
} from '../data/areexData';

export interface ProvisionedOrderRecord {
  id: string;
  transactionId: string;
  planId: string;
  planName: string;
  category: string;
  amountInr: number;
  paymentMethod: 'stripe' | 'paypal' | 'razorpay_upi';
  serverHostname: string;
  datacenterNode: 'Mumbai IN-West-1' | 'Noida IN-North-1' | 'Singapore SG-1';
  encryptedCredentials: string;
  encryptionIv: string;
  hmacSignature: string;
  credentials: {
    serverUsername: string;
    serverPassword: string;
    dedicatedEndpoint: string;
    sftpAddress: string;
    rconToken: string;
  };
  status: 'active' | 'provisioning' | 'completed';
  createdAtIso: string;
}

interface CheckoutModalProps {
  plan: HostingPlanItem | null;
  currency: CurrencyCode;
  coupons?: CouponItem[];
  onClose: () => void;
  userEmail?: string | null;
  onOrderCompleted: (order: ProvisionedOrderRecord) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  plan,
  currency,
  coupons = INITIAL_COUPONS,
  onClose,
  userEmail,
  onOrderCompleted,
}) => {
  const [serverHostname, setServerHostname] = useState('play.areexsmp.in');
  const [datacenterNode, setDatacenterNode] = useState<
    'Mumbai IN-West-1' | 'Noida IN-North-1' | 'Singapore SG-1'
  >('Mumbai IN-West-1');
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoFeedback, setPromoFeedback] = useState<string | null>(null);

  const [customerEmail, setCustomerEmail] = useState(
    userEmail || 'gamer@areexcloud.site'
  );
  const [customerPhone, setCustomerPhone] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<ProvisionedOrderRecord | null>(null);
  const [decryptedVerifyText, setDecryptedVerifyText] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!plan) return null;

  const discountedPriceInr = Math.max(
    1,
    Math.round(plan.priceInr * (1 - appliedDiscount / 100))
  );

  const handleApplyPromo = (customCode?: string) => {
    const code = (customCode ?? promoCode).trim().toUpperCase();
    if (!code) {
      setAppliedDiscount(0);
      setPromoFeedback('Enter a valid coupon code');
      return;
    }
    const matched = coupons.find((c) => c.code.toUpperCase() === code);
    if (matched) {
      setPromoCode(matched.code);
      setAppliedDiscount(matched.discountPercent);
      setPromoFeedback(
        `${matched.code} applied: ${matched.discountPercent}% OFF (${matched.description})`
      );
    } else {
      setAppliedDiscount(0);
      setPromoFeedback(
        `Invalid code "${code}". Available codes: ${coupons.map((c) => c.code).join(', ')}`
      );
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as unknown as { Razorpay?: unknown }).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedHost = serverHostname.trim();
    if (trimmedHost.length < 3 || trimmedHost.length > 100) {
      setErrorMsg('Server hostname must be between 3 and 100 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const LIVE_KEY_FALLBACK = 'rzp_live_TkinQdreXQa5Ww';
      const envKeyId = (
        (import.meta as unknown as { env?: Record<string, string> }).env
          ?.VITE_RAZORPAY_KEY_ID || ''
      ).trim();

      const cfgRes = await fetch('/api/razorpay/config')
        .then((r) => (r.ok ? r.json() : { configured: false }))
        .catch(() => ({ configured: false }));

      const activeKeyId: string =
        cfgRes.configured && cfgRes.keyId
          ? cfgRes.keyId
          : envKeyId.startsWith('rzp_')
            ? envKeyId
            : LIVE_KEY_FALLBACK;

      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        throw new Error(
          'Unable to load official Razorpay Checkout SDK (checkout.razorpay.com). Please check your internet connection or adblocker.'
        );
      }

      let serverOrderId: string | undefined;
      let serverAmountPaise = discountedPriceInr * 100;

      if (cfgRes.hasOrderSecret) {
        try {
          const orderRes = await fetch('/api/razorpay/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              planId: plan.id,
              priceInr: plan.priceInr,
              promoCode: promoCode.trim(),
              serverHostname: trimmedHost,
            }),
          });

          const orderData = await orderRes.json().catch(() => ({}));
          if (orderRes.ok && orderData.orderId) {
            serverOrderId = orderData.orderId;
            serverAmountPaise = orderData.amountPaise || serverAmountPaise;
          }
        } catch {
          // Proceed with direct live Key ID checkout if order endpoint is unreachable
        }
      }

      type RazorpaySuccessResponse = {
        razorpay_order_id?: string;
        razorpay_payment_id?: string;
        razorpay_signature?: string;
      };

      type RazorpayInstance = {
        open: () => void;
        on?: (
          event: string,
          callback: (err: { error?: { description?: string } }) => void
        ) => void;
      };

      type RazorpayConstructor = new (
        options: Record<string, unknown>
      ) => RazorpayInstance;

      const RazorpayWin = (
        window as unknown as { Razorpay: RazorpayConstructor }
      ).Razorpay;

      const rzpOptions: Record<string, unknown> = {
        key: activeKeyId,
        amount: serverAmountPaise,
        currency: 'INR',
        name: 'Areex Cloud',
        description: `${plan.name} (${plan.ram} · ${plan.cpu})`,
        prefill: {
          email: customerEmail.trim() || 'gamer@areexcloud.site',
          contact: customerPhone.trim() || undefined,
        },
        theme: {
          color: '#dc2626',
        },
        handler: async (rzpResp: RazorpaySuccessResponse) => {
          // Strictly require a real razorpay_payment_id from Razorpay
          if (!rzpResp || !rzpResp.razorpay_payment_id) {
            setErrorMsg('Payment was not completed on Razorpay.');
            setSubmitting(false);
            return;
          }

          try {
            if (
              serverOrderId &&
              rzpResp.razorpay_order_id &&
              rzpResp.razorpay_signature
            ) {
              const verifyRes = await fetch('/api/razorpay/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: rzpResp.razorpay_order_id,
                  razorpay_payment_id: rzpResp.razorpay_payment_id,
                  razorpay_signature: rzpResp.razorpay_signature,
                  planId: plan.id,
                  planName: plan.name,
                  category: plan.category,
                  priceInr: plan.priceInr,
                  serverHostname: trimmedHost,
                  datacenterNode,
                  promoCode: promoCode.trim(),
                  customerEmail: customerEmail.trim(),
                }),
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) {
                setErrorMsg(
                  verifyData.error || 'Razorpay payment signature verification failed.'
                );
                setSubmitting(false);
                return;
              }

              const orderRecord: ProvisionedOrderRecord = {
                id: `ord_${Date.now()}`,
                transactionId: verifyData.transactionId,
                planId: plan.id,
                planName: plan.name,
                category: plan.category,
                amountInr: verifyData.finalAmountInr,
                paymentMethod: 'razorpay_upi',
                serverHostname: trimmedHost,
                datacenterNode,
                encryptedCredentials: verifyData.encryptedCredentials,
                encryptionIv: verifyData.encryptionIv,
                hmacSignature: verifyData.hmacSignature,
                credentials: verifyData.credentials,
                status: 'active',
                createdAtIso: new Date().toISOString(),
              };
              setCompletedOrder(orderRecord);
              onOrderCompleted(orderRecord);
              return;
            }

            // If using client-side Key ID mode, provision only after real razorpay_payment_id is received
            const procRes = await fetch('/api/checkout/process', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                planId: plan.id,
                planName: plan.name,
                category: plan.category,
                priceInr: plan.priceInr,
                paymentMethod: 'razorpay_upi',
                serverHostname: trimmedHost,
                datacenterNode,
                promoCode: promoCode.trim(),
                customerEmail: customerEmail.trim(),
              }),
            });

            if (!procRes.ok) {
              throw new Error('Failed to provision server after Razorpay payment.');
            }
            const procData = await procRes.json();
            const orderRecord: ProvisionedOrderRecord = {
              id: `ord_${Date.now()}`,
              transactionId: rzpResp.razorpay_payment_id,
              planId: plan.id,
              planName: plan.name,
              category: plan.category,
              amountInr: procData.finalAmountInr || discountedPriceInr,
              paymentMethod: 'razorpay_upi',
              serverHostname: trimmedHost,
              datacenterNode,
              encryptedCredentials: procData.encryptedCredentials,
              encryptionIv: procData.encryptionIv,
              hmacSignature: procData.hmacSignature,
              credentials: procData.credentials,
              status: 'active',
              createdAtIso: new Date().toISOString(),
            };
            setCompletedOrder(orderRecord);
            onOrderCompleted(orderRecord);
          } catch (err) {
            setErrorMsg(
              err instanceof Error ? err.message : 'Payment verification failed.'
            );
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setErrorMsg('Payment cancelled by user. Server was not provisioned.');
          },
        },
      };

      if (serverOrderId) {
        rzpOptions.order_id = serverOrderId;
      }

      const rzp = new RazorpayWin(rzpOptions);
      if (rzp.on) {
        rzp.on('payment.failed', (resp) => {
          setSubmitting(false);
          setErrorMsg(
            resp?.error?.description ||
              'Razorpay payment failed. Please try again with valid UPI or card details.'
          );
        });
      }
      rzp.open();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to launch Razorpay.');
      setSubmitting(false);
    }
  };

  const handleVerifyAES256Decryption = async () => {
    if (!completedOrder) return;
    try {
      const res = await fetch('/api/security/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ciphertext: completedOrder.encryptedCredentials,
          iv: completedOrder.encryptionIv,
        }),
      });
      const data = await res.json();
      if (data.verified) {
        setDecryptedVerifyText('AES-256-GCM Auth Tag Verified · Zero Tampering Detected');
      }
    } catch {
      setDecryptedVerifyText('Verification failed');
    }
  };

  const copyValue = (key: string, val: string) => {
    navigator.clipboard?.writeText(val);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1600);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative my-auto w-full max-w-3xl rounded-2xl border border-white/10 bg-[#11090d] p-4 sm:p-8 text-slate-100 shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between border-b border-white/10 pb-5">
          <div>
            <p className="font-mono text-xs text-red-400">
              OFFICIAL RAZORPAY GATEWAY · INSTANT SERVER DEPLOYMENT
            </p>
            <h2
              id="checkout-modal-title"
              className="mt-1 font-display text-xl sm:text-2xl font-bold tracking-tight text-white"
            >
              {completedOrder
                ? `Server Provisioned: ${completedOrder.planName}`
                : `Deploy ${plan.name} (${plan.category.toUpperCase()})`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Checkout Modal"
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400 transition-colors hover:border-red-500/40 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!completedOrder ? (
          <form onSubmit={handleCheckoutSubmit} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-7">
              <div>
                <label
                  htmlFor="server-hostname-input"
                  className="block text-xs font-medium text-slate-300"
                >
                  Server Hostname / Custom Address
                </label>
                <input
                  id="server-hostname-input"
                  type="text"
                  required
                  value={serverHostname}
                  onChange={(e) => setServerHostname(e.target.value)}
                  placeholder="play.yourserver.in"
                  className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#090608] px-3.5 py-2.5 font-mono text-sm text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Select Datacenter Node
                </label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {(
                    [
                      { name: 'Mumbai IN-West-1', ping: '4ms' },
                      { name: 'Noida IN-North-1', ping: '9ms' },
                      { name: 'Singapore SG-1', ping: '28ms' },
                    ] as const
                  ).map((node) => (
                    <button
                      key={node.name}
                      type="button"
                      onClick={() => setDatacenterNode(node.name)}
                      className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                        datacenterNode === node.name
                          ? 'border-red-500 bg-red-600/15 text-white'
                          : 'border-white/10 bg-[#090608] text-slate-400 hover:border-white/25 hover:text-slate-200'
                      }`}
                    >
                      <div className="truncate text-xs font-semibold">
                        {node.name.split(' ')[0]}
                      </div>
                      <div className="font-mono text-[11px] text-red-400 tabular-nums">
                        {node.ping} ping
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="customer-email-input"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Billing Email (for Panel Login)
                  </label>
                  <input
                    id="customer-email-input"
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#090608] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="customer-phone-input"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Phone / WhatsApp (for Razorpay UPI)
                  </label>
                  <input
                    id="customer-phone-input"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#090608] px-3.5 py-2.5 font-mono text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Single Exclusive Payment Gateway: Razorpay Only */}
              <div className="rounded-xl border border-red-500/40 bg-[#090608] p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white">
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        Razorpay Secure Payment Gateway
                      </div>
                      <div className="font-mono text-[11px] text-slate-400">
                        Direct redirect to official Razorpay checkout on clicking Pay
                      </div>
                    </div>
                  </div>
                  <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400 shrink-0">
                    RAZORPAY ONLY
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-white/10 pt-3 font-mono text-[10px] text-slate-300">
                  <span className="rounded bg-white/5 px-2 py-1">Google Pay</span>
                  <span className="rounded bg-white/5 px-2 py-1">PhonePe</span>
                  <span className="rounded bg-white/5 px-2 py-1">Paytm</span>
                  <span className="rounded bg-white/5 px-2 py-1">BHIM UPI QR</span>
                  <span className="rounded bg-white/5 px-2 py-1">RuPay / Visa / MC</span>
                  <span className="rounded bg-white/5 px-2 py-1">NetBanking</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#090608] p-5 lg:col-span-5">
              <div>
                <h3 className="font-display text-base font-bold text-white">
                  Hardware Allocation Summary
                </h3>
                <p className="mt-1 text-xs text-slate-400">{plan.tagline}</p>

                <dl className="mt-4 space-y-2.5 border-y border-white/10 py-4 text-xs">
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-400">Memory</dt>
                    <dd className="font-mono text-white tabular-nums">{plan.ram}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-400">Compute</dt>
                    <dd className="font-mono text-white tabular-nums">{plan.cpu}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-400">NVMe Storage</dt>
                    <dd className="font-mono text-white tabular-nums">{plan.storage}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-400">Network / Platform</dt>
                    <dd className="font-mono text-white tabular-nums">{plan.speed}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-400">Node Location</dt>
                    <dd className="font-mono text-red-400">{datacenterNode}</dd>
                  </div>
                </dl>

                <div className="mt-4">
                  <label htmlFor="promo-code-input" className="block text-[11px] text-slate-400">
                    Coupon / Promo Code
                  </label>
                  <div className="mt-1 flex gap-2">
                    <input
                      id="promo-code-input"
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter Coupon Code"
                      className="w-full min-w-0 rounded-lg border border-white/10 bg-[#140c10] px-3 py-1.5 font-mono text-xs text-white uppercase focus:border-red-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyPromo()}
                      className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:border-red-500/50 whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </div>
                  {coupons.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-slate-500">Active Coupons:</span>
                      {coupons.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => handleApplyPromo(c.code)}
                          className="rounded border border-red-500/30 bg-red-600/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-red-400 hover:bg-red-600 hover:text-white"
                        >
                          {c.code} (-{c.discountPercent}%)
                        </button>
                      ))}
                    </div>
                  )}
                  {promoFeedback && (
                    <p className="mt-1.5 font-mono text-[11px] text-emerald-400">{promoFeedback}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Total Due Today</span>
                  <div className="text-right">
                    {appliedDiscount > 0 && (
                      <span className="mr-2 font-mono text-xs text-slate-500 line-through tabular-nums">
                        {formatPriceInCurrency(plan.priceInr, currency)}
                      </span>
                    )}
                    <span className="font-mono text-2xl font-bold text-white tabular-nums">
                      {formatPriceInCurrency(discountedPriceInr, currency)}
                    </span>
                    <span className="font-mono text-xs text-slate-400">{plan.billingPeriod}</span>
                  </div>
                </div>

                {errorMsg && (
                  <div
                    role="alert"
                    className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/60 p-3 text-xs text-red-200"
                  >
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_25px_rgba(220,38,38,0.4)] transition-colors hover:bg-red-500 disabled:opacity-50 whitespace-nowrap"
                >
                  <Lock className="h-4 w-4" />
                  <span>
                    {submitting
                      ? 'Opening Razorpay Gateway...'
                      : `Pay ₹${discountedPriceInr} with Razorpay`}
                  </span>
                </button>

                <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>100% Verified Razorpay Checkout · Instant Provisioning</span>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Server Active on {completedOrder.datacenterNode}
                  </h3>
                  <p className="font-mono text-xs text-slate-300">
                    Razorpay Payment ID: {completedOrder.transactionId} · Paid ₹
                    {completedOrder.amountInr}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-[#090608] p-4">
                <div className="text-xs text-slate-400">Dedicated Server Endpoint</div>
                <div className="mt-1 flex items-center justify-between font-mono text-sm text-white">
                  <span>{completedOrder.credentials.dedicatedEndpoint}</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyValue('endpoint', completedOrder.credentials.dedicatedEndpoint)
                    }
                    aria-label="Copy Dedicated Server Endpoint"
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedField === 'endpoint' ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#090608] p-4">
                <div className="text-xs text-slate-400">Server Admin Username</div>
                <div className="mt-1 flex items-center justify-between font-mono text-sm text-white">
                  <span>{completedOrder.credentials.serverUsername}</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyValue('username', completedOrder.credentials.serverUsername)
                    }
                    aria-label="Copy Server Username"
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedField === 'username' ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#090608] p-4">
                <div className="text-xs text-slate-400">One-Time Encrypted Password</div>
                <div className="mt-1 flex items-center justify-between font-mono text-sm text-red-400">
                  <span>{completedOrder.credentials.serverPassword}</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyValue('password', completedOrder.credentials.serverPassword)
                    }
                    aria-label="Copy Server Password"
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedField === 'password' ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#090608] p-4">
                <div className="text-xs text-slate-400">SFTP Address</div>
                <div className="mt-1 flex items-center justify-between font-mono text-sm text-white">
                  <span className="truncate">{completedOrder.credentials.sftpAddress}</span>
                  <button
                    type="button"
                    onClick={() => copyValue('sftp', completedOrder.credentials.sftpAddress)}
                    aria-label="Copy SFTP Address"
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedField === 'sftp' ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#090608] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
                  <KeyRound className="h-4 w-4 text-red-500" />
                  <span>AES-256-GCM Encrypted Database Payload</span>
                </div>
                <button
                  type="button"
                  onClick={handleVerifyAES256Decryption}
                  className="rounded-md border border-red-500/40 bg-red-600/15 px-3 py-1 text-xs font-medium text-red-300 hover:bg-red-600/25 hover:text-white whitespace-nowrap"
                >
                  Verify AES-256 Auth Tag
                </button>
              </div>
              <p className="mt-2 break-all font-mono text-[11px] text-slate-400">
                IV: {completedOrder.encryptionIv} · Ciphertext:{' '}
                {completedOrder.encryptedCredentials.slice(0, 96)}...
              </p>
              {decryptedVerifyText && (
                <p className="mt-2 font-mono text-xs text-emerald-400">{decryptedVerifyText}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
