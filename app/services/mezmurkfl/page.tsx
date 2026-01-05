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

export default function MezmurKiflePage() {
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
                  መዝሙርና ኪነጥበብ ክፍል አገልግሎቶች
                </h1>
                <div className="space-y-4">
                  <p className={`text-base leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    2 የመዝሙርና ኪነጥበብ በቴፒ ግቢ ጉባኤ የመዝሙርና ኪነጥበብ ክፍል አባላትን በዜማ፣ በማኅሌትና በኪነጥበባዊ አገልግሎቶች ለማነጽና ለቤተክርስቲያን አገልጋይነት ለማዘጋጀት የሚሰጣቸው ዝርዝር አገልግሎቶችና የንዑሳን ክፍላት መዋቅር እንደሚከተለው ቀርቧል፦
                  </p>
                  
                  <h2 className={`text-xl font-bold mt-4 mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    የመዝሙርና ኪነጥበብ ክፍል ዋና ዋና አገልግሎቶች
                  </h2>
                  
                  <ul className={`list-disc pl-5 space-y-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    <li><span className="font-bold">የዜማና የመዝሙር ትምህርት አገልግሎት፦</span> አባላት የቤተክርስቲያንን ሥርዓተ ዜማ ጠብቀው እንዲዘምሩና ማኅሌት እንዲቆሙ የመዝሙር ጥናትና የዜማ ስልጠናዎችን ይሰጣል።</li>
                    <li><span className="font-bold">የኪነጥበብና ድራማ ዝግጅት፦</span> መንፈሳዊ መልዕክቶች በኪነጥበብ (በተውኔት፣ በግጥምና በወግ) ለአባላት እንዲደርሱ ያደርጋል፤ በተለይም በትልልቅ ጉባኤያት ላይ ትምህርታዊ ድራማዎችን ያቀርባል።</li>
                    <li><span className="font-bold">የመዝሙር ግጥምና ዜማ ምርጫ፦</span> የሚጠኑ መዝሙራት ከዶግማና ከቀኖና ውጪ እንዳይሆኑ ጥንቃቄ የተሞላበት የመረጣና የማጣራት አገልግሎት ይሰጣል።</li>
                    <li><span className="font-bold">የበዓላትና የጉባኤያት ድምቀት፦</span> በግቢ ጉባኤው የምስረታ በዓላት፣ በንግስ በዓላትና በሳምንታዊ መርሐ ግብራት ላይ ያሬዳዊ ዜማዎችንና መዝሙራትን በማቅረብ ጉባኤውን ያስተባብራል።</li>
                    <li><span className="font-bold">የአልባሳትና የንዋያተ ቅድሳት አያያዝ፦</span> ለአገልግሎት የሚያስፈልጉ የደንብ ልብሶችን (ቃጭል፣ ጸናጽልና ከበሮ) ያደራጃል፣ ለአባላትም ተደራሽ ያደርጋል።</li>
                  </ul>
                  
                  <h2 className={`text-xl font-bold mt-6 mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    የመዝሙርና ኪነጥበብ ክፍል ንዑሳን ክፍላት (Sub-classes)
                  </h2>
                  
                  <p className={`text-base leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    ክፍሉ አገልግሎቱን በውጤታማነት ለመምራት በሚከተሉት ንዑሳን ክፍሎች ተዋቅሯል፦
                  </p>
                  
                  <ol className={`list-decimal pl-5 space-y-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    <li><span className="font-bold">የመዝሙር ጥናት ንዑስ ክፍል፦</span> አዳዲስና ነባር መዝሙራትን ለአባላት የሚያስጠና፣ የዜማ ስልጠናዎችን የሚያመቻችና የአባላትን ድምፅና ዝማሬ የሚከታተል ክፍል ነው።</li>
                    <li><span className="font-bold">የኪነጥበብ ንዑስ ክፍል፦</span> መንፈሳዊ ተውኔቶችን (ድራማ)፣ ግጥሞችንና ስነ-ጽሑፎችን የሚያዘጋጅ፣ የሚያሰለጥንና በጉባኤያት ላይ እንዲቀርቡ የሚያደርግ ንዑስ ክፍል ነው።</li>
                    <li><span className="font-bold">የንብረትና አልባሳት ንዑስ ክፍል፦</span> የመዘምራን ልብሶችን፣ ጸናጽልን፣ ከበሮንና ሌሎች የአገልግሎት ቁሳቁሶችን በኃላፊነት የሚጠብቅና የሚያደራጅ ነው።</li>
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
                    src="/images/mezmur.jpg"
                    alt="መዝሙርና ኪነጥበብ አገልግሎት"
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
                በመዝሙርና ኪነጥበብ ክፍል ውስጥ የሚካተቱ ተጨማሪ ንዑሳን ክፍሎች
              </h2>
              
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${
                theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
              }`}>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary text-sm">4</span>
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የሥነ-ሥርዓትና ክትትል ንዑስ ክፍል
                      </h3>
                      <p className="text-sm">
                        መዘምራን በአገልግሎትና በጥናት ወቅት ሥርዓተ ቤተክርስቲያንን ጠብቀው እንዲገኙ፣ የአገልግሎት ተረኝነትንና አቴንዳንስን የሚከታተል ክፍል ነው።
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary text-sm">5</span>
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የመዝሙር ግጥምና ዜማ አሳላጭ (ኮሚቴ)
                      </h3>
                      <p className="text-sm">
                        የሚጠኑ መዝሙራትን ግጥምና ዜማ ከቤተክርስቲያን ትምህርት አንጻር መርምሮ የሚያጸድቅ ንዑስ ክፍል ነው።
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary text-sm">6</span>
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የዜማ ማሰልጠኛ እና የድምፅ ክትትል ንዑስ ክፍል
                      </h3>
                      <p className="text-sm">
                        አባላት የዜማ ችሎታቸውን በማሳደግ በማኅሌት የማቆም ብቃት እንዲኖራቸው የሚያግዝ ሲሆን፣ የድምፅ ጥራትን ያሻሽላል።
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary text-sm">7</span>
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የየበዓላት የሙዚቃ አዘጋጅ ንዑስ ክፍል
                      </h3>
                      <p className="text-sm">
                        በተለያዩ የቤተክርስቲያን በዓላት ላይ የሚሰጡ ልዩ ልዩ የሙዚቃ አዘጋጆችን ማዘጋጀት፣ የዜማ መርሃዎችን በትክክለኛ ቅደም ተከተል ማቅረብ የሚያገለግል ክፍል ነው።
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary text-sm">8</span>
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የኪነጥበብ ማሰልጠኛ እና አሠራር ንዑስ ክፍል
                      </h3>
                      <p className="text-sm">
                        ድራማ፣ ግጥምና ሌሎች የኪነጥበብ ዝግጅቶችን ለማዘጋጀት አባላትን በማሰልጠን፣ የአገልግሎት ዘዴዎችን በማሻሻል ላይ የሚሠራ ክፍል ነው።
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary text-sm">9</span>
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የመሳሪያ እና ንብረት አስተዳደር ንዑስ ክፍል
                      </h3>
                      <p className="text-sm">
                        የሙዚቃ መሣሪያዎችን፣ የልብሶችን እና የአገልግሎት ቁሳቁሶችን በሥርዓት የሚያስተዳድር፣ የሚጠብቅና የሚያደራጅ ክፍል ነው።
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className={`mt-8 text-base leading-relaxed ${
                theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
              }`}>
                ይህ ክፍል ከአባላት ጉዳይና ከትምህርት ክፍል ጋር በመቀናጀት፣ አባላት በዕውቀት ብቻ ሳይሆን በዝማሬና በምስጋናም እንዲጎለብቱ ከፍተኛ ድርሻ ይወጣል።
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