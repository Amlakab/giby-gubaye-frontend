// app/services/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { useTheme } from '@/lib/theme-context';
import {
  FaMapMarker,
  FaPhone,
  FaEnvelope,
  FaChevronRight,
  FaBook,
  FaMusic,
  FaChartLine,
  FaUsers,
  FaHandsHelping,
  FaTools,
  FaShieldAlt,
  FaCode,
  FaUserGraduate,
  FaGlobe,
  FaResearchgate,
  FaBullhorn,
} from 'react-icons/fa';

// Import images
const images = {
  logo1: '/images/logo1.png',
  logo2: '/images/logo2.png',
  logo3: '/images/logo3.png',
  image2: '/images/image2.jpg',
  image1: '/images/mezmur.jpg',
  service1: '/images/service1.png',
  service3: '/images/service3.png',
  service5: '/images/service5.png',
  insa1: '/images/insa1.png',
  insa4: '/images/insa4.png',
  insa5: '/images/insa5.png',
  insa8: '/images/insa8.png',
  insa11: '/images/insa11.png',
  insa13: '/images/insa13.png',
  image6: '/images/muya2.png',
};

// Services from HTML
const services = [
  {
    id: "education-department",
    title: "ትምህርት ክፍል",
    description: "ትምህርት ክፍል በቴፒ ግቢ ጉባኤ የትምህርት እና ሐዋርያዊ አገልግሎት ክፍል (ትምህርት ክፍል) አባላትን በነገረ መለኮት፣ በስነ-ምግባር እና በቤተክርስቲያን ትምህርቶች ለማነጽ የሚሰጣቸው ዝርዝር አገልግሎቶች እና ንዑሳን ክፍሎች የሚከተሉት ናቸው። ዋና አገልግሎቶች የመንፈሳዊ ትምህርት ዝግጅት እና አሰጣጥ፣ የተተኪ መምህራን ማፍራት፣ የሐዋርያዊ ጉዞ፣ የዕቅበተ እምነት፣ የምርምርና ህትመት፣ እና የአብነት ትምህርት ማጠናከር ያካትታሉ። የትምህርት ክፍል ንዑሳን ክፍሎች (Sub-classes) አገልግሎቱን በተደራጀ መልኩ ለመምራት ክፍሉ በሚከተሉት ንዑሳን ክፍሎች ተዋቅሯል፦ የመምህራን ምደባ ንዑስ ክፍል፣ የሥርዓተ ትምህርት እና ክትትል ንዑስ ክፍል፣ የአብነት ትምህርት ንዑስ ክፍል፣ የማስተማሪያ ቁሳቁሶች እና የክትትል ንዑስ ክፍል፣ የጉዞና የስብከት አሰራር ንዑስ ክፍል፣ የጥናትና ምርምር ንዑስ ክፍል።",
    icon: <FaBook />,
    image: images.image2,
    link: "/services/timhrtkfl"
  },
  {
    id: "music-arts",
    title: "መዝሙርና ኪነጥበብ አገልግሎት",
    description: "መዝሙርና ኪነጥበብ የግቢ ጉባኤው የመዝሙርና ኪነጥበብ ንዑሳን ክፍሎች በዝርዝር የሚከተሉት ናቸው። የኪነጥበብ ንዑስ ክፍል፣ የንብረትና አልባሳት ንዑስ ክፍል፣ የሥነ-ሥርዓትና ክትትል ንዑስ ክፍል፣ የመዝሙር ግጥምና ዜማ አሳላጭ ይገኙበታል። የኪነጥበብ ንዑስ ክፍል መንፈሳዊ ተውኔቶችን (ድራማ)፣ ግጥሞችንና ስነ-ጽሑፎችን የሚያዘጋጅ፣ የሚያሰለጥንና በጉባኤያት ላይ እንዲቀርቡ የሚያደርግ ንዑስ ክፍል ነው። የንብረትና አልባሳት ንዑስ ክፍል የመዘምራን ልብሶችን፣ ጸናጽልን፣ ከበሮንና ሌሎች የአገልግሎት ቁሳቁሶችን በኃላፊነት የሚጠብቅና የሚያደራጅ ነው። ይህ ክፍል ከአባላት ጉዳይና ከትምህርት ክፍል ጋር በመቀናጀት አባላት በዕውቀት ብቻ ሳይሆን በዝማሬና በምስጋናም እንዲጎለብቱ ከፍተኛ ድርሻ ይወጣል።",
    icon: <FaMusic />,
    image: images.image1,
    link: "/services/mezmurkfl"
  },
  {
    id: "development-department",
    title: "ልማት ክፍል",
    description: "ልማት ክፍል በቴፒ ግቢ ጉባኤ የልማት አገልግሎት ክፍል የግቢ ጉባኤውን የፋይናንስ አቅም በመገንባትና ልዩ ልዩ ገቢ ማስገኛ መንገዶችን በመቀየስ ለአገልግሎት የሚያስፈልገውን በጀት የማሟላት ከፍተኛ ኃላፊነት ያለበት ክፍል ነው። ዋና አገልግሎቶች ገቢ ማስገኛ ተግባራት (Income Generation)፣ የንብረትና የፋይናንስ አስተዳደር፣ የሕትመት ውጤቶች ስርጭት፣ እና የአባላት መንፈሳዊ ሕይወት ክትትል ያካትታሉ። ገቢ ማስገኛ ተግባራት የጾመኛ ተማሪዎች የዳቦ አቅርቦት አገልግሎት፣ በግቢ ጉባኤው ሱቅ አማካኝነት የጽሕፈት መሣሪያዎችንና ሌሎች አስፈላጊ ቁሳቁሶችን ለአባላት ማቅረብ፣ እንደ ቲሸርቶች፣ መንፈሳዊ መጻሕፍትና የንዋያተ ቅድሳት ሽያጭን ማካሄድ፣ በበዓላትና በታላላቅ ጉባኤያት ወቅት የዕጣ (ሎተሪ) እና የቲኬት ሽያጭ ማዘጋጀት ያካትታሉ።",
    icon: <FaChartLine />,
    image: images.image2,
    link: "/services/lmatkfl"
  },
  {
    id: "members-affairs",
    title: "አባላት ጉዳይ ክፍል",
    description: "አባላት ጉዳይ በቴፒ ግቢ ጉባኤ የአባላት ጉዳይ አገልግሎት ክፍል ተማሪዎች በግቢ ቆይታቸው በመንፈሳዊ ሕይወታቸው እንዲበረቱ፣ በማኅበራዊ ሕይወታቸው እንዲደጋገፉ እና የአገልግሎት ተሳትፎአቸው እንዲያድግ የሚያደርግ የቁልፍ አገልግሎቶች ማዕከል ነው። ዋና ንዑሳን ክፍሎች የባችና ዲፓርትመንት ማስተባበሪያ፣ የሥልጠናና ምክክር፣ የጽዋና ማኅበራዊ አገልግሎት፣ የአባላት መረጃና ምዝገባ፣ እና የእህቶች ጉባኤ ያካትታሉ። የባችና ዲፓርትመንት ማስተባበሪያ ተማሪዎችን በየባቻቸው (የመግቢያ ዘመን) እና በየዲፓርትመንታቸው በማደራጀት መረጃዎችን የሚያደርስ፣ አባላትን የሚያቀናጅ እና የኮርስ አቴንዳንስ የሚከታተል ክፍል ነው። ይህ ክፍል የግቢ ጉባኤው የጀርባ አጥንት ሆኖ የሚያገለግል ሲሆን፣ አባላት በግቢ ቆይታቸው እንዳይጠፉና በአገልግሎት እንዲጸኑ ትልቅ አስተዋጽኦ ያበረክታል።",
    icon: <FaUsers />,
    image: images.image1,
    link: "/services/abalateguday"
  },
  {
    id: "bachna-department",
    title: "ባችና ዲፓርትመንት ክፍል",
    description: "የባችና ዲፓርትመንት ክፍል ተማሪዎችን በየባቻቸው (የመግቢያ ዘመን) እና በየዲፓርትመንታቸው በማደራጀት መረጃዎችን የሚያደርስ፣ አባላትን የሚያቀናጅ እና የኮርስ አቴንዳንስ የሚከታተል ክፍል ነው። የክፍሉ ንዑሳን ክፍላት የባች ክትትል፣ የማስታወቂያና ቅስቀሳ፣ የመረጃ አደረጃጀት፣ እና የእህቶች ጉዳይ ማስተባበሪያ ያካትታሉ። የባች ክትትል ንዑስ ክፍል በየባቹ ያሉ ተማሪዎችን የኮርስ አቴንዳንስ የመቆጣጠር፣ በየባቹ ያሉትን ተማሪዎች የመከታተልና መረጃዎችን የማድረስ ኃላፊነት አለበት። የማስታወቂያና ቅስቀሳ ንዑስ ክፍል ለግቢ ጉባኤው አገልግሎት የሚያስፈልጉ ልዩ ልዩ ማስታወቂያዎችን የሚያዘጋጅ፣ የሚለጥፍና መረጃዎች ለአባላት መድረሳቸውን የሚያረጋግጥ ነው።",
    icon: <FaHandsHelping />,
    image: images.image2,
    link: "/services/bachnadepartment"
  },
  {
    id: "technical-traditional",
    title: "ሙያና ተራድኦ ክፍል",
    description: "ሙያና ተራድኦ በቴፒ ግቢ ጉባኤ የሙያና ተራድኦ አገልግሎት ክፍል አባላት ያላቸውን ልዩ ልዩ ሙያ ለቤተክርስቲያን አገልግሎት እንዲያውሉ የሚያስችል፣ የአባላትን የእርስ በእርስ መረዳዳት የሚያጠናክር እና ለግቢ ጉባኤው ገቢ የሚያስገኙ የፈጠራ ሥራዎችን የሚሠራ ክፍል ነው። ዋና አገልግሎቶች የአባላት የሙያ ድጋፍና ልውውጥ፣ የተራድኦና የበጎ አድራጎት፣ የእጅ ሥራ ውጤቶች ዝግጅት፣ እና የቤተ መጽሐፍት አገልግሎት ያካትታሉ። የአባላት የሙያ ድጋፍ እና ልውውጥ አባላት ያላቸውን የተለያየ የዓለማዊ ትምህርትና የልምድ ሙያ (ለምሳሌ፦ ሕክምና፣ ኢንጂነሪንግ፣ ግብርና ወዘተ) ለቤተክርስቲያንና ለግቢ ጉባኤው አገልግሎት እንዲያውሉ ያስተባብራል። የተራድኦ እና የበጎ አድራጎት አገልግሎት በኢኮኖሚ ለተቸገሩ የግቢ ጉባኤ አባላት የገንዘብ፣ የቁሳቁስና የትምህርት መርጃ መሣሪያዎች ድጋፍ እንዲያገኙ ያደርጋል።",
    icon: <FaTools />,
    image: images.image6,
    link: "/services/muyanaterado"
  },
];

export default function ServicesPage() {
  const { theme } = useTheme();
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const sections = services.map(service => service.id);
      const scrollPosition = window.scrollY + 100;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  // Theme styles
  const themeStyles = {
    background: theme === 'dark' 
      ? 'linear-gradient(135deg, #0a192f, #112240)' 
      : 'linear-gradient(135deg, #f0f0f0, #ffffff)',
    textColor: theme === 'dark' ? 'text-[#ccd6f6]' : 'text-[#333333]',
    primaryColor: theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]',
    borderColor: theme === 'dark' ? 'border-[#00ffff]' : 'border-[#007bff]',
    buttonBg: theme === 'dark' 
      ? 'border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-white' 
      : 'border-[#007bff] text-[#007bff] hover:bg-[#007bff] hover:text-white'
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-[#0a192f] to-[#112240] text-white' 
        : 'bg-gradient-to-br from-[#f0f0f0] to-[#ffffff] text-[#333333]'
    }`}>
      <Navbar />
      
      <div className="pt-20">
        {/* Overview Section with animated service list */}
        <section
          id="overview"
          className="min-h-screen flex items-center px-4 md:px-8 py-12"
        >
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              {/* Left Column - Title and Description */}
              <div className="lg:w-1/2">
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                >
                  <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${
                    theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'
                  }`}>
                    Services
                  </h1>
                 <p
                  className={`text-lg leading-relaxed mb-10 ${
                    theme === 'dark' ? 'text-[#ccd6f6]' : 'text-[#333333]'
                  }`}
                >
                  <strong
                    className={theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'}
                  >
                    የቴፒ ግቢ ጉባኤ
                  </strong>{' '}
                  ተማሪዎች በዩኒቨርሲቲ ቆይታቸው በሥነ-ምግባር የታነጹ፣
                  በሃይማኖታቸው የጸኑና ለቤተክርስቲያን እንዲሁም
                  ለሀገር የሚጠቅሙ ዜጎች እንዲሆኑ ለማስቻል
                  ዘርፈ-ብዙ አገልግሎቶችን ይሰጣል።

                  <strong
                    className={theme === 'dark' ? 'text-[#00b3b3]' : 'text-[#0056b3]'}
                  >
                    {' '}
                    እንደ ግቢ ጉባኤያት መመሪያና መዋቅር፣ አገልግሎቶቹ
                    በዋና ዋና ዘርፎችና በንዑሳን ክፍላት ተደራጅተው
                    ይከናወናሉ።
                  </strong>{' '}
                  በአጠቃላይ የቴፒ ግቢ ጉባኤ እነዚህን መዋቅሮች
                  በመጠቀም ተማሪዎች በዩኒቨርሲቲ ቆይታቸው
                  መንፈሳዊና ዓለማዊ ሕይወታቸው ተመጣጣኝ
                  ሆኖ እንዲቀጥልና ለቤተክርስቲያን ተተኪ
                  አገልጋዮች እንዲሆኑ ያደርጋል።
                </p>

                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="relative h-80 rounded-xl overflow-hidden shadow-2xl"
                  >
                    <Image
                      src={images.image1}
                      alt="INSA Services"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className={`absolute inset-0 ${
                      theme === 'dark' ? 'bg-black/40' : 'bg-black/30'
                    }`}></div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Right Column - Animated Services List */}
              <div className="lg:w-1/2">
                <motion.div
                  initial={{ x: 100, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                >
                  <h2 className={`text-3xl font-bold mb-10 ${
                    theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'
                  }`}>
                    Our Core Services
                  </h2>
                  
                  <div className="space-y-4">
                    {services.map((service) => (
                      <motion.div
                        key={service.id}
                        whileHover={{ scale: 1.02 }}
                        onMouseEnter={() => setHoveredService(service.id)}
                        onMouseLeave={() => setHoveredService(null)}
                        className="relative overflow-hidden"
                      >
                        <button
                          onClick={() => scrollToSection(service.id)}
                          className={`w-full text-left px-6 py-5 rounded-xl border-2 ${
                            theme === 'dark' 
                              ? 'border-[#00ffff]/30 bg-white/5' 
                              : 'border-[#007bff]/30 bg-white'
                          } ${
                            activeSection === service.id 
                              ? 'bg-opacity-20' 
                              : ''
                          } transition-all duration-300 flex items-center justify-between group hover:shadow-xl`}
                        >
                          <div className="flex items-center gap-4">
                            <motion.div
                              animate={{
                                scale: hoveredService === service.id ? 1.2 : 1,
                                rotate: hoveredService === service.id ? 360 : 0
                              }}
                              transition={{ duration: 0.3 }}
                              className={`p-3 rounded-lg ${
                                theme === 'dark' 
                                  ? 'bg-[#00ffff]/20' 
                                  : 'bg-[#007bff]/10'
                              }`}
                            >
                              <span className={`text-xl ${
                                theme === 'dark' 
                                  ? 'text-[#00ffff]' 
                                  : 'text-[#007bff]'
                              }`}>
                                {service.icon}
                              </span>
                            </motion.div>
                            <span className="font-medium text-lg">
                              {service.title}
                            </span>
                          </div>
                          <motion.div
                            animate={{
                              x: hoveredService === service.id ? 10 : 0
                            }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <FaChevronRight className={`text-xl ${
                              theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'
                            }`} />
                          </motion.div>
                        </button>
                        
                        {/* Animated underline effect */}
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{
                            scaleX: hoveredService === service.id ? 1 : 0
                          }}
                          transition={{ duration: 0.3 }}
                          className={`absolute bottom-0 left-0 right-0 h-1 ${
                            theme === 'dark' 
                              ? 'bg-gradient-to-r from-[#00ffff] to-cyan-400' 
                              : 'bg-gradient-to-r from-[#007bff] to-blue-400'
                          }`}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Detail Sections - Alternating row layout */}
        {services.map((service, index) => (
          <section
            key={service.id}
            id={service.id}
            className={`min-h-screen flex items-center px-4 md:px-8 py-12 ${
              index % 2 === 0
                ? theme === 'dark'
                  ? 'bg-gradient-to-br from-[#0a192f] to-[#112240]'
                  : 'bg-gradient-to-br from-[#f0f0f0] to-[#ffffff]'
                : theme === 'dark'
                  ? 'bg-black/10'
                  : 'bg-gray-100'
            }`}
          >
            <div className="container mx-auto">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                
                {/* Image Column - Alternates left/right */}
                {index % 2 === 0 ? (
                  <>
                    {/* Even index: Image on left */}
                    <div className="lg:w-1/2 flex justify-center">
                      <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        className="relative w-full max-w-2xl"
                      >
                        <div className="relative h-96 w-full rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                          <Image
                            src={service.image}
                            alt={service.title}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                          <div className={`absolute inset-0 ${
                            theme === 'dark' ? 'bg-black/30' : 'bg-black/20'
                          }`}></div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Content Column - Right side */}
                    <div className="lg:w-1/2">
                      <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                      >
                        <div className="flex items-center gap-4 mb-6">
                          <div className={`p-3 rounded-lg ${
                            theme === 'dark' ? 'bg-[#00ffff]/20' : 'bg-[#007bff]/10'
                          }`}>
                            <span className={`text-2xl ${
                              theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'
                            }`}>
                              {service.icon}
                            </span>
                          </div>
                          <h2 className={`text-3xl font-bold ${
                            theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'
                          }`}>
                            {service.title}
                          </h2>
                        </div>
                        <p className={`text-lg leading-relaxed mb-8 ${
                          theme === 'dark' ? 'text-[#ccd6f6]' : 'text-[#333333]'
                        }`}>
                          {service.description}
                        </p>
                        <Link
                          href={service.link}
                          className={`inline-flex items-center px-6 py-3 border-2 ${themeStyles.buttonBg} rounded-lg font-medium transition-all duration-300`}
                        >
                          See More →
                        </Link>
                      </motion.div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Odd index: Content on left */}
                    <div className="lg:w-1/2">
                      <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                      >
                        <div className="flex items-center gap-4 mb-6">
                          <div className={`p-3 rounded-lg ${
                            theme === 'dark' ? 'bg-[#00ffff]/20' : 'bg-[#007bff]/10'
                          }`}>
                            <span className={`text-2xl ${
                              theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'
                            }`}>
                              {service.icon}
                            </span>
                          </div>
                          <h2 className={`text-3xl font-bold ${
                            theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'
                          }`}>
                            {service.title}
                          </h2>
                        </div>
                        <p className={`text-lg leading-relaxed mb-8 ${
                          theme === 'dark' ? 'text-[#ccd6f6]' : 'text-[#333333]'
                        }`}>
                          {service.description}
                        </p>
                        <Link
                          href={service.link}
                          className={`inline-flex items-center px-6 py-3 border-2 ${themeStyles.buttonBg} rounded-lg font-medium transition-all duration-300`}
                        >
                          See More →
                        </Link>
                      </motion.div>
                    </div>

                    {/* Image Column - Right side */}
                    <div className="lg:w-1/2 flex justify-center">
                      <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        className="relative w-full max-w-2xl"
                      >
                        <div className="relative h-96 w-full rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                          <Image
                            src={service.image}
                            alt={service.title}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                          <div className={`absolute inset-0 ${
                            theme === 'dark' ? 'bg-black/30' : 'bg-black/20'
                          }`}></div>
                        </div>
                      </motion.div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        ))}

        {/* Contact Section */}
        <section 
          id="contact" 
          className="px-4 md:px-8 py-16"
        >
          <div className="container mx-auto">
            <h2 className={`text-3xl font-bold text-center mb-12 ${
              theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'
            }`}>
              Contact Us
            </h2>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[
                { icon: <FaMapMarker />, title: "Location", content: "Addis Ababa, Ethiopia" },
                { icon: <FaPhone />, title: "Phone", content: "+251 9 12 43 65 73" },
                { icon: <FaEnvelope />, title: "Email", content: "info@insa.gov.et" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${
                    theme === 'dark' ? 'bg-[#00ffff]/20' : 'bg-[#007bff]/10'
                  }`}>
                    <span className={`text-2xl ${
                      theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'
                    }`}>
                      {item.icon}
                    </span>
                  </div>
                  <h3 className={`text-xl font-semibold mb-3 ${
                    theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'
                  }`}>
                    {item.title}
                  </h3>
                  <p className={theme === 'dark' ? 'text-[#ccd6f6]' : 'text-[#333333]'}>
                    {item.content}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Map and Contact Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Map */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="rounded-xl overflow-hidden shadow-xl"
              >
                <div className="h-96">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.869244319124!2d38.76321431536945!3d9.012326893541918!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85f1a4b1f3b5%3A0x1c5b5b5b5b5b5b5b!2sAddis%20Ababa%2C%20Ethiopia!5e0!3m2!1sen!2set!4v1633080000000!5m2!1sen!2set"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
              >
                <h3 className={`text-2xl font-bold mb-6 ${
                  theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'
                }`}>
                  Get in Touch
                </h3>
                <form className="space-y-6">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Name"
                      className={`w-full px-4 py-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-300 ${
                        theme === 'dark'
                          ? 'bg-[#0a192f] border-[#00ffff] text-white placeholder-gray-400 focus:ring-[#00ffff]'
                          : 'bg-white border-[#007bff] text-[#333333] focus:ring-[#007bff]'
                      }`}
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Your Email"
                      className={`w-full px-4 py-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-300 ${
                        theme === 'dark'
                          ? 'bg-[#0a192f] border-[#00ffff] text-white placeholder-gray-400 focus:ring-[#00ffff]'
                          : 'bg-white border-[#007bff] text-[#333333] focus:ring-[#007bff]'
                      }`}
                    />
                  </div>
                  <div>
                    <textarea
                      rows={5}
                      placeholder="Your Message"
                      className={`w-full px-4 py-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-300 ${
                        theme === 'dark'
                          ? 'bg-[#0a192f] border-[#00ffff] text-white placeholder-gray-400 focus:ring-[#00ffff]'
                          : 'bg-white border-[#007bff] text-[#333333] focus:ring-[#007bff]'
                      }`}
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className={`w-full px-6 py-3 rounded-lg font-medium text-base transition-colors duration-300 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-[#00ffff] to-[#00b3b3] text-white hover:opacity-90'
                        : 'bg-gradient-to-r from-[#007bff] to-[#0056b3] text-white hover:opacity-90'
                    }`}
                  >
                    Send Message
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}