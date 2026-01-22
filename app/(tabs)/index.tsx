import { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  Switch,
  Modal,
  Animated
} from 'react-native';
import { 
  Calculator, 
  Scale, 
  Ruler, 
  Calendar, 
  Activity,
  Target,
  Flame,
  ChevronRight,
  User,
  Cloud,
  Save,
  History,
  TrendingDown,
  TrendingUp,
  Minus,
  Zap,
  Heart,
  Target as TargetIcon,
  X
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/api/client';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function CalculatorScreen() {
  const { isAuthenticated, user, updateProfile, isSyncing } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState<string>('moderate');
  const [goal, setGoal] = useState<'loss' | 'maintain' | 'gain'>('maintain');
  const [saveSettings, setSaveSettings] = useState({
    saveToProfile: true,
    saveToHistory: true
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [calculationResults, setCalculationResults] = useState<{
    bmr: number;
    tdee: number;
    targetCalories: number;
    coefficient: number;
    formula: string;
  } | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

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

  const activityLevels = [
    { code: 'sedentary', name: 'Сидячий', coef: 1.2, desc: 'Мало или нет тренировок' },
    { code: 'light', name: 'Легкая', coef: 1.375, desc: '1-3 тренировки в неделю' },
    { code: 'moderate', name: 'Умеренная', coef: 1.55, desc: '3-5 тренировок в неделю' },
    { code: 'high', name: 'Высокая', coef: 1.725, desc: '6-7 тренировок в неделю' },
    { code: 'extreme', name: 'Экстремальная', coef: 1.9, desc: 'Тяжелая работа + тренировки' },
  ];

  // Анимация появления результатов
  useEffect(() => {
    if (showResults) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [showResults]);

  // Функция для получения коэффициента по коду
  const getCoefficientFromCode = (code: string): number => {
    const activity = activityLevels.find(item => item.code === code);
    return activity ? activity.coef : 1.55;
  };

  // Функция расчета возраста из birthDate
  const calculateAgeFromBirthDate = (birthDate: string | null | undefined): string => {
    if (!birthDate) return '';
    
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  // Функция сброса данных
  const resetFormData = useCallback(() => {
    setWeight('');
    setHeight('');
    setAge('');
    setGender('male');
    setActivityLevel('moderate');
    setGoal('maintain');
    setSaveSettings({
      saveToProfile: false,
      saveToHistory: false
    });
  }, []);

  // Функция для маппинга цели на goal_id
  const getGoalId = (goal: 'loss' | 'maintain' | 'gain'): number => {
    const goalMap = {
      'loss': 1,    // Похудеть
      'maintain': 2, // Поддерживать
      'gain': 3      // Набрать
    };
    return goalMap[goal];
  };

  // Функция для маппинга уровня активности на ID
  const getActivityLevelId = (code: string): number => {
    const activityMap: Record<string, number> = {
      'sedentary': 1,
      'light': 2,
      'moderate': 3,
      'high': 4,
      'extreme': 5
    };
    return activityMap[code] || 3; // По умолчанию moderate
  };

  // Функция для создания расчета в бэкенде
  const createCalculation = async (
    bmr: number,
    tdee: number,
    targetCalories: number,
    goalId: number,
    inputData: any,
    results: any
  ) => {
    try {
      const calculationData = {
        goal_id: goalId,
        input_data: inputData,
        results: results
      };

      await apiFetch('/calculations/', {
        method: 'POST',
        body: JSON.stringify(calculationData),
      });

      return true;
    } catch (error) {
      console.error('Ошибка при сохранении расчета:', error);
      return false;
    }
  };

  // Загрузка данных из профиля
  const loadProfileData = useCallback(() => {
    if (!user) return;
    
    // Загружаем данные пользователя, если они есть
    if (user.gender) setGender(user.gender);
    if (user.activityLevel) setActivityLevel(user.activityLevel);
    if (user.height) setHeight(user.height.toString());
    if (user.weight) setWeight(user.weight.toString());
    
    // Расчет возраста из даты рождения
    if (user.birthDate) {
      const age = calculateAgeFromBirthDate(user.birthDate);
      setAge(age);
    }

    // Для авторизованных пользователей включаем сохранение по умолчанию
    setSaveSettings({
      saveToProfile: true,
      saveToHistory: true
    });
  }, [user]);

  // Обработка смены пользователя или статуса авторизации
  useEffect(() => {
    if (isAuthenticated && user) {
      // Всегда загружаем данные из профиля для авторизованных пользователей
      loadProfileData();
    } else {
      // Если пользователь вышел или не авторизован
      resetFormData();
    }
  }, [isAuthenticated, user, loadProfileData, resetFormData]);

  const calculateTDEE = async () => {
    if (!weight || !height || !age) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const ageNum = parseInt(age);

    // Валидация данных
    if (isNaN(weightNum) || isNaN(heightNum) || isNaN(ageNum)) {
      Alert.alert('Ошибка', 'Пожалуйста, введите корректные числа');
      return;
    }

    if (weightNum <= 0 || heightNum <= 0 || ageNum <= 0) {
      Alert.alert('Ошибка', 'Значения должны быть положительными числами');
      return;
    }

    setIsCalculating(true);

    try {
      // Формула Миффлина-Сан Жеора
      let bmr;
      if (gender === 'male') {
        bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
      } else {
        bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
      }

      const coefficient = getCoefficientFromCode(activityLevel);
      const tdee = bmr * coefficient;
      
      let targetCalories;
      switch (goal) {
        case 'loss':
          targetCalories = Math.round(tdee * 0.8);
          break;
        case 'gain':
          targetCalories = Math.round(tdee * 1.1);
          break;
        default:
          targetCalories = Math.round(tdee);
      }

      // Формируем данные для сохранения
      const inputData = {
        weight: weightNum,
        height: heightNum,
        age: ageNum,
        gender: gender,
        activity_level: activityLevel,
        activity_level_id: getActivityLevelId(activityLevel),
        goal: goal
      };

      const results = {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        calorie_target: targetCalories,
        coefficient: coefficient,
        formula_used: 'mifflin_st_jeor'
      };

      const goalId = getGoalId(goal);

      // Сохраняем в профиль если нужно
      if (isAuthenticated && saveSettings.saveToProfile && user && updateProfile) {
        const updates: any = {};
        
        if (!isNaN(weightNum) && weightNum > 0) updates.weight = weightNum;
        if (!isNaN(heightNum) && heightNum > 0) updates.height = heightNum;
        if (activityLevel) updates.activityLevel = activityLevel;
        
        if (Object.keys(updates).length > 0) {
          try {
            await updateProfile(updates);
          } catch (error) {
            console.log('Не удалось сохранить данные в профиль:', error);
          }
        }
      }

      // Сохраняем расчет в бэкенд если нужно
      if (isAuthenticated && saveSettings.saveToHistory) {
        try {
          await createCalculation(
            bmr,
            tdee,
            targetCalories,
            goalId,
            inputData,
            results
          );
        } catch (error) {
          console.log('Не удалось сохранить расчет:', error);
        }
      }

      // Устанавливаем результаты и показываем модальное окно
      setCalculationResults({
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCalories: targetCalories,
        coefficient: coefficient,
        formula: 'mifflin_st_jeor'
      });
      
      setShowResults(true);

    } catch (error) {
      console.error('Ошибка при расчете:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при расчете. Попробуйте еще раз.');
    } finally {
      setIsCalculating(false);
    }
  };

  const toggleSaveSettings = () => {
    if (saveSettings.saveToProfile && saveSettings.saveToHistory) {
      // Если оба включены, выключаем оба
      setSaveSettings({
        saveToProfile: false,
        saveToHistory: false
      });
    } else {
      // Включаем оба
      setSaveSettings({
        saveToProfile: true,
        saveToHistory: true
      });
    }
  };

  const getGoalColor = () => {
    switch (goal) {
      case 'loss': return colors.success;
      case 'gain': return colors.warning;
      default: return colors.accent;
    }
  };

  const getGoalDescription = () => {
    switch (goal) {
      case 'loss': return 'Дефицит для безопасного похудения (~0.5–1 кг в неделю)';
      case 'gain': return 'Профицит для набора мышечной массы';
      default: return 'Поддержание текущего веса';
    }
  };

  const renderMainResultCard = () => (
    <View style={[styles.mainResultCard, { borderLeftColor: getGoalColor() }]}>
      <View style={styles.resultCardHeader}>
        <View style={[styles.resultIconContainer, { backgroundColor: getGoalColor() + '20' }]}>
          <TargetIcon size={32} color={getGoalColor()} />
        </View>
        <Text style={styles.resultCardTitle}>Ваша норма калорий</Text>
      </View>
      <Text style={styles.mainResultValue}>
        {calculationResults?.targetCalories.toLocaleString()} ккал/день
      </Text>
      <Text style={styles.resultCardDescription}>
        {getGoalDescription()}
      </Text>
      <Text style={styles.secondaryDescription}>
        На основе TDEE {calculationResults?.tdee.toLocaleString()} ккал с корректировкой для цели
      </Text>
    </View>
  );

  const renderSecondaryResultCard = (
    title: string,
    value: string,
    description: string,
    icon: React.ReactNode,
    color: string
  ) => (
    <View style={[styles.secondaryResultCard, { borderLeftColor: color }]}>
      <View style={styles.resultCardHeader}>
        <View style={[styles.resultIconContainer, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
        <Text style={styles.secondaryCardTitle}>{title}</Text>
      </View>
      <Text style={styles.secondaryCardValue}>{value}</Text>
      <Text style={styles.secondaryCardDescription}>{description}</Text>
    </View>
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
    header: {
      marginBottom: 24,
    },
    appTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    appTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
    },
    appSubtitle: {
      fontSize: 16,
      color: colors.secondaryText,
    },
    section: {
      marginBottom: 28,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    inputGroup: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    inputWrapper: {
      flex: 1,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.lightBg,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    genderSelector: {
      flexDirection: 'row',
      gap: 12,
    },
    genderButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.lightBg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    genderButtonActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    genderText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.secondaryText,
    },
    genderTextActive: {
      color: colors.accentText,
    },
    activityScroll: {
      marginHorizontal: -16,
      paddingHorizontal: 16,
    },
    activityCard: {
      width: 120,
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.lightBg,
      borderWidth: 2,
      borderColor: 'transparent',
      marginRight: 12,
    },
    activityCardActive: {
      backgroundColor: colors.blueBg,
      borderColor: colors.accent,
    },
    activityCardValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.secondaryText,
      marginBottom: 4,
    },
    activityCardValueActive: {
      color: colors.accent,
    },
    activityCardLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    activityCardDesc: {
      fontSize: 12,
      color: colors.secondaryText,
      lineHeight: 16,
    },
    goalContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    goalCard: {
      flex: 1,
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.lightBg,
      borderWidth: 2,
      borderColor: 'transparent',
      alignItems: 'center',
    },
    goalIcon: {
      fontSize: 24,
      marginBottom: 8,
    },
    goalCardLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    goalCardSubtitle: {
      fontSize: 12,
      color: colors.secondaryText,
      textAlign: 'center',
    },
    goalSelectedDot: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    saveSection: {
      backgroundColor: colors.lightBg,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    saveHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    saveIconContainer: {
      flexDirection: 'row',
      position: 'relative',
    },
    saveIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    saveTextContainer: {
      flex: 1,
    },
    saveTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    saveDescription: {
      fontSize: 14,
      color: colors.secondaryText,
      lineHeight: 18,
    },
    saveDetails: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 12,
    },
    saveDetailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    saveDetailText: {
      fontSize: 14,
      color: colors.secondaryText,
    },
    calculateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      padding: 20,
      borderRadius: 16,
      gap: 12,
      marginBottom: 24,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    calculateButtonDisabled: {
      backgroundColor: colors.mutedText,
      shadowColor: colors.mutedText,
    },
    calculateButtonText: {
      color: colors.accentText,
      fontSize: 18,
      fontWeight: '600',
    },
    registerPrompt: {
      backgroundColor: colors.blueBg,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.infoBg,
    },
    registerPromptContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    registerPromptText: {
      flex: 1,
    },
    registerPromptTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.info,
      marginBottom: 4,
    },
    registerPromptSubtitle: {
      fontSize: 14,
      color: colors.secondaryText,
    },
    footer: {
      paddingBottom: 32,
    },
    disclaimer: {
      textAlign: 'center',
      fontSize: 12,
      color: colors.mutedText,
      lineHeight: 18,
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
      backgroundColor: colors.background,
      borderRadius: 20,
      width: '100%',
      maxHeight: '80%',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.veryLightBg,
    },
    modalTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    closeButton: {
      padding: 4,
    },
    mainResultCard: {
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: 24,
      marginHorizontal: 20,
      marginTop: 20,
      borderWidth: 1,
      borderColor: colors.veryLightBg,
      borderLeftWidth: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    mainResultValue: {
      fontSize: 40,
      fontWeight: 'bold',
      color: colors.text,
      marginVertical: 12,
    },
    secondaryDescription: {
      fontSize: 14,
      color: colors.secondaryText,
      marginTop: 8,
      fontStyle: 'italic',
    },
    secondaryResultCard: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 20,
      marginTop: 16,
      borderWidth: 1,
      borderColor: colors.veryLightBg,
      borderLeftWidth: 4,
    },
    resultCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    },
    resultIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    resultCardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    resultCardDescription: {
      fontSize: 14,
      color: colors.secondaryText,
      lineHeight: 20,
    },
    secondaryCardTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    secondaryCardValue: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginVertical: 8,
    },
    secondaryCardDescription: {
      fontSize: 13,
      color: colors.secondaryText,
      lineHeight: 18,
    },
    recommendations: {
      marginHorizontal: 20,
      marginTop: 24,
      marginBottom: 20,
    },
    recommendationsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    recommendationItem: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 8,
    },
    recommendationBullet: {
      fontSize: 16,
      color: colors.accent,
    },
    recommendationText: {
      flex: 1,
      fontSize: 14,
      color: colors.secondaryText,
      lineHeight: 20,
    },
    modalFooter: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.veryLightBg,
    },
    actionButton: {
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    actionButtonText: {
      color: colors.accentText,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Приветствие и статус профиля */}
        <View style={styles.header}>   
          <View style={styles.appTitleContainer}>
            <Flame size={28} color={colors.accent} />
            <Text style={styles.appTitle}>МетаБаланс</Text>
          </View>
          <Text style={styles.appSubtitle}>Калькулятор TDEE и калорий</Text>
        </View>

        {/* Основные данные */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Scale size={22} color={colors.accent} />
            <Text style={styles.sectionTitle}>Основные данные</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Вес (кг) *</Text>
              <TextInput
                style={styles.input}
                placeholder="65"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholderTextColor={colors.mutedText}
              />
            </View>
            
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Рост (см)</Text>
              <TextInput
                style={styles.input}
                placeholder="175"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                placeholderTextColor={colors.mutedText}
              />
            </View>
            
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Возраст</Text>
              <TextInput
                style={styles.input}
                placeholder="25"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholderTextColor={colors.mutedText}
              />
            </View>
          </View>

          <View style={styles.genderSelector}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'male' && styles.genderButtonActive
              ]}
              onPress={() => setGender('male')}
            >
              <Text style={[
                styles.genderText,
                gender === 'male' && styles.genderTextActive
              ]}>Мужчина</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'female' && styles.genderButtonActive
              ]}
              onPress={() => setGender('female')}
            >
              <Text style={[
                styles.genderText,
                gender === 'female' && styles.genderTextActive
              ]}>Женщина</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Уровень активности */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={22} color={colors.accent} />
            <Text style={styles.sectionTitle}>Уровень активности</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.activityScroll}
          >
            {activityLevels.map((level) => (
              <TouchableOpacity
                key={level.code}
                style={[
                  styles.activityCard,
                  activityLevel === level.code && styles.activityCardActive
                ]}
                onPress={() => setActivityLevel(level.code)}
              >
                <Text style={[
                  styles.activityCardValue,
                  activityLevel === level.code && styles.activityCardValueActive
                ]}>
                  {level.coef}
                </Text>
                <Text style={styles.activityCardLabel}>{level.name}</Text>
                <Text style={styles.activityCardDesc}>{level.desc}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Цель */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Target size={22} color={colors.accent} />
            <Text style={styles.sectionTitle}>Ваша цель</Text>
          </View>
          
          <View style={styles.goalContainer}>
            {[
              { label: 'Похудеть', value: 'loss', color: colors.success, icon: '👇' },
              { label: 'Поддерживать', value: 'maintain', color: colors.accent, icon: '⚖️' },
              { label: 'Набрать', value: 'gain', color: colors.warning, icon: '👆' },
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.goalCard,
                  goal === item.value && { borderColor: item.color }
                ]}
                onPress={() => setGoal(item.value as any)}
              >
                <Text style={styles.goalIcon}>{item.icon}</Text>
                <Text style={styles.goalCardLabel}>{item.label}</Text>
                <Text style={styles.goalCardSubtitle}>
                  {item.value === 'loss' ? 'Дефицит калорий' : 
                   item.value === 'gain' ? 'Профицит калорий' : 'Баланс калорий'}
                </Text>
                {goal === item.value && (
                  <View style={[styles.goalSelectedDot, { backgroundColor: item.color }]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Общий переключатель сохранения (только для авторизованных) */}
        {isAuthenticated && (
          <View style={styles.saveSection}>
            <View style={styles.saveHeader}>
              <View style={styles.saveIconContainer}>
                {saveSettings.saveToProfile && saveSettings.saveToHistory ? (
                  <View style={[styles.saveIcon, { backgroundColor: colors.blueBg }]}>
                    <Cloud size={20} color={colors.accent} />
                  </View>
                ) : (
                  <View style={[styles.saveIcon, { backgroundColor: colors.veryLightBg }]}>
                    <Cloud size={20} color={colors.mutedText} />
                  </View>
                )}
                {saveSettings.saveToProfile && saveSettings.saveToHistory ? (
                  <View style={[styles.saveIcon, { backgroundColor: colors.greenBg, marginLeft: -8 }]}>
                    <History size={20} color={colors.success} />
                  </View>
                ) : (
                  <View style={[styles.saveIcon, { backgroundColor: colors.veryLightBg, marginLeft: -8 }]}>
                    <History size={20} color={colors.mutedText} />
                  </View>
                )}
              </View>
              <View style={styles.saveTextContainer}>
                <Text style={styles.saveTitle}>
                  {saveSettings.saveToProfile && saveSettings.saveToHistory 
                    ? 'Сохранение данных включено' 
                    : 'Сохранение данных отключено'}
                </Text>
                <Text style={styles.saveDescription}>
                  {saveSettings.saveToProfile && saveSettings.saveToHistory
                    ? 'Данные сохраняются в профиль и историю расчётов'
                    : 'Данные не сохраняются'}
                </Text>
              </View>
              <Switch
                value={saveSettings.saveToProfile && saveSettings.saveToHistory}
                onValueChange={toggleSaveSettings}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.background}
              />
            </View>
            
            {saveSettings.saveToProfile && saveSettings.saveToHistory && (
              <View style={styles.saveDetails}>
                <View style={styles.saveDetailItem}>
                  <Cloud size={16} color={colors.accent} />
                  <Text style={styles.saveDetailText}>Данные сохраняются в профиль</Text>
                </View>
                <View style={styles.saveDetailItem}>
                  <History size={16} color={colors.success} />
                  <Text style={styles.saveDetailText}>Расчет сохраняется в историю</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Кнопка расчета */}
        <TouchableOpacity 
          style={[styles.calculateButton, (isCalculating || isSyncing) && styles.calculateButtonDisabled]} 
          onPress={calculateTDEE}
          disabled={isCalculating || isSyncing}
        >
          <Calculator size={24} color={colors.accentText} />
          <Text style={styles.calculateButtonText}>
            {isCalculating ? 'Расчет...' : isSyncing ? 'Сохранение...' : 'Рассчитать TDEE'}
          </Text>
          <ChevronRight size={20} color={colors.accentText} />
        </TouchableOpacity>

        {/* Призыв к регистрации для неавторизованных */}
        {!isAuthenticated && (
          <TouchableOpacity 
            style={styles.registerPrompt}
            onPress={() => {}}
          >
            <View style={styles.registerPromptContent}>
              <User size={20} color={colors.accent} />
              <View style={styles.registerPromptText}>
                <Text style={styles.registerPromptTitle}>
                  Зарегистрируйтесь для большего
                </Text>
                <Text style={styles.registerPromptSubtitle}>
                  Сохраняйте данные в профиле и получайте персонализированные рекомендации
                </Text>
              </View>
              <ChevronRight size={20} color={colors.mutedText} />
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <Text style={styles.disclaimer}>
            *TDEE (Total Daily Energy Expenditure) - общий суточный расход энергии
          </Text>
        </View>
      </ScrollView>

      {/* Модальное окно с результатами */}
      <Modal
        visible={showResults}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResults(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <TargetIcon size={24} color={getGoalColor()} />
                <Text style={styles.modalTitle}>🎯 Ваша норма калорий</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowResults(false)}
              >
                <X size={24} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>

            {calculationResults && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Главная карточка — целевые калории */}
                {renderMainResultCard()}

                {/* Суточный расход (TDEE) */}
                {renderSecondaryResultCard(
                  'Суточный расход (TDEE)',
                  `${calculationResults.tdee.toLocaleString()} ккал`,
                  `Общая дневная потребность в калориях с учётом активности (BMR × ${calculationResults.coefficient})`,
                  <Zap size={20} color={colors.warning} />,
                  colors.warning
                )}

                {/* Основной обмен (BMR) */}
                {renderSecondaryResultCard(
                  'Основной обмен (BMR)',
                  `${calculationResults.bmr.toLocaleString()} ккал`,
                  'Энергия, необходимая для поддержания жизнедеятельности в состоянии покоя',
                  <Heart size={20} color={colors.error} />,
                  colors.error
                )}

                <View style={styles.recommendations}>
                  <Text style={styles.recommendationsTitle}>💡 Рекомендации:</Text>
                  <View style={styles.recommendationItem}>
                    <Text style={styles.recommendationBullet}>•</Text>
                    <Text style={styles.recommendationText}>
                      Придерживайтесь целевых калорий ежедневно для достижения цели
                    </Text>
                  </View>
                  <View style={styles.recommendationItem}>
                    <Text style={styles.recommendationBullet}>•</Text>
                    <Text style={styles.recommendationText}>
                      Взвешивайтесь раз в неделю в одно и то же время
                    </Text>
                  </View>
                  <View style={styles.recommendationItem}>
                    <Text style={styles.recommendationBullet}>•</Text>
                    <Text style={styles.recommendationText}>
                      При отсутствии прогресса скорректируйте калории на ±100-200 ккал
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: getGoalColor() }]}
                onPress={() => setShowResults(false)}
              >
                <Text style={styles.actionButtonText}>Понятно, спасибо!</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}