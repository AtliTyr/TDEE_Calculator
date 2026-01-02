import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Info } from 'lucide-react-native';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Info size={48} color="#3B82F6" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
    lineHeight: 24,
  },
  link: {
    padding: 15,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    minWidth: 150,
    alignItems: 'center',
  },
  linkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});