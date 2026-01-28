'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { 
  ArrowDown, 
  ArrowUp, 
  History, 
  Wallet, 
  CreditCard, 
  DollarSign, 
  Eye, 
  Copy, 
  Check,
  X,
  ExternalLink,
  Calendar,
  User,
  Phone,
  Building,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Printer,
  Download
} from 'lucide-react';
import { useNotification } from '@/app/contexts/NotificationContext';
import api from '@/app/utils/api';

type TransactionType = {
  _id: string;
  userId: {
    _id: string;
    phone: string;
    name?: string;
  };
  class: string;
  type: 'deposit' | 'withdrawal' | 'game_purchase' | 'winning';
  amount: number;
  amountInString?: string;
  status: 'pending' | 'approved' | 'completed' | 'confirmed' | 'failed';
  reference: string;
  description: string;
  transactionId?: string;
  senderPhone?: string;
  senderName?: string;
  receiverPhone?: string;
  receiverName?: string;
  method?: 'telebirr' | 'cbe' | 'cash';
  reason?: string;
  metadata?: any;
  approvedBy?: string;
  completedBy?: string;
  confirmedBy?: string;
  createdAt: string;
  approvedAt?: string;
  completedAt?: string;
  confirmedAt?: string;
  updatedAt: string;
};

type WalletStats = {
  wallet: number;
  totalDeposit: number;
  totalWithdrawal: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  recentTransactions: TransactionType[];
};

type PaymentConfig = {
  telebirr: {
    phone: string;
    name: string;
  };
  cbe: {
    account: string;
    name: string;
  };
};

export default function WalletPage() {
  const { addNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw'>('overview');
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionType | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    telebirr: { phone: '', name: '' },
    cbe: { account: '', name: '' }
  });
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchStats();
    fetchTransactions();
    fetchPaymentConfig();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/wallet/stats');
      setStats(res.data.data);
    } catch (error: any) {
      console.error('Failed to fetch wallet stats:', error);
      showMessage(error.response?.data?.message || 'Failed to load wallet', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setIsLoadingTransactions(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user?._id) return;
      
      const res = await api.get(`/transactions/user/${user._id}?limit=20&page=1`);
      setTransactions(res.data.data);
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error);
      showMessage('Failed to load transactions', 'error');
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const fetchPaymentConfig = async () => {
    try {
      const res = await api.get('/accountants?blocked=false');
      const accountants = res.data.data;
      
      if (accountants.length > 0) {
        const latestAccountant = accountants[0];
        setPaymentConfig({
          telebirr: {
            phone: latestAccountant.phoneNumber,
            name: latestAccountant.fullName
          },
          cbe: {
            account: latestAccountant.accountNumber,
            name: latestAccountant.fullName
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch payment config:', error);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleViewTransaction = (transaction: TransactionType) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showMessage('Copied to clipboard!', 'success');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'approved': return <Check className="h-4 w-4 text-blue-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const confirmWithdrawal = async (transactionId: string) => {
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      const res = await api.put(`/transactions/confirm/${transactionId}`);
      if (res.data.success) {
        showMessage('Withdrawal confirmed successfully!', 'success');
        fetchStats();
        fetchTransactions();
        setShowTransactionModal(false);
      }
    } catch (error: any) {
      showMessage(error.response?.data?.message || 'Failed to confirm', 'error');
    }
  };

  const getTransactionLink = (transaction: TransactionType) => {
    if (!transaction.transactionId) return null;
    
    if (transaction.transactionId.startsWith('http')) {
      return transaction.transactionId;
    }
    
    if (transaction.method === 'cbe') {
      return `https://apps.cbe.com.et:100/?id=${transaction.transactionId}`;
    } else if (transaction.method === 'telebirr') {
      return `https://telebirr.ethiotelecom.et/txn/${transaction.transactionId}`;
    }
    return null;
  };

  const openTransactionInPopup = (transaction: TransactionType) => {
    const link = getTransactionLink(transaction);
    if (link) {
      window.open(link, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    }
  };

  const handlePrintReceipt = () => {
    if (!selectedTransaction) return;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      showMessage('Please allow popups to print receipt', 'error');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const currentDate = new Date().toLocaleString();

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transaction Receipt - ${selectedTransaction.reference}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f9fafb;
            padding: 30px;
            max-width: 800px;
            margin: 0 auto;
          }
          
          .receipt-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 40px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
          }
          
          .header h1 {
            color: #1f2937;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          
          .header h2 {
            color: #6b7280;
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 20px;
          }
          
          .header .logo {
            font-size: 18px;
            color: #3b82f6;
            font-weight: 600;
            margin-bottom: 10px;
          }
          
          .transaction-info {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .info-section {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }
          
          .section-title {
            font-size: 14px;
            font-weight: 600;
            color: #4b5563;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .info-row {
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
          }
          
          .info-label {
            font-size: 13px;
            color: #6b7280;
            font-weight: 500;
          }
          
          .info-value {
            font-size: 14px;
            color: #1f2937;
            font-weight: 600;
            text-align: right;
            max-width: 60%;
            word-break: break-word;
          }
          
          .amount-section {
            background: ${selectedTransaction.type === 'deposit' || selectedTransaction.type === 'winning' ? '#d1fae5' : '#fee2e2'};
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            margin: 30px 0;
            border: 1px solid ${selectedTransaction.type === 'deposit' || selectedTransaction.type === 'winning' ? '#a7f3d0' : '#fecaca'};
          }
          
          .amount {
            font-size: 32px;
            font-weight: 700;
            color: ${selectedTransaction.type === 'deposit' || selectedTransaction.type === 'winning' ? '#065f46' : '#991b1b'};
            margin-bottom: 8px;
          }
          
          .amount-in-words {
            font-size: 14px;
            color: #4b5563;
            font-style: italic;
            max-width: 500px;
            margin: 0 auto;
          }
          
          .status-badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .status-completed {
            background: #d1fae5;
            color: #065f46;
          }
          
          .status-confirmed {
            background: #dbeafe;
            color: #1e40af;
          }
          
          .status-pending {
            background: #fef3c7;
            color: #92400e;
          }
          
          .parties-section {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 30px 0;
          }
          
          .party-card {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }
          
          .party-title {
            font-size: 14px;
            font-weight: 600;
            color: #4b5563;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .timeline-section {
            margin-top: 30px;
          }
          
          .timeline-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
          }
          
          .timeline-item {
            background: #f8fafc;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
          }
          
          .timeline-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
          }
          
          .timeline-value {
            font-size: 13px;
            color: #1f2937;
            font-weight: 500;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          
          .disclaimer {
            font-size: 11px;
            color: #9ca3af;
            margin-top: 10px;
            font-style: italic;
          }
          
          .print-only {
            display: block;
          }
          
          @media print {
            body {
              padding: 0;
              background: white;
            }
            
            .receipt-container {
              box-shadow: none;
              padding: 20px;
            }
            
            .no-print {
              display: none !important;
            }
            
            .print-only {
              display: block;
            }
          }
          
          @page {
            margin: 20mm;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div class="logo">TEPI GIBY GUBAYE</div>
            <h1>Transaction Receipt</h1>
            <h2>Official Payment Confirmation</h2>
            <div class="print-only">
              <p>Receipt ID: ${selectedTransaction.reference}</p>
              <p>Generated: ${currentDate}</p>
            </div>
          </div>
          
          <div class="transaction-info">
            <div class="info-section">
              <div class="section-title">Transaction Details</div>
              <div class="info-row">
                <span class="info-label">Reference:</span>
                <span class="info-value">${selectedTransaction.reference}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Type:</span>
                <span class="info-value">${selectedTransaction.type.replace('_', ' ').toUpperCase()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Method:</span>
                <span class="info-value">${(selectedTransaction.method || 'N/A').toUpperCase()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Class:</span>
                <span class="info-value">${selectedTransaction.class}</span>
              </div>
            </div>
            
            <div class="info-section">
              <div class="section-title">Status & Date</div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">
                  <span class="status-badge ${
                    selectedTransaction.status === 'completed' ? 'status-completed' :
                    selectedTransaction.status === 'confirmed' ? 'status-confirmed' :
                    'status-pending'
                  }">
                    ${selectedTransaction.status.toUpperCase()}
                  </span>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Created:</span>
                <span class="info-value">${new Date(selectedTransaction.createdAt).toLocaleString()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Updated:</span>
                <span class="info-value">${new Date(selectedTransaction.updatedAt).toLocaleString()}</span>
              </div>
              ${selectedTransaction.approvedAt ? `
              <div class="info-row">
                <span class="info-label">Approved:</span>
                <span class="info-value">${new Date(selectedTransaction.approvedAt).toLocaleString()}</span>
              </div>
              ` : ''}
            </div>
          </div>
          
          <div class="amount-section">
            <div class="amount">
              ${selectedTransaction.type === 'deposit' || selectedTransaction.type === 'winning' ? '+' : '-'}${formatCurrency(selectedTransaction.amount)}
            </div>
            <div class="amount-in-words">
              ${selectedTransaction.amountInString || 'Amount not specified in words'}
            </div>
          </div>
          
          ${selectedTransaction.senderPhone || selectedTransaction.receiverPhone ? `
          <div class="parties-section">
            ${selectedTransaction.senderPhone ? `
            <div class="party-card">
              <div class="party-title">${selectedTransaction.type === 'deposit' ? 'FROM (Your Account)' : 'FROM (Platform Account)'}</div>
              <div class="info-row">
                <span class="info-label">${selectedTransaction.method === 'telebirr' ? 'Phone' : selectedTransaction.method === 'cbe' ? 'Account' : 'ID'}:</span>
                <span class="info-value">${selectedTransaction.senderPhone}</span>
              </div>
              ${selectedTransaction.senderName ? `
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${selectedTransaction.senderName}</span>
              </div>
              ` : ''}
            </div>
            ` : ''}
            
            ${selectedTransaction.receiverPhone ? `
            <div class="party-card">
              <div class="party-title">${selectedTransaction.type === 'deposit' ? 'TO (Platform Account)' : 'TO (Your Account)'}</div>
              <div class="info-row">
                <span class="info-label">${selectedTransaction.method === 'telebirr' ? 'Phone' : selectedTransaction.method === 'cbe' ? 'Account' : 'ID'}:</span>
                <span class="info-value">${selectedTransaction.receiverPhone}</span>
              </div>
              ${selectedTransaction.receiverName ? `
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${selectedTransaction.receiverName}</span>
              </div>
              ` : ''}
            </div>
            ` : ''}
          </div>
          ` : ''}
          
          ${selectedTransaction.description ? `
          <div class="info-section">
            <div class="section-title">Description</div>
            <p style="color: #1f2937; font-size: 14px; line-height: 1.5;">${selectedTransaction.description}</p>
          </div>
          ` : ''}
          
          ${selectedTransaction.transactionId ? `
          <div class="info-section">
            <div class="section-title">Transaction ID</div>
            <div style="background: #f3f4f6; padding: 10px; border-radius: 6px; margin-top: 10px;">
              <code style="font-family: monospace; font-size: 13px; color: #1f2937; word-break: break-all;">
                ${selectedTransaction.transactionId}
              </code>
            </div>
          </div>
          ` : ''}
          
          <div class="timeline-section">
            <div class="section-title">Process Information</div>
            <div class="timeline-grid">
              <div class="timeline-item">
                <div class="timeline-label">User</div>
                <div class="timeline-value">${user.name || 'N/A'} (${user.phone || 'N/A'})</div>
              </div>
              
              ${selectedTransaction.approvedBy ? `
              <div class="timeline-item">
                <div class="timeline-label">Approved By</div>
                <div class="timeline-value">${selectedTransaction.approvedBy}</div>
              </div>
              ` : ''}
              
              ${selectedTransaction.completedBy ? `
              <div class="timeline-item">
                <div class="timeline-label">Completed By</div>
                <div class="timeline-value">${selectedTransaction.completedBy}</div>
              </div>
              ` : ''}
              
              ${selectedTransaction.confirmedBy ? `
              <div class="timeline-item">
                <div class="timeline-label">Confirmed By</div>
                <div class="timeline-value">${selectedTransaction.confirmedBy}</div>
              </div>
              ` : ''}
            </div>
          </div>
          
          <div class="footer">
            <p>This is an official transaction receipt from Tepi Giby Gubaye</p>
            <p>For any queries, please contact our support team with reference number: <strong>${selectedTransaction.reference}</strong></p>
            <div class="disclaimer">
              This receipt is computer generated and does not require a signature.<br>
              Generated on: ${currentDate}
            </div>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleDownloadPDF = async () => {
    if (!selectedTransaction) return;

    try {
      // Get user info from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const currentDate = new Date().toLocaleString();
      
      // Create PDF content
      const pdfContent = `
        TEPI GIBY GUBAYE - TRANSACTION RECEIPT
        ======================================
        
        OFFICIAL TRANSACTION CONFIRMATION
        Generated: ${currentDate}
        
        TRANSACTION SUMMARY:
        --------------------
        Reference: ${selectedTransaction.reference}
        Type: ${selectedTransaction.type.replace('_', ' ').toUpperCase()}
        Status: ${selectedTransaction.status.toUpperCase()}
        Method: ${(selectedTransaction.method || 'N/A').toUpperCase()}
        Class: ${selectedTransaction.class}
        
        AMOUNT DETAILS:
        ---------------
        Amount: ${selectedTransaction.type === 'deposit' || selectedTransaction.type === 'winning' ? '+' : '-'}${formatCurrency(selectedTransaction.amount)}
        Amount in Words: ${selectedTransaction.amountInString || 'N/A'}
        
        TIMELINE:
        ---------
        Created: ${new Date(selectedTransaction.createdAt).toLocaleString()}
        Updated: ${new Date(selectedTransaction.updatedAt).toLocaleString()}
        ${selectedTransaction.approvedAt ? `Approved: ${new Date(selectedTransaction.approvedAt).toLocaleString()}` : ''}
        ${selectedTransaction.completedAt ? `Completed: ${new Date(selectedTransaction.completedAt).toLocaleString()}` : ''}
        ${selectedTransaction.confirmedAt ? `Confirmed: ${new Date(selectedTransaction.confirmedAt).toLocaleString()}` : ''}
        
        PARTIES INVOLVED:
        -----------------
        ${selectedTransaction.senderPhone ? `
        ${selectedTransaction.type === 'deposit' ? 'From (Your Account):' : 'From (Platform Account):'} ${selectedTransaction.senderPhone}
        ${selectedTransaction.senderName ? `Name: ${selectedTransaction.senderName}` : ''}
        ` : ''}
        
        ${selectedTransaction.receiverPhone ? `
        ${selectedTransaction.type === 'deposit' ? 'To (Platform Account):' : 'To (Your Account):'} ${selectedTransaction.receiverPhone}
        ${selectedTransaction.receiverName ? `Name: ${selectedTransaction.receiverName}` : ''}
        ` : ''}
        
        ${selectedTransaction.description ? `
        DESCRIPTION:
        ------------
        ${selectedTransaction.description}
        ` : ''}
        
        ${selectedTransaction.transactionId ? `
        TRANSACTION ID:
        ---------------
        ${selectedTransaction.transactionId}
        ` : ''}
        
        PROCESS INFORMATION:
        --------------------
        User: ${user.name || 'N/A'} (${user.phone || 'N/A'})
        ${selectedTransaction.approvedBy ? `Approved By: ${selectedTransaction.approvedBy}` : ''}
        ${selectedTransaction.completedBy ? `Completed By: ${selectedTransaction.completedBy}` : ''}
        ${selectedTransaction.confirmedBy ? `Confirmed By: ${selectedTransaction.confirmedBy}` : ''}
        
        ======================================
        
        ADDITIONAL INFORMATION:
        -----------------------
        This is an official transaction receipt from Tepi Giby Gubaye.
        This receipt is computer generated and does not require a signature.
        
        For any queries, please contact our support team with reference number: ${selectedTransaction.reference}
        
        ======================================
        END OF RECEIPT
      `;

      // Create blob and download
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const fileName = `receipt_${selectedTransaction.reference}_${new Date().toISOString().split('T')[0]}.txt`;
      
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showMessage('Receipt downloaded successfully!', 'success');
      
    } catch (error) {
      console.error('Error downloading receipt:', error);
      showMessage('Failed to download receipt', 'error');
    }
  };

  const WalletOverview = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Wallet Overview</h2>
        <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading wallet...</p>
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Deposits</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(stats.totalDeposit)}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
              <p className="text-sm text-red-600 dark:text-red-400 mb-1">Total Withdrawals</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(stats.totalWithdrawal)}
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center transition-colors"
              onClick={() => setActiveTab('deposit')}
            >
              <ArrowDown className="mr-2 h-5 w-5" /> Deposit
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium flex items-center justify-center transition-colors"
              onClick={() => setActiveTab('withdraw')}
            >
              <ArrowUp className="mr-2 h-5 w-5" /> Withdraw
            </motion.button>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Failed to load wallet data</p>
          <button 
            onClick={fetchStats}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </motion.div>
  );

  const DepositForm = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [formData, setFormData] = useState({
      amount: '',
      method: 'cash' as 'telebirr' | 'cbe' | 'cash',
      transactionId: '',
      senderPhone: '',
      description: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    };

    const validateForm = () => {
      const newErrors: Record<string, string> = {};
      
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        newErrors.amount = 'Please enter a valid amount';
      }
      
      if (formData.method === 'telebirr' || formData.method === 'cbe') {
        if (!formData.senderPhone) {
          newErrors.senderPhone = `Please enter your ${formData.method === 'telebirr' ? 'phone number' : 'account number'}`;
        }
        if (!formData.transactionId) {
          newErrors.transactionId = 'Transaction ID is required';
        }
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm()) {
        return;
      }

      setLoading(true);
      try {
        const amount = parseFloat(formData.amount);
        
        const amountInWords = await convertToWords(amount);
        
        const payload = {
          userId: user._id,
          amount,
          type: 'deposit',
          method: formData.method,
          transactionId: (formData.method === 'telebirr' || formData.method === 'cbe') ? formData.transactionId : undefined,
          senderPhone: (formData.method === 'telebirr' || formData.method === 'cbe') ? formData.senderPhone : undefined,
          senderName: user.name,
          receiverPhone: formData.method === 'telebirr' ? paymentConfig.telebirr.phone : 
                        formData.method === 'cbe' ? paymentConfig.cbe.account : undefined,
          receiverName: formData.method === 'telebirr' ? paymentConfig.telebirr.name : 
                        formData.method === 'cbe' ? paymentConfig.cbe.name : undefined,
          description: formData.description || `Deposit via ${formData.method.toUpperCase()}`,
          amountInString: amountInWords,
          class: user.role || 'user'
        };

        const res = await api.post('/transactions', payload);
        
        if (res.data.success) {
          showMessage('Deposit request submitted successfully!', 'success');
          setActiveTab('overview');
          setFormData({
            amount: '',
            method: 'cash',
            transactionId: '',
            senderPhone: '',
            description: '',
          });
          fetchStats();
          fetchTransactions();

          //add notification
        try {
          await addNotification(
            `New deposit created: ${formData.description || 'Deposit Request'}`,
            `/admin/transactions/approve`,
            'Audite'
          );
        } catch (notificationError) {
          console.error('Failed to add notification:', notificationError);
          // Optionally show error to user
        }
        } else {
          showMessage('Failed to submit deposit request', 'error');
        }
      } catch (error: any) {
        console.error('Deposit error:', error);
        showMessage(error.response?.data?.message || 'Deposit failed', 'error');
      } finally {
        setLoading(false);
      }
    };

    const convertToWords = async (num: number): Promise<string> => {
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
      const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      
      if (num === 0) return 'Zero';
      
      const convertBelowThousand = (n: number): string => {
        if (n === 0) return '';
        
        let result = '';
        
        if (n >= 100) {
          result += ones[Math.floor(n / 100)] + ' Hundred ';
          n %= 100;
        }
        
        if (n >= 20) {
          result += tens[Math.floor(n / 10)] + ' ';
          n %= 10;
        } else if (n >= 10) {
          result += teens[n - 10] + ' ';
          return result.trim();
        }
        
        if (n > 0) {
          result += ones[n] + ' ';
        }
        
        return result.trim();
      };
      
      let words = '';
      let number = Math.floor(num);
      
      if (number >= 1000) {
        words += convertBelowThousand(Math.floor(number / 1000)) + ' Thousand ';
        number %= 1000;
      }
      
      if (number > 0) {
        words += convertBelowThousand(number) + ' ';
      }
      
      return words.trim() + ' Birr';
    };

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <ArrowDown className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
          Deposit Funds
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['cash', 'telebirr', 'cbe'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => handleChange('method', method)}
                    className={`p-3 rounded-lg border transition-colors ${
                      formData.method === method
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      {method === 'telebirr' ? (
                        <Phone className="h-5 w-5 mb-1" />
                      ) : method === 'cbe' ? (
                        <Building className="h-5 w-5 mb-1" />
                      ) : (
                        <DollarSign className="h-5 w-5 mb-1" />
                      )}
                      <span className="text-sm font-medium capitalize">{method}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (ETB)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  className={`w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter amount"
                  min="1"
                  required
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>
            </div>

            {(formData.method === 'telebirr' || formData.method === 'cbe') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your {formData.method === 'telebirr' ? 'Phone Number' : 'Account Number'}
                  </label>
                  <input
                    type="text"
                    value={formData.senderPhone}
                    onChange={(e) => handleChange('senderPhone', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.senderPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={formData.method === 'telebirr' ? 'Enter your phone number' : 'Enter your account number'}
                  />
                  {errors.senderPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.senderPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    value={formData.transactionId}
                    onChange={(e) => handleChange('transactionId', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.transactionId ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter transaction ID from payment"
                  />
                  {errors.transactionId && (
                    <p className="mt-1 text-sm text-red-600">{errors.transactionId}</p>
                  )}
                </div>
              </>
            )}

            {(formData.method === 'telebirr' || formData.method === 'cbe') && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Send to:
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formData.method === 'telebirr' ? 'Phone Number' : 'Account Number'}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formData.method === 'telebirr' ? paymentConfig.telebirr.phone : paymentConfig.cbe.account}
                      </p>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(formData.method === 'telebirr' ? paymentConfig.telebirr.phone : paymentConfig.cbe.account)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        <Copy className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Account Name</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formData.method === 'telebirr' ? paymentConfig.telebirr.name : paymentConfig.cbe.name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter description"
                rows={2}
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </span>
                ) : (
                  'Submit Deposit'
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    );
  };

  const WithdrawalForm = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [formData, setFormData] = useState({
      amount: '',
      method: 'cash' as 'telebirr' | 'cbe' | 'cash',
      receiverPhone: '',
      description: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    };

    const validateForm = () => {
      const newErrors: Record<string, string> = {};
      
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        newErrors.amount = 'Please enter a valid amount';
      } else if (parseFloat(formData.amount) < 100) {
        newErrors.amount = 'Minimum withdrawal amount is 100 ETB';
      } else if (stats && parseFloat(formData.amount) > stats.wallet) {
        newErrors.amount = 'Insufficient balance';
      }
      
      if ((formData.method === 'telebirr' || formData.method === 'cbe') && !formData.receiverPhone) {
        newErrors.receiverPhone = `Please enter your ${formData.method === 'telebirr' ? 'phone number' : 'account number'}`;
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm()) {
        return;
      }

      setLoading(true);
      try {
        const amount = parseFloat(formData.amount);
        
        const amountInWords = await convertToWords(amount);
        
        const payload = {
          userId: user._id,
          amount,
          type: 'withdrawal',
          method: formData.method,
          receiverPhone: (formData.method === 'telebirr' || formData.method === 'cbe') ? formData.receiverPhone : undefined,
          receiverName: user.name,
          senderPhone: formData.method === 'telebirr' ? paymentConfig.telebirr.phone : 
                       formData.method === 'cbe' ? paymentConfig.cbe.account : undefined,
          senderName: formData.method === 'telebirr' ? paymentConfig.telebirr.name : 
                      formData.method === 'cbe' ? paymentConfig.cbe.name : undefined,
          description: formData.description || `Withdrawal via ${formData.method.toUpperCase()}`,
          amountInString: amountInWords,
          class: user.role || 'user'
        };

        const res = await api.post('/transactions', payload);
        
        if (res.data.success) {
          showMessage('Withdrawal request submitted successfully!', 'success');
          setActiveTab('overview');
          setFormData({
            amount: '',
            method: 'cash',
            receiverPhone: '',
            description: '',
          });
          fetchStats();
          fetchTransactions();

           //add notification
        try {
          await addNotification(
            `New withdrawal created: ${formData.description || 'Withdrawal Request'}`,
            `/admin/transactions/approve`,
            'Audite'
          );
        } catch (notificationError) {
          console.error('Failed to add notification:', notificationError);
          // Optionally show error to user
        }

        } else {
          showMessage('Failed to submit withdrawal request', 'error');
        }
      } catch (error: any) {
        console.error('Withdrawal error:', error);
        showMessage(error.response?.data?.message || 'Withdrawal failed', 'error');
      } finally {
        setLoading(false);
      }
    };

    const convertToWords = async (num: number): Promise<string> => {
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
      const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      
      if (num === 0) return 'Zero';
      
      const convertBelowThousand = (n: number): string => {
        if (n === 0) return '';
        
        let result = '';
        
        if (n >= 100) {
          result += ones[Math.floor(n / 100)] + ' Hundred ';
          n %= 100;
        }
        
        if (n >= 20) {
          result += tens[Math.floor(n / 10)] + ' ';
          n %= 10;
        } else if (n >= 10) {
          result += teens[n - 10] + ' ';
          return result.trim();
        }
        
        if (n > 0) {
          result += ones[n] + ' ';
        }
        
        return result.trim();
      };
      
      let words = '';
      let number = Math.floor(num);
      
      if (number >= 1000) {
        words += convertBelowThousand(Math.floor(number / 1000)) + ' Thousand ';
        number %= 1000;
      }
      
      if (number > 0) {
        words += convertBelowThousand(number) + ' ';
      }
      
      return words.trim() + ' Birr';
    };

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <ArrowUp className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
          Withdraw Funds
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Withdrawal Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['cash', 'telebirr', 'cbe'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => handleChange('method', method)}
                    className={`p-3 rounded-lg border transition-colors ${
                      formData.method === method
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                        : 'border-gray-300 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      {method === 'telebirr' ? (
                        <Phone className="h-5 w-5 mb-1" />
                      ) : method === 'cbe' ? (
                        <Building className="h-5 w-5 mb-1" />
                      ) : (
                        <DollarSign className="h-5 w-5 mb-1" />
                      )}
                      <span className="text-sm font-medium capitalize">{method}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (ETB)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  className={`w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter amount"
                  min="100"
                  max={stats?.wallet || 0}
                  required
                />
                {errors.amount ? (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                ) : (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Available: {formatCurrency(stats?.wallet || 0)} (Minimum: 100 ETB)
                  </p>
                )}
              </div>
            </div>

            {(formData.method === 'telebirr' || formData.method === 'cbe') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your {formData.method === 'telebirr' ? 'Phone Number' : 'Account Number'}
                </label>
                <input
                  type="text"
                  value={formData.receiverPhone}
                  onChange={(e) => handleChange('receiverPhone', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.receiverPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={formData.method === 'telebirr' ? 'Enter your phone number' : 'Enter your account number'}
                />
                {errors.receiverPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.receiverPhone}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter description"
                rows={2}
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </span>
                ) : formData.amount ? (
                  `Withdraw ${formatCurrency(parseFloat(formData.amount))}`
                ) : (
                  'Withdraw'
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    );
  };

  const TransactionHistory = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <History className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
          Transaction History
        </h2>
        <button
          onClick={fetchTransactions}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          Refresh
        </button>
      </div>

      {isLoadingTransactions ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8">
          <History className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No transactions yet</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'deposit' || transaction.type === 'winning' 
                            ? 'bg-green-100 dark:bg-green-900/20' 
                            : 'bg-red-100 dark:bg-red-900/20'
                        }`}>
                          {transaction.type === 'deposit' || transaction.type === 'winning' ? (
                            <ArrowDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <ArrowUp className="h-4 w-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {transaction.type.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {transaction.class}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${
                        transaction.type === 'deposit' || transaction.type === 'winning'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'deposit' || transaction.type === 'winning' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {transaction.amountInString}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1">{transaction.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white capitalize">
                      {transaction.method || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewTransaction(transaction)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      {transaction.type === 'withdrawal' && transaction.status === 'completed' && (
                        <button
                          onClick={() => confirmWithdrawal(transaction._id)}
                          className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'deposit' || transaction.type === 'winning' 
                          ? 'bg-green-100 dark:bg-green-900/20' 
                          : 'bg-red-100 dark:bg-red-900/20'
                      }`}>
                        {transaction.type === 'deposit' || transaction.type === 'winning' ? (
                          <ArrowDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowUp className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {transaction.type.replace('_', ' ')}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {transaction.class}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      <span className="ml-1">{transaction.status}</span>
                    </span>
                    <div className={`text-sm font-semibold mt-2 ${
                      transaction.type === 'deposit' || transaction.type === 'winning'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'deposit' || transaction.type === 'winning' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Method</p>
                    <p className="text-sm text-gray-900 dark:text-white capitalize">
                      {transaction.method || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {transaction.description}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewTransaction(transaction)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    {transaction.type === 'withdrawal' && transaction.status === 'completed' && (
                      <button
                        onClick={() => confirmWithdrawal(transaction._id)}
                        className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );

  const TransactionModal = () => {
    if (!selectedTransaction) return null;

    const transactionLink = getTransactionLink(selectedTransaction);
    
    // Check if print/download should be allowed
    const canShowPrintDownload = () => {
      if (!selectedTransaction) return false;
      
      // For deposits: only when status is 'completed'
      if (selectedTransaction.type === 'deposit' && selectedTransaction.status === 'completed') {
        return true;
      }
      
      // For withdrawals: only when status is 'confirmed'
      if (selectedTransaction.type === 'withdrawal' && selectedTransaction.status === 'confirmed') {
        return true;
      }
      
      return false;
    };

    const showPrintDownloadButtons = canShowPrintDownload();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div 
          ref={modalRef}
          className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Transaction Details</h3>
              <button 
                onClick={() => setShowTransactionModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Transaction Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Reference</p>
                      <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                        {selectedTransaction.reference}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {selectedTransaction.type.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Class</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedTransaction.class}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Amount Details</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                      <p className={`text-xl font-bold ${
                        selectedTransaction.type === 'deposit' || selectedTransaction.type === 'winning'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {selectedTransaction.type === 'deposit' || selectedTransaction.type === 'winning' ? '+' : '-'}
                        {formatCurrency(selectedTransaction.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Amount in Words</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedTransaction.amountInString}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Method</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {selectedTransaction.method}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Status</h4>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(selectedTransaction.status)}`}>
                      {getStatusIcon(selectedTransaction.status)}
                      <span className="ml-2 capitalize">{selectedTransaction.status}</span>
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Timeline</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(selectedTransaction.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Updated</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(selectedTransaction.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {(selectedTransaction.senderPhone || selectedTransaction.receiverPhone || selectedTransaction.senderName || selectedTransaction.receiverName) && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Parties Involved</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTransaction.senderPhone && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedTransaction.type === 'deposit' ? 'From (Your Account)' : 'From (Platform Account)'}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedTransaction.senderPhone}
                        </p>
                        {selectedTransaction.senderName && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedTransaction.senderName}
                          </p>
                        )}
                      </div>
                    )}
                    {selectedTransaction.receiverPhone && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedTransaction.type === 'deposit' ? 'To (Platform Account)' : 'To (Your Account)'}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedTransaction.receiverPhone}
                        </p>
                        {selectedTransaction.receiverName && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedTransaction.receiverName}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Additional Information</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedTransaction.description}
                    </p>
                  </div>
                  {selectedTransaction.transactionId && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Transaction ID</p>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {transactionLink ? (
                            <button
                              onClick={() => openTransactionInPopup(selectedTransaction)}
                              className="text-sm font-mono text-blue-600 dark:text-blue-400 hover:underline break-all text-left"
                            >
                              {selectedTransaction.transactionId}
                            </button>
                          ) : (
                            <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                              {selectedTransaction.transactionId}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => copyToClipboard(selectedTransaction.transactionId!)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 ml-2"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  {selectedTransaction.reason && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Reason</p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {selectedTransaction.reason}
                      </p>
                    </div>
                  )}
                  {selectedTransaction.metadata && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Metadata</p>
                      <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                        {JSON.stringify(selectedTransaction.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {(selectedTransaction.approvedBy || selectedTransaction.approvedAt) && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Approval Information</h4>
                  <div className="space-y-3">
                    {selectedTransaction.approvedBy && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Approved By</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedTransaction.approvedBy}
                        </p>
                      </div>
                    )}
                    {selectedTransaction.approvedAt && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Approved At</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(selectedTransaction.approvedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(selectedTransaction.completedBy || selectedTransaction.completedAt) && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Completion Information</h4>
                  <div className="space-y-3">
                    {selectedTransaction.completedBy && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Completed By</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedTransaction.completedBy}
                        </p>
                      </div>
                    )}
                    {selectedTransaction.completedAt && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Completed At</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(selectedTransaction.completedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(selectedTransaction.confirmedBy || selectedTransaction.confirmedAt) && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Confirmation Information</h4>
                  <div className="space-y-3">
                    {selectedTransaction.confirmedBy && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Confirmed By</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedTransaction.confirmedBy}
                        </p>
                      </div>
                    )}
                    {selectedTransaction.confirmedAt && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Confirmed At</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(selectedTransaction.confirmedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {transactionLink && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                    Transaction Verification
                  </h4>
                  <button 
                    onClick={() => openTransactionInPopup(selectedTransaction)}
                    className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View transaction on {selectedTransaction.method?.toUpperCase()} (Popup)
                  </button>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {/* Print and Download buttons - only show when conditions are met */}
                {showPrintDownloadButtons && (
                  <>
                    <button
                      onClick={handlePrintReceipt}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
                {selectedTransaction.type === 'withdrawal' && selectedTransaction.status === 'completed' && (
                  <button
                    onClick={() => confirmWithdrawal(selectedTransaction._id)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Confirm Withdrawal
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Withdraw and Deposit Request for Tepi Giby Gubaye</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Home
              </button>
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-2 mb-6">
          {['overview', 'deposit', 'withdraw'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {message && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && <WalletOverview key="overview" />}
          {activeTab === 'deposit' && <DepositForm key="deposit" />}
          {activeTab === 'withdraw' && <WithdrawalForm key="withdraw" />}
        </AnimatePresence>
        
        <TransactionHistory />
        
        {showTransactionModal && <TransactionModal />}
      </div>
    </div>
  );
}