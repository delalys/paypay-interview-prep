registerDeck({
  id: "experience-behavioral",
  title: "Experience & Senior Behaviour",
  description: "STAR stories, leadership, ownership — prepare YOUR answers",
  cards: [
    {
      q: "How do you structure answers about past experience?",
      a: `**STAR(+L)**: Situation (1–2 sentences) → Task (your responsibility) → **Action** (most of the time; say "I", be technical and specific) → **Result** (numbers: latency −40%, incidents −60%, revenue, time saved) → **Learning**.
Keep to ~2 minutes; let them dig deeper. Prepare 6–8 stories you can reuse across questions.`,
    },
    {
      q: "Walk me through the most technically challenging project you led.",
      a: `Prepare your own answer. Checklist:
- Context & scale (users, QPS, team size)
- Why it was hard (constraints, legacy, unknowns)
- Options considered and **why you chose** one (trade-offs)
- Your personal contribution vs the team's
- Measurable result, what you'd do differently
Expect follow-ups on architecture: draw it.`,
    },
    {
      q: "Tell me about a production incident you handled.",
      a: `Show calm ownership:
- Detection (alert/user report), impact assessment, communication
- **Mitigate first** (rollback, flag off), then root cause
- Blameless postmortem: 5 whys, action items (tests, alerts, guardrails)
- What changed systemically afterwards.`,
    },
    {
      q: "Tell me about a disagreement with a colleague or manager on a technical decision.",
      a: `Show: you listened, used data/prototypes to decide, considered their constraints, "disagree and commit" when needed, and the relationship stayed good.
Avoid: making the other person look stupid, or a story where you simply gave up.`,
    },
    {
      q: "How do you mentor engineers and raise the bar of a team?",
      a: `Examples: code review culture (explain the why), pairing, design docs/RFC reviews, onboarding docs, tech talks, delegating ownership with support, setting up lint/test/CI standards, growing someone into a lead role. Give a concrete person/story with outcome.`,
    },
    {
      q: "How do you balance tech debt against feature delivery?",
      a: `- Make debt visible: tie it to business impact (incidents, lead time, onboarding cost)
- Allocate continuous capacity (e.g. 15–20%) + opportunistic refactoring ("boy scout rule")
- Strangler-fig migrations instead of big-bang rewrites
- Measure: DORA metrics (deploy frequency, lead time, change failure rate, MTTR).`,
    },
    {
      q: "Why PayPay? Why are you leaving your current role?",
      a: `Prepare a sincere, positive answer:
- Product impact: used daily by a large share of Japan's population
- Technical challenges: scale, reliability, payment correctness, campaign spikes
- International, English-speaking engineering culture in Japan
- How your experience (React, architecture, …) maps to their needs
Never criticise your current employer.`,
    },
    {
      q: "Describe how you'd approach your first 90 days as a senior engineer.",
      a: `- 30: learn the domain, architecture, people, on-call; ship small changes; read postmortems
- 60: own a feature/area; identify pain points with data
- 90: propose and drive an improvement (perf, DX, reliability); start mentoring
Emphasise listening before changing things.`,
    },
    {
      q: "Questions to ask the interviewers at the end.",
      a: `- How are front-end and backend teams organised? Who owns the web/mini-app platform?
- How do you handle releases and incidents during big campaigns?
- What does success look like for this role in 6 months?
- Biggest technical challenge the team faces this year?
- How are architectural decisions made (RFCs, architecture review)?`,
    },
  ],
});
