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

export default function BatchDepartmentPage() {
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
                  ባችና ዲፓርትመንት ክፍል አገልግሎቶች
                </h1>
                <div className="space-y-4">
                  <p className={`text-lg leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    5 Yebach ena departement በቴፒ ግቢ ጉባኤ የባችና ዲፓርትመንት ማስተባበሪያ አገልግሎት ክፍል (በአዲሱ መዋቅር የአባላት ጉዳይ ክፍል አካል የሆነ) ተማሪዎችን በየመጡበት ዓመተ ምሕረት (ባች) እና በሚማሩበት የትምህርት ዘርፍ (ዲፓርትመንት) በማደራጀት መረጃዎችን ተደራሽ የሚያደርግና ተሳትፎአቸውን የሚከታተል ክፍል ነው ።
                  </p>
                  
                  <p className={`text-lg leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    የክፍሉ ዝርዝር አገልግሎቶችና ንዑሳን ክፍሎች እንደሚከተለው ቀርበዋል፦
                  </p>
                  
                  <h2 className={`text-2xl font-bold mt-6 mb-3 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    የባችና ዲፓርትመንት ማስተባበሪያ ክፍል ዋና ዋና አገልግሎቶች
                  </h2>
                  
                  <ul className={`list-disc pl-6 space-y-3 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    <li className="text-lg"><span className="font-bold">መረጃን ተደራሽ ማድረግ፦</span> ከግቢ ጉባኤው የሚተላለፉ ልዩ ልዩ መረጃዎችንና ማስታወቂያዎችን በየባቹና በየዲፓርትመንቱ ላሉ አባላት በፍጥነት እንዲደርሱ ያደርጋል ።</li>
                    <li className="text-lg"><span className="font-bold">የአባላት ተሳትፎ ክትትል (Attendance)፦</span> አባላት በየሳምንቱ በሚሰጡ የኮርስ ትምህርቶችና ሌሎች መርሃ ግብራት ላይ ያላቸውን መገኘት በአቴንዳንስ ይቆጣጠራል ።</li>
                    <li className="text-lg"><span className="font-bold">አባላትን ማደራጀት፦</span> አዳዲስና ነባር አባላትን በየመጡበት ባች በመመደብና የባች ተጠሪዎችን በመሰየም አገልግሎቱ ወጥ በሆነ መልኩ እንዲመራ ያደርጋል ።</li>
                    <li className="text-lg"><span className="font-bold">የአካዳሚክ ሕይወት ክትትል፦</span> ተማሪዎች በትምህርታቸው ውጤታማ እንዲሆኑና የሚገጥሟቸውን አካዳሚያዊ ችግሮች እንዲፈቱ ከሌሎች ክፍሎች ጋር በመሆን ድጋፍ ያደርጋል ።</li>
                    <li className="text-lg"><span className="font-bold">የማስታወቂያና ቅስቀሳ ሥራ፦</span> ለታላላቅ ጉባኤያትና መርሃ ግብራት የሚረዱ ማስታወቂያዎችን ማዘጋጀት፣ መለጠፍና ጊዜያቸውን ጠብቀው እንዲነሱ ማድረግ ።</li>
                    <li className="text-lg"><span className="font-bold">መረጃዎችን ማደራጀት፦</span> የአባላትን አድራሻና ጠቅላላ መረጃ (Database) በመሰብሰብ ለክትትልና ለሪፖርት ዝግጁ አድርጎ ይይዛል ።</li>
                  </ul>
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
                    src="/images/bach2.jpg"
                    alt="ባችና ዲፓርትመንት አገልግሎት"
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
              <h2 className={`text-2xl md:text-3xl font-bold mb-8 ${
                theme === 'dark' ? 'text-primary' : 'text-primary'
              }`}>
                የክፍሉ ንዑሳን ክፍላት (Sub-classes)
              </h2>
              
              <p className={`text-lg leading-relaxed mb-6 ${
                theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
              }`}>
                አገልግሎቱን በውጤታማነት ለመፈጸም ክፍሉ በሚከተሉት ንዑሳን ክፍሎች ተዋቅሯል ፦
              </p>
              
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${
                theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
              }`}>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary text-sm font-bold">1</span>
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የባች ክትትል ንዑስ ክፍል
                      </h3>
                      <p className="text-lg">
                        በየባቹ ያሉ ተማሪዎችን የኮርስ አቴንዳንስ የመቆጣጠር፣ በየባቹ ያሉትን ተማሪዎች የመከታተልና መረጃዎችን የማድረስ ኃላፊነት አለበት ።
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የማስታወቂያና ቅስቀሳ ንዑስ ክፍል
                      </h3>
                      <p className="text-lg">
                        ለግቢ ጉባኤው አገልግሎት የሚያስፈልጉ ልዩ ልዩ ማስታወቂያዎችን የሚያዘጋጅ፣ የሚለጥፍና መረጃዎች ለአባላት መድረሳቸውን የሚያረጋግጥ ነው ።
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የመረጃ አደረጃጀት ንዑስ ክፍል
                      </h3>
                      <p className="text-lg">
                        የአባላትን ዝርዝር መረጃ (ባች፣ ዲፓርትመንት፣ ስልክ ቁጥር) የመመዝገብና የመረጃ ቋት (Database) የማደራጀት ሥራ ይሠራል ።
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary text-sm font-bold">4</span>
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የእህቶች ጉዳይ ማስተባበሪያ
                      </h3>
                      <p className="text-lg">
                        በየባቹ ያሉ እህቶች በመንፈሳዊ ሕይወታቸው እንዲጠነክሩና በጉባኤው ውስጥ ያላቸው ተሳትፎ እንዲያድግ ልዩ ክትትል ያደርጋል ።
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-10">
                <p className={`text-lg leading-relaxed ${
                  theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                }`}>
                  <span className="font-bold">ተጨማሪ አገልግሎቶች፦</span>
                </p>
                
                <div className="mt-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                      <span className="text-primary text-xs">✓</span>
                    </div>
                    <p className="text-lg">
                      <span className="font-bold">የጉባኤ አደራጀት እና ቅንብር፦</span> ለባቹ የሚመለከቱ ጉባኤዎችን አደራጀት፣ የጉባኤ መግብር እና ውጤቶችን መዝገብ ።
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                      <span className="text-primary text-xs">✓</span>
                    </div>
                    <p className="text-lg">
                      <span className="font-bold">የመግቢያ ቀን ማሰልጠን፦</span> ለአዲስ ገቢ ተማሪዎች የመግቢያ ቀን ማሰልጠን እና የግቢ ሕይወት ግንዛቤ ማስገኛ ።
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                      <span className="text-primary text-xs">✓</span>
                    </div>
                    <p className="text-lg">
                      <span className="font-bold">የመረጃ ማዘጋጃ እና ስርጭት፦</span> የባቹ የሚመለከቱ መረጃዎችን ማዘጋጀት፣ ማከማቸት እና ለሚመለከታቸው ባች አባላት ስርጭት ።
                    </p>
                  </div>
                </div>
              </div>
              
              <p className={`mt-8 text-lg leading-relaxed ${
                theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
              }`}>
                ይህ ክፍል የግቢ ጉባኤው መረጃዎች ወደ ተማሪዎች የሚደርሱበት ዋነኛ መስመር ሲሆን፣ አባላት ከግቢ ጉባኤው ሳይለዩ በአንድነት እንዲቆዩ ትልቅ ሚና ይጫወታል ።
              </p>
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
                    <span>Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Enter Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
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
                    <span>Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      theme === 'dark' 
                        ? 'bg-surface/50 border-border text-white' 
                        : 'bg-background border-border text-text-primary'
                    }`}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-primary hover:bg-secondary text-white rounded-lg font-medium text-base transition-colors duration-300"
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
                    className="underline hover:text-secondary transition-colors"
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
                    <span>Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
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
                    <span>Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Enter Email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
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
                    <span>City</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter City"
                    value={signupCity}
                    onChange={(e) => setSignupCity(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
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
                    <span>Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
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
                    <span>Role</span>
                  </label>
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
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
                  className="w-full px-6 py-3 bg-primary hover:bg-secondary text-white rounded-lg font-medium text-base transition-colors duration-300"
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
                  <label className={`block mb-2 ${
                    theme === 'dark' ? 'text-primary' : 'text-primary'
                  }`}>
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      theme === 'dark' 
                        ? 'bg-surface/50 border-border text-white' 
                        : 'bg-background border-border text-text-primary'
                    }`}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-primary hover:bg-secondary text-white rounded-lg font-medium text-base transition-colors duration-300"
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