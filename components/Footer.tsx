import Link from 'next/link';

const footerColumns = [
  {
    title: 'Navigation',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Articles', href: '/' },
      { label: 'RSS', href: '/rss.xml' },
    ],
  },
  {
    title: 'Social',
    links: [
      { label: 'GitHub', href: 'https://github.com/Mohammad77Radwan' },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800/70 bg-slate-950/65">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-10 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-sky-300">Articles & Veille Tech</p>
          <p className="mt-3 max-w-md text-sm leading-7 text-slate-300">
            Insights on AI, software architecture, and web engineering for builders shipping real products.
          </p>
          <p className="mt-4 text-xs text-slate-500">© {year} Mohammad Radwan. All rights reserved.</p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{column.title}</p>
            <div className="mt-4 flex flex-col gap-2">
              {column.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-slate-300 transition-colors hover:text-sky-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}