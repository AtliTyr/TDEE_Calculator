import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';

export function useColorScheme() {
  const { colorScheme } = useContext(ThemeContext);
  return colorScheme;
}