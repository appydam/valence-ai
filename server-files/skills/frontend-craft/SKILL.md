# Frontend Craft — Staff Engineer Level

You read this file when your task involves building a UI, writing React/Node.js code, or deploying to Vercel. Read it fully before writing a single line.

The bar: your output should be indistinguishable from a senior engineer at Linear, Stripe, or Vercel. Not "functional." **Polished.**

---

## 1. Component Architecture

**Single Responsibility.** One component = one job. `<UserProfile>` renders a profile. It does not fetch, does not manage auth, does not contain unrelated side effects.

**Container / Presentational split.**
- Containers: fetch data, handle mutations, pass props down
- Presentational: pure render — same props → same output, zero side effects
- Example: `<UserListPage>` (fetches) → `<UserList>` (renders) → `<UserCard>` (item)

**Co-location.** Everything a component needs lives next to it:
```
components/Button/
  index.ts          ← re-exports Button and ButtonProps
  Button.tsx
  Button.module.css ← only if Tailwind doesn't cover it
```

**Props interface naming.** Always `[ComponentName]Props`, always exported:
```ts
export interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
  disabled?: boolean;
}
```

**No prop drilling past 2 levels.** If you're threading the same prop through 3 components to reach the leaf, it belongs in context or a store — not in props.

**Component size limit.** If a component exceeds 200 lines, it has multiple responsibilities. Split it.

---

## 2. State Management

**Rule: one source of truth per piece of data.**

| State type | Use |
|---|---|
| `useState` | UI-only: modal open, tab selected, pre-submit field value |
| `useQuery` (Convex) / React Query | Server data — never duplicate into `useState` |
| `useContext` + `useReducer` | Auth session, theme, cross-page wizard state |
| Derived value | Compute during render — not stored in `useState` |

**Derived state example:**
```ts
// ❌ Storing derived value — stale bugs waiting to happen
const [isEmpty, setIsEmpty] = useState(false);
useEffect(() => setIsEmpty(items.length === 0), [items]);

// ✅ Compute it
const isEmpty = items.length === 0;
```

**Forms with 3+ fields → `react-hook-form` + `zod`:**
```ts
const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
});
type FormData = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

---

## 3. React Patterns

### Custom hook — always typed
```ts
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
```

### Skeleton loaders — not spinners
Spinners create anxiety. Skeletons show layout forming.
```tsx
function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-zinc-800/60 p-5 space-y-3">
      <div className="h-4 w-2/3 rounded bg-zinc-700" />
      <div className="h-3 w-1/2 rounded bg-zinc-700" />
    </div>
  );
}

// Usage
const items = useQuery(api.items.list);
if (!items) return <>{[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}</>;
```

### Error Boundary — wrap async-heavy trees
```ts
class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: Error) { console.error(err); }
  render() {
    return this.state.hasError
      ? (this.props.fallback ?? <ErrorState message="Something went wrong" onRetry={() => this.setState({ hasError: false })} />)
      : this.props.children;
  }
}
```

### `useCallback` / `useMemo` — narrow usage only
```ts
// ✅ useMemo: expensive computation AND result passed to memoized child
const sorted = useMemo(() => [...items].sort((a, b) => a.name.localeCompare(b.name)), [items]);

// ✅ useCallback: function passed as prop to a React.memo() child
const handleDelete = useCallback((id: string) => deleteItem(id), [deleteItem]);

// ❌ Do NOT wrap everything — it costs more than it saves for simple cases
```

### `key` props — stable IDs only
```tsx
// ❌ Index key breaks animations and reconciliation on reorder
{items.map((item, i) => <Card key={i} />)}

// ✅ Stable unique ID
{items.map(item => <Card key={item.id} />)}
```

### Controlled vs uncontrolled
- Controlled (`value` + `onChange`): when you need to validate, transform, or react to input in real time
- Uncontrolled (`defaultValue` + `ref`): when you only need the value on submit (file inputs, simple one-off forms)

---

## 4. Backend Patterns (Node.js / TypeScript)

**Layered architecture — no shortcuts:**
```
routes/       → parse request, call controller, return HTTP response
controllers/  → orchestrate services, handle HTTP concerns only
services/     → business logic — no DB, no HTTP
repositories/ → all DB queries live here and nowhere else
```

**Input validation at the boundary with `zod`:**
```ts
const CreateOrderSchema = z.object({
  userId: z.string().uuid(),
  items: z.array(z.object({ productId: z.string(), qty: z.number().int().positive() })).min(1),
  couponCode: z.string().optional(),
});

router.post('/orders', async (req, res) => {
  const parsed = CreateOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(422).json({ errors: parsed.error.flatten() });
  const order = await orderService.create(parsed.data);
  res.status(201).json(order);
});
```

**HTTP status codes — use them correctly:**
```
200 OK          GET, PUT, PATCH success
201 Created     POST that created a resource
400 Bad Request Missing required field, malformed JSON
401 Unauth      Not authenticated
403 Forbidden   Authenticated but not allowed
404 Not Found   Resource doesn't exist
409 Conflict    Duplicate (email already registered)
422 Unprocess   Valid JSON but fails business validation
500 Server Err  Unexpected error — log it, never expose internals
```

**Env config validated at startup — crash loudly:**
```ts
const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().default(3000),
});
export const env = EnvSchema.parse(process.env); // throws at boot if missing
```

**Async/await with layered error handling:**
```ts
// Service: throw typed errors
async function getUser(id: string): Promise<User> {
  const user = await db.users.findById(id);
  if (!user) throw new NotFoundError(`User ${id}`);
  return user;
}

// Route: catch and map to HTTP
router.get('/users/:id', async (req, res, next) => {
  try {
    res.json(await userService.getUser(req.params.id));
  } catch (err) {
    next(err); // global error middleware handles NotFoundError → 404
  }
});
```

---

## 5. Accessibility — Non-Negotiable

These are the difference between "built by a developer" and "built by an engineer."

**Keyboard navigation:**
- Every interactive element reachable via `Tab`
- `Enter` / `Space` activates buttons
- `Escape` closes modals, dropdowns, drawers
- Never use `<div onClick>` — use `<button>` (keyboard free), `<a href>` (link navigation)

**ARIA on icon-only buttons:**
```tsx
// ❌
<button onClick={close}>✕</button>

// ✅
<button onClick={close} aria-label="Close dialog">✕</button>
```

**Labels always linked:**
```tsx
<label htmlFor="email">Email</label>
<input id="email" type="email" aria-describedby="email-error" />
{errors.email && <p id="email-error" role="alert" className="text-red-400 text-sm">{errors.email.message}</p>}
```

**Color + something else for state:**
```tsx
// ❌ Color only
<span style={{ color: active ? 'green' : 'red' }}>{status}</span>

// ✅ Color + icon + text
<span className={active ? 'text-emerald-400' : 'text-red-400'}>
  {active ? '● Active' : '○ Inactive'}
</span>
```

**Focus management for modals:**
```ts
// On open: move focus to first focusable element inside the modal
// On close: return focus to the element that triggered the modal
const triggerRef = useRef<HTMLButtonElement>(null);
const handleClose = () => { setOpen(false); triggerRef.current?.focus(); };
```

**Contrast:** minimum 4.5:1 (WCAG AA). `text-zinc-400` on `bg-zinc-900` passes. `text-zinc-500` on `bg-white` fails.

---

## 6. Performance

**Tree-shake everything:**
```ts
// ❌ Pulls entire library
import _ from 'lodash';
// ✅ Pulls one function
import debounce from 'lodash/debounce';
import { clsx } from 'clsx'; // fine — library is already small
```

**Code-split routes:**
```tsx
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

<Suspense fallback={<PageSkeleton />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/settings" element={<Settings />} />
  </Routes>
</Suspense>
```

**Images:**
```tsx
<img src={hero} alt="Hero" loading="eager" />       {/* above fold */}
<img src={thumb} alt="Product" loading="lazy" />    {/* below fold */}
// Next.js: always next/image — automatic WebP, responsive sizing
```

**`useEffect` deps — complete or it's a bug:**
```ts
// ❌ Stale closure — userId is used but not in deps
useEffect(() => { fetchUser(userId); }, []);

// ✅
useEffect(() => { fetchUser(userId); }, [userId]);
```

**Virtual lists for 100+ rows:**
```tsx
import { FixedSizeList } from 'react-window';
<FixedSizeList height={600} itemCount={items.length} itemSize={72} width="100%">
  {({ index, style }) => <div style={style}><Row item={items[index]} /></div>}
</FixedSizeList>
```

**Search input + AbortController:**
```ts
const debouncedQuery = useDebounce(query, 300);
useEffect(() => {
  if (!debouncedQuery) return;
  const ctrl = new AbortController();
  fetch(`/api/search?q=${debouncedQuery}`, { signal: ctrl.signal })
    .then(r => r.json()).then(setResults)
    .catch(e => { if (e.name !== 'AbortError') console.error(e); });
  return () => ctrl.abort();
}, [debouncedQuery]);
```

---

## 7. Interaction & Animation Polish

**This section is mandatory for any user-facing UI.** These are the details that make the difference.

**Hover state on everything clickable — no exceptions:**
```tsx
// Card
<div className="rounded-2xl bg-zinc-800 border border-zinc-700 p-5
  hover:bg-zinc-750 hover:border-zinc-600 cursor-pointer
  transition-all duration-150">

// Button press
<button className="bg-indigo-600 hover:bg-indigo-500 active:scale-95
  transition-all duration-100 rounded-xl px-4 py-2.5 text-sm font-medium">
```

**Loading state on buttons — always:**
```tsx
<button disabled={isSubmitting} className="flex items-center gap-2 ...">
  {isSubmitting && <LoadingSpinner size={14} />}
  {isSubmitting ? 'Saving…' : 'Save Changes'}
</button>
```

**Page/route transitions with Framer Motion:**
```tsx
import { AnimatePresence, motion } from 'framer-motion';

// Wrap your router outlet
<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.12, ease: 'easeOut' }}
  >
    <Outlet />
  </motion.div>
</AnimatePresence>
```

**List item entrance:**
```tsx
<motion.div
  initial={{ opacity: 0, x: -8 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.18, delay: index * 0.04 }}
>
  <ItemCard item={item} />
</motion.div>
```

**Empty state — designed, not blank:**
```tsx
function EmptyState({ title, description, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="text-5xl">📭</div>
      <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
      <p className="text-sm text-zinc-400 max-w-xs">{description}</p>
      {ctaLabel && (
        <button onClick={onCta} className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500
          rounded-xl text-sm font-medium transition-colors duration-150">
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
```

**Error state — message + retry:**
```tsx
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <div className="text-4xl">⚠️</div>
      <p className="text-sm text-red-400">{message}</p>
      <button onClick={onRetry} className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700
        border border-zinc-700 text-sm transition-colors duration-150">
        Try Again
      </button>
    </div>
  );
}
```

**Notification/toast on success:** after a mutation completes, show a brief success toast — don't leave the user wondering if their action worked.

---

## 8. Vercel Deployment

### First deploy (interactive)
```bash
npm install -g vercel
vercel login                  # one-time auth
vercel                        # from project root — walks through setup
# → Which scope? arpitdhamija
# → Link to existing? N (new project)
# → Project name? match the GitHub repo
# → Output dir? dist (Vite) or auto (Next.js)
```

After setup you get a preview URL. Verify it works, then:
```bash
vercel --prod                 # promote to production URL
```

### Subsequent deploys
```bash
vercel --prod                 # deploy current state to production
# Or: push to main branch — Vercel auto-deploys if linked to GitHub
```

### Environment variables
```bash
vercel env add VITE_API_URL production
vercel env add VITE_API_URL preview
vercel env pull               # pulls all env vars into .env.local
vercel env ls                 # verify what's configured
```

**Variable prefixes:** Vite requires `VITE_` for browser-exposed vars. Next.js requires `NEXT_PUBLIC_`.

### Framework reference

| Framework | Build cmd | Output | Config |
|---|---|---|---|
| React + Vite | `npm run build` | `dist/` | None — auto-detected |
| Next.js | auto | auto | None — Vercel owns it |
| Static HTML | none | `.` | None |
| Express API | none | none | `vercel.json` required |

**`vercel.json` for an Express/Node API:**
```json
{
  "version": 2,
  "builds": [{ "src": "api/index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "/api/index.js" }]
}
```
Entry file must export the Express app as default from `api/index.js`.

### Diagnostics
```bash
vercel ls                         # list deployments
vercel logs [deployment-url]      # view runtime logs
vercel inspect [deployment-url]   # detailed deployment info
```

### After deploying — before posting deliverable
- [ ] Production URL (not preview URL) loads without console errors
- [ ] All env vars confirmed (`vercel env ls`)
- [ ] GitHub repo linked for auto-deploy: Vercel dashboard → Git
- [ ] Post **production URL** in Mission Control deliverable — not the preview URL

---

## 9. Pre-Submission Checklist

Run this before every push. If any item fails → fix it first.

**Architecture**
- [ ] Each component has one job?
- [ ] No business logic in UI components?
- [ ] No `any` — all types explicit?
- [ ] No prop drilling past 2 levels?

**State**
- [ ] No server data duplicated in `useState`?
- [ ] All `useEffect` dep arrays complete?
- [ ] No derived values stored as state?

**UI Quality (required — not optional)**
- [ ] Loading state shown while data is fetching? (skeleton, not spinner)
- [ ] Error state shown when API fails? (message + retry button)
- [ ] Empty state designed? (not blank screen)
- [ ] Every clickable element has hover + focus state?
- [ ] Buttons show loading state during submission?

**Accessibility**
- [ ] All interactive elements keyboard-accessible?
- [ ] Form inputs linked to `<label>` via `htmlFor`?
- [ ] Icon-only buttons have `aria-label`?
- [ ] State conveyed with color + icon/text (not color alone)?

**Performance**
- [ ] No full-library imports for single functions?
- [ ] `loading="lazy"` on below-fold images?
- [ ] Lists with 100+ items use virtual rendering?

**Code Quality**
- [ ] TypeScript compiles without errors?
- [ ] No console errors in browser?
- [ ] No unused imports, no commented-out code?
- [ ] No hardcoded secrets or magic numbers?

**Delivery**
- [ ] README: what it does, how to run, env vars needed?
- [ ] GitHub repo pushed with meaningful commits?
- [ ] If deployed: production URL pasted in deliverable?

---

## 10. Marketing / Landing Page Patterns

Marketing pages need **visual drama**. The bar is vercel.com, linear.app, stripe.com. A flat static page will be rejected. Every section must have animation, gradient, or glassmorphism. Nothing should look like a template.

### Sticky Nav with Blur Backdrop
```tsx
// components/Nav.tsx
export function Nav() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-zinc-950/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="text-white font-bold text-lg tracking-tight">QuantXData</span>
        <div className="hidden md:flex items-center gap-8">
          {['Products', 'Pricing', 'Docs', 'About'].map(item => (
            <a key={item} href={`/${item.toLowerCase()}`}
              className="text-sm text-zinc-400 hover:text-white transition-colors duration-150">
              {item}
            </a>
          ))}
        </div>
        <a href="/signup"
          className="text-sm bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-4 py-2 rounded-lg font-medium transition-all duration-150">
          Get API Key
        </a>
      </div>
    </nav>
  );
}
```

### Hero Section with Gradient + Framer Motion Entrance
```tsx
'use client';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden
      bg-gradient-to-br from-zinc-950 via-blue-950/20 to-zinc-950">
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
      {/* Glow effect */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
        w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-3xl" />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase
            text-blue-400 border border-blue-400/30 rounded-full px-4 py-1.5 mb-8">
            Institutional-Grade Crypto Data
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.05] mb-6"
        >
          The Data Behind<br />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Modern Trading
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Access tick-by-tick trade data, order books, and real-time streams across 120+ exchanges.
          No enterprise contract required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a href="/signup"
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-95
              text-white font-semibold rounded-xl transition-all duration-150 text-sm">
            Get API Key — Free
          </a>
          <a href="/docs"
            className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10
              text-white font-semibold rounded-xl transition-all duration-150 text-sm">
            View Docs →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
```

### Scroll-Triggered Section Reveal
```tsx
'use client';
import { motion } from 'framer-motion';

// Wrap any section content with this for scroll-triggered entrance
export function RevealSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

// Usage in any section:
// <RevealSection delay={0.1}><FeatureCard ... /></RevealSection>
```

### Animated Stats Counter
```tsx
'use client';
import { useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const start = performance.now();
    const frame = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setCount(Math.floor(eased * to));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [isInView, to]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export function StatsBar() {
  const stats = [
    { value: 120, suffix: '+', label: 'Exchanges' },
    { value: 99, suffix: '.9%', label: 'Uptime SLA' },
    { value: 7, suffix: '+', label: 'Years History' },
    { value: 100, suffix: 'ms', label: 'Max Latency' },
  ];

  return (
    <div className="border-y border-white/10 bg-white/[0.02] py-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map(({ value, suffix, label }) => (
          <div key={label} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">
              <Counter to={value} suffix={suffix} />
            </div>
            <div className="text-sm text-zinc-500">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Glassmorphism Feature Card
```tsx
export function FeatureCard({
  icon, title, description
}: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group relative rounded-2xl p-6
      backdrop-blur-sm bg-white/[0.03] border border-white/10
      hover:bg-white/[0.06] hover:border-white/20
      hover:-translate-y-1
      transition-all duration-200 cursor-pointer">
      {/* Gradient glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/0 to-cyan-600/0
        group-hover:from-blue-600/5 group-hover:to-cyan-600/5 transition-all duration-300" />

      <div className="relative">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20
          border border-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
          {icon}
        </div>
        <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
```

### Marketing Page Pre-Submission Checklist
Before pushing a marketing/landing page:
- [ ] Hero has gradient background + animated entrance (framer-motion)?
- [ ] Sticky nav with backdrop-blur?
- [ ] Stats bar with animated counters?
- [ ] Feature cards with glassmorphism + hover lift?
- [ ] Every section has scroll-triggered animation (whileInView)?
- [ ] At least one high-contrast CTA band (bg-gradient-to-r)?
- [ ] Footer with 4-col grid and social links?
- [ ] framer-motion installed and animations working?
- [ ] Mobile responsive (md: breakpoints on all layout)?
