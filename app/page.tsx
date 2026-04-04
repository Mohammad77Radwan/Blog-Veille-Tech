import { getPosts } from '@/actions/postActions';
import { HomeExperience } from '@/components/home/HomeExperience';
import type { Article } from '@/types/blog';

export const dynamic = 'force-dynamic';

function estimateReadTimeFromContent(content: string): string {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 220));
  return `${minutes} min`;
}

export default async function Home() {
  const posts = await getPosts();
  const mappedPosts = posts.map((post) => ({
    slug: post.slug,
    article: {
      author: post.authorName,
      title: post.title,
      description: post.description,
      date: new Date(post.createdAt).toISOString(),
      readTime: estimateReadTimeFromContent(post.content),
      category: post.category,
    } satisfies Article,
  }));

  const featuredPosts = mappedPosts.slice(0, 2);
  const latestPosts = mappedPosts.slice(2);
  const categoryCount = new Set(posts.map((post) => post.category)).size;

  return (
    <HomeExperience
      posts={mappedPosts}
      featuredPosts={featuredPosts}
      latestPosts={latestPosts}
      categoryCount={categoryCount}
    />
  );
}
