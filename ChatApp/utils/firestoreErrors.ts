/** Pesan ramah untuk error Firestore (Bahasa Indonesia). */
export function getFirestoreErrorMessage(error: unknown): string {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code?: string }).code)
      : '';

  const messages: Record<string, string> = {
    'permission-denied': 'Akses ditolak. Pastikan Anda sudah login.',
    'unauthenticated': 'Sesi habis. Silakan login kembali.',
    'not-found': 'Data tidak ditemukan.',
    'unavailable': 'Firestore tidak tersedia. Coba lagi nanti.',
  };

  if (messages[code]) return messages[code];
  if (error instanceof Error && error.message) return error.message;
  return 'Terjadi kesalahan pada database.';
}
