// screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import API from '../src/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { RootStackParamList } from '../App';
import { LinearGradient } from 'expo-linear-gradient';

const YELLOW = '#FFD93D';
const GREEN = '#4CAF50';

export default function LoginScreen(): React.ReactElement {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogin = async (): Promise<void> => {
    try {
      setLoading(true);

      const res = await API.post('/login', { email, password });

      const token =
        res.data?.token ??
        res.data?.access_token ??
        res.data?.data?.token;

      if (!token) throw new Error('No token returned from server');

      await AsyncStorage.setItem('token', token);
      // persist email for profile display
      if (email) {
        await AsyncStorage.setItem('email', email);
      }
      // persist full user object returned by API for later identification
      if (res.data?.user) {
        await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
      }

      API.defaults.headers = API.defaults.headers || {};
      API.defaults.headers.common = API.defaults.headers.common || {};
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      Alert.alert('Success', res.data?.message ?? 'Logged in');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.data?.message ??
          err.response?.data ??
          err.message ??
          'Login failed';
        Alert.alert(
          'Error',
          typeof msg === 'string' ? msg : JSON.stringify(msg)
        );
      } else if (err instanceof Error) {
        Alert.alert('Error', err.message);
      } else {
        Alert.alert('Error', 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[YELLOW, GREEN]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        style={styles.inner}
      >
        <View style={styles.header}>
          {/* 👇 Replace icon row with logo image */}
          <Image
            source={require('../assets/images/logo.png')} // change path to your logo
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome Students!</Text>
    
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword((v) => !v)}
            >
              <Ionicons
                name={showPassword ? 'eye' : 'eye-off'}
                size={24}
                color={GREEN}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Log in</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 25,
    elevation: 5,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: GREEN,
    paddingHorizontal: 20,
    paddingRight: 50,
    paddingVertical: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  inputWrapper: {
    width: '100%',
    position: 'relative',
    marginBottom: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -12 }],
    zIndex: 1,
  },
  primaryButton: {
    backgroundColor: GREEN,
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
