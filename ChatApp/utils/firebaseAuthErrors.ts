/** Pesan ramah untuk kode error Firebase Auth (Bahasa Indonesia). */
export function getFirebaseAuthErrorMessage(error: unknown): string {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code?: string }).code)
      : '';

  const messages: Record<string, string> = {
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/user-disabled': 'Akun ini dinonaktifkan.',
    'auth/user-not-found': 'Email atau kata sandi salah.',
    'auth/wrong-password': 'Email atau kata sandi salah.',
    'auth/invalid-credential': 'Email atau kata sandi salah.',
    'auth/email-already-in-use': 'Email sudah terdaftar.',
    'auth/weak-password': 'Kata sandi terlalu lemah (minimal 6 karakter).',
    'auth/network-request-failed': 'Koneksi gagal. Periksa internet Anda.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
    'auth/operation-not-allowed': 'Metode masuk ini tidak diaktifkan di Firebase.',
  };

  if (messages[code]) return messages[code];
  if (error instanceof Error && error.message) return error.message;
  return 'Terjadi kesalahan. Coba lagi.';
}
