'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AvatarFallback, AvatarImage, AvatarWrapper } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { createPost } from '@/actions/postActions';
import { deletePostAction, togglePostPublishedAction, updateUserRoleAction } from '@/actions/adminActions';

type AdminDashboardData = {
  metrics: {
    totalUsers: number;
    totalPosts: number;
    totalComments: number;
    totalLikes: number;
    totalFollows: number;
  };
  users: Array<{
    id: string;
    clerkId: string;
    email: string;
    name: string | null;
    imageUrl: string | null;
    role: string;
    createdAt: string;
    counts: {
      posts: number;
      comments: number;
      likes: number;
      followers: number;
      following: number;
    };
  }>;
  posts: Array<{
    id: string;
    slug: string;
    title: string;
    description: string;
    category: string;
    readTime: string;
    authorName: string;
    source: string;
    published: boolean;
    shareCount: number;
    createdAt: string;
    counts: {
      likes: number;
      comments: number;
    };
    author: {
      id: string | null;
      name: string | null;
      email: string | null;
      imageUrl: string | null;
      role: string | null;
    } | null;
  }>;
  comments: Array<{
    id: string;
    body: string;
    createdAt: string;
    post: {
      id: string;
      slug: string;
      title: string;
    };
    author: {
      id: string;
      name: string | null;
      email: string;
      imageUrl: string | null;
      role: string | null;
    };
  }>;
  topPosts: Array<{
    id: string;
    title: string;
    slug: string;
    likes: number;
    comments: number;
    shares: number;
  }>;
};

interface AdminDashboardProps {
  data: AdminDashboardData;
}

export function AdminDashboard({ data }: AdminDashboardProps) {
  const chartData = useMemo(
    () =>
      data.topPosts.map((post) => ({
        name: post.title.length > 14 ? `${post.title.slice(0, 14)}...` : post.title,
        engagement: post.likes + post.comments + post.shares,
      })),
    [data.topPosts],
  );

  return (
    <main className="min-h-screen relative overflow-hidden">
      <span className="mesh-accent" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-6 py-12 relative space-y-8">
        <header className="glass-shell p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-sky-300">Admin dashboard</p>
              <h1 className="mt-2 text-3xl md:text-5xl font-bold text-slate-100">Social platform control center</h1>
              <p className="mt-3 max-w-3xl text-slate-400">
                Moderate users and posts, review engagement, and monitor community activity from a single workspace.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <Metric label="Users" value={data.metrics.totalUsers} />
              <Metric label="Posts" value={data.metrics.totalPosts} />
              <Metric label="Comments" value={data.metrics.totalComments} />
              <Metric label="Likes" value={data.metrics.totalLikes} />
              <Metric label="Follows" value={data.metrics.totalFollows} />
            </div>
          </div>
        </header>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="flex flex-wrap gap-2 bg-transparent p-0">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Top engagement</CardTitle>
                  <CardDescription>Posts ranked by combined likes, comments, and shares.</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: 12,
                        }}
                      />
                      <Bar dataKey="engagement" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Latest activity</CardTitle>
                  <CardDescription>Recent comments from the community.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.comments.map((comment) => (
                    <div key={comment.id} className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-4">
                      <div className="flex items-center gap-3">
                        <AvatarWrapper className="h-9 w-9">
                          <AvatarImage src={comment.author.imageUrl ?? undefined} alt={comment.author.name ?? comment.author.email} />
                          <AvatarFallback>{(comment.author.name ?? comment.author.email).slice(0, 2).toUpperCase()}</AvatarFallback>
                        </AvatarWrapper>
                        <div>
                          <p className="text-sm font-medium text-slate-100">{comment.author.name ?? comment.author.email}</p>
                          <p className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: enUS })}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-slate-300 line-clamp-3">{comment.body}</p>
                      <p className="mt-3 text-xs text-slate-500">On {comment.post.title}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Manage users</CardTitle>
                <CardDescription>Update roles for access control and moderation.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <AvatarWrapper className="h-10 w-10">
                              <AvatarImage src={user.imageUrl ?? undefined} alt={user.name ?? user.email} />
                              <AvatarFallback>{(user.name ?? user.email).slice(0, 2).toUpperCase()}</AvatarFallback>
                            </AvatarWrapper>
                            <div>
                              <p className="font-medium text-slate-100">{user.name ?? 'Anonymous'}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge>{user.role}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-300">
                          {user.counts.posts} posts · {user.counts.comments} comments · {user.counts.likes} likes
                        </TableCell>
                        <TableCell className="text-sm text-slate-400">
                          {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: enUS })}
                        </TableCell>
                        <TableCell className="text-right">
                          <form action={updateUserRoleAction} className="inline-flex items-center gap-2">
                            <input type="hidden" name="userId" value={user.id} />
                            <Select name="role" defaultValue={user.role}>
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USER">USER</SelectItem>
                                <SelectItem value="MODERATOR">MODERATOR</SelectItem>
                                <SelectItem value="ADMIN">ADMIN</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button type="submit" size="sm" variant="secondary">
                              Save
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create a post</CardTitle>
                <CardDescription>Publish a database-backed post directly from the admin area.</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={createPost} className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input name="title" placeholder="Title" required />
                    <Input name="category" placeholder="Category" required />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input name="readTime" placeholder="Read time, e.g. 6 min" required />
                    <Input name="description" placeholder="Short description" required />
                  </div>
                  <Textarea name="content" placeholder="Article body in Markdown" className="min-h-40" required />
                  <div className="flex justify-end">
                    <Button type="submit">Create post</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manage posts</CardTitle>
                <CardDescription>Toggle publication state or remove a post from the platform.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Post</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-100">{post.title}</p>
                            <p className="text-xs text-slate-500">/{post.slug}</p>
                            <p className="mt-2 text-sm text-slate-400 line-clamp-2">{post.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge>{post.source}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={post.published ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'}>
                            {post.published ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-300">
                          {post.counts.likes} likes · {post.counts.comments} comments · {post.shareCount} shares
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <form action={togglePostPublishedAction}>
                              <input type="hidden" name="postId" value={post.id} />
                              <input type="hidden" name="published" value={String(post.published)} />
                              <Button type="submit" size="sm" variant="secondary">
                                {post.published ? 'Unpublish' : 'Publish'}
                              </Button>
                            </form>
                            <form action={deletePostAction}>
                              <input type="hidden" name="postId" value={post.id} />
                              <Button type="submit" size="sm" variant="destructive">
                                Delete
                              </Button>
                            </form>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total follows</CardTitle>
                  <CardDescription>How many audience relationships exist.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-slate-100">{data.metrics.totalFollows}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Top post</CardTitle>
                  <CardDescription>Highest combined engagement right now.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-slate-100">{data.topPosts[0]?.title ?? 'No posts yet'}</p>
                  <p className="text-sm text-slate-400 mt-2">
                    {data.topPosts[0]
                      ? `${data.topPosts[0].likes} likes · ${data.topPosts[0].comments} comments · ${data.topPosts[0].shares} shares`
                      : 'Publish content to generate engagement data.'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Coverage</CardTitle>
                  <CardDescription>Admin surface and platform health.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300 leading-7">
                    Users, posts, comments, likes, and follow relationships are all backed by Prisma models and can be moderated from this dashboard.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-100">{value}</p>
    </div>
  );
}