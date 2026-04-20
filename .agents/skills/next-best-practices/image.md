# Next.js Image Optimization

## The `next/image` Component

Automatically optimizes images for the Web: size formatting, modern formats (WebP/AVIF), and lazy loading.

```tsx
import Image from 'next/image'
import profilePic from './me.png' // Static import

export default function Page() {
  return (
    // Static imports don't need width/height (inferred)
    <Image
      src={profilePic}
      alt="Picture of the author"
      placeholder="blur" // Optional blur-up while loading
    />
  )
}
```

---

## Remote Images

External URLs require explicit width/height (or `fill`) and must be configured in `next.config.ts`.

```tsx
// Requires configuration!
<Image
  src="https://s3.amazonaws.com/mybucket/image.png"
  alt="Remote image"
  width={500}
  height={500}
/>
```

### Config for Remote Images

**Next.js 14+ / 15+:**

```ts
// next.config.ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        port: '',
        pathname: '/mybucket/**',
        search: '',
      },
    ],
  },
}

export default config
```

---

## Fill & Responsive Images

Use `fill` when the exact sizing is unknown. The image will grow to fill its nearest parent that has `position: relative` (or absolute/fixed).

```tsx
<div style={{ position: 'relative', width: '300px', height: '300px' }}>
  <Image
    src="/house.jpg"
    alt="House"
    fill
    style={{ objectFit: 'cover' }} // CSS required to maintain aspect ratio
    sizes="(max-width: 768px) 100vw, 300px" // CRITICAL for performance
  />
</div>
```

**Why `sizes` is critical:** If `fill` is used without `sizes`, Next.js assumes the image spans the full viewport width and will download a massive, unnecessarily large image size.

---

## Priority Loading

Add the `priority` prop to images that are visible above the fold (LCP elements). This disables lazy loading and preloads the image.

```tsx
<Image
  src="/hero.png"
  alt="Hero"
  width={1200}
  height={800}
  priority // <--- Preload this image
/>
```

---

## Custom Image Loader

To bypass Next.js built-in optimization and use a custom service (like Cloudinary, Imgix):

```ts
// next.config.ts
const config: NextConfig = {
  images: {
    loader: 'custom',
    loaderFile: './my-loader.ts',
  },
}
```

```ts
// my-loader.ts
export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}) {
  const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 'auto'}`]
  return `https://res.cloudinary.com/demo/image/upload/${params.join(',')}${src}`
}
```

---

## Self-Hosting Caveats (Next.js 15+)

When using the `standalone` output for self-hosting:

In Next.js 15+ prefers **`sharp`** for image optimization, especially in production/standalone mode. **Squoosh is no longer supported.**

Ensure you install `sharp` in your production environment to get fast image transformations:
```bash
npm install sharp
```

If you don't install `sharp`, Next.js falls back to Squoosh (which is much slower and uses a lot of memory).

---

## SVG Handling

By default, Next.js does NOT optimize SVGs via the image optimizer (as it can break them or increase size).

To allow SVG through Next.js Image:

```ts
// next.config.ts
const config: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}
```

Alternatively, use Turbopack's SVGR integration to import SVGs as React components:

```ts
// next.config.ts
const config: NextConfig = {
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
}
```
