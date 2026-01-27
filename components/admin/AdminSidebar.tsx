'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme-context';
import { 
  Home, Users, BarChart3, Wallet, 
  X, Settings, LogOut, ChevronLeft, ChevronRight,
  FileText, MessageSquare, CreditCard, Database, Shield, 
  Bell, Calendar, TrendingUp,
  UserCheck, CheckCircle, BookOpen, GraduationCap,
  Briefcase, DollarSign, Calculator,
  AlertCircle, FileCheck, ClipboardCheck, Library,
  UserPlus, ShieldCheck, FolderTree
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Define menu item interface
interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: string[];
}

// Define component props interface
interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// Common items for ALL roles (Home, Assign Job, Agenda, Add Programs, Wallet, Reports)
const commonItems: MenuItem[] = [
  { 
    name: 'Home', 
    href: '/admin', 
    icon: Home,
    allowedRoles: ['user', 'accountant', 'admin', 'Abalat-Guday', 'Mezmur', 'Timhrt', 'Muyana-Terado', 'Priesedant', 'Vice-Priesedant', 'Secretary', 'Bachna-Department', 'Audite', 'Limat'] 
  },
  { 
    name: 'Assign Job', 
    href: '/admin/job-assignment', 
    icon: Briefcase,
    allowedRoles: ['user', 'accountant', 'admin', 'Abalat-Guday', 'Mezmur', 'Timhrt', 'Muyana-Terado', 'Priesedant', 'Vice-Priesedant', 'Secretary', 'Bachna-Department', 'Audite', 'Limat'] 
  },
  { 
    name: 'Agenda', 
    href: '/admin/agendas', 
    icon: Calendar,
    allowedRoles: ['user', 'accountant', 'admin', 'Abalat-Guday', 'Mezmur', 'Timhrt', 'Muyana-Terado', 'Priesedant', 'Vice-Priesedant', 'Secretary', 'Bachna-Department', 'Audite', 'Limat'] 
  },
  { 
    name: 'Add Programs', 
    href: '/admin/add-program', 
    icon: BookOpen,
    allowedRoles: ['user', 'accountant', 'admin', 'Abalat-Guday', 'Mezmur', 'Timhrt', 'Muyana-Terado', 'Priesedant', 'Vice-Priesedant', 'Secretary', 'Bachna-Department', 'Audite', 'Limat'] 
  },
  { 
    name: 'Wallet', 
    href: '/admin/wallet', 
    icon: Wallet,
    allowedRoles: ['user', 'accountant', 'admin', 'Abalat-Guday', 'Mezmur', 'Timhrt', 'Muyana-Terado', 'Priesedant', 'Vice-Priesedant', 'Secretary', 'Bachna-Department', 'Audite', 'Limat'] 
  },
  { 
    name: 'Reports', 
    href: '/admin/reports', 
    icon: TrendingUp,
    allowedRoles: ['user', 'accountant', 'admin', 'Abalat-Guday', 'Mezmur', 'Timhrt', 'Muyana-Terado', 'Priesedant', 'Vice-Priesedant', 'Secretary', 'Bachna-Department', 'Audite', 'Limat'] 
  }
];

// Approval items for Audite and Priesedant
const approvalItems: MenuItem[] = [
  { 
    name: 'Approve Blogs', 
    href: '/admin/blog-approve', 
    icon: FileCheck,
    allowedRoles: ['admin', 'Audite', 'Priesedant'] 
  },
  { 
    name: 'Approve Programs', 
    href: '/admin/approve-program', 
    icon: CheckCircle,
    allowedRoles: ['admin', 'Audite', 'Priesedant', 'Timhrt'] 
  },
  { 
    name: 'Approve Agenda', 
    href: '/admin/agenda-approve', 
    icon: ClipboardCheck,
    allowedRoles: ['admin', 'Audite', 'Priesedant'] 
  },
  { 
    name: 'Approve Transaction', 
    href: '/admin/transactions/approve', 
    icon: DollarSign,
    allowedRoles: ['admin', 'Audite', 'Priesedant'] 
  },
  { 
    name: 'Approve Resources', 
    href: '/admin/approve-resources', 
    icon: ShieldCheck,
    allowedRoles: ['admin', 'Audite', 'Priesedant'] 
  }
];

// Admin ONLY items (should NOT be accessible by other roles)
const adminOnlyItems: MenuItem[] = [
  { 
    name: 'Users', 
    href: '/admin/users', 
    icon: UserPlus,
    allowedRoles: ['admin'] 
  },
  { 
    name: 'Analytics', 
    href: '/admin/reports/transactions', 
    icon: BarChart3,
    allowedRoles: ['admin'] 
  },
  { 
    name: 'Accounts', 
    href: '/admin/accountants', 
    icon: CreditCard,
    allowedRoles: ['admin'] 
  },
  { 
    name: 'Security', 
    href: '/admin/security', 
    icon: Shield,
    allowedRoles: ['admin'] 
  },
  { 
    name: 'Settings', 
    href: '/admin/settings', 
    icon: Settings,
    allowedRoles: ['admin'] 
  }
];

// Abalat-Guday additional items
const abalatGudayItems: MenuItem[] = [
  { 
    name: 'Students', 
    href: '/admin/students', 
    icon: GraduationCap,
    allowedRoles: ['admin', 'Abalat-Guday'] 
  },
  { 
    name: 'Family', 
    href: '/admin/manage-families', 
    icon: Users,
    allowedRoles: ['admin', 'Abalat-Guday'] 
  },
  { 
    name: 'Resources', 
    href: '/admin/resources', 
    icon: Database,
    allowedRoles: ['admin', 'Abalat-Guday', 'Timhrt'] 
  }
];

// Bachna-Department additional items
const bachnaDepartmentItems: MenuItem[] = [
  { 
    name: 'Blogs', 
    href: '/admin/blogs', 
    icon: FileText,
    allowedRoles: ['admin', 'Bachna-Department'] 
  }
];

// Accountant additional items
const accountantItems: MenuItem[] = [
  { 
    name: 'Transactions', 
    href: '/admin/transactions', 
    icon: DollarSign,
    allowedRoles: ['admin', 'accountant'] 
  },
  { 
    name: 'Calculator', 
    href: '/admin/calculator', 
    icon: Calculator,
    allowedRoles: ['admin', 'accountant'] 
  },
  { 
    name: 'Accountants', 
    href: '/admin/transactions/complete', 
    icon: UserCheck,
    allowedRoles: ['admin', 'accountant'] 
  }
];

// Timhrt additional items
const timhrtItems: MenuItem[] = [
  { 
    name: 'Resources', 
    href: '/admin/resources', 
    icon: Library,
    allowedRoles: ['admin', 'Timhrt'] 
  },
  { 
    name: 'Approve Programs', 
    href: '/admin/approve-program', 
    icon: CheckCircle,
    allowedRoles: ['admin', 'Timhrt'] 
  }
];

// Leadership items (Priesedant, Vice-Priesedant, Secretary)
const leadershipItems: MenuItem[] = [
  { 
    name: 'Programs', 
    href: '/admin/program', 
    icon: BookOpen,
    allowedRoles: ['admin', 'Priesedant', 'Vice-Priesedant', 'Secretary'] 
  },
  { 
    name: 'Feedback', 
    href: '/admin/feedback', 
    icon: MessageSquare,
    allowedRoles: ['admin', 'Priesedant', 'Vice-Priesedant', 'Secretary'] 
  },
  { 
    name: 'Notifications', 
    href: '/admin/notifications', 
    icon: Bell,
    allowedRoles: ['admin', 'Priesedant', 'Vice-Priesedant', 'Secretary'] 
  },
  { 
    name: 'Events', 
    href: '/admin/events', 
    icon: Calendar,
    allowedRoles: ['admin', 'Priesedant', 'Vice-Priesedant', 'Secretary'] 
  }
];

// Other items that multiple roles can access
const sharedItems: MenuItem[] = [
  { 
    name: 'Programs', 
    href: '/admin/program', 
    icon: FolderTree,
    allowedRoles: ['admin', 'Priesedant', 'Vice-Priesedant', 'Secretary'] 
  },
  { 
    name: 'Blogs', 
    href: '/admin/blogs', 
    icon: FileText,
    allowedRoles: ['admin', 'Bachna-Department'] 
  },
  { 
    name: 'Resources', 
    href: '/admin/resources', 
    icon: Database,
    allowedRoles: ['admin', 'Abalat-Guday', 'Timhrt'] 
  },
  { 
    name: 'Students', 
    href: '/admin/students', 
    icon: GraduationCap,
    allowedRoles: ['admin', 'Abalat-Guday'] 
  },
  { 
    name: 'Family', 
    href: '/admin/manage-families', 
    icon: Users,
    allowedRoles: ['admin', 'Abalat-Guday'] 
  },
  { 
    name: 'Transactions', 
    href: '/admin/transactions', 
    icon: DollarSign,
    allowedRoles: ['admin', 'accountant'] 
  },
  { 
    name: 'Calculator', 
    href: '/admin/calculator', 
    icon: Calculator,
    allowedRoles: ['admin', 'accountant'] 
  }
];

// Combine all menu items
const allMenuItems: MenuItem[] = [
  ...commonItems,
  ...approvalItems,
  ...adminOnlyItems,
  ...abalatGudayItems,
  ...bachnaDepartmentItems,
  ...accountantItems,
  ...timhrtItems,
  ...leadershipItems,
  ...sharedItems
];

// Remove duplicates by name (keeping the first occurrence)
const uniqueMenuItems = allMenuItems.filter((item, index, self) =>
  index === self.findIndex((t) => t.name === item.name)
);

export default function AdminSidebar({ 
  isOpen, 
  onClose, 
  isCollapsed = false,
  onToggleCollapse 
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string>('user');
  const [userDisplayName, setUserDisplayName] = useState<string>('User');
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    setMounted(true);
    
    // Get user info from localStorage or session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserRole(user.role || 'user');
        setUserDisplayName(user.name || user.email || 'User');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Filter menu items based on user role
  useEffect(() => {
    const filtered = uniqueMenuItems.filter(item => 
      item.allowedRoles.includes(userRole)
    );
    
    // Debug log to see what items are being filtered
    console.log('User Role:', userRole);
    console.log('Filtered Items:', filtered);
    
    setFilteredMenuItems(filtered);
  }, [userRole]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
    onClose?.();
  };

  if (!mounted) return null;

  const userRoleDisplay = userRole ? 
    userRole.charAt(0).toUpperCase() + userRole.slice(1).replace(/-/g, ' ') : 
    'User';

  // Role-based sidebar title
  const getSidebarTitle = () => {
    switch(userRole) {
      case 'admin':
        return 'Admin Panel';
      case 'Priesedant':
        return 'President Panel';
      case 'Vice-Priesedant':
        return 'Vice President Panel';
      case 'accountant':
        return 'Accountant Panel';
      case 'Secretary':
        return 'Secretary Panel';
      case 'Limat':
        return 'Finance Panel';
      case 'Abalat-Guday':
        return 'Member Affairs';
      case 'Mezmur':
        return 'Music Panel';
      case 'Timhrt':
        return 'Education Panel';
      case 'Muyana-Terado':
        return 'Maintenance';
      case 'Bachna-Department':
        return 'Youth Department';
      case 'Audite':
        return 'Audit Panel';
      case 'user':
        return 'User Panel';
      default:
        return 'Dashboard';
    }
  };

  // Role badge color
  const getRoleColor = (role: string) => {
    const colors: Record<string, { dark: string, light: string }> = {
      'admin': { 
        dark: 'bg-red-500/20 text-red-300', 
        light: 'bg-red-100 text-red-700' 
      },
      'Priesedant': { 
        dark: 'bg-purple-500/20 text-purple-300', 
        light: 'bg-purple-100 text-purple-700' 
      },
      'Vice-Priesedant': { 
        dark: 'bg-blue-500/20 text-blue-300', 
        light: 'bg-blue-100 text-blue-700' 
      },
      'accountant': { 
        dark: 'bg-yellow-500/20 text-yellow-300', 
        light: 'bg-yellow-100 text-yellow-700' 
      },
      'Secretary': { 
        dark: 'bg-green-500/20 text-green-300', 
        light: 'bg-green-100 text-green-700' 
      },
      'Limat': { 
        dark: 'bg-indigo-500/20 text-indigo-300', 
        light: 'bg-indigo-100 text-indigo-700' 
      },
      'Abalat-Guday': { 
        dark: 'bg-pink-500/20 text-pink-300', 
        light: 'bg-pink-100 text-pink-700' 
      },
      'Mezmur': { 
        dark: 'bg-teal-500/20 text-teal-300', 
        light: 'bg-teal-100 text-teal-700' 
      },
      'Timhrt': { 
        dark: 'bg-orange-500/20 text-orange-300', 
        light: 'bg-orange-100 text-orange-700' 
      },
      'Muyana-Terado': { 
        dark: 'bg-cyan-500/20 text-cyan-300', 
        light: 'bg-cyan-100 text-cyan-700' 
      },
      'Bachna-Department': { 
        dark: 'bg-lime-500/20 text-lime-300', 
        light: 'bg-lime-100 text-lime-700' 
      },
      'Audite': { 
        dark: 'bg-amber-500/20 text-amber-300', 
        light: 'bg-amber-100 text-amber-700' 
      },
      'user': { 
        dark: 'bg-gray-500/20 text-gray-300', 
        light: 'bg-gray-100 text-gray-700' 
      },
    };
    
    const roleColor = colors[role] || colors['user'];
    return theme === 'dark' ? roleColor.dark : roleColor.light;
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
            <div className="flex flex-col">
              <h2 className={`
                text-lg font-semibold transition-colors duration-300
                ${theme === 'dark' ? 'text-[#ccd6f6]' : 'text-gray-900'}
              `}>
                {getSidebarTitle()}
              </h2>
              <span className={`text-xs px-2 py-1 rounded-full w-fit mt-1 ${getRoleColor(userRole)}`}>
                {userRoleDisplay}
              </span>
            </div>
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
          {onToggleCollapse && (
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
          )}
        </div>
        
        {/* Navigation */}
        <nav className="p-4 overflow-y-auto h-[calc(100vh-140px)]">
          <div className="mb-3">
            <p className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-[#00ffff]/70' : 'text-blue-600/70'}`}>
              Common Access
            </p>
          </div>
          <ul className="space-y-2">
            {filteredMenuItems.length > 0 ? (
              filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                
                return (
                  <li key={`${item.name}-${item.href}`}>
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
              })
            ) : (
              // Show message if no menu items are accessible
              <li className="px-3 py-4 text-center">
                <div className={`
                  p-3 rounded-lg transition-colors duration-300
                  ${theme === 'dark' 
                    ? 'bg-[#00ffff10] text-[#a8b2d1]' 
                    : 'bg-blue-50 text-gray-600'
                  }
                `}>
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">No Access</p>
                  <p className="text-xs mt-1">Contact administrator for permissions</p>
                </div>
              </li>
            )}
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
                  {userDisplayName}
                </p>
                <p className={`text-xs truncate px-2 py-0.5 rounded-full w-fit mt-1 ${getRoleColor(userRole)}`}>
                  {userRoleDisplay}
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
        {onToggleCollapse && (
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
        )}
      </div>
    </>
  );
}