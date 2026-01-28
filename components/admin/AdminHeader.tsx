'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme-context';
import { Bell, LogOut, User, Menu } from 'lucide-react';
import { FaSun, FaMoon, FaChevronDown } from 'react-icons/fa';
import { FiBell, FiRefreshCw, FiX, FiCheck, FiEye, FiEyeOff } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useNotification } from '@/app/contexts/NotificationContext';

interface AdminHeaderProps {
  onMenuClick: () => void;
  onSidebarToggle: () => void;
  isSidebarCollapsed?: boolean;
}

export default function AdminHeader({ 
  onMenuClick, 
  onSidebarToggle, 
  isSidebarCollapsed = false 
}: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [autoShowNotifications, setAutoShowNotifications] = useState(false);
  const [mounted, setMounted] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  const { 
    notifications, 
    unreadCount,
    isLoading: isLoadingNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  } = useNotification();

  // Filter notifications by current user's role
  const filteredNotifications = notifications.filter(
    notification => 
      // Admin sees all notifications, others see only their role
      user?.role === 'admin' || 
      notification.role === user?.role
  );

  // Filter unread notifications for auto-show
  const unreadNotifications = filteredNotifications.filter(
    notification => !notification.read
  );

  useEffect(() => {
    setMounted(true);
  }, []);

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
      if (isLanguageOpen) {
        setIsLanguageOpen(false);
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isLanguageOpen]);

  const handleLogout = () => {
    logout();
    router.push('/');
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

  if (!mounted) return null;

  return (
    <header className="
      bg-surface dark:bg-surface 
      border-b border-border dark:border-border 
      px-6 py-4 flex items-center justify-between 
      transition-colors duration-300 shadow-md
    ">
      <div className="flex items-center">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="
            mr-4 p-2 rounded-md transition-all duration-300 
            hover:scale-105 text-text-primary dark:text-text-primary 
            hover:bg-border dark:hover:bg-border
            lg:hidden
          "
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Desktop sidebar toggle */}
        <button
          onClick={onSidebarToggle}
          className="
            hidden mr-4 p-2 rounded-md transition-all duration-300 
            hover:scale-105 text-text-primary dark:text-text-primary 
            hover:bg-border dark:hover:bg-border
            lg:flex items-center
          "
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu className="h-6 w-6" />
        </button>

        <h1 className="
          text-xl font-semibold transition-colors duration-300
          text-text-primary dark:text-text-primary
        ">
          Admin Dashboard
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="
            p-2 rounded-lg transition-all duration-300 
            hover:scale-110 hover:bg-border dark:hover:bg-border
          "
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <FaSun className="text-warning h-5 w-5" />
          ) : (
            <FaMoon className="text-text-primary h-5 w-5" />
          )}
        </button>

        {/* Refresh Notifications Button */}
        {/* <motion.button
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
          onClick={() => refreshNotifications()}
          className="
            p-2 rounded-lg transition-all duration-300 
            hover:scale-110 hover:bg-border dark:hover:bg-border
          "
          aria-label="Refresh notifications"
        >
          <FiRefreshCw className="h-5 w-5 text-text-primary dark:text-text-primary" />
        </motion.button> */}

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="
              p-2 rounded-full transition-all duration-300 
              hover:scale-105 relative text-text-primary 
              dark:text-text-primary hover:bg-border dark:hover:bg-border
            "
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
                className="
                  absolute top-0 right-0 h-5 w-5 rounded-full 
                  bg-error text-white text-xs flex items-center justify-center 
                  transform -translate-y-1/2 translate-x-1/2
                "
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
                <div className="
                  bg-surface dark:bg-surface 
                  rounded-lg shadow-lg border border-border dark:border-border 
                  overflow-hidden
                ">
                  {/* Hide All button */}
                  <div className="p-2 border-b border-border dark:border-border">
                    <button
                      onClick={handleHideAllNotifications}
                      className="
                        w-full px-3 py-2 text-sm font-medium 
                        text-text-primary dark:text-text-primary 
                        hover:bg-border dark:hover:bg-border 
                        rounded-md transition-colors flex items-center justify-center
                      "
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
                        className="
                          px-4 py-3 hover:bg-border dark:hover:bg-border 
                          cursor-pointer border-b border-border dark:border-border
                        "
                        onClick={async () => {
                          await markAsRead(notification._id);
                          router.push(notification.link);
                          setAutoShowNotifications(false);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-text-primary dark:text-text-primary line-clamp-2">
                            {notification.message}
                          </p>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await markAsRead(notification._id);
                            }}
                            className="ml-2 text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-text-primary"
                          >
                            <FiCheck className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-xs text-text-secondary dark:text-text-secondary">
                            {formatRoleName(notification.role)}
                          </span>
                          <span className="text-xs text-text-secondary dark:text-text-secondary">
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
                    <div className="p-3 border-t border-border dark:border-border">
                      <button
                        onClick={() => {
                          setIsNotificationsOpen(true);
                          setAutoShowNotifications(false);
                        }}
                        className="
                          w-full text-center text-sm 
                          text-primary dark:text-primary 
                          hover:text-primary/80 dark:hover:text-primary/80 
                          font-medium
                        "
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
                className="
                  absolute right-0 mt-2 w-96 
                  bg-surface dark:bg-surface 
                  rounded-lg shadow-lg border border-border dark:border-border 
                  z-50 max-h-[80vh] overflow-hidden
                "
              >
                <div className="p-4 border-b border-border dark:border-border bg-surface/50 dark:bg-surface/50">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary">
                      Notifications
                      {user?.role !== 'admin' && (
                        <span className="ml-2 text-sm font-normal text-text-secondary dark:text-text-secondary">
                          ({formatRoleName(user?.role || 'user')})
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={markAllAsRead}
                        className="
                          text-sm text-primary dark:text-primary 
                          hover:text-primary/80 dark:hover:text-primary/80 
                          font-medium disabled:opacity-50 disabled:cursor-not-allowed
                        "
                        disabled={unreadCount === 0}
                      >
                        Mark all read
                      </button>
                      <button
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-text-primary"
                      >
                        <FiX className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-y-auto max-h-[60vh]">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <FiBell className="h-12 w-12 text-text-secondary dark:text-text-secondary mx-auto mb-4" />
                      <p className="text-text-secondary dark:text-text-secondary">No notifications</p>
                      {user?.role !== 'admin' && (
                        <p className="text-sm text-text-secondary dark:text-text-secondary mt-1">
                          You'll see notifications here for the {formatRoleName(user?.role || 'user')} role
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
                          className={`
                            px-4 py-3 hover:bg-border dark:hover:bg-border 
                            cursor-pointer border-b border-border dark:border-border
                            ${notification.read ? 'opacity-75' : ''}
                          `}
                          onClick={async () => {
                            await markAsRead(notification._id);
                            router.push(notification.link);
                            setIsNotificationsOpen(false);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className={`
                                font-medium 
                                ${notification.read ? 'text-text-secondary dark:text-text-secondary' : 'text-text-primary dark:text-text-primary'}
                              `}>
                                {notification.message}
                              </p>
                              <div className="mt-1 flex items-center space-x-3">
                                {user?.role === 'admin' && (
                                  <span className="
                                    inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                                    bg-primary/10 dark:bg-primary/20 
                                    text-primary dark:text-primary
                                  ">
                                    {formatRoleName(notification.role)}
                                  </span>
                                )}
                                <span className="text-xs text-text-secondary dark:text-text-secondary">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </span>
                                {notification.creator && (
                                  <span className="text-xs text-text-secondary dark:text-text-secondary">
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
                                  className="text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-text-primary p-1"
                                  title="Mark as read"
                                >
                                  <FiCheck className="h-4 w-4" />
                                </button>
                              )}
                              {user?.role === 'admin' && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    // Delete notification logic here
                                  }}
                                  className="text-text-secondary dark:text-text-secondary hover:text-error dark:hover:text-error p-1"
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
                  <div className="p-4 border-t border-border dark:border-border bg-surface/50 dark:bg-surface/50">
                    <Link
                      href="/admin/notifications"
                      className="
                        block text-center 
                        text-primary dark:text-primary 
                        hover:text-primary/80 dark:hover:text-primary/80 
                        font-medium
                      "
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

        {/* Language Dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLanguageOpen(!isLanguageOpen);
            }}
            className="
              flex items-center space-x-2 p-2 rounded-lg 
              transition-all duration-300 hover:scale-105
              text-text-primary dark:text-text-primary 
              hover:bg-border dark:hover:bg-border
            "
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" 
              />
            </svg>
            <span className="hidden md:inline">EN</span>
            <FaChevronDown 
              className={`transition-transform duration-300 ${isLanguageOpen ? 'rotate-180' : ''}`} 
              size={14} 
            />
          </button>
          {isLanguageOpen && (
            <div 
              className="
                absolute right-0 mt-2 w-40 bg-surface dark:bg-surface 
                border border-border dark:border-border rounded-lg 
                shadow-lg py-2 animate-fadeIn z-50
              "
              onClick={(e) => e.stopPropagation()}
            >
              <button className="
                block w-full px-4 py-2 text-left transition-colors duration-200
                text-text-primary dark:text-text-primary 
                hover:text-primary dark:hover:text-primary 
                hover:bg-primary/5 dark:hover:bg-primary/20
              ">
                English
              </button>
              <button className="
                block w-full px-4 py-2 text-left transition-colors duration-200
                text-text-primary dark:text-text-primary 
                hover:text-primary dark:hover:text-primary 
                hover:bg-primary/5 dark:hover:bg-primary/20
              ">
                Amharic
              </button>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="
              flex items-center space-x-2 focus:outline-none
            "
          >
            <div className="
              h-8 w-8 rounded-full flex items-center justify-center 
              transition-all duration-300 bg-primary/10 dark:bg-primary/20
            ">
              <User className="h-5 w-5 text-primary dark:text-primary" />
            </div>
            <div className="ml-2 hidden md:block">
              <p className="
                text-sm font-medium transition-colors duration-300
                text-text-primary dark:text-text-primary
              ">
                {user?.name || user?.email || user?.phone || 'Admin User'}
              </p>
              <p className="
                text-xs transition-colors duration-300
                text-text-secondary dark:text-text-secondary
              ">
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Administrator'}
              </p>
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="
                  absolute right-0 mt-2 w-56 
                  bg-surface dark:bg-surface 
                  rounded-lg shadow-lg border border-border dark:border-border 
                  z-50
                "
              >
                <div className="p-4 border-b border-border dark:border-border">
                  <p className="font-medium text-text-primary dark:text-text-primary">
                    {user?.name || user?.email || user?.phone || 'Admin User'}
                  </p>
                  <p className="text-sm text-text-secondary dark:text-text-secondary truncate">
                    {user?.email || user?.phone || ''}
                  </p>
                  <p className="text-xs text-text-secondary dark:text-text-secondary mt-1">
                    {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Administrator'}
                  </p>
                </div>
                
                <div className="py-1">
                  <Link
                    href="/admin/profile"
                    className="
                      flex items-center px-4 py-3 
                      text-text-primary dark:text-text-primary 
                      hover:bg-border dark:hover:bg-border
                    "
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className="mr-3 h-5 w-5 text-primary dark:text-primary" />
                    <span>Profile</span>
                  </Link>
                  
                  <Link
                    href="/admin/settings"
                    className="
                      flex items-center px-4 py-3 
                      text-text-primary dark:text-text-primary 
                      hover:bg-border dark:hover:bg-border
                    "
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <svg className="mr-3 h-5 w-5 text-primary dark:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Settings</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="
                      flex items-center w-full px-4 py-3 
                      text-text-primary dark:text-text-primary 
                      hover:bg-border dark:hover:bg-border
                    "
                  >
                    <LogOut className="mr-3 h-5 w-5 text-error dark:text-error" />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="
            p-2 rounded-md transition-all duration-300 
            hover:scale-105 text-error hover:bg-error/10 
            dark:text-error dark:hover:bg-error/20
          "
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </header>
  );
}