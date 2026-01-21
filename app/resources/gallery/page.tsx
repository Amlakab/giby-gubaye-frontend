'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { useTheme } from '@/lib/theme-context';
import { FaImages, FaEye, FaArrowLeft, FaArrowRight, FaUser, FaCalendar, FaTag } from 'react-icons/fa';
import api from '@/app/utils/api';

interface Resource {
  _id: string;
  title: string;
  description: string;
  type: 'image';
  status: 'approved';
  visibility: 'visible';
  category: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  tags: string[];
  isFeatured: boolean;
  viewsCount: number;
  downloadsCount: number;
  imageGallery?: Array<{
    _id: string;
    contentType: string;
    fileName: string;
    order: number;
    data?: any;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
  index: number;
}

// Helper function to decode MongoDB BSON format
const decodeMongoDBBinary = (binaryData: any): string => {
  try {
    if (!binaryData) return '';
    
    // Case 1: Already a string
    if (typeof binaryData === 'string') {
      return binaryData;
    }
    
    // Case 2: MongoDB BSON format with $binary
    if (binaryData && typeof binaryData === 'object' && binaryData.$binary && binaryData.$binary.base64) {
      const base64 = binaryData.$binary.base64;
      return base64.replace(/\s/g, '').replace(/\n/g, '');
    }
    
    // Case 3: Buffer object
    if (Buffer.isBuffer(binaryData)) {
      return binaryData.toString('base64');
    }
    
    // Case 4: Array data
    if (binaryData && Array.isArray(binaryData)) {
      return Buffer.from(binaryData).toString('base64');
    }
    
    // Case 5: Object with data array
    if (binaryData && binaryData.data && Array.isArray(binaryData.data)) {
      return Buffer.from(binaryData.data).toString('base64');
    }
    
    console.warn('Unknown binary data format:', typeof binaryData, binaryData);
    return '';
  } catch (error) {
    console.error('Error decoding binary data:', error);
    return '';
  }
};

// Helper function to get image URL from data
const getImageUrlFromData = (imageData: any, contentType: string = 'image/jpeg'): string => {
  try {
    const base64Data = decodeMongoDBBinary(imageData);
    
    if (!base64Data || base64Data.length < 50) {
      console.warn('Invalid or empty base64 data');
      return '';
    }
    
    const cleanBase64 = base64Data.replace(/\s/g, '').replace(/\n/g, '');
    return `data:${contentType};base64,${cleanBase64}`;
  } catch (error) {
    console.error('Error creating image URL:', error);
    return '';
  }
};

// Format date
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

export default function GalleryPage() {
  const { theme } = useTheme();
  const [galleries, setGalleries] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<LightboxImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeGallery, setActiveGallery] = useState<string | null>(null);

  // Fetch image galleries from backend
  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        setLoading(true);
        setError('');
        
        // First try the gallery-specific endpoint
        try {
          const response = await api.get('/resources/galleries', {
            params: {
              limit: 20,
              sortBy: 'createdAt',
              sortOrder: 'desc'
            }
          });
          
          if (response.data.success) {
            const galleryData = response.data.data.resources || [];
            console.log('Gallery endpoint response:', {
              count: galleryData.length,
              firstGallery: galleryData[0] ? {
                title: galleryData[0].title,
                imageCount: galleryData[0].imageGallery?.length || 0,
                hasData: galleryData[0].imageGallery?.[0]?.data ? true : false
              } : null
            });
            
            if (galleryData.length > 0) {
              setGalleries(galleryData);
            } else {
              // Fallback to public endpoint if gallery endpoint returns empty
              throw new Error('Gallery endpoint returned empty');
            }
          } else {
            throw new Error(response.data.message);
          }
        } catch (galleryError) {
          console.log('Gallery endpoint failed, trying public endpoint...', galleryError);
          
          // Fallback to public endpoint
          const fallbackResponse = await api.get('/resources/public', {
            params: {
              type: 'image',
              limit: 20,
              sortBy: 'createdAt',
              sortOrder: 'desc'
            }
          });
          
          if (fallbackResponse.data.success) {
            const galleryData = fallbackResponse.data.data.resources || [];
            console.log('Public endpoint response:', {
              count: galleryData.length,
              firstGallery: galleryData[0] ? {
                title: galleryData[0].title,
                hasImageGallery: !!galleryData[0].imageGallery,
                imageCount: galleryData[0].imageGallery?.length || 0
              } : null
            });
            
            setGalleries(galleryData);
            
            if (galleryData.length === 0) {
              setError('No image galleries found');
            }
          } else {
            setError(fallbackResponse.data.message || 'Failed to load galleries');
          }
        }
      } catch (error: any) {
        console.error('Error fetching galleries:', error);
        setError(error.response?.data?.message || 'Failed to load galleries. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGalleries();
  }, []);

  // Open lightbox for a specific gallery
  const openLightbox = (gallery: Resource) => {
    if (!gallery.imageGallery || gallery.imageGallery.length === 0) {
      alert('This gallery has no images');
      return;
    }

    const images: LightboxImage[] = [];
    
    gallery.imageGallery.forEach((img, index) => {
      if (img.data) {
        const src = getImageUrlFromData(img.data, img.contentType);
        if (src) {
          images.push({
            src,
            alt: `${gallery.title} - Image ${index + 1}`,
            caption: `${gallery.title} - Image ${index + 1}`,
            index
          });
        }
      }
    });

    if (images.length > 0) {
      setLightboxImages(images);
      setCurrentImageIndex(0);
      setActiveGallery(gallery._id);
      setLightboxOpen(true);
      document.body.style.overflow = 'hidden';
    } else {
      alert('No images available to display');
    }
  };

  // Get preview image URL for a gallery
  const getPreviewImageUrl = (gallery: Resource): string => {
    if (!gallery.imageGallery || gallery.imageGallery.length === 0) {
      return '';
    }
    
    const firstImage = gallery.imageGallery[0];
    if (firstImage.data) {
      const url = getImageUrlFromData(firstImage.data, firstImage.contentType);
      return url;
    }
    
    return '';
  };

  // Close lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImages([]);
    setActiveGallery(null);
    document.body.style.overflow = 'auto';
  };

  // Navigate lightbox
  const nextImage = () => {
    if (lightboxImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % lightboxImages.length);
    }
  };

  const prevImage = () => {
    if (lightboxImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-[#0a192f] to-[#112240] text-white' 
          : 'bg-gradient-to-br from-[#f0f0f0] to-[#ffffff] text-[#333333]'
      }`}>
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ffff] mb-4"></div>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-[#666666]'}`}>
              Loading galleries...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-[#0a192f] to-[#112240] text-white' 
        : 'bg-gradient-to-br from-[#f0f0f0] to-[#ffffff] text-[#333333]'
    }`}>
      <Navbar />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className={`py-12 px-4 ${
          theme === 'dark' ? 'bg-transparent' : 'bg-transparent'
        }`}>
          <div className="container mx-auto text-center">
            <h1 className={`text-3xl md:text-4xl font-bold mb-6 ${
              theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'
            }`}>
              Image Galleries
            </h1>
            <p className={`text-base max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-[#666666]'
            }`}>
              Browse through our collection of image galleries. Each gallery contains multiple images
              that you can view in full screen. Click on any gallery to explore its images.
            </p>
          </div>
        </section>

        {/* Gallery Sections */}
        {error && galleries.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'}`}>
              {error}
            </h2>
            <p className={`text-base ${theme === 'dark' ? 'text-gray-300' : 'text-[#666666]'}`}>
              Check back later for new image galleries.
            </p>
          </div>
        ) : galleries.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'}`}>
              No galleries available
            </h2>
            <p className={`text-base ${theme === 'dark' ? 'text-gray-300' : 'text-[#666666]'}`}>
              Check back later for new image galleries.
            </p>
          </div>
        ) : (
          galleries.map((gallery, index) => {
            const imageCount = gallery.imageGallery?.length || 0;
            const previewImageUrl = getPreviewImageUrl(gallery);

            return (
              <section
                key={gallery._id}
                className={`py-16 px-4 ${
                  index % 2 === 0 
                    ? (theme === 'dark' ? 'bg-transparent' : 'bg-transparent')
                    : (theme === 'dark' ? 'bg-[#0f172a80]' : 'bg-gray-50')
                }`}
              >
                <div className="container mx-auto">
                  {/* Section 1: Image on Right (index % 3 === 0) */}
                  {index % 3 === 0 ? (
                    <div className="flex flex-col lg:flex-row gap-12 items-center">
                      {/* Content Column */}
                      <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        className="w-full lg:w-1/2 text-center lg:text-left"
                      >
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                            theme === 'dark' 
                              ? 'bg-[#1e293b] text-gray-300' 
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            <FaImages className="text-xs" />
                            {imageCount} {imageCount === 1 ? 'image' : 'images'}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                            theme === 'dark' 
                              ? 'bg-[#1e293b] text-gray-300' 
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            <FaEye className="text-xs" />
                            {gallery.viewsCount || 0} views
                          </span>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                            gallery.category === 'Spiritual' 
                              ? (theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700')
                              : (theme === 'dark' ? 'bg-[#1e293b] text-gray-300' : 'bg-gray-200 text-gray-700')
                          }`}>
                            {gallery.category || 'Uncategorized'}
                          </span>
                        </div>
                        
                        <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${
                          theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'
                        }`}>
                          {gallery.title}
                        </h2>
                        
                        <p className={`text-base mb-8 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-[#666666]'
                        }`}>
                          {gallery.description}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center">
                          <button
                            onClick={() => openLightbox(gallery)}
                            className="inline-flex items-center justify-center px-6 py-3 bg-[#007bff] hover:bg-[#0056b3] text-white rounded-lg font-medium text-base transition-colors duration-300 shadow-lg hover:shadow-xl"
                          >
                            <FaEye className="mr-2" />
                            View Gallery ({imageCount} images)
                          </button>
                          
                          <div className={`text-sm flex items-center gap-3 ${theme === 'dark' ? 'text-gray-400' : 'text-[#666666]'}`}>
                            <span className="flex items-center gap-1">
                              <FaUser className="text-xs" />
                              {gallery.createdBy?.firstName} {gallery.createdBy?.lastName}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaCalendar className="text-xs" />
                              {formatDate(gallery.createdAt)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Tags */}
                        {gallery.tags && gallery.tags.length > 0 && (
                          <div className="mt-6 flex flex-wrap gap-2">
                            {gallery.tags.map((tag, tagIndex) => (
                              <span 
                                key={tagIndex}
                                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${
                                  theme === 'dark' 
                                    ? 'bg-[#2d3748] text-gray-300' 
                                    : 'bg-gray-200 text-gray-700'
                                }`}
                              >
                                <FaTag className="text-xs" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>

                      {/* Image Column */}
                      <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        className="w-full lg:w-1/2 flex justify-center"
                      >
                        <div 
                          onClick={() => openLightbox(gallery)}
                          className="relative w-full max-w-sm h-64 md:w-96 md:h-80 rounded-xl overflow-hidden shadow-xl cursor-pointer hover:scale-105 transition-transform duration-300 group"
                        >
                          {previewImageUrl ? (
                            <>
                              <img
                                src={previewImageUrl}
                                alt={gallery.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  console.error('Preview image failed to load for gallery:', gallery._id);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              {/* Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                  <div className="text-white text-sm font-medium mb-1">
                                    Click to view {imageCount} images
                                  </div>
                                  <div className="text-white/80 text-xs">
                                    {gallery.title}
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className={`w-full h-full flex flex-col items-center justify-center ${
                              theme === 'dark' ? 'bg-[#334155]' : 'bg-gray-200'
                            }`}>
                              <div className={`text-4xl mb-2 ${theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'}`}>
                                <FaImages />
                              </div>
                              <p className={`text-sm text-center px-2 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                {gallery.title}
                              </p>
                              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {imageCount} {imageCount === 1 ? 'image' : 'images'} • Click to view
                              </p>
                            </div>
                          )}
                          
                          {/* Image count badge */}
                          {previewImageUrl && (
                            <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                              {imageCount} {imageCount === 1 ? 'photo' : 'photos'}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  ) : null}

                  {/* Section 2: Text Only (index % 3 === 1) */}
                  {index % 3 === 1 ? (
                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 1 }}
                      viewport={{ once: true }}
                      className="max-w-3xl mx-auto text-center"
                    >
                      <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                          theme === 'dark' 
                            ? 'bg-[#1e293b] text-gray-300' 
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          <FaImages className="text-xs" />
                          {imageCount} {imageCount === 1 ? 'image' : 'images'}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                          gallery.category === 'Spiritual' 
                            ? (theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700')
                            : (theme === 'dark' ? 'bg-[#1e293b] text-gray-300' : 'bg-gray-200 text-gray-700')
                        }`}>
                          {gallery.category || 'Uncategorized'}
                        </span>
                      </div>
                      
                      <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${
                        theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'
                      }`}>
                        {gallery.title}
                      </h2>
                      
                      <p className={`text-base mb-8 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-[#666666]'
                      }`}>
                        {gallery.description}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        <button
                          onClick={() => openLightbox(gallery)}
                          className="inline-flex items-center justify-center px-6 py-3 bg-[#007bff] hover:bg-[#0056b3] text-white rounded-lg font-medium text-base transition-colors duration-300 shadow-lg hover:shadow-xl"
                        >
                          <FaEye className="mr-2" />
                          View Gallery ({imageCount} images)
                        </button>
                        
                        <div className={`text-sm flex items-center gap-3 ${theme === 'dark' ? 'text-gray-400' : 'text-[#666666]'}`}>
                          <span className="flex items-center gap-1">
                            <FaUser className="text-xs" />
                            {gallery.createdBy?.firstName} {gallery.createdBy?.lastName}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaCalendar className="text-xs" />
                            {formatDate(gallery.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaEye className="text-xs" />
                            {gallery.viewsCount || 0} views
                          </span>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      {gallery.tags && gallery.tags.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2 justify-center">
                          {gallery.tags.map((tag, tagIndex) => (
                            <span 
                              key={tagIndex}
                              className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${
                                theme === 'dark' 
                                  ? 'bg-[#2d3748] text-gray-300' 
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              <FaTag className="text-xs" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ) : null}

                  {/* Section 3: Image on Left (index % 3 === 2) */}
                  {index % 3 === 2 ? (
                    <div className="flex flex-col lg:flex-row gap-12 items-center">
                      {/* Image Column */}
                      <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        className="w-full lg:w-1/2 flex justify-center order-2 lg:order-1"
                      >
                        <div 
                          onClick={() => openLightbox(gallery)}
                          className="relative w-full max-w-sm h-64 md:w-96 md:h-80 rounded-xl overflow-hidden shadow-xl cursor-pointer hover:scale-105 transition-transform duration-300 group"
                        >
                          {previewImageUrl ? (
                            <>
                              <img
                                src={previewImageUrl}
                                alt={gallery.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  console.error('Preview image failed to load for gallery:', gallery._id);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              {/* Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                  <div className="text-white text-sm font-medium mb-1">
                                    Click to view {imageCount} images
                                  </div>
                                  <div className="text-white/80 text-xs">
                                    {gallery.title}
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className={`w-full h-full flex flex-col items-center justify-center ${
                              theme === 'dark' ? 'bg-[#334155]' : 'bg-gray-200'
                            }`}>
                              <div className={`text-4xl mb-2 ${theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'}`}>
                                <FaImages />
                              </div>
                              <p className={`text-sm text-center px-2 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                {gallery.title}
                              </p>
                              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {imageCount} {imageCount === 1 ? 'image' : 'images'} • Click to view
                              </p>
                            </div>
                          )}
                          
                          {/* Image count badge */}
                          {previewImageUrl && (
                            <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                              {imageCount} {imageCount === 1 ? 'photo' : 'photos'}
                            </div>
                          )}
                        </div>
                      </motion.div>

                      {/* Content Column */}
                      <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        className="w-full lg:w-1/2 text-center lg:text-left order-1 lg:order-2"
                      >
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                            theme === 'dark' 
                              ? 'bg-[#1e293b] text-gray-300' 
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            <FaImages className="text-xs" />
                            {imageCount} {imageCount === 1 ? 'image' : 'images'}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                            theme === 'dark' 
                              ? 'bg-[#1e293b] text-gray-300' 
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            <FaEye className="text-xs" />
                            {gallery.viewsCount || 0} views
                          </span>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                            gallery.category === 'Spiritual' 
                              ? (theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700')
                              : (theme === 'dark' ? 'bg-[#1e293b] text-gray-300' : 'bg-gray-200 text-gray-700')
                          }`}>
                            {gallery.category || 'Uncategorized'}
                          </span>
                        </div>
                        
                        <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${
                          theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'
                        }`}>
                          {gallery.title}
                        </h2>
                        
                        <p className={`text-base mb-8 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-[#666666]'
                        }`}>
                          {gallery.description}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center">
                          <button
                            onClick={() => openLightbox(gallery)}
                            className="inline-flex items-center justify-center px-6 py-3 bg-[#007bff] hover:bg-[#0056b3] text-white rounded-lg font-medium text-base transition-colors duration-300 shadow-lg hover:shadow-xl"
                          >
                            <FaEye className="mr-2" />
                            View Gallery ({imageCount} images)
                          </button>
                          
                          <div className={`text-sm flex items-center gap-3 ${theme === 'dark' ? 'text-gray-400' : 'text-[#666666]'}`}>
                            <span className="flex items-center gap-1">
                              <FaUser className="text-xs" />
                              {gallery.createdBy?.firstName} {gallery.createdBy?.lastName}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaCalendar className="text-xs" />
                              {formatDate(gallery.createdAt)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Tags */}
                        {gallery.tags && gallery.tags.length > 0 && (
                          <div className="mt-6 flex flex-wrap gap-2">
                            {gallery.tags.map((tag, tagIndex) => (
                              <span 
                                key={tagIndex}
                                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${
                                  theme === 'dark' 
                                    ? 'bg-[#2d3748] text-gray-300' 
                                    : 'bg-gray-200 text-gray-700'
                                }`}
                              >
                                <FaTag className="text-xs" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </div>
                  ) : null}
                </div>
              </section>
            );
          })
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && lightboxImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
          <div className="relative w-full h-full flex flex-col">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-3 rounded-full bg-black/70 hover:bg-black/90 text-white transition-all duration-200 hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation buttons */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full bg-black/70 hover:bg-black/90 text-white transition-all duration-200 hover:scale-110"
            >
              <FaArrowLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full bg-black/70 hover:bg-black/90 text-white transition-all duration-200 hover:scale-110"
            >
              <FaArrowRight className="w-6 h-6" />
            </button>

            {/* Image display */}
            <div className="flex-1 flex items-center justify-center p-4">
              {lightboxImages[currentImageIndex] && (
                <div className="relative max-w-6xl max-h-full">
                  <img
                    src={lightboxImages[currentImageIndex].src}
                    alt={lightboxImages[currentImageIndex].alt}
                    className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
                    onError={(e) => {
                      console.error('Lightbox image failed to load');
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  
                  {/* Image info */}
                  <div className="mt-4 text-center">
                    <p className="text-white text-lg font-medium">
                      {lightboxImages[currentImageIndex].caption}
                    </p>
                    <p className="text-gray-300 text-sm mt-1">
                      Image {currentImageIndex + 1} of {lightboxImages.length}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Image counter and thumbnails */}
            <div className="p-4 bg-black/70">
              <div className="text-center text-white mb-3 text-lg font-medium">
                {currentImageIndex + 1} / {lightboxImages.length}
              </div>
              
              {/* Thumbnails */}
              <div className="flex overflow-x-auto gap-3 justify-center pb-2">
                {lightboxImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === currentImageIndex 
                        ? 'border-[#00ffff] scale-110' 
                        : 'border-transparent hover:border-white hover:scale-105'
                    }`}
                  >
                    <img
                      src={img.src}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center bg-gray-800 text-white text-xs">
                            Error
                          </div>
                        `;
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}