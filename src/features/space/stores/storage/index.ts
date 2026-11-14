import { STORAGE_MODE } from "../../../../shared/lib/storageMode";
import { firebaseSpaceStorage } from "./firebase";
import { localSpaceStorage } from "./local";
import type { SpaceStorage } from "./types";

export type { SpaceStorage } from "./types";

export const spaceStorage: SpaceStorage =
  STORAGE_MODE === "firebase" ? firebaseSpaceStorage : localSpaceStorage;
