export interface SocialUserSummary {
  id: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
  role?: string;
}

export interface SocialCommentRecord {
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  body: string;
  likes: number;
  dislikes: number;
  createdAt: string;
  updatedAt: string;
  author: SocialUserSummary;
}

export interface SocialCommentNode extends SocialCommentRecord {
  children: SocialCommentNode[];
}

export function buildCommentTree(comments: SocialCommentRecord[]): SocialCommentNode[] {
  const nodeMap = new Map<string, SocialCommentNode>();
  const roots: SocialCommentNode[] = [];

  for (const comment of comments) {
    nodeMap.set(comment.id, { ...comment, children: [] });
  }

  for (const comment of comments) {
    const node = nodeMap.get(comment.id);

    if (!node) {
      continue;
    }

    if (comment.parentId) {
      const parent = nodeMap.get(comment.parentId);
      if (parent) {
        parent.children.push(node);
        continue;
      }
    }

    roots.push(node);
  }

  return roots;
}