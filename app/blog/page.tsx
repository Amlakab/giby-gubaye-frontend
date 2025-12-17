'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { useTheme } from '@/lib/theme-context';

// Import blog images
const blogImages = [
  {
    id: 1,
    link: '/news1',
    src: '/images/image22.jpg',
    description: "INSA's headquarters in Addis Ababa, inaugurated in April 2021. The facility comprises six blocks of 14 and 17-story buildings, constructed at a cost of 2.1 billion birr.",
  },
  {
    id: 2,
    link: '/news2',
    src: '/images/image23.jpg',
    description: "INSA's cybersecurity operations center, where over 6,700 cyberattack attempts were thwarted in a 12-month period.",
  },
  {
    id: 3,
    link: '/news3',
    src: '/images/image21.jpg',
    description: "INSA's collaboration with the Adama City Administration to bolster cybersecurity measures within the city's digital infrastructure.",
  },
  {
    id: 4,
    link: '/news4',
    src: '/images/image23.jpg',
    description: "INSA's Public Key Infrastructure (PKI) launch in September 2024, marking a significant advancement in Ethiopia's digital security framework.",
  },
  {
    id: 5,
    link: '/news5',
    src: '/images/image22.jpg',
    description: "INSA's participation in the Digital Public Goods Alliance (DPGA), reflecting its commitment to promoting digital public goods.",
  },
  {
    id: 6,
    link: '/news6',
    src: '/images/image21.jpg',
    description: "INSA's training programs for government employees, IT professionals, and university students to strengthen Ethiopia's cybersecurity workforce.",
  },
  {
    id: 7,
    link: '/news7',
    src: '/images/image23.jpg',
    description: "INSA's efforts in developing a national digital identity system as part of the Digital Ethiopia 2025 Strategy.",
  },
  {
    id: 8,
    link: '/news8',
    src: '/images/image22.jpg',
    description: "INSA's cybersecurity awareness campaigns, educating the public and organizations about safe online practices.",
  },
  {
    id: 9,
    link: '/news9',
    src: '/images/image21.jpg',
    description: "INSA's collaboration with international partners to enhance Ethiopia's cyber defenses and share threat intelligence.",
  },
  {
    id: 10,
    link: '/news10',
    src: '/images/image23.jpg',
    description: "INSA's research and development initiatives to address emerging cybersecurity threats, including AI-driven cyberattacks.",
  },
  {
    id: 11,
    link: '/news11',
    src: '/images/image22.jpg',
    description: "INSA's incident response team (IRT) investigating and mitigating cyber incidents across Ethiopia.",
  },
  {
    id: 12,
    link: '/news12',
    src: '/images/image21.jpg',
    description: "INSA's efforts in developing and implementing national cybersecurity policies and legal frameworks.",
  },
  {
    id: 13,
    link: '/news13',
    src: '/images/image23.jpg',
    description: "INSA's role in protecting Ethiopia's critical information infrastructure from cyber threats.",
  },
  {
    id: 14,
    link: '/news14',
    src: '/images/image22.jpg',
    description: "INSA's collaboration with Ethio Telecom to monitor and secure Ethiopia's telecommunications infrastructure.",
  },
  {
    id: 15,
    link: '/news15',
    src: '/images/image21.jpg',
    description: "INSA's public awareness campaigns on cybersecurity, including workshops and training sessions.",
  },
  {
    id: 16,
    link: '/news16',
    src: '/images/image23.jpg',
    description: "INSA's efforts in fostering national and international partnerships to strengthen Ethiopia's cybersecurity ecosystem.",
  },
  {
    id: 17,
    link: '/news17',
    src: '/images/image22.jpg',
    description: "INSA's focus on institutional excellence to effectively address cybersecurity challenges.",
  },
  {
    id: 18,
    link: '/news18',
    src: '/images/image21.jpg',
    description: "INSA's role in ensuring Ethiopia's ownership of knowledge and technology in the cybersecurity domain.",
  },
];

// Function to determine description position
const getDescriptionPosition = (index: number): 'top' | 'bottom' => {
  return index % 2 === 0 ? 'top' : 'bottom';
};

export default function BlogPage() {
  const { theme } = useTheme();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-[#0a192f] to-[#112240] text-white' 
        : 'bg-background text-text-primary'
    }`}>
      <Navbar />
      
      <div className="pt-16">
        {/* Blog Overview Section */}
        <section className={`py-16 px-4 ${
          theme === 'dark' ? 'bg-transparent' : 'bg-background'
        }`}>
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Column */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
              >
                <h1 className={`text-3xl md:text-4xl font-bold mb-6 ${
                  theme === 'dark' ? 'text-primary' : 'text-primary'
                }`}>
                  Welcome to the INSA Blog
                </h1>
                <p className={`text-base ${
                  theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                } mb-4`}>
                  The <strong className="text-secondary">Information Network Security Administration (INSA)</strong> is Ethiopia's governmental agency responsible for safeguarding the nation's information and information infrastructure. Established in 1999 under Council of Ministers Regulation No. 130/1999, INSA's primary mission is to protect Ethiopia's digital assets and ensure cybersecurity across various sectors.
                </p>
              </motion.div>

              {/* Right Column */}
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
              >
                <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${
                  theme === 'dark' ? 'text-primary' : 'text-primary'
                }`}>
                  Recent Developments
                </h2>
                <p className={`text-base ${
                  theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                }`}>
                  INSA has been at the forefront of Ethiopia's digital transformation. Recent initiatives include joining the Digital Public Goods Alliance (DPGA), signing a Memorandum of Understanding (MoU) with the Adama City Administration, and thwarting over 6,700 cyberattack attempts in a 12-month period.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Image Grid Sections */}
        {[0, 1].map((sectionIndex) => (
          <section
            key={sectionIndex}
            className={`py-16 px-4 ${
              sectionIndex % 2 === 0 
                ? (theme === 'dark' ? 'bg-surface/20' : 'bg-surface')
                : (theme === 'dark' ? 'bg-transparent' : 'bg-background')
            }`}
          >
            <div className="container mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogImages.slice(sectionIndex * 9, (sectionIndex + 1) * 9).map((image, index) => {
                  const descriptionPosition = getDescriptionPosition(index);
                  return (
                    <motion.div
                      key={image.id}
                      initial={{ y: 50, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5 }}
                      className="group"
                    >
                      <Link 
                        href={image.link} 
                        className="block no-underline"
                      >
                        <div className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${
                          theme === 'dark' 
                            ? 'bg-surface/30 backdrop-blur-sm' 
                            : 'bg-surface'
                        }`}>
                          {/* Description above image */}
                          {descriptionPosition === 'top' && (
                            <div className="p-4">
                              <p className={`text-sm ${
                                theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                              }`}>
                                {image.description}
                              </p>
                            </div>
                          )}

                          {/* Image */}
                          <div className="relative h-48">
                            <Image
                              src={image.src}
                              alt={`INSA Blog ${image.id}`}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>

                          {/* Description below image */}
                          {descriptionPosition === 'bottom' && (
                            <div className="p-4">
                              <p className={`text-sm ${
                                theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                              }`}>
                                {image.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        ))}

        {/* Key Focus Areas Section */}
        <section className={`py-16 px-4 ${
          theme === 'dark' ? 'bg-surface/20' : 'bg-surface'
        }`}>
          <div className="container mx-auto">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <h2 className={`text-3xl font-bold mb-8 ${
                theme === 'dark' ? 'text-primary' : 'text-primary'
              }`}>
                Key Focus Areas
              </h2>
              <p className={`text-base mb-6 ${
                theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
              }`}>
                INSA focuses on five primary areas to ensure Ethiopia's cybersecurity:
              </p>
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${
                theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                    <span className="text-primary text-sm">1</span>
                  </div>
                  <span>Knowledge and Technology Ownership</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                    <span className="text-primary text-sm">2</span>
                  </div>
                  <span>Institutional Excellence</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                    <span className="text-primary text-sm">3</span>
                  </div>
                  <span>Infrastructure Protection</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                    <span className="text-primary text-sm">4</span>
                  </div>
                  <span>Partnerships and Cooperation</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                    <span className="text-primary text-sm">5</span>
                  </div>
                  <span>Policy and Legal Frameworks</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}