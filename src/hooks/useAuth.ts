import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, User, LoginData, RegisterData, OTPVerificationData } from '../utils/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<User>;
  verifyOTP: (data: OTPVerificationData) => Promise<User>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (apiClient.isAuthenticated()) {
          const userData = apiClient.getStoredUser();
          if (userData) {
            setUser(userData);
          } else {
            // Fetch fresh user data
            const freshUser = await apiClient.getCurrentUser();
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        apiClient.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      setLoading(true);
      const response = await apiClient.login(data);
      setUser(response.user!);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<User> => {
    try {
      setLoading(true);
      const user = await apiClient.register(data);
      return user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (data: OTPVerificationData): Promise<User> => {
    try {
      setLoading(true);
      const user = await apiClient.verifyOTP(data);
      
      // After OTP verification, log the user in
      const loginResponse = await apiClient.login({
        username: user.username,
        password: '', // This won't be used since we're already verified
      });
      
      setUser(loginResponse.user!);
      return user;
    } catch (error) {
      console.error('OTP verification failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  const isAuthenticated = !!user && apiClient.isAuthenticated();

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      register,
      verifyOTP,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};