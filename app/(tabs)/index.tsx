import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar
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
  User
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function CalculatorScreen() {
  const { isAuthenticated, user } = useAuth();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState<number>(1.55);
  const [goal, setGoal] = useState<'loss' | 'maintain' | 'gain'>('maintain');
  
  const activityLevels = [
    { label: 'Сидячий', value: 1.2, desc: 'Мало или нет тренировок' },
    { label: 'Легкая', value: 1.375, desc: '1-3 тренировки в неделю' },
    { label: 'Умеренная', value: 1.55, desc: '3-5 тренировок в неделю' },
    { label: 'Высокая', value: 1.725, desc: '6-7 тренировок в неделю' },
    { label: 'Экстремальная', value: 1.9, desc: 'Тяжелая работа + тренировки' },
  ];

  const calculateTDEE = () => {
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

    Alert.alert(
      '🎯 Результаты расчёта',
      `🏋️‍♂️ **Основной обмен (BMR):** ${Math.round(bmr)} ккал\n\n` +
      `🔥 **Суточный расход (TDEE):** ${Math.round(tdee)} ккал\n\n` +
      `📊 **Целевые калории:** ${targetCalories} ккал\n\n` +
      `💡 **Рекомендация:** ${goal === 'loss' ? 'Для похудения' : goal === 'gain' ? 'Для набора массы' : 'Для поддержания веса'}`,
      [{ text: 'Отлично!', style: 'default' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Приветствие пользователя */}
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
            {isAuthenticated && (
              <View style={styles.userBadge}>
                <User size={20} color="#3B82F6" />
              </View>
            )}
          </View>
          
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
          </View>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Вес (кг)</Text>
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
                key={level.value}
                style={[
                  styles.activityCard,
                  activityLevel === level.value && styles.activityCardActive
                ]}
                onPress={() => setActivityLevel(level.value)}
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

        {/* Кнопка расчета */}
        <TouchableOpacity 
          style={styles.calculateButton} 
          onPress={calculateTDEE}
        >
          <Calculator size={24} color="white" />
          <Text style={styles.calculateButtonText}>Рассчитать TDEE</Text>
          <ChevronRight size={20} color="white" />
        </TouchableOpacity>

        {/* Быстрый доступ */}
        <View style={styles.quickAccess}>
          <Text style={styles.quickAccessTitle}>Быстрый доступ</Text>
          <View style={styles.quickAccessRow}>
            <TouchableOpacity style={styles.quickAccessItem}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#EFF6FF' }]}>
                <Calendar size={20} color="#3B82F6" />
              </View>
              <Text style={styles.quickAccessLabel}>История</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAccessItem}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#F0FDF4' }]}>
                <Target size={20} color="#10B981" />
              </View>
              <Text style={styles.quickAccessLabel}>Цели</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAccessItem}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#FEF3C7' }]}>
                <Flame size={20} color="#F59E0B" />
              </View>
              <Text style={styles.quickAccessLabel}>Прогресс</Text>
            </TouchableOpacity>
          </View>
        </View>

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
    marginBottom: 32,
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
    backgroundColor: '#EFF6FF',
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
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
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
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    padding: 20,
    borderRadius: 16,
    gap: 12,
    marginBottom: 32,
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
  quickAccess: {
    marginBottom: 32,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  quickAccessRow: {
    flexDirection: 'row',
    gap: 16,
  },
  quickAccessItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickAccessIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickAccessLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
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