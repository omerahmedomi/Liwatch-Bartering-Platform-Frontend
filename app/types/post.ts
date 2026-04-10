export type PostType = "ITEM" | "SERVICE";
export type ExchangeType = "PERMANENT" | "TEMPORARY";

export interface PostImage {
  postImageUrl: string;
}

export interface PostUser {
  name?: string | null;
}

export interface PostItemDetails {
  condition?: string | null;
  estimatedValue?: number | null;
  partialCashAllowed?: boolean | null;
}

export interface PostServiceDetails {
  skillLevel?: string | null;
  serviceDuration?: string | null;
  availability?: string | null;
}

export interface Post {
  id?: string | number;
  postId?: string | number;
  title?: string;
  description?: string;
  category?: string | null;
  location?: string | null;
  postType?: PostType;
  exchangeType?: ExchangeType;
  postImages?: PostImage[];
  user?: PostUser | null;
  item?: PostItemDetails | null;
  service?: PostServiceDetails | null;
}
