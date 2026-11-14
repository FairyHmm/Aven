export type SpaceRole = "owner" | "editor" | "viewer";

export type SpaceMember = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: SpaceRole;
  addedAt: number;
};

export type SpaceTagColors = Record<string, string>;

export type SpaceFieldConfig = {
  lists: Record<string, string[]>;
  links: Record<string, string>;
  colors: Record<string, Record<string, string>>;
};

export type Space = {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  members: Record<string, SpaceMember>;
  tagColors?: SpaceTagColors;
  fieldConfig?: SpaceFieldConfig;
  createdAt: number;
  updatedAt: number;
};

export type Board = {
  id: string;
  spaceId: string;
  name: string;
  order: string;
  createdAt: number;
  updatedAt: number;
};

export type UserLookup = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
};
