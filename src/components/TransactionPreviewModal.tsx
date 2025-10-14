import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  X,
  Printer,
  DownloadSimple,
  CheckCircle,
  Clock,
  XCircle,
  CurrencyDollar,
  FileText,
  Receipt,
  ArrowRight,
  CaretRight,
  CaretLeft
} from "@phosphor-icons/react";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

interface TransactionPreviewModalProps {
  transaction: Transaction;
  onClose: () => void;
  onComplete: (transactionId: string) => void;
  onContinue: (transactionData: any) => void;
  onStatusUpdate: (transactionId: string, newStatus: Transaction['status']) => void;
}

const TransactionPreviewModal: React.FC<TransactionPreviewModalProps> = ({
  transaction,
  onClose,
  onComplete,
  onContinue,
  onStatusUpdate,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const calculateReceivingAmount = (transaction: Transaction): number => {
    if (transaction.fromCurrency === transaction.toCurrency) {
      return transaction.amount;
    } else {
      return transaction.amount * transaction.exchangeRate;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const generatePDF = async () => {
    if (!receiptRef.current) return;

    setIsPrinting(true);
    try {
      // Create canvas from receipt element
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 400,
        height: 600
      });

      const imgData = canvas.toDataURL('image/png');

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 120] // Standard receipt size
      });

      // Add image to PDF
      const imgWidth = 70;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 5, 5, imgWidth, imgHeight);

      // Save PDF
      const fileName = `receipt_${transaction.uniqueId}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast.success("Receipt PDF downloaded successfully!");
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to generate PDF receipt");
    } finally {
      setIsPrinting(false);
    }
  };

  const printToPrinter = async () => {
    setIsPrinting(true);
    try {
      // For Epson printers, we'll use the browser's print functionality
      // This works with most thermal printers when connected via USB
      if (receiptRef.current) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Receipt - ${transaction.uniqueId}</title>
                <style>
                  body {
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    line-height: 1.2;
                    margin: 0;
                    padding: 10px;
                    width: 80mm;
                  }
                  .receipt {
                    max-width: 80mm;
                    margin: 0 auto;
                  }
                  .center { text-align: center; }
                  .bold { font-weight: bold; }
                  .divider {
                    border-top: 1px dashed #000;
                    margin: 8px 0;
                  }
                  @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                  }
                </style>
              </head>
              <body>
                <div class="receipt">
                  <div class="center bold">RJB TRANZ</div>
                  <div class="center">Money Transfer Receipt</div>
                  <div class="divider"></div>

                  <div><strong>Transaction ID:</strong> ${transaction.formatId}</div>
                  <div><strong>Code:</strong> ${transaction.uniqueId}</div>
                  <div><strong>Client:</strong> ${transaction.clientName}</div>
                  <div><strong>Amount:</strong> $${transaction.amount.toLocaleString()}</div>
                  <div><strong>Fee:</strong> $${transaction.fee}</div>
                  <div><strong>Exchange Rate:</strong> ${transaction.exchangeRate.toFixed(4)}</div>
                  <div><strong>Receiving:</strong> ${calculateReceivingAmount(transaction).toLocaleString()} ${transaction.toCurrency}</div>
                  <div><strong>Date:</strong> ${new Date(transaction.createdAt).toLocaleDateString()}</div>
                  <div><strong>Time:</strong> ${new Date(transaction.createdAt).toLocaleTimeString()}</div>

                  <div class="divider"></div>
                  <div class="center">Thank you for using RJB TRANZ!</div>
                  <div class="center">www.rjbtranz.com</div>
                </div>
                <script>
                  window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 1000);
                  }
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      }
      toast.success("Receipt sent to printer!");
    } catch (error) {
      console.error('Error printing:', error);
      toast.error("Failed to print receipt");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="max-w-2xl mx-auto mt-8">
        <Card className="bg-card border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Transaction Details
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-10 w-10 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <CardDescription>
              Transaction ID: {transaction.formatId}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Transaction Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Transaction Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={getStatusColor(transaction.status)}>
                      {getStatusIcon(transaction.status)}
                      <span className="ml-1 capitalize">{transaction.status}</span>
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="capitalize">{transaction.transactionType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(transaction.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unique Code:</span>
                    <span className="font-mono font-bold text-primary">{transaction.uniqueId}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3">Client Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span>{transaction.clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{transaction.clientEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{transaction.phoneNumber || 'Not provided'}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Amount Details */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Amount Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    ${transaction.amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Send Amount</div>
                  <div className="text-xs text-muted-foreground">{transaction.fromCurrency}</div>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {calculateReceivingAmount(transaction).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Receive Amount</div>
                  <div className="text-xs text-muted-foreground">{transaction.toCurrency}</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Exchange Rate:</span>
                  <span className="font-mono">{transaction.exchangeRate.toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Fee:</span>
                  <span className="font-mono">${transaction.fee}</span>
                </div>
              </div>
            </Card>

            {/* Receipt Preview */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Receipt Preview</h3>
              <div
                ref={receiptRef}
                className="bg-white border border-muted rounded-lg p-4 text-xs font-mono max-w-sm mx-auto"
                style={{ fontFamily: 'Courier New, monospace' }}
              >
                <div className="text-center font-bold mb-2">RJB TRANZ</div>
                <div className="text-center mb-3">Money Transfer Receipt</div>
                <div className="border-t border-b border-dashed py-2 mb-2">
                  <div>Transaction ID: {transaction.formatId}</div>
                  <div>Code: {transaction.uniqueId}</div>
                  <div>Client: {transaction.clientName}</div>
                </div>
                <div className="space-y-1">
                  <div>Amount: ${transaction.amount.toLocaleString()}</div>
                  <div>Fee: ${transaction.fee}</div>
                  <div>Exchange Rate: {transaction.exchangeRate.toFixed(4)}</div>
                  <div>Receiving: {calculateReceivingAmount(transaction).toLocaleString()} {transaction.toCurrency}</div>
                  <div>Date: {new Date(transaction.createdAt).toLocaleDateString()}</div>
                  <div>Time: {new Date(transaction.createdAt).toLocaleTimeString()}</div>
                </div>
                <div className="border-t border-dashed mt-2 pt-2 text-center">
                  <div>Thank you for using RJB TRANZ!</div>
                  <div>www.rjbtranz.com</div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              {/* Status Update */}
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Update Status</label>
                <Select
                  value={transaction.status}
                  onValueChange={(value: Transaction['status']) => onStatusUpdate(transaction.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Print Options */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={generatePDF}
                  disabled={isPrinting}
                  className="flex items-center gap-2"
                >
                  <DownloadSimple className="h-4 w-4" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={printToPrinter}
                  disabled={isPrinting}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 pt-4 border-t">
              {transaction.status === 'pending' && (
                <Button
                  onClick={() => onComplete(transaction.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Transaction
                </Button>
              )}
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionPreviewModal;
