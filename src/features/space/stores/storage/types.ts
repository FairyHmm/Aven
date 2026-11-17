import type {
  Board,
  Space,
  SpaceFieldConfig,
  SpaceMember,
  SpaceRole,
  SpaceTagColors,
  UserLookup,
} from "../../lib/types";

export type SpaceStorage = {
  subscribeSpaces: (
    uid: string,
    onData: (spaces: Space[]) => void,
    onError: (error: Error) => void,
  ) => () => void;
  subscribeBoards: (
    spaceId: string,
    onData: (boards: Board[]) => void,
    onError: (error: Error) => void,
  ) => () => void;
  createSpace: (name: string, owner: UserLookup) => Promise<Space>;
  renameSpace: (spaceId: string, name: string) => Promise<void>;
  deleteSpace: (spaceId: string) => Promise<void>;
  createBoard: (spaceId: string, name: string, order: string) => Promise<Board>;
  renameBoard: (
    spaceId: string,
    boardId: string,
    name: string,
  ) => Promise<void>;
  deleteBoard: (spaceId: string, boardId: string) => Promise<void>;
  reorderBoard: (
    spaceId: string,
    boardId: string,
    order: string,
  ) => Promise<void>;
  findUserByEmail: (email: string) => Promise<UserLookup | undefined>;
  addMember: (spaceId: string, member: SpaceMember) => Promise<void>;
  updateMemberRole: (
    spaceId: string,
    uid: string,
    role: SpaceRole,
  ) => Promise<void>;
  removeMember: (spaceId: string, uid: string) => Promise<void>;
  saveSettings: (
    spaceId: string,
    patch: { tagColors?: SpaceTagColors; fieldConfig?: SpaceFieldConfig },
  ) => Promise<void>;
};
