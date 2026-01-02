import { useState, useEffect } from 'react';
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
import { router } from 'expo-router';
import {
  User,
  Ruler,
  Scale,
  Activity,
  Calendar,
  ChevronLeft,
  Save,
  Cloud,
  Check,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function EditProfileScreen() {
  const { user, updateProfile, isSyncing } = useAuth();
  const [name, setName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<number>(1.55);
  const [isEditing, setIsEditing] = useState(false);

  // Инициализация данных из профиля
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setHeight(user.height?.toString() || '');
      setWeight(user.weight?.toString() || '');
      setActivityLevel(user.activityLevel || 1.55);
    }
  }, [user]);

  const activityLevels = [
    { label: 'Сидячий', value: 1.2, desc: 'Мало или нет тренировок' },
    { label: 'Легкая', value: 1.375, desc: '1-3 тренировки в неделю' },
    { label: 'Умеренная', value: 1.55, desc: '3-5 тренировок в неделю' },
    { label: 'Высокая', value: 1.725, desc: '6-7 тренировок в неделю' },
    { label: 'Экстремальная', value: 1.9, desc: 'Тяжелая работа + тренировки' },
  ];

  const calculateAge = () => {
    if (!user?.birthDate) return '—';
    const birth = new Date(user.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const updates: any = {};
      
      if (name !== user.name) updates.name = name;
      if (height) updates.height = parseFloat(height);
      if (weight) updates.weight = parseFloat(weight);
      if (activityLevel !== user.activityLevel) updates.activityLevel = activityLevel;

      if (Object.keys(updates).length > 0) {
        await updateProfile(updates);
        Alert.alert('Успех', 'Профиль обновлён и синхронизирован');
        setIsEditing(false);
      } else {
        Alert.alert('Информация', 'Нет изменений для сохранения');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить изменения');
    }
  };

  const handleReset = () => {
    if (user) {
      setName(user.name || '');
      setHeight(user.height?.toString() || '');
      setWeight(user.weight?.toString() || '');
      setActivityLevel(user.activityLevel || 1.55);
      setIsEditing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Редактировать профиль</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Информация о синхронизации */}
        {isSyncing && (
          <View style={styles.syncStatus}>
            <Cloud size={16} color="#3B82F6" />
            <Text style={styles.syncText}>Синхронизация...</Text>
          </View>
        )}

        {/* Основная информация */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Основная информация</Text>
          </View>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Имя</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Введите имя"
                />
              ) : (
                <Text style={styles.infoValue}>{user?.name || 'Не указано'}</Text>
              )}
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || 'Не указан'}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Пол</Text>
              <Text style={styles.infoValue}>
                {user?.gender === 'male' ? 'Мужской' : 'Женский'}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Возраст</Text>
              <View style={styles.ageContainer}>
                <Calendar size={16} color="#6B7280" />
                <Text style={styles.infoValue}>{calculateAge()} лет</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Антропометрические данные */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ruler size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Антропометрия</Text>
          </View>
          
          <View style={styles.measurementsGrid}>
            <View style={styles.measurementItem}>
              <View style={styles.measurementHeader}>
                <Ruler size={18} color="#6B7280" />
                <Text style={styles.measurementLabel}>Рост (см)</Text>
              </View>
              {isEditing ? (
                <TextInput
                  style={styles.measurementInput}
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  placeholder="175"
                />
              ) : (
                <Text style={styles.measurementValue}>
                  {user?.height ? `${user.height} см` : 'Не указан'}
                </Text>
              )}
            </View>
            
            <View style={styles.measurementItem}>
              <View style={styles.measurementHeader}>
                <Scale size={18} color="#6B7280" />
                <Text style={styles.measurementLabel}>Вес (кг)</Text>
              </View>
              {isEditing ? (
                <TextInput
                  style={styles.measurementInput}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  placeholder="75"
                />
              ) : (
                <Text style={styles.measurementValue}>
                  {user?.weight ? `${user.weight} кг` : 'Не указан'}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Уровень активности */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Уровень активности</Text>
          </View>
          
          <Text style={styles.activityDescription}>
            {isEditing
              ? 'Выберите ваш уровень физической активности:'
              : 'Ваш текущий уровень активности:'}
          </Text>
          
          <View style={styles.activityGrid}>
            {activityLevels.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.activityCard,
                  activityLevel === level.value && styles.activityCardActive,
                  !isEditing && styles.activityCardDisabled,
                ]}
                onPress={() => isEditing && setActivityLevel(level.value)}
                disabled={!isEditing}
              >
                <View style={styles.activityCardHeader}>
                  <Text style={styles.activityCardValue}>{level.value}</Text>
                  {activityLevel === level.value && (
                    <Check size={16} color="#3B82F6" />
                  )}
                </View>
                <Text style={styles.activityCardLabel}>{level.label}</Text>
                <Text style={styles.activityCardDesc}>{level.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Кнопки управления */}
        <View style={styles.actions}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={isSyncing}
              >
                <Save size={20} color="white" />
                <Text style={styles.saveButtonText}>
                  {isSyncing ? 'Сохранение...' : 'Сохранить изменения'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleReset}
                disabled={isSyncing}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>Редактировать профиль</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Подсказка */}
        <View style={styles.hint}>
          <Text style={styles.hintText}>
            💡 Эти данные используются для автоматического заполнения калькулятора TDEE.
            Вы всегда можете изменить их при расчете.
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerRight: {
    width: 40,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  syncText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
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
  infoGrid: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoItemLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  ageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'right',
    minWidth: 150,
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  measurementsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  measurementItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  measurementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  measurementLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  measurementInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  measurementValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  activityDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  activityGrid: {
    gap: 8,
  },
  activityCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activityCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  activityCardDisabled: {
    opacity: 0.7,
  },
  activityCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B7280',
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
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  button: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#3B82F6',
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  hintText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
  },
});