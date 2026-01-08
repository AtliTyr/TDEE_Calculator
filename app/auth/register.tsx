import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, Check, X, Calendar, ChevronDown, AlertCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [birthDate, setBirthDate] = useState(new Date(1990, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading, error, clearError } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

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

  // Очищаем ошибки при входе на экран
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Проверка требований пароля
  const passwordRequirements = {
    minLength: password.length >= 6,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    passwordsMatch: password === confirmPassword && password.length > 0,
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);

  // Расчет возраста
  const calculateAge = (date: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    
    return age;
  };

  const age = calculateAge(birthDate);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }

    if (!allRequirementsMet) {
      Alert.alert('Ошибка', 'Пароль не соответствует требованиям');
      return;
    }

    // Проверка возраста
    if (age < 14) {
      Alert.alert('Ошибка', 'Вам должно быть не менее 14 лет');
      return;
    }
    if (age > 100) {
      Alert.alert('Ошибка', 'Пожалуйста, проверьте дату рождения');
      return;
    }

    // Базовая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Ошибка', 'Пожалуйста, введите корректный email');
      return;
    }

    try {
      await register({
        name,
        email,
        password,
        gender,
        birthDate: birthDate.toISOString().split('T')[0], // YYYY-MM-DD
      });
      router.replace('/');
    } catch (error: any) {
      console.log('Register screen error:', error.message);
      if (error.message === 'SESSION_EXPIRED' || error.message.includes('Сессия')) {
        Alert.alert(
          'Ошибка сессии',
          'Произошла ошибка при регистрации. Пожалуйста, попробуйте снова.',
        );
      } else {
        Alert.alert('Ошибка', error.message || 'Не удалось создать аккаунт. Попробуйте ещё раз.');
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      padding: 24,
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.secondaryText,
      textAlign: 'center',
      lineHeight: 24,
    },
    form: {
      gap: 16,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.veryLightBg,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    genderSection: {
      marginBottom: 16,
    },
    genderLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8,
    },
    genderButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    genderButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.veryLightBg,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    genderButtonActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    genderButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.secondaryText,
    },
    genderButtonTextActive: {
      color: colors.accentText,
    },
    dateSection: {
      marginBottom: 16,
    },
    dateLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8,
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.veryLightBg,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
    },
    dateText: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    ageText: {
      fontSize: 14,
      color: colors.secondaryText,
      textAlign: 'center',
    },
    requirements: {
      backgroundColor: colors.lightBg,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    requirementsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    requirementRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    requirementText: {
      fontSize: 14,
      color: colors.secondaryText,
    },
    requirementMet: {
      color: colors.success,
      fontWeight: '500',
    },
    registerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      padding: 18,
      borderRadius: 12,
      gap: 12,
      marginTop: 8,
    },
    registerButtonDisabled: {
      backgroundColor: colors.mutedText,
      opacity: 0.7,
    },
    registerButtonText: {
      color: colors.accentText,
      fontSize: 16,
      fontWeight: '600',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      paddingHorizontal: 16,
      color: colors.mutedText,
      fontSize: 14,
    },
    loginButton: {
      padding: 18,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.accent,
      alignItems: 'center',
    },
    loginButtonText: {
      color: colors.accent,
      fontSize: 16,
      fontWeight: '600',
    },
    footer: {
      marginTop: 32,
      padding: 16,
      backgroundColor: colors.lightBg,
      borderRadius: 8,
    },
    footerText: {
      textAlign: 'center',
      color: colors.secondaryText,
      fontSize: 12,
      lineHeight: 18,
    },
    footerLink: {
      color: colors.accent,
      fontWeight: '500',
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.errorBg,
      borderColor: colors.errorBg,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      gap: 8,
    },
    errorText: {
      flex: 1,
      color: colors.error,
      fontSize: 14,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <UserPlus size={48} color={colors.accent} />
            <Text style={styles.title}>Создать аккаунт</Text>
            <Text style={styles.subtitle}>
              Присоединяйтесь к сообществу МетаБаланс
            </Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            {/* Поле имени */}
            <View style={styles.inputContainer}>
              <User size={20} color={colors.mutedText} />
              <TextInput
                style={styles.input}
                placeholder="Имя"
                value={name}
                onChangeText={setName}
                placeholderTextColor={colors.mutedText}
                editable={!isLoading}
                autoCapitalize="words"
              />
            </View>

            {/* Поле email */}
            <View style={styles.inputContainer}>
              <Mail size={20} color={colors.mutedText} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.mutedText}
                editable={!isLoading}
                autoComplete="email"
              />
            </View>

            {/* Поле пола */}
            <View style={styles.genderSection}>
              <Text style={styles.genderLabel}>Пол</Text>
              <View style={styles.genderButtons}>
                <TouchableOpacity
                  style={[styles.genderButton, gender === 'male' && styles.genderButtonActive]}
                  onPress={() => setGender('male')}
                  disabled={isLoading}
                >
                  <Text style={[styles.genderButtonText, gender === 'male' && styles.genderButtonTextActive]}>
                    Мужчина
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderButton, gender === 'female' && styles.genderButtonActive]}
                  onPress={() => setGender('female')}
                  disabled={isLoading}
                >
                  <Text style={[styles.genderButtonText, gender === 'female' && styles.genderButtonTextActive]}>
                    Женщина
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Поле даты рождения */}
            <View style={styles.dateSection}>
              <Text style={styles.dateLabel}>Дата рождения</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
                disabled={isLoading}
              >
                <Calendar size={20} color={colors.secondaryText} />
                <Text style={styles.dateText}>
                  {birthDate.toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                <ChevronDown size={20} color={colors.mutedText} />
              </TouchableOpacity>
              <Text style={styles.ageText}>Возраст: {age} лет</Text>
              {showDatePicker && (
                <DateTimePicker
                  value={birthDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setBirthDate(selectedDate);
                    }
                  }}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                />
              )}
            </View>

            {/* Поле пароля */}
            <View style={styles.inputContainer}>
              <Lock size={20} color={colors.mutedText} />
              <TextInput
                style={styles.input}
                placeholder="Пароль"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor={colors.mutedText}
                editable={!isLoading}
                autoComplete="new-password"
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff size={20} color={colors.mutedText} />
                ) : (
                  <Eye size={20} color={colors.mutedText} />
                )}
              </TouchableOpacity>
            </View>

            {/* Поле подтверждения пароля */}
            <View style={styles.inputContainer}>
              <Lock size={20} color={colors.mutedText} />
              <TextInput
                style={styles.input}
                placeholder="Подтвердите пароль"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor={colors.mutedText}
                editable={!isLoading}
                autoComplete="new-password"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={colors.mutedText} />
                ) : (
                  <Eye size={20} color={colors.mutedText} />
                )}
              </TouchableOpacity>
            </View>

            {/* Требования к паролю */}
            <View style={styles.requirements}>
              <Text style={styles.requirementsTitle}>Требования к паролю:</Text>
              
              <View style={styles.requirementRow}>
                {passwordRequirements.minLength ? (
                  <Check size={16} color={colors.success} />
                ) : (
                  <X size={16} color={colors.error} />
                )}
                <Text style={[
                  styles.requirementText,
                  passwordRequirements.minLength && styles.requirementMet
                ]}>
                  Минимум 6 символов
                </Text>
              </View>
              
              <View style={styles.requirementRow}>
                {passwordRequirements.hasUpperCase ? (
                  <Check size={16} color={colors.success} />
                ) : (
                  <X size={16} color={colors.error} />
                )}
                <Text style={[
                  styles.requirementText,
                  passwordRequirements.hasUpperCase && styles.requirementMet
                ]}>
                  Хотя бы одна заглавная буква
                </Text>
              </View>
              
              <View style={styles.requirementRow}>
                {passwordRequirements.hasLowerCase ? (
                  <Check size={16} color={colors.success} />
                ) : (
                  <X size={16} color={colors.error} />
                )}
                <Text style={[
                  styles.requirementText,
                  passwordRequirements.hasLowerCase && styles.requirementMet
                ]}>
                  Хотя бы одна строчная буква
                </Text>
              </View>
              
              <View style={styles.requirementRow}>
                {passwordRequirements.hasNumber ? (
                  <Check size={16} color={colors.success} />
                ) : (
                  <X size={16} color={colors.error} />
                )}
                <Text style={[
                  styles.requirementText,
                  passwordRequirements.hasNumber && styles.requirementMet
                ]}>
                  Хотя бы одна цифра
                </Text>
              </View>
              
              <View style={styles.requirementRow}>
                {passwordRequirements.passwordsMatch ? (
                  <Check size={16} color={colors.success} />
                ) : (
                  <X size={16} color={colors.error} />
                )}
                <Text style={[
                  styles.requirementText,
                  passwordRequirements.passwordsMatch && styles.requirementMet
                ]}>
                  Пароли совпадают
                </Text>
              </View>
            </View>

            {/* Кнопка регистрации */}
            <TouchableOpacity
              style={[
                styles.registerButton, 
                (!allRequirementsMet || isLoading) && styles.registerButtonDisabled
              ]}
              onPress={handleRegister}
              disabled={!allRequirementsMet || isLoading}
            >
              <UserPlus size={20} color={colors.accentText} />
              <Text style={styles.registerButtonText}>
                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Text>
            </TouchableOpacity>

            {/* Разделитель */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Уже есть аккаунт?</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Кнопка входа */}
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => router.push('/auth/login')}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>Войти</Text>
            </TouchableOpacity>
          </View>

          {/* Футер с информацией */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Нажимая &quot;Зарегистрироваться&quot;, вы соглашаетесь с 
              <Text style={styles.footerLink}> условиями использования </Text>
              и
              <Text style={styles.footerLink}> политикой конфиденциальности</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}