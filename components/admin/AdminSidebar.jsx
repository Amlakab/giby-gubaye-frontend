'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme-context';
import { 
  Home, Users, Gamepad2, BarChart3, Wallet, 
  X, Settings, LogOut, History, ChevronLeft, ChevronRight,
  FileText, MessageSquare, CreditCard, Database, Shield, 
  Bell, Calendar, Layers, TrendingUp,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { name: 'Home', href: '/admin', icon: Home },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Students', href: '/admin/students', icon: Users },
  { name: 'Assin Job', href: '/admin/job-assignment', icon: FileText },
  { name: 'Family', href: '/admin/manage-families', icon: Users },
  { name: 'Blogs', href: '/admin/blogs', icon: FileText },
  { name: 'Approve Blogs', href: '/admin/blog-approve', icon: FileText },
  { name: 'Agenda', href: '/admin/agendas', icon: FileText },
  { name: 'Approve Agenda', href: '/admin/agenda-approve', icon: FileText },
  { name: 'Wallet', href: '/admin/wallet', icon: Wallet },
  { name: 'Approve transaction', href: '/admin/transactions/approve', icon: Wallet },
  { name: 'Transactions', href: '/admin/transactions/complete', icon: Wallet },
  

  // { name: 'Games', href: '/admin/games', icon: Gamepad2 },
  { name: 'Accountants', href: '/admin/accountants', icon: CreditCard },
  { name: 'Calculator', href: '/admin/calculator', icon: CreditCard },
  // { name: 'Game History', href: '/admin/game-history', icon: History },
  // { name: 'Transactions', href: '/admin/transactions', icon: Database },
  { name: 'Analytics', href: '/admin/reports/transactions', icon: BarChart3 },
  { name: 'Feedback', href: '/admin/feedback', icon: MessageSquare },
  // { name: 'Spinner History', href: '/admin/spinner-history', icon: Layers },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Events', href: '/admin/events', icon: Calendar },
  { name: 'Reports', href: '/admin/reports', icon: TrendingUp },
  { name: 'Security', href: '/admin/security', icon: Shield },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar({ 
  isOpen, 
  onClose, 
  isCollapsed = false,
  onToggleCollapse 
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleLogout = () => {
    router.push('/');
    onClose?.();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 h-full z-50 transform transition-all duration-300 ease-in-out",
        "lg:relative lg:translate-x-0 lg:z-auto lg:h-screen lg:sticky lg:top-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "w-20" : "w-64",
        theme === 'dark' 
          ? "bg-[#0a192f] border-r border-[#00ffff]/20" 
          : "bg-white border-r border-gray-200"
      )}>
        {/* Header */}
        <div className={`
          flex items-center justify-between p-4 border-b transition-colors duration-300
          ${theme === 'dark' 
            ? 'border-[#00ffff]/20' 
            : 'border-gray-200'
          }
          ${isCollapsed ? 'justify-center' : ''}
        `}>
          {!isCollapsed && (
            <h2 className={`
              text-lg font-semibold transition-colors duration-300
              ${theme === 'dark' ? 'text-[#ccd6f6]' : 'text-gray-900'}
            `}>
              Admin Panel
            </h2>
          )}
          
          {!isCollapsed && (
            <button 
              onClick={onClose}
              className={`
                p-1 rounded-md transition-all duration-300 hover:scale-105
                ${theme === 'dark' 
                  ? 'hover:bg-[#00ffff20] text-white' 
                  : 'hover:bg-gray-100 text-gray-900'
                }
                lg:hidden
              `}
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Collapse Toggle (Desktop) */}
          <button
            onClick={onToggleCollapse}
            className={`
              hidden lg:flex items-center justify-center p-1.5 rounded-md 
              transition-all duration-300 hover:scale-105
              ${theme === 'dark' 
                ? 'hover:bg-[#00ffff20] text-white' 
                : 'hover:bg-gray-100 text-gray-900'
              }
              ${isCollapsed ? 'w-full' : ''}
            `}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 overflow-y-auto h-[calc(100vh-140px)]">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-3 rounded-lg transition-all duration-300 group",
                      isActive 
                        ? theme === 'dark'
                          ? "bg-[#00ffff20] border-l-2 border-[#00ffff] text-[#00ffff]" 
                          : "bg-blue-100 border-l-2 border-blue-600 text-blue-700"
                        : theme === 'dark'
                          ? "text-gray-300 hover:bg-[#00ffff10] hover:text-[#00ffff] hover:border-l-2 hover:border-[#00ffff]/50"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:border-l-2 hover:border-gray-300"
                    )}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onClose?.();
                      }
                    }}
                  >
                    <Icon className={cn(
                      "h-5 w-5 flex-shrink-0 transition-colors duration-300",
                      isCollapsed ? "mx-auto" : "mr-3"
                    )} />
                    
                    {!isCollapsed && (
                      <span className="font-medium text-sm truncate">
                        {item.name}
                      </span>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className={`
                        absolute left-full ml-2 px-3 py-2 rounded-md opacity-0 invisible 
                        group-hover:opacity-100 group-hover:visible transition-all duration-300
                        whitespace-nowrap z-50 shadow-lg
                        ${theme === 'dark' 
                          ? 'bg-[#0a192f] border border-[#00ffff]/20 text-white' 
                          : 'bg-white border border-gray-200 text-gray-900'
                        }
                      `}>
                        {item.name}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Footer */}
        <div className={`
          absolute bottom-0 w-full p-4 border-t transition-colors duration-300
          ${theme === 'dark' 
            ? 'border-[#00ffff]/20' 
            : 'border-gray-200'
          }
          ${isCollapsed ? 'px-2' : ''}
        `}>
          {!isCollapsed ? (
            <div className="flex items-center px-3 py-2">
              <div className={`
                h-8 w-8 rounded-full flex items-center justify-center mr-3 transition-colors duration-300
                ${theme === 'dark' 
                  ? 'bg-[#00ffff20]' 
                  : 'bg-blue-100'
                }
              `}>
                <Users className={`
                  h-4 w-4 transition-colors duration-300
                  ${theme === 'dark' ? 'text-[#00ffff]' : 'text-blue-600'}
                `} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`
                  text-sm font-medium truncate transition-colors duration-300
                  ${theme === 'dark' ? 'text-[#ccd6f6]' : 'text-gray-900'}
                `}>
                  Admin User
                </p>
                <p className={`
                  text-xs truncate transition-colors duration-300
                  ${theme === 'dark' ? 'text-[#a8b2d1]' : 'text-gray-500'}
                `}>
                  Administrator
                </p>
              </div>
              <button
                onClick={handleLogout}
                className={`
                  p-1.5 rounded-md transition-all duration-300 hover:scale-105
                  ${theme === 'dark' 
                    ? 'hover:bg-[#ff000020] text-red-400 hover:text-red-300' 
                    : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                  }
                `}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className={`
                h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300
                ${theme === 'dark' 
                  ? 'bg-[#00ffff20]' 
                  : 'bg-blue-100'
                }
              `}>
                <Users className={`
                  h-4 w-4 transition-colors duration-300
                  ${theme === 'dark' ? 'text-[#00ffff]' : 'text-blue-600'}
                `} />
              </div>
              <button
                onClick={handleLogout}
                className={`
                  p-1.5 rounded-md transition-all duration-300 hover:scale-105
                  ${theme === 'dark' 
                    ? 'hover:bg-[#ff000020] text-red-400 hover:text-red-300' 
                    : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                  }
                `}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Collapse Toggle (Mobile) */}
        <button
          onClick={onToggleCollapse}
          className={`
            hidden absolute -right-3 top-16 items-center justify-center p-1.5 rounded-full 
            transition-all duration-300 hover:scale-105 z-40 shadow-lg
            ${theme === 'dark' 
              ? 'bg-[#00ffff] hover:bg-[#00ffff] text-[#0a192f]' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
            lg:flex
          `}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </>
  );
}