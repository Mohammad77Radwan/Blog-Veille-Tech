import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface ContentArticle {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  readTime: string;
  createdAt: Date;
}

const contentDirectory = path.join(process.cwd(), 'content', 'articles');

function normalizeFrenchDateToken(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace('.', '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function parseFrenchDate(rawDate: string): Date {
  const months: Record<string, number> = {
    janv: 0,
    janvier: 0,
    fev: 1,
    fevr: 1,
    fevrier: 1,
    mars: 2,
    avr: 3,
    avril: 3,
    mai: 4,
    juin: 5,
    juil: 6,
    juillet: 6,
    aout: 7,
    sept: 8,
    septembre: 8,
    oct: 9,
    octobre: 9,
    nov: 10,
    novembre: 10,
    dec: 11,
    decembre: 11,
  };

  const parts = rawDate.split(/\s+/).map((part) => normalizeFrenchDateToken(part));
  if (parts.length < 3) {
    return new Date(0);
  }

  const day = Number(parts[0]);
  const month = months[parts[1]];
  const year = Number(parts[2]);

  if (!Number.isFinite(day) || month === undefined || !Number.isFinite(year)) {
    return new Date(0);
  }

  return new Date(Date.UTC(year, month, day));
}

function parseDateFlexible(rawDate: string): Date | null {
  const trimmed = rawDate.trim();
  if (!trimmed) {
    return null;
  }

  const nativeParsed = new Date(trimmed);
  if (!Number.isNaN(nativeParsed.getTime())) {
    return nativeParsed;
  }

  const frenchParsed = parseFrenchDate(trimmed);
  if (!Number.isNaN(frenchParsed.getTime()) && frenchParsed.getTime() > 0) {
    return frenchParsed;
  }

  return null;
}

export async function getContentArticles(): Promise<ContentArticle[]> {
  let files: string[] = [];
  try {
    files = await fs.readdir(contentDirectory);
  } catch {
    return [];
  }

  const articleFiles = files.filter((file) => file.endsWith('.mdx'));

  const articles = await Promise.all(
    articleFiles.map(async (fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(contentDirectory, fileName);
      const rawFile = await fs.readFile(fullPath, 'utf8');
      const stats = await fs.stat(fullPath);
      const { data, content } = matter(rawFile);

      const title = String(data.title ?? '').trim();
      const description = String(data.description ?? '').trim();
      const category = String(data.category ?? '').trim();
      const readTime = String(data.readTime ?? '').trim();
      const date = String(data.date ?? '').trim();
      const parsedDate = parseDateFlexible(date);

      return {
        id: `content-${slug}`,
        slug,
        title,
        description,
        content,
        category,
        readTime,
        createdAt: parsedDate ?? stats.mtime,
      } satisfies ContentArticle;
    }),
  );

  return articles.filter((article) => article.title && article.content);
}

export async function getContentArticleBySlug(slug: string): Promise<ContentArticle | null> {
  const articles = await getContentArticles();
  return articles.find((article) => article.slug === slug) ?? null;
}
