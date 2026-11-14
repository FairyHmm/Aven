import type { SpaceMember, SpaceRole, UserLookup } from "../../lib/types";

export async function spaceSdk() {
  const [{ firestore: db }, fs] = await Promise.all([
    import("../../../../shared/lib/firebase/app"),
    import("firebase/firestore"),
  ]);
  return { db, fs };
}

export async function findUserByEmail(
  email: string,
): Promise<UserLookup | undefined> {
  const { db, fs } = await spaceSdk();
  const clean = email.trim().toLowerCase();
  if (clean === "") return undefined;
  const snap = await fs.getDocs(
    fs.query(fs.collection(db, "users"), fs.where("emailLower", "==", clean)),
  );
  const first = snap.docs[0];
  if (first === undefined) return undefined;
  const d = first.data();
  return {
    uid: first.id,
    email: typeof d.email === "string" ? d.email : clean,
    displayName: typeof d.displayName === "string" ? d.displayName : clean,
    photoURL: typeof d.photoURL === "string" ? d.photoURL : null,
  };
}

export async function addSpaceMember(
  spaceId: string,
  member: SpaceMember,
): Promise<void> {
  const { db, fs } = await spaceSdk();
  await fs.updateDoc(fs.doc(db, "spaces", spaceId), {
    memberIds: fs.arrayUnion(member.uid),
    [`members.${member.uid}`]: member,
    updatedAt: Date.now(),
  });
}

export async function updateSpaceMemberRole(
  spaceId: string,
  uid: string,
  role: SpaceRole,
): Promise<void> {
  const { db, fs } = await spaceSdk();
  await fs.updateDoc(fs.doc(db, "spaces", spaceId), {
    [`members.${uid}.role`]: role,
    updatedAt: Date.now(),
  });
}

export async function removeSpaceMember(
  spaceId: string,
  uid: string,
): Promise<void> {
  const { db, fs } = await spaceSdk();
  await fs.updateDoc(fs.doc(db, "spaces", spaceId), {
    memberIds: fs.arrayRemove(uid),
    [`members.${uid}`]: fs.deleteField(),
    updatedAt: Date.now(),
  });
}
