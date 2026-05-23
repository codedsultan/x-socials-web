import { PostDetailView } from '@/modules/posts/components/post-detail-view';

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PostDetailView key={id} id={id} />;
}
