registerDeck({
  id: "system-design",
  title: "System Design",
  description: "Framework, scalability, data, consistency, reliability",
  cards: [
    {
      q: "What framework do you follow in a 45-minute system design interview?",
      a: `1. **Clarify requirements** (5 min): functional, non-functional (latency, availability, consistency, scale), out of scope.
2. **Estimate** (back-of-envelope): users, QPS (peak ≈ 2–10× average), storage, bandwidth.
3. **API design**: main endpoints / events.
4. **Data model** + storage choice.
5. **High-level diagram**: clients → CDN/LB → gateway → services → DB/cache/queue.
6. **Deep dive** on 1–2 hard parts (the interviewer usually picks).
7. **Bottlenecks, failure modes, trade-offs**, monitoring.
Talk out loud, state assumptions, and justify every choice with a trade-off.`,
    },
    {
      q: "Quick back-of-envelope numbers you should know.",
      a: `- 1 day ≈ 86,400 s ≈ 10^5 s. 1M requests/day ≈ 12 QPS.
- 100M requests/day ≈ 1,200 QPS average.
- Latency: L1 ~1ns, RAM ~100ns, SSD random read ~100µs, same-DC round trip ~0.5ms, cross-region ~50–150ms.
- One well-tuned Postgres/MySQL node: thousands–tens of thousands of simple QPS; Redis: ~100k ops/s per node.
- Availability: 99.9% ≈ 8.8h down/year, 99.99% ≈ 53 min/year.`,
    },
    {
      q: "Explain the CAP theorem and PACELC. Which side do payment systems choose?",
      a: `**CAP**: during a network **P**artition you choose **C**onsistency or **A**vailability.
**PACELC**: else (no partition) trade **L**atency vs **C**onsistency.
Payments: the **ledger/balance** is CP — never double-spend; better to reject or queue than to be wrong. Peripheral features (history feed, notifications, recommendations) can be AP / eventually consistent. Good answer = split the system by consistency needs.`,
    },
    {
      q: "SQL vs NoSQL: how do you choose?",
      a: `- **Relational** (MySQL, Postgres, Aurora, TiDB): ACID transactions, joins, strong consistency, schema — default for money, orders, users.
- **Key-value / wide-column** (DynamoDB, Cassandra): massive write throughput, predictable latency by key, limited queries.
- **Document** (MongoDB): flexible schema, nested data.
- **Search** (Elasticsearch/OpenSearch), **time-series**, **graph** for specialised queries.
Decide from access patterns, consistency needs, scale, and team expertise. Often polyglot persistence + CDC to sync.`,
    },
    {
      q: "How do you scale a database?",
      a: `In order of complexity:
1. Indexes, query optimisation, connection pooling
2. Vertical scaling
3. **Caching** (Redis) for read-heavy data
4. **Read replicas** (watch replication lag → read-your-writes issues)
5. **Partitioning/sharding** by key (user_id, merchant_id): hash vs range; hotspot risk; cross-shard queries and transactions become hard; resharding with consistent hashing
6. CQRS: separate write model and read models
Or use a distributed SQL DB (TiDB, Spanner, CockroachDB, Aurora).`,
    },
    {
      q: "Caching strategies and the hard parts of caching.",
      a: `Patterns: **cache-aside** (most common), read-through, write-through, write-behind.
Hard parts:
- **Invalidation** & TTLs; stale data tolerance
- **Thundering herd / cache stampede**: request coalescing, locks, jittered TTL, early refresh
- Hot keys: local in-memory cache, replicate key
- Cache penetration (missing keys): cache negatives, bloom filter
Layers: browser/HTTP cache, CDN, API gateway, service in-memory, Redis, DB buffer pool.
Never cache balances as source of truth.`,
    },
    {
      q: "Why use a message queue / event streaming (Kafka)? What guarantees matter?",
      a: `Decouple services, absorb spikes (load levelling), async processing, fan-out, event sourcing/replay.
- Kafka: partitioned log, ordering **per partition** (key by user/payment id), consumer groups, retention & replay.
- Delivery: at-most-once, **at-least-once** (default → consumers must be **idempotent**), exactly-once (Kafka transactions, within limits).
- Handle poison messages with retries + **dead-letter queue**; monitor consumer lag.`,
    },
    {
      q: "What is the transactional outbox pattern and why is it needed?",
      a: `Problem: **dual write** — updating the DB and publishing an event are not atomic; a crash between them loses or duplicates events.
Solution: in the same DB transaction, write the business row **and** an \`outbox\` row. A relay (poller or CDC like Debezium) publishes outbox rows to Kafka and marks them sent.
Gives at-least-once publishing → consumers dedupe by event id (inbox pattern).`,
    },
    {
      q: "Explain the Saga pattern for distributed transactions.",
      a: `Without 2PC, a business transaction spanning services is a sequence of local transactions, each with a **compensating action**.
- **Choreography**: services react to each other's events (simple, but flow is implicit).
- **Orchestration**: a central orchestrator (state machine, e.g. Temporal / Step Functions) drives steps and compensations — easier to reason about and monitor.
Example payment: reserve balance → charge → notify merchant; on failure release the reservation / refund.
Requirements: idempotent steps, persisted saga state, timeouts.`,
    },
    {
      q: "What is idempotency and how do you implement idempotent APIs?",
      a: `Same request applied multiple times = same effect as once. Essential because clients/networks retry.
- Client sends an \`Idempotency-Key\` header (UUID per user action).
- Server stores key → (request hash, status, response) with a unique constraint; on replay returns the stored response; on same key + different payload → 422.
- Handle concurrent duplicates: insert key row first in "processing" state (unique constraint acts as a lock).
- Keep keys for a retention window (e.g. 24h+).
GET/PUT/DELETE are idempotent by design; POST is not.`,
    },
    {
      q: "How do you design a rate limiter?",
      a: `Algorithms: **token bucket** (allows bursts, common), leaky bucket, fixed window (boundary burst issue), sliding window log/counter.
Distributed: Redis with atomic Lua script / \`INCR\`+\`EXPIRE\`; key by user, IP, API key, endpoint.
Where: API gateway / edge. Return **429** with \`Retry-After\`.
Trade-offs: accuracy vs memory; fail-open vs fail-closed if Redis is down (for login/payment abuse → fail-closed or local fallback).`,
    },
    {
      q: "Resilience patterns for microservices.",
      a: `- **Timeouts** on every remote call (never infinite)
- **Retries** with exponential backoff + jitter, only for idempotent ops, with a retry budget
- **Circuit breaker** (stop calling a failing dependency, fail fast)
- **Bulkheads** (isolate thread pools / connection pools)
- **Fallbacks / graceful degradation** (hide recommendations, keep payments)
- Load shedding & backpressure
- Health checks, autoscaling, multi-AZ, chaos testing.`,
    },
    {
      q: "Observability: what do you put in place for a production service?",
      a: `Three pillars + more:
- **Metrics**: RED (rate, errors, duration) for services, USE for resources; SLOs and error budgets (e.g. 99.95% success, p99 < 300ms)
- **Logs**: structured JSON, correlation/trace id, no PII/card data
- **Traces**: OpenTelemetry distributed tracing across services
- Alerting on symptoms (SLO burn rate), not causes; runbooks; on-call
- Front-end: RUM, error tracking (Sentry), web vitals
- Business metrics: payment success rate per method/merchant.`,
    },
    {
      q: "How do you do zero-downtime deployments and database migrations?",
      a: `- Rolling, **blue/green** or **canary** deployments with automatic rollback on SLO regression; feature flags to decouple deploy from release.
- DB migrations with **expand → migrate → contract**: add new column/table (backward compatible), dual-write/backfill, switch reads, then remove old.
- Never deploy a breaking schema change together with code that needs it.
- API versioning & backward-compatible contracts between services/mobile apps (old app versions live for months).`,
    },
    {
      q: "Design a URL shortener / notification service / news feed — which hard parts do you highlight?",
      a: `Common deep dives interviewers look for:
- **ID generation**: Snowflake-like ids (time + machine + sequence), base62; avoid DB auto-increment hotspot.
- **Fan-out**: push (write-time) vs pull (read-time) vs hybrid for celebrities.
- **Notifications**: queue per channel (push/SMS/email), retries, dedup, user preferences, rate limits, templating, delivery tracking.
- Hot partitions, caching, pagination with cursors (not offset).`,
    },
    {
      q: "REST vs GraphQL vs gRPC — when do you use each?",
      a: `- **REST**: simple, cacheable, ubiquitous — public/partner APIs.
- **GraphQL**: client-driven queries, one round trip for complex UIs, BFF for web/mobile; watch N+1 (DataLoader), caching complexity, query cost limits.
- **gRPC**: binary protobuf, HTTP/2 streaming, strong contracts — internal service-to-service.
Also: WebSocket/SSE for real-time updates (payment status, notifications).`,
    },
    {
      q: "How do you handle a sudden 10× traffic spike (e.g. a big campaign)?",
      a: `PayPay is known for huge cashback campaigns — expect this.
- Capacity planning + load tests ahead of time; pre-scale (autoscaling reacts too slowly for step spikes)
- Queue-based load levelling for non-critical work
- Rate limiting / virtual waiting room
- Cache aggressively at CDN/edge for static and campaign pages
- Degrade non-essential features, protect the core payment path with bulkheads
- Feature flags / kill switches; war room with dashboards.`,
    },
  ],
});
