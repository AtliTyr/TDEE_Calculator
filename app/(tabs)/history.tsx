import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  History, 
  Calendar, 
  Flame, 
  TrendingDown, 
  TrendingUp,
  Lock,
  ArrowRight,
  LineChart,
  Target,
  UserPlus
} from 'lucide-react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function HistoryScreen() {
  const { isAuthenticated } = useAuth();
  
  // Заглушка данных (только для авторизованных)
  const historyData = [
    { id: '1', date: '15 янв', tdee: 2100, weight: 75, goal: 'loss' },
    { id: '2', date: '10 янв', tdee: 2150, weight: 76, goal: 'maintain' },
    { id: '3', date: '5 янв', tdee: 2200, weight: 77, goal: 'gain' },
    { id: '4', date: '1 янв', tdee: 2250, weight: 78, goal: 'loss' },
  ];

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <History size={28} color="#3B82F6" />
              <Text style={styles.title}>История</Text>
            </View>
            <Text style={styles.subtitle}>
              Ваши расчёты и прогресс
            </Text>
          </View>

          <View style={styles.lockContainer}>
            <View style={styles.lockIconContainer}>
              <Lock size={64} color="#9CA3AF" />
              <View style={styles.lockBadge}>
                <Text style={styles.lockBadgeText}>!</Text>
              </View>
            </View>
            <Text style={styles.lockTitle}>
              Требуется авторизация
            </Text>
            <Text style={styles.lockDescription}>
              Войдите в аккаунт для доступа к истории расчётов и отслеживанию прогресса
            </Text>
            
            <Link href="/auth/login" asChild>
              <TouchableOpacity style={styles.loginButton}>
                <ArrowRight size={20} color="white" />
                <Text style={styles.loginButtonText}>Войти в аккаунт</Text>
              </TouchableOpacity>
            </Link>
            
            <Link href="/auth/register" asChild>
              <TouchableOpacity style={styles.registerButton}>
                <UserPlus size={20} color="#3B82F6" />
                <Text style={styles.registerButtonText}>Зарегистрироваться</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Преимущества */}
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Что вы получите после входа:</Text>
            
            <View style={styles.benefitsGrid}>
              <View style={styles.benefitCard}>
                <View style={[styles.benefitIcon, { backgroundColor: '#EFF6FF' }]}>
                  <History size={24} color="#3B82F6" />
                </View>
                <Text style={styles.benefitTitle}>Вся история</Text>
                <Text style={styles.benefitDesc}>Все ваши расчёты в одном месте</Text>
              </View>
              
              <View style={styles.benefitCard}>
                <View style={[styles.benefitIcon, { backgroundColor: '#F0FDF4' }]}>
                  <LineChart size={24} color="#10B981" />
                </View>
                <Text style={styles.benefitTitle}>Графики</Text>
                <Text style={styles.benefitDesc}>Визуализация прогресса</Text>
              </View>
              
              <View style={styles.benefitCard}>
                <View style={[styles.benefitIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Target size={24} color="#F59E0B" />
                </View>
                <Text style={styles.benefitTitle}>Цели</Text>
                <Text style={styles.benefitDesc}>Отслеживание целей</Text>
              </View>
              
              <View style={styles.benefitCard}>
                <View style={[styles.benefitIcon, { backgroundColor: '#F5F3FF' }]}>
                  <Flame size={24} color="#8B5CF6" />
                </View>
                <Text style={styles.benefitTitle}>Аналитика</Text>
                <Text style={styles.benefitDesc}>Подробная статистика</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <History size={28} color="#3B82F6" />
            <Text style={styles.title}>История</Text>
          </View>
          <Text style={styles.subtitle}>
            Все ваши предыдущие расчёты
          </Text>
        </View>

        {historyData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Calendar size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>
              История пуста
            </Text>
            <Text style={styles.emptyDescription}>
              Выполните первый расчёт в калькуляторе, и он появится здесь
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Flame size={20} color="#F59E0B" />
                <Text style={styles.statValue}>2,150</Text>
                <Text style={styles.statLabel}>Средний TDEE</Text>
              </View>
              <View style={styles.statCard}>
                <TrendingDown size={20} color="#10B981" />
                <Text style={styles.statValue}>-2 кг</Text>
                <Text style={styles.statLabel}>Прогресс</Text>
              </View>
              <View style={styles.statCard}>
                <Calendar size={20} color="#3B82F6" />
                <Text style={styles.statValue}>4</Text>
                <Text style={styles.statLabel}>Записей</Text>
              </View>
            </View>

            <FlatList
              data={historyData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.historyItem}>
                  <View style={styles.historyHeader}>
                    <View style={styles.historyDate}>
                      <Calendar size={16} color="#6B7280" />
                      <Text style={styles.historyDateText}>{item.date}</Text>
                    </View>
                    <View style={[
                      styles.goalBadge,
                      item.goal === 'loss' && styles.goalBadgeLoss,
                      item.goal === 'gain' && styles.goalBadgeGain,
                    ]}>
                      <Text style={styles.goalBadgeText}>
                        {item.goal === 'loss' ? 'Похудение' : 
                         item.goal === 'gain' ? 'Набор' : 'Баланс'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.historyDetails}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>TDEE</Text>
                      <Text style={styles.detailValue}>{item.tdee} ккал</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Вес</Text>
                      <Text style={styles.detailValue}>{item.weight} кг</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Тренд</Text>
                      <Text style={[
                        styles.detailValue,
                        item.goal === 'loss' && { color: '#10B981' },
                        item.goal === 'gain' && { color: '#F59E0B' },
                      ]}>
                        {item.goal === 'loss' ? 'Снижение' : 
                         item.goal === 'gain' ? 'Рост' : 'Стабильно'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  lockContainer: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 24,
  },
  lockIconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  lockBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  lockTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  lockDescription: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 32,
    fontSize: 16,
    lineHeight: 24,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 12,
    width: '100%',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  benefitsSection: {
    marginTop: 8,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  benefitCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  benefitDesc: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyDescription: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 32,
  },
  historyItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyDateText: {
    fontSize: 16,
    color: '#6B7280',
  },
  goalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
  },
  goalBadgeLoss: {
    backgroundColor: '#D1FAE5',
  },
  goalBadgeGain: {
    backgroundColor: '#FEF3C7',
  },
  goalBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});