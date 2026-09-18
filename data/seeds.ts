// data/seeds.ts
// =============================================================================
// Permanent Seed Collection with Real Catalog Prioritization & Fuzzy Suppression
// =============================================================================

import type { Book } from '~/types';

export interface SeedBook extends Book {
  isSeed: true;
}

export const MONTHLY_TOP_SEEDS: SeedBook[] = [
  {
    id: 'seed-atomic-habits',
    org_id: 'seed-ebookreads',
    category_id: 'cat-self-help',
    category_name: 'Psychology & Self-Help',
    name: 'Atomic Habits',
    slug: 'atomic-habits',
    author: 'James Clear',
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones.',
    price: 149,
    compare_at_price: 290,
    status: 'published',
    badge: 'NO1_PICK',
    images: [{ 
      image_url: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg', 
      image_public_id: 'seed_atomic_habits', 
      sort_order: 0 
    }],
    formats: [
      { id: 'seed-fmt-2', product_id: 'seed-atomic-habits', format: 'pdf', price: 149, compare_at_price: 290, file_url: null, file_public_id: null, file_size_bytes: null, stock: null, created_at: '', updated_at: '' }
    ],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    isSeed: true,
  },
  {
    id: 'seed-dont-make-me-think',
    org_id: 'seed-ebookreads',
    category_id: 'cat-business',
    category_name: 'Business & Finance',
    name: "Don't Make Me Think",
    slug: 'dont-make-me-think',
    author: 'Steve Krug',
    description: 'A Common Sense Approach to Web Usability.',
    price: 149,
    compare_at_price: 210,
    status: 'published',
    badge: 'NO1_PICK',
    images: [{ 
      image_url: 'https://covers.openlibrary.org/b/isbn/9780321965516-L.jpg', 
      image_public_id: 'seed_dont_make_me_think', 
      sort_order: 0 
    }],
    formats: [
      { id: 'seed-fmt-4', product_id: 'seed-dont-make-me-think', format: 'pdf', price: 149, compare_at_price: 210, file_url: null, file_public_id: null, file_size_bytes: null, stock: null, created_at: '', updated_at: '' }
    ],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    isSeed: true,
  },
  {
    id: 'seed-psychology-of-money',
    org_id: 'seed-ebookreads',
    category_id: 'cat-finance',
    category_name: 'Business & Finance',
    name: 'The Psychology of Money',
    slug: 'psychology-of-money',
    author: 'Morgan Housel',
    description: 'Timeless lessons on wealth, greed, and happiness.',
    price: 149,
    compare_at_price: 215,
    status: 'published',
    badge: 'NO1_PICK',
    images: [{ 
      image_url: 'https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg', 
      image_public_id: 'seed_psych_money', 
      sort_order: 0 
    }],
    formats: [
      { id: 'seed-fmt-6', product_id: 'seed-psychology-of-money', format: 'pdf', price: 149, compare_at_price: 215, file_url: null, file_public_id: null, file_size_bytes: null, stock: null, created_at: '', updated_at: '' }
    ],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    isSeed: true,
  },
  {
    id: 'seed-deep-work',
    org_id: 'seed-ebookreads',
    category_id: 'cat-self-help',
    category_name: 'Psychology & Self-Help',
    name: 'Deep Work',
    slug: 'deep-work',
    author: 'Cal Newport',
    description: 'Rules for Focused Success in a Distracted World.',
    price: 149,
    compare_at_price: 205,
    status: 'published',
    badge: 'NO1_PICK',
    images: [{ 
      image_url: 'https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg', 
      image_public_id: 'seed_deep_work', 
      sort_order: 0 
    }],
    formats: [
      { id: 'seed-fmt-7', product_id: 'seed-deep-work', format: 'pdf', price: 149, compare_at_price: 205, file_url: null, file_public_id: null, file_size_bytes: null, stock: null, created_at: '', updated_at: '' }
    ],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    isSeed: true,
  },
];

export const DEALS_SEEDS: SeedBook[] = [
  {
    id: 'seed-48-laws-of-power',
    org_id: 'seed-ebookreads',
    category_id: 'cat-self-help',
    category_name: 'Psychology & Self-Help',
    name: 'The 48 Laws of Power',
    slug: '48-laws-of-power',
    author: 'Robert Greene',
    description: 'Amoral, cunning, and instructive wisdom on mastery.',
    price: 199,
    compare_at_price: 300,
    status: 'published',
    badge: 'DEAL_OF_WEEK',
    images: [{ 
      image_url: 'https://covers.openlibrary.org/b/isbn/9780140280197-L.jpg', 
      image_public_id: 'seed_48_laws', 
      sort_order: 0 
    }],
    formats: [
      { id: 'seed-fmt-8', product_id: 'seed-48-laws-of-power', format: 'pdf', price: 199, compare_at_price: 300, file_url: null, file_public_id: null, file_size_bytes: null, stock: null, created_at: '', updated_at: '' }
    ],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    isSeed: true,
  },
  {
    id: 'seed-rich-dad-poor-dad',
    org_id: 'seed-ebookreads',
    category_id: 'cat-finance',
    category_name: 'Business & Finance',
    name: 'Rich Dad Poor Dad',
    slug: 'rich-dad-poor-dad',
    author: 'Robert T. Kiyosaki',
    description: 'What the rich teach their kids about money.',
    price: 149,
    compare_at_price: 230,
    status: 'published',
    badge: 'DEAL_OF_WEEK',
    images: [{ 
      image_url: 'https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg', 
      image_public_id: 'seed_rich_dad', 
      sort_order: 0 
    }],
    formats: [
      { id: 'seed-fmt-9', product_id: 'seed-rich-dad-poor-dad', format: 'pdf', price: 149, compare_at_price: 230, file_url: null, file_public_id: null, file_size_bytes: null, stock: null, created_at: '', updated_at: '' }
    ],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    isSeed: true,
  },
  {
    id: 'seed-the-alchemist',
    org_id: 'seed-ebookreads',
    category_id: 'cat-fiction',
    category_name: 'Fiction & Literature',
    name: 'The Alchemist',
    slug: 'the-alchemist',
    author: 'Paulo Coelho',
    description: 'A magical fable about following your dream.',
    price: 149,
    compare_at_price: 220,
    status: 'published',
    badge: 'DEAL_OF_WEEK',
    images: [{ 
      image_url: 'https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg', 
      image_public_id: 'seed_the_alchemist', 
      sort_order: 0 
    }],
    formats: [
      { id: 'seed-fmt-10', product_id: 'seed-the-alchemist', format: 'pdf', price: 149, compare_at_price: 220, file_url: null, file_public_id: null, file_size_bytes: null, stock: null, created_at: '', updated_at: '' }
    ],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    isSeed: true,
  },
  {
    id: 'seed-1984',
    org_id: 'seed-ebookreads',
    category_id: 'cat-fiction',
    category_name: 'Fiction & Literature',
    name: '1984',
    slug: '1984-george-orwell',
    author: 'George Orwell',
    description: 'The dystopian masterpiece of surveillance and truth.',
    price: 149,
    compare_at_price: 225,
    status: 'published',
    badge: 'DEAL_OF_WEEK',
    images: [{ 
      image_url: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg', 
      image_public_id: 'seed_1984', 
      sort_order: 0 
    }],
    formats: [
      { id: 'seed-fmt-11', product_id: 'seed-1984', format: 'pdf', price: 149, compare_at_price: 225, file_url: null, file_public_id: null, file_size_bytes: null, stock: null, created_at: '', updated_at: '' }
    ],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    isSeed: true,
  },
];

function normalizeTitleForComparison(title?: string | null): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '');
}

function titlesMatch(a: string, b: string): boolean {
  const normA = normalizeTitleForComparison(a);
  const normB = normalizeTitleForComparison(b);
  if (!normA || !normB) return false;
  if (normA === normB) return true;
  // Substring containment for subtitles (e.g. "Atomic Habits: Proven Way...")
  if (normA.length >= 4 && normB.length >= 4) {
    if (normA.includes(normB) || normB.includes(normA)) {
      return true;
    }
  }
  return false;
}

/**
 * Merges real store books with fallback seeds:
 * 1. Takes prioritized real books (e.g. tagged with BESTSELLER).
 * 2. Backfills shelf from other published books in store catalog before reaching for seeds.
 * 3. Suppresses any seed whose title or slug matches ANY book in the merchant's store.
 */
export function mergeWithSeeds(
  realBooks: Book[] | null | undefined,
  seedCollection: SeedBook[],
  targetCount = 4,
  fullStoreCatalog: Book[] = []
): Book[] {
  const real = Array.isArray(realBooks) ? [...realBooks] : [];

  if (real.length >= targetCount) {
    return real;
  }

  // Combine display books and entire store catalog to build suppression set
  const allKnownRealBooks = [...real, ...fullStoreCatalog];
  const knownSlugs = new Set(allKnownRealBooks.map((b) => (b?.slug || '').toLowerCase().trim()));
  const knownNames = allKnownRealBooks.map((b) => b?.name || '');

  // Backfill with real published catalog books first
  if (fullStoreCatalog.length > 0) {
    const existingIds = new Set(real.map((b) => b.id));
    for (const storeBook of fullStoreCatalog) {
      if (real.length >= targetCount) break;
      if (!existingIds.has(storeBook.id) && storeBook.status !== 'archived') {
        real.push(storeBook);
        existingIds.add(storeBook.id);
      }
    }
  }

  if (real.length >= targetCount) {
    return real;
  }

  // Suppress any seed matching any real book in store
  const eligibleSeeds = seedCollection.filter((seed) => {
    const seedSlug = (seed.slug || '').toLowerCase().trim();
    if (knownSlugs.has(seedSlug)) return false;

    return !knownNames.some((realName) => titlesMatch(realName, seed.name));
  });

  const needed = targetCount - real.length;
  return [...real, ...eligibleSeeds.slice(0, needed)];
}