// Template deck for explaining a codebase's architecture.
// When the two repos are available, add one deck per repo (copy this file).
registerDeck({
  id: "repo-architecture",
  title: "Explaining a Repo's Architecture",
  description: "Reusable questions to rehearse for any codebase (repos to be added)",
  cards: [
    {
      q: "Give the 60-second overview of this repository.",
      a: `Template:
- **What** it does and for whom (problem solved)
- **Tech stack** (language, framework, DB, infra)
- **Main modules** and how a request flows through them
- **One interesting design decision** and its trade-off
Practise saying it out loud in under a minute.`,
    },
    {
      q: "Draw the high-level architecture. What are the main components and boundaries?",
      a: `Cover: entry points (routes, CLI, handlers), core domain/business logic, data access layer, external integrations, shared utilities, config. Explain dependency direction (what depends on what) and why boundaries are where they are.`,
    },
    {
      q: "Trace one request / user action end-to-end through the code.",
      a: `Pick the most important flow. Name the actual files/functions: UI component → state/hook → API client → route/controller → service → repository → DB, then the response path and error handling.`,
    },
    {
      q: "How is state and data managed?",
      a: `Front-end: local vs global state, server cache, URL state. Back-end: data model, transactions, caching, migrations. Mention consistency guarantees and where the source of truth lives.`,
    },
    {
      q: "What are the weaknesses of this architecture and what would you improve?",
      a: `Seniors are expected to critique: coupling, missing tests, performance bottlenecks, scalability limits, error handling, security gaps, DX. Propose concrete, prioritised improvements and how you'd migrate safely (incremental, behind flags).`,
    },
    {
      q: "How would this system behave at 100× scale?",
      a: `Identify the first bottleneck (DB, a synchronous call, a single instance, memory, bundle size), then the next. Propose caching, queues, sharding, CDN, horizontal scaling, and what metrics you would watch.`,
    },
    {
      q: "How is it tested, built and deployed?",
      a: `Test pyramid in the repo (unit/integration/E2E), CI pipeline steps, environments, release strategy, monitoring. If missing, say what you would add first and why.`,
    },
  ],
});
