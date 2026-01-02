import { useState } from 'react';
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
import { UserPlus, Mail, Lock, User, Eye, EyeOff, Check, X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading } = useAuth();

  // Проверка требований пароля
  const passwordRequirements = {
    minLength: password.length >= 6,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    passwordsMatch: password === confirmPassword && password.length > 0,
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);

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

    // Базовая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Ошибка', 'Пожалуйста, введите корректный email');
      return;
    }

    try {
      await register(name, email, password);
      Alert.alert(
        'Регистрация успешна!',
        'Добро пожаловать в МетаБаланс! Ваш аккаунт создан.',
        [
          {
            text: 'Отлично!',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось создать аккаунт. Попробуйте ещё раз.');
    }
  };

  const fillDemoData = () => {
    setName('Иван Иванов');
    setEmail('ivan@example.com');
    setPassword('Demo123!');
    setConfirmPassword('Demo123!');
  };

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
            <UserPlus size={48} color="#3B82F6" />
            <Text style={styles.title}>Создать аккаунт</Text>
            <Text style={styles.subtitle}>
              Присоединяйтесь к сообществу МетаБаланс
            </Text>
          </View>

          <View style={styles.form}>
            {/* Поле имени */}
            <View style={styles.inputContainer}>
              <User size={20} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="Имя"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#9CA3AF"
                editable={!isLoading}
                autoCapitalize="words"
              />
            </View>

            {/* Поле email */}
            <View style={styles.inputContainer}>
              <Mail size={20} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
                editable={!isLoading}
                autoComplete="email"
              />
            </View>

            {/* Поле пароля */}
            <View style={styles.inputContainer}>
              <Lock size={20} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="Пароль"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#9CA3AF"
                editable={!isLoading}
                autoComplete="new-password"
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>

            {/* Поле подтверждения пароля */}
            <View style={styles.inputContainer}>
              <Lock size={20} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="Подтвердите пароль"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#9CA3AF"
                editable={!isLoading}
                autoComplete="new-password"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>

            {/* Требования к паролю */}
            <View style={styles.requirements}>
              <Text style={styles.requirementsTitle}>Требования к паролю:</Text>
              
              <View style={styles.requirementRow}>
                {passwordRequirements.minLength ? (
                  <Check size={16} color="#10B981" />
                ) : (
                  <X size={16} color="#EF4444" />
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
                  <Check size={16} color="#10B981" />
                ) : (
                  <X size={16} color="#EF4444" />
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
                  <Check size={16} color="#10B981" />
                ) : (
                  <X size={16} color="#EF4444" />
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
                  <Check size={16} color="#10B981" />
                ) : (
                  <X size={16} color="#EF4444" />
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
                  <Check size={16} color="#10B981" />
                ) : (
                  <X size={16} color="#EF4444" />
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
              <UserPlus size={20} color="white" />
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

          {/* Демо кнопка */}
          <TouchableOpacity 
            style={styles.demoButton}
            onPress={fillDemoData}
            disabled={isLoading}
          >
            <Text style={styles.demoButtonText}>Заполнить демо-данные</Text>
          </TouchableOpacity>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  requirements: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
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
    color: '#6B7280',
  },
  requirementMet: {
    color: '#10B981',
    fontWeight: '500',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    padding: 18,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
  },
  registerButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  registerButtonText: {
    color: 'white',
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
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#9CA3AF',
    fontSize: 14,
  },
  loginButton: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  demoButton: {
    marginTop: 20,
    padding: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  demoButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  footerText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 18,
  },
  footerLink: {
    color: '#3B82F6',
    fontWeight: '500',
  },
});