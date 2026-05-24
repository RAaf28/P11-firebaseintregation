import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList,
  StyleSheet, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  collection, addDoc, onSnapshot,
  serverTimestamp, query, orderBy, doc, getDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { colors, spacing, radius } from '../constants/theme';
import AppButton from '../components/AppButton';
import AppIcon from '../components/AppIcon';
import { getFirestoreErrorMessage } from '../utils/firestoreErrors';

export default function ChatScreen({ navigation, route }: any) {
  const { roomId, roomTitle = 'Chat', otherUserId } = route.params ?? {};
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [peerPhoto, setPeerPhoto] = useState('');
  const [senderName, setSenderName] = useState('');
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      navigation.replace('Login');
    }
  }, [currentUser, navigation]);

  useEffect(() => {
    if (!currentUser || !roomId) return;

    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as { id: string; roomId?: string; [key: string]: unknown }))
          .filter((m) => m.roomId === roomId);
        setMessages(msgs);
      },
      (err) => Alert.alert('Gagal memuat pesan', getFirestoreErrorMessage(err))
    );
    return () => unsubscribe();
  }, [roomId, currentUser]);

  useEffect(() => {
    const fetchMyProfile = async () => {
      if (!currentUser) return;
      const snap = await getDoc(doc(db, 'users', currentUser.uid));
      if (snap.exists()) {
        const data = snap.data();
        setSenderName(data.name || currentUser.email || 'User');
      }
    };
    fetchMyProfile();
  }, [currentUser]);

  useEffect(() => {
    if (!otherUserId) return;

    const unsubPeer = onSnapshot(
      doc(db, 'users', otherUserId),
      (snap) => {
        if (snap.exists()) {
          setPeerPhoto(snap.data().photoURL || '');
        }
      },
      (err) => Alert.alert('Gagal memuat profil', getFirestoreErrorMessage(err))
    );

    return () => unsubPeer();
  }, [otherUserId]);

  const sendMessage = async () => {
    if (!text.trim() || !currentUser || !roomId) return;
    try {
      await addDoc(collection(db, 'messages'), {
        roomId,
        senderId: currentUser.uid,
        senderName,
        text: text.trim(),
        timestamp: serverTimestamp(),
      });
      setText('');
    } catch (err) {
      Alert.alert('Gagal mengirim', getFirestoreErrorMessage(err));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <AppIcon name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{roomTitle}</Text>
          <Text style={styles.headerSub}>Chat pribadi</Text>
        </View>
        <View style={styles.peerAvatarWrap}>
          {peerPhoto ? (
            <Image source={{ uri: peerPhoto }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <AppIcon name="person" size={18} color="#fff" />
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => {
          const isMine = item.senderId === currentUser?.uid;
          return (
            <View style={[styles.bubble, isMine ? styles.myBubble : styles.otherBubble]}>
              {!isMine && <Text style={styles.sender}>{item.senderName}</Text>}
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyChat}>Belum ada pesan. Mulai percakapan!</Text>
        }
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Ketik pesan..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />
          <AppButton title="Kirim" onPress={sendMessage} style={styles.sendBtn} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: colors.header,
  },
  backBtn: { paddingRight: 8, paddingVertical: 4 },
  headerCenter: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 },
  peerAvatarWrap: {},
  avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#fff' },
  avatarPlaceholder: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  messageList: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, flexGrow: 1 },
  bubble: { marginVertical: 4, padding: 12, borderRadius: radius.lg, maxWidth: '78%' },
  myBubble: { backgroundColor: colors.bubbleMine, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  otherBubble: {
    backgroundColor: colors.bubbleOther, alignSelf: 'flex-start', borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  sender: { fontSize: 11, color: colors.primary, fontWeight: '600', marginBottom: 4 },
  messageText: { fontSize: 15, color: colors.text, lineHeight: 20 },
  emptyChat: { textAlign: 'center', color: colors.textSecondary, marginTop: 48 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    maxHeight: 100,
    backgroundColor: colors.background,
  },
  sendBtn: { paddingHorizontal: 16, minHeight: 44 },
});
