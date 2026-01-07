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
} from 'react-native';
import { router } from 'expo-router';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();

  // Очищаем ошибки при входе на экран
  useEffect(() => {
    clearError();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    // Базовая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Ошибка', 'Пожалуйста, введите корректный email');
      return;
    }

    try {
      await login(email, password);
      router.replace('/');
    } catch (error: any) {
      // Alert уже показан в AuthContext или через error state
      console.log('Login screen error:', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <LogIn size={48} color="#3B82F6" />
          <Text style={styles.title}>Вход в аккаунт</Text>
          <Text style={styles.subtitle}>
            Войдите, чтобы синхронизировать данные и получить доступ к истории
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <AlertCircle size={20} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
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
              autoComplete="password"
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

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <LogIn size={20} color="white" />
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Вход...' : 'Войти'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>или</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => router.push('/auth/register')}
            disabled={isLoading}
          >
            <Text style={styles.registerButtonText}>Создать аккаунт</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Нажимая "Войти", вы соглашаетесь с условиями использования
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 14,
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
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    padding: 18,
    borderRadius: 12,
    gap: 12,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
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
  registerButton: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
  },
  footerText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 18,
  },
});