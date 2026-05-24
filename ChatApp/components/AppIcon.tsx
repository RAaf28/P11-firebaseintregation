import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import { getIoniconName, resolveIconName } from '../constants/icons';

type Props = {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
};

export default function AppIcon({ name, size = 22, color = colors.primary, style }: Props) {
  const resolved = resolveIconName(name);
  return (
    <Ionicons
      name={getIoniconName(resolved)}
      size={size}
      color={color}
      style={style}
    />
  );
}
