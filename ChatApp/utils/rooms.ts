/** ID room DM deterministik (tidak perlu dokumen di Firestore). */
export function getDmRoomId(uidA: string, uidB: string): string {
  return ['dm', ...[uidA, uidB].sort()].join('_');
}
