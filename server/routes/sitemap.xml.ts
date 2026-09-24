// server/routes/sitemap.xml.ts
import { sokoClient } from '../utils/sokoClient';
import type { Book } from '~/types';

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function formatDate(dateInput?: string | null): string {
  const fallback = new Date().toISOString().split('T')[0];
  if (!dateInput) return fallback;
  try {
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? fallback : d.toISOString().split('T')[0];
  } catch {
    return fallback;
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const siteUrl = (config.public.siteUrl || 'https://www.ebookreads.org').replace(/\/+$/, '');
  const storeSlug = config.public.storeSlug || 'flemela';
  const today = new Date().toISOString().split('T')[0];

  let books: Book[] = [];

  try {
    // 1. Fetch products with safe unwrap (handles both arrays and { products: [] } objects)
    const rawRes = await sokoClient<any>(`/public/stores/${storeSlug}/products?limit=1000`).catch(() => null);

    if (Array.isArray(rawRes)) {
      books = rawRes;
    } else if (rawRes && Array.isArray(rawRes.products)) {
      books = rawRes.products;
    } else if (rawRes && Array.isArray(rawRes.data)) {
      books = rawRes.data;
    }
  } catch (err) {
    console.error('[Sitemap] Failed to fetch catalog products, falling back to static routes:', err);
    books = [];
  }

  // 2. Build URL list with guaranteed static homepage
  const urlEntries: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [
    {
      loc: `${siteUrl}/`,
      lastmod: today,
      changefreq: 'daily',
      priority: '1.0',
    },
  ];

  // 3. Append published book slugs safely
  if (Array.isArray(books)) {
    for (const book of books) {
      if (book && typeof book.slug === 'string' && book.slug.trim()) {
        urlEntries.push({
          loc: `${siteUrl}/book/${encodeURIComponent(book.slug.trim())}`,
          lastmod: formatDate(book.updated_at || book.created_at),
          changefreq: 'weekly',
          priority: '0.8',
        });
      }
    }
  }

  // 4. Construct clean XML
  const xmlItems = urlEntries
    .map(
      (item) => `  <url>
    <loc>${escapeXml(item.loc)}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlItems}
</urlset>`;

  // 5. Send proper headers
  setHeader(event, 'content-type', 'application/xml; charset=utf-8');
  setHeader(event, 'cache-control', 'public, max-age=3600, s-maxage=7200');

  return xml;
});