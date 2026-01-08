'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { useTheme } from '@/lib/theme-context';
import {
  FaEnvelope,
  FaKey,
  FaUser,
  FaCity,
  FaUserTag,
  FaArrowLeft,
} from 'react-icons/fa';
import Link from 'next/link';

export default function AbalateGudayPage() {
  const { theme } = useTheme();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  
  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupCity, setSignupCity] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState('USER');
  const [otp, setOtp] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Login logic here
    setShowOtpModal(true);
    setShowLogin(false);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Signup logic here
    setShowSignup(false);
    setShowLogin(true);
  };

  const handleOtp = (e: React.FormEvent) => {
    e.preventDefault();
    // OTP verification logic here
    setShowOtpModal(false);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-[#0a192f] to-[#112240] text-white' 
        : 'bg-background text-text-primary'
    }`}>
      <Navbar />
      
      <div className="pt-16">

        {/* Service Content Section */}
        <section className={`py-16 px-4 ${
          theme === 'dark' ? 'bg-transparent' : 'bg-background'
        }`}>
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Content Column */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
              >
                <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-6 ${
                  theme === 'dark' ? 'text-primary' : 'text-primary'
                }`}>
                  አባላት ጉዳይ ክፍል አገልግሎቶች
                </h1>
                <div className="space-y-4">
                  <p className={`text-lg leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    3 Abalat Guday Kifl በቴፒ ግቢ ጉባኤ የአባላት ጉዳይ አገልግሎት ክፍል ተማሪዎች በግቢ ቆይታቸው በመንፈሳዊ ሕይወታቸው እንዲበረቱ፣ በማኅበራዊ ሕይወታቸው እንዲደጋገፉ እና የአገልግሎት ተሳትፎአቸው እንዲያድግ የሚያደርግ የቁልፍ አገልግሎቶች ማዕከል ነው።
                  </p>
                  
                  <h2 className={`text-2xl font-bold mt-8 mb-4 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    የአባላት ጉዳይ ክፍል ዋና ዋና አገልግሎቶች
                  </h2>
                  
                  <p className={`text-lg leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    ክፍሉ የሚሰጣቸው ዝርዝር አገልግሎቶችና የንዑሳን ክፍላት መዋቅር በዝርዝር እንደሚከተለው ቀርቧል፦
                  </p>
                  
                  <h2 className={`text-2xl font-bold mt-8 mb-4 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    የአባላት ጉዳይ ክፍል ንዑሳን ክፍላት (Sub-classes)
                  </h2>
                  
                  <p className={`text-lg leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    ክፍሉ እነዚህን ሰፋፊ ተግባራት ለማከናወን በሚከተሉት ንዑሳን ክፍሎች ተዋቅሯል፦
                  </p>
                  
                  <ol className={`list-decimal pl-6 space-y-3 text-lg leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    <li className="pb-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="font-bold text-primary">የባች እና ዲፓርትመንት ማስተባበሪያ ንዑስ ክፍል፦</span> ተማሪዎችን በየባቻቸው (የመግቢያ ዘመን) እና በየዲፓርትመንታቸው በማደራጀት መረጃዎችን የሚያደርስ፣ አባላትን የሚያቀናጅ እና የኮርስ አቴንዳንስ የሚከታተል ክፍል ነው።
                    </li>
                    <li className="pb-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="font-bold text-primary">የሥልጠና እና ምክክር ንዑስ ክፍል፦</span> ለአባላት መንፈሳዊና አካዳሚያዊ ሥልጠናዎችን የሚያዘጋጅ፣ መርሐ ግብር መሪዎችን የሚያሰለጥን እንዲሁም በተለያዩ ችግሮች ውስጥ ላሉ አባላት የምክር አገልግሎት እንዲያገኙ የሚያደርግ ነው።
                    </li>
                    <li className="pb-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="font-bold text-primary">የጽዋ እና ማኅበራዊ አገልግሎት ንዑስ ክፍል፦</span> የጽዋ መርሐ ግብራትን፣ የፍቅር ማዕድን እና የአባላት እርስ በእርስ መጠያየቅን (ጎብኝቶ ማጽናናትን) በበላይነት ይመራል።
                    </li>
                  </ol>
                </div>
              </motion.div>

              {/* Image Column */}
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="flex justify-center"
              >
                <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow-xl">
                  <Image
                    src="/images/giby7.jpg"
                    alt="አባላት ጉዳይ አገልግሎት"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              </motion.div>
            </div>

            {/* Additional Details Section */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="mt-16"
            >
              <h2 className={`text-2xl md:text-3xl font-bold mb-10 ${
                theme === 'dark' ? 'text-primary' : 'text-primary'
              }`}>
                በአባላት ጉዳይ ክፍል ውስጥ የሚካተቱ ተጨማሪ ንዑሳን ክፍሎች
              </h2>
              
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-10 ${
                theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
              }`}>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary font-bold">4</span>
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የአባላት መረጃ እና ምዝገባ ንዑስ ክፍል
                      </h3>
                      <p className="text-base leading-relaxed">
                        የአዳዲስና የነባር አባላትን መረጃ የመመዝገብ፣ የመታወቂያ አገልግሎት የመስጠትና የአባላትን ቁጥር የመመዝገብ ኃላፊነት አለበት።
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary font-bold">5</span>
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የእህቶች ጉባኤ ንዑስ ክፍል
                      </h3>
                      <p className="text-base leading-relaxed">
                        እህቶች በመንፈሳዊ ሕይወታቸው የሚጠነክሩበትን ልዩ መርሐ ግብራት የሚያዘጋጅና ለእነርሱ ብቻ የሚመለከቱ ምክክሮችን የሚያደርግ ንዑስ ክፍል ነው።
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary font-bold">6</span>
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የመንፈሳዊ እንክብካቤ እና የምክክር አገልግሎት
                      </h3>
                      <p className="text-base leading-relaxed">
                        አባላት በመንፈሳዊ ሕይወታቸው የሚያጋጥሟቸውን ችግሮች በማወቅ ምክር በመስጠት እና በማኅበራዊ ሕይወታቸው የሚደግፉ አገልግሎቶችን ያቀርባል።
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary font-bold">7</span>
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የአባላት ጤና እና ደህንነት ንዑስ ክፍል
                      </h3>
                      <p className="text-base leading-relaxed">
                        በግቢ ቆይታቸው የአባላትን ጤናማ ኑሮ እና ደህንነት የሚያረጋግጥ ሲሆን፣ የጤና አገልግሎቶችን ያቀርባል።
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary font-bold">8</span>
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የትምህርት ድጋፍ እና ማሰልጠን ንዑስ ክፍል
                      </h3>
                      <p className="text-base leading-relaxed">
                        ተማሪዎች በአካዳሚያዊ ስኬታቸው እንዲቀጥሉ በመማር እና በመሰልጠን የሚደግፍ ሲሆን፣ የትምህርት ማበረታቻ እንቅስቃሴዎችን ያዘጋጃል።
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary font-bold">9</span>
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የአባላት አገልግሎት እና ተሳትፎ ክትትል
                      </h3>
                      <p className="text-base leading-relaxed">
                        አባላት በቤተክርስቲያን አገልግሎቶች እና በማኅበራዊ እንቅስቃሴዎች ውስጥ በምን ደረጃ እንደሚሳተፉ በመከታተል በግቢ ሕይወታቸው እንዲያበቁ ያደርጋል።
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 p-6 rounded-xl bg-primary/5 border-l-4 border-primary">
                <p className={`text-lg leading-relaxed italic ${
                  theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                }`}>
                  ይህ ክፍል የግቢ ጉባኤው የጀርባ አጥንት ሆኖ የሚያገለግል ሲሆን፣ አባላት በግቢ ቆይታቸው እንዳይጠፉና በአገልግሎት እንዲጸኑ ትልቅ አስተዋጽኦ ያበረክታል።
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`w-full max-w-md rounded-xl shadow-xl ${
              theme === 'dark' ? 'bg-surface border-border' : 'bg-white border'
            }`}
          >
            <div className={`p-6 border-b ${
              theme === 'dark' ? 'border-border' : 'border-gray-200'
            }`}>
              <h3 className={`text-xl font-bold ${
                theme === 'dark' ? 'text-primary' : 'text-primary'
              }`}>
                Login
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className={`flex items-center space-x-2 mb-2 ${
                    theme === 'dark' ? 'text-primary' : 'text-primary'
                  }`}>
                    <FaEnvelope />
                    <span className="font-medium">Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Enter Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className={`w-full px-4 py-3 text-lg rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      theme === 'dark' 
                        ? 'bg-surface/50 border-border text-white' 
                        : 'bg-background border-border text-text-primary'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`flex items-center space-x-2 mb-2 ${
                    theme === 'dark' ? 'text-primary' : 'text-primary'
                  }`}>
                    <FaKey />
                    <span className="font-medium">Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={`w-full px-4 py-3 text-lg rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      theme === 'dark' 
                        ? 'bg-surface/50 border-border text-white' 
                        : 'bg-background border-border text-text-primary'
                    }`}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-primary hover:bg-secondary text-white text-lg rounded-lg font-medium transition-colors duration-300"
                >
                  Login
                </button>
                <p className={`text-center mt-4 ${
                  theme === 'dark' ? 'text-primary' : 'text-primary'
                }`}>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setShowLogin(false);
                      setShowSignup(true);
                    }}
                    className="underline hover:text-secondary transition-colors font-medium"
                  >
                    Signup
                  </button>
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`w-full max-w-md rounded-xl shadow-xl ${
              theme === 'dark' ? 'bg-surface border-border' : 'bg-white border'
            }`}
          >
            <div className={`p-6 border-b ${
              theme === 'dark' ? 'border-border' : 'border-gray-200'
            }`}>
              <h3 className={`text-xl font-bold ${
                theme === 'dark' ? 'text-primary' : 'text-primary'
              }`}>
                Signup
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className={`flex items-center space-x-2 mb-2 ${
                    theme === 'dark' ? 'text-primary' : 'text-primary'
                  }`}>
                    <FaUser />
                    <span className="font-medium">Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className={`w-full px-4 py-3 text-lg rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      theme === 'dark' 
                        ? 'bg-surface/50 border-border text-white' 
                        : 'bg-background border-border text-text-primary'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`flex items-center space-x-2 mb-2 ${
                    theme === 'dark' ? 'text-primary' : 'text-primary'
                  }`}>
                    <FaEnvelope />
                    <span className="font-medium">Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Enter Email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className={`w-full px-4 py-3 text-lg rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      theme === 'dark' 
                        ? 'bg-surface/50 border-border text-white' 
                        : 'bg-background border-border text-text-primary'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`flex items-center space-x-2 mb-2 ${
                    theme === 'dark' ? 'text-primary' : 'text-primary'
                  }`}>
                    <FaCity />
                    <span className="font-medium">City</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter City"
                    value={signupCity}
                    onChange={(e) => setSignupCity(e.target.value)}
                    className={`w-full px-4 py-3 text-lg rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      theme === 'dark' 
                        ? 'bg-surface/50 border-border text-white' 
                        : 'bg-background border-border text-text-primary'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`flex items-center space-x-2 mb-2 ${
                    theme === 'dark' ? 'text-primary' : 'text-primary'
                  }`}>
                    <FaKey />
                    <span className="font-medium">Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className={`w-full px-4 py-3 text-lg rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      theme === 'dark' 
                        ? 'bg-surface/50 border-border text-white' 
                        : 'bg-background border-border text-text-primary'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`flex items-center space-x-2 mb-2 ${
                    theme === 'dark' ? 'text-primary' : 'text-primary'
                  }`}>
                    <FaUserTag />
                    <span className="font-medium">Role</span>
                  </label>
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value)}
                    className={`w-full px-4 py-3 text-lg rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      theme === 'dark' 
                        ? 'bg-surface/50 border-border text-white' 
                        : 'bg-background border-border text-text-primary'
                    }`}
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-primary hover:bg-secondary text-white text-lg rounded-lg font-medium transition-colors duration-300"
                >
                  Signup
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`w-full max-w-md rounded-xl shadow-xl ${
              theme === 'dark' ? 'bg-surface border-border' : 'bg-white border'
            }`}
          >
            <div className={`p-6 border-b ${
              theme === 'dark' ? 'border-border' : 'border-gray-200'
            }`}>
              <h3 className={`text-xl font-bold ${
                theme === 'dark' ? 'text-primary' : 'text-primary'
              }`}>
                OTP Verification
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleOtp} className="space-y-4">
                <div>
                  <label className={`block mb-2 font-medium ${
                    theme === 'dark' ? 'text-primary' : 'text-primary'
                  }`}>
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={`w-full px-4 py-3 text-lg rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      theme === 'dark' 
                        ? 'bg-surface/50 border-border text-white' 
                        : 'bg-background border-border text-text-primary'
                    }`}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-primary hover:bg-secondary text-white text-lg rounded-lg font-medium transition-colors duration-300"
                >
                  Verify OTP
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}