registerDeck({
  id: "frontend-architecture",
  title: "Front-end System Design",
  description: "Architecture at scale: micro-frontends, design systems, BFF, real-time",
  cards: [
    {
      q: "How would you structure a large React codebase for many teams?",
      a: `- **Feature-based** folders (\`features/payments\`, \`features/coupons\`) over type-based (\`components/\`, \`hooks/\`)
- Clear layers: UI components (design system) → feature modules → app shell/routing → data access (API clients)
- Monorepo (Nx/Turborepo/pnpm workspaces) with shared packages, enforced module boundaries, CODEOWNERS
- Shared lint/TS config, generated API types (OpenAPI/GraphQL codegen)
- CI: affected-only builds/tests, preview deployments.`,
    },
    {
      q: "Micro-frontends: when are they worth it, and how are they implemented?",
      a: `Worth it when many autonomous teams need **independent deploys** of parts of one product. Not worth it for a small team (cost: complexity, duplicated deps, inconsistent UX).
Implementations: build-time packages, **Module Federation**, iframes (strong isolation — useful for embedded merchant/payment widgets), Web Components, edge/server composition.
Key concerns: shared design system, routing ownership, shared state minimal (events/URL), version skew, performance budget.`,
    },
    {
      q: "Design a frontend for a merchant dashboard showing live transactions.",
      a: `- Requirements: real-time list, filters, export, multi-store, roles, i18n (ja/en), large volumes.
- Data: REST/GraphQL for history with **cursor pagination**; **SSE/WebSocket** for live events (with reconnect + resume from last event id); fall back to polling.
- State: TanStack Query cache + merge live events; dedupe by transaction id.
- UI: virtualised table, URL-synced filters, skeletons, error boundaries per widget.
- Perf: code splitting, memoised rows, web worker for CSV export.
- Security: RBAC enforced server-side, CSP, audit logs.`,
    },
    {
      q: "What is a BFF (Backend for Frontend) and why use it?",
      a: `A thin server layer dedicated to one client type (web, iOS, Android, mini-app) that aggregates and shapes data from downstream microservices.
Benefits: fewer round trips, client-specific payloads, hides internal service topology, centralises auth/session handling, can do SSR.
Risks: duplicated logic across BFFs, another service to operate. Often implemented with Node/GraphQL.`,
    },
    {
      q: "How do you build and maintain a design system?",
      a: `- Tokens (colour, spacing, typography) → primitives → components → patterns
- Accessible by default (WAI-ARIA, keyboard, focus management, contrast)
- Storybook docs, visual regression tests, semver releases, codemods for breaking changes
- Headless logic (Radix/React Aria) + themed styles
- Governance: contribution model, adoption metrics, deprecation policy.`,
    },
    {
      q: "Internationalisation (ja/en) concerns in a Japanese product.",
      a: `- ICU message format, pluralisation, no string concatenation
- Dates/times in **JST** vs user timezone; use \`Intl.DateTimeFormat\`
- Currency formatting \`Intl.NumberFormat('ja-JP', {style:'currency', currency:'JPY'})\` — JPY has 0 decimals
- Japanese typography: line breaking, font loading size (CJK fonts are large → subset), full-width characters & IME input (handle \`compositionstart/end\` — don't submit on Enter during IME composition!)
- Lazy-load locale bundles.`,
    },
    {
      q: "How do you ensure front-end quality and safe releases at scale?",
      a: `- Type safety + lint + unit/integration tests in CI; E2E on critical paths
- Feature flags and gradual rollouts; canary; instant rollback (immutable assets + versioned deployments)
- Error monitoring and RUM dashboards with alerts on release
- Performance budgets in CI (bundle size, Lighthouse)
- Contract testing with backend; API versioning for mobile/webview clients.`,
    },
    {
      q: "WebView / mini-app considerations (PayPay hosts mini-apps inside the app).",
      a: `- Bridge between native and web (JS bridge / postMessage): define a typed, versioned contract, validate messages, allowlist origins
- Auth via native-provided short-lived tokens, never long-lived secrets in JS
- Performance on low-end devices: small bundles, offline/slow network handling, caching
- Consistent UX with native (navigation, back button, safe areas)
- Security: CSP, no arbitrary URL navigation, sandbox third-party content.
(Verify PayPay's current mini-app platform details on their developer site.)`,
    },
  ],
});
