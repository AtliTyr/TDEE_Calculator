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
  Save
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/api/client';

export default function CalculatorScreen() {
  const { isAuthenticated, user, updateProfile, isSyncing } = useAuth();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState<string>('moderate');
  const [goal, setGoal] = useState<'loss' | 'maintain' | 'gain'>('maintain');
  const [saveToProfile, setSaveToProfile] = useState(true); // По умолчанию включено
  const [saveCalculations, setSaveCalculations] = useState(true); // Сохранение расчетов в историю
  const [isCalculating, setIsCalculating] = useState(false);
  
  const activityLevels = [
    { code: 'sedentary', name: 'Сидячий', coef: 1.2, desc: 'Мало или нет тренировок' },
    { code: 'light', name: 'Легкая', coef: 1.375, desc: '1-3 тренировки в неделю' },
    { code: 'moderate', name: 'Умеренная', coef: 1.55, desc: '3-5 тренировок в неделю' },
    { code: 'high', name: 'Высокая', coef: 1.725, desc: '6-7 тренировок в неделю' },
    { code: 'extreme', name: 'Экстремальная', coef: 1.9, desc: 'Тяжелая работа + тренировки' },
  ];

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
    setSaveToProfile(false);
    setSaveCalculations(false);
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
    setSaveToProfile(true);
    setSaveCalculations(true);
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

  // Дополнительный эффект для отслеживания изменения пользователя
  useEffect(() => {
    // Этот эффект срабатывает при смене пользователя
    console.log('User changed:', user?.id);
  }, [user?.id]);

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
      if (isAuthenticated && saveToProfile && user && updateProfile) {
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
      let calculationSaved = false;
      if (isAuthenticated && saveCalculations) {
        try {
          calculationSaved = await createCalculation(
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

      // Показываем результаты с информацией о сохранении
      const saveInfo = calculationSaved ? '\n\n💾 Расчет сохранен в вашу историю' : '';
      
      Alert.alert(
        '🎯 Результаты расчёта',
        `🏋️‍♂️ **Основной обмен (BMR):** ${Math.round(bmr)} ккал\n\n` +
        `🔥 **Суточный расход (TDEE):** ${Math.round(tdee)} ккал\n\n` +
        `📊 **Целевые калории:** ${targetCalories} ккал\n\n` +
        `💡 **Рекомендация:** ${goal === 'loss' ? 'Для похудения' : goal === 'gain' ? 'Для набора массы' : 'Для поддержания веса'}` +
        saveInfo,
        [
          { 
            text: 'Отлично!', 
            style: 'default'
          }
        ]
      );

    } catch (error) {
      console.error('Ошибка при расчете:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при расчете. Попробуйте еще раз.');
    } finally {
      setIsCalculating(false);
    }
  };

  // Функция для быстрого заполнения примера
  const fillExampleData = () => {
    setWeight('70');
    setHeight('175');
    setAge('30');
    setGender('male');
    setActivityLevel('moderate');
    setGoal('maintain');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Приветствие и статус профиля */}
        <View style={styles.header}>   
          <View style={styles.appTitleContainer}>
            <Flame size={28} color="#3B82F6" />
            <Text style={styles.appTitle}>МетаБаланс</Text>
          </View>
          <Text style={styles.appSubtitle}>Калькулятор TDEE и калорий</Text>
        </View>

        {/* Основные данные */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Scale size={22} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Основные данные</Text>
            {!isAuthenticated && (
              <TouchableOpacity 
                style={styles.exampleButton}
                onPress={fillExampleData}
              >
                <Text style={styles.exampleButtonText}>Пример</Text>
              </TouchableOpacity>
            )}
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
                placeholderTextColor="#9CA3AF"
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
                placeholderTextColor="#9CA3AF"
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
                placeholderTextColor="#9CA3AF"
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
            <Activity size={22} color="#3B82F6" />
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
            <Target size={22} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Ваша цель</Text>
          </View>
          
          <View style={styles.goalContainer}>
            {[
              { label: 'Похудеть', value: 'loss', color: '#10B981', icon: '👇' },
              { label: 'Поддерживать', value: 'maintain', color: '#3B82F6', icon: '⚖️' },
              { label: 'Набрать', value: 'gain', color: '#F59E0B', icon: '👆' },
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

        {/* Сохранение в профиль и история расчетов (только для авторизованных) */}
        {isAuthenticated && (
          <>
            <View style={styles.saveSection}>
              <View style={styles.saveHeader}>
                <Cloud size={20} color={saveToProfile ? "#3B82F6" : "#9CA3AF"} />
                <Text style={styles.saveTitle}>
                  {saveToProfile ? 'Сохранение данных включено' : 'Сохранение данных отключено'}
                </Text>
              </View>
              <Text style={styles.saveDescription}>
                {saveToProfile 
                  ? 'Данные расчета будут сохранены в вашем профиле'
                  : 'Данные расчета не будут сохранены в профиле'}
              </Text>
              <Switch
                value={saveToProfile}
                onValueChange={setSaveToProfile}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                style={styles.saveSwitch}
              />
            </View>

            <View style={styles.saveSection}>
              <View style={styles.saveHeader}>
                <Save size={20} color={saveCalculations ? "#10B981" : "#9CA3AF"} />
                <Text style={styles.saveTitle}>
                  {saveCalculations ? 'История расчетов включена' : 'История расчетов отключена'}
                </Text>
              </View>
              <Text style={styles.saveDescription}>
                {saveCalculations 
                  ? 'Каждый расчет будет сохранен в вашу историю для отслеживания прогресса'
                  : 'Расчеты не будут сохраняться в историю'}
              </Text>
              <Switch
                value={saveCalculations}
                onValueChange={setSaveCalculations}
                trackColor={{ false: '#D1D5DB', true: "#10B981" }}
                style={styles.saveSwitch}
              />
            </View>
          </>
        )}

        {/* Кнопка расчета */}
        <TouchableOpacity 
          style={[styles.calculateButton, (isCalculating || isSyncing) && styles.calculateButtonDisabled]} 
          onPress={calculateTDEE}
          disabled={isCalculating || isSyncing}
        >
          <Calculator size={24} color="white" />
          <Text style={styles.calculateButtonText}>
            {isCalculating ? 'Расчет...' : isSyncing ? 'Сохранение...' : 'Рассчитать TDEE'}
          </Text>
          <ChevronRight size={20} color="white" />
        </TouchableOpacity>

        {/* Призыв к регистрации для неавторизованных */}
        {!isAuthenticated && (
          <TouchableOpacity 
            style={styles.registerPrompt}
            onPress={() => {}}
          >
            <View style={styles.registerPromptContent}>
              <User size={20} color="#3B82F6" />
              <View style={styles.registerPromptText}>
                <Text style={styles.registerPromptTitle}>
                  Зарегистрируйтесь для большего
                </Text>
                <Text style={styles.registerPromptSubtitle}>
                  Сохраняйте данные в профиле и получайте персонализированные рекомендации
                </Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <Text style={styles.disclaimer}>
            *TDEE (Total Daily Energy Expenditure) - общий суточный расход энергии
          </Text>
        </View>
      </ScrollView>
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
    color: '#111827',
  },
  appSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  exampleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  exampleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
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
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  genderSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  genderButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  genderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  genderTextActive: {
    color: 'white',
  },
  activityScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  activityCard: {
    width: 120,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 12,
  },
  activityCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  activityCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 4,
  },
  activityCardValueActive: {
    color: '#3B82F6',
  },
  activityCardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  activityCardDesc: {
    fontSize: 12,
    color: '#6B7280',
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
    backgroundColor: '#F9FAFB',
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
    color: '#111827',
    marginBottom: 4,
  },
  goalCardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
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
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  saveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  saveTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  saveDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  saveSwitch: {
    alignSelf: 'flex-start',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    padding: 20,
    borderRadius: 16,
    gap: 12,
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  calculateButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowColor: '#9CA3AF',
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  registerPrompt: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DBEAFE',
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
    color: '#1E40AF',
    marginBottom: 4,
  },
  registerPromptSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    paddingBottom: 32,
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
  },
});