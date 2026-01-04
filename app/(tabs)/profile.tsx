import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Switch,
  Alert,
  ScrollView,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { 
  User, 
  Settings, 
  Bell, 
  Moon, 
  Globe,
  HelpCircle,
  LogOut,
  LogIn,
  UserPlus,
  Shield,
  Cloud,
  Smartphone,
  History,
  TrendingUp,
  Info,
  ChevronRight,
  Check,
  Star,
  Edit2,
  Save,
  Ruler,
  Scale,
  Activity,
  Calendar,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const { isAuthenticated, user, logout, updateProfile, isLoading, isSyncing } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedHeight, setEditedHeight] = useState('');
  const [editedWeight, setEditedWeight] = useState('');
  const [editedActivityCode, setEditedActivityCode] = useState<string | null>(null);

  // Инициализация данных при загрузке
  useEffect(() => {
    if (user) {
      // console.log('User activityLevel from backend:', user.activityLevel);
      // console.log('User data:', JSON.stringify(user, null, 2));
      
      setEditedHeight(user.height?.toString() || '');
      setEditedWeight(user.weight?.toString() || '');
      setEditedActivityCode(user.activityLevel ?? null);
    }
  }, [user]);


  const activityLevels = [
    { code: 'sedentary', name: 'Сидячий', coef: 1.2, desc: 'Мало или нет тренировок' },
    { code: 'light', name: 'Легкая', coef: 1.375, desc: '1-3 тренировки в неделю' },
    { code: 'moderate', name: 'Умеренная', coef: 1.55, desc: '3-5 тренировок в неделю' },
    { code: 'high', name: 'Высокая', coef: 1.725, desc: '6-7 тренировок в неделю' },
    { code: 'extreme', name: 'Экстремальная', coef: 1.9, desc: 'Тяжелая работа + тренировки' },
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

  const handleLogout = () => {
    Alert.alert(
      'Выход из аккаунта',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Выйти', 
          style: 'destructive',
          onPress: () => {
            logout();
            Alert.alert('Вы вышли из аккаунта');
          }
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const updates: any = {};

      if (editedHeight && Number(editedHeight) !== user.height) {
        updates.height = Number(editedHeight);
      }

      if (editedWeight && Number(editedWeight) !== user.weight) {
        updates.weight = Number(editedWeight);
      }

      if (editedActivityCode && editedActivityCode !== user.activityLevel) {
        updates.activityLevel = editedActivityCode;
      }

      if (Object.keys(updates).length === 0) {
        Alert.alert('Информация', 'Нет изменений');
        return;
      }

      await updateProfile(updates);
      Alert.alert('Успех', 'Профиль обновлён');
      setIsEditing(false);
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить изменения');
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditedHeight(user.height?.toString() || '');
      setEditedWeight(user.weight?.toString() || '');
      setEditedActivityCode(user.activityLevel ?? null);
    }
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Заголовок */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            {isAuthenticated ? (
              <User size={28} color="#3B82F6" />
            ) : (
              <LogIn size={28} color="#3B82F6" />
            )}
            <Text style={styles.title}>
              {isAuthenticated ? 'Профиль' : 'Войти'}
            </Text>
          </View>
          <Text style={styles.subtitle}>
            {isAuthenticated 
              ? 'Управление аккаунтом и настройками' 
              : 'Войдите или зарегистрируйтесь'}
          </Text>
        </View>

        {/* Блок авторизации/пользователя */}
        {isAuthenticated ? (
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'У'}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.name || 'Пользователь'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
                <View style={styles.userStats}>
                  <View style={styles.userStat}>
                    <Star size={14} color="#F59E0B" />
                    <Text style={styles.userStatText}>Базовый</Text>
                  </View>
                  <View style={styles.userStat}>
                    <Check size={14} color="#10B981" />
                    <Text style={styles.userStatText}>Активен</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.quickStats}>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatValue}>24</Text>
                <Text style={styles.quickStatLabel}>Расчётов</Text>
              </View>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatValue}>7</Text>
                <Text style={styles.quickStatLabel}>Дней</Text>
              </View>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatValue}>85%</Text>
                <Text style={styles.quickStatLabel}>Прогресс</Text>
              </View>
            </View>

            {/* Редактирование профиля */}
            <View style={styles.editSection}>
              <View style={styles.editHeader}>
                <Text style={styles.editTitle}>Данные для калькулятора</Text>
                {isEditing ? (
                  <View style={styles.editButtons}>
                    <TouchableOpacity 
                      style={[styles.editButton, styles.saveButton]}
                      onPress={handleSaveProfile}
                      disabled={isSyncing}
                    >
                      <Save size={16} color="white" />
                      <Text style={styles.saveButtonText}>
                        {isSyncing ? 'Сохранение...' : 'Сохранить'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.editButton, styles.cancelButton]}
                      onPress={handleCancelEdit}
                      disabled={isSyncing}
                    >
                      <Text style={styles.cancelButtonText}>Отмена</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                  >
                    <Edit2 size={16} color="#3B82F6" />
                    <Text style={styles.editButtonText}>Редактировать</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Поля редактирования */}
              <View style={styles.editFields}>
                {/* Рост */}
                <View style={styles.editField}>
                  <View style={styles.fieldHeader}>
                    <Ruler size={18} color="#6B7280" />
                    <Text style={styles.fieldLabel}>Рост (см)</Text>
                  </View>
                  {isEditing ? (
                    <TextInput
                      style={styles.fieldInput}
                      value={editedHeight}
                      onChangeText={setEditedHeight}
                      keyboardType="numeric"
                      placeholder="175"
                    />
                  ) : (
                    <Text style={styles.fieldValue}>
                      {user?.height ? `${user.height} см` : 'Не указан'}
                    </Text>
                  )}
                </View>

                {/* Вес */}
                <View style={styles.editField}>
                  <View style={styles.fieldHeader}>
                    <Scale size={18} color="#6B7280" />
                    <Text style={styles.fieldLabel}>Вес (кг)</Text>
                  </View>
                  {isEditing ? (
                    <TextInput
                      style={styles.fieldInput}
                      value={editedWeight}
                      onChangeText={setEditedWeight}
                      keyboardType="numeric"
                      placeholder="75"
                    />
                  ) : (
                    <Text style={styles.fieldValue}>
                      {user?.weight ? `${user.weight} кг` : 'Не указан'}
                    </Text>
                  )}
                </View>

                {/* Уровень активности */}
                <View style={styles.editField}>
                  <View style={styles.fieldHeader}>
                    <Activity size={18} color="#6B7280" />
                    <Text style={styles.fieldLabel}>Активность</Text>
                  </View>
                  {isEditing ? (
                    <View style={styles.activitySelector}>
                      {activityLevels.map((level) => (
                        <TouchableOpacity
                          key={level.code}
                          style={[
                            styles.activityOption,
                            editedActivityCode === level.code && styles.activityOptionActive
                          ]}
                          onPress={() => setEditedActivityCode(level.code)}
                        >
                          <Text style={[
                            styles.activityOptionText,
                            editedActivityCode === level.code && styles.activityOptionTextActive
                          ]}>
                            {level.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.fieldValue}>
                      {user?.activityLevel
                        ? activityLevels.find(l => l.code === user.activityLevel)?.name || 'Не указана'
                        : 'Не указана'}
                    </Text>
                  )}
                </View>

                {/* Возраст (только чтение) */}
                <View style={styles.editField}>
                  <View style={styles.fieldHeader}>
                    <Calendar size={18} color="#6B7280" />
                    <Text style={styles.fieldLabel}>Возраст</Text>
                  </View>
                  <Text style={styles.fieldValue}>{calculateAge()} лет</Text>
                </View>

                {/* Пол (только чтение) */}
                <View style={styles.editField}>
                  <View style={styles.fieldHeader}>
                    <User size={18} color="#6B7280" />
                    <Text style={styles.fieldLabel}>Пол</Text>
                  </View>
                  <Text style={styles.fieldValue}>
                    {user?.gender === 'male' ? 'Мужской' : 'Женский'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.authCard}>
            <View style={styles.authIconContainer}>
              <LogIn size={40} color="#3B82F6" />
            </View>
            <Text style={styles.authTitle}>
              Войдите в аккаунт
            </Text>
            <Text style={styles.authDescription}>
              Синхронизируйте данные и получите доступ ко всем функциям
            </Text>
            
            <View style={styles.authButtons}>
              <TouchableOpacity 
                style={styles.authButtonPrimary}
                onPress={() => router.push('/auth/login')}
              >
                <LogIn size={20} color="white" />
                <Text style={styles.authButtonPrimaryText}>Войти</Text>
                <ChevronRight size={16} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.authButtonSecondary}
                onPress={() => router.push('/auth/register')}
              >
                <UserPlus size={20} color="#3B82F6" />
                <Text style={styles.authButtonSecondaryText}>Регистрация</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.authFeatures}>
              <View style={styles.authFeature}>
                <View style={[styles.authFeatureIcon, { backgroundColor: '#EFF6FF' }]}>
                  <Cloud size={16} color="#3B82F6" />
                </View>
                <Text style={styles.authFeatureText}>Синхронизация данных</Text>
              </View>
              <View style={styles.authFeature}>
                <View style={[styles.authFeatureIcon, { backgroundColor: '#F0FDF4' }]}>
                  <History size={16} color="#10B981" />
                </View>
                <Text style={styles.authFeatureText}>История расчётов</Text>
              </View>
            </View>
          </View>
        )}

        {/* Настройки */}
        <View style={styles.settingsSection}>
          <View style={styles.sectionHeader}>
            <Settings size={22} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Настройки</Text>
          </View>
          
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={[styles.settingIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Moon size={20} color="#F59E0B" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Тёмная тема</Text>
                  <Text style={styles.settingDescription}>Использовать тёмную тему</Text>
                </View>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor={darkMode ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={[styles.settingIcon, { backgroundColor: '#DBEAFE' }]}>
                  <Bell size={20} color="#3B82F6" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Уведомления</Text>
                  <Text style={styles.settingDescription}>Напоминания и уведомления</Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor={notifications ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
            
            {isAuthenticated && (
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <View style={[styles.settingIcon, { backgroundColor: '#D1FAE5' }]}>
                    <Cloud size={20} color="#10B981" />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Синхронизация</Text>
                    <Text style={styles.settingDescription}>Автоматическая синхронизация</Text>
                  </View>
                </View>
                <Switch
                  value={syncEnabled}
                  onValueChange={setSyncEnabled}
                  trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                  thumbColor={syncEnabled ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>
            )}
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={[styles.settingIcon, { backgroundColor: '#E5E7EB' }]}>
                  <Globe size={20} color="#6B7280" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Язык</Text>
                  <Text style={styles.settingDescription}>Русский</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Данные и безопасность (только для авторизованных) */}
        {isAuthenticated && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Shield size={22} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Данные и безопасность</Text>
            </View>
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Download size={20} color="#6B7280" />
              </View>
              <Text style={styles.menuText}>Экспорт данных</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Upload size={20} color="#6B7280" />
              </View>
              <Text style={styles.menuText}>Импорт данных</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <RefreshCw size={20} color="#6B7280" />
              </View>
              <Text style={styles.menuText}>Синхронизировать сейчас</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Помощь */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <HelpCircle size={22} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Помощь и поддержка</Text>
          </View>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Info size={20} color="#6B7280" />
            </View>
            <Text style={styles.menuText}>Как работает TDEE?</Text>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <HelpCircle size={20} color="#6B7280" />
            </View>
            <Text style={styles.menuText}>Частые вопросы</Text>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <History size={20} color="#6B7280" />
            </View>
            <Text style={styles.menuText}>Обратная связь</Text>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Кнопка выхода/входа */}
        <TouchableOpacity 
          style={[
            styles.actionButton,
            isAuthenticated 
              ? { backgroundColor: '#FEF2F2' }
              : { backgroundColor: '#F3F4F6' }
          ]}
          onPress={isAuthenticated ? handleLogout : () => router.push('/auth/login')}
          disabled={isLoading || isSyncing}
        >
          {isAuthenticated ? (
            <>
              <LogOut size={20} color="#EF4444" />
              <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>
                Выйти из аккаунта
              </Text>
            </>
          ) : (
            <>
              <LogIn size={20} color="#6B7280" />
              <Text style={[styles.actionButtonText, { color: '#6B7280' }]}>
                Перейти к входу
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Информация о приложении */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>МетаБаланс</Text>
          <Text style={styles.appVersion}>Версия 1.0.0</Text>
          <Text style={styles.appCopyright}>© 2024 Все права защищены</Text>
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
  profileCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  userStats: {
    flexDirection: 'row',
    gap: 12,
  },
  userStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userStatText: {
    fontSize: 12,
    color: '#6B7280',
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  editSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  editTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
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
  saveButton: {
    backgroundColor: '#10B981',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  editFields: {
    gap: 16,
  },
  editField: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 16,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  fieldInput: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  activitySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activityOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  activityOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  activityOptionTextActive: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  authCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  authIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  authDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  authButtons: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  authButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  authButtonPrimaryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  authButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  authButtonSecondaryText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  authFeatures: {
    width: '100%',
    gap: 12,
  },
  authFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authFeatureIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authFeatureText: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingsSection: {
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
  section: {
    marginBottom: 24,
  },
  settingsList: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});