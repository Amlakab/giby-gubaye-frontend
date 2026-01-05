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
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
              >
                <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-6 ${
                  theme === 'dark' ? 'text-primary' : 'text-primary'
                }`}>
                  ትምህርት ክፍል አገልግሎቶች
                </h1>
                <div className="space-y-4">
                  <p className={`text-base leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    1 Timhrt Kifl በቴፒ ግቢ ጉባኤ የትምህርት እና ሐዋርያዊ አገልግሎት ክፍል (ትምህርት ክፍል) አባላትን በነገረ መለኮት፣ በስነ-ምግባር እና በቤተክርስቲያን ትምህርቶች ለማነጽ የሚሰጣቸው ዝርዝር አገልግሎቶች እና ንዑሳን ክፍሎች የሚከተሉት ናቸው፦
                  </p>
                  
                  <h2 className={`text-xl font-bold mt-4 mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    የትምህርት ክፍል ዋና ዋና አገልግሎቶች
                  </h2>
                  
                  <p className={`text-base leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    <span className="font-bold">የመንፈሳዊ ትምህርት ዝግጅት እና አሰጣጥ፦</span> ለአባላት በየደረጃቸው (ለአዲስ ገቢ፣ ለነባር እና ለአገልጋዮች) ተከታታይነት ያላቸውን የቤተክርስቲያን ኮርሶች በአማርኛ እና በኦሮምኛ ቋንቋዎች ያዘጋጃል፤ መምህራንንም ይመድባል።
                  </p>
                  
                  <p className={`text-base leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    <span className="font-bold">የተተኪ መምህራን ማፍራት አገልግሎት፦</span> የግቢ ጉባኤውን አገልግሎት ቀጣይነት ለማረጋገጥ አባላትን በደረጃ 1 እና ደረጃ 2 የተተኪ መምህርነት ሥልጠና በመስጠትና በማስመረቅ ወደ ማስተማር አገልግሎት እንዲገቡ ያደርጋል።
                  </p>
                  
                  <p className={`text-base leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    <span className="font-bold">የሐዋርያዊ ጉዞ እና ስብከተ ወንጌል፦</span> ወደ ተለያዩ አጥቢያ አብያተ ክርስቲያናት (በተለይም ገጠር ላይ ላሉት) የሐዋርያዊ አገልግሎት ጉዞዎችን በማደራጀት የወንጌል ብርሃን እንዲሰራጭ ያደርጋል።
                  </p>
                  
                  <p className={`text-base leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    <span className="font-bold">የዕቅበተ እምነት እና የምክክር አገልግሎት፦</span> አባላት ከሌሎች እምነቶች ለሚነሱባቸው ጥያቄዎች ምላሽ እንዲሰጡ ማስተማር፣ የጠፉትን መመለስ እና አባላት ለሚያነሷቸው የግል መንፈሳዊ ጥያቄዎች በሊቃውንት ምላሽ እንዲያገኙ ያደርጋል።
                  </p>
                  
                  <p className={`text-base leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    <span className="font-bold">የምርምርና ህትመት አገልግሎት፦</span> በየበዓላቱ ትምህርታዊ ጽሑፎችን ማዘጋጀት፣ የጥያቄና መልስ ውድድሮችን ማካሄድ እና መንፈሳዊ መጽሔቶችንና በራሪ ጽሑፎችን ለአባላት ያሰራጫል።
                  </p>
                  
                  <p className={`text-base leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    <span className="font-bold">የአብነት ትምህርት ማጠናከር፦</span> የግቢ ጉባኤ ተማሪዎች ከዘመናዊ ትምህርታቸው ጎን ለጎን የግዕዝ ቋንቋን፣ ዜማንና ቅዳሴን እንዲማሩ በማድረግ ለድቁና እና ለክህነት ዝግጅት እንዲያደርጉ ይረዳል።
                  </p>
                  
                  <h2 className={`text-xl font-bold mt-6 mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    የትምህርት ክፍል ንዑሳን ክፍሎች (Sub-classes)
                  </h2>
                  
                  <p className={`text-base leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    አገልግሎቱን በተደራጀ መልኩ ለመምራት ክፍሉ በሚከተሉት ንዑሳን ክፍሎች ተዋቅሯል፦
                  </p>
                  
                  <ol className={`list-decimal pl-5 space-y-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    <li><span className="font-bold">የመምህራን ምደባ ንዑስ ክፍል፦</span> ለመደበኛ ኮርሶች፣ ለጉዞ መርሐ ግብራት እና ለልዩ ጉባኤያት መምህራንን የመለየት እና የመመደብ ኃላፊነት አለበት።</li>
                    <li><span className="font-bold">የሥርዓተ ትምህርት እና ክትትል ንዑስ ክፍል፦</span> ትምህርቶች በታቀደላቸው መርሃ ግብር መሠረት መሰጠታቸውን፣ የአባላትን መገኘት (Attendance) እና የትምህርቱን ጥራት ይከታተላል።</li>
                    <li><span className="font-bold">የአብነት ትምህርት ንዑስ ክፍል፦</span> በግቢ ጉባኤው ውስጥ የሚሰጡ የዜማ፣ የቅዳሴ እና የግዕዝ ትምህርቶችን በበላይነት ያስተባብራል፤ የአብነት መምህራንንም ይደግፋል።</li>
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
                    src="/images/insa8.png"
                    alt="Cybersecurity Policy Development"
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
                በትምህርት ክፍል ክፍል ውስጥ የሚካተቱ ንውስ ክፍላት
              </h2>
              
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${
                theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
              }`}>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary text-sm">1</span>
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        Data Protection & Privacy
                      </h3>
                      <p className="text-sm">
                        Developing comprehensive data protection laws and privacy regulations for both public and private sectors.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary text-sm">2</span>
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        Critical Infrastructure Protection
                      </h3>
                      <p className="text-sm">
                        Establishing security standards for protecting Ethiopia's critical digital infrastructure.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary text-sm">3</span>
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        Incident Response Framework
                      </h3>
                      <p className="text-sm">
                        Creating standardized procedures for reporting and responding to cybersecurity incidents.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <span className="text-primary text-sm">4</span>
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-text-primary'
                      }`}>
                        Compliance & Certification
                      </h3>
                      <p className="text-sm">
                        Implementing compliance frameworks and certification programs for organizations.
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
                        Public Awareness Guidelines
                      </h3>
                      <p className="text-sm">
                        Developing policies for public cybersecurity education and awareness campaigns.
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
                        International Cooperation
                      </h3>
                      <p className="text-sm">
                        Creating frameworks for international cybersecurity cooperation and information sharing.
                      </p>
                    </div>
                  </div>
                </div>
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