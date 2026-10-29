export type CyberCafeJobStatus = 'pending' | 'processing' | 'completed' | 'delivered' | 'cancelled';
export type CyberCafePaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'due' | 'partial';

export interface CyberCafeJobStatusHistoryEntry {
  id: string;
  fromStatus?: CyberCafeJobStatus;
  toStatus: CyberCafeJobStatus;
  timestamp: string; // e.g. 'Oct 24, 2026, 10:30 AM'
  note?: string; // Optional update note or handover comment
  updatedBy?: string; // e.g. 'Shop Operator'
}

export interface CyberCafeJob {
  id: string; // Automatically generated Job ID (e.g. 'JOB-2026-101')
  tokenNumber: number; // Automatically generated Token Number (e.g. 101)
  customerId?: string; // Linked Customer ID (e.g. 'CUST-1001')
  customerName: string; // Customer Full Name
  customerMobile: string; // Customer Mobile Number
  villageOrCity?: string; // Customer Village/City/Address
  serviceName?: string; // Service Name
  serviceType: string; // Service Name (legacy alias)
  description?: string; // Job Description (optional)
  submissionDateTime?: string; // Submission Date and Time (e.g. '2026-10-24 10:30 AM')
  createdAt: string; // Submission Date/Time (legacy alias)
  expectedDeliveryDate?: string; // Expected Delivery Date
  deliveryDate: string; // Expected Delivery Date (legacy alias)
  deliveryTime?: string; // Delivery Time (optional)
  serviceCharge?: number; // Service Charge (₹)
  amount: number; // Service Charge (legacy alias)
  amountPaid?: number; // Amount Paid (₹)
  paidAmount: number; // Amount Paid (legacy alias)
  balanceDue?: number; // Automatically calculated: Service Charge - Amount Paid
  paymentStatus: CyberCafePaymentStatus; // 'unpaid' | 'partially_paid' | 'paid'
  status: CyberCafeJobStatus; // 'pending' | 'processing' | 'completed' | 'delivered' | 'cancelled'
  statusHistory?: CyberCafeJobStatusHistoryEntry[]; // Timestamped history of status changes
  internalNotes?: string; // Optional Internal Notes
  notes?: string; // Optional Notes (legacy alias)
  filesCount?: number;
  urgent?: boolean;
  shopId?: string; // Multi-tenant isolation: Authorized shop identifier
  createdByUserId?: string; // Operator user ID who created the job
}

export interface CyberCafeCustomer {
  id: string; // Customer ID (automatically generated, e.g. 'CUST-1001')
  name: string; // Full Name
  mobile: string; // Mobile Number (10 digits)
  email?: string; // Optional Email
  createdDate: string; // Created Date
  villageOrCity?: string;
  totalOrders: number;
  totalSpent: number;
  lastVisit: string;
  notes?: string;
  shopId?: string; // Multi-tenant isolation: Authorized shop identifier
  createdByUserId?: string; // Operator user ID who registered the customer
}

export interface CyberCafeShopStats {
  totalCustomers: number;
  totalJobs: number;
  pendingJobs: number;
  processingJobs: number;
  completedJobs: number;
  deliveredJobs: number;
  cancelledJobs: number;
  overdueJobs: number;
  totalRevenue: number;
  totalDue: number;
}
