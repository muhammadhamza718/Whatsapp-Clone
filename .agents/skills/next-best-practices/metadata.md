# Next.js Metadata

## Metadata Export

Exports from `layout.tsx` or `page.tsx` define metadata for that route segment.

```ts
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My App',
  description: 'App description',
}
```

---

## Dynamic Metadata

Used when metadata depends on dynamic data (like a post slug).

```ts
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next'

// Next.js 15+ Pattern: params is a Promise
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: [post.image],
    },
  }
}
```

---

## Title Template

Nested layouts inherit the parent's metadata. Use templates for consistent titles.

```ts
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    template: '%s | My App',
    default: 'My App',
  },
}
```

```ts
// app/about/page.tsx
export const metadata: Metadata = {
  title: 'About Us', // Renders as "About Us | My App"
}
```

---

## Generate Dynamic Image based Metadata

You can dynamically generate multiple images using `generateImageMetadata`.

```ts
// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)

  return new ImageResponse(
    (
      <div style={{ display: 'flex', fontSize: 48 }}>
        {post.title}
      </div>
    ),
    { ...size }
  )
}
```

---

## Static Metadata Files

Next.js automatically looks for predefined convention files in any `/app` directory:

| Filename | Purpose |
|---|---|
| `favicon.ico`, `icon.png`, `apple-icon.png` | Icons |
| `opengraph-image.png`, `twitter-image.png` | Open Graph and Twitter images |
| `robots.txt` | Crawler directives |
| `sitemap.xml` | Sitemap |

For programmatic generation of these, append `.js`, `.ts`, or `.tsx` (e.g., `sitemap.ts`, `icon.tsx`).

---

## Viewport Configurations

Viewport-related data is separate from general metadata and must be exported via `generateViewport`.

```ts
import type { Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: 'black',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}
```

Dynamic viewport:

```ts
export function generateViewport({ params }): Viewport {
  return {
    themeColor: params.theme === 'dark' ? 'black' : 'white',
  }
}
```

---

## JSON-LD Structured Data

Use standard HTML for JSON-LD.

```tsx
// app/product/[id]/page.tsx
export default async function Product({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.description,
  }

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1>{product.name}</h1>
    </section>
  )
}
```
