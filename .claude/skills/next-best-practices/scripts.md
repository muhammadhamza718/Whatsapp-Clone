# Next.js Scripts and Third-Party Optimization

## The `next/script` Component

Use `next/script` instead of native `<script>` tags to optimize loading of third-party scripts (analytics, ads, widgets).

```tsx
import Script from 'next/script'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Script src="https://example.com/script.js" />
      </body>
    </html>
  )
}
```

---

## Script Strategies (`strategy` prop)

Controls **when** the script loads.

| Strategy | Description | Best For |
|---|---|---|
| `beforeInteractive` | Loads before any Next.js code. Blocks page hydration. | Bot detectors, critical auth scripts (use sparingly). |
| The **Node.js** runtime is the default and provides full access to the Node.js API ecosystem.
- **Next.js 16 requirements**: Node.js 20.9.0+
- **Best Use Case**: Database access, complex parsing, heavy computations.
 |
| `lazyOnload` | Loads during browser idle time. | Chat widgets, social media plugins. |
| `worker` | (Experimental) Loads in a Web Worker using Partytown. | Heavy third-party scripts. |

### Example uses:

```tsx
// Critical - blocks rendering
<Script src="https://polyfill.io/v3/polyfill.min.js" strategy="beforeInteractive" />

// Default - loads early but non-blocking
<Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX" strategy="afterInteractive" />

// Low priority - waits for idle
<Script src="https://connect.facebook.net/en_US/sdk.js" strategy="lazyOnload" />
```

---

## Inline Scripts

To execute inline JavaScript safely:

```tsx
<Script id="show-banner" strategy="afterInteractive">
  {`document.getElementById('banner').classList.remove('hidden')`}
</Script>
```

Alternatively, pass a string to `dangerouslySetInnerHTML`:

```tsx
<Script
  id="google-analytics"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXX');
    `,
  }}
/>
```

> **Important**: Always provide a unique `id` prop when using inline scripts, so Next.js can track and optimize them.

---

## Executing Code After Load (`onLoad`)

Run code immediately after a third-party script finishes loading:

```tsx
'use client'

import Script from 'next/script'
import { useState } from 'react'

export default function StripeButton() {
  const [stripeLoaded, setStripeLoaded] = useState(false)

  return (
    <>
      <Script
        src="https://js.stripe.com/v3/"
        onLoad={() => setStripeLoaded(true)}
      />
      <button disabled={!stripeLoaded}>
        Checkout
      </button>
    </>
  )
}
```

```json
    "dev": "next dev",        // Default: Turbopack in v16+
    "build": "next build",    // Default: Turbopack in v16+
    "start": "next start",
    "lint": "next lint"
  },
```

> **Note:** In Next.js 15, use `next dev --turbo` for the faster development experience.

Other callbacks:
- `onReady`: Fires after load, and every time the component mounts.
- `onError`: Fires if the script fails to load.

---

## Web Worker Strategy (Partytown)

Moves third-party scripts off the main thread into a web worker, drastically improving Lighthouse scores.

1. Enable in `next.config.ts`:
```ts
const config: NextConfig = {
  experimental: {
    nextScriptWorkers: true,
  },
}
```

2. Run setup command:
```bash
npx @builder.io/partytown
```

3. Use the `worker` strategy:
```tsx
<Script src="https://example.com/heavy-widget.js" strategy="worker" />
```

> **Warning**: Not all scripts support running in a Web Worker (e.g., scripts that need deep DOM access). Test thoroughly.
