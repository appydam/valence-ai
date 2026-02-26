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
