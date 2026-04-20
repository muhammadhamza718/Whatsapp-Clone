# Next.js Bundling

## App Router — Bundling Defaults (Next.js 15+)

In the **App Router**, external packages are **bundled by default**. Opt specific packages out using `serverExternalPackages`:

```ts
// next.config.ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  // Packages to exclude from App Router server bundle (load from node_modules at runtime)
  serverExternalPackages: ['sharp', '@prisma/client', 'canvas'],
}

export default config
```

> ⚠️ `experimental.serverComponentsExternalPackages` was renamed to `serverExternalPackages` (stable) in Next.js 15.

---

## Pages Router — Bundling Defaults

In the **Pages Router**, external packages are **NOT bundled by default**.

```ts
// next.config.ts
const config: NextConfig = {
  // Bundle all packages for Pages Router (matches App Router behavior)
  bundlePagesRouterDependencies: true,

  // Then opt specific ones out (applies to both routers)
  serverExternalPackages: ['@prisma/client'],
}
```

---

## Turbopack (Default in Next.js 16)

Turbopack is the **default bundler** for both development and production in Next.js 16.[1] It replaces webpack for most projects, offering significantly faster performance.

**Commands:**
```bash
next dev          # Now uses Turbopack by default in 16+
next build        # Now uses Turbopack by default in 16+
```

**Next.js 15 Usage:**
In Next.js 15, you must explicitly opt-in for development:
```bash
next dev --turbo
```

**Performance gains (Next.js 16 vs 14 Webpack):**
- Up to **76.7% faster** local server startup
- Up to **96.3% faster** Fast Refresh
- Up to **45.8% faster** initial route compile

**Turbopack config** (in `next.config.ts`):
```ts
const config: NextConfig = {
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
    resolveAlias: {
      'old-pkg': 'new-pkg',
    },
    resolveExtensions: ['.ts', '.tsx', '.js'],
  },
}
```

**File system cache for Turbopack:**
```ts
const config: NextConfig = {
  turbopackFileSystemCache: true, // persistent disk cache
}
```

---

## Webpack Config

For projects still using webpack (production builds always use webpack as of Next.js 15):

```ts
// next.config.ts
const config: NextConfig = {
  webpack(config, { buildId, dev, isServer, defaultLoaders }) {
    // Add custom loaders
    config.module.rules.push({
      test: /\.mdx$/,
      use: [defaultLoaders.babel, '@mdx-js/loader'],
    })

    // Alias packages
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-dom/server': 'react-dom/server.edge',
    }

    return config
  },
}
```

---

## Optimizing Package Imports

Auto tree-shake large icon/component libraries:

```ts
const config: NextConfig = {
  optimizePackageImports: [
    '@heroicons/react',
    '@radix-ui/react-icons',
    'lucide-react',
    'date-fns',
    'lodash-es',
  ],
}
```

This avoids the need for manual barrel import optimization like:
```ts
// Before (without optimizePackageImports)
import ChevronRight from '@heroicons/react/24/solid/ChevronRight'

// After (with optimizePackageImports — can use the barrel directly)
import { ChevronRightIcon } from '@heroicons/react/24/solid'
```

---

## Transpile External Packages

When you need to transpile ESM-only or non-standard external packages:

```ts
const config: NextConfig = {
  transpilePackages: ['my-esm-package', 'some-monorepo-pkg'],
}
```

---

## CSS Chunking

Control CSS chunk strategy (useful for large apps):

```ts
const config: NextConfig = {
  cssChunking: true,  // default: enables per-route CSS chunks
  // or
  cssChunking: 'loose', // merge shared chunks (smaller total CSS)
}
```

---

## Bundle Analyzer

Add `@next/bundle-analyzer` to inspect server and client bundles:

```bash
npm install --save-dev @next/bundle-analyzer
```

```ts
// next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer({
  // your next config
})
```

```bash
ANALYZE=true npm run build
```

---

## Server-Only / Client-Only Guards

Prevent server code from accidentally being imported on the client:

```ts
// lib/db.ts
import 'server-only' // throws at build time if imported by client code
```

```ts
// lib/analytics.ts
import 'client-only' // throws at build time if imported by server code
```

---

## Inline CSS (Experimental)

Inline critical CSS into the HTML to reduce render-blocking requests:

```ts
const config: NextConfig = {
  experimental: {
    inlineCss: true,
  },
}
```

---

## Output Modes

```ts
const config: NextConfig = {
  output: 'standalone',  // Self-contained server output (Docker-friendly)
  // output: 'export',  // Static HTML export (no server)
}
```

**Standalone** output bundles only necessary files for production, creating `.next/standalone/`.

---

## Common Bundling Issues

### Native modules breaking SSR

```ts
const config: NextConfig = {
  serverExternalPackages: ['bcryptjs', 'sharp', 'canvas'],
}
```

### ESM / CJS Interop

If a package only ships ESM but causes issues in the server bundle:

```ts
const config: NextConfig = {
  transpilePackages: ['esm-only-pkg'],
}
```

### Reducing Client Bundle Size

1. Use `lazy()` and dynamic imports for heavy components
2. Avoid importing large libraries in `'use client'` files
3. Use `optimizePackageImports` for icon libraries
4. Check bundle with `@next/bundle-analyzer`

```tsx
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // if not needed for SEO
})
```
