import { useState, useEffect, useContext } from 'react';
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
  Modal,
  Linking,
  Dimensions,
} from 'react-native';
import { 
  User, 
  Settings, 
  Moon, 
  Sun,
  HelpCircle,
  LogOut,
  LogIn,
  UserPlus,
  Cloud,
  History,
  Info,
  ChevronRight,
  Edit2,
  Save,
  Ruler,
  Scale,
  Activity,
  Calendar,
  X,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Flame,
  Target,
  Calculator,
  Star,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeContext } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ProfileScreen() {
  const { isAuthenticated, user, logout, updateProfile, isLoading, isSyncing } = useAuth();
  const { setColorScheme } = useContext(ThemeContext);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [isEditing, setIsEditing] = useState(false);
  const [editedHeight, setEditedHeight] = useState('');
  const [editedWeight, setEditedWeight] = useState('');
  const [editedActivityCode, setEditedActivityCode] = useState<string | null>(null);
  
  // Модалки для помощи
  const [showTDEEModal, setShowTDEEModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Инициализация данных при загрузке
  useEffect(() => {
    if (user) {
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

  // Модалка "Как работает TDEE?"
  const TDEEModal = () => (
    <Modal
      visible={showTDEEModal}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={() => setShowTDEEModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <View style={styles.modalIconContainer}>
                <Flame size={24} color={colors.accent} />
              </View>
              <Text style={styles.modalTitle}>Что такое TDEE и BMR?</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setShowTDEEModal(false)}
              style={styles.modalCloseButton}
            >
              <X size={24} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalSection}>
              <View style={styles.infoCard}>
                <Info size={20} color={colors.accent} />
                <Text style={styles.infoCardTitle}>BMR (Basal Metabolic Rate)</Text>
                <Text style={styles.infoCardText}>
                  Основной обмен веществ — количество калорий, которое ваш организм сжигает в состоянии полного покоя для поддержания жизненных функций.
                </Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Activity size={18} color={colors.warning} />
                </View>
                <Text style={styles.featureTitle}>Что включает BMR?</Text>
                <Text style={styles.featureDescription}>
                  • Дыхание и работа сердца{'\n'}
                  • Поддержание температуры тела{'\n'}
                  • Работа мозга{'\n'}
                  • Клеточный обмен
                </Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <View style={styles.infoCard}>
                <Calculator size={20} color={colors.error} />
                <Text style={styles.infoCardTitle}>TDEE (Total Daily Energy Expenditure)</Text>
                <Text style={styles.infoCardText}>
                  Общий суточный расход энергии — полное количество калорий, которое вы сжигаете за день с учётом физической активности.
                </Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <View style={styles.formulaCard}>
                <Text style={styles.formulaTitle}>Формула расчета</Text>
                <Text style={styles.formulaText}>
                  TDEE = BMR × Коэффициент активности
                </Text>
                <View style={styles.formulaSteps}>
                  <Text style={styles.formulaStep}>1. Рассчитываем BMR</Text>
                  <Text style={styles.formulaDetail}>Для мужчин: 10×вес + 6.25×рост - 5×возраст + 5</Text>
                  <Text style={styles.formulaDetail}>Для женщин: 10×вес + 6.25×рост - 5×возраст - 161</Text>
                  
                  <Text style={styles.formulaStep}>2. Умножаем на коэффициент</Text>
                  <View style={styles.coefficients}>
                    <View style={styles.coefficientItem}>
                      <Text style={styles.coefficientValue}>×1.2</Text>
                      <Text style={styles.coefficientLabel}>Сидячий</Text>
                    </View>
                    <View style={styles.coefficientItem}>
                      <Text style={styles.coefficientValue}>×1.375</Text>
                      <Text style={styles.coefficientLabel}>Легкая</Text>
                    </View>
                    <View style={styles.coefficientItem}>
                      <Text style={styles.coefficientValue}>×1.55</Text>
                      <Text style={styles.coefficientLabel}>Умеренная</Text>
                    </View>
                    <View style={styles.coefficientItem}>
                      <Text style={styles.coefficientValue}>×1.725</Text>
                      <Text style={styles.coefficientLabel}>Высокая</Text>
                    </View>
                    <View style={styles.coefficientItem}>
                      <Text style={styles.coefficientValue}>×1.9</Text>
                      <Text style={styles.coefficientLabel}>Экстремальная</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.modalSection}>
              <View style={styles.exampleCard}>
                <Text style={styles.exampleTitle}>📊 Пример расчета</Text>
                <View style={styles.exampleDetails}>
                  <Text style={styles.exampleDetail}>Мужчина, 30 лет, 75 кг, 180 см</Text>
                  <Text style={styles.exampleDetail}>Умеренная активность (×1.55)</Text>
                  <View style={styles.exampleCalculation}>
                    <Text style={styles.exampleStep}>BMR = 10×75 + 6.25×180 - 5×30 + 5</Text>
                    <Text style={styles.exampleStep}>BMR = 1705 ккал</Text>
                    <Text style={styles.exampleStep}>TDEE = 1705 × 1.55 = 2643 ккал/день</Text>
                    <Text style={styles.exampleStep}>Для похудения: 2643 × 0.8 = 2114 ккал/день</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.modalSection}>
              <View style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>💡 Как использовать TDEE?</Text>
                <View style={styles.tipsList}>
                  <View style={styles.tipItem}>
                    <View style={[styles.tipIcon, { backgroundColor: colors.successBg }]}>
                      <Target size={16} color={colors.success} />
                    </View>
                    <Text style={styles.tipText}>
                      <Text style={styles.tipBold}>Поддержание веса:</Text>{'\n'}
                      Потребляйте столько же калорий, сколько ваш TDEE
                    </Text>
                  </View>
                  <View style={styles.tipItem}>
                    <View style={[styles.tipIcon, { backgroundColor: colors.errorBg }]}>
                      <Activity size={16} color={colors.error} />
                    </View>
                    <Text style={styles.tipText}>
                      <Text style={styles.tipBold}>Похудение:</Text>{'\n'}
                      Создайте дефицит 300-500 ккал от TDEE
                    </Text>
                  </View>
                  <View style={styles.tipItem}>
                    <View style={[styles.tipIcon, { backgroundColor: colors.warningBg }]}>
                      <Star size={16} color={colors.warning} />
                    </View>
                    <Text style={styles.tipText}>
                      <Text style={styles.tipBold}>Набор массы:</Text>{'\n'}
                      Создайте профицит 300-500 ккал от TDEE
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowTDEEModal(false)}
            >
              <Text style={styles.modalButtonText}>Понятно, спасибо!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Модалка "Частые вопросы"
  const FAQModal = () => (
    <Modal
      visible={showFAQModal}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={() => setShowFAQModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <View style={styles.modalIconContainer}>
                <HelpCircle size={24} color={colors.accent} />
              </View>
              <Text style={styles.modalTitle}>Частые вопросы</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setShowFAQModal(false)}
              style={styles.modalCloseButton}
            >
              <X size={24} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            // style={{flex: 1}}
            style={[styles.modalBody]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.faqSection}>
              <Text style={styles.faqSectionTitle}>Общие вопросы</Text>
              
              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Как часто нужно обновлять данные?</Text>
                <Text style={styles.faqAnswer}>
                  Рекомендуем обновлять вес каждую неделю. Рост и уровень активности — при их изменении.
                </Text>
              </View>
              
              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Насколько точны расчеты?</Text>
                <Text style={styles.faqAnswer}>
                  Точность составляет 90-95%. Для максимальной точности регулярно обновляйте данные.
                </Text>
              </View>
              
              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Какой коэффициент активности выбрать?</Text>
                <Text style={styles.faqAnswer}>
                  Выбирайте тот, который лучше всего описывает вашу недельную активность. Если сомневаетесь — выберите более низкий уровень.
                </Text>
              </View>
            </View>
            
            <View style={styles.faqSection}>
              <Text style={styles.faqSectionTitle}>Работа с приложением</Text>
              
              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Как синхронизировать данные?</Text>
                <Text style={styles.faqAnswer}>
                  Все данные автоматически синхронизируются при наличии интернета. Для ручной синхронизации перезапустите приложение.
                </Text>
              </View>
              
              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Где хранятся мои данные?</Text>
                <Text style={styles.faqAnswer}>
                  Данные хранятся в защищенном облачном хранилище и на вашем устройстве. Только вы имеете к ним доступ.
                </Text>
              </View>
              
              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Как сбросить пароль?</Text>
                <Text style={styles.faqAnswer}>
                  На странице входа нажмите &quot;Забыли пароль&quot;. Инструкция по восстановлению придет на email.
                </Text>
              </View>
            </View>
            
            <View style={styles.faqSection}>
              <Text style={styles.faqSectionTitle}>Питание и тренировки</Text>
              
              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Сколько нужно пить воды?</Text>
                <Text style={styles.faqAnswer}>
                  Рекомендуется 30-40 мл на 1 кг веса. При активных тренировках — больше.
                </Text>
              </View>
              
              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Когда лучше тренироваться?</Text>
                <Text style={styles.faqAnswer}>
                  В любое удобное время. Главное — регулярность. Оптимально за 1.5-2 часа до или после еды.
                </Text>
              </View>
              
              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Как отслеживать прогресс?</Text>
                <Text style={styles.faqAnswer}>
                  Взвешивайтесь в одно и то же время суток, натощак. Делайте замеры раз в неделю.
                </Text>
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowFAQModal(false)}
            >
              <Text style={styles.modalButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Модалка "Обратная связь" (в разработке)
  const FeedbackModal = () => (
    <Modal
      visible={showFeedbackModal}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={() => setShowFeedbackModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, styles.feedbackModalContent]}>
          <View style={styles.feedbackHeader}>
            <View style={styles.feedbackIconContainer}>
              <AlertCircle size={48} color={colors.accent} />
            </View>
            <Text style={styles.feedbackTitle}>В разработке</Text>
            <Text style={styles.feedbackText}>
              Раздел обратной связи находится в разработке.{'\n'}
              Скоро вы сможете отправлять свои предложения и сообщать об ошибках.
            </Text>
          </View>
          
          <View style={styles.feedbackBody}>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color={colors.success} />
              <Text style={styles.featureText}>Форма обратной связи</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color={colors.success} />
              <Text style={styles.featureText}>Отправка скриншотов</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color={colors.success} />
              <Text style={styles.featureText}>История обращений</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color={colors.success} />
              <Text style={styles.featureText}>Статус обработки</Text>
            </View>
          </View>
          
          <View style={styles.feedbackFooter}>
            <TouchableOpacity 
              style={styles.feedbackButton}
              onPress={() => setShowFeedbackModal(false)}
            >
              <Text style={styles.feedbackButtonText}>Жду с нетерпением!</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.emailButton}
              onPress={() => Linking.openURL('mailto:support@metabalance.ru')}
            >
              <Text style={styles.emailButtonText}>Написать на почту</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    subtitle: {
      fontSize: 16,
      color: colors.secondaryText,
    },
    profileCard: {
      backgroundColor: colors.lightBg,
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
      backgroundColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    avatarText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.accentText,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: colors.secondaryText,
      marginBottom: 8,
    },
    editSection: {
      backgroundColor: colors.background,
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
      color: colors.text,
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
      backgroundColor: colors.veryLightBg,
    },
    saveButton: {
      backgroundColor: colors.success,
    },
    saveButtonText: {
      color: colors.accentText,
      fontSize: 14,
      fontWeight: '500',
    },
    cancelButton: {
      backgroundColor: colors.veryLightBg,
    },
    cancelButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    editButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.accent,
    },
    editFields: {
      gap: 16,
    },
    editField: {
      borderBottomWidth: 1,
      borderBottomColor: colors.veryLightBg,
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
      color: colors.secondaryText,
    },
    fieldInput: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      backgroundColor: colors.lightBg,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    fieldValue: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
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
      backgroundColor: colors.veryLightBg,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    activityOptionActive: {
      backgroundColor: colors.blueBg,
      borderColor: colors.accent,
    },
    activityOptionText: {
      fontSize: 14,
      color: colors.secondaryText,
    },
    activityOptionTextActive: {
      color: colors.accent,
      fontWeight: '500',
    },
    authCard: {
      backgroundColor: colors.lightBg,
      borderRadius: 20,
      padding: 24,
      marginBottom: 24,
      alignItems: 'center',
    },
    authIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.blueBg,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    authTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    authDescription: {
      fontSize: 14,
      color: colors.secondaryText,
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
      backgroundColor: colors.accent,
      paddingVertical: 16,
      borderRadius: 12,
      gap: 12,
    },
    authButtonPrimaryText: {
      color: colors.accentText,
      fontSize: 16,
      fontWeight: '600',
    },
    authButtonSecondary: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      paddingVertical: 16,
      borderRadius: 12,
      gap: 12,
      borderWidth: 2,
      borderColor: colors.border,
    },
    authButtonSecondaryText: {
      color: colors.text,
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
      color: colors.secondaryText,
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
      color: colors.text,
    },
    section: {
      marginBottom: 24,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.veryLightBg,
    },
    menuIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.lightBg,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    menuText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    themeSection: {
      marginBottom: 24,
    },
    themeCard: {
      backgroundColor: colors.lightBg,
      borderRadius: 16,
      padding: 20,
    },
    themeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 8,
    },
    themeTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    themeDescription: {
      fontSize: 14,
      color: colors.secondaryText,
      marginBottom: 16,
    },
    themeSwitchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    themeSwitchLabel: {
      fontSize: 16,
      color: colors.text,
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
      color: colors.text,
      marginBottom: 4,
    },
    appVersion: {
      fontSize: 14,
      color: colors.secondaryText,
      marginBottom: 4,
    },
    appCopyright: {
      fontSize: 12,
      color: colors.mutedText,
    },

    // ========== СТИЛИ МОДАЛЬНЫХ ОКОН ==========
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    modalContent: {
      backgroundColor: colors.background,
      borderRadius: 20,
      width: '100%',
      maxWidth: 500,
      height: screenHeight * 0.85,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    feedbackModalContent: {
      padding: 0,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.veryLightBg,
    },
    modalHeaderContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    modalIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.blueBg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    modalCloseButton: {
      padding: 4,
    },
    modalBody: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    modalSection: {
      marginBottom: 20,
    },
    modalFooter: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.veryLightBg,
    },
    modalButton: {
      backgroundColor: colors.accent,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    modalButtonText: {
      color: colors.accentText,
      fontSize: 16,
      fontWeight: '600',
    },

    // Стили для модалки TDEE
    infoCard: {
      backgroundColor: colors.blueBg,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    infoCardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.info,
      marginTop: 12,
      marginBottom: 8,
      textAlign: 'center',
    },
    infoCardText: {
      fontSize: 14,
      color: colors.text,
      textAlign: 'center',
      lineHeight: 20,
    },
    // featureItem: {
    //   backgroundColor: '#F9FAFB',
    //   borderRadius: 12,
    //   padding: 16,
    // },
    featureIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.warningBg,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    featureTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    featureDescription: {
      fontSize: 14,
      color: colors.secondaryText,
      lineHeight: 20,
    },
    formulaCard: {
      backgroundColor: colors.greenBg,
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
      borderLeftColor: colors.success,
    },
    formulaTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.success,
      marginBottom: 12,
    },
    formulaText: {
      fontSize: 15,
      color: colors.success,
      fontFamily: 'monospace',
      marginBottom: 12,
    },
    formulaSteps: {
      marginTop: 8,
    },
    formulaStep: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.success,
      marginTop: 12,
      marginBottom: 4,
    },
    formulaDetail: {
      fontSize: 13,
      color: colors.secondaryText,
      marginBottom: 4,
      paddingLeft: 8,
    },
    coefficients: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    coefficientItem: {
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: 8,
      borderRadius: 8,
      minWidth: 70,
    },
    coefficientValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.accent,
    },
    coefficientLabel: {
      fontSize: 12,
      color: colors.secondaryText,
      marginTop: 2,
    },
    exampleCard: {
      backgroundColor: colors.blueBg,
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
      borderLeftColor: colors.accent,
    },
    exampleTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.info,
      marginBottom: 12,
    },
    exampleDetails: {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderRadius: 8,
      padding: 12,
    },
    exampleDetail: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 4,
    },
    exampleCalculation: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.infoBg,
    },
    exampleStep: {
      fontSize: 13,
      color: colors.info,
      marginBottom: 4,
      fontFamily: 'monospace',
    },
    tipsCard: {
      backgroundColor: colors.warningBg,
      borderRadius: 12,
      padding: 16,
    },
    tipsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.warning,
      marginBottom: 12,
    },
    tipsList: {
      gap: 12,
    },
    tipItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    tipIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2,
    },
    tipText: {
      flex: 1,
      fontSize: 14,
      color: colors.warning,
      lineHeight: 20,
    },
    tipBold: {
      fontWeight: '600',
      color: colors.warning,
    },

    // Стили для модалки FAQ
    faqSection: {
      marginBottom: 24,
    },
    faqSectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    faqItem: {
      backgroundColor: colors.lightBg,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    faqQuestion: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    faqAnswer: {
      fontSize: 14,
      color: colors.secondaryText,
      lineHeight: 20,
    },

    // Стили для модалки обратной связи
    feedbackHeader: {
      alignItems: 'center',
      padding: 32,
      backgroundColor: colors.blueBg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    feedbackIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    feedbackTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.info,
      marginBottom: 12,
    },
    feedbackText: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
      lineHeight: 24,
    },
    feedbackBody: {
      padding: 32,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 12,
    },
    featureText: {
      fontSize: 16,
      color: colors.text,
    },
    feedbackFooter: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    feedbackButton: {
      backgroundColor: colors.accent,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 12,
    },
    feedbackButtonText: {
      color: colors.accentText,
      fontSize: 16,
      fontWeight: '600',
    },
    emailButton: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.accent,
    },
    emailButtonText: {
      color: colors.accent,
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
        {/* Заголовок */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            {isAuthenticated ? (
              <User size={28} color={colors.accent} />
            ) : (
              <LogIn size={28} color={colors.accent} />
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
                      <Save size={16} color={colors.accentText} />
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
                    <Edit2 size={16} color={colors.accent} />
                    <Text style={styles.editButtonText}>Редактировать</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Поля редактирования */}
              <View style={styles.editFields}>
                {/* Рост */}
                <View style={styles.editField}>
                  <View style={styles.fieldHeader}>
                    <Ruler size={18} color={colors.secondaryText} />
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
                    <Scale size={18} color={colors.secondaryText} />
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
                    <Activity size={18} color={colors.secondaryText} />
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
                    <Calendar size={18} color={colors.secondaryText} />
                    <Text style={styles.fieldLabel}>Возраст</Text>
                  </View>
                  <Text style={styles.fieldValue}>{calculateAge()} лет</Text>
                </View>

                {/* Пол (только чтение) */}
                <View style={styles.editField}>
                  <View style={styles.fieldHeader}>
                    <User size={18} color={colors.secondaryText} />
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
              <LogIn size={40} color={colors.accent} />
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
                <LogIn size={20} color={colors.accentText} />
                <Text style={styles.authButtonPrimaryText}>Войти</Text>
                <ChevronRight size={16} color={colors.accentText} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.authButtonSecondary}
                onPress={() => router.push('/auth/register')}
              >
                <UserPlus size={20} color={colors.accent} />
                <Text style={styles.authButtonSecondaryText}>Регистрация</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.authFeatures}>
              <View style={styles.authFeature}>
                <View style={[styles.authFeatureIcon, { backgroundColor: colors.blueBg }]}>
                  <Cloud size={16} color={colors.accent} />
                </View>
                <Text style={styles.authFeatureText}>Синхронизация данных</Text>
              </View>
              <View style={styles.authFeature}>
                <View style={[styles.authFeatureIcon, { backgroundColor: colors.greenBg }]}>
                  <History size={16} color={colors.success} />
                </View>
                <Text style={styles.authFeatureText}>История расчётов</Text>
              </View>
            </View>
          </View>
        )}

        {/* Помощь и поддержка */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <HelpCircle size={22} color={colors.accent} />
            <Text style={styles.sectionTitle}>Помощь и поддержка</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setShowTDEEModal(true)}
          >
            <View style={styles.menuIcon}>
              <Info size={20} color={colors.secondaryText} />
            </View>
            <Text style={styles.menuText}>Как работает TDEE?</Text>
            <ChevronRight size={20} color={colors.mutedText} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setShowFAQModal(true)}
          >
            <View style={styles.menuIcon}>
              <HelpCircle size={20} color={colors.secondaryText} />
            </View>
            <Text style={styles.menuText}>Частые вопросы</Text>
            <ChevronRight size={20} color={colors.mutedText} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setShowFeedbackModal(true)}
          >
            <View style={styles.menuIcon}>
              <MessageSquare size={20} color={colors.secondaryText} />
            </View>
            <Text style={styles.menuText}>Обратная связь</Text>
            <ChevronRight size={20} color={colors.mutedText} />
          </TouchableOpacity>
        </View>

        {/* Тема (вынесена вниз) */}
        <View style={styles.themeSection}>
          <View style={styles.themeCard}>
            <View style={styles.themeHeader}>
              {colorScheme === 'dark' ? (
                <Moon size={24} color={colors.warning} />
              ) : (
                <Sun size={24} color={colors.warning} />
              )}
              <Text style={styles.themeTitle}>
                {colorScheme === 'dark' ? 'Тёмная тема' : 'Светлая тема'}
              </Text>
            </View>
            <Text style={styles.themeDescription}>
              {colorScheme === 'dark' 
                ? 'Используется тёмная цветовая схема' 
                : 'Используется светлая цветовая схема'}
            </Text>
            <View style={styles.themeSwitchContainer}>
              <Text style={styles.themeSwitchLabel}>
                {colorScheme === 'dark' ? 'Включена' : 'Выключена'}
              </Text>
              <Switch
                value={colorScheme === 'dark'}
                onValueChange={(value) => setColorScheme(value ? 'dark' : 'light')}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colorScheme === 'dark' ? colors.background : colors.background}
              />
            </View>
          </View>
        </View>

        {/* Кнопка выхода/входа */}
        <TouchableOpacity 
          style={[
            styles.actionButton,
            isAuthenticated 
              ? { backgroundColor: colors.redBg }
              : { backgroundColor: colors.veryLightBg }
          ]}
          onPress={isAuthenticated ? handleLogout : () => router.push('/auth/login')}
          disabled={isLoading || isSyncing}
        >
          {isAuthenticated ? (
            <>
              <LogOut size={20} color={colors.error} />
              <Text style={[styles.actionButtonText, { color: colors.error }]}>
                Выйти из аккаунта
              </Text>
            </>
          ) : (
            <>
              <LogIn size={20} color={colors.secondaryText} />
              <Text style={[styles.actionButtonText, { color: colors.secondaryText }]}>
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

      {/* Модальные окна */}
      <TDEEModal />
      <FAQModal />
      <FeedbackModal />
    </SafeAreaView>
  );
}