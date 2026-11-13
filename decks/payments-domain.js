registerDeck({
  id: "payments-domain",
  title: "Payments & PayPay context",
  description: "Payment system design and company knowledge",
  cards: [
    {
      q: "What is PayPay and what do you know about its scale and tech? (verify numbers before the interview)",
      a: `- Japan's leading **QR/barcode mobile payment** app, launched in 2018 as a SoftBank / Yahoo Japan (now LY Corp) joint venture.
- Tens of millions of registered users (70M+ reported recently — check the latest figure on paypay.ne.jp) and millions of merchant locations.
- Services beyond payments: P2P transfers, bills, PayPay Card, bank, securities, points, mini-apps.
- Engineering: very international teams working in English, cloud-based **microservices** (Java/Kotlin backends, React front-ends, Kafka-style event streaming), heavy focus on reliability during big campaigns.
Prepare a "why PayPay" answer linking your experience to scale + product impact.`,
    },
    {
      q: "Design a P2P money transfer (send money to a friend).",
      a: `Requirements: no money created or lost, no double send, low latency, audit trail.
- API: \`POST /transfers\` with **idempotency key**.
- **Double-entry ledger**: each transfer = debit sender + credit receiver in one ACID transaction; balance derived from or checked against entries.
- Concurrency: row-level lock / optimistic version on the sender's balance; consistent lock order to avoid deadlocks; balance check inside the transaction.
- Status state machine: \`CREATED → PROCESSING → SUCCEEDED | FAILED\`.
- Publish events via **outbox** → notifications, history, fraud analytics.
- Fraud & limits checks before commit; risk scoring async for post-hoc review.
- Reconciliation jobs comparing ledger vs balances.`,
    },
    {
      q: "Design a QR code merchant payment flow (customer scans merchant QR).",
      a: `1. Customer app scans static/dynamic QR → resolves merchant & amount.
2. Client calls \`POST /payments\` with idempotency key; server authorises: user auth, risk/fraud checks, limits, funding source (balance, card, bank).
3. Ledger transaction: debit user, credit merchant (pending settlement), fees.
4. Return result quickly; notify merchant (push / webhook / POS polling) — merchant confirmation screen must be trustworthy.
5. Async: points/cashback, receipts, analytics via events.
6. Settlement & payouts to merchants in batches; reconciliation with banks.
Edge cases: timeout but money moved (client queries status with the same key), refunds/partial refunds, offline merchants, campaign spikes.`,
    },
    {
      q: "What is a double-entry ledger and why do payment systems use it?",
      a: `Every movement is recorded as entries in at least two accounts whose sum is **zero** (debits = credits). Entries are **append-only/immutable**; corrections are new reversing entries.
Benefits: auditability, easy reconciliation, detects bugs (books must balance), supports complex flows (fees, escrow, refunds).
Balances can be materialised for speed but must be reconcilable with entries.`,
    },
    {
      q: "How do you prevent double charging?",
      a: `- Client: disable button after tap, generate the **idempotency key once per user intent** and reuse it on retries.
- Server: unique constraint on idempotency key; return stored result on replay.
- Downstream calls to acquirers/banks also with idempotency/reference ids.
- Consumers of events dedupe by event id.
- If status unknown after timeout: **query status**, never blindly re-charge.
- Reconciliation detects anything that slips through.`,
    },
    {
      q: "Cashback campaign: design a system that grants points to millions of users fairly with a budget cap.",
      a: `- Campaign config service (rules, eligibility, budget, period).
- Payment events → Kafka → campaign consumers evaluate rules asynchronously (don't slow down the payment path).
- **Budget cap**: atomic counter (Redis \`DECRBY\` with Lua, or DB row with sharded counters) — reserve budget before granting; handle over-allocation with reconciliation.
- Idempotent grants keyed by (campaign, payment id).
- Per-user limits; anti-fraud (multi-account abuse).
- Points granted to a ledger, possibly with a delay (anti-fraud / refunds clawback).
- Load test for the launch spike; feature flag kill switch.`,
    },
    {
      q: "Strong vs eventual consistency: which parts of a wallet app need which?",
      a: `Strong: balance, ledger, payment status, limits, idempotency records.
Eventual: transaction history feed, notifications, analytics, search, point balance display (with "updating…" state), recommendations.
UI implication: show authoritative status for money, tolerate lag elsewhere with clear pending states.`,
    },
    {
      q: "Security and compliance topics to mention for a fintech.",
      a: `- **PCI DSS** for card data (tokenisation, never store PAN/CVV in your systems)
- Strong customer auth, device binding, biometric, session management
- Encryption in transit and at rest, KMS/HSM, secret rotation
- AML/KYC (eKYC in Japan), transaction monitoring, fraud detection (rules + ML)
- Audit logs, least privilege, data residency, personal information protection (APPI in Japan)
- Secure SDLC: threat modelling, code review, dependency scanning, pen tests.`,
    },
  ],
});
