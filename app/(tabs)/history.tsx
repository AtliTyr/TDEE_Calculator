import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  FlatList,
  ListRenderItemInfo
} from 'react-native';
import { 
  History, 
  Calendar, 
  Flame, 
  TrendingDown, 
  TrendingUp,
  Lock,
  ArrowRight,
  Minus,
  ChevronRight,
  Filter,
  Scale,
  Activity as ActivityIcon,
  Ruler,
  User,
  Clock,
  X,
  CalendarDays,
  ChevronDown,
  UserPlus,
  Calculator,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/api/client';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

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

type FilterType = 'month' | 'quarter' | 'custom';

export default function HistoryScreen() {
  const { isAuthenticated } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [displayCalculations, setDisplayCalculations] = useState<Calculation[]>([]); // Только для отображения (ограничено 10)
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('month');
  const [customDays, setCustomDays] = useState<string>('7');
  const [showCustomModal, setShowCustomModal] = useState(false);

  const MAX_DISPLAY = 10; // Ограничение отображения только на клиенте

  const colors = {
    background: theme.background,
    text: theme.text,
    tint: theme.tint,
    icon: theme.icon,
    accent: '#3B82F6',
    accentText: 'white',
    secondaryText: colorScheme === 'light' ? '#6B7280' : '#9CA3AF',
    mutedText: colorScheme === 'light' ? '#9CA3AF' : '#6B7280',
    lightBg: colorScheme === 'light' ? '#F9FAFB' : '#1F2937',
    veryLightBg: colorScheme === 'light' ? '#F3F4F6' : '#374151',
    border: colorScheme === 'light' ? '#E5E7EB' : '#4B5563',
    blueBg: colorScheme === 'light' ? '#EFF6FF' : '#1E40AF',
    greenBg: colorScheme === 'light' ? '#F0FDF4' : '#064E3B',
    redBg: colorScheme === 'light' ? '#FEF2F2' : '#7F1D1D',
    yellowBg: colorScheme === 'light' ? '#FEF3C7' : '#713F12',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    successBg: colorScheme === 'light' ? '#D1FAE5' : '#064E3B',
    errorBg: colorScheme === 'light' ? '#FEE2E2' : '#7F1D1D',
    warningBg: colorScheme === 'light' ? '#FEF3C7' : '#713F12',
    infoBg: colorScheme === 'light' ? '#DBEAFE' : '#1E3A8A',
  };

  // Форматирование даты
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'][date.getMonth()];
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day} ${month} ${year}, ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  // Получение параметров фильтрации для API
  const getFilterParams = (filterType: FilterType, customDaysValue?: string) => {
    switch (filterType) {
      case 'month':
        return { days: 30 };
      case 'quarter':
        return { days: 90 };
      case 'custom':
        const days = parseInt(customDaysValue || customDays);
        return { days: isNaN(days) ? 7 : Math.max(1, Math.min(365, days)) };
      default:
        return { days: 30 };
    }
  };

  // Загрузка данных (без лимита на сервере)
  const loadData = async (filterType: FilterType = filter, customDaysValue?: string) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const params = getFilterParams(filterType, customDaysValue);
      
      const queryParams = new URLSearchParams();
      if (params.days) {
        queryParams.append('days', params.days.toString());
      }
      
      const queryString = queryParams.toString();
      const url = queryString ? `/calculations/?${queryString}` : '/calculations/';
      
      const historyResponse = await apiFetch(url);
      
      const allCalculations = historyResponse.calculations || [];
      setCalculations(allCalculations);
      
      // Ограничение отображения только на клиенте — последние 10
      const displayed = allCalculations.slice(0, MAX_DISPLAY);
      setDisplayCalculations(displayed);
      
    } catch (err: any) {
      console.error('Ошибка загрузки истории:', err);
      
      let errorMessage = 'Не удалось загрузить данные. Проверьте подключение к интернету.';
      
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
      case 1: return <TrendingDown size={16} color={colors.error} />;
      case 2: return <Minus size={16} color={colors.accent} />;
      case 3: return <TrendingUp size={16} color={colors.success} />;
      default: return null;
    }
  };

  // Получение цвета цели
  const getGoalColor = (goalId: number): string => {
    switch (goalId) {
      case 1: return colors.error;
      case 2: return colors.accent;
      case 3: return colors.success;
      default: return colors.secondaryText;
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

  // Расчет изменения веса (по всем calculations)
  const calculateWeightProgress = (): { change: number; direction: 'up' | 'down' | 'same' } => {
    if (calculations.length < 2) {
      return { change: 0, direction: 'same' };
    }

    const sortedCalculations = [...calculations].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const firstWeight = sortedCalculations[0].input_data.weight;
    const lastWeight = sortedCalculations[sortedCalculations.length - 1].input_data.weight;
    const change = lastWeight - firstWeight;

    if (Math.abs(change) < 0.1) return { change: 0, direction: 'same' };
    return { change: change.toFixed(1), direction: change > 0 ? 'up' : 'down' };
  };

  // Расчет изменения TDEE за период (по всем calculations)
  const calculateTDEEChange = (): { change: number; direction: 'up' | 'down' | 'same' } => {
    if (calculations.length < 2) {
      return { change: 0, direction: 'same' };
    }

    const sortedCalculations = [...calculations].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const firstTDEE = sortedCalculations[0].results.tdee;
    const lastTDEE = sortedCalculations[sortedCalculations.length - 1].results.tdee;
    const change = Math.round(lastTDEE - firstTDEE);

    if (Math.abs(change) < 5) return { change: 0, direction: 'same' };
    return { change, direction: change > 0 ? 'up' : 'down' };
  };

  // Описание текущего фильтра
  const getFilterDescription = (): string => {
    switch (filter) {
      case 'month':
        return 'За последние 30 дней';
      case 'quarter':
        return 'За последние 90 дней';
      case 'custom':
        const days = parseInt(customDays);
        return `За последние ${days} дней`;
      default:
        return 'За последние 30 дней';
    }
  };

  // Рендер элемента списка
  const renderCalculationItem = ({ item }: ListRenderItemInfo<Calculation>) => (
    <TouchableOpacity 
      style={styles.calculationCard}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardDate}>
          <Clock size={14} color={colors.secondaryText} />
          <Text style={styles.cardDateText}>
            {formatDate(item.created_at)}
          </Text>
        </View>
        <View style={[
          styles.goalBadge,
          { backgroundColor: `${getGoalColor(item.goal_id)}15` }
        ]}>
          {getGoalIcon(item.goal_id)}
          <Text style={[
            styles.goalBadgeText,
            { color: getGoalColor(item.goal_id) }
          ]}>
            {getGoalName(item.goal_id)}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>BMR</Text>
            <Text style={styles.metricValue}>
              {item.results.bmr.toLocaleString()} ккал
            </Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>TDEE</Text>
            <Text style={styles.metricValue}>
              {item.results.tdee.toLocaleString()} ккал
            </Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Цель</Text>
            <Text style={styles.metricValue}>
              {item.results.calorie_target.toLocaleString()} ккал
            </Text>
          </View>
        </View>
        
        <View style={styles.inputData}>
          <View style={styles.inputRow}>
            <View style={styles.inputItem}>
              <Scale size={14} color={colors.secondaryText} />
              <Text style={styles.inputText}>
                {item.input_data.weight} кг
              </Text>
            </View>
            <View style={styles.inputItem}>
              <Ruler size={14} color={colors.secondaryText} />
              <Text style={styles.inputText}>
                {item.input_data.height} см
              </Text>
            </View>
            <View style={styles.inputItem}>
              <User size={14} color={colors.secondaryText} />
              <Text style={styles.inputText}>
                {item.input_data.age} лет
              </Text>
            </View>
          </View>
          <View style={styles.inputRow}>
            <View style={styles.inputItem}>
              <ActivityIcon size={14} color={colors.secondaryText} />
              <Text style={styles.inputText}>
                {getActivityLevelName(item.input_data.activity_level)}
              </Text>
            </View>
            <View style={styles.inputItem}>
              <Text style={styles.inputText}>
                {item.input_data.gender === 'male' ? 'Мужчина' : 'Женщина'}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.cardInfo}>
          Коэффициент активности: {item.results.coefficient}
        </Text>
        <ChevronRight size={16} color={colors.mutedText} />
      </View>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background,
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
      color: colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.secondaryText,
    },
    lockContainer: {
      alignItems: 'center',
      padding: 32,
      marginBottom: 24,
      backgroundColor: colors.lightBg,
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
      backgroundColor: colors.error,
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    lockBadgeText: {
      color: colors.accentText,
      fontSize: 14,
      fontWeight: 'bold',
    },
    lockTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    lockDescription: {
      textAlign: 'center',
      color: colors.secondaryText,
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
      backgroundColor: colors.accent,
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderRadius: 12,
      gap: 12,
      justifyContent: 'center',
    },
    loginButtonText: {
      color: colors.accentText,
      fontSize: 16,
      fontWeight: '600',
    },
    registerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.veryLightBg,
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderRadius: 12,
      gap: 12,
      justifyContent: 'center',
    },
    registerButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    filtersContainer: {
      backgroundColor: colors.lightBg,
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filtersHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    filtersTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    filters: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    filterButton: {
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: 'transparent',
      minWidth: 90,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterButtonActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    filterText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.secondaryText,
      textAlign: 'center',
    },
    filterTextActive: {
      color: colors.accentText,
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
      color: colors.secondaryText,
    },
    errorContainer: {
      backgroundColor: colors.errorBg,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
    },
    errorText: {
      fontSize: 16,
      color: colors.error,
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 22,
    },
    errorActions: {
      flexDirection: 'row',
      gap: 12,
    },
    retryButton: {
      backgroundColor: colors.accent,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryButtonText: {
      color: colors.accentText,
      fontSize: 14,
      fontWeight: '600',
    },
    emptyContainer: {
      alignItems: 'center',
      padding: 48,
      backgroundColor: colors.lightBg,
      borderRadius: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginTop: 24,
      marginBottom: 12,
      textAlign: 'center',
    },
    emptyDescription: {
      textAlign: 'center',
      color: colors.secondaryText,
      fontSize: 16,
      marginBottom: 8,
      lineHeight: 24,
    },
    emptyHint: {
      textAlign: 'center',
      color: colors.mutedText,
      fontSize: 14,
      fontStyle: 'italic',
      marginBottom: 20,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.lightBg,
      borderRadius: 16,
      padding: 16,
      justifyContent: 'space-between',
    },
    statHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
      alignSelf: 'flex-start',
    },
    statTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    statMainContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statValue: {
      fontSize: 36,
      fontWeight: 'bold',
      color: colors.text,
    },
    statRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    statUnit: {
      fontSize: 16,
      color: colors.secondaryText,
      marginTop: 8,
    },
    statNoData: {
      fontSize: 18,
      color: colors.mutedText,
      fontStyle: 'italic',
    },
    calculationsList: {
      flex: 1,
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
      color: colors.text,
    },
    listCount: {
      fontSize: 14,
      color: colors.secondaryText,
      backgroundColor: colors.veryLightBg,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    calculationCard: {
      backgroundColor: colors.lightBg,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.secondaryText,
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
      backgroundColor: colors.background,
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
      color: colors.secondaryText,
      marginBottom: 4,
    },
    metricValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    metricDivider: {
      width: 1,
      backgroundColor: colors.border,
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
      color: colors.secondaryText,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    cardInfo: {
      fontSize: 12,
      color: colors.secondaryText,
      fontStyle: 'italic',
    },
    syncInfo: {
      backgroundColor: colors.greenBg,
      borderRadius: 16,
      padding: 16,
      marginBottom: 32,
    },
    syncInfoText: {
      fontSize: 14,
      color: colors.success,
      fontWeight: '500',
      marginBottom: 4,
    },
    syncInfoSubtext: {
      fontSize: 12,
      color: colors.secondaryText,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.background,
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
      color: colors.text,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.veryLightBg,
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
      color: colors.text,
      flex: 1,
    },
    textInput: {
      backgroundColor: colors.lightBg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
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
      backgroundColor: colors.veryLightBg,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      minWidth: 60,
    },
    presetButtonText: {
      fontSize: 14,
      color: colors.text,
      textAlign: 'center',
    },
    modalHint: {
      fontSize: 14,
      color: colors.secondaryText,
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
      backgroundColor: colors.veryLightBg,
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    applyButton: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: colors.accent,
    },
    applyButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.accentText,
    },
  });

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
              <History size={28} color={colors.accent} />
              <Text style={styles.title}>История расчетов</Text>
            </View>
            <Text style={styles.subtitle}>
              Все ваши предыдущие расчеты TDEE в одном месте
            </Text>
          </View>

          <View style={styles.lockContainer}>
            <View style={styles.lockIconContainer}>
              <Lock size={64} color={colors.mutedText} />
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
                  <ArrowRight size={20} color={colors.accentText} />
                  <Text style={styles.loginButtonText}>Войти в аккаунт</Text>
                </TouchableOpacity>
              </Link>
              
              <Link href="/auth/register" asChild>
                <TouchableOpacity style={styles.registerButton}>
                  <UserPlus size={20} color={colors.accent} />
                  <Text style={styles.registerButtonText}>Зарегистрироваться</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
              <History size={28} color={colors.accent} />
              <View style={styles.headerTitle}>
                <Text style={styles.title}>История расчетов</Text>
                <Text style={styles.subtitle}>
                  {displayCalculations.length > 0 
                    ? `${displayCalculations.length} расчетов • ${getFilterDescription()}` 
                    : 'Здесь появятся ваши расчеты'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.filtersContainer}>
            <View style={styles.filtersHeader}>
              <Filter size={20} color={colors.accent} />
              <Text style={styles.filtersTitle}>Период просмотра</Text>
            </View>
            <View style={styles.filters}>
              <TouchableOpacity
                style={[styles.filterButton, filter === 'month' && styles.filterButtonActive]}
                onPress={() => setFilter('month')}
              >
                <Text style={[styles.filterText, filter === 'month' && styles.filterTextActive]}>
                  30 дней
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.filterButton, filter === 'quarter' && styles.filterButtonActive]}
                onPress={() => setFilter('quarter')}
              >
                <Text style={[styles.filterText, filter === 'quarter' && styles.filterTextActive]}>
                  90 дней
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.filterButton, filter === 'custom' && styles.filterButtonActive]}
                onPress={() => setShowCustomModal(true)}
              >
                <View style={styles.customFilterContent}>
                  <Filter size={14} color={filter === 'custom' ? colors.accentText : colors.secondaryText} />
                  <Text style={[styles.filterText, filter === 'custom' && styles.filterTextActive]}>
                    Свой
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.loadingText}>Загрузка истории...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <View style={styles.errorActions}>
                <TouchableOpacity style={styles.retryButton} onPress={() => loadData(filter)}>
                  <Text style={styles.retryButtonText}>Повторить</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : displayCalculations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Calculator size={64} color={colors.mutedText} />
              <Text style={styles.emptyTitle}>
                Нет расчетов за выбранный период
              </Text>
              <Text style={styles.emptyDescription}>
                Попробуйте выбрать другой период или выполните новый расчет
              </Text>
              <Text style={styles.emptyHint}>
                Не забудьте включить опцию «Сохранять историю расчетов» в калькуляторе
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Flame size={20} color={colors.warning} />
                    <Text style={styles.statTitle}>Изменение TDEE{"\n"}за период</Text>
                  </View>

                  <View style={styles.statMainContent}>
                    {(() => {
                      const { change, direction } = calculateTDEEChange();
                      if (direction === 'same') {
                        return <Text style={styles.statNoData}>Нет изменений</Text>;
                      }
                      return (
                        <>
                          <View style={styles.statRow}>
                            <Text style={styles.statValue}>
                              {change > 0 ? '+' : ''}{change}
                            </Text>
                            {direction === 'up' ? <ArrowUpRight size={28} color={colors.secondaryText} /> :
                             direction === 'down' ? <ArrowDownRight size={28} color={colors.secondaryText} /> : null}
                          </View>
                          <Text style={styles.statUnit}>ккал</Text>
                        </>
                      );
                    })()}
                  </View>
                </View>
                
                <View style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Scale size={20} color={colors.success} />
                    <Text style={styles.statTitle}>Изменение веса{"\n"}за период</Text>
                  </View>

                  <View style={styles.statMainContent}>
                    {(() => {
                      const progress = calculateWeightProgress();
                      if (progress.direction === 'same') {
                        return <Text style={styles.statNoData}>Нет изменений</Text>;
                      }
                      return (
                        <>
                          <View style={styles.statRow}>
                            <Text style={styles.statValue}>
                              {progress.change > 0 ? '+' : ''}{progress.change}
                            </Text>
                            {progress.direction === 'up' ? <ArrowUpRight size={28} color={colors.secondaryText} /> :
                             progress.direction === 'down' ? <ArrowDownRight size={28} color={colors.secondaryText} /> : null}
                          </View>
                          <Text style={styles.statUnit}>кг</Text>
                        </>
                      );
                    })()}
                  </View>
                </View>
              </View>

              <View style={styles.calculationsList}>
                <View style={styles.listHeader}>
                  <Text style={styles.listTitle}>Последние расчеты</Text>
                  <Text style={styles.listCount}>
                    Показано {displayCalculations.length} {calculations.length > MAX_DISPLAY ? `(из ${calculations.length})` : ''}
                  </Text>
                </View>

                <FlatList
                  data={displayCalculations}
                  renderItem={renderCalculationItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                />
              </View>

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

      <Modal
        visible={showCustomModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowCustomModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Настройка периода</Text>
                  <TouchableOpacity 
                    onPress={() => setShowCustomModal(false)}
                    style={styles.closeButton}
                  >
                    <X size={24} color={colors.secondaryText} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.modalBody}>
                  <View style={styles.inputContainer}>
                    <CalendarDays size={20} color={colors.accent} />
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
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}