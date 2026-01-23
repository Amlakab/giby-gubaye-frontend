'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { useTheme } from '@/lib/theme-context';
import {
  FaPlayCircle,
  FaDownload,
  FaEnvelope,
  FaKey,
  FaUser,
  FaCity,
  FaUserTag,
  FaSpinner,
  FaEye,
  FaCalendar,
  FaTags,
  FaStar,
  FaYoutube
} from 'react-icons/fa';

interface VideoResource {
  _id: string;
  title: string;
  description: string;
  type: 'video';
  youtubeUrl: string;
  videoId: string;
  thumbnail: string;
  category: string;
  tags: string[];
  viewsCount: number;
  downloadsCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  status: 'approved' | 'pending' | 'rejected';
  visibility: 'visible' | 'hidden';
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function VideoPage() {
  const { theme } = useTheme();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch videos from API
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://giby-gubaye-backend.onrender.com/api';
        const response = await fetch(`${API_URL}/resources/videos?type=video&status=approved&visibility=visible&limit=50`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch videos: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Process videos to ensure we have proper videoId
          const processedVideos = data.data.resources.map((video: any) => {
            let videoId = video.videoId;
            
            // If no videoId, try to extract from youtubeUrl
            if (!videoId && video.youtubeUrl) {
              videoId = extractYouTubeId(video.youtubeUrl);
            }
            
            return {
              ...video,
              videoId: videoId || '',
              thumbnail: video.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            };
          });
          
          setVideos(processedVideos || []);
        } else {
          throw new Error(data.message || 'Failed to load videos');
        }
      } catch (err: any) {
        console.error('Error fetching videos:', err);
        setError(err.message || 'Failed to load videos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Improved YouTube ID extraction
  const extractYouTubeId = (url: string): string => {
    if (!url) return '';
    
    // Handle various YouTube URL formats
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[7].length === 11) {
      return match[7];
    }
    
    // Try alternative patterns
    const patterns = [
      /youtu\.be\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return '';
  };

  const openVideoModal = (videoId: string) => {
    if (!videoId) {
      console.error('No video ID provided');
      return;
    }
    setSelectedVideo(videoId);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-[#0a192f] to-[#112240] text-white' 
        : 'bg-background text-text-primary'
    }`}>
      <Navbar />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className={`py-12 px-4 ${
          theme === 'dark' ? 'bg-transparent' : 'bg-background'
        }`}>
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-6 ${
                theme === 'dark' ? 'text-primary' : 'text-primary'
              }`}>
                ቴፒ ግቢ ጉባኤ የቪዲዮ ትምህርቶች
              </h1>
              <p className={`text-lg max-w-3xl mx-auto ${
                theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
              }`}>
                የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን መንፈሳዊ ትምህርቶችን የያዙ ቪዲዮዎች
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Bar */}
        {!loading && !error && videos.length > 0 && (
          <div className={`py-4 px-4 ${
            theme === 'dark' ? 'bg-surface/20' : 'bg-surface'
          }`}>
            <div className="container mx-auto">
              <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-primary' : 'text-primary'
                  }`}>
                    {videos.length}
                  </div>
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-text-secondary'
                  }`}>
                    ቪዲዮዎች
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-primary' : 'text-primary'
                  }`}>
                    {videos.filter(v => v.isFeatured).length}
                  </div>
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-text-secondary'
                  }`}>
                    ልዩ ቪዲዮዎች
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-primary' : 'text-primary'
                  }`}>
                    {videos.reduce((sum, video) => sum + (video.viewsCount || 0), 0)}
                  </div>
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-text-secondary'
                  }`}>
                    አጠቃላይ እይታዎች
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <section className="py-20 px-4">
            <div className="container mx-auto text-center">
              <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
              <p className={`text-lg ${
                theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
              }`}>
                ቪዲዮዎች በማዘጋጀት ላይ...
              </p>
            </div>
          </section>
        )}

        {/* Error State */}
        {error && !loading && (
          <section className="py-20 px-4">
            <div className="container mx-auto text-center">
              <div className={`max-w-md mx-auto p-6 rounded-lg ${
                theme === 'dark' ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className={`text-xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-red-300' : 'text-red-600'
                }`}>
                  ስህተት ተከስቷል
                </h3>
                <p className={`mb-4 ${
                  theme === 'dark' ? 'text-red-300' : 'text-red-600'
                }`}>
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-primary hover:bg-secondary text-white rounded-lg font-medium transition-colors duration-300"
                >
                  እንደገና ይሞክሩ
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Videos Grid */}
        {!loading && !error && videos.length > 0 && (
          <section className="py-12 px-4">
            <div className="container mx-auto">
              <div className="flex flex-col gap-12">
                {videos.map((video, index) => {
                  const videoId = video.videoId;
                  const thumbnail = video.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                  
                  return (
                    <div
                      key={video._id}
                      className={`flex flex-col lg:flex-row gap-8 items-center ${
                        index % 2 === 0 ? '' : 'lg:flex-row-reverse'
                      }`}
                    >
                      {/* Content Column */}
                      <motion.div
                        initial={{ x: index % 2 === 0 ? -100 : 100, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        className={`${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'} text-center lg:text-left lg:w-1/2`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          {video.isFeatured && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full text-xs font-medium">
                              <FaStar className="text-xs" /> ልዩ
                            </span>
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            theme === 'dark' 
                              ? 'bg-primary/20 text-primary' 
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {video.category}
                          </span>
                        </div>
                        
                        <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${
                          theme === 'dark' ? 'text-primary' : 'text-primary'
                        }`}>
                          {video.title}
                        </h2>
                        
                        <div className={`flex items-center gap-4 mb-4 text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-text-secondary'
                        }`}>
                          <span className="flex items-center gap-1">
                            <FaEye /> {video.viewsCount || 0} እይታዎች
                          </span>
                          <span className="flex items-center gap-1">
                            <FaCalendar /> {formatDate(video.createdAt)}
                          </span>
                        </div>
                        
                        <p className={`text-base mb-6 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                        }`}>
                          {video.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                          <button
                            onClick={() => videoId && openVideoModal(videoId)}
                            className="inline-flex items-center px-5 py-2.5 bg-primary hover:bg-secondary text-white rounded-lg font-medium text-sm transition-colors duration-300"
                          >
                            <FaPlayCircle className="mr-2" />
                            ቪዲዮውን ይመልከቱ
                          </button>
                          
                          {video.youtubeUrl && (
                            <a
                              href={video.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors duration-300"
                            >
                              <FaYoutube className="mr-2" />
                              በYouTube ይመልከቱ
                            </a>
                          )}
                        </div>
                        
                        {video.tags && video.tags.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2 justify-center lg:justify-start">
                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                              <FaTags />
                            </div>
                            {video.tags.slice(0, 3).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className={`px-3 py-1 rounded-full text-xs ${
                                  theme === 'dark' 
                                    ? 'bg-gray-800 text-gray-300' 
                                    : 'bg-gray-200 text-gray-700'
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                            {video.tags.length > 3 && (
                              <span className={`px-3 py-1 rounded-full text-xs ${
                                theme === 'dark' 
                                  ? 'bg-gray-800 text-gray-400' 
                                  : 'bg-gray-200 text-gray-600'
                              }`}>
                                +{video.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </motion.div>

                      {/* Video Thumbnail Column */}
                      <motion.div
                        initial={{ x: index % 2 === 0 ? 100 : -100, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        className={`${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'} cursor-pointer lg:w-1/2`}
                      >
                        <div 
                          className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
                          onClick={() => videoId && openVideoModal(videoId)}
                        >
                          {/* Thumbnail */}
                          <div className="relative aspect-video">
                            <img
                              src={thumbnail}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/video-placeholder.jpg';
                              }}
                            />
                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors duration-300">
                              <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/90 hover:bg-primary rounded-full flex items-center justify-center transition-colors duration-300">
                                <FaPlayCircle className="text-white text-3xl md:text-4xl" />
                              </div>
                            </div>
                          </div>
                          
                          {/* Views Count */}
                          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
                            theme === 'dark' 
                              ? 'bg-black/70 text-white' 
                              : 'bg-white/90 text-gray-800'
                          }`}>
                            👁️ {video.viewsCount || 0}
                          </div>
                          
                          {/* Category Badge */}
                          <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${
                            theme === 'dark' 
                              ? 'bg-primary/80 text-white' 
                              : 'bg-primary text-white'
                          }`}>
                            {video.category}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* No Videos Found */}
        {!loading && !error && videos.length === 0 && (
          <section className="py-20 px-4">
            <div className="container mx-auto text-center">
              <div className={`max-w-md mx-auto p-8 rounded-lg ${
                theme === 'dark' ? 'bg-surface/20 border border-border' : 'bg-surface border'
              }`}>
                <div className={`text-6xl mb-4 ${
                  theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  📹
                </div>
                <h3 className={`text-xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-text-primary'
                }`}>
                  ቪዲዮዎች አልተገኙም
                </h3>
                <p className={`mb-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-text-secondary'
                }`}>
                  በአሁኑ ጊዜ ምንም ቪዲዮዎች የሉም። ቆየት እንደገና ይሞክሩ።
                </p>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          onClick={closeVideoModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeVideoModal}
              className="absolute -top-10 right-0 text-white text-2xl hover:text-primary transition-colors duration-300 z-10"
            >
              ✕
            </button>
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&rel=0`}
                title="YouTube video player"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              ></iframe>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={closeVideoModal}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium text-sm transition-colors duration-300"
              >
                ዝጋ
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}