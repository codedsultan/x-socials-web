// ─── Envelope ─────────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PageMeta {
  limit: number;
  hasMore: boolean;
  // Offset
  page?: number;
  total?: number;
  totalPages?: number;
  // Cursor / Keyset
  nextCursor?: string | null;
  prevCursor?: string | null;
}

export interface PagedResult<T> {
  items: T[];
  meta: PageMeta;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface CurrentUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name?: string;
    email: string;
    createdAt?: string;
  };
  tokens: AuthTokens;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name?: string;
  email: string;
  suspended?: boolean;
  createdAt?: string;
  followerCount?: number;
  followingCount?: number;
  isFollowedByMe?: boolean;
}

export interface FollowStatusResponse {
  followerId: string;
  followingId: string;
  following: boolean;
}

export interface UpdateProfileDto {
  name?: string;
}

// ─── Post ─────────────────────────────────────────────────────────────────────

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  tags: string[];
  likesCount: number;
  deletedAt?: string | null;
  deletionReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeedItem extends Post {
  likedByMe: boolean;
}

export interface CreatePostDto {
  title: string;
  content: string;
  tags?: string[];
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  tags?: string[];
}

// ─── Comment ──────────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentId?: string | null;
  deletedAt?: string | null;
  deletionReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCommentDto {
  content: string;
  parentId?: string;
}

// ─── Like ─────────────────────────────────────────────────────────────────────

export type LikeTarget = 'post' | 'comment';

export interface LikeResponse {
  liked: boolean;
  targetId: string;
  targetType: LikeTarget;
}
