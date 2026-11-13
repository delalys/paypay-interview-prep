registerDeck({
  id: "javascript",
  title: "JavaScript",
  description: "Language internals, async, closures, prototypes, performance",
  cards: [
    {
      q: "Explain the event loop: call stack, microtasks and macrotasks.",
      a: `JS runs on a single thread with one **call stack**.
- When the stack is empty, the loop drains the **microtask queue** completely (Promise callbacks, \`queueMicrotask\`, \`MutationObserver\`).
- Then it takes **one macrotask** (setTimeout, I/O, UI events, MessageChannel), runs it, drains microtasks again, and the browser may render.
- Consequence: a chain of microtasks can starve rendering; long tasks (>50ms) block input.
~~~
console.log(1);
setTimeout(() => console.log(2));
Promise.resolve().then(() => console.log(3));
console.log(4);
// 1 4 3 2
~~~`,
    },
    {
      q: "What is a closure and give a real use case (and a pitfall).",
      a: `A closure is a function bundled with the lexical environment it was created in — it keeps access to outer variables after the outer function returned.
- Uses: data privacy / module pattern, memoization, factories, partial application, React hooks (every render's handlers close over that render's state).
- Pitfalls: **stale closures** (a callback reading old state in \`useEffect\`/\`setInterval\`), and memory leaks when long-lived closures retain large objects.
- Classic: \`var\` in a loop shares one binding; \`let\` creates a fresh binding per iteration.`,
    },
    {
      q: "How does `this` get bound in JavaScript?",
      a: `Decided at **call time**, in priority order:
- \`new Foo()\` → the new object
- \`fn.call/apply/bind(obj)\` → explicit obj
- \`obj.method()\` → obj (implicit)
- plain call \`fn()\` → \`undefined\` in strict mode (globalThis otherwise)
- **Arrow functions** have no own \`this\`; they capture it lexically — that is why they are used for callbacks inside class methods.`,
    },
    {
      q: "Explain prototypal inheritance. How do ES classes relate to it?",
      a: `Each object has an internal \`[[Prototype]]\` link; property lookup walks the chain until \`null\`.
- \`class\` is syntax sugar over constructor functions + \`prototype\` objects; methods live on \`Class.prototype\`, shared by instances.
- \`extends\` sets up two chains: instance (\`Child.prototype → Parent.prototype\`) and static (\`Child → Parent\`).
- Differences from plain functions: classes are strict mode, not hoisted (TDZ), must be called with \`new\`, support \`#private\` fields.`,
    },
    {
      q: "Promise.all vs allSettled vs race vs any — when do you use each?",
      a: `- \`all\`: resolves with all values, **rejects fast** on first rejection. Use when every result is required.
- \`allSettled\`: waits for all, never rejects; gives \`{status, value|reason}\`. Use for independent best-effort calls (e.g. dashboard widgets).
- \`race\`: settles with the first to settle (fulfil or reject). Use for timeouts.
- \`any\`: first **fulfilment**; rejects with \`AggregateError\` only if all reject. Use for redundant sources / fallbacks.
Note: none of them cancel the losers — use \`AbortController\` for that.`,
    },
    {
      q: "How do you cancel an in-flight fetch and avoid race conditions in a search box?",
      a: `- Create an \`AbortController\` per request, pass \`signal\` to \`fetch\`, call \`abort()\` when a newer query starts or the component unmounts.
- Debounce input (~250ms) to reduce calls.
- Alternatively ignore stale responses by comparing a request id / the latest query.
~~~
let ctrl;
async function search(q) {
  ctrl?.abort();
  ctrl = new AbortController();
  try {
    const res = await fetch('/api?q=' + encodeURIComponent(q), { signal: ctrl.signal });
    render(await res.json());
  } catch (e) {
    if (e.name !== 'AbortError') throw e;
  }
}
~~~`,
    },
    {
      q: "Implement debounce and throttle. What is the difference?",
      a: `**Debounce**: run once after calls stop for N ms (search input, resize end).
**Throttle**: run at most once every N ms (scroll, mousemove).
~~~
function debounce(fn, ms) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), ms);
  };
}
function throttle(fn, ms) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn.apply(this, args); }
  };
}
~~~
Senior follow-ups: leading/trailing options, \`cancel()\`, and in React keep the debounced fn stable with \`useMemo\`/\`useRef\`.`,
    },
    {
      q: "var vs let vs const, hoisting and the Temporal Dead Zone.",
      a: `- \`var\`: function-scoped, hoisted and initialised to \`undefined\`, can be redeclared.
- \`let\`/\`const\`: block-scoped, hoisted but **not initialised** → accessing before declaration throws (TDZ).
- \`const\` prevents rebinding, not mutation (\`Object.freeze\` is shallow).
- Function declarations are fully hoisted; function expressions follow their variable's rules.`,
    },
    {
      q: "== vs ===, and how does equality work for objects, NaN and -0?",
      a: `- \`===\` strict: no type coercion. \`==\` coerces (\`'1' == 1\`, \`null == undefined\` true).
- Objects compare by **reference**.
- \`NaN !== NaN\`; use \`Number.isNaN\`. \`0 === -0\` is true.
- \`Object.is\` treats \`NaN\` as equal to itself and distinguishes \`0\`/\`-0\` — React uses \`Object.is\` for state and dependency comparisons.`,
    },
    {
      q: "Why is 0.1 + 0.2 !== 0.3, and how do you handle money in JavaScript?",
      a: `Numbers are IEEE-754 doubles; 0.1 has no exact binary representation.
For money (very relevant to a payments company):
- Store and compute in **integer minor units** (JPY has no minor unit; for USD use cents).
- For large values use \`BigInt\` or a decimal library; \`Number.MAX_SAFE_INTEGER\` is 2^53−1.
- Format with \`Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' })\`.
- Never trust the client's amount — the server is the source of truth.`,
    },
    {
      q: "What causes memory leaks in front-end apps and how do you find them?",
      a: `Common causes:
- Event listeners / subscriptions / intervals not removed on unmount
- Detached DOM nodes still referenced
- Unbounded caches or global maps (use \`WeakMap\`/LRU)
- Closures retaining large objects
How to find: Chrome DevTools Memory → heap snapshots (compare before/after), allocation timeline, "Detached" filter; Performance monitor for JS heap growth.`,
    },
    {
      q: "Map/Set vs WeakMap/WeakSet vs plain objects.",
      a: `- \`Map\`: any key type, preserves insertion order, \`size\`, better for frequent add/delete.
- Object: string/symbol keys, prototype keys can collide (use \`Object.create(null)\`).
- \`WeakMap\`/\`WeakSet\`: keys must be objects, held **weakly** (do not prevent GC), not iterable. Use for metadata/caches keyed by objects (e.g. DOM nodes).`,
    },
    {
      q: "ES modules vs CommonJS. What enables tree-shaking?",
      a: `- ESM: static \`import/export\`, resolved before execution, live bindings, async loading, top-level await.
- CJS: \`require\` is a runtime function call, synchronous, exports a copied value object.
- Tree-shaking needs **static** structure (ESM) + side-effect-free modules (\`"sideEffects": false\` in package.json).
- Code splitting uses dynamic \`import()\`.`,
    },
    {
      q: "Explain generators and async iterators. Where are they useful?",
      a: `Generators (\`function*\`) produce values lazily with \`yield\` and can be paused/resumed.
Async iterators (\`for await...of\`) consume async streams: paginated APIs, streams, WebSocket messages.
~~~
async function* pages(url) {
  while (url) {
    const res = await fetch(url).then(r => r.json());
    yield* res.items;
    url = res.next;
  }
}
~~~`,
    },
    {
      q: "What does TypeScript give you, and which advanced features do you use?",
      a: `Static safety, better refactoring, self-documenting APIs.
Advanced features worth mentioning:
- **Discriminated unions** for state machines (\`{status:'loading'} | {status:'success', data}\`)
- Generics with constraints, \`keyof\`, mapped and conditional types, \`infer\`
- \`unknown\` over \`any\`, \`satisfies\`, \`as const\`
- Runtime validation at boundaries (zod) — types disappear at runtime.`,
    },
    {
      q: "How would you deep clone an object? What are the traps?",
      a: `- \`structuredClone(obj)\` — native, handles cycles, Dates, Maps, Sets; not functions/DOM/class prototypes.
- \`JSON.parse(JSON.stringify())\` loses undefined, functions, Dates (become strings), Infinity/NaN, fails on cycles.
- Spread / \`Object.assign\` are **shallow**.
In React state you normally avoid deep clones: copy only the path you change (or use Immer).`,
    },
    {
      q: "Explain how the browser renders a page (critical rendering path).",
      a: `HTML → DOM, CSS → CSSOM → render tree → **layout** (geometry) → **paint** → **composite** (GPU layers).
- CSS is render-blocking; sync \`<script>\` is parser-blocking (use \`defer\`/\`async\`/modules).
- Changing \`width/top\` triggers layout; \`color\` triggers paint; \`transform/opacity\` can be compositor-only.
- Avoid layout thrashing: batch reads then writes; use \`requestAnimationFrame\`.`,
    },
    {
      q: "Core Web Vitals: what are LCP, INP, CLS and how do you improve them?",
      a: `- **LCP** (largest contentful paint, < 2.5s): optimise server time/CDN, preload hero image, avoid render-blocking resources, SSR.
- **INP** (interaction to next paint, < 200ms): break long tasks, yield to main thread, reduce JS, use \`startTransition\`, web workers.
- **CLS** (< 0.1): reserve space for images/ads (width/height, aspect-ratio), avoid inserting content above existing content, font-display strategy.
Measure with field data (RUM / web-vitals lib), not just Lighthouse.`,
    },
    {
      q: "What front-end security issues matter for a payment app?",
      a: `- **XSS**: escape output, avoid \`dangerouslySetInnerHTML\`, strict **CSP**, Trusted Types.
- **CSRF**: SameSite cookies, CSRF tokens, check Origin.
- Token storage: prefer httpOnly Secure cookies over localStorage (XSS can read localStorage).
- Clickjacking: \`frame-ancestors\` / X-Frame-Options.
- Supply chain: lockfiles, audit, SRI for third-party scripts, minimise dependencies.
- Never put secrets in the bundle; validate everything server-side.`,
    },
    {
      q: "What is the output and why?\n~~~\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i));\n}\n~~~",
      a: `Prints \`3 3 3\`. \`var\` creates one function-scoped binding; by the time the timeouts run, the loop finished and \`i\` is 3.
Fix: use \`let\` (new binding per iteration) or capture via an IIFE / \`setTimeout(console.log, 0, i)\`.`,
    },
  ],
});
