import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

/** Tulis hanya dokumen /users/{auth.uid} — sesuai Firestore rules. */
export async function updateOwnUserProfile(
  data: Record<string, unknown>
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('unauthenticated');
  await updateDoc(doc(db, 'users', uid), data);
}

export async function setOnlineStatus(isOnline: boolean): Promise<void> {
  await updateOwnUserProfile({ isOnline });
}
