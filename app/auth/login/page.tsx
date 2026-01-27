'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme-context';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Eye,
  EyeOff,
  User,
  Shield,
  Book,
  Music,
  Users,
  Cpu,
  Globe,
  FileText,
  Award
} from 'lucide-react';
import { FaBook, FaChartLine, FaHandsHelping, FaMusic, FaTools, FaUsers } from 'react-icons/fa';

// Import images
const images = {
  logo1: '/images/logo1.png',
  image1: '/images/image1.jpg',
  image2: '/images/image2.jpg',
  service1: '/images/service1.png',
};

export default function LoginPage() {
  const { theme } = useTheme();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, loginWithOtp } = useAuth();
  const router = useRouter();

  // Theme styles matching the services page
  const themeStyles = {
    background: theme === 'dark' 
      ? 'linear-gradient(135deg, #0a192f, #112240)' 
      : 'linear-gradient(135deg, #f0f0f0, #ffffff)',
    textColor: theme === 'dark' ? 'text-[#ccd6f6]' : 'text-[#333333]',
    primaryColor: theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]',
    borderColor: theme === 'dark' ? 'border-[#00ffff]' : 'border-[#007bff]',
    buttonBg: theme === 'dark' 
      ? 'border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-black' 
      : 'border-[#007bff] text-[#007bff] hover:bg-[#007bff] hover:text-white',
    cardBg: theme === 'dark' 
      ? 'bg-gradient-to-br from-[#0a192f] to-[#112240] border-[#00ffff]/30' 
      : 'bg-gradient-to-br from-white to-gray-50 border-[#007bff]/30',
    inputBg: theme === 'dark' 
      ? 'bg-[#0a192f] border-[#00ffff]/50 text-white placeholder-gray-400 focus:ring-[#00ffff]' 
      : 'bg-white border-[#007bff]/50 text-[#333333] focus:ring-[#007bff]'
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      let user;
      if (isOtpLogin) {
        user = await loginWithOtp(phone, otp);
      } else {
        user = await login(phone, password);
      }

      if (user && user.role) {
        toast.success('Login successful! Redirecting...', {
          position: 'top-right',
          autoClose: 2000,
        });

        // Keep the original role routing
        if (user.role === 'admin' || user.role === 'Mezmur' || user.role === 'Abalat-Guday' || user.role === 'Limat') {
          router.push('/admin');
        } else if (user.role === 'accountant' || user.role === 'Audite'|| user.role === 'Bachna-Department' || user.role === 'Muyana-Terado') {
          router.push('/admin');
        } else if (user.role === 'Timhrt') {
          router.push('/sub-agent');
        } else {
          router.push('/user/dashboard');
        }
      } else {
        setMessage('Login failed: User data is missing');
        toast.error('Login failed: User data is missing');
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Login failed';
      setMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone) {
      setMessage('Please enter your phone number');
      toast.error('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      if (response.ok) {
        setMessage('OTP sent to your phone');
        toast.success('OTP sent to your phone');
        setIsOtpLogin(true);
      } else {
        const error = await response.json();
        const errorMsg = error.message || 'Failed to send OTP';
        setMessage(errorMsg);
        toast.error(errorMsg);
      }
    } catch {
      const errorMsg = 'Failed to send OTP';
      setMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeStyles.background} ${theme === 'dark' ? 'text-white' : 'text-[#333333]'}`}>
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          id="login-form"
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-12">
            <motion.h1
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`text-4xl md:text-5xl font-bold mb-4 ${themeStyles.primaryColor}`}
            >
              Tepi Giby Gubaye
            </motion.h1>
            <p className={`text-lg ${theme === 'dark' ? 'text-[#ccd6f6]' : 'text-[#555555]'} max-w-2xl mx-auto`}>
              Secure access to our member services system. Login with your credentials to continue.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Login Form Card */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`rounded-2xl shadow-2xl p-8 border ${themeStyles.cardBg}`}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-[#00ffff]/20' : 'bg-[#007bff]/10'}`}>
                  <Shield className={`w-8 h-8 ${themeStyles.primaryColor}`} />
                </div>
                <h2 className={`text-2xl font-bold ${themeStyles.primaryColor}`}>
                  Secure Login Portal
                </h2>
              </div>

              {message && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`mb-6 p-4 rounded-lg ${
                    message.includes('sent') || message.includes('success')
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  } ${theme === 'dark' ? 'bg-opacity-20' : ''}`}
                >
                  {message}
                </motion.div>
              )}

              <form className="space-y-6" onSubmit={handleLogin}>
                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="phone"
                    className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#ccd6f6]' : 'text-gray-700'}`}
                  >
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-300 ${themeStyles.inputBg}`}
                    placeholder="0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {/* Password or OTP */}
                {!isOtpLogin ? (
                  <div>
                    <label
                      htmlFor="password"
                      className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#ccd6f6]' : 'text-gray-700'}`}
                    >
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-300 pr-12 ${themeStyles.inputBg}`}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className={`absolute inset-y-0 right-3 flex items-center ${
                          theme === 'dark' ? 'text-gray-400 hover:text-[#00ffff]' : 'text-gray-500 hover:text-[#007bff]'
                        }`}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="otp"
                      className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#ccd6f6]' : 'text-gray-700'}`}
                    >
                      OTP Code *
                    </label>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-300 ${themeStyles.inputBg}`}
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full px-6 py-3 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-[#00ffff] to-[#00b3b3] text-black hover:opacity-90'
                      : 'bg-gradient-to-r from-[#007bff] to-[#0056b3] text-white hover:opacity-90'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 
                          3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign in to Your Account'
                  )}
                </button>

                {/* OTP Option */}
                {!isOtpLogin && (
                  <div className="pt-4 border-t border-gray-700/30">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isLoading}
                      className={`w-full px-6 py-3 border-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${themeStyles.buttonBg}`}
                    >
                      Login with OTP
                    </button>
                  </div>
                )}
              </form>

              {/* Register + Forgot Password */}
              {/* <div className="mt-8 pt-6 border-t border-gray-700/30">
                <p className={`text-center ${theme === 'dark' ? 'text-[#ccd6f6]' : 'text-gray-600'} text-sm`}>
                  Don't have an account?{' '}
                  <Link
                    href="/auth/register"
                    className={`font-semibold ${
                      theme === 'dark' ? 'text-[#00ffff] hover:text-cyan-300' : 'text-[#007bff] hover:text-blue-600'
                    } transition duration-200`}
                  >
                    Create new account
                  </Link>
                </p>
              </div> */}
              <div className="mt-4 text-center">
                <Link
                  href="/forgot-password"
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  } transition duration-200`}
                >
                  Forgot your password?
                </Link>
              </div>
            </motion.div>

            {/* Features Section - Matching services page theme */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Organization Image */}
              <div className={`rounded-2xl overflow-hidden shadow-2xl ${themeStyles.cardBg} border`}>
                <div className="relative h-64">
                  <Image
                    src={images.image1}
                    alt="INSA Cyber Security"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className={`absolute inset-0 ${
                    theme === 'dark' ? 'bg-black/40' : 'bg-black/20'
                  }`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8">
                      <h3 className={`text-2xl font-bold mb-2 ${themeStyles.primaryColor}`}>
                        Tepi Giby Gubaye
                      </h3>
                      <p className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                        Protecting national information infrastructure
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Features */}
              <div className={`rounded-2xl shadow-xl p-6 ${themeStyles.cardBg} border`}>
                <h3 className={`text-xl font-bold mb-6 ${themeStyles.primaryColor}`}>
                  Our Core Services
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: <FaBook className="w-5 h-5" />, title: "ትምህርት ክፍል", color: "cyan" },
                    { icon: <FaMusic className="w-5 h-5" />, title: "መዝሙር እና ስነ-ጥበባት ክፍል", color: "blue" },
                    { icon: <FaChartLine className="w-5 h-5" />, title: "ልማት ክፍል", color: "green" },
                    { icon: <FaUsers className="w-5 h-5" />, title: "አባላት ጉዳይ ክፍል", color: "purple" },
                    { icon: <FaHandsHelping className="w-5 h-5" />, title: "ባችና ዲፓርትመንት ክፍል", color: "orange" },
                    { icon: <FaTools className="w-5 h-5" />, title: "ሙያና ተራዲኦ ክፍል", color: "teal" },
                  ].map((service, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className={`p-3 rounded-xl text-center ${
                        theme === 'dark' 
                          ? 'bg-white/5 hover:bg-white/10' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      } transition-colors duration-300`}
                    >
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
                        theme === 'dark' ? 'bg-[#00ffff]/20' : 'bg-[#007bff]/10'
                      }`}>
                        <span className={themeStyles.primaryColor}>
                          {service.icon}
                        </span>
                      </div>
                      <div className="text-sm font-medium truncate">
                        {service.title}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Access */}
              <div className={`rounded-2xl shadow-xl p-6 ${themeStyles.cardBg} border`}>
                <h3 className={`text-xl font-bold mb-4 ${themeStyles.primaryColor}`}>
                  Quick Access
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/services"
                    className={`p-4 rounded-xl text-center transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-[#00ffff]/10 hover:bg-[#00ffff]/20 border border-[#00ffff]/30'
                        : 'bg-[#007bff]/10 hover:bg-[#007bff]/20 border border-[#007bff]/30'
                    }`}
                  >
                    <div className={`font-semibold ${themeStyles.primaryColor}`}>All Services</div>
                    <div className="text-xs mt-1 opacity-75">View our services</div>
                  </Link>
                  <Link
                    href="/about"
                    className={`p-4 rounded-xl text-center transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-white/5 hover:bg-white/10 border border-white/10'
                        : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    <div className="font-semibold">About Us</div>
                    <div className="text-xs mt-1 opacity-75">Mission & Vision</div>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Terms */}
          <div className="mt-12 text-center">
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              By signing in, you agree to our{' '}
              <Link
                href="/termsofservice"
                className={`${theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'} hover:underline`}
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacypolicy"
                className={`${theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'} hover:underline`}
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}