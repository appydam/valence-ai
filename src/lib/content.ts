/**
 * Content loader utilities for MDX blog posts, comparisons, and glossary entries.
 * Returns empty results when content directory is not present (e.g. OSS builds).
 */

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  modified?: string;
  author?: string;
  category?: string;
  tags?: string[];
  ogImage?: string;
  readTime?: string;
}

// ── Blog manifest ────────────────────────────────────────────────────────────
const manifestModules = import.meta.glob("../../content/blog/manifest.json", { eager: false });
let _blogManifest: PostMeta[] | null = null;

export async function getBlogManifest(): Promise<PostMeta[]> {
  if (_blogManifest) return _blogManifest;
  try {
    const key = Object.keys(manifestModules)[0];
    if (!key) { _blogManifest = []; return _blogManifest; }
    const mod = await manifestModules[key]() as { default: PostMeta[] };
    _blogManifest = mod.default;
  } catch {
    _blogManifest = [];
  }
  return _blogManifest;
}

// ── Dynamic MDX loaders (gracefully empty when content/ not present) ─────────

const blogModules = import.meta.glob("../../content/blog/*.mdx", { eager: false });
const comparisonModules = import.meta.glob("../../content/comparisons/*.mdx", { eager: false });
const glossaryModules = import.meta.glob("../../content/glossary/*.mdx", { eager: false });

export async function loadBlogPost(slug: string) {
  const key = `../../content/blog/${slug}.mdx`;
  const loader = blogModules[key];
  if (!loader) return null;
  return (await loader()) as { default: React.ComponentType; frontmatter: PostMeta };
}

export async function loadComparison(slug: string) {
  const key = `../../content/comparisons/${slug}.mdx`;
  const loader = comparisonModules[key];
  if (!loader) return null;
  return (await loader()) as { default: React.ComponentType; frontmatter: PostMeta };
}

export async function loadGlossaryTerm(slug: string) {
  const key = `../../content/glossary/${slug}.mdx`;
  const loader = glossaryModules[key];
  if (!loader) return null;
  return (await loader()) as { default: React.ComponentType; frontmatter: PostMeta };
}

export async function getAllGlossaryTerms(): Promise<PostMeta[]> {
  const results: PostMeta[] = [];
  for (const [key, loader] of Object.entries(glossaryModules)) {
    try {
      const mod = (await loader()) as { frontmatter: PostMeta };
      if (mod.frontmatter) results.push(mod.frontmatter);
    } catch { /* skip */ }
  }
  return results.sort((a, b) => a.title.localeCompare(b.title));
}
