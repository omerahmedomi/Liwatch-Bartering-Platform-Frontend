export type CreatePostType = "ITEM" | "SERVICE";
export type CreatePostExchangeType = "PERMANENT" | "TEMPORARY";
export type CreatePostItemCondition = "NEW" | "USED";
export type CreatePostSkillLevel = "BEGINNER" | "EXPERT";

export interface CreatePostItemState {
  condition: CreatePostItemCondition;
  estimatedValue: string;
  partialCashAllowed: boolean;
}

export interface CreatePostServiceState {
  serviceDuration: string;
  skillLevel: CreatePostSkillLevel;
  availability: string;
}

export interface CreatePostFormState {
  postType: CreatePostType;
  title: string;
  description: string;
  category: string;
  exchangeType: CreatePostExchangeType;
  location: string;
  lookingFor: string;
  termsAgreed: boolean;
  item: CreatePostItemState;
  service: CreatePostServiceState;
}
