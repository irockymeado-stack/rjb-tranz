 import React, { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  X, 
  TrendUp, 
  TrendDown, 
  Upload, 
  Download,
  CalendarBlank,
  Clock,
  CheckCircle,
  XCircle,
  CurrencyDollar,
  Funnel,
  MagnifyingGlass,
  FloppyDisk,
  ArrowRight,
  Plus,
  Lightning,
  Lock,
  ShieldCheck,
  CaretRight,
  CaretLeft
} from "@phosphor-icons/react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
  fee: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  receiptPrinted: boolean;
  phoneNumber: string;
  transactionType: 'send' | 'receive';
  uniqueId: string;
  formatId: string;
}

interface ExchangeRate {
  pair: string;
  rate: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

interface CountryInfo {
  flag: string;
  name: string;
  currency: string;
  pair: string;
  rate: ExchangeRate;
}

interface CountryModalProps {
  country: CountryInfo;
  transactions: Transaction[];
  onClose: () => void;
  onSendMoney: (currency: string) => void;
  onReceiveMoney: (currency: string) => void;
  onTransactionCreated?: (transaction: Transaction) => void;
}

interface TransactionFormData {
  fullName: string;
  email: string;
  amount: string;
  currency: string;
  phoneNumber: string;
}

type ModalStep = 'overview' | 'send' | 'receive' | 'transaction-form' | 'pending-transactions' | 'receiver-info' | 'preview';

const CountryModal: React.FC<CountryModalProps> = ({
  country,
  transactions,
  onClose,
  onSendMoney,
  onReceiveMoney,
  onTransactionCreated,
}) => {
  const [timeFilter, setTimeFilter] = useState("24h");
  const [searchTerm, setSearchTerm] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [currentStep, setCurrentStep] = useState<ModalStep>('overview');
  const [transactionType, setTransactionType] = useState<'send' | 'receive'>('send');
  const [isCreating, setIsCreating] = useState(false);
  const [isSecuring, setIsSecuring] = useState(false);
  const [formData, setFormData] = useState<TransactionFormData>({
    fullName: '',
    email: '',
    amount: '',
    currency: country.currency,
    phoneNumber: ''
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [receiverInfo, setReceiverInfo] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    currency: country.currency
  });
  const [customExchangeRate, setCustomExchangeRate] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed' | 'cancelled'>('all');
  const [expandedTransaction, setExpandedTransaction] = useState<Transaction | null>(null);

  // Utility functions
  const generateUniqueCode = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'RJB';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateTransactionId = (currency: string, phoneNumber: string): string => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');

    // Extract last 3 digits from phone number or use random digits if empty
    const lastThreeDigits = phoneNumber.trim()
      ? phoneNumber.replace(/\D/g, '').slice(-3).padStart(3, '0')
      : String(Math.floor(Math.random() * 1000)).padStart(3, '0');

    // Get transaction count (this would normally come from your database)
    const transactionCount = String((transactions.length + 1)).padStart(5, '0');

    const timestamp = `${day}${month}${hour}${minute}${second}`;

    return `${currency}-${lastThreeDigits}-${timestamp}-${transactionCount}`;
  };

  const handleSendClick = () => {
    setTransactionType('send');
    setCurrentStep('transaction-form');
  };

  const handleReceiveClick = () => {
    setTransactionType('receive');
    setCurrentStep('pending-transactions');
  };

  const handleFormChange = (field: keyof TransactionFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (!formData.amount.trim() || parseFloat(formData.amount) <= 0) {
      toast.error("Valid amount is required");
      return false;
    }
    if (!formData.currency.trim()) {
      toast.error("Currency is required");
      return false;
    }
    return true;
  };

  const handleSaveTransaction = async (continueToNext = false) => {
    if (!validateForm()) return;

    setIsCreating(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const uniqueCode = generateUniqueCode();
      const formatId = generateTransactionId(formData.currency, formData.phoneNumber);
      
      const newTransaction: Transaction = {
        id: `TXN-${Date.now()}`,
        clientName: formData.fullName,
        clientEmail: formData.email || '',
        amount: parseFloat(formData.amount),
        fromCurrency: transactionType === 'send' ? formData.currency : 'USD',
        toCurrency: transactionType === 'send' ? country.currency : formData.currency,
        exchangeRate: country.rate.rate,
        fee: parseFloat(formData.amount) * 0.025, // 2.5% fee
        status: 'pending',
        createdAt: new Date().toISOString(),
        receiptPrinted: false,
        phoneNumber: formData.phoneNumber || '',
        transactionType: transactionType,
        uniqueId: uniqueCode,
        formatId: formatId
      };

      // Call the callback to add transaction to the main app
      if (onTransactionCreated) {
        onTransactionCreated(newTransaction);
      }

      toast.success(`Transaction saved as pending. Code: ${uniqueCode}`);
      
      if (continueToNext) {
        // For send transactions, go to receiver info, for receive transactions, no change
        if (transactionType === 'send') {
          // Set as selected transaction for receiver info flow
          setSelectedTransaction(newTransaction);
          setCurrentStep('receiver-info');
        } else {
          setCurrentStep('overview');
        }
      } else {
        // Close modal and return to overview
        onClose();
      }
    } catch (error) {
      toast.error("Failed to save transaction");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateTransaction = async () => {
    if (!validateForm()) return;

    setIsSecuring(true);
    
    try {
      // Simulate security connection
      toast.info("Securing connection...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Connection secured!");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate codes
      const uniqueCode = generateUniqueCode();
      const formatId = generateTransactionId(formData.currency, formData.phoneNumber);
      
      const newTransaction: Transaction = {
        id: `TXN-${Date.now()}`,
        clientName: formData.fullName,
        clientEmail: formData.email || '',
        amount: parseFloat(formData.amount),
        fromCurrency: transactionType === 'send' ? formData.currency : 'USD',
        toCurrency: transactionType === 'send' ? country.currency : formData.currency,
        exchangeRate: country.rate.rate,
        fee: parseFloat(formData.amount) * 0.025, // 2.5% fee
        status: 'pending',
        createdAt: new Date().toISOString(),
        receiptPrinted: false,
        phoneNumber: formData.phoneNumber || '',
        transactionType: transactionType,
        uniqueId: uniqueCode,
        formatId: formatId
      };

      // Call the callback to add transaction to the main app
      if (onTransactionCreated) {
        onTransactionCreated(newTransaction);
      }

      toast.success(`Transaction created successfully!`);
      toast.info(`Unique Code: ${uniqueCode}`);
      toast.info(`Transaction ID: ${formatId}`);
      
      // Close modal after successful creation
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      toast.error("Failed to create transaction");
    } finally {
      setIsSecuring(false);
    }
  };

  const handleBackToOverview = () => {
    setCurrentStep('overview');
    setSelectedTransaction(null);
    setReceiverInfo({ fullName: '', email: '', phoneNumber: '', currency: country.currency });
    setStatusFilter('all');
    setFormData({
      fullName: '',
      email: '',
      amount: '',
      currency: country.currency,
      phoneNumber: ''
    });
  };

  const handleSelectTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleExpandTransaction = (transaction: Transaction) => {
    setExpandedTransaction(expandedTransaction?.id === transaction.id ? null : transaction);
  };

  const handleContinueFromPending = () => {
    if (selectedTransaction) {
      setCurrentStep('receiver-info');
    }
  };

  const handleReceiverInfoChange = (field: keyof typeof receiverInfo, value: string) => {
    setReceiverInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateReceiverInfo = (): boolean => {
    if (!receiverInfo.fullName.trim()) {
      toast.error("Receiver full name is required");
      return false;
    }
    return true;
  };

  const handlePreview = () => {
    if (validateReceiverInfo()) {
      setCurrentStep('preview');
    }
  };

  const calculateReceivingAmount = (transaction: Transaction): number => {
    // Auto convert to receiving country currency
    if (transaction.fromCurrency === country.currency) {
      return transaction.amount;
    } else {
      return transaction.amount * country.rate.rate;
    }
  };

  // Filter transactions by time, country, and status
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(t => 
      t.fromCurrency === country.currency || 
      t.toCurrency === country.currency
    );

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.uniqueId && t.uniqueId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply time filter
    const now = new Date();
    let cutoffDate: Date;

    if (showCustomDate && customDate) {
      cutoffDate = new Date(customDate);
    } else {
      switch (timeFilter) {
        case "6h":
          cutoffDate = new Date(now.getTime() - 6 * 60 * 60 * 1000);
          break;
        case "12h":
          cutoffDate = new Date(now.getTime() - 12 * 60 * 60 * 1000);
          break;
        case "24h":
          cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "48h":
          cutoffDate = new Date(now.getTime() - 48 * 60 * 60 * 1000);
          break;
        case "3d":
          cutoffDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
          break;
        case "1w":
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "1m":
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "1y":
          cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }
    }

    return filtered.filter(t => new Date(t.createdAt) >= cutoffDate);
  }, [transactions, country.currency, timeFilter, searchTerm, customDate, showCustomDate, statusFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const totalVolume = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalFees = filteredTransactions.reduce((sum, t) => sum + t.fee, 0);
  const completedCount = filteredTransactions.filter(t => t.status === 'completed').length;

  // Render pending transactions step
  const renderPendingTransactions = () => (
    <CardContent className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToOverview}
            className="h-10 w-10 p-0 hover:bg-muted"
          >
            <CaretLeft className="h-5 w-5" />
          </Button>
          <div>
            <h3 className="text-xl font-bold font-montserrat">
              Receive {country.currency}
            </h3>
            <p className="text-sm text-muted-foreground">
              Select a pending transaction to receive money
            </p>
          </div>
        </div>
        <div className="text-3xl animate-float">
          {country.flag}
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-gradient-to-r from-muted/20 via-muted/30 to-muted/20 border border-muted">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, ID, or RJB code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 backdrop-blur-sm border border-muted-foreground/20 focus:border-primary/50 transition-all duration-300 h-12"
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'completed', label: 'Completed' },
              { value: 'failed', label: 'Failed' },
              { value: 'cancelled', label: 'Cancelled' }
            ].map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(filter.value as any)}
                className="h-10 transition-all duration-300 hover:scale-105 text-sm"
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Time Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: "6h", label: "6h" },
              { value: "12h", label: "12h" },
              { value: "24h", label: "24h" },
              { value: "48h", label: "48h" },
              { value: "3d", label: "3d" },
              { value: "1w", label: "1w" },
              { value: "1m", label: "1m" }
            ].map((filter) => (
              <Button
                key={filter.value}
                variant={timeFilter === filter.value && !showCustomDate ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setTimeFilter(filter.value);
                  setShowCustomDate(false);
                }}
                className="h-10 transition-all duration-300 hover:scale-105 text-sm"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Transaction List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold font-montserrat">
            Available Transactions ({filteredTransactions.length})
          </h4>
          <Badge variant="outline" className="font-montserrat border-primary/50 text-primary">
            {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
          </Badge>
        </div>

        {filteredTransactions.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {filteredTransactions.map((transaction, index) => (
              <Card 
                key={transaction.id} 
                className={`p-4 transition-all duration-200 cursor-pointer border-2 ${
                  selectedTransaction?.id === transaction.id 
                    ? 'border-primary bg-primary/5 shadow-lg scale-[1.02]' 
                    : 'border-muted/50 hover:border-primary/30 hover:bg-muted/50 hover:shadow-md hover:scale-[1.01]'
                }`}
                onClick={() => handleSelectTransaction(transaction)}
                style={{animationDelay: `${index * 100}ms`}}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 ring-2 ring-muted hover:ring-primary transition-all duration-300">
                    <AvatarFallback className="font-medium bg-gradient-to-br from-primary/10 to-accent/10">
                      {transaction.clientName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate font-montserrat">
                        {transaction.clientName}
                      </p>
                      <Badge className={`${getStatusColor(transaction.status)} flex-shrink-0`}>
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1 capitalize">{transaction.status}</span>
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2 truncate font-montserrat">
                      {transaction.clientEmail}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <div className="font-semibold font-mono">
                          ${transaction.amount.toLocaleString()} {transaction.fromCurrency}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Receiving:</span>
                        <div className="font-semibold font-mono text-green-600">
                          {calculateReceivingAmount(transaction).toLocaleString()} {country.currency}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <div className="capitalize">{transaction.transactionType}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <div className="font-mono text-xs">{new Date(transaction.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>

                  {selectedTransaction?.id === transaction.id && (
                    <CheckCircle className="h-6 w-6 text-green-600 animate-pulse" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center bg-gradient-to-br from-muted/20 to-muted/30">
            <div className="space-y-4">
              <Download className="h-16 w-16 text-muted-foreground mx-auto animate-float" />
              <div>
                <h3 className="text-lg font-semibold font-montserrat">
                  No transactions found
                </h3>
                <p className="text-muted-foreground font-montserrat">
                  No transactions match your current filter criteria
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Continue Button */}
        {selectedTransaction && (
          <Button
            onClick={handleContinueFromPending}
            className="w-full h-12 bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 hover:from-green-700 hover:via-green-800 hover:to-emerald-800 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <ArrowRight className="h-5 w-5 mr-2" />
            Continue with Selected Transaction
          </Button>
        )}
      </div>
    </CardContent>
  );

  // Render receiver info step
  const renderReceiverInfo = () => (
    <CardContent className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStep('pending-transactions')}
            className="h-10 w-10 p-0 hover:bg-muted"
          >
            <CaretLeft className="h-5 w-5" />
          </Button>
          <div>
            <h3 className="text-xl font-bold font-montserrat">
              Receiver Information
            </h3>
            <p className="text-sm text-muted-foreground">
              Enter details for the money receiver
            </p>
          </div>
        </div>
        <div className="text-3xl animate-float">
          {country.flag}
        </div>
      </div>

      {/* Sender Information */}
      {selectedTransaction && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 dark:from-blue-950/30 dark:to-blue-900/30 dark:border-blue-800/30">
          <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-3">Sender Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span>
              <div className="font-medium">{selectedTransaction.clientName}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>
              <div className="font-medium">{selectedTransaction.clientEmail || 'Not provided'}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Phone:</span>
              <div className="font-medium">{selectedTransaction.phoneNumber || 'Not provided'}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Transaction ID:</span>
              <div className="font-mono text-xs">{selectedTransaction.formatId}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Receiver Form */}
      <div className="space-y-4">
        {/* Full Name - Mandatory */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={receiverInfo.fullName}
            onChange={(e) => handleReceiverInfoChange('fullName', e.target.value)}
            placeholder="Enter receiver's full name"
            className="h-12"
            required
          />
        </div>

        {/* Country and Currency */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Country <span className="text-red-500">*</span>
            </label>
            <div className="h-12 px-3 border rounded-md bg-muted/50 flex items-center gap-3">
              <span className="text-2xl">{country.flag}</span>
              <span className="font-medium">{country.name}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Currency <span className="text-red-500">*</span>
            </label>
            <Select value={receiverInfo.currency || country.currency} onValueChange={(value) => handleReceiverInfoChange('currency', value)}>
              <SelectTrigger className="h-12 font-mono">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                <SelectItem value="MXN">MXN - Mexican Peso</SelectItem>
                <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Email - Optional */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Email <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            type="email"
            value={receiverInfo.email}
            onChange={(e) => handleReceiverInfoChange('email', e.target.value)}
            placeholder="Enter email address"
            className="h-12"
          />
        </div>

        {/* Phone Number - Optional */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Phone Number <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            type="tel"
            value={receiverInfo.phoneNumber}
            onChange={(e) => handleReceiverInfoChange('phoneNumber', e.target.value)}
            placeholder="Enter phone number"
            className="h-12"
          />
        </div>
      </div>

      {/* Preview Button */}
      <Button
        onClick={handlePreview}
        className="w-full h-14 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl floating-button text-lg font-semibold"
      >
        <div className="flex items-center gap-2">
          <span>Preview Transaction</span>
          <ArrowRight className="h-5 w-5" />
        </div>
      </Button>
    </CardContent>
  );

  // Render preview step
  const renderPreview = () => (
    <CardContent className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStep('receiver-info')}
            className="h-10 w-10 p-0 hover:bg-muted"
          >
            <CaretLeft className="h-5 w-5" />
          </Button>
          <div>
            <h3 className="text-xl font-bold font-montserrat">
              Transaction Preview
            </h3>
            <p className="text-sm text-muted-foreground">
              Review and edit transaction details before printing
            </p>
          </div>
        </div>
        <div className="text-3xl animate-float">
          {country.flag}
        </div>
      </div>

      {/* Receipt Design */}
      {selectedTransaction && (
        <div className="space-y-6">
          {/* Receipt Container */}
          <div className="bg-white border-2 border-dashed border-gray-300 p-6 mx-auto" style={{maxWidth: '400px'}}>
            {/* Receipt Header */}
            <div className="text-center mb-6 pb-4 border-b-2 border-gray-200">
              <div className="text-2xl font-bold text-gray-800 mb-2">RJB TRANZ</div>
              <div className="text-sm text-gray-600">Money Transfer Receipt</div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date().toLocaleString()}
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-4">
              {/* Sender Information */}
              <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                <div className="text-xs font-semibold text-blue-800 mb-2">SENDER INFORMATION</div>
                <div className="space-y-1 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedTransaction.clientName}</div>
                  <div><span className="font-medium">Email:</span> {selectedTransaction.clientEmail || 'Not provided'}</div>
                  <div><span className="font-medium">Phone:</span> {selectedTransaction.phoneNumber || 'Not provided'}</div>
                </div>
              </div>

              {/* Receiver Information */}
              <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                <div className="text-xs font-semibold text-green-800 mb-2">RECEIVER INFORMATION</div>
                <div className="space-y-1 text-sm">
                  <div><span className="font-medium">Name:</span> {receiverInfo.fullName}</div>
                  <div><span className="font-medium">Email:</span> {receiverInfo.email || 'Not provided'}</div>
                  <div><span className="font-medium">Phone:</span> {receiverInfo.phoneNumber || 'Not provided'}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Country:</span>
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                  </div>
                </div>
              </div>

              {/* Amount Details */}
              <div className="bg-amber-50 p-3 rounded border-l-4 border-amber-400">
                <div className="text-xs font-semibold text-amber-800 mb-2">TRANSACTION DETAILS</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Amount Sent:</span>
                    <span className="font-bold">${selectedTransaction.amount.toLocaleString()} {selectedTransaction.fromCurrency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Exchange Rate:</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={customExchangeRate !== null ? customExchangeRate : country.rate.rate}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          setCustomExchangeRate(isNaN(value) ? country.rate.rate : value);
                        }}
                        className="font-mono w-20 h-6 text-xs"
                        step="0.0001"
                        min="0"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCustomExchangeRate(null)}
                        className="h-6 px-1 text-xs"
                        title="Reset to current rate"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Amount to Receive:</span>
                    <span className="font-bold text-green-600">
                      {(selectedTransaction.amount * (customExchangeRate !== null ? customExchangeRate : country.rate.rate)).toLocaleString()} {receiverInfo.currency || country.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Transaction Fee:</span>
                    <span>${selectedTransaction.fee.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Unique Code */}
              <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                <div className="text-xs font-semibold text-purple-800 mb-2">TRANSACTION CODE</div>
                <div className="text-lg font-mono font-bold text-purple-700 text-center">
                  {generateUniqueCode()}
                </div>
                <div className="text-xs text-purple-600 text-center mt-1">
                  Use this code to search your transaction
                </div>
              </div>
            </div>

            {/* Receipt Footer */}
            <div className="mt-6 pt-4 border-t-2 border-gray-200">
              <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                <span>Receipt generated on:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-center gap-4">
                <img
                  src="https://i.ibb.co/LX6sbL9S/flag-Starsand-Stripes-J.png"
                  alt="US Flag"
                  className="h-8 w-auto border border-gray-300"
                />
                <img
                  src="https://i.ibb.co/N6tH1VLj/Vector-Smart-Object-2.png"
                  alt="RJB Logo"
                  className="h-8 w-auto border border-gray-300"
                />
              </div>
              <div className="text-center text-xs text-gray-400 mt-2">
                This is a system-generated receipt
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4 border-t">
            <Button
              onClick={async () => {
                setIsSecuring(true);
                try {
                  toast.info("Processing transaction...");
                  await new Promise(resolve => setTimeout(resolve, 2000));

                  // Update transaction status to completed
                  const updatedTransaction = {
                    ...selectedTransaction,
                    status: 'completed' as const,
                    receiptPrinted: false
                  };

                  if (onTransactionCreated) {
                    onTransactionCreated(updatedTransaction);
                  }

                  toast.success("Transaction completed successfully!");
                  onClose();
                } catch (error) {
                  toast.error("Failed to complete transaction");
                } finally {
                  setIsSecuring(false);
                }
              }}
              disabled={isSecuring}
              className="w-full h-14 bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 hover:from-green-700 hover:via-green-800 hover:to-emerald-800 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl floating-button text-lg font-semibold"
            >
              {isSecuring ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  <span>Processing Transaction...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6" />
                  <span>Complete Transaction</span>
                </div>
              )}
            </Button>

            <Button
              onClick={() => setCurrentStep('receiver-info')}
              variant="outline"
              className="w-full h-12 border-2 border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300 hover:scale-105"
            >
              <CaretLeft className="h-5 w-5 mr-2" />
              Edit Information
            </Button>
          </div>
        </div>
      )}
    </CardContent>
  );

  // Render transaction form step
  const renderTransactionForm = () => (
    <CardContent className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToOverview}
            className="h-10 w-10 p-0 hover:bg-muted"
          >
            <CaretLeft className="h-5 w-5" />
          </Button>
          <div>
            <h3 className="text-xl font-bold font-montserrat capitalize">
              {transactionType} {country.currency}
            </h3>
            <p className="text-sm text-muted-foreground">
              Fill in the details to create a new transaction
            </p>
          </div>
        </div>
        <div className="text-3xl animate-float">
          {country.flag}
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Full Name - Mandatory */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.fullName}
            onChange={(e) => handleFormChange('fullName', e.target.value)}
            placeholder="Enter full name"
            className="h-12"
            required
          />
        </div>

        {/* Email - Optional */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Email <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleFormChange('email', e.target.value)}
            placeholder="Enter email address"
            className="h-12"
          />
        </div>

        {/* Amount and Currency - Mandatory */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Amount <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => handleFormChange('amount', e.target.value)}
              placeholder="0.00"
              className="h-12"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Currency <span className="text-red-500">*</span>
            </label>
            <Select value={formData.currency} onValueChange={(value) => handleFormChange('currency', value)}>
              <SelectTrigger className="h-12 font-mono">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                <SelectItem value="MXN">MXN - Mexican Peso</SelectItem>
                <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Phone Number - Optional for Send */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Phone Number <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
            placeholder="+1 234 567 8900"
            className="h-12"
          />
        </div>

        {/* Transaction Summary */}
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Transaction Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Type:</span>
                <div className="font-medium capitalize">{transactionType}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Exchange Rate:</span>
                <div className="font-mono">{country.rate.rate.toFixed(4)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Amount:</span>
                <div className="font-medium">{formData.amount || '0.00'} {formData.currency}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Estimated Fee:</span>
                <div className="font-medium">${formData.amount ? (parseFloat(formData.amount) * 0.025).toFixed(2) : '0.00'}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-4 border-t">
        {/* Save and Continue */}
        <Button
          onClick={() => handleSaveTransaction(true)}
          disabled={isCreating}
          className="w-full h-12 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
        >
          {isCreating ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Saving...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <FloppyDisk className="h-5 w-5" />
              <span>Save and Continue</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </Button>

        {/* Save Only */}
        <Button
          onClick={() => handleSaveTransaction(false)}
          disabled={isCreating}
          variant="outline"
          className="w-full h-12 border-2 border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300 hover:scale-105"
        >
          <FloppyDisk className="h-5 w-5 mr-2" />
          Save Only
        </Button>

        {/* Create Transaction (Floating) */}
        <div className="relative">
          <Button
            onClick={handleCreateTransaction}
            disabled={isSecuring}
            className="w-full h-14 bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 hover:from-green-700 hover:via-green-800 hover:to-emerald-800 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl floating-button text-lg font-semibold"
          >
            {isSecuring ? (
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 animate-pulse" />
                <div className="flex flex-col items-start">
                  <span className="text-sm">Securing Connection...</span>
                  <div className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    <span className="text-xs opacity-80">SSL Encryption Active</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus className="h-6 w-6" />
                <span>Create Transaction</span>
                <Lightning className="h-5 w-5" />
              </div>
            )}
          </Button>
        </div>
      </div>
    </CardContent>
  );

  return (
    <div 
      className="modal-backdrop"
      onClick={onClose}
    >
      <Card 
        className="modal-content bg-card backdrop-blur-none border-2 border-primary/20 animate-scale-in shadow-2xl mobile-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Conditional Step Rendering */}
        {currentStep === 'transaction-form' ? (
          <React.Fragment>
            {/* Transaction Form Header */}
            <CardHeader className="pb-4 border-b bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 relative overflow-hidden px-4 sm:px-6">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToOverview}
                    className="h-10 w-10 p-0 hover:bg-muted"
                  >
                    <CaretLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-bold font-montserrat capitalize">
                      {transactionType} {country.currency}
                    </CardTitle>
                    <CardDescription className="text-sm font-montserrat text-muted-foreground">
                      Complete the transaction details
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-10 w-10 p-0 hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            {renderTransactionForm()}
          </React.Fragment>
        ) : currentStep === 'pending-transactions' ? (
          <React.Fragment>
            {/* Pending Transactions Header */}
            <CardHeader className="pb-4 border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 relative overflow-hidden px-4 sm:px-6">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-200/30 to-transparent animate-pulse dark:via-green-800/30"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToOverview}
                    className="h-10 w-10 p-0 hover:bg-muted"
                  >
                    <CaretLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-bold font-montserrat">
                      Receive {country.currency}
                    </CardTitle>
                    <CardDescription className="text-sm font-montserrat text-muted-foreground">
                      Select a pending transaction to receive
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-10 w-10 p-0 hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            {renderPendingTransactions()}
          </React.Fragment>
        ) : currentStep === 'receiver-info' ? (
          <React.Fragment>
            {/* Receiver Info Header */}
            <CardHeader className="pb-4 border-b bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 relative overflow-hidden px-4 sm:px-6">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/30 to-transparent animate-pulse dark:via-blue-800/30"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep('pending-transactions')}
                    className="h-10 w-10 p-0 hover:bg-muted"
                  >
                    <CaretLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-bold font-montserrat">
                      Receiver Information
                    </CardTitle>
                    <CardDescription className="text-sm font-montserrat text-muted-foreground">
                      Enter details for the money receiver
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-10 w-10 p-0 hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            {renderReceiverInfo()}
          </React.Fragment>
        ) : currentStep === 'preview' ? (
          <React.Fragment>
            {/* Preview Header */}
            <CardHeader className="pb-4 border-b bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 relative overflow-hidden px-4 sm:px-6">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent animate-pulse dark:via-amber-800/30"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep('receiver-info')}
                    className="h-10 w-10 p-0 hover:bg-muted"
                  >
                    <CaretLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-bold font-montserrat">
                      Transaction Preview
                    </CardTitle>
                    <CardDescription className="text-sm font-montserrat text-muted-foreground">
                      Review transaction details before finalizing
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-10 w-10 p-0 hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            {renderPreview()}
          </React.Fragment>
        ) : (
          <CardContent className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-100px)] custom-scrollbar">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 relative overflow-hidden px-4 sm:px-6 py-4 mb-6 rounded-lg border border-primary/10">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse"></div>

              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="text-4xl sm:text-6xl animate-float flex-shrink-0">
                    {country.flag}
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg sm:text-2xl font-bold font-montserrat bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mobile-header truncate">
                      {country.name}
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-lg font-montserrat text-muted-foreground mobile-text truncate">
                      {country.currency} Exchange • Live Rates
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground h-10 w-10 p-0 hover:bg-destructive/10 hover:text-destructive transition-all duration-300 mobile-button flex-shrink-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Send/Receive Buttons - Icon Only */}
              <div className="flex justify-between items-center relative z-10 gap-4">
                <Button
                  onClick={handleSendClick}
                  size="sm"
                  className="h-10 w-10 p-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  title={`Send ${country.currency}`}
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleReceiveClick}
                  size="sm"
                  variant="outline"
                  className="h-10 w-10 p-0 border-2 border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                  title={`Receive ${country.currency}`}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Partial Info with Gradient Seal */}
            <div className="relative mb-6">
              <Card className="p-4 bg-gradient-to-br from-muted/10 via-muted/20 to-muted/30 border border-muted/50 relative overflow-hidden">
                {/* Gradient overlay to seal partial info */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                    <h4 className="font-semibold text-sm">Country Overview</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Currency:</span>
                      <div className="font-medium">{country.currency}</div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Exchange Rate:</span>
                      <div className="font-mono">{country.rate.rate.toFixed(4)}</div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">24h Change:</span>
                      <div className={`font-medium ${country.rate.changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {country.rate.changePercent > 0 ? '+' : ''}{country.rate.changePercent.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Total Transactions:</span>
                      <div className="font-medium">{filteredTransactions.length}</div>
                    </div>
                  </div>

                  {/* Click to view more overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                       onClick={() => setExpandedTransaction(expandedTransaction ? null : filteredTransactions[0] || null)}>
                    <div className="text-center text-white">
                      <div className="text-sm font-medium mb-1">Click to View Details</div>
                      <div className="text-xs opacity-80">Transaction History & Analytics</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-2 sm:p-2 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover:shadow-lg transition-all duration-300 animate-card-entrance mobile-card">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground font-montserrat mobile-text">Current Rate</p>
                      <p className="text-sm sm:text-lg font-bold font-mono bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent truncate">
                        {country.rate.rate.toFixed(4)}
                      </p>
                    </div>
                    <CurrencyDollar className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-pulse flex-shrink-0" weight="duotone" />
                  </div>
                </Card>
                
                <Card className="p-2 sm:p-2 bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 hover:shadow-lg transition-all duration-300 animate-card-entrance mobile-card" style={{animationDelay: '100ms'}}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground font-montserrat mobile-text">24h Change</p>
                      <div className={`flex items-center text-sm sm:text-sm font-bold ${
                        country.rate.changePercent > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {country.rate.changePercent > 0 ? (
                          <TrendUp className="h-2 w-2 mr-1 animate-bounce flex-shrink-0" />
                        ) : (
                          <TrendDown className="h-2 w-2 mr-1 animate-bounce flex-shrink-0" />
                        )}
                        <span className="truncate">{country.rate.changePercent > 0 ? '+' : ''}{country.rate.changePercent.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-2 sm:p-2 bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20 hover:shadow-lg transition-all duration-300 animate-card-entrance mobile-card" style={{animationDelay: '200ms'}}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground font-montserrat mobile-text">Last Updated</p>
                      <p className="text-xs sm:text-xs font-medium font-mono mobile-text truncate">
                        {new Date(country.rate.lastUpdated).toLocaleString()}
                      </p>
                    </div>
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-secondary animate-pulse flex-shrink-0" weight="duotone" />
                  </div>
                </Card>
              </div>

              {/* Transaction Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-2 sm:p-2 hover:shadow-md transition-all duration-300 animate-card-entrance mobile-card" style={{animationDelay: '300ms'}}>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground font-montserrat mobile-text">Total Volume</p>
                    <p className="text-sm sm:text-base font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      ${totalVolume.toLocaleString()}
                    </p>
                  </div>
                </Card>
                <Card className="p-2 sm:p-2 hover:shadow-md transition-all duration-300 animate-card-entrance mobile-card" style={{animationDelay: '400ms'}}>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground font-montserrat mobile-text">Total Fees</p>
                    <p className="text-sm sm:text-base font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                      ${totalFees.toLocaleString()}
                    </p>
                  </div>
                </Card>
                <Card className="p-2 sm:p-2 hover:shadow-md transition-all duration-300 animate-card-entrance mobile-card" style={{animationDelay: '500ms'}}>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground font-montserrat mobile-text">Completed</p>
                    <p className="text-sm sm:text-base font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {completedCount} / {filteredTransactions.length}
                    </p>
                  </div>
                </Card>
              </div>

              {/* Filters */}
              <Card className="p-3 sm:p-4 mb-6 bg-gradient-to-r from-muted/20 via-muted/30 to-muted/20 border border-muted animate-card-entrance mobile-card" style={{animationDelay: '600ms'}}>
                <div className="flex flex-col gap-4">
                  {/* Search */}
                  <div className="relative">
                    <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, ID, or RJB code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-background/50 backdrop-blur-sm border border-muted-foreground/20 focus:border-primary/50 transition-all duration-300 mobile-input h-12"
                    />
                  </div>

                  {/* Time Filters */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "6h", label: "6h" },
                      { value: "12h", label: "12h" },
                      { value: "24h", label: "24h" },
                      { value: "48h", label: "48h" },
                      { value: "3d", label: "3d" },
                      { value: "1w", label: "1w" },
                      { value: "1m", label: "1m" },
                      { value: "1y", label: "1y" },
                    ].map((filter) => (
                      <Button
                        key={filter.value}
                        variant={timeFilter === filter.value && !showCustomDate ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setTimeFilter(filter.value);
                          setShowCustomDate(false);
                        }}
                        className="h-10 transition-all duration-300 hover:scale-105 mobile-button text-sm"
                      >
                        {filter.label}
                      </Button>
                    ))}
                    <Button
                      variant={showCustomDate ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowCustomDate(!showCustomDate)}
                      className="h-10 transition-all duration-300 hover:scale-105 mobile-button text-sm"
                    >
                      <CalendarBlank className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Custom Date</span>
                      <span className="sm:hidden">Custom</span>
                    </Button>
                  </div>

                  {/* Custom Date Input */}
                  {showCustomDate && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 animate-fade-in">
                      <Input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="w-full sm:w-auto bg-background/50 backdrop-blur-sm mobile-input h-12"
                      />
                      <p className="text-sm text-muted-foreground font-montserrat mobile-text">
                        Showing transactions from this date onwards
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Recent Transactions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between animate-card-entrance" style={{animationDelay: '700ms'}}>
                  <h3 className="text-base sm:text-lg font-semibold font-montserrat bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mobile-header">
                    Recent Transactions ({filteredTransactions.length})
                  </h3>
                  <Badge variant="outline" className="font-montserrat border-primary/50 text-primary text-xs">
                    {showCustomDate ? "Custom Period" : timeFilter.toUpperCase()}
                  </Badge>
                </div>

                {filteredTransactions.length > 0 ? (
                  <div className="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto custom-scrollbar">
                    {filteredTransactions.map((transaction, index) => (
                      <div key={transaction.id}>
                        <Card
                          className={`p-3 sm:p-4 hover:bg-muted/50 hover:shadow-md hover:scale-[1.01] transition-all duration-200 animate-card-entrance border border-muted/50 hover:border-primary/30 mobile-card cursor-pointer ${
                            expandedTransaction?.id === transaction.id ? 'ring-2 ring-primary/50' : ''
                          }`}
                          style={{animationDelay: `${800 + index * 100}ms`}}
                          onClick={() => handleExpandTransaction(transaction)}
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 ring-2 ring-muted hover:ring-primary transition-all duration-300">
                              <AvatarFallback className="text-xs sm:text-sm font-medium bg-gradient-to-br from-primary/10 to-accent/10">
                                {transaction.clientName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                <p className="font-medium truncate font-montserrat mobile-text text-sm sm:text-base">
                                  {transaction.clientName}
                                </p>
                                <Badge className={`${getStatusColor(transaction.status)} flex-shrink-0 animate-pulse text-xs w-fit`}>
                                  {getStatusIcon(transaction.status)}
                                  <span className="ml-1 capitalize">{transaction.status}</span>
                                </Badge>
                              </div>

                              <p className="text-xs sm:text-sm text-muted-foreground mb-2 truncate font-montserrat mobile-text">
                                {transaction.clientEmail}
                              </p>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground font-montserrat mobile-text">Amount:</span>
                                  <div className="font-semibold font-mono">${transaction.amount.toLocaleString()}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground font-montserrat mobile-text">Fee:</span>
                                  <div className="font-semibold font-mono">${transaction.fee}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground font-montserrat mobile-text">Pair:</span>
                                  <div className="font-mono text-primary text-xs">{transaction.fromCurrency} → {transaction.toCurrency}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground font-montserrat mobile-text">Date:</span>
                                  <div className="font-mono text-xs">{new Date(transaction.createdAt).toLocaleDateString()}</div>
                                </div>
                              </div>
                            </div>

                            <div className="flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-muted"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExpandTransaction(transaction);
                                }}
                              >
                                <CaretRight className={`h-4 w-4 transition-transform duration-200 ${
                                  expandedTransaction?.id === transaction.id ? 'rotate-90' : ''
                                }`} />
                              </Button>
                            </div>
                          </div>
                        </Card>

                        {/* Expanded Details */}
                        {expandedTransaction?.id === transaction.id && (
                          <Card className="mt-2 p-4 bg-gradient-to-r from-muted/20 via-muted/30 to-muted/20 border border-primary/20 animate-fade-in">
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                                <h4 className="font-semibold text-sm">Transaction Details</h4>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-xs text-muted-foreground">Transaction ID:</span>
                                    <div className="font-mono text-sm font-medium">{transaction.formatId}</div>
                                  </div>
                                  <div>
                                    <span className="text-xs text-muted-foreground">Unique Code:</span>
                                    <div className="font-mono text-sm font-medium text-primary">{transaction.uniqueId}</div>
                                  </div>
                                  <div>
                                    <span className="text-xs text-muted-foreground">Phone:</span>
                                    <div className="text-sm">{transaction.phoneNumber || 'Not provided'}</div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div>
                                    <span className="text-xs text-muted-foreground">Exchange Rate:</span>
                                    <div className="font-mono text-sm">{country.rate.rate.toFixed(4)}</div>
                                  </div>
                                  <div>
                                    <span className="text-xs text-muted-foreground">Receiving Amount:</span>
                                    <div className="font-semibold text-green-600">
                                      {calculateReceivingAmount(transaction).toLocaleString()} {country.currency}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-xs text-muted-foreground">Time:</span>
                                    <div className="font-mono text-xs">{new Date(transaction.createdAt).toLocaleTimeString()}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Receipt Preview */}
                              <div className="mt-4 p-3 bg-white/50 rounded border border-muted/30">
                                <div className="text-xs text-muted-foreground mb-2">Receipt Preview:</div>
                                <div className="text-xs space-y-1">
                                  <div>RJB TRANZ - Money Transfer</div>
                                  <div>Code: {transaction.uniqueId}</div>
                                  <div>Amount: ${transaction.amount} → {calculateReceivingAmount(transaction)} {country.currency}</div>
                                  <div>Fee: ${transaction.fee}</div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card className="p-6 sm:p-8 text-center bg-gradient-to-br from-muted/20 to-muted/30 animate-card-entrance mobile-card" style={{animationDelay: '800ms'}}>
                    <div className="space-y-4">
                      <Funnel className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto animate-float" />
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold font-montserrat mobile-header">
                          No transactions found
                        </h3>
                        <p className="text-muted-foreground font-montserrat mobile-text text-sm">
                          No transactions match your current filter criteria for {country.name}
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          setSearchTerm("");
                          setTimeFilter("1m");
                          setShowCustomDate(false);
                          setCustomDate("");
                        }}
                        variant="outline"
                        className="mt-2 mobile-button h-10"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default CountryModal;
