import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ApiError } from '../utils/api';

const Register = () => {
  const { register, verifyOTP } = useAuth();
  const navigate = useNavigate();
  
  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'owner' | 'admin'>('user');
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // OTP states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({ username, email, password, role });
      setCurrentStep('otp');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyOTP({
        identifier: email,
        code: otpCode,
        purpose: 'signup'
      });
      navigate('/dashboard');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.detail || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    try {
      // Re-register to trigger new OTP
      await register({ username, email, password, role });
      setResendTimer(60);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.detail || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

            <form onSubmit={handleRegister} className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'user' | 'owner' | 'admin')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="user">Customer</option>
                  <option value="owner">Venue Owner</option>
                </select>
              </div>

              {/* Username Field */}
            </form>
};

export default Register;