'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { useTheme } from '@/lib/theme-context';
import { FaDownload } from 'react-icons/fa';
import api from '@/app/utils/api';

interface Resource {
  _id: string;
  title: string;
  description: string;
  type: 'document';
  status: 'approved';
  visibility: 'visible';
  category: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  tags: string[];
  isFeatured: boolean;
  viewsCount: number;
  downloadsCount: number;
  previewImageData?: {
    data: any;
    contentType: string;
    fileName: string;
  };
  downloadLink?: string;
  createdAt: string;
  updatedAt: string;
}

// Helper function to decode MongoDB BSON format
const decodeMongoDBBinary = (binaryData: any): string => {
  try {
    // If it's already a string (from API response after JSON.stringify)
    if (typeof binaryData === 'string') {
      return binaryData;
    }
    
    // If it's a Buffer object
    if (binaryData && binaryData.type === 'Buffer' && Array.isArray(binaryData.data)) {
      return Buffer.from(binaryData.data).toString('base64');
    }
    
    // If it's MongoDB BSON format with $binary
    if (binaryData && binaryData.$binary && binaryData.$binary.base64) {
      return binaryData.$binary.base64;
    }
    
    // If it's the actual Binary object
    if (binaryData && binaryData._bsontype === 'Binary') {
      return binaryData.buffer.toString('base64');
    }
    
    console.log('Unknown binary format:', binaryData);
    return '';
  } catch (error) {
    console.error('Error decoding binary data:', error);
    return '';
  }
};

// Helper function to get image URL from resource
const getDocumentImageUrl = (document: Resource): string => {
  if (document.previewImageData && document.previewImageData.data) {
    try {
      const base64Data = decodeMongoDBBinary(document.previewImageData.data);
      
      if (base64Data) {
        const contentType = document.previewImageData.contentType || 'image/jpeg';
        return `data:${contentType};base64,${base64Data}`;
      }
    } catch (error) {
      console.error('Error creating image URL:', error);
    }
  }
  return '';
};

export default function DocumentPage() {
  const { theme } = useTheme();
  const [documents, setDocuments] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  // Fetch documents from backend
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        
        const response = await api.get('/resources/public', {
          params: {
            type: 'document',
            status: 'approved',
            visibility: 'visible',
            limit: 20
          }
        });
        
        if (response.data.success) {
          const docs = response.data.data.resources || [];
          console.log('Fetched documents:', docs);
          console.log('First document structure:', docs[0]);
          
          setDocuments(docs);
          
          if (docs.length === 0) {
            setError('No documents found');
          }
        } else {
          setError(response.data.message || 'Failed to load documents');
        }
      } catch (error: any) {
        console.error('Error fetching documents:', error);
        setError(error.response?.data?.message || 'Failed to load documents. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Handle document download
  const handleDownload = async (documentId: string, title: string) => {
    try {
      setDownloading(documentId);
      
      const response = await api.get(`/resources/${documentId}/document`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Refresh document list to update download count
      setTimeout(async () => {
        try {
          const updatedResponse = await api.get('/resources/public', {
            params: {
              type: 'document',
              status: 'approved',
              visibility: 'visible',
              limit: 20
            }
          });
          
          if (updatedResponse.data.success) {
            setDocuments(updatedResponse.data.data.resources || []);
          }
        } catch (refreshError) {
          console.warn('Could not refresh documents:', refreshError);
        }
      }, 1000);
      
    } catch (error: any) {
      console.error('Download failed:', error);
      setError('Failed to download document. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

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
              Loading documents...
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
        {/* Document Sections */}
        {documents.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'}`}>
              {error || 'No documents available'}
            </h2>
            <p className={`text-base ${theme === 'dark' ? 'text-gray-300' : 'text-[#666666]'}`}>
              Check back later for new documents.
            </p>
          </div>
        ) : (
          documents.map((doc, index) => {
            const imageUrl = getDocumentImageUrl(doc);
            
            return (
              <section
                key={doc._id}
                className={`py-16 px-4 ${
                  index % 2 === 0 
                    ? (theme === 'dark' ? 'bg-transparent' : 'bg-transparent')
                    : (theme === 'dark' ? 'bg-[#0f172a80]' : 'bg-gray-50')
                }`}
              >
                <div className="container mx-auto">
                  {/* First Section: Image on Right (index % 3 === 0) */}
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
                        <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${
                          theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'
                        }`}>
                          {doc.title}
                        </h2>
                        <p className={`text-base mb-8 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-[#666666]'
                        }`}>
                          {doc.description}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                          <button
                            onClick={() => handleDownload(doc._id, doc.title)}
                            disabled={downloading === doc._id}
                            className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-base transition-colors duration-300 ${
                              downloading === doc._id
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-[#007bff] hover:bg-[#0056b3] text-white'
                            }`}
                          >
                            {downloading === doc._id ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Downloading...
                              </>
                            ) : (
                              <>
                                <FaDownload className="mr-2" />
                                Download PDF
                              </>
                            )}
                          </button>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-[#666666]'}`}>
                            {doc.downloadsCount || 0} downloads • {doc.viewsCount || 0} views
                          </div>
                        </div>
                      </motion.div>

                      {/* Image Column */}
                      <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        className="w-full lg:w-1/2 flex justify-center"
                      >
                        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-xl overflow-hidden shadow-xl">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={doc.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                // Show fallback
                                target.parentElement!.innerHTML = `
                                  <div class="w-full h-full flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-[#334155]' : 'bg-gray-200'}">
                                    <div class="text-4xl mb-2 ${theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'}">📄</div>
                                    <div class="text-sm text-center px-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}">${doc.title.substring(0, 50)}${doc.title.length > 50 ? '...' : ''}</div>
                                  </div>
                                `;
                              }}
                            />
                          ) : (
                            <div className={`w-full h-full flex flex-col items-center justify-center ${
                              theme === 'dark' ? 'bg-[#334155]' : 'bg-gray-200'
                            }`}>
                              <div className={`text-4xl mb-2 ${theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'}`}>
                                📄
                              </div>
                              <p className={`text-sm text-center px-2 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                {doc.title.substring(0, 50)}{doc.title.length > 50 ? '...' : ''}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  ) : null}

                  {/* Second Section: No Image (index % 3 === 1) */}
                  {index % 3 === 1 ? (
                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 1 }}
                      viewport={{ once: true }}
                      className="max-w-3xl mx-auto text-center"
                    >
                      <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${
                        theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'
                      }`}>
                        {doc.title}
                      </h2>
                      <p className={`text-base mb-8 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-[#666666]'
                      }`}>
                        {doc.description}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={() => handleDownload(doc._id, doc.title)}
                          disabled={downloading === doc._id}
                          className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-base transition-colors duration-300 ${
                            downloading === doc._id
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-[#007bff] hover:bg-[#0056b3] text-white'
                          }`}
                        >
                          {downloading === doc._id ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Downloading...
                            </>
                          ) : (
                            <>
                              <FaDownload className="mr-2" />
                              Download PDF
                            </>
                          )}
                        </button>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-[#666666]'}`}>
                          {doc.downloadsCount || 0} downloads • {doc.viewsCount || 0} views
                        </div>
                      </div>
                    </motion.div>
                  ) : null}

                  {/* Third Section: Image on Left (index % 3 === 2) */}
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
                        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-xl overflow-hidden shadow-xl">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={doc.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                // Show fallback
                                target.parentElement!.innerHTML = `
                                  <div class="w-full h-full flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-[#334155]' : 'bg-gray-200'}">
                                    <div class="text-4xl mb-2 ${theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'}">📄</div>
                                    <div class="text-sm text-center px-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}">${doc.title.substring(0, 50)}${doc.title.length > 50 ? '...' : ''}</div>
                                  </div>
                                `;
                              }}
                            />
                          ) : (
                            <div className={`w-full h-full flex flex-col items-center justify-center ${
                              theme === 'dark' ? 'bg-[#334155]' : 'bg-gray-200'
                            }`}>
                              <div className={`text-4xl mb-2 ${theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'}`}>
                                📄
                              </div>
                              <p className={`text-sm text-center px-2 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                {doc.title.substring(0, 50)}{doc.title.length > 50 ? '...' : ''}
                              </p>
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
                        <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${
                          theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'
                        }`}>
                          {doc.title}
                        </h2>
                        <p className={`text-base mb-8 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-[#666666]'
                        }`}>
                          {doc.description}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                          <button
                            onClick={() => handleDownload(doc._id, doc.title)}
                            disabled={downloading === doc._id}
                            className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-base transition-colors duration-300 ${
                              downloading === doc._id
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-[#007bff] hover:bg-[#0056b3] text-white'
                            }`}
                          >
                            {downloading === doc._id ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Downloading...
                              </>
                            ) : (
                              <>
                                <FaDownload className="mr-2" />
                                Download PDF
                              </>
                            )}
                          </button>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-[#666666]'}`}>
                            {doc.downloadsCount || 0} downloads • {doc.viewsCount || 0} views
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  ) : null}
                </div>
              </section>
            );
          })
        )}
      </div>

      <Footer />
    </div>
  );
}