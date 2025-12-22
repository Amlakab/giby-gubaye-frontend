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
import api from '@/app/utils/api';

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

// Interface for Blog
interface Blog {
  _id: string;
  title: string;
  description: string;
  content: string;
  image?: string;
  category: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  blogDate: string;
  slug: string;
  status: 'published';
  tags: string[];
  isFeatured: boolean;
  viewsCount: number;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
}

// Slides data
const slides = [
  {
    image: images.image1,
    title: "Welcome to Tepi Giby Gubaye",
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
  const [topBlogs, setTopBlogs] = useState<Blog[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const { theme } = useTheme();

  // Helper function to get image URL - Same as BlogPage
  const getImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) return '/api/placeholder/400/250';
    
    if (imagePath.startsWith('http')) return imagePath;
    
    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    if (imagePath.startsWith('/uploads')) {
      return `${serverUrl}${imagePath}`;
    }
    
    return `${serverUrl}/uploads/blogs/${imagePath}`;
  };

  // Format date function - Same as BlogPage
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Get author initials - Same as BlogPage
  const getAuthorInitials = (author: { firstName?: string; lastName?: string }): string => {
    const first = author?.firstName?.charAt(0) || '';
    const last = author?.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'A';
  };

  // Get author avatar color - Same as BlogPage
  const getAuthorAvatarColor = (authorId: string): string => {
    const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2', '#00796b', '#388e3c', '#f57c00', '#0288d1', '#c2185b'];
    const index = authorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // Fetch top 3 blogs
  useEffect(() => {
    const fetchTopBlogs = async () => {
      try {
        setLoadingBlogs(true);
        const params = new URLSearchParams({
          limit: '3',
          sortBy: 'blogDate',
          sortOrder: 'desc'
        });
        
        const response = await api.get(`/blogs/public/approved?${params}`);
        setTopBlogs(response.data.data.blogs || []);
      } catch (error) {
        console.error('Error fetching top blogs:', error);
        setTopBlogs([]);
      } finally {
        setLoadingBlogs(false);
      }
    };

    fetchTopBlogs();
  }, []);

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

        {/* Blog Section - DYNAMIC - USING <img> TAG LIKE BLOGPAGE */}
        <section className={`py-16 px-4 ${theme === 'dark' ? 'bg-transparent' : 'bg-background'}`}>
          <div className="container mx-auto">
            <h2 className={`text-3xl font-bold text-center mb-12 ${theme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
              Latest from Our Blog
            </h2>
            
            {loadingBlogs ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : topBlogs.length === 0 ? (
              <div className="text-center py-12">
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'}`}>
                  No blog posts available at the moment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {topBlogs.map((blog, index) => (
                  <motion.div
                    key={blog._id}
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                    className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${
                      theme === 'dark' ? 'bg-surface/30 backdrop-blur-sm' : 'bg-surface'
                    }`}
                  >
                    <Link href={`/blog`} className="block">
                      {/* Blog Image - Using <img> tag like BlogPage */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={getImageUrl(blog.image)}
                          alt={blog.title}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            transition: 'transform 0.3s'
                          }}
                          className="group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = '/api/placeholder/400/250';
                          }}
                        />
                        {blog.isFeatured && (
                          <div className="absolute top-2 left-2">
                            <span className="px-2 py-1 text-xs font-bold bg-yellow-500 text-gray-900 rounded">
                              Featured
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-sm font-medium px-2 py-1 rounded ${
                            theme === 'dark' 
                              ? 'bg-gray-800 text-gray-300' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {blog.category}
                          </span>
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatDate(blog.blogDate)}
                          </span>
                        </div>
                        <h3 className={`text-lg font-semibold mb-2 ${
                          theme === 'dark' ? 'text-white' : 'text-text-primary'
                        }`}>
                          {blog.title}
                        </h3>
                        <p className={`text-base mb-3 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                        }`}>
                          {blog.description.length > 120 
                            ? `${blog.description.substring(0, 120)}...` 
                            : blog.description}
                        </p>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                              style={{ backgroundColor: getAuthorAvatarColor(blog.createdBy._id) }}
                            >
                              {getAuthorInitials(blog.createdBy)}
                            </div>
                            <span className={`ml-2 text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {blog.createdBy.firstName} {blog.createdBy.lastName}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {blog.readingTime} min read
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
            <div className="text-center mt-12">
              <Link
                href="/blog"
                className="inline-flex items-center px-6 py-3 border-2 border-primary hover:bg-primary text-primary hover:text-white rounded-lg font-medium transition-colors duration-300 text-base"
              >
                View All Blog Posts
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