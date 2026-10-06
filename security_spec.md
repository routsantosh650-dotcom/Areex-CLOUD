# Phase 0: Payload-First Security TDD Specification (`security_spec.md`)

## 1. Data Invariants

1. **Default-Deny Catch-All**: Every path not explicitly matched under `/databases/{database}/documents` is unconditionally denied (`allow read, write: if false;`).
2. **Verified Identity Invariant**: All write operations require an authenticated user with a verified email (`request.auth != null && request.auth.token.email_verified == true`).
3. **Bootstrapped & Registry Admin Gate (`isAdmin()`)**: Admin privileges are granted exclusively when `isSignedIn() && request.auth.token.email_verified == true && (request.auth.token.email == 'routsantosh650@gmail.com' || exists(/databases/$(database)/documents/admins/$(request.auth.uid)))`. Never trust client-supplied role claims.
4. **Path Variable Hardening (`isValidId`)**: All document ID path variables (`planId`, `orderId`, `configId`, `eventId`, `adminId`) on single-document operations (`get`, `create`, `update`, `delete`) must satisfy `id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`.
5. **HostingPlan Invariant (`/plans/{planId}`)**:
   - Publicly readable (`get`, `list`) so visitors can browse plans.
   - Only `isAdmin()` can `create`, `update`, or `delete` plans.
   - `authorId` must equal `request.auth.uid` on creation and is immutable on update.
   - `features` list is strictly bounded (`features.size() >= 1 && features.size() <= 10 && features[0] is string && features[0].size() <= 120`).
   - `createdAt == request.time` on create; `createdAt` is immutable on update; `updatedAt == request.time`.
6. **ServerOrder Invariant (`/orders/{orderId}`)**:
   - Contains AES-256-GCM encrypted credentials (`encryptedCredentials`, `encryptionIv`).
   - Strictly isolated: `get` and `list` are only permitted if `resource.data.userId == request.auth.uid || isAdmin()`.
   - On `create`: `incoming().userId == request.auth.uid`, `incoming().status == 'active' || incoming().status == 'provisioning'`, `createdAt == request.time`, `updatedAt == request.time`.
   - Terminal State Locking on `update`: Once `existing().status == 'completed'`, non-admins cannot perform any further updates.
   - Immutable fields on `update`: `userId`, `planId`, `amountInr`, `encryptedCredentials`, `encryptionIv`, `createdAt` cannot be modified.
7. **SiteConfig Invariant (`/siteConfig/{configId}`)**:
   - Publicly readable (`get`) for rendering navigation and founder copy.
   - Only `isAdmin()` can `create` or `update` `/siteConfig/{configId}`, and `updatedBy == request.auth.uid` with `updatedAt == request.time`.
8. **AnalyticsEvent Invariant (`/analytics/{eventId}`)**:
   - Authenticated verified users can `create` events where `incoming().userId == request.auth.uid` and `incoming().createdAt == request.time`.
   - Events are immutable (no `update` or `delete`).
   - `get` and `list` require `resource.data.userId == request.auth.uid || isAdmin()`.

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 1 (Shadow Field Injection on Order Create)**:
   ```json
   {
     "userId": "user_123",
     "planId": "elite_plus",
     "planName": "Elite Plus",
     "category": "premium",
     "amountInr": 499,
     "paymentMethod": "stripe",
     "serverHostname": "play.areex.in",
     "datacenterNode": "Mumbai IN-West-1",
     "encryptedCredentials": "aes256_ciphertext_payload_valid",
     "encryptionIv": "0123456789abcdef0123456789abcdef",
     "status": "active",
     "isVerifiedAdmin": true
   }
   ```
   *Expected*: `PERMISSION_DENIED` (blocked by `hasOnly` strict key check).

2. **Payload 2 (Identity Spoofing on Order Create)**:
   Authenticated as `attacker_99`, sets `"userId": "victim_01"`.
   *Expected*: `PERMISSION_DENIED` (blocked by `data.userId == request.auth.uid`).

3. **Payload 3 (Unverified Email Admin Spoof)**:
   Authenticated with `email: "routsantosh650@gmail.com"` and `email_verified: false` attempting to create `/plans/plan_1`.
   *Expected*: `PERMISSION_DENIED` (blocked by `request.auth.token.email_verified == true`).

4. **Payload 4 (Terminal State Mutation on Completed Order)**:
   Order has `status: "completed"`. Owner attempts to update `status` back to `"active"`.
   *Expected*: `PERMISSION_DENIED` (blocked by terminal state gate `existing().status != 'completed'`).

5. **Payload 5 (Encrypted Vault Tampering on Order Update)**:
   Owner attempts to update `encryptedCredentials` or `amountInr` on `/orders/order_1`.
   *Expected*: `PERMISSION_DENIED` (blocked by `affectedKeys().hasOnly(['status', 'serverHostname', 'updatedAt'])` and immutability checks).

6. **Payload 6 (Denial-of-Wallet ID Poisoning)**:
   Attempting to create `/orders/bad$id!with/slashes` or a 500-char ID.
   *Expected*: `PERMISSION_DENIED` (blocked by `isValidId(orderId)`).

7. **Payload 7 (Unbounded Array Overflow on HostingPlan)**:
   Admin attempts to create a plan with 25 items in `features`.
   *Expected*: `PERMISSION_DENIED` (blocked by `data.features.size() <= 10`).

8. **Payload 8 (Client Timestamp Forgery)**:
   User sends `createdAt: "2020-01-01T00:00:00Z"` instead of `request.time`.
   *Expected*: `PERMISSION_DENIED` (blocked by `data.createdAt == request.time`).

9. **Payload 9 (Cross-Tenant Order Read / PII Leak)**:
   Authenticated user `user_B` attempts `get` on `/orders/order_owned_by_user_A`.
   *Expected*: `PERMISSION_DENIED` (blocked by `resource.data.userId == request.auth.uid || isAdmin()`).

10. **Payload 10 (Unconstrained List Scraping on Orders)**:
    Authenticated user `user_B` runs an unfiltered `list` query on `/orders`.
    *Expected*: `PERMISSION_DENIED` (blocked by `allow list: if isSignedIn() && (resource.data.userId == request.auth.uid || isAdmin())`).

11. **Payload 11 (Self-Elevation in `/admins/{uid}`)**:
    Regular user attempts to create `/admins/regular_user_uid` with `role: "admin"`.
    *Expected*: `PERMISSION_DENIED` (only existing verified admin can write to `/admins`).

12. **Payload 12 (Value Poisoning on Whitelisted Update Field)**:
    User updates `serverHostname` on `/orders/order_1` with a boolean `true` or a 5,000-character string.
    *Expected*: `PERMISSION_DENIED` (blocked because `isValidServerOrder(incoming())` wraps the `allow update` block).

---

## 3. Security Rules Test Runner (`firestore.rules.test.ts`)

See `/firestore.rules.test.ts` for the complete test suite verifying all 12 adversarial payloads.
