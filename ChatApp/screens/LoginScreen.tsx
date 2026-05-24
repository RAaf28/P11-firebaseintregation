import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { getFirebaseAuthErrorMessage } from '../utils/firebaseAuthErrors';
import ScreenLayout from '../components/ScreenLayout';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import AppIcon from '../components/AppIcon';
import { colors, spacing, radius } from '../constants/theme';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Berhasil', 'Login berhasil.', [
        { text: 'OK', onPress: () => navigation.replace('UserList') },
      ]);
    } catch (error: unknown) {
      Alert.alert('Login gagal', getFirebaseAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout scroll>
      <View style={styles.hero}>
        <View style={styles.logoWrap}>
          <AppIcon name="chatbubbles" size={40} color={colors.primary} />
        </View>
        <Text style={styles.title}>ChatApp</Text>
        <Text style={styles.subtitle}>Masuk untuk melanjutkan obrolan</Text>
      </View>

      <View style={styles.card}>
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
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <AppButton title="Masuk" onPress={handleLogin} loading={loading} />
        <AppButton
          title="Belum punya akun? Daftar"
          onPress={() => navigation.navigate('Register')}
          variant="ghost"
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: spacing.lg },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.bubbleMine,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginTop: 12 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
  },
});
