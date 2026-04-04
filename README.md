# Blog Veille Tech

A production-ready developer blog built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **lucide-react icons**.

## Features

✨ **Design System**

- Strict dark mode with deep space navy design (`bg-[#0A0F1C]`)
- Clean Inter sans-serif typography
- Cards with subtle hover animations (`hover:-translate-y-1`)
- Responsive grid and list layouts

📁 **Project Structure**

- Fully typed components with TypeScript
- Featured articles grid (responsive 1-2 columns)
- Latest articles list with metadata (date, read time, category)
- Tag badges for article categories
- Icons from lucide-react (Calendar, Clock, ArrowRight)

🎨 **Components**

- `TagBadge`: Reusable category pills
- `FeaturedArticleCard`: Grid-based featured articles
- `ListArticleCard`: List-based article display
- Responsive mobile-first layouts

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: lucide-react
- **Font**: Inter (from next/font/google)

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Development

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the blog.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```text
Blog-Veille-Tech/
├── app/
│   ├── layout.tsx           # Root layout with metadata
│   ├── globals.css          # Global Tailwind styles
│   └── page.tsx             # Home page with articles
├── components/
│   ├── TagBadge.tsx         # Category badge component
│   ├── FeaturedArticleCard.tsx   # Featured article card
│   └── ListArticleCard.tsx   # List article card
├── types/
│   └── blog.ts              # Article interface
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
├── next.config.js           # Next.js configuration
├── postcss.config.js        # PostCSS configuration
└── package.json             # Dependencies
```

## Design System

### Colors

- **Background**: `#0A0F1C` (deep space navy)
- **Card**: `#131A2B`
- **Text Primary**: `text-slate-100`
- **Text Secondary**: `text-slate-400`
- **Border**: `border-slate-800/50`
- **Category Tag**: `bg-indigo-950/50 text-indigo-300`

### Typography

- **Font**: Inter (from next/font)
- **Heading 1**: `text-4xl md:text-5xl font-bold`
- **Heading 2**: `text-2xl md:text-3xl font-semibold`
- **Card Title**: `text-lg font-semibold`
- **List Title**: `text-base font-semibold`
- **Meta Text**: `text-xs text-slate-400`

### Spacing

- **Container**: `max-w-5xl mx-auto px-6 py-12`
- **Section Gap**: `mb-16`
- **Card Gap**: `gap-6` (featured), `gap-4` (list)

## Extending the Blog

### Adding New Articles

Edit `app/page.tsx` to add articles to the `featuredArticles` or `latestArticles` arrays:

```typescript
const featuredArticles: Article[] = [
  {
    title: 'Article Title',
    description: 'Short description...',
    date: '1 jan',
    readTime: '5 min',
    category: 'Category',
  },
  // Add more articles...
];
```

### Customizing Colors

Update the custom colors in `tailwind.config.ts`:

```typescript
colors: {
  'space-navy': '#0A0F1C',
  'card-dark': '#131A2B',
}
```

## Performance Optimizations

- Server components by default (faster rendering)
- Image optimization ready
- CSS bundle optimized with Tailwind
- Zero JavaScript for static content

## License

MIT

## Author

Mohammad Radwan
