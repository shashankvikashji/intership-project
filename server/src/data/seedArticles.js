// Seed dataset — realistic, neutral headlines. Replaceable by a real news provider.
// Images use picsum.photos with seeds so they are stable without API keys.
const CATEGORIES = [
  'Technology', 'AI', 'Programming', 'Startups', 'Business',
  'Science', 'Finance', 'Gaming', 'Sports', 'Entertainment',
  'World', 'Politics', 'Health', 'Education'
];

function img(seed) {
  return `https://picsum.photos/seed/${seed}/900/520`;
}

const articles = [
  {
    externalId: 'seed-01', category: 'AI',
    title: 'Open-source AI models are changing how developers build applications',
    description: 'Smaller, openly available models are moving from research demos into production stacks.',
    content: 'For the past year, most production AI features were built on top of a handful of closed APIs. That is starting to change.\n\nOpen-weight models in the 7 to 70 billion parameter range have become good enough for summarization, classification, retrieval-augmented generation and code assistance — the unglamorous work that makes up most real deployments.\n\nTeams we spoke to cited three reasons for the shift: cost, latency, and control over data. Running a smaller model close to the user cuts per-request fees and keeps sensitive documents in-house.\n\nThere are trade-offs. Evaluating open models still takes real work, and fine-tuning requires data discipline most teams underestimate. But the tooling around quantization, serving and evals has matured fast.\n\nThe practical takeaway: if your feature works with a hosted API today, prototype the same flow against an open model now. You may be surprised how close it is.',
    image: img('lumen-ai-1'), source: 'Lumen Wire', author: 'M. Iyer', url: '',
    tags: ['artificial intelligence', 'open source', 'llm', 'developers'],
    publishedAt: hoursAgo(3)
  },
  {
    externalId: 'seed-02', category: 'Programming',
    title: 'Why browser performance is becoming important for modern web apps',
    description: 'As apps ship more client-side JavaScript, interaction latency is the new page-load time.',
    content: 'Page-load time used to dominate performance conversations. With interaction-to-next-paint now part of Core Web Vitals, the focus has shifted to how quickly a page responds after it loads.\n\nCommon culprits are familiar: large hydration bundles, third-party scripts, and long tasks blocking the main thread. What is new is how measurable the cost has become — teams can now tie sluggish interactions directly to drop-off.\n\nPractical fixes that keep showing up: code-split by route, defer non-critical scripts, virtualize long lists, and move heavy work off the main thread where possible.\n\nNone of this requires a rewrite. Most gains come from removing work, not adding tooling.',
    image: img('lumen-web-2'), source: 'Lumen Wire', author: 'D. Rao', url: '',
    tags: ['javascript', 'web development', 'performance', 'frontend'],
    publishedAt: hoursAgo(6)
  },
  {
    externalId: 'seed-03', category: 'Startups',
    title: 'Small startups are adopting AI-assisted development tools',
    description: 'Two-person teams say code assistants let them ship like a team twice their size.',
    content: 'In interviews with twelve early-stage teams, a consistent pattern emerged: AI code assistants handle boilerplate, tests and docs, while humans stay focused on product decisions.\n\nFounders were pragmatic about limits. The tools struggle with large refactors and unfamiliar codebases. Review discipline matters more, not less.\n\nStill, for routine CRUD, migrations and scaffolding, the time savings were described as "hard to give up once you have them".',
    image: img('lumen-startup-3'), source: 'Lumen Wire', author: 'A. Khan', url: '',
    tags: ['startups', 'ai tools', 'productivity', 'software'],
    publishedAt: hoursAgo(9)
  },
  {
    externalId: 'seed-04', category: 'Technology',
    title: 'Passkeys are quietly replacing passwords on major sites',
    description: 'Adoption is slow but steady — and support requests for resets are falling.',
    content: 'Passkeys, built on WebAuthn, let users sign in with a device PIN or biometrics instead of a memorized password.\n\nEarly adopters report fewer lockouts and phishing-resistant logins. The remaining friction is account recovery and cross-device sync, which platforms are still ironing out.\n\nSecurity teams advise offering passkeys alongside passwords for now, rather than forcing a switch.',
    image: img('lumen-tech-4'), source: 'Lumen Wire', author: 'S. Nair', url: '',
    tags: ['security', 'authentication', 'passkeys', 'web'],
    publishedAt: hoursAgo(12)
  },
  {
    externalId: 'seed-05', category: 'Programming',
    title: 'TypeScript\'s new year: stricter checks, faster builds',
    description: 'A look at what actually matters in recent TypeScript releases for working teams.',
    content: 'Recent TypeScript releases have focused less on flashy syntax and more on build speed and narrowing correctness gaps.\n\nFor most teams, the highest-value changes are performance improvements in the language server and better inference that removes the need for manual type gymnastics.\n\nIf you maintain a large monorepo, incremental adoption of stricter flags per package remains the sanest path.',
    image: img('lumen-ts-5'), source: 'Lumen Wire', author: 'R. Mehta', url: '',
    tags: ['typescript', 'javascript', 'tooling'],
    publishedAt: hoursAgo(15)
  },
  {
    externalId: 'seed-06', category: 'AI',
    title: 'Retrieval-augmented generation grows up: what works in production',
    description: 'Chunking strategy matters less than evals and refresh discipline.',
    content: 'Ask teams running RAG in production what broke and few mention the vector database. The recurring answers: stale indexes, missing citations, and no evaluation loop.\n\nWhat separates working systems: versioned document pipelines, per-query citations, and a small set of golden questions run on every index rebuild.\n\nSimple beats clever. Most teams ended up with simpler chunking than they started with.',
    image: img('lumen-ai-6'), source: 'Lumen Wire', author: 'P. Shah', url: '',
    tags: ['rag', 'llm', 'artificial intelligence', 'search'],
    publishedAt: hoursAgo(20)
  },
  {
    externalId: 'seed-07', category: 'Business',
    title: 'Freelance rates for developers stabilize after two volatile years',
    description: 'Demand for maintenance and AI integration work holds steady.',
    content: 'After sharp swings in 2023 and 2024, contract rates for software developers have leveled out, according to several marketplaces.\n\nWork has shifted from greenfield builds toward maintenance, migrations, and integrating AI features into existing products — work that favors experienced generalists.',
    image: img('lumen-biz-7'), source: 'Lumen Wire', author: 'K. Bose', url: '',
    tags: ['business', 'freelance', 'developers', 'jobs'],
    publishedAt: hoursAgo(26)
  },
  {
    externalId: 'seed-08', category: 'Science',
    title: 'A clearer picture of how sleep consolidates learning',
    description: 'New findings link structured replay during deep sleep to next-day recall.',
    content: 'Researchers tracking neural replay during slow-wave sleep found that structured reactivation of learning-related patterns predicted recall the next day.\n\nThe work adds weight to practical advice students already know: spaced study plus real sleep beats cramming.\n\nCaffeine timing and consistent wake hours showed larger effects than any supplement tested.',
    image: img('lumen-sci-8'), source: 'Lumen Wire', author: 'L. Fernandes', url: '',
    tags: ['science', 'sleep', 'learning', 'health'],
    publishedAt: hoursAgo(30)
  },
  {
    externalId: 'seed-09', category: 'Finance',
    title: 'Index funds keep winning the quiet compounding game',
    description: 'The case for boring investing gets stronger with every fee disclosure.',
    content: 'Active funds occasionally outperform, but after fees the majority trail broad indexes over decade-long windows.\n\nAdvisors interviewed for this piece kept returning to the same checklist: low fees, broad diversification, emergency buffer first, automate contributions.\n\nNo single market call mattered as much as staying invested.',
    image: img('lumen-fin-9'), source: 'Lumen Wire', author: 'V. Kulkarni', url: '',
    tags: ['finance', 'investing', 'personal finance'],
    publishedAt: hoursAgo(34)
  },
  {
    externalId: 'seed-10', category: 'Gaming',
    title: 'Mid-size game studios find an audience with shorter games',
    description: 'Six-hour games with a clear ending are outselling bloated open worlds for some teams.',
    content: 'Several mid-size studios report that tightly scoped single-player games — six to ten hours, one good idea executed well — are finding sustainable audiences.\n\nShorter scopes mean lower budgets, fewer crunch cycles, and room to experiment with art direction.\n\nPlayers cite backlog fatigue: a game you can actually finish feels like a feature.',
    image: img('lumen-game-10'), source: 'Lumen Wire', author: 'J. D\'Souza', url: '',
    tags: ['gaming', 'indie', 'design'],
    publishedAt: hoursAgo(40)
  },
  {
    externalId: 'seed-11', category: 'Sports',
    title: 'What the data says about rest days in a long season',
    description: 'Rotation is less about any single game and more about cumulative load.',
    content: 'Sports science staff across leagues describe the same trade-off: fans want stars every night, but cumulative minutes predict soft-tissue injuries better than any single-game metric.\n\nThe best-managed squads plan rest weeks before congestion, not during it.',
    image: img('lumen-sport-11'), source: 'Lumen Wire', author: 'T. Yadav', url: '',
    tags: ['sports', 'analytics', 'training'],
    publishedAt: hoursAgo(45)
  },
  {
    externalId: 'seed-12', category: 'Entertainment',
    title: 'Documentaries are the new prestige drama for streamers',
    description: 'Lower budgets, loyal audiences, and long shelf life.',
    content: 'With drama budgets under pressure, documentary series have become the reliable middle of streaming catalogs.\n\nThey cost a fraction of scripted shows, travel well across markets, and keep viewers for years rather than a launch weekend.',
    image: img('lumen-ent-12'), source: 'Lumen Wire', author: 'N. Kapoor', url: '',
    tags: ['entertainment', 'streaming', 'documentary'],
    publishedAt: hoursAgo(50)
  },
  {
    externalId: 'seed-13', category: 'World',
    title: 'Cities rethink curb space as deliveries double',
    description: 'Loading zones, not lanes, are the new traffic battleground.',
    content: 'Urban planners say the scarcest resource downtown is no longer road capacity but curb access for deliveries.\n\nPilot programs with timed loading zones and off-hour delivery windows have cut double-parking in several districts.',
    image: img('lumen-world-13'), source: 'Lumen Wire', author: 'Wire Desk', url: '',
    tags: ['world', 'cities', 'transport'],
    publishedAt: hoursAgo(55)
  },
  {
    externalId: 'seed-14', category: 'Politics',
    title: 'Voter registration drives move to where young voters actually are',
    description: 'Colleges, workplaces and direct messages replace town squares.',
    content: 'Civic groups report higher conversion from targeted, in-person registration at natural gathering points than from broad online ads.\n\nThe mechanics are unglamorous — clipboards, QR codes, follow-up texts — but the numbers hold up.',
    image: img('lumen-pol-14'), source: 'Lumen Wire', author: 'Wire Desk', url: '',
    tags: ['politics', 'elections', 'civic'],
    publishedAt: hoursAgo(60)
  },
  {
    externalId: 'seed-15', category: 'Health',
    title: 'Strength training twice a week shows outsized benefits after 40',
    description: 'Short sessions beat ambitious programs people quit.',
    content: 'Physicians and coaches converge on a modest prescription: two full-body sessions a week, progressive overload, walking on other days.\n\nAdherence, not optimization, drives results. The best program is the one repeated for a year.',
    image: img('lumen-health-15'), source: 'Lumen Wire', author: 'Dr. A. Menon', url: '',
    tags: ['health', 'fitness', 'strength'],
    publishedAt: hoursAgo(66)
  },
  {
    externalId: 'seed-16', category: 'Education',
    title: 'Universities rethink take-home essays in the AI era',
    description: 'More in-class writing, more process grading, fewer trick questions.',
    content: 'Rather than banning tools outright, many departments now grade drafts, outlines and in-class components alongside final submissions.\n\nInstructors say the shift rewards steady work and makes feedback more useful — with or without AI in the mix.',
    image: img('lumen-edu-16'), source: 'Lumen Wire', author: 'R. Banerjee', url: '',
    tags: ['education', 'ai', 'universities'],
    publishedAt: hoursAgo(72)
  },
  {
    externalId: 'seed-17', category: 'Programming',
    title: 'Postgres remains the default database developers reach for',
    description: 'Boring technology keeps winning because hiring and tooling are easy.',
    content: 'Survey after survey puts Postgres at the top of databases developers actually enjoy. The reasons are practical: reliable semantics, rich types, good extensions, and engineers who already know it.\n\nSpecialized stores still have their place — but teams default to Postgres until the workload proves otherwise.',
    image: img('lumen-pg-17'), source: 'Lumen Wire', author: 'S. Patil', url: '',
    tags: ['postgres', 'databases', 'backend', 'programming'],
    publishedAt: hoursAgo(80)
  },
  {
    externalId: 'seed-18', category: 'AI',
    title: 'Small language models find their niche on-device',
    description: 'Summarization, dictation cleanup and smart replies run fine without the cloud.',
    content: 'Distilled models with a few billion parameters now handle everyday on-device tasks: message summaries, voice transcription cleanup, and suggested replies.\n\nKeeping inference local improves latency and keeps personal text off servers — a trade users notice immediately.',
    image: img('lumen-ai-18'), source: 'Lumen Wire', author: 'M. Iyer', url: '',
    tags: ['artificial intelligence', 'mobile', 'on-device', 'llm'],
    publishedAt: hoursAgo(88)
  },
  {
    externalId: 'seed-19', category: 'Startups',
    title: 'The return of the boring SaaS: profitable, calm, durable',
    description: 'Founders trade hypergrowth narratives for retention and margins.',
    content: 'A growing cohort of SaaS founders describes success in unglamorous terms: net revenue retention above 110, payback under a year, support tickets answered fast.\n\nWithout cheap capital forcing breakneck hiring, small teams stay small and keep more of what they earn.',
    image: img('lumen-saas-19'), source: 'Lumen Wire', author: 'A. Khan', url: '',
    tags: ['startups', 'saas', 'business'],
    publishedAt: hoursAgo(96)
  },
  {
    externalId: 'seed-20', category: 'Technology',
    title: 'USB-C finally cleaned up the cable drawer — almost',
    description: 'One connector, many different capabilities. Labels still matter.',
    content: 'Regulation and industry convergence made USB-C the default port on phones, laptops and tablets. The catch: not all USB-C cables support the same power or data rates.\n\nBuyers should check wattage and USB version markings rather than assuming any cable does everything.',
    image: img('lumen-usbc-20'), source: 'Lumen Wire', author: 'D. Rao', url: '',
    tags: ['technology', 'hardware', 'usb'],
    publishedAt: hoursAgo(104)
  },
  {
    externalId: 'seed-21', category: 'Science',
    title: 'Urban trees cool streets more than reflective paint, study finds',
    description: 'Shade beats albedo on the hottest afternoons.',
    content: 'Comparing cooling interventions across neighborhoods, researchers found mature street trees reduced afternoon air temperatures more than reflective coatings.\n\nTrees also slowed evening heat release — the period most linked to heat stress.',
    image: img('lumen-sci-21'), source: 'Lumen Wire', author: 'L. Fernandes', url: '',
    tags: ['science', 'climate', 'cities'],
    publishedAt: hoursAgo(112)
  },
  {
    externalId: 'seed-22', category: 'Finance',
    title: 'Emergency funds: how much is actually enough?',
    description: 'Three to six months is a starting point, not a rule.',
    content: 'Planners suggest sizing an emergency buffer to income volatility rather than a fixed month count. Freelancers need more; dual-income households with stable jobs need less.\n\nKeep it in a separate high-yield account. The friction is the feature.',
    image: img('lumen-fin-22'), source: 'Lumen Wire', author: 'V. Kulkarni', url: '',
    tags: ['finance', 'savings', 'personal finance'],
    publishedAt: hoursAgo(120)
  },
  {
    externalId: 'seed-23', category: 'Programming',
    title: 'A practical guide to React Server Components without the hype',
    description: 'When server components help, when they complicate, and how to adopt gradually.',
    content: 'Server Components reduce client JavaScript by rendering parts of the UI on the server. The mental model that helps: server for data access and static structure, client for interactivity.\n\nTeams report the smoothest adoption when they convert leaf pages first and keep interactive islands clearly marked.\n\nMeasure bundle size before and after. If it does not shrink, the boundary is probably in the wrong place.',
    image: img('lumen-rsc-23'), source: 'Lumen Wire', author: 'R. Mehta', url: '',
    tags: ['react', 'javascript', 'web development', 'frontend'],
    publishedAt: hoursAgo(130)
  },
  {
    externalId: 'seed-24', category: 'AI',
    title: 'Evals are the missing discipline in most AI projects',
    description: 'A dozen golden examples beat a thousand vibes.',
    content: 'Teams that maintain a small, curated evaluation set — inputs, expected behaviors, and grading rubrics — iterate faster and argue less.\n\nStart with twelve examples covering your riskiest cases. Run them on every prompt or model change. Expand only when failures repeat.',
    image: img('lumen-eval-24'), source: 'Lumen Wire', author: 'P. Shah', url: '',
    tags: ['artificial intelligence', 'evals', 'llm', 'engineering'],
    publishedAt: hoursAgo(140)
  },
  {
    externalId: 'seed-25', category: 'Sports',
    title: 'Marathon training plans are getting shorter — and faster',
    description: 'Coaches favor intensity control over junk miles.',
    content: 'Modern amateur marathon plans top out at lower weekly mileage than a decade ago, replacing filler runs with controlled workouts and real rest.\n\nFinish times for disciplined low-mileage runners match or beat those of higher-mileage peers who skip recovery.',
    image: img('lumen-run-25'), source: 'Lumen Wire', author: 'T. Yadav', url: '',
    tags: ['sports', 'running', 'training'],
    publishedAt: hoursAgo(150)
  },
  {
    externalId: 'seed-26', category: 'Entertainment',
    title: 'Book adaptations dominate the next year of releases',
    description: 'Publishers and producers mined backlists for contained, character-driven stories.',
    content: 'Studios optioning novels favor mid-length books with clear arcs — cheaper to adapt than sprawling epics, easier to market than originals.\n\nAuthors report that a modest advance plus a real marketing push beats a big option that never shoots.',
    image: img('lumen-book-26'), source: 'Lumen Wire', author: 'N. Kapoor', url: '',
    tags: ['entertainment', 'books', 'film'],
    publishedAt: hoursAgo(160)
  },
  {
    externalId: 'seed-27', category: 'Health',
    title: 'What walking 8,000 steps actually does — and doesn\'t',
    description: 'A reasonable target with diminishing returns past it.',
    content: 'Large cohort studies link 7,000–9,000 daily steps to meaningful reductions in cardiovascular risk. Beyond that, benefits flatten for most adults.\n\nPace matters less than consistency. Short walks after meals showed particular promise for glucose control.',
    image: img('lumen-walk-27'), source: 'Lumen Wire', author: 'Dr. A. Menon', url: '',
    tags: ['health', 'walking', 'fitness'],
    publishedAt: hoursAgo(170)
  },
  {
    externalId: 'seed-28', category: 'Education',
    title: 'Learning to code in 2026: fundamentals still transfer',
    description: 'Frameworks change; reading code and debugging do not.',
    content: 'Beginners often ask which framework to learn first. Instructors interviewed here gave a consistent answer: pick one mainstream stack, then spend most time reading existing code, reproducing bugs, and writing small programs end to end.\n\nVersion control, testing basics, and the ability to explain your code out loud remain the strongest hiring signals for juniors.',
    image: img('lumen-code-28'), source: 'Lumen Wire', author: 'R. Banerjee', url: '',
    tags: ['education', 'programming', 'javascript', 'careers'],
    publishedAt: hoursAgo(5)
  }
];

function hoursAgo(h) {
  return new Date(Date.now() - h * 3600 * 1000).toISOString();
}

module.exports = { articles, CATEGORIES };
