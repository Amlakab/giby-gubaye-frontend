'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  FiSearch, FiBell, FiRefreshCw, FiSettings, 
  FiLogOut, FiUser, FiX, FiCheck, FiEye, FiEyeOff
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useNotification } from '@/app/contexts/NotificationContext';
import { useRouter } from 'next/navigation';

interface User {
  _id?: string;
  name: string;
  email: string;
  username: string;
  role: string;
  avatar?: string;
}

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
  onMenuClick?: () => void; // Alias for onToggleSidebar
  isSidebarCollapsed?: boolean; // For compatibility
}

export default function AdminHeader({ 
  onToggleSidebar, 
  onMenuClick,
  showSidebarToggle = true,
  isSidebarCollapsed
}: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [autoShowNotifications, setAutoShowNotifications] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);
  
  const router = useRouter();
  const { 
    notifications, 
    unreadCount,
    isLoading: isLoadingNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  } = useNotification();

  // Get current user from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser({
            _id: parsedUser._id,
            name: parsedUser.name || "Guest",
            email: parsedUser.email || "",
            username: parsedUser.username || parsedUser.email?.split('@')[0] || "guest",
            role: parsedUser.role || "user",
            avatar: parsedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(parsedUser.name || parsedUser.email?.split('@')[0] || "Guest")}&background=3c8dbc&color=fff`
          });
        } catch (err) {
          console.error('Failed to parse user data', err);
          setCurrentUser({
            name: "Guest",
            email: "",
            username: "guest",
            role: "user",
            avatar: "https://ui-avatars.com/api/?name=Guest&background=3c8dbc&color=fff"
          });
        }
      }
    }
  }, []);

  // Filter notifications by current user's role
  const filteredNotifications = notifications.filter(
    notification => 
      // Admin sees all notifications, others see only their role
      currentUser?.role === 'admin' || 
      notification.role === currentUser?.role
  );

  // Filter unread notifications for auto-show
  const unreadNotifications = filteredNotifications.filter(
    notification => !notification.read
  );

  // Initialize notification sound
  useEffect(() => {
    if (typeof window !== 'undefined') {
      notificationSoundRef.current = new Audio('/notification.mp3');
    }
    return () => {
      if (notificationSoundRef.current) {
        notificationSoundRef.current.pause();
        notificationSoundRef.current = null;
      }
    };
  }, []);

  // Auto-show notifications when new ones arrive
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (unreadNotifications.length > 0 && !isNotificationsOpen) {
      // Play notification sound
      if (notificationSoundRef.current) {
        notificationSoundRef.current.currentTime = 0;
        notificationSoundRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
      
      setAutoShowNotifications(true);
      
      // Hide after 15 seconds
      timer = setTimeout(() => {
        setAutoShowNotifications(false);
      }, 15000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [unreadNotifications.length, isNotificationsOpen]);

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
        setAutoShowNotifications(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshedToken');
    router.push('/auth/login');
  };

  const handleHideAllNotifications = () => {
    setAutoShowNotifications(false);
  };

  // Format role display name
  const formatRoleName = (role: string) => {
    const roleMap: Record<string, string> = {
      'user': 'User',
      'disk-user': 'Disk User',
      'spinner-user': 'Spinner User',
      'accountant': 'Accountant',
      'admin': 'Administrator',
      'Abalat-Guday': 'Abalat Guday',
      'Mezmur': 'Mezmur',
      'Timhrt': 'Timhrt',
      'Muyana-Terado': 'Muyana Terado',
      'Priesedant': 'President',
      'Vice-Priesedant': 'Vice President',
      'Secretary': 'Secretary',
      'Bachna-Department': 'Bachna Department',
      'Audite': 'Audite',
      'Limat': 'Limat'
    };
    return roleMap[role] || role;
  };

  // Handle menu click (for mobile)
  const handleMenuClick = () => {
    if (onMenuClick) {
      onMenuClick();
    } else if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  return (
    <header className="
      bg-white shadow-sm py-3 px-6 flex items-center justify-between sticky top-0 z-40
      dark:bg-gray-900 dark:border-gray-700
    ">
      <div className="flex items-center space-x-4">
        {showSidebarToggle && (
          <button 
            onClick={handleMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 lg:hidden dark:hover:bg-gray-800 dark:text-gray-300"
            aria-label="Toggle sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        
        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full
                     dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Refresh Notifications Button */}
        <motion.button
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
          onClick={() => refreshNotifications()}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 dark:hover:bg-gray-800 dark:text-gray-300"
          aria-label="Refresh notifications"
        >
          <FiRefreshCw className="h-5 w-5" />
        </motion.button>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 relative dark:hover:bg-gray-800 dark:text-gray-300"
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setAutoShowNotifications(false);
            }}
            aria-label="Notifications"
          >
            <FiBell className="h-5 w-5" />
            {!isLoadingNotifications && unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-0 right-0 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center transform -translate-y-1/2 translate-x-1/2"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </motion.button>

          {/* Auto-show notifications panel */}
          <AnimatePresence>
            {autoShowNotifications && !isNotificationsOpen && unreadNotifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-80 z-50"
              >
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                  {/* Hide All button */}
                  <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                    <button
                      onClick={handleHideAllNotifications}
                      className="w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center justify-center
                               dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <FiEyeOff className="mr-2 h-4 w-4" />
                      Hide All
                    </button>
                  </div>

                  {/* Notification list */}
                  <div className="max-h-64 overflow-y-auto">
                    {unreadNotifications.slice(0, 3).map((notification) => (
                      <motion.div
                        key={notification._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100
                                 dark:hover:bg-gray-700 dark:border-gray-700"
                        onClick={async () => {
                          await markAsRead(notification._id);
                          router.push(notification.link);
                          setAutoShowNotifications(false);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2 dark:text-gray-200">
                            {notification.message}
                          </p>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await markAsRead(notification._id);
                            }}
                            className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <FiCheck className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatRoleName(notification.role)}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(notification.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {unreadNotifications.length > 3 && (
                    <div className="p-3 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => {
                          setIsNotificationsOpen(true);
                          setAutoShowNotifications(false);
                        }}
                        className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium
                                 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View all {unreadNotifications.length} notifications
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Full notifications dropdown */}
          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden
                         dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Notifications
                      {currentUser?.role !== 'admin' && (
                        <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                          ({formatRoleName(currentUser?.role || 'user')})
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed
                                 dark:text-blue-400 dark:hover:text-blue-300"
                        disabled={unreadCount === 0}
                      >
                        Mark all read
                      </button>
                      <button
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <FiX className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-y-auto max-h-[60vh]">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <FiBell className="h-12 w-12 text-gray-300 mx-auto mb-4 dark:text-gray-600" />
                      <p className="text-gray-500 dark:text-gray-400">No notifications</p>
                      {currentUser?.role !== 'admin' && (
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                          You'll see notifications here for the {formatRoleName(currentUser?.role || 'user')} role
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      {filteredNotifications.map((notification) => (
                        <motion.div
                          key={notification._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100
                                   dark:hover:bg-gray-700 dark:border-gray-700 ${
                            notification.read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-800'
                          }`}
                          onClick={async () => {
                            await markAsRead(notification._id);
                            router.push(notification.link);
                            setIsNotificationsOpen(false);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className={`font-medium ${notification.read ? 'text-gray-700 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                {notification.message}
                              </p>
                              <div className="mt-1 flex items-center space-x-3">
                                {currentUser?.role === 'admin' && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800
                                                   dark:bg-blue-900 dark:text-blue-300">
                                    {formatRoleName(notification.role)}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </span>
                                {notification.creator && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    By: {notification.creator.name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-2">
                              {!notification.read && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await markAsRead(notification._id);
                                  }}
                                  className="text-gray-400 hover:text-gray-600 p-1 dark:hover:text-gray-300"
                                  title="Mark as read"
                                >
                                  <FiCheck className="h-4 w-4" />
                                </button>
                              )}
                              {currentUser?.role === 'admin' && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    // Delete notification logic here
                                  }}
                                  className="text-gray-400 hover:text-red-600 p-1 dark:hover:text-red-400"
                                  title="Delete notification"
                                >
                                  <FiX className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {filteredNotifications.length > 0 && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                    <Link
                      href="/admin/notifications"
                      className="block text-center text-blue-600 hover:text-blue-800 font-medium
                               dark:text-blue-400 dark:hover:text-blue-300"
                      onClick={() => setIsNotificationsOpen(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 focus:outline-none"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-label="User menu"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-medium shadow-md">
              {currentUser?.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser?.name || 'User'} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <FiUser className="w-6 h-6" />
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser?.name || 'Guest'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{formatRoleName(currentUser?.role || 'user')}</p>
            </div>
          </motion.button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50
                         dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <p className="font-medium text-gray-900 dark:text-white">{currentUser?.name || 'Guest'}</p>
                  <p className="text-sm text-gray-500 truncate dark:text-gray-400">{currentUser?.email || currentUser?.username}</p>
                  <p className="text-xs text-gray-400 mt-1 capitalize dark:text-gray-500">{formatRoleName(currentUser?.role || 'user')}</p>
                </div>
                
                <div className="py-1">
                  <Link
                    href="/admin/profile"
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100
                             dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <FiUser className="mr-3 text-blue-500" />
                    <span>Profile</span>
                  </Link>
                  
                  <Link
                    href="/admin/settings"
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100
                             dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <FiSettings className="mr-3 text-blue-500" />
                    <span>Settings</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100
                             dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <FiLogOut className="mr-3 text-red-500" />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}