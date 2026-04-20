# Next.js Self-Hosting and Advanced Caching

## Standalone Output (Docker / Custom Servers)

Next.js can automatically create a standalone folder that copies only the necessary files for a production deployment (including `node_modules`).

```ts
// next.config.ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  output: 'standalone',
}

export default config
```

Build the app:
```bash
npm run build
```

This creates a `.next/standalone/` directory.

### Running the Standalone Server

```bash
# Set environment variables
export NODE_ENV=production
export PORT=3000

# Run the standalone entrypoint
node .next/standalone/server.js
```

### Static Assets in Standalone

The standalone build does **NOT** copy the `public/` or `.next/static/` folders by default (it assumes a CDN handles them). If you are running a single-server deployment without a CDN, you must copy them over in your Dockerfile:

```dockerfile
# (Inside Dockerfile after build step)
COPY --from=builder /app/public ./standalone/public
COPY --from=builder /app/.next/static ./standalone/.next/static
```

---

## sharp Integration (Next.js 15+)

React 19, included in Next.js 15+, significantly improves hydration error messaging with a more detailed overlay and better diffs.
, the framework automatically detects and uses the `sharp` package for very fast image optimization if it is installed. 

Previously, you had to manually ensure it was installed. Now, Next.js explicitly recommends it.

**Requirement:** Ensure `sharp` is installed in your production environment/Dockerfile.
```bash
npm install sharp
```
If missing, it falls back to WebAssembly Squoosh, which is significantly slower and uses more RAM.

---

## Cache-Control Headers Control (Next.js 15+)

When self-hosting, Next.js 15+ allows you to customize the `Cache-Control` header directives for static assets and ISR pages.

```ts
// next.config.ts
const config: NextConfig = {
  expireTime: 3600, // Customize stale-while-revalidate duration
}
```
*Note: In Edge deployments like Vercel, the platform handles caching logic automatically. These settings primarily affect self-hosted Node.js servers.*

---

## Custom Cache Handler (Multi-Instance Cache)

By default, Next.js stores its cache (Route Handlers, ISR, Client Router Cache, Server Actions) on the local filesystem.

If you deploy to **multiple servers/pods** behind a load balancer, they will have isolated caches. To share the cache across instances, configure a custom cache handler (e.g., backed by Redis).

### 1. Configure the Cache Handler

```ts
// next.config.ts
const config: NextConfig = {
  cacheHandler: require.resolve('./cache-handler.js'),
  cacheMaxMemorySize: 0, // Disable local memory cache
}
```

### 2. Implement the Handler (Redis Example)

```js
// cache-handler.js
const { createClient } = require('redis')

const client = createClient({ url: process.env.REDIS_URL })
client.connect()

module.exports = class CacheHandler {
  constructor(options) {
    this.options = options
  }

  async get(key) {
    try {
      const data = await client.get(key)
      if (!data) return null
      return JSON.parse(data)
    } catch (err) {
      return null
    }
  }

  async set(key, data, ctx) {
    try {
      await client.set(key, JSON.stringify({
        value: data,
        lastModified: Date.now(),
        tags: ctx.tags,
      }))
    } catch {}
  }

  async revalidateTag(tag) {
    // Requires custom logic to find and delete keys by tag in Redis
    // Or a secondary index mapping tags -> keys
  }
}
```

---

## Memory Limitations and Caching

The default Next.js cache can grow significantly.

**Limit memory cache size:**
```ts
// next.config.ts
const config: NextConfig = {
  cacheMaxMemorySize: 50 * 1024 * 1024, // 50MB (default is 50MB)
}
```

**Clear filesystem cache during deployments:**
Make sure your deployment process does NOT persist the `.next/cache` directory between blue/green deployments, unless you specifically want to keep stale cache, as it can grow unbounded.

---

## Middleware & Proxying in Self-Hosted

If you use a reverse proxy (NGINX, Caddy) in front of a self-hosted Next.js app:

1. **Host/IP Headers:** Ensure your proxy forwards headers correctly.
```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

2. **Trusting Proxies:** Next.js automatically respects `X-Forwarded-*` headers, allowing `req.url` in middleware to read the correct HTTPS scheme even if the node server runs on HTTP.

---

## Engine Requirements (Next.js 16+)

Next.js 16 has increased the minimum Node.js version.
- **Node.js**: 20.9.0+
- **Sized Package Manager**: (e.g. npm 10+, pnpm 9+)

> [!WARNING]
> Deploying Next.js 16 on Node.js 18 will fail with runtime errors.

## New Cache Components (`'use cache: remote'`)

In Next.js 15+, the new Cache Component model supports explicit remote caching via directives.

```tsx
'use cache: remote'

export async function GlobalStats() {
  const stats = await db.query()
  return <Stats stats={stats} />
}
```
This requires a `cacheHandler` configured in `next.config.ts`.
