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

export default function MuyanaTeradoPage() {
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
                  ሙያና ተራድኦ ክፍል አገልግሎቶች
                </h1>
                <div className="space-y-6">
                  <p className={`text-lg leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    6 Muyana terado በቴፒ ግቢ ጉባኤ የሙያና ተራድኦ አገልግሎት ክፍል አባላት ያላቸውን ልዩ ልዩ ሙያ ለቤተክርስቲያን አገልግሎት እንዲያውሉ የሚያስችል፣ የአባላትን የእርስ በእርስ መረዳዳት የሚያጠናክር እና ለግቢ ጉባኤው ገቢ የሚያስገኙ የፈጠራ ሥራዎችን የሚሠራ ክፍል ነው ። በክፍሉ የሚሰጡ ዝርዝር አገልግሎቶችና ንዑሳን ክፍሎች የሚከተሉት ናቸው፦
                  </p>
                  
                  <h2 className={`text-2xl font-bold mt-4 mb-4 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    የሙያና ተራድኦ ክፍል ዋና ዋና አገልግሎቶች
                  </h2>
                  
                  <ul className={`list-disc pl-6 space-y-4 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    <li className="text-lg"><span className="font-bold">የአባላት የሙያ ድጋፍ እና ልውውጥ፦</span> አባላት ያላቸውን የተለያየ የዓለማዊ ትምህርትና የልምድ ሙያ (ለምሳሌ፦ ሕክምና፣ ኢንጂነሪንግ፣ ግብርና ወዘተ) ለቤተክርስቲያንና ለግቢ ጉባኤው አገልግሎት እንዲያውሉ ያስተባብራል ።</li>
                    <li className="text-lg"><span className="font-bold">የተራድኦ እና የበጎ አድራጎት አገልግሎት፦</span> በኢኮኖሚ ለተቸገሩ የግቢ ጉባኤ አባላት የገንዘብ፣ የቁሳቁስና የትምህርት መርጃ መሣሪያዎች ድጋፍ እንዲያገኙ ያደርጋል ።</li>
                    <li className="text-lg"><span className="font-bold">የእጅ ሥራ ውጤቶች ዝግጅት፦</span> ለቤተክርስቲያን አገልግሎት የሚውሉና ለግቢ ጉባኤው ገቢ የሚያስገኙ እንደ ጧፍ፣ ማኅደር፣ ሞሰበ ቲሸርት እና ሌሎች ጥበብ ነክ ሥራዎችን ያመርታል ።</li>
                    <li className="text-lg"><span className="font-bold">የቤተ መጽሐፍት አገልግሎት፦</span> የግቢ ጉባኤውን ቤተ መጽሐፍት በማደራጀት አባላት ለመንፈሳዊና ለዓለማዊ ትምህርታቸው የሚረዱ መጽሐፍትን እንዲያገኙና እንዲጠቀሙ ያመቻቻል ።</li>
                    <li className="text-lg"><span className="font-bold">የጤና እና የአካባቢ ጥበቃ አገልግሎት፦</span> ለአባላት ስለ ጤና አጠባበቅ ግንዛቤ መስጠትና በግቢ ጉባኤው አካባቢ የጽዳትና የአካባቢ ጥበቃ ሥራዎችን ያስተባብራል ።</li>
                  </ul>
                  
                  <h2 className={`text-2xl font-bold mt-8 mb-4 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    የሙያና ተራድኦ ክፍል ንዑሳን ክፍሎች (Sub-classes)
                  </h2>
                  
                  <p className={`text-lg leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    አገልግሎቱን በሥርዓት ለመምራት ክፍሉ በሚከተሉት ንዑሳን ክፍሎች ተዋቅሯል፦
                  </p>
                  
                  <ol className={`list-decimal pl-6 space-y-4 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    <li className="text-lg"><span className="font-bold">የእጅ ሥራ ንዑስ ክፍል፦</span> ጧፍ ማምረት፣ መጻሕፍትን መደጐስ (ባይንዲንግ)፣ ማኅደር በክር መስራትና ሌሎች የጥበብ ሥራዎችን የሚያከናውን ንዑስ ክፍል ነው ።</li>
                    <li className="text-lg"><span className="font-bold">የተራድኦ ንዑስ ክፍል፦</span> የተቸገሩ አባላትን የመለየት፣ የመደገፍና የአባላትን የጋራ መረዳጃ ፈንድ (ካፒታል) የማደራጀት ኃላፊነት አለበት ።</li>
                    <li className="text-lg"><span className="font-bold">የቤተ መጽሐፍት ንዑስ ክፍል፦</span> መጽሐፍትን የመመዝገብ፣ ለአንባቢዎች የማሰራጨትና የንባብ ባህልን የማሳደግ ሥራ ይሠራል ።</li>
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
                    src="/images/muya3.jpg"
                    alt="ሙያና ተራድኦ አገልግሎት"
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
                በሙያና ተራድኦ ክፍል ውስጥ የሚካተቱ ተጨማሪ ንዑሳን ክፍሎች
              </h2>
              
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${
                theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
              }`}>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary font-bold">4</span>
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የጤናና ሙያ አገልግሎት ንዑስ ክፍል
                      </h3>
                      <p className="text-lg">
                        አባላት በሙያቸው እንዲያገለግሉ የሚያስተባብርና የጤና ነክ መረጃዎችን ለአባላት የሚያደርስ ነው ።
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary font-bold">5</span>
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የሥራ አፈጻጸም ክትትል ንዑስ ክፍል
                      </h3>
                      <p className="text-lg">
                        የክፍሉ ዕቅዶች በተቀመጠላቸው ጊዜ መከናወናቸውንና የሪፖርት ሥራዎችን ይከታተላል ።
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary font-bold">6</span>
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የሙያ ስልጠና እና አቅም ግንባታ ንዑስ ክፍል
                      </h3>
                      <p className="text-lg">
                        አባላት ያላቸውን ሙያዊ ክህሎቶች ለማሻሻል የሙያ ስልጠናዎችን በማዘጋጀት በተግባር ላይ እንዲውሉ ያስተባብራል።
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary font-bold">7</span>
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የምርት ማምረቻና ሽያጭ ንዑስ ክፍል
                      </h3>
                      <p className="text-lg">
                        የአባላት የሙያ ምርቶችን ለመሸጥ የሸቀጦችን ገበያ እና የሽያጭ ሰንሰለት በመፍጠር የግቢ ጉባኤውን ገቢ የሚጨምር ነው።
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary font-bold">8</span>
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የጋራ ፕሮጀክት ንዑስ ክፍል
                      </h3>
                      <p className="text-lg">
                        አባላት በጋራ የሚሰሩ የሙያ ፕሮጀክቶችን በማዘጋጀት የእርስ በእርስ መረዳዳትን የሚያጠናክር ሲሆን፣ የጋራ ፈንዶችን ያስተዳድራል።
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary font-bold">9</span>
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የግንኙነት እና የማህበራዊ አውታረመረብ ንዑስ ክፍል
                      </h3>
                      <p className="text-lg">
                        አባላት ከውጭ የሙያ ልምድ ባለቤቶች ጋር የግንኙነት መድረክ በመፍጠር የሙያ ልምድ ልውውጥን ያስተባብራል።
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 p-6 rounded-xl bg-primary/5 border border-primary/10">
                <p className={`text-xl leading-relaxed text-center ${
                  theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                }`}>
                  <span className="font-bold italic">"ማገልገልም መማር ነው"</span> - ይህ ክፍል አባላት ያላቸውን ዕውቀትና ጥበብ ለቤተክርስቲያን በማበርከት የሚለውን መርህ በተግባር የሚተረጉሙበት ዘርፍ ነው ።
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