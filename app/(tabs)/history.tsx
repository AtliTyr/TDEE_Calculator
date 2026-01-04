// screens/HistoryScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
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
  UserPlus,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronRight,
  Filter,
  Scale,
  Activity as ActivityIcon,
  Ruler,
  User,
  Clock,
  Info,
  X,
  CalendarDays,
  ChevronDown
} from 'lucide-react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/api/client';

type Calculation = {
  id: string;
  user_id: string;
  goal_id: number;
  input_data: {
    weight: number;
    height: number;
    age: number;
    gender: 'male' | 'female';
    activity_level: string;
    activity_level_id: number;
    goal: string;
  };
  results: {
    bmr: number;
    tdee: number;
    calorie_target: number;
    coefficient: number;
    formula_used: string;
  };
  created_at: string;
};

type HistoryStats = {
  total: number;
  last_7_days: number;
  last_30_days: number;
  average_calories?: number;
  most_common_goal?: string;
};

// Русские названия месяцев
const MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

const MONTHS_SHORT = [
  'янв', 'фев', 'мар', 'апр', 'мая', 'июн',
  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
];

// Типы фильтров
type FilterType = 'all' | 'week' | 'month' | 'custom';

export default function HistoryScreen() {
  const { isAuthenticated } = useAuth();
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [customDays, setCustomDays] = useState<string>('7');
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Форматирование даты
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = MONTHS[date.getMonth()];
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day} ${month} ${year}, ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  // Форматирование краткой даты
  const formatShortDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = MONTHS_SHORT[date.getMonth()];
      
      return `${day} ${month}`;
    } catch {
      return dateString;
    }
  };

  // Получение параметров фильтрации для API
  const getFilterParams = (filterType: FilterType, customDaysValue?: string) => {
    switch (filterType) {
      case 'week':
        return { days: 7 };
      case 'month':
        return { days: 30 };
      case 'custom':
        const days = parseInt(customDaysValue || customDays);
        return { days: isNaN(days) ? 7 : Math.max(1, Math.min(365, days)) };
      case 'all':
      default:
        return {}; // Пустой объект = все время
    }
  };

  // Загрузка данных
  const loadData = async (filterType: FilterType = 'all', customDaysValue?: string) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Получаем параметры фильтрации
      const params = getFilterParams(filterType, customDaysValue);
      
      // Формируем строку запроса
      const queryParams = new URLSearchParams();
      if (params.days) {
        queryParams.append('days', params.days.toString());
      }
      queryParams.append('limit', '50');
      
      const queryString = queryParams.toString();
      const url = queryString ? `/calculations/?${queryString}` : '/calculations/';
      
      console.log('Загрузка данных по URL:', url);
      
      // Загружаем историю расчетов
      const historyResponse = await apiFetch(url);
      
      // Загружаем статистику
      const statsResponse = await apiFetch('/calculations/stats/summary');
      
      setCalculations(historyResponse.calculations || []);
      setStats(statsResponse.stats || null);
      
    } catch (err: any) {
      console.error('Ошибка загрузки истории:', err);
      console.error('Детали ошибки:', err.message, err.response?.status, err.response?.data);
      
      let errorMessage = 'Не удалось загрузить данные. Проверьте подключение к интернету.';
      
      if (err.response?.status === 404) {
        errorMessage = 'API endpoint не найден. Проверьте настройки сервера.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Ошибка сервера. Попробуйте позже.';
      } else if (err.message?.includes('Network Error')) {
        errorMessage = 'Нет подключения к серверу. Проверьте интернет.';
      }
      
      setError(errorMessage);
      Alert.alert('Ошибка', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Обновление при изменении фильтра
  useEffect(() => {
    if (isAuthenticated) {
      loadData(filter);
    }
  }, [isAuthenticated, filter]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(filter);
  };

  // Применение кастомного фильтра
  const applyCustomFilter = () => {
    const days = parseInt(customDays);
    if (isNaN(days) || days < 1 || days > 365) {
      Alert.alert('Ошибка', 'Введите число от 1 до 365');
      return;
    }
    
    setFilter('custom');
    setShowCustomModal(false);
    loadData('custom', customDays);
  };

  // Получение названия цели
  const getGoalName = (goalId: number): string => {
    switch (goalId) {
      case 1: return 'Похудеть';
      case 2: return 'Поддерживать';
      case 3: return 'Набрать';
      default: return 'Неизвестно';
    }
  };

  // Получение иконки цели
  const getGoalIcon = (goalId: number) => {
    switch (goalId) {
      case 1: return <TrendingDown size={16} color="#EF4444" />;
      case 2: return <Minus size={16} color="#3B82F6" />;
      case 3: return <TrendingUp size={16} color="#10B981" />;
      default: return <Target size={16} color="#6B7280" />;
    }
  };

  // Получение цвета цели
  const getGoalColor = (goalId: number): string => {
    switch (goalId) {
      case 1: return '#EF4444';
      case 2: return '#3B82F6';
      case 3: return '#10B981';
      default: return '#6B7280';
    }
  };

  // Получение названия уровня активности
  const getActivityLevelName = (code: string): string => {
    const levels: Record<string, string> = {
      'sedentary': 'Сидячий',
      'light': 'Легкая',
      'moderate': 'Умеренная',
      'high': 'Высокая',
      'extreme': 'Экстремальная'
    };
    return levels[code] || code;
  };

  // Расчет прогресса по весу
  const calculateWeightProgress = (): { change: number; percent: number; direction: 'up' | 'down' | 'same' } => {
    if (calculations.length < 2) {
      return { change: 0, percent: 0, direction: 'same' };
    }

    const sortedCalculations = [...calculations].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const firstWeight = sortedCalculations[0].input_data.weight;
    const lastWeight = sortedCalculations[sortedCalculations.length - 1].input_data.weight;
    const change = lastWeight - firstWeight;
    const percent = firstWeight > 0 ? (change / firstWeight) * 100 : 0;

    if (Math.abs(change) < 0.1) return { change, percent, direction: 'same' };
    return { change, percent, direction: change > 0 ? 'up' : 'down' };
  };

  // Расчет среднего TDEE
  const calculateAverageTDEE = (): number => {
    if (calculations.length === 0) return 0;
    const sum = calculations.reduce((acc, calc) => acc + calc.results.tdee, 0);
    return Math.round(sum / calculations.length);
  };

  // Получение описания текущего фильтра
  const getFilterDescription = (): string => {
    switch (filter) {
      case 'week':
        return 'За последние 7 дней';
      case 'month':
        return 'За последние 30 дней';
      case 'custom':
        const days = parseInt(customDays);
        return `За последние ${days} ${getDaysWord(days)}`;
      case 'all':
      default:
        return 'За все время';
    }
  };

  // Склонение слова "день"
  const getDaysWord = (days: number): string => {
    const lastDigit = days % 10;
    const lastTwoDigits = days % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'дней';
    }
    
    switch (lastDigit) {
      case 1:
        return 'день';
      case 2:
      case 3:
      case 4:
        return 'дня';
      default:
        return 'дней';
    }
  };

  // Экраны для неавторизованных пользователей
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
              <Text style={styles.title}>История расчетов</Text>
            </View>
            <Text style={styles.subtitle}>
              Все ваши предыдущие расчеты TDEE в одном месте
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
              История доступна только авторизованным пользователям
            </Text>
            <Text style={styles.lockDescription}>
              Войдите в аккаунт, чтобы отслеживать прогресс, анализировать изменения и видеть полную историю всех расчетов
            </Text>
            
            <View style={styles.authButtons}>
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
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Экраны для авторизованных пользователей
  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <History size={28} color="#3B82F6" />
              <View style={styles.headerTitle}>
                <Text style={styles.title}>История расчетов</Text>
                <Text style={styles.subtitle}>
                  {calculations.length > 0 
                    ? `${calculations.length} расчетов • ${getFilterDescription()}` 
                    : 'Здесь появятся ваши расчеты'}
                </Text>
              </View>
            </View>
          </View>

          {/* Фильтры */}
          <View style={styles.filtersContainer}>
            <Text style={styles.filtersTitle}>Период:</Text>
            <View style={styles.filters}>
              <TouchableOpacity
                style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                onPress={() => setFilter('all')}
              >
                <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                  Все время
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.filterButton, filter === 'week' && styles.filterButtonActive]}
                onPress={() => setFilter('week')}
              >
                <Text style={[styles.filterText, filter === 'week' && styles.filterTextActive]}>
                  7 дней
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.filterButton, filter === 'month' && styles.filterButtonActive]}
                onPress={() => setFilter('month')}
              >
                <Text style={[styles.filterText, filter === 'month' && styles.filterTextActive]}>
                  30 дней
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.filterButton, filter === 'custom' && styles.filterButtonActive]}
                onPress={() => setShowCustomModal(true)}
              >
                <View style={styles.customFilterContent}>
                  <Filter size={14} color={filter === 'custom' ? "white" : "#6B7280"} />
                  <Text style={[styles.filterText, filter === 'custom' && styles.filterTextActive]}>
                    {filter === 'custom' ? `${customDays} д.` : 'Свой'}
                  </Text>
                  <ChevronDown size={12} color={filter === 'custom' ? "white" : "#6B7280"} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Загрузка истории...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <View style={styles.errorActions}>
                <TouchableOpacity style={styles.retryButton} onPress={() => loadData(filter)}>
                  <Text style={styles.retryButtonText}>Повторить</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.detailsButton} 
                  onPress={() => Alert.alert('Детали ошибки', error)}
                >
                  <Text style={styles.detailsButtonText}>Подробнее</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : calculations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Calculator size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>
                {filter === 'all' ? 'История расчетов пуста' : 'Нет расчетов за выбранный период'}
              </Text>
              <Text style={styles.emptyDescription}>
                {filter === 'all' 
                  ? 'Выполните расчет TDEE на главной странице, и он появится здесь'
                  : `Попробуйте выбрать другой период или выполните новый расчет`}
              </Text>
              <Text style={styles.emptyHint}>
                Не забудьте включить опцию «Сохранять историю расчетов» в калькуляторе
              </Text>
              {(filter !== 'all') && (
                <TouchableOpacity 
                  style={styles.changeFilterButton}
                  onPress={() => setFilter('all')}
                >
                  <Text style={styles.changeFilterButtonText}>Показать все расчеты</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              {/* Статистика */}
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Flame size={20} color="#F59E0B" />
                    <Text style={styles.statTitle}>Средний TDEE</Text>
                  </View>
                  <Text style={styles.statValue}>{calculateAverageTDEE()}</Text>
                  <Text style={styles.statUnit}>ккал</Text>
                </View>
                
                <View style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Scale size={20} color="#10B981" />
                    <Text style={styles.statTitle}>Изменение веса</Text>
                  </View>
                  {(() => {
                    const progress = calculateWeightProgress();
                    return (
                      <>
                        <View style={styles.statRow}>
                          <Text style={[
                            styles.statValue,
                            progress.direction === 'up' && styles.statValueUp,
                            progress.direction === 'down' && styles.statValueDown
                          ]}>
                            {progress.change > 0 ? '+' : ''}{progress.change.toFixed(1)}
                          </Text>
                          {progress.direction === 'up' && <ArrowUpRight size={16} color="#EF4444" />}
                          {progress.direction === 'down' && <ArrowDownRight size={16} color="#10B981" />}
                          {progress.direction === 'same' && <Minus size={16} color="#6B7280" />}
                        </View>
                        <Text style={styles.statUnit}>кг</Text>
                      </>
                    );
                  })()}
                </View>
                
                <View style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Target size={20} color="#3B82F6" />
                    <Text style={styles.statTitle}>Расчетов</Text>
                  </View>
                  <Text style={styles.statValue}>{calculations.length}</Text>
                  <Text style={styles.statUnit}>шт</Text>
                </View>
              </View>

              {/* Список расчетов */}
              <View style={styles.calculationsList}>
                <View style={styles.listHeader}>
                  <Text style={styles.listTitle}>Последние расчеты</Text>
                  <Text style={styles.listCount}>{calculations.length} записей</Text>
                </View>
                
                {calculations.map((calculation) => (
                  <TouchableOpacity 
                    key={calculation.id} 
                    style={styles.calculationCard}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.cardDate}>
                        <Clock size={14} color="#6B7280" />
                        <Text style={styles.cardDateText}>
                          {formatDate(calculation.created_at)}
                        </Text>
                      </View>
                      <View style={[
                        styles.goalBadge,
                        { backgroundColor: `${getGoalColor(calculation.goal_id)}15` }
                      ]}>
                        {getGoalIcon(calculation.goal_id)}
                        <Text style={[
                          styles.goalBadgeText,
                          { color: getGoalColor(calculation.goal_id) }
                        ]}>
                          {getGoalName(calculation.goal_id)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.cardContent}>
                      {/* Основные метрики */}
                      <View style={styles.metricsRow}>
                        <View style={styles.metricItem}>
                          <Text style={styles.metricLabel}>BMR</Text>
                          <Text style={styles.metricValue}>
                            {calculation.results.bmr.toLocaleString()} ккал
                          </Text>
                        </View>
                        <View style={styles.metricDivider} />
                        <View style={styles.metricItem}>
                          <Text style={styles.metricLabel}>TDEE</Text>
                          <Text style={styles.metricValue}>
                            {calculation.results.tdee.toLocaleString()} ккал
                          </Text>
                        </View>
                        <View style={styles.metricDivider} />
                        <View style={styles.metricItem}>
                          <Text style={styles.metricLabel}>Цель</Text>
                          <Text style={styles.metricValue}>
                            {calculation.results.calorie_target.toLocaleString()} ккал
                          </Text>
                        </View>
                      </View>
                      
                      {/* Входные данные */}
                      <View style={styles.inputData}>
                        <View style={styles.inputRow}>
                          <View style={styles.inputItem}>
                            <Scale size={14} color="#6B7280" />
                            <Text style={styles.inputText}>
                              {calculation.input_data.weight} кг
                            </Text>
                          </View>
                          <View style={styles.inputItem}>
                            <Ruler size={14} color="#6B7280" />
                            <Text style={styles.inputText}>
                              {calculation.input_data.height} см
                            </Text>
                          </View>
                          <View style={styles.inputItem}>
                            <User size={14} color="#6B7280" />
                            <Text style={styles.inputText}>
                              {calculation.input_data.age} лет
                            </Text>
                          </View>
                        </View>
                        <View style={styles.inputRow}>
                          <View style={styles.inputItem}>
                            <ActivityIcon size={14} color="#6B7280" />
                            <Text style={styles.inputText}>
                              {getActivityLevelName(calculation.input_data.activity_level)}
                            </Text>
                          </View>
                          <View style={styles.inputItem}>
                            <Text style={styles.inputText}>
                              {calculation.input_data.gender === 'male' ? 'Мужчина' : 'Женщина'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.cardFooter}>
                      <Text style={styles.cardInfo}>
                        Коэффициент активности: {calculation.results.coefficient}
                      </Text>
                      <ChevronRight size={16} color="#9CA3AF" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Информация о синхронизации */}
              <View style={styles.syncInfo}>
                <Text style={styles.syncInfoText}>
                  💾 Данные автоматически сохраняются при каждом расчете
                </Text>
                <Text style={styles.syncInfoSubtext}>
                  Чтобы отключить сохранение, используйте настройки в калькуляторе
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Модальное окно для кастомного фильтра */}
      <Modal
        visible={showCustomModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowCustomModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContent}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Настройка периода</Text>
                  <TouchableOpacity 
                    onPress={() => setShowCustomModal(false)}
                    style={styles.closeButton}
                  >
                    <X size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.modalBody}>
                  <View style={styles.inputContainer}>
                    <CalendarDays size={20} color="#3B82F6" />
                    <Text style={styles.inputLabel}>Количество дней:</Text>
                    <TextInput
                      style={styles.textInput}
                      value={customDays}
                      onChangeText={setCustomDays}
                      keyboardType="numeric"
                      placeholder="7"
                      maxLength={3}
                      autoFocus
                    />
                  </View>
                  
                  <View style={styles.presetButtons}>
                    {[1, 3, 7, 14, 30, 90].map((days) => (
                      <TouchableOpacity
                        key={days}
                        style={styles.presetButton}
                        onPress={() => setCustomDays(days.toString())}
                      >
                        <Text style={styles.presetButtonText}>{days} д.</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  <Text style={styles.modalHint}>
                    Введите количество дней от 1 до 365
                  </Text>
                </View>
                
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowCustomModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Отмена</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={applyCustomFilter}
                  >
                    <Text style={styles.applyButtonText}>Применить</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
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
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  headerTitle: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  lockContainer: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
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
  authButtons: {
    width: '100%',
    gap: 12,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
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
    justifyContent: 'center',
  },
  registerButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  filtersContainer: {
    marginBottom: 24,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    minWidth: 80,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  filterTextActive: {
    color: 'white',
  },
  customFilterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  detailsButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 48,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 24,
  },
  emptyHint: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  changeFilterButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  changeFilterButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  statValueUp: {
    color: '#EF4444',
  },
  statValueDown: {
    color: '#10B981',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statUnit: {
    fontSize: 12,
    color: '#6B7280',
  },
  calculationsList: {
    marginBottom: 24,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  listCount: {
    fontSize: 14,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  calculationCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardDateText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  goalBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  metricDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  inputData: {
    gap: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  inputItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputText: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cardInfo: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  syncInfo: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
  },
  syncInfoText: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: '500',
    marginBottom: 4,
  },
  syncInfoSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Модальное окно стили
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    width: 80,
    textAlign: 'center',
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  presetButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 60,
  },
  presetButtonText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  modalHint: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  applyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});