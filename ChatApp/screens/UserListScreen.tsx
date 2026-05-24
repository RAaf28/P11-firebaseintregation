import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { colors, spacing, radius, shadows } from '../constants/theme';
import AppButton from '../components/AppButton';
import AppIcon from '../components/AppIcon';
import { getDmRoomId } from '../utils/rooms';
import { getFirestoreErrorMessage } from '../utils/firestoreErrors';
import { setOnlineStatus, updateOwnUserProfile } from '../utils/userProfile';
import { pickProfileImage, uploadProfilePhoto } from '../utils/profilePhoto';

type UserItem = { id: string; name: string; email: string; photoURL?: string };

export default function UserListScreen({ navigation }: any) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [myProfile, setMyProfile] = useState({ name: '', photoURL: '' });
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      navigation.replace('Login');
      return;
    }
    setOnlineStatus(true).catch(() => {});

    getDoc(doc(db, 'users', currentUser.uid)).then((snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setMyProfile({ name: d.name || currentUser.email || 'User', photoURL: d.photoURL || '' });
      }
    }).catch((err) => {
      Alert.alert('Gagal memuat profil', getFirestoreErrorMessage(err));
    });
  }, [currentUser, navigation]);

  useEffect(() => {
    if (!currentUser) return;

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as UserItem))
          .filter((u) => u.id !== currentUser.uid);
        list.sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email));
        setUsers(list);
      },
      (err) => Alert.alert('Gagal memuat user', getFirestoreErrorMessage(err))
    );

    return () => unsubUsers();
  }, [currentUser]);

  const openChat = (user: UserItem) => {
    if (!currentUser) return;
    const roomId = getDmRoomId(currentUser.uid, user.id);
    navigation.navigate('Chat', {
      roomId,
      roomTitle: user.name || user.email,
      otherUserId: user.id,
    });
  };

  const handleChangeMyPhoto = async () => {
    if (!currentUser) return;
    const uri = await pickProfileImage();
    if (!uri) return;

    try {
      const photoURL = await uploadProfilePhoto(uri, currentUser.uid);
      await updateOwnUserProfile({ photoURL });
      setMyProfile((prev) => ({ ...prev, photoURL }));
      Alert.alert('Berhasil', 'Foto profil Anda diperbarui.');
    } catch (err) {
      Alert.alert('Gagal', getFirestoreErrorMessage(err));
    }
  };

  const handleLogout = async () => {
    try {
      await setOnlineStatus(false);
    } catch {
      // Abaikan jika update gagal; tetap logout
    }
    await signOut(auth);
    navigation.replace('Login');
  };

  const renderUser = ({ item }: { item: UserItem }) => (
    <TouchableOpacity style={styles.card} onPress={() => openChat(item)} activeOpacity={0.7}>
      {item.photoURL ? (
        <Image source={{ uri: item.photoURL }} style={styles.userAvatar} />
      ) : (
        <View style={[styles.userAvatar, styles.userAvatarPlaceholder]}>
          <AppIcon name="person" size={22} color={colors.primary} />
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.name || 'User'}</Text>
        <Text style={styles.cardSub} numberOfLines={1}>{item.email}</Text>
      </View>
      <AppIcon name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleChangeMyPhoto} activeOpacity={0.8}>
          {myProfile.photoURL ? (
            <Image source={{ uri: myProfile.photoURL }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatar, styles.userAvatarPlaceholder]}>
              <AppIcon name="camera" size={22} color={colors.primary} />
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.greeting}>Halo,</Text>
          <Text style={styles.userName}>{myProfile.name}</Text>
          <Text style={styles.editPhotoHint}>Ketuk foto untuk ubah profil</Text>
        </View>
        <AppButton title="Keluar" onPress={handleLogout} variant="ghost" style={styles.logoutBtn} />
      </View>

      <Text style={styles.sectionTitle}>Chat dengan User</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        ListEmptyComponent={
          <Text style={styles.empty}>Belum ada user lain yang terdaftar.</Text>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerAvatar: { width: 48, height: 48, borderRadius: 24 },
  headerText: { flex: 1, marginLeft: spacing.md },
  greeting: { fontSize: 13, color: colors.textSecondary },
  userName: { fontSize: 18, fontWeight: '700', color: colors.text },
  editPhotoHint: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  logoutBtn: { paddingHorizontal: 8, minHeight: 40 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  userAvatar: { width: 44, height: 44, borderRadius: 22 },
  userAvatarPlaceholder: {
    backgroundColor: colors.bubbleMine,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: { flex: 1, marginLeft: spacing.md },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 },
});
