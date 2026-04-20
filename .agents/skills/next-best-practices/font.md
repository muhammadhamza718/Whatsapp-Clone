# Next.js Font Optimization

## `next/font` Basics

Next.js automatically downloads and hosts fonts at build time. No external network requests are made by the browser for fonts.

```tsx
import { Inter, Roboto_Mono } from 'next/font/google'

// Configure fonts
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Apply CSS variables to HTML
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

---

## Tailwind CSS Integration

After setting the CSS variables in `layout.tsx`, use them in Tailwind config:

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Matches the CSS variable name exported by next/font
        sans: ['var(--font-inter)'],
        mono: ['var(--font-roboto-mono)'],
      },
    },
  },
}
export default config
```

Usage in components:

```tsx
<h1 className="font-sans">Heading</h1>
<code className="font-mono">Code</code>
```

---

## Local Fonts

For custom font files (`.woff`, `.woff2`, `.ttf`):

```tsx
import localFont from 'next/font/local'

// Single weight
const myFont = localFont({
  src: './fonts/MyFont.woff2',
  display: 'swap',
})

// Multiple weights/styles
const myComplexFont = localFont({
  src: [
    {
      path: './fonts/Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/Italic.woff2',
      weight: '400',
      style: 'italic',
    },
  ],
  variable: '--font-complex',
  display: 'swap',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <body className={myComplexFont.className}>{children}</body>
}
```

---

## Best Practices

1. **Host at the root:** Define fonts exactly once in `app/layout.tsx`. If multiple pages need different subsets, define those in `layout.tsx` too. Calling `Inter()` multiple times in different files downloads it multiple times!
2. **Preload:** Next.js preloads fonts by default. If you know a font is only used on a specific page and not others, you can disable preloading globally and opt-in per component, but the default behavior is safe and fast.
3. **Always use WOFF2:** If using local fonts, only ship `.woff2` files. They are significantly smaller and supported everywhere modern.

---

## Preloading Behavior

When a font function is called in a file, it is preloaded on routes where that file is used.

```tsx
// Preloaded only on /about
const myFont = localFont({ src: './my-font.woff2' })

export default function About() {
  return <div className={myFont.className}>About</div>
}
```

To opt out of preloading:

```tsx
const inter = Inter({ preload: false })
```
