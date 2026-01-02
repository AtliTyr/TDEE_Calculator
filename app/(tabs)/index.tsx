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
  Edit2,
  Save,
  Cloud,
  UserCheck,
  UserX
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function CalculatorScreen() {
  const { isAuthenticated, user, updateProfile, isSyncing } = useAuth();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState<number>(1.55);
  const [goal, setGoal] = useState<'loss' | 'maintain' | 'gain'>('maintain');
  const [useProfileData, setUseProfileData] = useState(isAuthenticated);
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const activityLevels = [
    { label: 'Сидячий', value: 1.2, desc: 'Мало или нет тренировок' },
    { label: 'Легкая', value: 1.375, desc: '1-3 тренировки в неделю' },
    { label: 'Умеренная', value: 1.55, desc: '3-5 тренировок в неделю' },
    { label: 'Высокая', value: 1.725, desc: '6-7 тренировок в неделю' },
    { label: 'Экстремальная', value: 1.9, desc: 'Тяжелая работа + тренировки' },
  ];

  // Загрузка данных из профиля
  const loadProfileData = useCallback(() => {
    if (!user) return;
    
    if (user.gender) setGender(user.gender);
    if (user.activityLevel) setActivityLevel(user.activityLevel);
    if (user.height) setHeight(user.height.toString());
    
    // Расчет возраста из даты рождения
    if (user.birthDate) {
      const birth = new Date(user.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      setAge(age.toString());
    }
  }, [user]);

  // Загрузка данных из профиля при изменении зависимостей
  useEffect(() => {
    if (isAuthenticated && user && useProfileData) {
      loadProfileData();
    }
  }, [isAuthenticated, user, useProfileData, loadProfileData]);

  const calculateTDEE = async () => {
    if (!weight || !height || !age) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const ageNum = parseInt(age);

    // Формула Миффлина-Сан Жеора
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
    } else {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
    }

    const tdee = bmr * activityLevel;
    
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

    // Сохраняем данные если нужно
    if (isAuthenticated && saveToProfile && user && updateProfile) {
      const updates: any = {};
      if (weightNum && weightNum !== user.weight) updates.weight = weightNum;
      if (heightNum && heightNum !== user.height) updates.height = heightNum;
      if (activityLevel !== user.activityLevel) updates.activityLevel = activityLevel;
      
      if (Object.keys(updates).length > 0) {
        try {
          await updateProfile(updates);
        } catch (error) {
          console.log('Не удалось сохранить данные:', error);
        }
      }
    }

    Alert.alert(
      '🎯 Результаты расчёта',
      `🏋️‍♂️ **Основной обмен (BMR):** ${Math.round(bmr)} ккал\n\n` +
      `🔥 **Суточный расход (TDEE):** ${Math.round(tdee)} ккал\n\n` +
      `📊 **Целевые калории:** ${targetCalories} ккал\n\n` +
      `💡 **Рекомендация:** ${goal === 'loss' ? 'Для похудения' : goal === 'gain' ? 'Для набора массы' : 'Для поддержания веса'}`,
      [
        { 
          text: 'Отлично!', 
          style: 'default',
          onPress: () => {
            // Сбрасываем редактирование после расчета
            if (isEditing) {
              setIsEditing(false);
              if (useProfileData && isAuthenticated) {
                loadProfileData();
              }
            }
          }
        }
      ]
    );
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Отмена редактирования - возвращаем данные из профиля
      if (useProfileData && isAuthenticated) {
        loadProfileData();
      }
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfileData = () => {
    const newValue = !useProfileData;
    setUseProfileData(newValue);
    if (newValue && isAuthenticated) {
      // Включаем использование профиля - загружаем данные
      loadProfileData();
    }
  };

  // Определяем, можно ли редактировать поле
  const isFieldEditable = (fieldName: string) => {
    if (!isAuthenticated) return true; // Неавторизованные всегда могут редактировать
    if (!useProfileData) return true; // Если отключено использование профиля
    if (isEditing) return true; // Если включен режим редактирования
    return false; // Во всех остальных случаях нельзя редактировать
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Приветствие и статус профиля */}
        <View style={styles.header}>
          <View style={styles.welcomeRow}>
            <View>
              <Text style={styles.welcomeTitle}>
                {isAuthenticated ? `Привет, ${user?.name?.split(' ')[0] || 'друг'}!` : 'Добро пожаловать!'}
              </Text>
              <Text style={styles.welcomeSubtitle}>
                {isAuthenticated ? 'Рады снова видеть вас' : 'Начните свой путь к цели'}
              </Text>
            </View>
            {isAuthenticated ? (
              <View style={styles.userBadge}>
                <UserCheck size={20} color="#3B82F6" />
              </View>
            ) : (
              <View style={styles.userBadge}>
                <UserX size={20} color="#9CA3AF" />
              </View>
            )}
          </View>
          
          <View style={styles.appTitleContainer}>
            <Flame size={28} color="#3B82F6" />
            <Text style={styles.appTitle}>МетаБаланс</Text>
          </View>
          <Text style={styles.appSubtitle}>Калькулятор TDEE и калорий</Text>
        </View>

        {/* Переключатель использования данных профиля (только для авторизованных) */}
        {isAuthenticated && (
          <View style={styles.profileToggle}>
            <View style={styles.profileToggleInfo}>
              <User size={18} color="#3B82F6" />
              <View>
                <Text style={styles.profileToggleTitle}>
                  Использовать данные профиля
                </Text>
                <Text style={styles.profileToggleSubtitle}>
                  {useProfileData 
                    ? 'Данные загружены из вашего профиля' 
                    : 'Введите данные вручную'}
                </Text>
              </View>
            </View>
            <Switch
              value={useProfileData}
              onValueChange={handleSaveProfileData}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
            />
          </View>
        )}

        {/* Основные данные */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Scale size={22} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Основные данные</Text>
            {isAuthenticated && useProfileData && (
              <TouchableOpacity 
                style={styles.editButton}
                onPress={handleEditToggle}
              >
                {isEditing ? (
                  <Save size={18} color="#10B981" />
                ) : (
                  <Edit2 size={18} color="#6B7280" />
                )}
                <Text style={styles.editButtonText}>
                  {isEditing ? 'Сохранить' : 'Изменить'}
                </Text>
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
                editable={isFieldEditable('weight')}
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
                editable={isFieldEditable('height')}
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
                editable={isFieldEditable('age')}
              />
            </View>
          </View>

          <View style={styles.genderSelector}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'male' && styles.genderButtonActive,
                (!isFieldEditable('gender')) && styles.genderButtonDisabled
              ]}
              onPress={() => isFieldEditable('gender') && setGender('male')}
              disabled={!isFieldEditable('gender')}
            >
              <Text style={[
                styles.genderText,
                gender === 'male' && styles.genderTextActive
              ]}>Мужчина</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'female' && styles.genderButtonActive,
                (!isFieldEditable('gender')) && styles.genderButtonDisabled
              ]}
              onPress={() => isFieldEditable('gender') && setGender('female')}
              disabled={!isFieldEditable('gender')}
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
                key={level.value}
                style={[
                  styles.activityCard,
                  activityLevel === level.value && styles.activityCardActive,
                  (!isFieldEditable('activity')) && styles.activityCardDisabled
                ]}
                onPress={() => isFieldEditable('activity') && setActivityLevel(level.value)}
                disabled={!isFieldEditable('activity')}
              >
                <Text style={[
                  styles.activityCardValue,
                  activityLevel === level.value && styles.activityCardValueActive
                ]}>
                  {level.value}
                </Text>
                <Text style={styles.activityCardLabel}>{level.label}</Text>
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

        {/* Сохранение в профиль (только для авторизованных) */}
        {isAuthenticated && (
          <View style={styles.saveSection}>
            <View style={styles.saveHeader}>
              <Cloud size={20} color={saveToProfile ? "#3B82F6" : "#9CA3AF"} />
              <Text style={styles.saveTitle}>
                {saveToProfile ? 'Сохранение в профиль включено' : 'Сохранение в профиль отключено'}
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
        )}

        {/* Информация о режимах */}
        {isAuthenticated ? (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>ℹ️ Как это работает:</Text>
            <Text style={styles.infoText}>
              • <Text style={styles.infoBold}>Режим профиля</Text> - данные подставляются автоматически{'\n'}
              • <Text style={styles.infoBold}>Режим редактирования</Text> - временно измените данные{'\n'}
              • <Text style={styles.infoBold}>Ручной режим</Text> - отключите использование профиля{'\n'}
              • <Text style={styles.infoBold}>Сохранение</Text> - включите для обновления профиля
            </Text>
          </View>
        ) : (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>ℹ️ Как это работает:</Text>
            <Text style={styles.infoText}>
              • <Text style={styles.infoBold}>Без авторизации</Text> - вводите данные вручную{'\n'}
              • <Text style={styles.infoBold}>Расчёт для друга</Text> - просто заполните поля{'\n'}
              • <Text style={styles.infoBold}>История расчётов</Text> - доступна после регистрации{'\n'}
              • <Text style={styles.infoBold}>Автосохранение</Text> - доступно после входа в аккаунт
            </Text>
          </View>
        )}

        {/* Кнопка расчета */}
        <TouchableOpacity 
          style={styles.calculateButton} 
          onPress={calculateTDEE}
          disabled={isSyncing}
        >
          <Calculator size={24} color="white" />
          <Text style={styles.calculateButtonText}>
            {isSyncing ? 'Сохранение...' : 'Рассчитать TDEE'}
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
                  Сохраняйте историю расчётов и настройте авто-заполнение
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
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  userBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
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
  profileToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  profileToggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  profileToggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  profileToggleSubtitle: {
    fontSize: 12,
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  editButtonText: {
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
  genderButtonDisabled: {
    opacity: 0.5,
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
  activityCardDisabled: {
    opacity: 0.5,
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
    marginBottom: 24,
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
  calculateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
  },
  infoBold: {
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