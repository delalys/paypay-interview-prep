registerDeck({
  id: "react",
  title: "React",
  description: "Rendering model, hooks, state, performance, React 18/19",
  cards: [
    {
      q: "Explain React's rendering model: render phase vs commit phase, and reconciliation.",
      a: `- **Render phase**: React calls components to produce a new element tree; pure, can be paused/restarted (concurrent rendering).
- **Reconciliation**: diffs new tree vs previous Fiber tree. Heuristics: different element type → remount subtree; same type → update props; lists matched by \`key\`.
- **Commit phase**: applies DOM mutations synchronously, then runs \`useLayoutEffect\`, then (async) \`useEffect\`.
A re-render ≠ DOM update: if output is identical, nothing is committed.`,
    },
    {
      q: "What triggers a re-render? Does a parent re-render re-render its children?",
      a: `Triggers: state update (\`setState\`, \`useReducer\`), parent re-render, context value change, external store change (\`useSyncExternalStore\`).
Yes — by default **all children re-render** when a parent renders, regardless of props. Opt out with \`React.memo\` (shallow prop compare), or restructure: move state down, or pass children as props ("lift content up") so they are created by a component that did not re-render.`,
    },
    {
      q: "Why are keys important in lists? Why is index as key a problem?",
      a: `Keys give elements a stable identity between renders so React can match old and new items.
With index keys, inserting/reordering shifts identities → wrong state attached to wrong rows (inputs keep previous values), unnecessary re-mounts and bugs with animations.
Use a stable unique id. Bonus: changing a \`key\` on purpose is a clean way to **reset** a component's state.`,
    },
    {
      q: "useEffect: when does it run, what does the dependency array do, and common mistakes?",
      a: `Runs after paint, after commit; cleanup runs before the next effect and on unmount.
- Deps compared with \`Object.is\`; missing deps → stale closures; object/function deps recreated each render → infinite loops.
- Mistakes: using effects to derive state (compute during render instead), to handle user events (do it in the handler), fetching without cleanup/abort (race conditions).
- StrictMode in dev mounts → unmounts → mounts to surface missing cleanups.
"You might not need an effect" — effects are for **synchronising with external systems**.`,
    },
    {
      q: "useMemo vs useCallback vs React.memo — when are they worth it?",
      a: `- \`useMemo\`: caches a computed value.
- \`useCallback\`: caches a function identity (= \`useMemo(() => fn)\`).
- \`React.memo\`: skips re-rendering a component when props are shallow-equal.
They only help together: memoising a callback is pointless unless the receiver is memoised or it is an effect dependency. Use after profiling for expensive renders/large lists. The **React Compiler** (React 19 era) auto-memoises, reducing manual use.`,
    },
    {
      q: "useRef vs useState. Give use cases for refs.",
      a: `\`useState\` changes trigger a re-render; \`useRef\` is a mutable box (\`.current\`) that persists across renders **without** re-rendering.
Use refs for: DOM nodes (focus, measure), timers/interval ids, previous values, latest callback (to avoid stale closures), instance-like values (AbortController).
Do not read/write refs during render for values that affect output.`,
    },
    {
      q: "useLayoutEffect vs useEffect.",
      a: `\`useLayoutEffect\` runs synchronously after DOM mutations **before the browser paints** — use it to measure layout and re-position (tooltips) to avoid flicker. It blocks paint, so keep it small; it warns on the server.
\`useEffect\` runs after paint — default for everything else (subscriptions, fetching, logging).`,
    },
    {
      q: "How do you choose where state lives? Local, lifted, context, global store, server cache.",
      a: `- **Local** \`useState\` by default; colocate.
- **Lift** to the closest common parent when siblings share it.
- **URL** for shareable state (filters, tabs, pagination).
- **Server state** (remote data) → TanStack Query / SWR / RTK Query: caching, dedup, revalidation, retries. Don't copy it into Redux.
- **Context** for low-frequency global values (theme, auth, locale). It re-renders all consumers on change.
- **Global client store** (Redux Toolkit, Zustand, Jotai) for complex, frequently-updated client state with selectors.`,
    },
    {
      q: "What are the performance pitfalls of React Context and how do you mitigate them?",
      a: `Every consumer re-renders when the provider's \`value\` changes (identity check).
Mitigations:
- Memoise the value object (\`useMemo\`).
- Split contexts by update frequency (state vs dispatch contexts).
- Keep fast-changing state out of context; use a store with selectors (\`useSyncExternalStore\`, Zustand, Redux).
- Move the provider down the tree.`,
    },
    {
      q: "What are concurrent features: useTransition, useDeferredValue, Suspense?",
      a: `React 18 can interrupt rendering to keep the UI responsive.
- \`startTransition\` / \`useTransition\`: mark an update as non-urgent (e.g. filtering a big list) so typing stays snappy; \`isPending\` for feedback.
- \`useDeferredValue\`: render with the old value while the new one is computed in the background.
- **Suspense**: declaratively show a fallback while code (\`lazy\`) or data is loading; with streaming SSR, sends HTML in chunks and hydrates selectively.
Automatic batching groups state updates in timeouts/promises too.`,
    },
    {
      q: "SSR vs SSG vs CSR vs React Server Components. Trade-offs?",
      a: `- **CSR**: simple hosting, slow first paint, poor SEO.
- **SSR**: HTML per request → fast FCP/SEO, but server cost + hydration cost (TTI).
- **SSG/ISR**: pre-rendered at build/revalidate → fastest, for mostly static content.
- **RSC**: components run on the server only, send serialised output, **zero client JS** for them, can access data directly; client components (\`'use client'\`) for interactivity. Reduces bundle size; adds complexity in caching and the server/client boundary.
For a logged-in payment dashboard, CSR/SSR hybrid with careful caching is common; for marketing pages SSG.`,
    },
    {
      q: "What is hydration and what causes hydration mismatches?",
      a: `Hydration attaches event handlers and React state to server-rendered HTML, expecting identical markup.
Mismatches from: \`Date.now()\`/random values, \`window\`/\`localStorage\` access during render, locale/timezone differences, invalid HTML nesting, browser extensions.
Fixes: render client-only parts in \`useEffect\`, \`suppressHydrationWarning\` for unavoidable cases, consistent timezone formatting.`,
    },
    {
      q: "How do you write a custom hook? Show a useFetch or useDebounce.",
      a: `A custom hook is a function starting with \`use\` that composes other hooks — it shares **logic**, not state.
~~~
function useDebouncedValue(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
~~~
Mention: rules of hooks (top level, same order), cleanup, and testing with \`renderHook\`.`,
    },
    {
      q: "Controlled vs uncontrolled components. How do you handle big forms?",
      a: `- **Controlled**: value in React state, \`onChange\` updates it — easy validation, but re-render per keystroke.
- **Uncontrolled**: DOM holds the value, read via ref/FormData — cheaper.
Big forms: React Hook Form (uncontrolled + subscriptions) + schema validation (zod) shared with the backend; React 19 form actions / \`useActionState\` for server mutations.
For a payment form: disable double submit, idempotency key, clear error states, accessibility.`,
    },
    {
      q: "How do you profile and fix a slow React page?",
      a: `1. Measure: React DevTools **Profiler** (why did this render?), Chrome Performance (long tasks), web-vitals in production.
2. Typical fixes:
- Avoid unnecessary renders (memo, state colocation, split context)
- **Virtualise** long lists (react-window / TanStack Virtual)
- Code split routes (\`lazy\`), lazy-load heavy libs
- Move expensive work out of render, to workers or the server
- \`useTransition\` for non-urgent updates
3. Verify with numbers before/after.`,
    },
    {
      q: "What are error boundaries and their limitations?",
      a: `Class components implementing \`getDerivedStateFromError\`/\`componentDidCatch\` that catch errors **during rendering, lifecycle and constructors** of their subtree and render a fallback.
They do **not** catch: event handler errors, async code (setTimeout, promises), SSR errors, errors in the boundary itself. Handle those with try/catch and report to monitoring (Sentry).
Place them per feature/route so one widget failure doesn't blank the whole app.`,
    },
    {
      q: "How do you test React applications?",
      a: `- **Unit/integration**: Jest/Vitest + React Testing Library — test behaviour as a user ("find by role"), not implementation details.
- Mock network with **MSW**.
- **E2E**: Playwright/Cypress on critical flows (login, payment, top-up).
- Visual regression (Storybook + Chromatic) for design systems.
- Testing trophy: most value in integration tests. Add contract tests with the backend API.`,
    },
    {
      q: "What's new in React 19 that you should be able to discuss?",
      a: `- **Actions**: async functions in transitions, \`<form action={fn}>\`, \`useActionState\`, \`useFormStatus\`
- \`useOptimistic\` for optimistic UI
- \`use()\` to read promises/context in render (with Suspense)
- Server Components / Server Actions stable
- \`ref\` as a regular prop (no \`forwardRef\`), document metadata in components, better hydration errors
- **React Compiler** for automatic memoisation`,
    },
    {
      q: "How would you implement optimistic UI for a 'send money' or 'like' action — and when must you NOT?",
      a: `Optimistic: update UI immediately, send request, reconcile or roll back on error (\`useOptimistic\`, TanStack Query \`onMutate\`/\`onError\` rollback).
Fine for likes, favourites, reordering.
**Not** for money movement: show a pending state, rely on the server's authoritative result, prevent double submission (disable button + **idempotency key**), poll/subscribe for final status. Wrong optimistic balances destroy user trust.`,
    },
  ],
});
