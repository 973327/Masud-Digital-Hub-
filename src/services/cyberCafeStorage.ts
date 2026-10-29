import { CyberCafeJob, CyberCafeCustomer, CyberCafeShopStats, CyberCafeJobStatus, CyberCafeJobStatusHistoryEntry } from '../types/cybercafeManagement';
import { safeSetItem } from './storage';

const CYBER_STORAGE_KEYS = {
  JOBS: 'kajbondhu_cybercafe_jobs_v1',
  CUSTOMERS: 'kajbondhu_cybercafe_customers_v1'
};

/**
 * Formats a clean current timestamp for status changes (e.g., 'Oct 24, 2026, 02:30 PM')
 */
export function formatCurrentTimestamp(): string {
  const now = new Date();
  return now.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Creates a timestamped status history entry
 */
export function createStatusHistoryEntry(
  toStatus: CyberCafeJobStatus,
  fromStatus?: CyberCafeJobStatus,
  note?: string,
  updatedBy: string = 'Shop Operator'
): CyberCafeJobStatusHistoryEntry {
  const statusLabels: Record<CyberCafeJobStatus, string> = {
    pending: 'Pending (অপেক্ষমাণ)',
    processing: 'Processing (কাজ চলছে)',
    completed: 'Completed (রেডি)',
    delivered: 'Delivered (ডেলিভার্ড)',
    cancelled: 'Cancelled (বাতিল)'
  };

  const defaultNote = fromStatus 
    ? `Status changed from ${statusLabels[fromStatus]} to ${statusLabels[toStatus]}`
    : `Order created in ${statusLabels[toStatus]}`;

  return {
    id: `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    fromStatus,
    toStatus,
    timestamp: formatCurrentTimestamp(),
    note: note && note.trim() ? note.trim() : defaultNote,
    updatedBy
  };
}

export const DEFAULT_CYBER_CUSTOMERS: CyberCafeCustomer[] = [
  {
    id: 'CUST-1001',
    name: 'Subrata Roy',
    mobile: '9832104521',
    email: 'subrata.roy2025@gmail.com',
    createdDate: '2025-01-05',
    villageOrCity: 'Barasat, North 24 Pgs',
    totalOrders: 3,
    totalSpent: 420,
    lastVisit: 'Today, 10:15 AM',
    notes: 'Regular student customer, WB Police candidate'
  },
  {
    id: 'CUST-1002',
    name: 'Rina Mondal',
    mobile: '9732148765',
    email: 'rina.mondal.edu@yahoo.com',
    createdDate: '2025-01-08',
    villageOrCity: 'Habra, West Bengal',
    totalOrders: 2,
    totalSpent: 160,
    lastVisit: 'Today, 11:30 AM',
    notes: 'School teacher, needs passport photos'
  },
  {
    id: 'CUST-1003',
    name: 'Md. Tarique Alam',
    mobile: '9123456789',
    email: 'tarique.alam@gmail.com',
    createdDate: '2025-01-12',
    villageOrCity: 'Kolkata Central',
    totalOrders: 5,
    totalSpent: 650,
    lastVisit: 'Yesterday',
    notes: 'PVC Aadhaar & PAN Card orders'
  },
  {
    id: 'CUST-1004',
    name: 'Pooja Kumari',
    mobile: '9472198034',
    email: 'pooja.kumari99@gmail.com',
    createdDate: '2025-01-15',
    villageOrCity: 'Patna, Bihar',
    totalOrders: 1,
    totalSpent: 120,
    lastVisit: 'Today, 09:45 AM',
    notes: 'Post-Matric Scholarship application'
  },
  {
    id: 'CUST-1005',
    name: 'Bikram Das',
    mobile: '8902134567',
    email: 'bikram.das.land@gmail.com',
    createdDate: '2025-01-18',
    villageOrCity: 'Basirhat',
    totalOrders: 4,
    totalSpent: 380,
    lastVisit: 'Yesterday',
    notes: 'Banglarbhumi land record parcha printing'
  },
  {
    id: 'CUST-1006',
    name: 'Anjali Ghosh',
    mobile: '9831002345',
    email: 'anjali.ghosh.legal@gmail.com',
    createdDate: '2025-01-20',
    villageOrCity: 'Madhyamgram',
    totalOrders: 2,
    totalSpent: 300,
    lastVisit: 'Today, 12:00 PM',
    notes: 'Legal affidavit typing'
  },
  {
    id: 'CUST-1007',
    name: 'Ramesh Sah',
    mobile: '9334567812',
    email: '',
    createdDate: '2025-01-22',
    villageOrCity: 'Gaya, Bihar',
    totalOrders: 1,
    totalSpent: 180,
    lastVisit: 'Today, 01:10 PM',
    notes: 'PAN card name correction application'
  },
  {
    id: 'CUST-1008',
    name: 'Tanmoy Mukherjee',
    mobile: '9830112233',
    email: 'tanmoy.m.cv@outlook.com',
    createdDate: '2025-01-24',
    villageOrCity: 'Kolkata South',
    totalOrders: 3,
    totalSpent: 290,
    lastVisit: '2 days ago',
    notes: 'Resume typing and laminate print'
  }
];

/**
 * Automatically generates a sequential Customer ID (e.g. CUST-1009)
 */
export function generateCustomerId(existingCustomers: CyberCafeCustomer[]): string {
  let maxNum = 1000;
  for (const c of existingCustomers) {
    if (c.id) {
      const match = c.id.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
  }
  return `CUST-${maxNum + 1}`;
}

/**
 * Automatically generates the next sequential Token Number (e.g. 109)
 */
export function generateNextJobToken(jobs: CyberCafeJob[]): number {
  if (!jobs || jobs.length === 0) return 101;
  const maxToken = Math.max(...jobs.map((j) => Number(j.tokenNumber) || 100));
  return maxToken + 1;
}

/**
 * Automatically generates the next sequential Job ID (e.g. JOB-2026-109)
 */
export function generateNextJobId(jobs: CyberCafeJob[]): string {
  const token = generateNextJobToken(jobs);
  const year = new Date().getFullYear();
  return `JOB-${year}-${String(token).padStart(3, '0')}`;
}

/**
 * Automatically calculates Balance Due = Service Charge - Amount Paid (capped at >= 0)
 */
export function calculateBalanceDue(serviceCharge: number, amountPaid: number): number {
  const charge = Math.max(0, Number(serviceCharge) || 0);
  const paid = Math.max(0, Number(amountPaid) || 0);
  return Math.max(0, charge - paid);
}

/**
 * Determines Payment Status automatically based on Service Charge & Amount Paid:
 * - Paid: Amount Paid >= Service Charge
 * - Partially Paid: 0 < Amount Paid < Service Charge
 * - Unpaid: Amount Paid == 0
 */
export function determinePaymentStatus(serviceCharge: number, amountPaid: number): 'paid' | 'partially_paid' | 'unpaid' {
  const charge = Math.max(0, Number(serviceCharge) || 0);
  const paid = Math.max(0, Number(amountPaid) || 0);
  if (paid >= charge && charge > 0) return 'paid';
  if (paid > 0) return 'partially_paid';
  return 'unpaid';
}

export const DEFAULT_CYBER_JOBS: CyberCafeJob[] = [
  {
    id: 'JOB-2025-001',
    tokenNumber: 101,
    customerId: 'CUST-1001',
    customerName: 'Subrata Roy',
    customerMobile: '9832104521',
    villageOrCity: 'Barasat',
    serviceType: 'Online Form Fillup',
    description: 'WB Police Constable 2025 online application + signature scan upload',
    amount: 150,
    paidAmount: 150,
    paymentStatus: 'paid',
    status: 'processing',
    createdAt: 'Today, 10:15 AM',
    deliveryDate: 'Today',
    deliveryTime: '05:00 PM',
    notes: 'Check roll number and father spelling',
    urgent: true,
    statusHistory: [
      {
        id: 'hist-1-1',
        toStatus: 'pending',
        timestamp: 'Today, 10:15 AM',
        note: 'Order placed by candidate Subrata Roy. Verification documents received.',
        updatedBy: 'Shop Operator'
      },
      {
        id: 'hist-1-2',
        fromStatus: 'pending',
        toStatus: 'processing',
        timestamp: 'Today, 11:30 AM',
        note: 'Application form filled online on WBPRB portal. Signature scan attached.',
        updatedBy: 'Shop Operator'
      }
    ]
  },
  {
    id: 'JOB-2025-002',
    tokenNumber: 102,
    customerId: 'CUST-1002',
    customerName: 'Rina Mondal',
    customerMobile: '9732148765',
    villageOrCity: 'Habra',
    serviceType: 'Passport Photo Print (12 Pcs)',
    description: '12 Pcs studio glossy passport photos with white background',
    amount: 80,
    paidAmount: 80,
    paymentStatus: 'paid',
    status: 'completed',
    createdAt: 'Today, 11:30 AM',
    deliveryDate: 'Today',
    deliveryTime: 'Ready for Pickup',
    notes: 'Printed on 4x6 Kodak paper',
    statusHistory: [
      {
        id: 'hist-2-1',
        toStatus: 'pending',
        timestamp: 'Today, 11:30 AM',
        note: 'Studio passport photo taken in shop booth',
        updatedBy: 'Studio Operator'
      },
      {
        id: 'hist-2-2',
        fromStatus: 'pending',
        toStatus: 'processing',
        timestamp: 'Today, 11:45 AM',
        note: 'Background replaced with studio white. Retouched.',
        updatedBy: 'Studio Operator'
      },
      {
        id: 'hist-2-3',
        fromStatus: 'processing',
        toStatus: 'completed',
        timestamp: 'Today, 12:15 PM',
        note: '12 copies printed on Kodak glossy paper and die-cut. Ready for pickup.',
        updatedBy: 'Studio Operator'
      }
    ]
  },
  {
    id: 'JOB-2025-003',
    tokenNumber: 103,
    customerId: 'CUST-1003',
    customerName: 'Md. Tarique Alam',
    customerMobile: '9123456789',
    villageOrCity: 'Kolkata',
    serviceType: 'PVC Smart Card Print',
    description: 'PVC plastic high-gloss thermal print for Aadhaar card',
    amount: 60,
    paidAmount: 60,
    paymentStatus: 'paid',
    status: 'delivered',
    createdAt: 'Yesterday, 04:30 PM',
    deliveryDate: 'Yesterday',
    deliveryTime: '06:00 PM',
    notes: 'Handed over with protective card sleeve',
    statusHistory: [
      {
        id: 'hist-3-1',
        toStatus: 'pending',
        timestamp: 'Yesterday, 04:30 PM',
        note: 'Aadhaar e-card XML downloaded via OTP',
        updatedBy: 'Operator'
      },
      {
        id: 'hist-3-2',
        fromStatus: 'pending',
        toStatus: 'processing',
        timestamp: 'Yesterday, 05:00 PM',
        note: 'Thermal PVC printing in progress',
        updatedBy: 'Operator'
      },
      {
        id: 'hist-3-3',
        fromStatus: 'processing',
        toStatus: 'completed',
        timestamp: 'Yesterday, 05:40 PM',
        note: 'Card laminated with protective transparent sleeve',
        updatedBy: 'Operator'
      },
      {
        id: 'hist-3-4',
        fromStatus: 'completed',
        toStatus: 'delivered',
        timestamp: 'Yesterday, 06:15 PM',
        note: 'Card collected by customer. Full payment ₹60 settled.',
        updatedBy: 'Operator'
      }
    ]
  },
  {
    id: 'JOB-2025-004',
    tokenNumber: 104,
    customerId: 'CUST-1004',
    customerName: 'Pooja Kumari',
    customerMobile: '9472198034',
    villageOrCity: 'Patna',
    serviceType: 'Scholarship Application',
    description: 'Bihar Post-Matric Scholarship portal registration + Bonafide certificate scan',
    amount: 120,
    paidAmount: 50,
    paymentStatus: 'partial',
    status: 'pending',
    createdAt: 'Today, 09:45 AM',
    deliveryDate: 'Tomorrow',
    deliveryTime: '12:00 PM',
    notes: 'Pending mark sheet copy from student'
  },
  {
    id: 'JOB-2025-005',
    tokenNumber: 105,
    customerId: 'CUST-1005',
    customerName: 'Bikram Das',
    customerMobile: '8902134567',
    villageOrCity: 'Basirhat',
    serviceType: 'Land Record Parcha (Khatian)',
    description: 'Banglarbhumi portal 4-page land Khatian download, color print & lamination',
    amount: 90,
    paidAmount: 90,
    paymentStatus: 'paid',
    status: 'completed',
    createdAt: 'Today, 10:45 AM',
    deliveryDate: 'Today',
    deliveryTime: 'Ready for Pickup',
    notes: 'Packaged in clear transparent folder'
  },
  {
    id: 'JOB-2025-006',
    tokenNumber: 106,
    customerId: 'CUST-1006',
    customerName: 'Anjali Ghosh',
    customerMobile: '9831002345',
    villageOrCity: 'Madhyamgram',
    serviceType: 'Legal Document Typing',
    description: 'Bilingual Bengali/English affidavit draft on ₹50 legal stamp paper',
    amount: 200,
    paidAmount: 100,
    paymentStatus: 'partial',
    status: 'processing',
    createdAt: 'Today, 12:00 PM',
    deliveryDate: 'Today',
    deliveryTime: '06:30 PM',
    notes: 'Verification of notary draft pending'
  },
  {
    id: 'JOB-2025-007',
    tokenNumber: 107,
    customerId: 'CUST-1007',
    customerName: 'Ramesh Sah',
    customerMobile: '9334567812',
    villageOrCity: 'Gaya',
    serviceType: 'PAN Card Correction',
    description: 'NSDL PAN card minor to major name correction form & Aadhaar e-Sign',
    amount: 180,
    paidAmount: 0,
    paymentStatus: 'due',
    status: 'pending',
    createdAt: 'Today, 01:10 PM',
    deliveryDate: 'In 2 Days',
    deliveryTime: '11:00 AM',
    notes: 'Customer will provide father voter card'
  },
  {
    id: 'JOB-2025-008',
    tokenNumber: 108,
    customerId: 'CUST-1008',
    customerName: 'Tanmoy Mukherjee',
    customerMobile: '9830112233',
    villageOrCity: 'Kolkata',
    serviceType: 'CV / Resume Typing & Print',
    description: 'Modern Curriculum Vitae formatting with color header + 5 print copies',
    amount: 80,
    paidAmount: 80,
    paymentStatus: 'paid',
    status: 'delivered',
    createdAt: '2 days ago',
    deliveryDate: '2 days ago',
    deliveryTime: 'Delivered',
    notes: 'Digital PDF also sent via WhatsApp'
  },
  {
    id: 'JOB-2025-009',
    tokenNumber: 109,
    customerId: 'CUST-1002',
    customerName: 'Rina Mondal',
    customerMobile: '9732148765',
    villageOrCity: 'Habra',
    serviceName: 'Aadhaar PVC Card Print',
    serviceType: 'Aadhaar PVC Card Print',
    description: 'Duplicate plastic PVC print (Cancelled by customer)',
    serviceCharge: 60,
    amount: 60,
    amountPaid: 0,
    paidAmount: 0,
    balanceDue: 60,
    paymentStatus: 'unpaid',
    status: 'cancelled',
    submissionDateTime: '2 days ago',
    createdAt: '2 days ago',
    expectedDeliveryDate: '2 days ago',
    deliveryDate: '2 days ago',
    deliveryTime: 'Cancelled',
    internalNotes: 'Customer found original PVC card, order cancelled without charge'
  },
  {
    id: 'JOB-2025-010',
    tokenNumber: 110,
    customerId: 'CUST-1004',
    customerName: 'Pooja Kumari',
    customerMobile: '9472198034',
    villageOrCity: 'Patna',
    serviceName: 'College Admit Card Download & Color Print',
    serviceType: 'College Admit Card Download & Color Print',
    description: 'Urgent admit card download from university portal and laminated color print',
    serviceCharge: 60,
    amount: 60,
    amountPaid: 0,
    paidAmount: 0,
    balanceDue: 60,
    paymentStatus: 'unpaid',
    status: 'pending',
    submissionDateTime: 'Yesterday, 09:30 AM',
    createdAt: 'Yesterday, 09:30 AM',
    expectedDeliveryDate: 'Yesterday',
    deliveryDate: 'Yesterday',
    deliveryTime: '02:00 PM (Overdue)',
    internalNotes: 'Customer yet to collect admit card printout',
    urgent: true
  }
];

/**
 * Checks whether an active job has missed its expected delivery date.
 * A job is considered overdue if:
 * 1. Its status is active ('pending' or 'processing')
 * 2. Its expected delivery date is in the past.
 */
export function isJobOverdue(job: CyberCafeJob): boolean {
  if (job.status === 'delivered' || job.status === 'cancelled') {
    return false;
  }

  const deliveryStr = (job.expectedDeliveryDate || job.deliveryDate || '').trim().toLowerCase();
  if (!deliveryStr) return false;

  // Relative keywords
  if (deliveryStr.includes('yesterday') || deliveryStr.includes('ago') || deliveryStr.includes('overdue')) {
    return true;
  }
  if (deliveryStr === 'today' || deliveryStr === 'tomorrow' || deliveryStr.startsWith('in ')) {
    return false;
  }

  // Parse date string (YYYY-MM-DD)
  const parsed = new Date(deliveryStr);
  if (!isNaN(parsed.getTime())) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    parsed.setHours(0, 0, 0, 0);
    return parsed.getTime() < today.getTime();
  }

  return false;
}

/**
 * Checks if a job's date matches a specified filter:
 * - 'all': matches all
 * - 'today': matches current date or 'today' keyword
 * - 'yesterday': matches yesterday or 'yesterday' keyword
 * - 'tomorrow': matches tomorrow or 'tomorrow' keyword
 * - 'this_week': matches within last 7 days or relative recent keywords
 * - 'custom': matches custom YYYY-MM-DD
 */
export function matchesDateFilter(dateStr: string | undefined, filter: string, customDate?: string): boolean {
  if (!filter || filter === 'all') return true;
  if (!dateStr) return false;

  const raw = dateStr.trim().toLowerCase();
  const todayObj = new Date();
  const todayIso = todayObj.toISOString().split('T')[0];

  const yesterdayObj = new Date();
  yesterdayObj.setDate(todayObj.getDate() - 1);
  const yesterdayIso = yesterdayObj.toISOString().split('T')[0];

  const tomorrowObj = new Date();
  tomorrowObj.setDate(todayObj.getDate() + 1);
  const tomorrowIso = tomorrowObj.toISOString().split('T')[0];

  if (filter === 'today') {
    return raw.includes('today') || raw.startsWith(todayIso);
  }

  if (filter === 'yesterday') {
    return raw.includes('yesterday') || raw.startsWith(yesterdayIso);
  }

  if (filter === 'tomorrow') {
    return raw.includes('tomorrow') || raw.startsWith(tomorrowIso);
  }

  if (filter === 'this_week') {
    if (raw.includes('today') || raw.includes('yesterday') || raw.includes('2 days ago') || raw.includes('3 days ago')) {
      return true;
    }
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      const diffDays = Math.abs((todayObj.getTime() - parsed.getTime()) / (1000 * 3600 * 24));
      return diffDays <= 7;
    }
    return false;
  }

  if (filter === 'custom' && customDate) {
    if (raw.startsWith(customDate)) return true;
    if (customDate === todayIso && raw.includes('today')) return true;
    if (customDate === yesterdayIso && raw.includes('yesterday')) return true;
    if (customDate === tomorrowIso && raw.includes('tomorrow')) return true;
    return false;
  }

  return true;
}

export const DEFAULT_SHOP_ID = 'shop_main_01';

/**
 * Returns the active shop ID for the current session or operator.
 */
export function getActiveShopId(explicitShopId?: string): string {
  if (explicitShopId && explicitShopId.trim()) return explicitShopId.trim();
  try {
    const rawCur = localStorage.getItem('kajbondhu_current_user_v2');
    if (rawCur) {
      const cur = JSON.parse(rawCur);
      if (cur && cur.id) {
        return cur.shopId || `shop_${cur.id}`;
      }
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_SHOP_ID;
}

/**
 * Privacy & Security Guard (Requirement 7):
 * Ensures no Aadhaar numbers, OTPs, passwords, or unnecessary sensitive identity documents are stored.
 */
export function sanitizeCyberCafeRecord<T extends Record<string, any>>(record: T): T {
  const sanitized = { ...record };
  delete (sanitized as any).aadhaar;
  delete (sanitized as any).aadhaarNumber;
  delete (sanitized as any).aadhaarNo;
  delete (sanitized as any).otp;
  delete (sanitized as any).password;
  delete (sanitized as any).pin;
  delete (sanitized as any).biometric;
  return sanitized;
}

/**
 * Enforces database-level authorization:
 * Ensures a shop can only access its own jobs.
 * Admins can access all records.
 */
export function getStoredCyberCafeJobs(shopId?: string, isSuperAdmin: boolean = false): CyberCafeJob[] {
  const targetShopId = getActiveShopId(shopId);
  try {
    const raw = localStorage.getItem(CYBER_STORAGE_KEYS.JOBS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Normalize fields for all jobs and tag with shopId
        const normalized: CyberCafeJob[] = parsed.map((j) => {
          const serviceCharge = Number(j.serviceCharge ?? j.amount) || 0;
          const amountPaid = Number(j.amountPaid ?? j.paidAmount) || 0;
          const balanceDue = calculateBalanceDue(serviceCharge, amountPaid);
          const paymentStatus = 
            j.paymentStatus === 'due' ? 'unpaid' :
            j.paymentStatus === 'partial' ? 'partially_paid' :
            j.paymentStatus || determinePaymentStatus(serviceCharge, amountPaid);

          const status = j.status || 'pending';
          const statusHistory: CyberCafeJobStatusHistoryEntry[] = 
            Array.isArray(j.statusHistory) && j.statusHistory.length > 0
              ? j.statusHistory
              : [
                  {
                    id: `hist-init-${j.id || Math.random()}`,
                    toStatus: status,
                    timestamp: j.submissionDateTime || j.createdAt || 'Order Registered',
                    note: `Order submitted for ${j.customerName || 'customer'} (${j.serviceName || j.serviceType || 'Service'})`,
                    updatedBy: 'Shop Operator'
                  }
                ];

          const cleanJob = sanitizeCyberCafeRecord({
            ...j,
            shopId: j.shopId || DEFAULT_SHOP_ID,
            serviceName: j.serviceName || j.serviceType || 'Digital Service',
            serviceType: j.serviceType || j.serviceName || 'Digital Service',
            serviceCharge,
            amount: serviceCharge,
            amountPaid,
            paidAmount: amountPaid,
            balanceDue,
            paymentStatus,
            submissionDateTime: j.submissionDateTime || j.createdAt || 'Today',
            createdAt: j.createdAt || j.submissionDateTime || 'Today',
            expectedDeliveryDate: j.expectedDeliveryDate || j.deliveryDate || 'Today',
            deliveryDate: j.deliveryDate || j.expectedDeliveryDate || 'Today',
            internalNotes: j.internalNotes || j.notes || '',
            notes: j.notes || j.internalNotes || '',
            status,
            statusHistory
          });

          return cleanJob;
        });

        // Database-level isolation check
        if (isSuperAdmin) {
          return normalized;
        }
        return normalized.filter((j) => (j.shopId || DEFAULT_SHOP_ID) === targetShopId);
      }
    }
  } catch (e) {
    console.error('Error reading cyber cafe jobs:', e);
  }
  
  const defaultShopJobs = DEFAULT_CYBER_JOBS.map((j) => ({
    ...j,
    shopId: j.shopId || DEFAULT_SHOP_ID
  }));
  safeSetItem(CYBER_STORAGE_KEYS.JOBS, JSON.stringify(defaultShopJobs));
  return defaultShopJobs;
}

export function saveStoredCyberCafeJobs(shopJobs: CyberCafeJob[], shopId?: string): void {
  const targetShopId = getActiveShopId(shopId);

  // Read existing jobs to preserve other shops' records
  let allJobs: CyberCafeJob[] = [];
  try {
    const raw = localStorage.getItem(CYBER_STORAGE_KEYS.JOBS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        allJobs = parsed;
      }
    }
  } catch (e) {
    console.error('Error reading cyber cafe jobs for update:', e);
  }

  // Preserve other shops' jobs without modification
  const otherShopsJobs = allJobs.filter((j) => (j.shopId || DEFAULT_SHOP_ID) !== targetShopId);

  // Sanitize and ensure current shopId
  const sanitizedShopJobs = shopJobs.map((j) => sanitizeCyberCafeRecord({
    ...j,
    shopId: targetShopId
  }));

  safeSetItem(CYBER_STORAGE_KEYS.JOBS, JSON.stringify([...sanitizedShopJobs, ...otherShopsJobs]));
}

export function getStoredCyberCafeCustomers(shopId?: string, isSuperAdmin: boolean = false): CyberCafeCustomer[] {
  const targetShopId = getActiveShopId(shopId);
  try {
    const raw = localStorage.getItem(CYBER_STORAGE_KEYS.CUSTOMERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure all customers have id, name, mobile, createdDate, shopId
        const normalized: CyberCafeCustomer[] = parsed.map((c, idx) => sanitizeCyberCafeRecord({
          ...c,
          id: c.id && c.id.startsWith('CUST-') ? c.id : `CUST-${1001 + idx}`,
          createdDate: c.createdDate || '2025-01-15',
          shopId: c.shopId || DEFAULT_SHOP_ID
        }));

        if (isSuperAdmin) {
          return normalized;
        }
        return normalized.filter((c) => (c.shopId || DEFAULT_SHOP_ID) === targetShopId);
      }
    }
  } catch (e) {
    console.error('Error reading cyber cafe customers:', e);
  }
  
  const defaultShopCusts = DEFAULT_CYBER_CUSTOMERS.map((c) => ({
    ...c,
    shopId: c.shopId || DEFAULT_SHOP_ID
  }));
  safeSetItem(CYBER_STORAGE_KEYS.CUSTOMERS, JSON.stringify(defaultShopCusts));
  return defaultShopCusts;
}

export function saveStoredCyberCafeCustomers(customers: CyberCafeCustomer[], shopId?: string): void {
  const targetShopId = getActiveShopId(shopId);

  let allCustomers: CyberCafeCustomer[] = [];
  try {
    const raw = localStorage.getItem(CYBER_STORAGE_KEYS.CUSTOMERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        allCustomers = parsed;
      }
    }
  } catch (e) {
    console.error('Error reading cyber cafe customers for update:', e);
  }

  // Preserve other shops' customers
  const otherShopsCusts = allCustomers.filter((c) => (c.shopId || DEFAULT_SHOP_ID) !== targetShopId);

  // Sanitize and ensure current shopId
  const sanitizedShopCusts = customers.map((c) => sanitizeCyberCafeRecord({
    ...c,
    shopId: targetShopId
  }));

  safeSetItem(CYBER_STORAGE_KEYS.CUSTOMERS, JSON.stringify([...sanitizedShopCusts, ...otherShopsCusts]));
}

export function computeCyberCafeStats(jobs: CyberCafeJob[], customers: CyberCafeCustomer[]): CyberCafeShopStats {
  const pendingJobs = jobs.filter((j) => j.status === 'pending').length;
  const processingJobs = jobs.filter((j) => j.status === 'processing').length;
  const completedJobs = jobs.filter((j) => j.status === 'completed').length;
  const deliveredJobs = jobs.filter((j) => j.status === 'delivered').length;
  const cancelledJobs = jobs.filter((j) => j.status === 'cancelled').length;
  const overdueJobs = jobs.filter(isJobOverdue).length;

  const totalRevenue = jobs.reduce((sum, j) => sum + (Number(j.amountPaid ?? j.paidAmount) || 0), 0);
  const totalDue = jobs
    .filter((j) => j.status !== 'cancelled')
    .reduce((sum, j) => {
      const charge = Number(j.serviceCharge ?? j.amount) || 0;
      const paid = Number(j.amountPaid ?? j.paidAmount) || 0;
      return sum + Math.max(0, charge - paid);
    }, 0);

  return {
    totalCustomers: customers.length,
    totalJobs: jobs.length,
    pendingJobs,
    processingJobs,
    completedJobs,
    deliveredJobs,
    cancelledJobs,
    overdueJobs,
    totalRevenue,
    totalDue
  };
}
