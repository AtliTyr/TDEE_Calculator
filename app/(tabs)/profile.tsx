import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Switch,
  Alert,
  ScrollView,
  SafeAreaView
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
  Star
} from 'lucide-react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [syncEnabled, setSyncEnabled] = useState(true);

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
                    <Text style={styles.userStatText}>Премиум</Text>
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
              <Link href="/auth/login" asChild>
                <TouchableOpacity style={styles.authButtonPrimary}>
                  <LogIn size={20} color="white" />
                  <Text style={styles.authButtonPrimaryText}>Войти</Text>
                  <ChevronRight size={16} color="white" />
                </TouchableOpacity>
              </Link>
              
              <Link href="/auth/register" asChild>
                <TouchableOpacity style={styles.authButtonSecondary}>
                  <UserPlus size={20} color="#3B82F6" />
                  <Text style={styles.authButtonSecondaryText}>Регистрация</Text>
                </TouchableOpacity>
              </Link>
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
                    <Text style={styles.settingDescription}>Облачное сохранение</Text>
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

        {/* Данные (только для авторизованных) */}
        {isAuthenticated && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Shield size={22} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Данные и безопасность</Text>
            </View>
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Smartphone size={20} color="#6B7280" />
              </View>
              <Text style={styles.menuText}>Экспорт данных</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Cloud size={20} color="#6B7280" />
              </View>
              <Text style={styles.menuText}>Резервная копия</Text>
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

        {/* Кнопка выхода/демо */}
        <TouchableOpacity 
          style={[
            styles.actionButton,
            isAuthenticated 
              ? { backgroundColor: '#FEF2F2' }
              : { backgroundColor: '#F3F4F6' }
          ]}
          onPress={isAuthenticated ? handleLogout : () => router.push('/auth/login')}
          disabled={isLoading}
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