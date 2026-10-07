// ============================================================
// RAZORPAY — PRODUCTION-SAFE INTEGRATION
// ============================================================

const RAZORPAY_KEY_ID = (process.env.RAZORPAY_KEY_ID || '').trim();
const RAZORPAY_KEY_SECRET = (process.env.RAZORPAY_KEY_SECRET || '').trim();
const RAZORPAY_WEBHOOK_SECRET = (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();

// IMPORTANT:
// Prices are controlled by the server.
// Never trust priceInr coming from the browser.
const RAZORPAY_PLAN_PRICES: Record<string, number> = {
  budget_pro: 69,
  budget_max: 129,
  budget_titan: 199,
  budget_sudopodia: 279,
  budget_infinity: 349,
  budget_omega: 449,

  premium_elite: 399,
  premium_elite_plus: 499,
  premium_enterprise: 649,
  premium_enterprise_plus: 799,
  premium_titan: 1299,
  premium_titan_max: 2499,

  exclusive_core: 1499,
  exclusive_matrix: 2799,
  exclusive_apex: 4999,

  bot_starter: 29,
  bot_pro: 59,
  bot_cluster: 119,

  vps_starter: 149,
  vps_micro: 299,
  vps_macro: 499,
  vps_mega: 749,
  vps_large: 999,
  vps_ultra: 1499,
  vps_titan: 1999,

  domain_in: 449,
  domain_com: 899,
  domain_gg: 1299,
};

interface PendingRazorpayOrder {
  planId: string;
  amountPaise: number;
  finalAmountInr: number;
  createdAt: number;
}

const pendingRazorpayOrders =
  new Map<string, PendingRazorpayOrder>();

const processedRazorpayEvents =
  new Set<string>();

function getPlanPrice(planId: unknown) {
  const id = String(planId || '').trim();
  const price = RAZORPAY_PLAN_PRICES[id];

  if (!Number.isSafeInteger(price) || price <= 0) {
    return null;
  }

  return {
    id,
    price,
  };
}

function getCouponDiscount(promoCode: unknown) {
  const code = String(promoCode || '')
    .trim()
    .toUpperCase();

  const coupon = serverCoupons.find(
    (c) => c.code === code
  );

  return {
    code,
    discountPercent: coupon?.discountPercent || 0,
  };
}

function razorpayAuth() {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return '';
  }

  return (
    'Basic ' +
    Buffer.from(
      RAZORPAY_KEY_ID +
        ':' +
        RAZORPAY_KEY_SECRET
    ).toString('base64')
  );
}

async function razorpayRequest(
  url: string,
  options: RequestInit = {}
) {
  const auth = razorpayAuth();

  if (!auth) {
    throw new Error(
      'Razorpay server credentials are not configured.'
    );
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await response
    .json()
    .catch(() => ({}));

  return {
    response,
    data,
  };
}

function safeEqualHex(
  a: string,
  b: string
) {
  if (
    !a ||
    !b ||
    a.length !== b.length ||
    !/^[0-9a-f]+$/i.test(a) ||
    !/^[0-9a-f]+$/i.test(b)
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(a, 'hex'),
    Buffer.from(b, 'hex')
  );
}


// ============================================================
// RAZORPAY CONFIG
// ============================================================

app.get('/api/razorpay/config', (_req, res) => {
  const configured = Boolean(
    RAZORPAY_KEY_ID &&
      RAZORPAY_KEY_SECRET &&
      (
        RAZORPAY_KEY_ID.startsWith('rzp_live_') ||
        RAZORPAY_KEY_ID.startsWith('rzp_test_')
      )
  );

  res.json({
    configured,
    hasOrderSecret: configured,

    // Only public Key ID is returned.
    // NEVER return RAZORPAY_KEY_SECRET.
    keyId: configured
      ? RAZORPAY_KEY_ID
      : null,

    mode: RAZORPAY_KEY_ID.startsWith('rzp_live_')
      ? 'live'
      : RAZORPAY_KEY_ID.startsWith('rzp_test_')
        ? 'test'
        : 'unconfigured',
  });
});


// ============================================================
// CREATE RAZORPAY ORDER
// ============================================================

app.post(
  '/api/razorpay/create-order',
  async (req, res) => {
    try {
      if (
        !RAZORPAY_KEY_ID ||
        !RAZORPAY_KEY_SECRET
      ) {
        res.status(503).json({
          error:
            'Razorpay server credentials are not configured.',
        });
        return;
      }

      const {
        planId,
        promoCode,
        serverHostname,
      } = req.body;

      // NEVER accept priceInr from browser.
      const plan = getPlanPrice(planId);

      if (!plan) {
        res.status(400).json({
          error:
            'Invalid or unavailable plan.',
        });
        return;
      }

      const coupon =
        getCouponDiscount(promoCode);

      const finalAmountInr = Math.max(
        1,
        Math.round(
          plan.price *
            (1 -
              coupon.discountPercent / 100)
        )
      );

      const amountPaise =
        finalAmountInr * 100;

      const receipt =
        'arx_' +
        Date.now() +
        '_' +
        crypto
          .randomBytes(3)
          .toString('hex');

      const {
        response: rzpResponse,
        data: rzpData,
      } = await razorpayRequest(
        'https://api.razorpay.com/v1/orders',
        {
          method: 'POST',

          body: JSON.stringify({
            amount: amountPaise,
            currency: 'INR',
            receipt,

            notes: {
              planId: plan.id,

              serverHostname:
                String(
                  serverHostname ||
                    'play.areexcloud.site'
                ).slice(0, 100),

              promoCode: coupon.code,
            },
          }),
        }
      );

      if (
        !rzpResponse.ok ||
        !rzpData.id
      ) {
        res.status(400).json({
          error:
            rzpData?.error?.description ||
            'Failed to create Razorpay order.',
        });

        return;
      }

      // Save trusted server-side order information.
      pendingRazorpayOrders.set(
        String(rzpData.id),
        {
          planId: plan.id,
          amountPaise,
          finalAmountInr,
          createdAt: Date.now(),
        }
      );

      res.json({
        orderId: String(rzpData.id),
        amountPaise,
        finalAmountInr,
        currency: 'INR',

        // Public key only.
        keyId: RAZORPAY_KEY_ID,

        planId: plan.id,
      });
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : 'Razorpay order creation failed',
      });
    }
  }
);


// ============================================================
// VERIFY PAYMENT
// ============================================================

app.post(
  '/api/razorpay/verify-payment',
  async (req, res) => {
    try {
      if (!RAZORPAY_KEY_SECRET) {
        res.status(503).json({
          error:
            'Razorpay server credentials are not configured.',
        });

        return;
      }

      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,

        planId,
        planName,
        category,
        serverHostname,
        datacenterNode,
        customerEmail,
      } = req.body;

      const orderId =
        String(
          razorpay_order_id || ''
        );

      const paymentId =
        String(
          razorpay_payment_id || ''
        );

      const signature =
        String(
          razorpay_signature || ''
        );

      // Order must have been created by OUR server.
      const pending =
        pendingRazorpayOrders.get(
          orderId
        );

      if (
        !orderId ||
        !paymentId ||
        !signature ||
        !pending
      ) {
        res.status(400).json({
          error:
            'Invalid, expired, or unknown Razorpay order.',
        });

        return;
      }

      // --------------------------------------------------------
      // 1. Verify Razorpay signature
      // --------------------------------------------------------

      const expectedSignature =
        crypto
          .createHmac(
            'sha256',
            RAZORPAY_KEY_SECRET
          )
          .update(
            orderId +
              '|' +
              paymentId
          )
          .digest('hex');

      if (
        !safeEqualHex(
          expectedSignature,
          signature
        )
      ) {
        res.status(400).json({
          error:
            'Razorpay payment signature verification failed.',
        });

        return;
      }

      // --------------------------------------------------------
      // 2. Ask Razorpay directly for order
      // --------------------------------------------------------

      const {
        response: orderResponse,
        data: orderData,
      } = await razorpayRequest(
        'https://api.razorpay.com/v1/orders/' +
          encodeURIComponent(orderId)
      );

      // --------------------------------------------------------
      // 3. Ask Razorpay directly for payment
      // --------------------------------------------------------

      const {
        response: paymentResponse,
        data: paymentData,
      } = await razorpayRequest(
        'https://api.razorpay.com/v1/payments/' +
          encodeURIComponent(paymentId)
      );

      // --------------------------------------------------------
      // 4. Verify EVERYTHING
      // --------------------------------------------------------

      const amountMatches =
        Number(orderData?.amount) ===
          pending.amountPaise &&
        Number(paymentData?.amount) ===
          pending.amountPaise;

      const paymentBelongsToOrder =
        String(
          paymentData?.order_id || ''
        ) === orderId;

      const currencyMatches =
        orderData?.currency === 'INR' &&
        paymentData?.currency === 'INR';

      const captured =
        paymentData?.status ===
        'captured';

      if (
        !orderResponse.ok ||
        !paymentResponse.ok ||
        !amountMatches ||
        !paymentBelongsToOrder ||
        !currencyMatches ||
        !captured
      ) {
        res.status(400).json({
          error:
            'Payment could not be independently verified as captured for this order.',
        });

        return;
      }

      // --------------------------------------------------------
      // 5. Verify plan
      // --------------------------------------------------------

      const plan =
        getPlanPrice(
          pending.planId
        );

      if (
        !plan ||
        plan.id !==
          String(
            planId ||
              pending.planId
          )
      ) {
        res.status(400).json({
          error:
            'Plan verification failed.',
        });

        return;
      }

      // Order has now been successfully verified.
      pendingRazorpayOrders.delete(
        orderId
      );

      // IMPORTANT:
      // Do NOT generate fake IPs, ports or fake
      // Pterodactyl credentials.
      //
      // Real provisioning should happen here
      // through the Pterodactyl API.

      res.json({
        success: true,

        paymentVerified: true,

        provisioningRequired: true,

        transactionId: paymentId,

        orderId,

        planId: plan.id,

        planName:
          String(
            planName ||
              plan.id
          ),

        category:
          String(
            category ||
              'premium'
          ),

        baseAmountInr:
          plan.price,

        discountPercent:
          pending.finalAmountInr <
          plan.price
            ? Math.round(
                (
                  1 -
                    pending.finalAmountInr /
                      plan.price
                ) * 100
              )
            : 0,

        finalAmountInr:
          pending.finalAmountInr,

        paymentMethod:
          'razorpay',

        serverHostname:
          String(
            serverHostname ||
              'play.areexcloud.site'
          ),

        datacenterNode:
          String(
            datacenterNode ||
              'Mumbai IN-West-1'
          ),

        customerEmail:
          String(
            customerEmail || ''
          ),

        credentials: null,

        message:
          'Payment verified. Connect Pterodactyl provisioning before issuing real server credentials.',
      });
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : 'Razorpay verification failed',
      });
    }
  }
);


// ============================================================
// RAZORPAY WEBHOOK
// ============================================================

app.post(
  '/api/razorpay/webhook',
  (req, res) => {
    try {
      if (
        !RAZORPAY_WEBHOOK_SECRET
      ) {
        res.status(503).json({
          error:
            'Razorpay webhook secret is not configured.',
        });

        return;
      }

      const rawBody =
        Buffer.isBuffer(req.body)
          ? req.body
          : Buffer.from('');

      const receivedSignature =
        String(
          req.headers[
            'x-razorpay-signature'
          ] || ''
        );

      const expectedSignature =
        crypto
          .createHmac(
            'sha256',
            RAZORPAY_WEBHOOK_SECRET
          )
          .update(rawBody)
          .digest('hex');

      if (
        !safeEqualHex(
          expectedSignature,
          receivedSignature
        )
      ) {
        res.status(400).json({
          error:
            'Invalid Razorpay webhook signature.',
        });

        return;
      }

      const eventId =
        String(
          req.headers[
            'x-razorpay-event-id'
          ] || ''
        );

      // Prevent duplicate webhook processing.
      if (
        eventId &&
        processedRazorpayEvents.has(
          eventId
        )
      ) {
        res.json({
          received: true,
          duplicate: true,
        });

        return;
      }

      if (eventId) {
        processedRazorpayEvents.add(
          eventId
        );
      }

      const event =
        JSON.parse(
          rawBody.toString('utf8')
        );

      console.log(
        '[Razorpay webhook]',
        event?.event || 'unknown'
      );

      // Later:
      // order.paid
      // payment.captured
      // payment.failed
      //
      // can trigger Pterodactyl provisioning.

      res.json({
        received: true,
      });
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : 'Invalid Razorpay webhook payload',
      });
    }
  }
);
