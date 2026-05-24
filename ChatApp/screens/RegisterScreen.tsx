import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { getFirebaseAuthErrorMessage } from '../utils/firebaseAuthErrors';
import { getFirestoreErrorMessage } from '../utils/firestoreErrors';
import { pickProfileImage, uploadProfilePhoto } from '../utils/profilePhoto';
import ScreenLayout from '../components/ScreenLayout';
import ProfileAvatarPicker from '../components/ProfileAvatarPicker';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import { colors, spacing } from '../constants/theme';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePickPhoto = async () => {
    const uri = await pickProfileImage();
    if (uri) setPhotoUri(uri);
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Perhatian', 'Nama wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      let photoURL = '';
      if (photoUri) {
        photoURL = await uploadProfilePhoto(photoUri, uid);
      }

      // Rules: write hanya ke /users/{request.auth.uid}
      await setDoc(doc(db, 'users', userCred.user.uid), {
        name: name.trim(),
        email: userCred.user.email ?? email,
        photoURL,
        isOnline: true,
      });

      Alert.alert('Berhasil', 'Akun berhasil dibuat.', [
        { text: 'OK', onPress: () => navigation.replace('UserList') },
      ]);
    } catch (error: unknown) {
      const msg =
        error && typeof error === 'object' && 'code' in error &&
        String((error as { code?: string }).code).startsWith('auth/')
          ? getFirebaseAuthErrorMessage(error)
          : getFirestoreErrorMessage(error);
      Alert.alert('Registrasi gagal', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout scroll>
      <View style={styles.card}>
        <Text style={styles.title}>Buat Akun</Text>
        <Text style={styles.subtitle}>Lengkapi profil untuk mulai chat</Text>

        <ProfileAvatarPicker
          imageUri={photoUri}
          onPress={handlePickPhoto}
          label={photoUri ? 'Ganti foto profil' : 'Pilih foto profil (opsional)'}
        />

        <AppTextInput label="Nama" placeholder="Nama lengkap" value={name} onChangeText={setName} />
        <AppTextInput
          label="Email"
          placeholder="email@contoh.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <AppTextInput
          label="Password"
          placeholder="Minimal 6 karakter"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <AppButton title="Daftar" onPress={handleRegister} loading={loading} />
        <AppButton
          title="Sudah punya akun? Login"
          onPress={() => navigation.navigate('Login')}
          variant="ghost"
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
  },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, textAlign: 'center' },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.lg,
  },
});
