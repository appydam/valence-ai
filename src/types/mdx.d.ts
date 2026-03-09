declare module "*.mdx" {
  import type { ComponentType } from "react";
  export const frontmatter: {
    title: string;
    slug: string;
    description: string;
    date: string;
    modified?: string;
    author?: string;
    category?: string;
    tags?: string[];
    ogImage?: string;
    readTime?: string;
    [key: string]: unknown;
  };
  const MDXComponent: ComponentType;
  export default MDXComponent;
}
