import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';
import AppIcon from './AppIcon';

type Props = {
  imageUri: string | null;
  onPress: () => void;
  size?: number;
  label?: string;
};

export default function ProfileAvatarPicker({
  imageUri,
  onPress,
  size = 96,
  label = 'Pilih foto profil',
}: Props) {
  return (
    <TouchableOpacity style={styles.wrap} onPress={onPress} activeOpacity={0.8}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} />
      ) : (
        <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
          <AppIcon name="camera" size={32} color={colors.textSecondary} />
        </View>
      )}
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 20 },
  avatar: { borderWidth: 3, borderColor: colors.primary },
  placeholder: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: { marginTop: 8, fontSize: 13, color: colors.primary, fontWeight: '600' },
});
