'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme-context';
import { Bell, LogOut, User, Menu, ChevronDown, Globe } from 'lucide-react';
import { FaSun, FaMoon, FaGlobe, FaChevronDown } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function AdminHeader({ onMenuClick, onSidebarToggle, isSidebarCollapsed }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isLanguageOpen) {
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isLanguageOpen]);

  if (!mounted) return null;

  return (
    <header className={`
      bg-surface dark:bg-surface border-b border-border dark:border-border 
      px-6 py-4 flex items-center justify-between transition-colors duration-300
      ${theme === 'dark' ? 'shadow-[0_4px_12px_rgba(0,255,255,0.1)]' : 'shadow-[0_4px_12px_rgba(0,0,0,0.08)]'}
    `}>
      <div className="flex items-center">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className={`
            mr-4 p-2 rounded-md transition-all duration-300 hover:scale-105
            ${theme === 'dark' 
              ? 'hover:bg-[#00ffff20] text-white' 
              : 'hover:bg-gray-100 text-gray-900'
            }
            lg:hidden
          `}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Desktop sidebar toggle */}
        <button
          onClick={onSidebarToggle}
          className={`
            hidden mr-4 p-2 rounded-md transition-all duration-300 hover:scale-105
            ${theme === 'dark' 
              ? 'hover:bg-[#00ffff20] text-white' 
              : 'hover:bg-gray-100 text-gray-900'
            }
            lg:flex items-center
          `}
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu className="h-6 w-6" />
        </button>

        <h1 className={`
          text-xl font-semibold transition-colors duration-300
          ${theme === 'dark' ? 'text-[#ccd6f6]' : 'text-[#333333]'}
        `}>
          Admin Dashboard
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`
            p-2 rounded-lg transition-all duration-300 hover:scale-110
            ${theme === 'dark' 
              ? 'hover:bg-[#00ffff20]' 
              : 'hover:bg-gray-100'
            }
          `}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <FaSun className="text-[#FFD700] h-5 w-5" />
          ) : (
            <FaMoon className="text-[#333333] h-5 w-5" />
          )}
        </button>

        {/* Notifications */}
        <button className={`
          p-2 rounded-full transition-all duration-300 hover:scale-105 relative
          ${theme === 'dark' 
            ? 'hover:bg-[#00ffff20] text-white' 
            : 'hover:bg-gray-100 text-gray-900'
          }
        `}>
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
        </button>

        {/* Language Dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLanguageOpen(!isLanguageOpen);
            }}
            className={`
              flex items-center space-x-2 p-2 rounded-lg transition-all duration-300 hover:scale-105
              ${theme === 'dark' 
                ? 'hover:bg-[#00ffff20] text-white' 
                : 'hover:bg-gray-100 text-gray-900'
              }
            `}
          >
            <Globe className="h-5 w-5" />
            <span className="hidden md:inline">EN</span>
            <FaChevronDown 
              className={`transition-transform duration-300 ${isLanguageOpen ? 'rotate-180' : ''}`} 
              size={14} 
            />
          </button>
          {isLanguageOpen && (
            <div 
              className={`
                absolute right-0 mt-2 w-40 rounded-lg py-2 animate-fadeIn z-50
                ${theme === 'dark' 
                  ? 'bg-[#0a192f] border border-[#00ffff] shadow-[0_4px_12px_rgba(0,255,255,0.2)]' 
                  : 'bg-white border border-gray-200 shadow-lg'
                }
              `}
              onClick={(e) => e.stopPropagation()}
            >
              <button className={`
                block w-full px-4 py-2 text-left transition-colors duration-200
                ${theme === 'dark' 
                  ? 'text-white hover:text-[#00ffff] hover:bg-[#00ffff20]' 
                  : 'text-gray-900 hover:text-blue-600 hover:bg-gray-100'
                }
              `}>
                English
              </button>
              <button className={`
                block w-full px-4 py-2 text-left transition-colors duration-200
                ${theme === 'dark' 
                  ? 'text-white hover:text-[#00ffff] hover:bg-[#00ffff20]' 
                  : 'text-gray-900 hover:text-blue-600 hover:bg-gray-100'
                }
              `}>
                Amharic
              </button>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center">
          <div className={`
            h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300
            ${theme === 'dark' 
              ? 'bg-[#00ffff20]' 
              : 'bg-blue-100'
            }
          `}>
            <User className={`
              h-5 w-5 transition-colors duration-300
              ${theme === 'dark' ? 'text-[#00ffff]' : 'text-blue-600'}
            `} />
          </div>
          <div className="ml-2 hidden md:block">
            <p className={`
              text-sm font-medium transition-colors duration-300
              ${theme === 'dark' ? 'text-[#ccd6f6]' : 'text-gray-900'}
            `}>
              {user?.phone || 'Admin User'}
            </p>
            <p className={`
              text-xs transition-colors duration-300
              ${theme === 'dark' ? 'text-[#a8b2d1]' : 'text-gray-500'}
            `}>
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Administrator'}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`
            p-2 rounded-md transition-all duration-300 hover:scale-105
            ${theme === 'dark' 
              ? 'hover:bg-[#ff000020] text-red-400 hover:text-red-300' 
              : 'hover:bg-red-50 text-red-600 hover:text-red-700'
            }
          `}
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