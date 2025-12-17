import Link from "next/link";
import { motion } from "framer-motion";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaMapMarker, FaPhone, FaEnvelope, FaBook, FaMusic, FaChartLine, FaUsers, FaHandsHelping, FaTools, FaHome, FaInfoCircle, FaBlog, FaAddressBook } from "react-icons/fa";

const Footer: React.FC = () => {
  const services = [
    { icon: <FaBook />, title: "ትምህርት ክፍል", link: "/services#education-department" },
    { icon: <FaMusic />, title: "መዝሙር እና ስነ-ጥበባት ክፍል", link: "/services#music-arts" },
    { icon: <FaChartLine />, title: "ልማት ክፍል", link: "/services#development-department" },
    { icon: <FaUsers />, title: "አባላት ጉዳይ ክፍል", link: "/services#members-affairs" },
    { icon: <FaHandsHelping />, title: "ባችና ዲፓርትመንት", link: "/services#bachna-department" },
    { icon: <FaTools />, title: "ሙያና ተራዲኦ ክፍል", link: "/services#technical-traditional" },
  ];

  const quickLinks = [
    { icon: <FaHome />, title: "Home", href: "/" },
    { icon: <FaInfoCircle />, title: "About", href: "/about" },
    { icon: <FaBook />, title: "Services", href: "/services" },
    { icon: <FaBlog />, title: "Blog", href: "/blog" },
    { icon: <FaAddressBook />, title: "Contact Us", href: "/contact" },
  ];

  const contactInfo = [
    { icon: <FaMapMarker />, text: "Location", detail: "Addis Ababa, Ethiopia" },
    { icon: <FaPhone />, text: "Phone", detail: "+251 9 12 43 65 73" },
    { icon: <FaEnvelope />, text: "Email", detail: "info@example.com" },
  ];

  const socialLinks = [
    { icon: <FaFacebook />, href: "https://facebook.com" },
    { icon: <FaTwitter />, href: "https://twitter.com" },
    { icon: <FaLinkedin />, href: "https://linkedin.com" },
    { icon: <FaInstagram />, href: "https://instagram.com" },
  ];

  return (
    <footer className="bg-black text-white py-8 border-t border-[#00ffff]">
      <div className="container mx-auto px-4">
        {/* Main Footer Content - Single Row with Columns */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          
          {/* Column 1: Logo & About */}
          <div className="lg:w-1/4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl font-bold text-[#00ffff] mb-4">ቴ/ግ/ጉ</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                በኢ/ኦ/ተ/ቤተ ክርስቲያን በሰ/ት/ቤቶች ማደራጃ መምሪያ ማኅበረ ቅዱሳን ከተመሰረተበት
                ጊዜ ጀምሮ የከፍተኛ ትምህርት ተቋማት ተማሪዎች መንፈሳዊ አገልግሎታቸውን
                ወጥነት ባለውና በተቀላጠፈ መልኩ ለመተግበር ያስችላቸው ዘንድ ራሱን የቻለ የግቢ
                ጉባኤያት መመሪያ ተዘጋጅተው የቀረቡ ስራዎች ዝርዝር ፦
              </p>
              
              {/* Newsletter Subscription */}
              <div className="mt-6">
                <h4 className="text-lg font-bold text-[#00ffff] mb-3">ሚዛን ቴፒ</h4>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter Your Email"
                    className="w-full px-4 py-2 bg-gray-900 border border-[#00ffff]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ffff] text-white placeholder-gray-400 text-sm"
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-4 py-2 bg-gradient-to-r from-[#00ffff] to-cyan-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity text-sm"
                  >
                    Subscribe
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Column 2: Our Services */}
          <div className="lg:w-1/4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h4 className="text-xl font-bold text-[#00ffff] mb-4">Our Services</h4>
              <div className="space-y-3">
                {services.map((service, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 10 }}
                    className="flex items-center gap-3"
                  >
                    <div className="text-[#00ffff]">
                      {service.icon}
                    </div>
                    <Link
                      href={service.link}
                      className="text-gray-300 hover:text-[#00ffff] transition-colors text-sm"
                    >
                      {service.title}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Column 3: Quick Links */}
          <div className="lg:w-1/4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className="text-xl font-bold text-[#00ffff] mb-4">Quick Links</h4>
              <div className="space-y-3">
                {quickLinks.map((link, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 10 }}
                    className="flex items-center gap-3"
                  >
                    <div className="text-[#00ffff]">
                      {link.icon}
                    </div>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-[#00ffff] transition-colors text-sm"
                    >
                      {link.title}
                    </Link>
                  </motion.div>
                ))}
                
                {/* Important Link */}
                <motion.div
                  whileHover={{ x: 10 }}
                  className="pt-4 mt-4 border-t border-gray-700"
                >
                  <h5 className="text-[#00ffff] font-bold mb-2">Important Link</h5>
                  <a
                    href="https://eotcmk.org/a/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-[#00ffff] transition-colors text-sm"
                  >
                    mahber kidusan
                  </a>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Column 4: Contact Info & Social */}
          <div className="lg:w-1/4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h4 className="text-xl font-bold text-[#00ffff] mb-4">Contact Info</h4>
              <div className="space-y-3 mb-6">
                {contactInfo.map((contact, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 10 }}
                    className="flex items-start gap-3"
                  >
                    <div className="text-[#00ffff] mt-1">
                      {contact.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-300 text-sm">{contact.text}</p>
                      <p className="text-gray-400 text-sm">{contact.detail}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Social Media */}
              <div>
                <h4 className="text-xl font-bold text-[#00ffff] mb-4">Follow Us</h4>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.2, y: -3 }}
                      className="text-[#00ffff] hover:opacity-80 transition-opacity"
                    >
                      <span className="text-2xl">{social.icon}</span>
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Copyright & Bottom Links */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="pt-8 border-t border-gray-700"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} All Rights Reserved
            </p>
            
            <div className="flex gap-6">
              <Link href="/termsofservice" className="text-gray-400 hover:text-[#00ffff] transition-colors text-sm">
                Terms of Service
              </Link>
              <Link href="/privacypolicy" className="text-gray-400 hover:text-[#00ffff] transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="/contact-us" className="text-gray-400 hover:text-[#00ffff] transition-colors text-sm">
                Contact
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;