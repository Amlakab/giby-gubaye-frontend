// app/admin/notifications/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  FiBell, FiCheck, FiTrash2, FiFilter, FiSearch, 
  FiEye, FiEyeOff, FiRefreshCw, FiChevronDown, FiChevronUp,
  FiCalendar, FiUser, FiMessageSquare, FiLink, FiClock
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '@/app/contexts/NotificationContext';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme-context';

interface NotificationItem {
  _id: string;
  message: string;
  link: string;
  read: boolean;
  role: string;
  createdAt: string;
  creator?: {
    name: string;
    email: string;
    role: string;
  };
}

const roleLabels: Record<string, string> = {
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

const roleColors: Record<string, string> = {
  'user': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'disk-user': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'spinner-user': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  'accountant': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'admin': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'Abalat-Guday': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  'Mezmur': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Timhrt': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  'Muyana-Terado': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
  'Priesedant': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
  'Vice-Priesedant': 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300',
  'Secretary': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  'Bachna-Department': 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300',
  'Audite': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
  'Limat': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { 
    notifications, 
    unreadCount,
    isLoading,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    refreshNotifications,
    fetchNotifications
  } = useNotification();

  const [filteredNotifications, setFilteredNotifications] = useState<NotificationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [expandedNotifications, setExpandedNotifications] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter notifications by user role (non-admins only see their role)
  const roleBasedNotifications = React.useMemo(() => {
    if (user?.role === 'admin') {
      return notifications;
    }
    return notifications.filter(notification => notification.role === user?.role);
  }, [notifications, user?.role]);

  // Get all available roles from notifications (based on user permissions)
  const availableRoles = React.useMemo(() => {
    const roles = Array.from(new Set(roleBasedNotifications.map(n => n.role)));
    return roles.sort();
  }, [roleBasedNotifications]);

  // Apply filters
  useEffect(() => {
    let filtered = roleBasedNotifications;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(notification =>
        notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (notification.creator?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        roleLabels[notification.role]?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter === 'read') {
      filtered = filtered.filter(notification => notification.read);
    } else if (statusFilter === 'unread') {
      filtered = filtered.filter(notification => !notification.read);
    }

    // Apply role filter (only show roles user has access to)
    if (roleFilter !== 'all') {
      filtered = filtered.filter(notification => notification.role === roleFilter);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      if (dateFilter === 'today') {
        filtered = filtered.filter(notification => {
          const notificationDate = new Date(notification.createdAt);
          return notificationDate.toDateString() === now.toDateString();
        });
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(notification => 
          new Date(notification.createdAt) >= weekAgo
        );
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(notification => 
          new Date(notification.createdAt) >= monthAgo
        );
      }
    }

    // Sort by newest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setFilteredNotifications(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [roleBasedNotifications, searchQuery, statusFilter, roleFilter, dateFilter]);

  // Get paginated notifications
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

  // Toggle notification expansion
  const toggleExpand = (id: string) => {
    setExpandedNotifications(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Toggle notification selection
  const toggleSelection = (id: string) => {
    setSelectedNotifications(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Select all notifications on current page
  const selectAllOnPage = () => {
    const pageIds = paginatedNotifications.map(n => n._id);
    if (selectedNotifications.length === pageIds.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(pageIds);
    }
  };

  // Mark selected as read
  const markSelectedAsRead = async () => {
    for (const id of selectedNotifications) {
      await markAsRead(id);
    }
    setSelectedNotifications([]);
  };

  // Delete selected notifications (admin only)
  const deleteSelected = async () => {
    if (user?.role !== 'admin') return;
    
    for (const id of selectedNotifications) {
      await deleteNotification(id);
    }
    setSelectedNotifications([]);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get statistics
 // Get statistics
const getStatistics = () => {
  const total = roleBasedNotifications.length;
  const read = roleBasedNotifications.filter(n => n.read).length;
  const unread = total - read;
  
  const roleStats: Record<string, { total: number; unread: number }> = {};
  roleBasedNotifications.forEach(notification => {
    if (!roleStats[notification.role]) {
      roleStats[notification.role] = { total: 0, unread: 0 };
    }
    roleStats[notification.role].total++;
    if (!notification.read) {
      roleStats[notification.role].unread++;
    }
  });

  return { total, read, unread, roleStats };
};

  const statistics = getStatistics();

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setRoleFilter('all');
    setDateFilter('all');
  };

  // Initialize on component mount
  useEffect(() => {
    refreshNotifications();
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <FiBell className="mr-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
                Notifications
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {user?.role === 'admin' 
                  ? 'Manage all system notifications' 
                  : `View notifications for ${roleLabels[user?.role || 'user']} role`}
              </p>
            </div>
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => refreshNotifications()}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center"
              >
                <FiRefreshCw className="mr-2 h-5 w-5" />
                Refresh
              </motion.button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4">
                  <FiBell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statistics.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg mr-4">
                  <FiCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Read</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statistics.read}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg mr-4">
                  <FiEyeOff className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unread</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statistics.unread}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg mr-4">
                  <FiUser className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Roles</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {availableRoles.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center"
            >
              <FiFilter className="mr-2 h-5 w-5" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Search
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search notifications..."
                        className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                      <option value="all">All Status</option>
                      <option value="read">Read</option>
                      <option value="unread">Unread</option>
                    </select>
                  </div>

                  {/* Role Filter */}
                  {availableRoles.length > 1 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Role
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                      >
                        <option value="all">All Roles</option>
                        {availableRoles.map(role => (
                          <option key={role} value={role}>
                            {roleLabels[role] || role}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Date Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    Clear All Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <p className="text-blue-700 dark:text-blue-300 font-medium">
                  {selectedNotifications.length} notification(s) selected
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={markSelectedAsRead}
                    className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors flex items-center"
                  >
                    <FiCheck className="mr-2 h-5 w-5" />
                    Mark as Read
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={deleteSelected}
                      className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors flex items-center"
                    >
                      <FiTrash2 className="mr-2 h-5 w-5" />
                      Delete Selected
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Notifications Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={paginatedNotifications.length > 0 && selectedNotifications.length === paginatedNotifications.length}
                onChange={selectAllOnPage}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Select All
              </span>
              <div className="ml-auto flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {paginatedNotifications.length} of {filteredNotifications.length} notifications
                </span>
                <button
                  onClick={markAllAsRead}
                  disabled={statistics.unread === 0}
                  className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <FiCheck className="mr-2 h-5 w-5" />
                  Mark All Read
                </button>
              </div>
            </div>
          </div>

          {/* Table Body */}
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading notifications...</p>
            </div>
          ) : paginatedNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <FiBell className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No notifications found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filteredNotifications.length === 0
                  ? 'No notifications match your filters.'
                  : 'Try adjusting your search or filters.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedNotifications.map((notification) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${
                    !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="flex items-start">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification._id)}
                      onChange={() => toggleSelection(notification._id)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 mt-1"
                    />

                    {/* Status Indicator */}
                    <div className="ml-3">
                      {!notification.read ? (
                        <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse"></div>
                      ) : (
                        <FiCheck className="h-4 w-4 text-green-500" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="ml-4 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${roleColors[notification.role]}`}>
                              {roleLabels[notification.role] || notification.role}
                            </span>
                            {!notification.read && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                Unread
                              </span>
                            )}
                          </div>

                          <p className="text-gray-900 dark:text-white font-medium mb-1">
                            {notification.message}
                          </p>

                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4">
                            <span className="flex items-center">
                              <FiClock className="mr-1 h-4 w-4" />
                              {formatDate(notification.createdAt)}
                            </span>
                            {notification.creator && (
                              <span className="flex items-center">
                                <FiUser className="mr-1 h-4 w-4" />
                                By: {notification.creator.name}
                              </span>
                            )}
                            <span className="flex items-center">
                              <FiLink className="mr-1 h-4 w-4" />
                              Link: {notification.link}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                              title="Mark as read"
                            >
                              <FiCheck className="h-5 w-5" />
                            </button>
                          )}
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => deleteNotification(notification._id)}
                              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Delete notification"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => toggleExpand(notification._id)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          >
                            {expandedNotifications.includes(notification._id) ? (
                              <FiChevronUp className="h-5 w-5" />
                            ) : (
                              <FiChevronDown className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {expandedNotifications.includes(notification._id) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                          >
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Details</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  <strong>Created:</strong> {new Date(notification.createdAt).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  <strong>ID:</strong> {notification._id}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Actions</h4>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => {
                                      markAsRead(notification._id);
                                      // Navigate to link
                                      window.location.href = notification.link;
                                    }}
                                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                                  >
                                    Go to Link
                                  </button>
                                  {user?.role === 'admin' && (
                                    <button
                                      onClick={() => deleteNotification(notification._id)}
                                      className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-sm hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Role Statistics */}
        {user?.role === 'admin' && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Role Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(statistics.roleStats).map(([role, stats]) => {
                // Calculate read count from total and unread
                const readCount = stats.total - stats.unread;
                const readRate = stats.total > 0 ? Math.round((readCount / stats.total) * 100) : 0;
                
                return (
                <div
                    key={role}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                    <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleColors[role]}`}>
                        {roleLabels[role] || role}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {stats.unread} unread
                    </span>
                    </div>
                    <div className="flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total notifications</p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {readRate}%
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Read rate</p>
                    </div>
                    </div>
                </div>
                );
            })}
            </div>
        </div>
        )}
      </div>
    </div>
  );
}