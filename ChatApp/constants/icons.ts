import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

export type AppIconName =
  | 'chat'
  | 'shuffle'
  | 'person'
  | 'camera'
  | 'chevron-forward'
  | 'chevron-back'
  | 'chatbubbles'
  | 'log-out';

const IONICON_MAP: Record<AppIconName, ComponentProps<typeof Ionicons>['name']> = {
  chat: 'chatbubbles-outline',
  shuffle: 'shuffle-outline',
  person: 'person-outline',
  camera: 'camera-outline',
  'chevron-forward': 'chevron-forward',
  'chevron-back': 'chevron-back',
  chatbubbles: 'chatbubbles',
  'log-out': 'log-out-outline',
};

/** Map legacy emoji values from Firestore to icon names. */
const LEGACY_EMOJI: Record<string, AppIconName> = {
  '💬': 'chat',
  '🎲': 'shuffle',
  '👤': 'person',
  '📷': 'camera',
};

const VALID_NAMES = new Set<string>(Object.keys(IONICON_MAP));

export function resolveIconName(icon?: string): AppIconName {
  if (!icon) return 'chat';
  if (LEGACY_EMOJI[icon]) return LEGACY_EMOJI[icon];
  if (VALID_NAMES.has(icon)) return icon as AppIconName;
  return 'chat';
}

export function getIoniconName(name: AppIconName): ComponentProps<typeof Ionicons>['name'] {
  return IONICON_MAP[name];
}
