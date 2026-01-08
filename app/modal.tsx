import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Info } from 'lucide-react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function ModalScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const colors = {
    background: theme.background,
    text: theme.text,
    secondaryText: colorScheme === 'light' ? '#666' : '#A0A0A0',
    accent: '#3B82F6',
    accentText: 'white',
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 10,
      color: colors.text,
    },
    description: {
      fontSize: 16,
      textAlign: 'center',
      color: colors.secondaryText,
      marginBottom: 30,
      lineHeight: 24,
    },
    link: {
      padding: 15,
      backgroundColor: colors.accent,
      borderRadius: 10,
      minWidth: 150,
      alignItems: 'center',
    },
    linkText: {
      color: colors.accentText,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <Info size={48} color={colors.accent} />
      <Text style={styles.title}>О приложении</Text>
      <Text style={styles.description}>
        МетаБаланс - ваш персональный помощник в контроле калорий и метаболизма.
      </Text>
      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>Закрыть</Text>
      </Link>
    </View>
  );
}