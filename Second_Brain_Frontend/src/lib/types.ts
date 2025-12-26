// Content types
export type ContentType =
  | "twitter"
  | "instagram"
  | "linkedin"
  | "facebook"
  | "tiktok"
  | "reddit"
  | "youtube"
  | "vimeo"
  | "twitch"
  | "dailymotion"
  | "github"
  | "gitlab"
  | "codepen"
  | "codesandbox"
  | "stackoverflow"
  | "replit"
  | "medium"
  | "dev"
  | "hashnode"
  | "substack"
  | "article"
  | "spotify"
  | "soundcloud"
  | "apple-music"
  | "imgur"
  | "pinterest"
  | "flickr"
  | "image"
  | "google-docs"
  | "notion"
  | "dropbox"
  | "document"
  | "video"
  | "audio"
  | "other";

export type CategoryType =
  | "social"
  | "video"
  | "code"
  | "article"
  | "audio"
  | "image"
  | "document"
  | "other";

export interface Content {
  id: string;
  link: string;
  type: ContentType;
  category: CategoryType;
  domain?: string;
  title: string;
  description?: string;
  thumbnail?: string;
  tags?: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  username: string;
  token: string;
}

export interface SignupData {
  username: string;
  password: string;
}

export interface SigninData {
  username: string;
  password: string;
}

export interface CreateContentData {
  link: string;
  title: string;
  type?: ContentType;
  description?: string;
  thumbnail?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ContentResponse {
  success: boolean;
  content: Content[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface CategoryCount {
  category: CategoryType;
  count: number;
}

export interface CategoriesResponse {
  success: boolean;
  categories: CategoryCount[];
}
