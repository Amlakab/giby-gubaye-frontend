'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { encryptionService } from '@/lib/encryptionUtils';
import { useTheme } from '@/lib/theme-context';
import {
  FaMapMarker,
  FaPhone,
  FaEnvelope,
  FaArrowLeft,
  FaArrowRight,
} from 'react-icons/fa';

// Import images
const images = {
  image1: '/images/image1.jpg',
  image2: '/images/image2.jpg',
  insa3: '/images/insa3.png',
  insa4: '/images/insa4.png',
  insa5: '/images/insa5.png',
  insa9: '/images/insa9.png',
  insa12: '/images/insa12.png',
  image21: '/images/image21.jpg',
  image22: '/images/image22.jpg',
  image23: '/images/image23.jpg',
  logo1: '/images/logo1.png',
  logo2: '/images/logo2.png',
};

// Slides data
const slides = [
  {
    image: images.image1,
    title: "Welcome to INSA",
    description: "Innovative solutions for a smarter tomorrow.",
  },
  {
    image: images.image2,
    title: "Explore Our Services",
    description: "We provide cutting-edge solutions tailored to your needs.",
  },
  {
    image: images.image1,
    title: "Meet Our Team",
    description: "A team of experts dedicated to your success.",
  },
  {
    image: images.image2,
    title: "Contact Us Today",
    description: "Let's build something amazing together.",
  },
  {
    image: images.image1,
    title: "Join Our Community",
    description: "Be part of a growing network of innovators.",
  },
];

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState("right");
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const { theme } = useTheme();

  // Handle URL parameters
  useEffect(() => {
    const handleUrlParams = async () => {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const encryptedId = urlParams.get('agent_id');
        const agentId = encryptedId ? await encryptionService.decryptId(encryptedId) : null;
        const tgId = urlParams.get('tg_id');
        
        if (agentId || tgId) {
          const currentStorage = {
            agent_id: localStorage.getItem('agent_id'),
            tg_id: localStorage.getItem('tg_id')
          };
          
          if (agentId && agentId !== currentStorage.agent_id) {
            localStorage.setItem('agent_id', agentId);
          }
          
          if (tgId && tgId !== currentStorage.tg_id) {
            localStorage.setItem('tg_id', tgId);
          }
        }
      }
    };

    handleUrlParams();
  }, []);

  // Slideshow navigation
  const nextImage = useCallback(() => {
    setSlideDirection("right");
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [slides.length]);

  const prevImage = useCallback(() => {
    setSlideDirection("left");
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      nextImage();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentImageIndex, nextImage]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-[#0a192f] to-[#112240] text-white' 
        : 'bg-background text-text-primary'
    }`}>
      <Navbar />
      
      <div className="pt-16">
        {/* Hero Section with Slideshow */}
        <section className="relative h-screen overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ x: slideDirection === "right" ? "100%" : "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: slideDirection === "right" ? "-100%" : "100%", opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <Image
                src={slides[currentImageIndex].image}
                alt={slides[currentImageIndex].title}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
              <div className={`absolute inset-0 ${
                theme === 'dark' ? 'bg-black/60' : 'bg-black/50'
              }`}></div>
            </motion.div>
          </AnimatePresence>

          {/* Hero Content */}
          <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ x: slideDirection === "right" ? 100 : -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: slideDirection === "right" ? -100 : 100, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl"
              >
                <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
                  {slides[currentImageIndex].title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-white/90">
                  {slides[currentImageIndex].description}
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => setShowLogin(true)}
                    className="px-8 py-3 bg-primary hover:bg-secondary text-white rounded-lg font-medium text-lg transition-colors duration-300 shadow-lg"
                  >
                    Get Started
                  </button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full ${
              theme === 'dark' 
                ? 'bg-surface/80 hover:bg-surface' 
                : 'bg-white/80 hover:bg-white'
            } transition-all duration-300`}
            aria-label="Previous Image"
          >
            <FaArrowLeft className={theme === 'dark' ? 'text-text-primary' : 'text-text-primary'} size={20} />
          </button>
          <button
            onClick={nextImage}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full ${
              theme === 'dark' 
                ? 'bg-surface/80 hover:bg-surface' 
                : 'bg-white/80 hover:bg-white'
            } transition-all duration-300`}
            aria-label="Next Image"
          >
            <FaArrowRight className={theme === 'dark' ? 'text-text-primary' : 'text-text-primary'} size={20} />
          </button>
        </section>

        {/* About Section */}
        <section className={`py-16 px-4 ${theme === 'dark' ? 'bg-transparent' : 'bg-background'}`}>
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="relative h-80 md:h-96 rounded-xl overflow-hidden shadow-xl"
              >
                <Image
                  src={images.image1}
                  alt="About INSA"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </motion.div>
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
              >
                <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
                  About Us
                </h2>
                <p className={`mb-6 text-base ${theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'}`}>
                  The <strong className="text-primary">Information Network Security Agency (INSA)</strong> is Ethiopia's national institution
                  responsible for safeguarding the country's cybersecurity and information infrastructure. Established in
                  2006, INSA plays a vital role in protecting national digital assets, preventing cyber threats, and
                  ensuring secure communication systems.
                </p>
                <Link
                  href="/about"
                  className="inline-flex items-center px-6 py-3 border-2 border-primary hover:bg-primary text-primary hover:text-white rounded-lg font-medium transition-colors duration-300 text-base"
                >
                  Read More
                  <span className="ml-2">→</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className={`py-16 px-4 ${theme === 'dark' ? 'bg-surface/20' : 'bg-surface'}`}>
          <div className="container mx-auto">
            <h2 className={`text-3xl font-bold text-center mb-12 ${theme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
              Our Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="order-2 md:order-1"
              >
                <h3 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
                  Our Services
                </h3>
                <p className={`mb-6 text-base ${theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'}`}>
                  The <strong className="text-primary">Information Network Security Agency (INSA)</strong> provides a wide range of cybersecurity
                  services aimed at protecting Ethiopia's national information infrastructure. Its core services include{' '}
                  <strong className="text-secondary">cyber threat intelligence, incident response, policy development, cybersecurity research,
                  capacity building, and public awareness campaigns</strong>.
                </p>
                <Link
                  href="/services"
                  className="inline-flex items-center px-6 py-3 border-2 border-primary hover:bg-primary text-primary hover:text-white rounded-lg font-medium transition-colors duration-300 text-base"
                >
                  Read More
                  <span className="ml-2">→</span>
                </Link>
              </motion.div>
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="relative h-80 md:h-96 rounded-xl overflow-hidden shadow-xl order-1 md:order-2"
              >
                <Image
                  src={images.image1}
                  alt="INSA Services"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section className={`py-16 px-4 ${theme === 'dark' ? 'bg-transparent' : 'bg-background'}`}>
          <div className="container mx-auto">
            <h2 className={`text-3xl font-bold text-center mb-12 ${theme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
              Latest from Our Blog
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Blog Post 1 */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${
                  theme === 'dark' ? 'bg-surface/30 backdrop-blur-sm' : 'bg-surface'
                }`}
              >
                <Link href="/news1" className="block">
                  <div className="relative h-48">
                    <Image
                      src={images.image21}
                      alt="INSA Headquarters"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <p className={`text-base ${theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'}`}>
                      በስመአብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ አሜን
                      ✝️✝️✝️✝️✝️✝️✝️✝️✝️✝️✝️✝️✝️
                      ሰላም የእግዚአብሔር ቤተሰቦች
                      እንደምን አላችሁ ቅዳሜ ማለትም 08/02/2018 ዓ.ም ከቀኑ 3:30 የ 2018 ዓ.ም የመጀመሪያችን ነደያን ጥየቃ ስለምንጀምር ተቀሳቅሰን ያልሰሙትን በማሰማት እህት ወንድሞቻችንን ይዘን በመምጣት የበረከቱ ተሳታፊ እንድንሆን።
                      ወስብሀት ለ እግዚአብሔር ወለወላዲቱ ድንግል ወለ መስቀሉ ክብር ይቆየን።
                    </p>
                  </div>
                </Link>
              </motion.div>

              {/* Blog Post 2 */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${
                  theme === 'dark' ? 'bg-surface/30 backdrop-blur-sm' : 'bg-surface'
                }`}
              >
                <Link href="/news2" className="block">
                  <div className="relative h-48">
                    <Image
                      src={images.image22}
                      alt="Cybersecurity Operations"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <p className={`text-base ${theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'}`}>
                      በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ።
                       ✝️✝️✝️✝️✝️✝️✝️✝️✝️✝️✝️✝️✝️
                      እንኳን ለእመቤታችን የልደት በዓል በሰላም አደረሳችሁ/አደረሰን። ይህን ታላቅ መንፈሳዊ በዓል በመከበር ምክንያት፣ በሰርክ ሰዓት 11:30 ላይ ልዩ መርሐ ግብር ተዘጋጅቶ ስለሚቀርብ፣ ሁላችሁም በተመደበው ሰዓት ከትልቁ አዳራሽ በመገኘት በመንፈሳዊው ዝግጅት እንድትሳተፉ በከበረ አክብሮት እንጋብዛችኋለን።
                      ወስብሐት ለእግዚአብሔር።
                    </p>
                  </div>
                </Link>
              </motion.div>

              {/* Blog Post 3 */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${
                  theme === 'dark' ? 'bg-surface/30 backdrop-blur-sm' : 'bg-surface'
                }`}
              >
                <Link href="/news3" className="block">
                  <div className="relative h-48">
                    <Image
                      src={images.image23}
                      alt="INSA Collaboration"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <p className={`text-base ${theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'}`}>
                      በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ አሜን።
                      ✝️✝️✝️✝️✝️✝️✝️✝️✝️✝️✝️✝️✝️
                     የግቢ-ጉባኤያችን 17ኛ ዓመት የምሥረታ በዓል በእግዚአብሔር ፈቃድ በደስታና በስኬት ተፈጽሟል። በበዓሉ መርሃ ግብራት ሁሉ ላይ ለተሳተፉ ክቡራን አባላትና ተማሪዎች ሁሉ አምላከ ቅዱሳን በረከቱን ያድለን። ግቢ-ጉባኤያችንን እስከ መጨረሻው ድረስ በሰላም እና በእምነት ይጠብቅልን፤ ለሚቀጥለውም ዓመት በሰላምና በጤና እንዲያደርሰን እንለምናለን። 
                    </p>
                  </div>
                </Link>
              </motion.div>
            </div>
            <div className="text-center mt-12">
              <Link
                href="/blog"
                className="inline-flex items-center px-6 py-3 border-2 border-primary hover:bg-primary text-primary hover:text-white rounded-lg font-medium transition-colors duration-300 text-base"
              >
                Read More Blog Posts
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className={`py-16 px-4 ${theme === 'dark' ? 'bg-surface/20' : 'bg-surface'}`}>
          <div className="container mx-auto">
            <h2 className={`text-3xl font-bold text-center mb-12 ${theme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
              Contact Us
            </h2>
            
            {/* Contact Info */}
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
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
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
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
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
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
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
                <h3 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
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

      <Footer />
    </div>
  );
}