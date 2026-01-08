'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { useTheme } from '@/lib/theme-context';
import {
  FaMapMarker,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaCity,
  FaKey,
  FaUserTag,
} from 'react-icons/fa';

// Import images - adjust paths based on your public folder structure
const aboutImages = {
  insa1: '/images/image1.jpg',
  about2: '/images/image2.jpg',
  about5: '/images/giby2.jpg',
  about4: '/images/giby3.jpg',
  insa9: '/images/giby4.jpg',
  about3: '/images/giby5.jpg',
  about6: '/images/giby6.jpg',
};

const sections = [
  {
    id: 'about',
    title: 'ስለ ቴፒ ግቢ ጉባኤ',
    content:
      'የቴፒ ግቢ ጉባኤ በኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን በሰንበት ትምህርት ቤቶች ማደራጃ መምሪያ ማኅበረ ቅዱሳን አማካይነት በከፍተኛ ትምህርት ተቋማት ውስጥ የሚቋቋም መንፈሳዊ ተቋም ነው። የዚህ ጉባኤ መቋቋም ዋና ዓላማ የከፍተኛ ትምህርት ተቋማት ተማሪዎች መንፈሳዊ አገልግሎታቸውን ወጥነት ባለውና በተቀላጠፈ መልኩ እንዲፈጽሙ ማስቻል ነው። ተማሪዎች በዩኒቨርሲቲ ቆይታቸው ከቤተ ክርስቲያናቸው ጋር ያላቸው ግንኙነት ሳይቋረጥ በኦርቶዶክሳዊ ማንነት እንዲታነጹ ይረዳል። ጉባኤው በአጥቢያ ቤተ ክርስቲያን የሚከናወኑ መንፈሳውያን መርሐ ግብራትን ያቀናጃል እንዲሁም ይመራል። ይህም ተማሪዎች በግቢያቸው ውስጥ ብቻ ሳይወሰኑ በቤተ ክርስቲያን ጥላ ሥር እንዲቆዩ ያደርጋል። በአጠቃላይ ተማሪዎች በቆይታቸው የቤተ ክርስቲያንን ሥርዓትና ትውፊት ጠብቀው እንዲያድጉ ያደርጋል። ግቢ ጉባኤው የተማሪዎችን የእለት ከእለት መንፈሳዊ እንቅስቃሴ በመከታተልና በመምራት ረገድ ከፍተኛ ኃላፊነት አለበት።',
    image: aboutImages.insa1,
  },
  {
    id: 'mission',
    title: 'ተልዕኮ',
    content:
      'ተልዕኳችን ተማሪዎች በአቅራቢያቸው በሚገኝ አጥቢያ ቤተ ክርስቲያን የሚያደርጓቸውን መንፈሳውያን መርሐ ግብራት ማቀናጀት፣ መምራትና ማስተባበር ነው። ማኅበሩ በቀረጸው ወጥ ሥርዓተ ትምህርት መሠረት ተማሪዎች የቤተ ክርስቲያናቸውን ሥርዓተ እምነት፣ ታሪክ፣ ሥነ ምግባር እና ክርስቲያናዊ ትውፊት በአግባቡ እንዲማሩ እናደርጋለን። ተማሪዎች በገንዘባቸው፣ በዕውቀታቸውና በሙያቸው ቤተ ክርስቲያናቸውን ማገልገል እንዳለባቸው ግንዛቤ በመፍጠር የአገልግሎት ተሳታፊ እንዲሆኑ እናመቻቻለን። በማኅበሩ የሚሰራጩ የሕትመት ውጤቶችን ማለትም መጽሔት፣ ጋዜጣና በራሪ ጽሑፎችን ለተማሪዎች በማድረስ ሃይማኖታዊ ዕውቀታቸው እንዲዳብር እንሠራለን። በተጨማሪም ተማሪዎች በሰንበት ትምህርት ቤት አገልግሎት ላይ ንቁ ተሳትፎ እንዲኖራቸው በማድረግ ተተኪ አገልጋዮችን የማፍራት ተልዕኮ አለን። የግቢ ጉባኤው አባላት በማእከሉ መንፈሳዊ አገልግሎት ላይ እንዲሳተፉና ልምምድ የሚያደርጉበትን ሁኔታ ማመቻቸት ሌላው ተልዕኳችን ነው። ይህም ተማሪዎች ከምረቃ በኋላም ለቤተ ክርስቲያን ጠቃሚ አገልጋይ እንዲሆኑ ያዘጋጃቸዋል።',
    image: aboutImages.about2,
  },
  {
    id: 'vision',
    title: 'ራዕይ',
    content:
      'የግቢ ጉባኤያችን ራዕይ በከፍተኛ ትምህርት ተቋማት ውስጥ የሚማሩ ኦርቶዶክሳውያን ወጣቶች ሃይማኖታቸውን በአግባቡ ያወቁ፣ መንፈሳውያንና በመልካም ሥነ ምግባር የታነጹ ዜጎች ሆነው ማየት ነው። ተማሪዎች በሚማሩበት የሙያ ዘርፍ ለራሳቸው፣ ለቤተሰቦቻቸው፣ ለማኅበረሰቡ፣ ለቤተ ክርስቲያንና ለሀገራቸው የበኩላቸውን አስተዋጽዖ የሚያበረክቱ ብቁ ምሁራን እንዲሆኑ ማስቻል የራዕያችን አካል ነው። በዩኒቨርሲቲው ውስጥ የሚገኙ ኦርቶዶክሳውያን ተማሪዎች በሙሉ በግቢ ጉባኤው ተሳትፎ እንዲኖራቸውና በሃይማኖት ጥንካሬ እንዲያድጉ እንመኛለን። ራዕያችን ተማሪዎች በሳይንሳዊ ዕውቀታቸውና በመንፈሳዊ ሕይወታቸው የተመጣጠነ ስብዕና እንዲኖራቸው በማድረግ ሀገር ተረካቢ ትውልድ መፍጠር ነው። ተማሪዎች የቤተ ክርስቲያን ምሰሶና የሀገር ተስፋ ሆነው እንዲወጡ በራዕይ እንሠራለን። ይህም ተማሪዎች የቤተ ክርስቲያናቸውን ዶግማና ቀኖና ጠብቀው ዓለማዊውን ትምህርት እንዲያሸንፉ መርዳትን ያካትታል። በመጨረሻም መንፈሳዊነትና ዕውቀት የተዋሃደላቸው ምሁራን በቤተ ክርስቲያን መዋቅር ውስጥ ገብተው እንዲያገለግሉ ማየት ትልቁ ራዕያችን ነው።',
    image: aboutImages.about5,
  },
  {
    id: 'objectives',
    title: 'ዓላማዎች',
    content:
      'የግቢ ጉባኤው ዋና ዋና ዓላማዎች ተማሪዎች በአጥቢያ ቤተ ክርስቲያን በሚደረጉ መደበኛ መርሐ ግብራት ላይ እንዲሳተፉ ማመቻቸትና መከታተል ነው። ተማሪዎች ማኅበሩ ባዘጋጀው ሥርዓተ ትምህርት መሠረት ትምህርታቸውን በአግባቡ መከታተላቸውን ማረጋገጥ ሌላው ዓላማ ነው። በማኅበሩ የሚታተሙ መጻሕፍት፣ መጽሔቶችና ሌሎች የሕትመት ውጤቶች ለተማሪዎች ተደራሽ እንዲሆኑ በማድረግ መንፈሳዊ ንባብን ማበረታታት እንፈልጋለን። ተማሪዎች በዩኒቨርሲቲው ውስጥም ሆነ በአጥቢያው ሰንበት ትምህርት ቤት በሚሰጡ የአገልግሎት ክፍሎች ተመድበው እንዲያገለግሉ እናደርጋለን። ተማሪዎች በገንዘባቸው፣ በዕውቀታቸውና በሙያቸው ቤተ ክርስቲያናቸውን የማገልገል ግዴታ እንዳለባቸው በማስተማር ለበጎ አድራጎት ሥራዎች እንዲነሳሱ ማድረግ ዓላማችን ነው። የግቢ ጉባኤውን ገንዘብና ንብረት በአግባቡ በመጠበቅና ሪፖርት በማድረግ ግልጽነት ያለው አሠራር መዘርጋት ሌላው ተግባር ነው። ተማሪዎች ከመደበኛው ትምህርት ጎን ለጎን የቤተ ክርስቲያንን ትውፊትና ሥነ ምግባር ጠብቀው እንዲያድጉ ልዩ ክትትል እናደርጋለን።',
    image: aboutImages.about4,
  },
  {
    id: 'education',
    title: 'የትምህርትና ሐዋርያዊ አገልግሎት',
    content:
      'ይህ ክፍል በግቢ ጉባኤው ውስጥ የሚከናወኑ ማናቸውንም መደበኛና መደበኛ ያልሆኑ የትምህርት መርሐ ግብራትን በበላይነት ያቀናጃል። እንደ አስፈላጊነቱ መምህራን እንዲመደቡና ትምህርቶች በተያዘላቸው ሰዓት መከናወናቸውን ይቆጣጠራል። በግቢ ጉባኤው ውስጥ ተተኪ መምህራንንና መርሐ ግብር መሪዎችን ለማፍራት ስልጠናዎችን ያስተባብራል። ተማሪዎች የአብነት ትምህርትን ማለትም ዜማንና ቅዳሴን እንዲማሩ ይቀሰቅሳል፣ ለትምህርቱም የሚያስፈልጉ ግብዓቶች እንዲሟሉ ይሠራል። አባላት ከመደበኛው ሥርዓተ ትምህርት በተጨማሪ ለመንፈሳዊ ሕይወታቸው አጋዥ የሆኑ የአገልግሎት ኮርሶችን እንዲያገኙ ያመቻቻል። የትምህርት ክፍሉ ሰብሳቢ አገልግሎቱን በበላይነት እየመራ ለሥራ አስፈጻሚው ሪፖርት ያቀርባል። በተጨማሪም ተማሪዎች በአካባቢው ለሚገኙ አብያተ ክርስቲያናትና ገዳማት ልዩ ልዩ አገልግሎቶችን እንዲሰጡ ሁኔታዎችን ያመቻቻል። ተማሪዎች ከምረቃ በኋላም የአብነት ትምህርታቸውን መቀጠል እንዲችሉ ከማእከሉ ጋር ግንኙነት ያደርጋል።',
    image: aboutImages.insa9,
  },
  {
    id: 'care',
    title: 'የአባላት እንክብካቤ',
    content:
      'ይህ ክፍል የተማሪዎችን መንፈሳዊና ማኅበራዊ ሕይወት በቅርበት በመከታተል አስፈላጊውን እንክብካቤና ድጋፍ ይሰጣል። ተማሪዎች ከቋንቋ ችግር ወይም ከአካባቢ መለወጥ ጋር ተያይዞ የሚገጥማቸውን ፈተና እንዲወጡ የምክክር አገልግሎት ያመቻቻል። የአካል ጉዳተኛ ተማሪዎችና ልዩ ድጋፍ የሚሹ አባላት በጉባኤው ውስጥ እኩል ተሳትፎ እንዲኖራቸው ይረዳል። ተማሪዎች በመንፈሳዊ ሕይወታቸው ሲደክሙ ወይም ከጉባኤ ሲቀሩ በምክክርና በትምህርት ወደ አገልግሎት እንዲመለሱ የማድረግ ኃላፊነት አለበት። የአባላትን ሙሉ መረጃ በመሰብሰብና በማደራጀት የጉባኤውን ተደራሽነት ይገመግማል። ተማሪዎች እርስ በርስ የሚደጋገፉበትንና የሚጠያየቁበትን ሥርዓት በመዘርጋት እንደ አንድ ቤተሰብ እንዲኖሩ ይሠራል። ክፍሉ በየጊዜው የአባላትን ሁኔታ ለሥራ አስፈጻሚው በማሳወቅ የመፍትሔ አቅጣጫዎችን ይጠቁማል። ለተማሪዎች መንፈሳዊ ጥንካሬ የሚረዱ ልዩ ልዩ የውይይት መድረኮችንም ያዘጋጃል።',
    image: aboutImages.about3,
  },
  {
    id: 'capacity',
    title: 'የአቅም ግንባታና ሙያዊ አገልግሎት',
    content:
      'ይህ ክፍል ተማሪዎች በሚማሩበት የሙያ ዘርፍ (ጤና፣ ሕግ፣ ግብርና፣ ምህንድስና ወዘተ) ቤተ ክርስቲያናቸውን ማገልገል የሚችሉበትን መንገድ ያመቻቻል። ተማሪዎች ያላቸውን ዕውቀትና ሙያ ለቤተ ክርስቲያንና ለሀገር ዕድገት እንዲጠቀሙበት የሙያ ስልጠናዎችንና ፕሮጀክቶችን ቀርጾ ይተገብራል። የግቢ ጉባኤውን የገቢ ምንጭ ለማጠናከር ልዩ ልዩ የልማትና ገቢ አሰባሰብ ሥራዎችን ከማእከሉ ጋር በመሆን ያከናውናል። ተማሪዎች በዕረፍት ጊዜያቸው በበጎ አድራጎት ሥራዎች ላይ እንዲሳተፉና የሥራ ልምምድ እንዲያገኙ ሁኔታዎችን ያመቻቻል። የአባላትን ልዩ ልዩ ክህሎት በመለየት ለቤተ ክርስቲያን አገልግሎት እንዲውሉ የማስተባበር ኃላፊነት አለበት። ክፍሉ ተማሪዎች ከምረቃ በኋላም በማኅበሩና በቤተ ክርስቲያን መዋቅር ውስጥ በሙያቸው ማገልገል እንዲችሉ ቅድመ ዝግጅት ያደርጋል። ለግቢ ጉባኤው አገልግሎት መነሻ የሚሆኑ መሠረታዊ ቁሳቁሶችን የማደራጀትና የመጠበቅ ሥራንም ይከታተላል።',
    image: aboutImages.about6,
  },
];

export default function AboutPage() {
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
        {/* About Sections */}
        {sections.map((section, index) => (
          <section
            key={section.id}
            id={section.id}
            className={`py-16 px-4 ${
              index % 2 === 0 
                ? (theme === 'dark' ? 'bg-transparent' : 'bg-background')
                : (theme === 'dark' ? 'bg-surface/20' : 'bg-surface')
            }`}
          >
            <div className="container mx-auto">
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 0 ? '' : 'lg:flex-row-reverse'
              }`}>
                {/* Image Column */}
                <motion.div
                  initial={{ x: index % 2 === 0 ? -100 : 100, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                  className={`${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}
                >
                  <div className="relative h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow-xl">
                    <Image
                      src={section.image}
                      alt={section.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </motion.div>

                {/* Content Column */}
                <motion.div
                  initial={{ x: index % 2 === 0 ? 100 : -100, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                  className={`${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}
                >
                  <h2 className={`text-3xl font-bold mb-6 ${
                    theme === 'dark' ? 'text-primary' : 'text-primary'
                  }`}>
                    {section.title}
                  </h2>
                  <p className={`text-base leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    {section.content}
                  </p>
                </motion.div>
              </div>
            </div>
          </section>
        ))}

        {/* Contact Section (from About component) */}
        <section className={`py-16 px-4 ${
          theme === 'dark' ? 'bg-surface/20' : 'bg-surface'
        }`}>
          <div className="container mx-auto">
            <h2 className={`text-3xl font-bold text-center mb-12 ${
              theme === 'dark' ? 'text-primary' : 'text-primary'
            }`}>
              Contact Us
            </h2>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 mb-4">
                  <FaMapMarker className="text-primary text-xl" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-text-primary'
                }`}>
                  Location
                </h3>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'}>
                  Addis Abeba, Ethiopia
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 mb-4">
                  <FaPhone className="text-primary text-xl" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-text-primary'
                }`}>
                  Phone
                </h3>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'}>
                  +251 9 12 43 65 73
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 mb-4">
                  <FaEnvelope className="text-primary text-xl" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-text-primary'
                }`}>
                  Email
                </h3>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'}>
                  info@insa.gov.et
                </p>
              </motion.div>
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
                  theme === 'dark' ? 'text-primary' : 'text-primary'
                }`}>
                  Get in Touch
                </h3>
                <form className="space-y-6">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Name"
                      className={`w-full px-4 py-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-300 ${
                        theme === 'dark' 
                          ? 'bg-surface/50 border-border text-white placeholder-gray-400' 
                          : 'bg-background border-border text-text-primary'
                      }`}
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Your Email"
                      className={`w-full px-4 py-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-300 ${
                        theme === 'dark' 
                          ? 'bg-surface/50 border-border text-white placeholder-gray-400' 
                          : 'bg-background border-border text-text-primary'
                      }`}
                    />
                  </div>
                  <div>
                    <textarea
                      rows={5}
                      placeholder="Your Message"
                      className={`w-full px-4 py-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-300 ${
                        theme === 'dark' 
                          ? 'bg-surface/50 border-border text-white placeholder-gray-400' 
                          : 'bg-background border-border text-text-primary'
                      }`}
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-primary hover:bg-secondary text-white rounded-lg font-medium text-base transition-colors duration-300"
                  >
                    Send Message
                  </button>
                </form>
              </motion.div>
            </div>
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