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

export default function LimatKiflePage() {
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
                  ልማት ክፍል አገልግሎቶች
                </h1>
                <div className="space-y-4">
                  <p className={`text-lg leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    4 Limat Kifle በቴፒ ግቢ ጉባኤ የልማት አገልግሎት ክፍል የግቢ ጉባኤውን የፋይናንስ አቅም በመገንባትና ልዩ ልዩ ገቢ ማስገኛ መንገዶችን በመቀየስ ለአገልግሎት የሚያስፈልገውን በጀት የማሟላት ከፍተኛ ኃላፊነት ያለበት ክፍል ነው። ክፍሉ የሚሰጣቸው ዝርዝር አገልግሎቶችና የንዑሳን ክፍላት መዋቅር በዝርዝር እንደሚከተለው ቀርቧል፦
                  </p>
                  
                  <h2 className={`text-2xl font-bold mt-4 mb-3 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    የልማት ክፍል ዋና ዋና አገልግሎቶች
                  </h2>
                  
                  <p className={`text-lg leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    <span className="font-bold text-lg">ገቢ ማስገኛ ተግባራት (Income Generation)፦</span> የግቢ ጉባኤውን አገልግሎት በገንዘብ ለመደገፍ ልዩ ልዩ የንግድና የልማት ሥራዎችን ያከናውናል ። ከእነዚህም መካከል፦
                  </p>
                  
                  <ul className={`list-disc pl-6 space-y-2 text-lg ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    <li>የጾመኛ ተማሪዎች የዳቦ አቅርቦት አገልግሎት መስጠት ።</li>
                    <li>በግቢ ጉባኤው ሱቅ አማካኝነት የጽሕፈት መሣሪያዎችንና ሌሎች አስፈላጊ ቁሳቁሶችን ለአባላት ማቅረብ ።</li>
                    <li>እንደ ቲሸርቶች፣ መንፈሳዊ መጻሕፍትና የንዋያተ ቅድሳት ሽያጭን ማካሄድ ።</li>
                    <li>በበዓላትና በታላላቅ ጉባኤያት ወቅት የዕጣ (ሎተሪ) እና የቲኬት ሽያጭ ማዘጋጀት ።</li>
                  </ul>
                  
                  <p className={`text-lg leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    <span className="font-bold text-lg">የንብረትና የፋይናንስ አስተዳደር፦</span> የክፍሉን ገቢና ወጪ በአግባቡ መመዝገብና ለግቢ ጉባኤው የሥራ ማስኬጃ የሚውል ትርፍ ማመንጨት ።
                  </p>
                  
                  <p className={`text-lg leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    <span className="font-bold text-lg">የሕትመት ውጤቶች ስርጭት፦</span> አባላት እንዲማሩባቸው የሚያስፈልጉ የኮርስ መጻሕፍትንና ሌሎች የሕትመት ውጤቶችን በልማት ክፍሉ አማካኝነት ለአባላት እንዲደርሱ ያደርጋል ።
                  </p>
                  
                  <p className={`text-lg leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    <span className="font-bold text-lg">የአባላት መንፈሳዊ ሕይወት ክትትል፦</span> በክፍሉ ውስጥ ያሉ አገልጋዮችን መንፈሳዊ ሕይወት መከታተልና ለአዳዲስ አገልጋዮች ስለ ክፍሉ አገልግሎት ግንዛቤ መስጠት ።
                  </p>
                  
                  <h2 className={`text-2xl font-bold mt-6 mb-3 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    የልማት ክፍል ንዑሳን ክፍላት (Sub-classes)
                  </h2>
                  
                  <p className={`text-lg leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    ክፍሉ አገልግሎቱን በሥርዓት ለመምራት በሚከተሉት ንዑሳን ክፍሎች ተዋቅሯል፦
                  </p>
                  
                  <ol className={`list-decimal pl-6 space-y-3 text-lg ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    <li><span className="font-bold">የገቢ ማስገኛ ንዑስ ክፍል፦</span> እንደ ዳቦ አቅርቦት፣ የሱቅ አገልግሎትና የዕጣ ሽያጭ ያሉ ገቢ የሚያስገኙ ሥራዎችን በበላይነት የሚያቅድና የሚያስፈጽም ነው ።</li>
                    <li><span className="font-bold">የሽያጭና ስርጭት ንዑስ ክፍል፦</span> መጻሕፍትን፣ ቲሸርቶችንና የንዋያተ ቅድሳትን ለተጠቃሚ አባላት የማድረስና የመሸጥ ኃላፊነት አለበት ።</li>
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
                    src="/images/lmat.jpg"
                    alt="ልማት ክፍል አገልግሎት"
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
                በልማት ክፍል ውስጥ የሚካተቱ ተጨማሪ ንዑሳን ክፍሎች
              </h2>
              
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${
                theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
              }`}>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary text-base font-bold">3</span>
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የክትትልና ቁጥጥር ንዑስ ክፍል
                      </h3>
                      <p className="text-lg">
                        የልማት ሥራዎች በታቀደላቸው መሠረት መከናወናቸውንና የገቢ-ወጪ ሒሳቡ በትክክል መመዝገቡን የሚከታተል ነው ።
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary text-base font-bold">4</span>
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የአባላት ጉዳይና ሥልጠና ንዑስ ክፍል
                      </h3>
                      <p className="text-lg">
                        በልማት ክፍሉ ውስጥ ያሉ አባላትን ስብሰባ የሚመራና ለመንፈሳዊ ሕይወታቸው የሚያስፈልጉ ሥልጠናዎችን የሚያመቻች ነው ።
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary text-base font-bold">5</span>
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የህትመት እና ማስተላለፊያ ንዑስ ክፍል
                      </h3>
                      <p className="text-lg">
                        የትምህርት ቁሳቁሶችን፣ መጽሔቶችን እና ሌሎች ማስተላለፊያ አቅራቢያዎችን ማተም፣ ማሰራጨት እና ለአባላት እንዲደርሱ ማድረግ ።
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary text-base font-bold">6</span>
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        የሙያ እና ፈጠራ ንዑስ ክፍል
                      </h3>
                      <p className="text-lg">
                        አባላት ያላቸውን ሙያዊ ችሎታ በመጠቀም ለገቢ ማስገኛ ሥራዎች የሚያስተዋውቁ ፈጠራዎችን ማቅረብ እና ማበረታት ።
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className={`mt-8 text-xl leading-relaxed font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
              }`}>
                ይህ ክፍል የግቢ ጉባኤው የገንዘብ ምንጭ በመሆን መንፈሳዊ አገልግሎቱ ያለምንም የፋይናንስ እጥረት እንዲከናወን ትልቅ ድርሻ ይወጣል።
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