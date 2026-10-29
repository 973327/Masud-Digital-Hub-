import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Briefcase, 
  Clock, 
  Cog, 
  CheckCircle2, 
  Truck, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  MessageCircle, 
  Printer, 
  Edit3, 
  Trash2, 
  X, 
  Calendar, 
  AlertCircle,
  IndianRupee,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  RotateCcw,
  Eye,
  Ban,
  AlertTriangle,
  CalendarClock,
  Zap,
  History
} from 'lucide-react';
import { CyberCafeJob, CyberCafeCustomer, CyberCafeJobStatus, CyberCafePaymentStatus } from '../../types/cybercafeManagement';
import { 
  getStoredCyberCafeJobs, 
  saveStoredCyberCafeJobs, 
  getStoredCyberCafeCustomers, 
  saveStoredCyberCafeCustomers, 
  computeCyberCafeStats,
  generateCustomerId,
  generateNextJobToken,
  generateNextJobId,
  calculateBalanceDue,
  determinePaymentStatus,
  isJobOverdue,
  matchesDateFilter,
  createStatusHistoryEntry,
  DEFAULT_CYBER_JOBS,
  DEFAULT_CYBER_CUSTOMERS
} from '../../services/cyberCafeStorage';
import { CyberCafeCustomerManagement } from './CyberCafeCustomerManagement';
import { CyberCafeJobDetailsModal } from './CyberCafeJobDetailsModal';

interface CyberCafeManagementDashboardProps {
  onLaunchTool?: (toolId: any) => void;
  lang?: 'en' | 'bn';
}

const COMMON_SERVICES = [
  'Online Form Fillup (চাকরি ও পরীক্ষার ফর্ম)',
  'Passport Photo Studio Print (পাসপোর্ট ছবি)',
  'PVC Smart Card (আধার / ভোটার পিভিসি কার্ড)',
  'Document Typing & Legal Drafting (দরখাস্ত ও এফিডেভিট)',
  'Land Record Parcha (খতিয়ান ও পরচা ডাউনলোড)',
  'Scholarship Portal Application (স্কলারশিপ ফর্ম)',
  'PAN Card New / Correction (প্যান কার্ড সংশোধন)',
  'Admit Card Download & Print (এডমিট কার্ড)',
  'Color Xerox & Lamination (জেরক্স ও লেমিনেশন)',
  'Other Custom Digital Service (অন্যান্য সেবা)'
];

export const CyberCafeManagementDashboard: React.FC<CyberCafeManagementDashboardProps> = ({
  onLaunchTool,
  lang = 'en'
}) => {
  const [jobs, setJobs] = useState<CyberCafeJob[]>(() => getStoredCyberCafeJobs());
  const [customers, setCustomers] = useState<CyberCafeCustomer[]>(() => getStoredCyberCafeCustomers());

  // Active Sub-view: dashboard vs customers (Requirement 1 & 2)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers'>('dashboard');
  const [selectedCustomerIdForProfile, setSelectedCustomerIdForProfile] = useState<string | null>(null);

  // Search & Filter state (Requirement 4: Search & Filters)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | CyberCafeJobStatus>('all');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<'all' | CyberCafePaymentStatus>('all');

  // Date filters: Submission date & Expected delivery date
  const [submissionDateFilter, setSubmissionDateFilter] = useState<'all' | 'today' | 'yesterday' | 'this_week' | 'custom'>('all');
  const [customSubmissionDate, setCustomSubmissionDate] = useState<string>('');
  const [deliveryDateFilter, setDeliveryDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'overdue' | 'custom'>('all');
  const [customDeliveryDate, setCustomDeliveryDate] = useState<string>('');
  const [isDateFilterOpen, setIsDateFilterOpen] = useState<boolean>(false);

  // Quick Access: Pending & Overdue jobs
  const [quickFilter, setQuickFilter] = useState<'all' | 'pending' | 'overdue' | 'today_delivery' | 'due_payment'>('all');

  // Modal States
  const [detailsJob, setDetailsJob] = useState<CyberCafeJob | null>(null);
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState<boolean>(false);
  const [editingJob, setEditingJob] = useState<CyberCafeJob | null>(null);
  const [receiptJob, setReceiptJob] = useState<CyberCafeJob | null>(null);
  const [isCustomerListOpen, setIsCustomerListOpen] = useState<boolean>(false);

  // Auto-generated Next Job ID & Token Number preview
  const nextTokenNumber = useMemo(() => generateNextJobToken(jobs), [jobs]);
  const nextJobId = useMemo(() => generateNextJobId(jobs), [jobs]);

  // Form State for New Job (All Required Fields)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('new');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerMobile, setCustomerMobile] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [villageOrCity, setVillageOrCity] = useState<string>('');
  const [serviceName, setServiceName] = useState<string>(COMMON_SERVICES[0]);
  const [customServiceName, setCustomServiceName] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [submissionDateTime, setSubmissionDateTime] = useState<string>(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [deliveryTime, setDeliveryTime] = useState<string>('05:00 PM');
  const [serviceCharge, setServiceCharge] = useState<number>(100);
  const [amountPaid, setAmountPaid] = useState<number>(100);
  const [jobStatus, setJobStatus] = useState<CyberCafeJobStatus>('pending');
  const [internalNotes, setInternalNotes] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState<boolean>(false);

  // Real-time automatic calculation: Balance Due = Service Charge - Amount Paid
  const balanceDue = useMemo(() => {
    return calculateBalanceDue(serviceCharge, amountPaid);
  }, [serviceCharge, amountPaid]);

  // Real-time automatic payment status: Unpaid, Partially Paid, Paid
  const paymentStatus = useMemo(() => {
    return determinePaymentStatus(serviceCharge, amountPaid);
  }, [serviceCharge, amountPaid]);

  // Validation: amounts are not negative and Amount Paid cannot exceed Service Charge
  const validationError = useMemo(() => {
    if (serviceCharge < 0) return 'Service Charge cannot be negative (₹0 minimum).';
    if (amountPaid < 0) return 'Amount Paid cannot be negative (₹0 minimum).';
    if (amountPaid > serviceCharge) {
      return `Amount Paid (₹${amountPaid}) cannot exceed Service Charge (₹${serviceCharge}).`;
    }
    return null;
  }, [serviceCharge, amountPaid]);

  // Handle selecting an existing customer from dropdown
  const handleSelectCustomer = (custId: string) => {
    setSelectedCustomerId(custId);
    if (custId === 'new') {
      setCustomerName('');
      setCustomerMobile('');
      setCustomerEmail('');
      setVillageOrCity('');
    } else {
      const found = customers.find((c) => c.id === custId);
      if (found) {
        setCustomerName(found.name);
        setCustomerMobile(found.mobile);
        setCustomerEmail(found.email || '');
        setVillageOrCity(found.villageOrCity || '');
      }
    }
  };

  // Compute live shop stats for summary cards
  const stats = useMemo(() => {
    return computeCyberCafeStats(jobs, customers);
  }, [jobs, customers]);

  // Sync update functions
  const handleUpdateJobs = (newJobs: CyberCafeJob[]) => {
    setJobs(newJobs);
    saveStoredCyberCafeJobs(newJobs);
  };

  const handleUpdateCustomers = (newCustomers: CyberCafeCustomer[]) => {
    setCustomers(newCustomers);
    saveStoredCyberCafeCustomers(newCustomers);
  };

  // Quick Status Transition (pending -> processing -> completed -> delivered)
  const handleAdvanceStatus = (jobId: string, currentStatus: CyberCafeJobStatus) => {
    let nextStatus: CyberCafeJobStatus = 'processing';
    if (currentStatus === 'pending') nextStatus = 'processing';
    else if (currentStatus === 'processing') nextStatus = 'completed';
    else if (currentStatus === 'completed') nextStatus = 'delivered';
    else nextStatus = 'delivered';

    const updated = jobs.map((job) => {
      if (job.id === jobId) {
        const historyEntry = createStatusHistoryEntry(
          nextStatus,
          job.status,
          `Quick advanced status to ${nextStatus.toUpperCase()}`,
          'Shop Operator'
        );
        const updatedJob = {
          ...job,
          status: nextStatus,
          statusHistory: [historyEntry, ...(job.statusHistory || [])]
        };
        if (detailsJob && detailsJob.id === jobId) {
          setDetailsJob(updatedJob);
        }
        return updatedJob;
      }
      return job;
    });
    handleUpdateJobs(updated);
  };

  const handleSetExactStatus = (jobId: string, status: CyberCafeJobStatus) => {
    const updated = jobs.map((job) => {
      if (job.id === jobId) {
        if (job.status === status) return job;
        const historyEntry = createStatusHistoryEntry(
          status,
          job.status,
          `Status changed from ${job.status.toUpperCase()} to ${status.toUpperCase()}`,
          'Shop Operator'
        );
        const updatedJob = {
          ...job,
          status,
          statusHistory: [historyEntry, ...(job.statusHistory || [])]
        };
        if (detailsJob && detailsJob.id === jobId) {
          setDetailsJob(updatedJob);
        }
        return updatedJob;
      }
      return job;
    });
    handleUpdateJobs(updated);
  };

  // Quick Mark as Paid
  const handleMarkAsPaid = (jobId: string) => {
    const updated = jobs.map((job) => {
      if (job.id === jobId) {
        const fullFee = Number(job.serviceCharge ?? job.amount) || 0;
        const updatedJob = {
          ...job,
          serviceCharge: fullFee,
          amount: fullFee,
          amountPaid: fullFee,
          paidAmount: fullFee,
          balanceDue: 0,
          paymentStatus: 'paid' as CyberCafePaymentStatus
        };
        if (detailsJob && detailsJob.id === jobId) {
          setDetailsJob(updatedJob);
        }
        return updatedJob;
      }
      return job;
    });
    handleUpdateJobs(updated);
  };

  // Delete Job
  const handleDeleteJob = (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job record?')) {
      const updated = jobs.filter((j) => j.id !== jobId);
      handleUpdateJobs(updated);
    }
  };

  // Submit New Job with Full Validation
  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerMobile.trim()) {
      alert('Please provide customer name and mobile number.');
      return;
    }

    if (validationError) {
      alert(validationError);
      return;
    }

    const finalService = (serviceName.includes('Other') && customServiceName.trim())
      ? customServiceName.trim()
      : serviceName;

    // Submission Date and Time formatted
    const formattedSubmission = submissionDateTime ? (
      submissionDateTime.includes('T') ? submissionDateTime.replace('T', ' ') : submissionDateTime
    ) : new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    // Update or create customer record
    let assignedCustId = selectedCustomerId !== 'new' ? selectedCustomerId : '';
    const existingCustIdx = customers.findIndex((c) => 
      (assignedCustId && c.id === assignedCustId) || c.mobile === customerMobile.trim()
    );

    if (existingCustIdx >= 0) {
      assignedCustId = customers[existingCustIdx].id;
      const updatedCust = {
        ...customers[existingCustIdx],
        totalOrders: customers[existingCustIdx].totalOrders + 1,
        totalSpent: customers[existingCustIdx].totalSpent + (Number(amountPaid) || 0),
        lastVisit: 'Just now',
        email: customerEmail.trim() || customers[existingCustIdx].email,
        villageOrCity: villageOrCity.trim() || customers[existingCustIdx].villageOrCity
      };
      const updatedCustomers = [...customers];
      updatedCustomers[existingCustIdx] = updatedCust;
      handleUpdateCustomers(updatedCustomers);
    } else {
      assignedCustId = generateCustomerId(customers);
      const newCust: CyberCafeCustomer = {
        id: assignedCustId,
        name: customerName.trim(),
        mobile: customerMobile.trim(),
        email: customerEmail.trim() || undefined,
        createdDate: new Date().toISOString().split('T')[0],
        villageOrCity: villageOrCity.trim() || undefined,
        totalOrders: 1,
        totalSpent: Number(amountPaid) || 0,
        lastVisit: 'Just now'
      };
      handleUpdateCustomers([newCust, ...customers]);
    }

    // Initial Status History Entry
    const initialHistoryEntry = createStatusHistoryEntry(
      jobStatus,
      undefined,
      `Order placed: ${finalService} for customer ${customerName.trim()}`,
      'Shop Operator'
    );

    const newJob: CyberCafeJob = {
      id: nextJobId,
      tokenNumber: nextTokenNumber,
      customerId: assignedCustId,
      customerName: customerName.trim(),
      customerMobile: customerMobile.trim(),
      villageOrCity: villageOrCity.trim() || undefined,
      serviceName: finalService,
      serviceType: finalService,
      description: jobDescription.trim() || undefined,
      submissionDateTime: formattedSubmission,
      createdAt: formattedSubmission,
      expectedDeliveryDate: expectedDeliveryDate || 'Today',
      deliveryDate: expectedDeliveryDate || 'Today',
      deliveryTime: deliveryTime || 'Ready Soon',
      serviceCharge: Number(serviceCharge) || 0,
      amount: Number(serviceCharge) || 0,
      amountPaid: Number(amountPaid) || 0,
      paidAmount: Number(amountPaid) || 0,
      balanceDue,
      paymentStatus,
      status: jobStatus,
      statusHistory: [initialHistoryEntry],
      internalNotes: internalNotes.trim() || undefined,
      notes: internalNotes.trim() || undefined,
      urgent: isUrgent
    };

    handleUpdateJobs([newJob, ...jobs]);
    setIsAddJobModalOpen(false);

    // Reset Form
    setSelectedCustomerId('new');
    setCustomerName('');
    setCustomerMobile('');
    setCustomerEmail('');
    setVillageOrCity('');
    setJobDescription('');
    setServiceCharge(100);
    setAmountPaid(100);
    setJobStatus('pending');
    setInternalNotes('');
    setIsUrgent(false);
  };

  // Save Edit Job with Balance Due & Validation
  const handleSaveEditJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    const charge = Math.max(0, Number(editingJob.serviceCharge ?? editingJob.amount) || 0);
    const paid = Math.max(0, Number(editingJob.amountPaid ?? editingJob.paidAmount) || 0);

    if (paid < 0) {
      alert('Amount Paid cannot be negative.');
      return;
    }

    if (paid > charge) {
      alert(`Amount Paid (₹${paid}) cannot exceed Service Charge (₹${charge}).`);
      return;
    }

    const calculatedDue = calculateBalanceDue(charge, paid);
    const calculatedPayStatus = determinePaymentStatus(charge, paid);

    // Track status history if status changed
    let history = editingJob.statusHistory ? [...editingJob.statusHistory] : [];
    const orig = jobs.find((j) => j.id === editingJob.id);
    if (orig && orig.status !== editingJob.status) {
      history = [
        createStatusHistoryEntry(
          editingJob.status,
          orig.status,
          `Status changed from ${orig.status.toUpperCase()} to ${editingJob.status.toUpperCase()} via edit`,
          'Shop Operator'
        ),
        ...history
      ];
    }

    const updatedJob: CyberCafeJob = {
      ...editingJob,
      serviceCharge: charge,
      amount: charge,
      amountPaid: paid,
      paidAmount: paid,
      balanceDue: calculatedDue,
      paymentStatus: calculatedPayStatus,
      serviceName: editingJob.serviceName || editingJob.serviceType,
      serviceType: editingJob.serviceType || editingJob.serviceName || '',
      internalNotes: editingJob.internalNotes ?? editingJob.notes ?? '',
      notes: editingJob.notes ?? editingJob.internalNotes ?? '',
      submissionDateTime: editingJob.submissionDateTime || editingJob.createdAt || 'Today',
      createdAt: editingJob.createdAt || editingJob.submissionDateTime || 'Today',
      expectedDeliveryDate: editingJob.expectedDeliveryDate || editingJob.deliveryDate || 'Today',
      deliveryDate: editingJob.deliveryDate || editingJob.expectedDeliveryDate || 'Today',
      statusHistory: history
    };

    const updated = jobs.map((j) => (j.id === updatedJob.id ? updatedJob : j));
    handleUpdateJobs(updated);
    if (detailsJob && detailsJob.id === updatedJob.id) {
      setDetailsJob(updatedJob);
    }
    setEditingJob(null);
  };

  // Reset to default seed records
  const handleResetDefaults = () => {
    if (window.confirm('Reset cyber cafe records to default demo entries?')) {
      handleUpdateJobs(DEFAULT_CYBER_JOBS);
      handleUpdateCustomers(DEFAULT_CYBER_CUSTOMERS);
    }
  };

  // Quick access metric counts
  const todayDeliveriesCount = useMemo(() => {
    return jobs.filter((j) => j.status !== 'delivered' && j.status !== 'cancelled' && matchesDateFilter(j.expectedDeliveryDate || j.deliveryDate, 'today')).length;
  }, [jobs]);

  const duePaymentJobsCount = useMemo(() => {
    return jobs.filter((j) => {
      if (j.status === 'cancelled') return false;
      const charge = Number(j.serviceCharge ?? j.amount) || 0;
      const paid = Number(j.amountPaid ?? j.paidAmount) || 0;
      return (charge - paid) > 0;
    }).length;
  }, [jobs]);

  // Filtered jobs list based on Requirement 4: Search & Filters
  // 1. Search by customer name, mobile number, or Job ID
  // 2. Filter by job status
  // 3. Filter by submission date and expected delivery date
  // 4. Quick access to Pending and overdue jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // 1. Quick Access Filter (Pending, Overdue, Today's Deliveries, Due Payments)
      if (quickFilter === 'pending' && job.status !== 'pending') {
        return false;
      }
      if (quickFilter === 'overdue' && !isJobOverdue(job)) {
        return false;
      }
      if (quickFilter === 'today_delivery') {
        if (job.status === 'delivered' || job.status === 'cancelled') return false;
        if (!matchesDateFilter(job.expectedDeliveryDate || job.deliveryDate, 'today')) return false;
      }
      if (quickFilter === 'due_payment') {
        if (job.status === 'cancelled') return false;
        const charge = Number(job.serviceCharge ?? job.amount) || 0;
        const paid = Number(job.amountPaid ?? job.paidAmount) || 0;
        if ((charge - paid) <= 0) return false;
      }

      // 2. Filter by Job Status
      if (selectedStatusFilter !== 'all' && job.status !== selectedStatusFilter) {
        return false;
      }

      // 3. Filter by Payment Status
      if (selectedPaymentFilter !== 'all') {
        const payStatus = job.paymentStatus;
        if (selectedPaymentFilter === 'unpaid' && payStatus !== 'unpaid' && payStatus !== 'due') {
          return false;
        }
        if (selectedPaymentFilter === 'partially_paid' && payStatus !== 'partially_paid' && payStatus !== 'partial') {
          return false;
        }
        if (selectedPaymentFilter === 'paid' && payStatus !== 'paid') {
          return false;
        }
      }

      // 4. Filter by Submission Date
      if (submissionDateFilter !== 'all') {
        const subDate = job.submissionDateTime || job.createdAt;
        if (!matchesDateFilter(subDate, submissionDateFilter, customSubmissionDate)) {
          return false;
        }
      }

      // 5. Filter by Expected Delivery Date
      if (deliveryDateFilter !== 'all') {
        if (deliveryDateFilter === 'overdue') {
          if (!isJobOverdue(job)) return false;
        } else {
          const delDate = job.expectedDeliveryDate || job.deliveryDate;
          if (!matchesDateFilter(delDate, deliveryDateFilter, customDeliveryDate)) {
            return false;
          }
        }
      }

      // 6. Search by customer name, mobile number, or Job ID (also token & service)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const rawDigitsQ = q.replace(/\D/g, '');

        // Customer Name
        const matchName = job.customerName.toLowerCase().includes(q);
        // Mobile Number (direct string match or cleaned digit match)
        const jobMobileClean = job.customerMobile.replace(/\D/g, '');
        const matchMobile = job.customerMobile.toLowerCase().includes(q) || (rawDigitsQ.length >= 3 && jobMobileClean.includes(rawDigitsQ));
        // Job ID
        const matchId = job.id.toLowerCase().includes(q);
        // Token Number
        const matchToken = String(job.tokenNumber).includes(q);
        // Service Name & Description
        const matchService = (job.serviceName || job.serviceType || '').toLowerCase().includes(q);
        const matchDesc = job.description?.toLowerCase().includes(q);

        if (!matchName && !matchMobile && !matchId && !matchToken && !matchService && !matchDesc) {
          return false;
        }
      }

      return true;
    });
  }, [
    jobs,
    quickFilter,
    selectedStatusFilter,
    selectedPaymentFilter,
    submissionDateFilter,
    customSubmissionDate,
    deliveryDateFilter,
    customDeliveryDate,
    searchQuery
  ]);

  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedStatusFilter !== 'all' ||
    selectedPaymentFilter !== 'all' ||
    submissionDateFilter !== 'all' ||
    deliveryDateFilter !== 'all' ||
    quickFilter !== 'all'
  );

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatusFilter('all');
    setSelectedPaymentFilter('all');
    setSubmissionDateFilter('all');
    setCustomSubmissionDate('');
    setDeliveryDateFilter('all');
    setCustomDeliveryDate('');
    setQuickFilter('all');
  };

  // WhatsApp notification launcher
  const sendWhatsAppUpdate = (job: CyberCafeJob) => {
    const cleanMobile = job.customerMobile.replace(/[^0-9]/g, '');
    let text = '';
    if (job.status === 'completed') {
      text = `নমস্কার ${job.customerName} বাবু, মাসুদ ডিজিটাল হাব থেকে জানাচ্ছি আপনার কাজটি (${job.serviceType}) সম্পূর্ণ প্রস্তুত হয়ে গেছে। অনুগ্রহ করে দোকানে এসে সংগ্রহ করে নিন। মোট প্রদেয়: ₹${job.amount}, বাকি: ₹${Math.max(0, job.amount - job.paidAmount)}। ধন্যবাদ!`;
    } else if (job.status === 'processing') {
      text = `নমস্কার ${job.customerName}, আপনার কাজ (${job.serviceType}) প্রসেসিং চলছে। সম্ভাব্য ডেলিভারি সময়: ${job.deliveryTime || 'আজ বিকেল'}। - মাসুদ ডিজিটাল হাব`;
    } else {
      text = `নমস্কার ${job.customerName}, আপনার কাজের টোকেন নং #${job.tokenNumber} (${job.serviceType}) সফলভাবে নথিভুক্ত হয়েছে। - মাসুদ ডিজিটাল হাব`;
    }

    const url = `https://wa.me/91${cleanMobile}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & SHOP HERO */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden border border-slate-700/60">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>Module 1: Cyber Cafe Shop Management</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-semibold border border-amber-400/30">
                গ্রাহক ও কাজ রেকর্ডস
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              Cyber Cafe Management Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Live shop operator portal: Track online form applications, passport photos, PVC smart cards, pending deliverables, and customer payment records in one place.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setIsAddJobModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ New Job Order (নতুন কাজ)</span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTab === 'customers'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-md'
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/20'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Customer Management ({customers.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Module 1 Sub-Navigation: 1. Dashboard (6 Summary Cards + Recent Jobs) vs 2. Customer Management */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>1. Dashboard & Recent Jobs</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {jobs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>2. Customer Management & Profiles</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-300 font-mono">
              {customers.length}
            </span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 hidden sm:block pr-2">
          {activeTab === 'dashboard' ? (
            <span>Showing live shop orders & 6 key status cards</span>
          ) : (
            <span>Auto-generated Customer IDs, contact info & work history</span>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 2: CUSTOMER MANAGEMENT COMPONENT (REQUIREMENT 2) */}
      {/* ========================================================================= */}
      {activeTab === 'customers' ? (
        <CyberCafeCustomerManagement
          customers={customers}
          jobs={jobs}
          onUpdateCustomers={handleUpdateCustomers}
          onUpdateJobs={handleUpdateJobs}
          initialSelectedCustomerId={selectedCustomerIdForProfile}
          onClearInitialSelectedCustomer={() => setSelectedCustomerIdForProfile(null)}
          onBackToDashboard={() => setActiveTab('dashboard')}
          onOpenNewJobForCustomer={(customer) => {
            setCustomerName(customer.name);
            setCustomerMobile(customer.mobile);
            setVillageOrCity(customer.villageOrCity || '');
            setCustomerEmail(customer.email || '');
            setActiveTab('dashboard');
            setIsAddJobModalOpen(true);
          }}
          onPrintJobReceipt={(job) => setReceiptJob(job)}
          onOpenJobDetails={(job) => setDetailsJob(job)}
          lang={lang}
        />
      ) : (
        <>
          {/* ========================================================================= */}
          {/* VIEW 1: DASHBOARD - SUMMARY CARDS (EXACT 6 CARDS SPECIFIED IN REQUIREMENT) */}
          {/* ========================================================================= */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span>Shop Overview Summary (দোকানের কাজের হিসাব)</span>
              </h2>
              <span className="text-[11px] text-slate-400">Click any card to filter jobs below</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {/* Card 1: Total Customers */}
              <div 
                onClick={() => setActiveTab('customers')}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Customers
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-emerald-50 text-slate-600 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {stats.totalCustomers}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500 mt-0.5 truncate">
                    Total Customers (মোট গ্রাহক)
                  </div>
                </div>
              </div>

          {/* Card 2: Total Jobs */}
          <div 
            onClick={() => setSelectedStatusFilter('all')}
            className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer group flex flex-col justify-between ${
              selectedStatusFilter === 'all'
                ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-sm'
                : 'border-slate-200/80 hover:border-slate-400 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                All Orders
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats.totalJobs}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 mt-0.5 truncate">
                Total Jobs (মোট কাজ)
              </div>
            </div>
          </div>

          {/* Card 3: Pending Jobs */}
          <div 
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'pending' ? 'all' : 'pending')}
            className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer group flex flex-col justify-between ${
              selectedStatusFilter === 'pending'
                ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 shadow-sm'
                : 'border-slate-200/80 hover:border-amber-400 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                Pending
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 group-hover:bg-amber-100 text-amber-600 flex items-center justify-center transition-colors">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
                {stats.pendingJobs}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 mt-0.5 truncate">
                Pending Jobs (অপেক্ষমাণ)
              </div>
            </div>
          </div>

          {/* Card 4: Processing Jobs */}
          <div 
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'processing' ? 'all' : 'processing')}
            className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer group flex flex-col justify-between ${
              selectedStatusFilter === 'processing'
                ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-sm'
                : 'border-slate-200/80 hover:border-blue-400 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                Processing
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors">
                <Cog className="w-4 h-4 animate-spin-slow" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight">
                {stats.processingJobs}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 mt-0.5 truncate">
                Processing Jobs (চলছে)
              </div>
            </div>
          </div>

          {/* Card 5: Completed Jobs */}
          <div 
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'completed' ? 'all' : 'completed')}
            className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer group flex flex-col justify-between ${
              selectedStatusFilter === 'completed'
                ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-sm'
                : 'border-slate-200/80 hover:border-emerald-400 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                Completed
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
                {stats.completedJobs}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 mt-0.5 truncate">
                Completed Jobs (রেডি)
              </div>
            </div>
          </div>

          {/* Card 6: Delivered Jobs */}
          <div 
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'delivered' ? 'all' : 'delivered')}
            className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer group flex flex-col justify-between ${
              selectedStatusFilter === 'delivered'
                ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-sm'
                : 'border-slate-200/80 hover:border-indigo-400 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                Delivered
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition-colors">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-600 tracking-tight">
                {stats.deliveredJobs}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 mt-0.5 truncate">
                Delivered Jobs (হস্তান্তরিত)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. RECENT JOBS TABLE SECTION (CORE REQUIREMENT) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
        {/* ========================================================================= */}
        {/* QUICK ACCESS BAR (Requirement 4: Quick access to Pending and overdue jobs) */}
        {/* ========================================================================= */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-500 uppercase tracking-wider pr-1">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Quick Access:</span>
            </div>

            {/* Quick Button 1: Pending Jobs */}
            <button
              onClick={() => {
                const next = quickFilter === 'pending' ? 'all' : 'pending';
                setQuickFilter(next);
                if (next === 'pending') setSelectedStatusFilter('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                quickFilter === 'pending'
                  ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-400/50 shadow-sm'
                  : 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200/80 hover:border-amber-300'
              }`}
              title="Quickly filter to pending jobs waiting for action"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Pending Jobs</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                quickFilter === 'pending' ? 'bg-slate-950 text-amber-300' : 'bg-amber-100 text-amber-900'
              }`}>
                {stats.pendingJobs}
              </span>
            </button>

            {/* Quick Button 2: Overdue Jobs */}
            <button
              onClick={() => {
                const next = quickFilter === 'overdue' ? 'all' : 'overdue';
                setQuickFilter(next);
                if (next === 'overdue') {
                  setSelectedStatusFilter('all');
                  setDeliveryDateFilter('all');
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                quickFilter === 'overdue'
                  ? 'bg-rose-600 text-white font-black ring-2 ring-rose-400/50 shadow-sm'
                  : stats.overdueJobs > 0
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-extrabold animate-pulse'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
              }`}
              title="Quickly view orders that have passed their expected delivery target"
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${quickFilter === 'overdue' ? 'text-white' : 'text-rose-600'}`} />
              <span>Overdue Jobs</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                quickFilter === 'overdue' ? 'bg-white text-rose-700' : 'bg-rose-600 text-white'
              }`}>
                {stats.overdueJobs}
              </span>
            </button>

            {/* Quick Button 3: Today's Deliveries */}
            <button
              onClick={() => {
                const next = quickFilter === 'today_delivery' ? 'all' : 'today_delivery';
                setQuickFilter(next);
                if (next === 'today_delivery') setSelectedStatusFilter('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                quickFilter === 'today_delivery'
                  ? 'bg-blue-600 text-white font-black ring-2 ring-blue-400/50 shadow-sm'
                  : 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-200/80 hover:border-blue-300'
              }`}
              title="Jobs with expected delivery today"
            >
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>Today's Delivery</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                quickFilter === 'today_delivery' ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-900'
              }`}>
                {todayDeliveriesCount}
              </span>
            </button>

            {/* Quick Button 4: Due Payments */}
            <button
              onClick={() => {
                const next = quickFilter === 'due_payment' ? 'all' : 'due_payment';
                setQuickFilter(next);
                if (next === 'due_payment') setSelectedPaymentFilter('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                quickFilter === 'due_payment'
                  ? 'bg-emerald-700 text-white font-black ring-2 ring-emerald-500/50 shadow-sm'
                  : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200/80 hover:border-emerald-300'
              }`}
              title="Orders with unpaid balance due"
            >
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              <span>Balance Due</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                quickFilter === 'due_payment' ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-900'
              }`}>
                {duePaymentJobsCount}
              </span>
            </button>
          </div>

          {/* Date Filter Toggle Button */}
          <button
            onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              isDateFilterOpen || submissionDateFilter !== 'all' || deliveryDateFilter !== 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 hover:border-indigo-400'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Filter by Dates</span>
            {(submissionDateFilter !== 'all' || deliveryDateFilter !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* DATE FILTERS PANEL (Requirement 4: Submission date & Expected delivery date) */}
        {/* ========================================================================= */}
        {isDateFilterOpen && (
          <div className="p-4 bg-gradient-to-r from-indigo-50/70 to-slate-50 rounded-2xl border border-indigo-200/80 space-y-3 animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Filter by Dates (জমা ও ডেলিভারি তারিখ অনুযায়ী ফিল্টার)</span>
              </div>

              {(submissionDateFilter !== 'all' || deliveryDateFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSubmissionDateFilter('all');
                    setCustomSubmissionDate('');
                    setDeliveryDateFilter('all');
                    setCustomDeliveryDate('');
                  }}
                  className="text-xs font-bold text-indigo-700 hover:text-indigo-950 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Date Filters</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              {/* Submission Date Controls */}
              <div className="bg-white p-3 rounded-xl border border-indigo-100/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Submission Date (জমা দেওয়ার তারিখ)</span>
                  </span>
                  {submissionDateFilter !== 'all' && (
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">Active</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', label: 'All Dates' },
                    { id: 'today', label: 'Today' },
                    { id: 'yesterday', label: 'Yesterday' },
                    { id: 'this_week', label: 'Last 7 Days' },
                    { id: 'custom', label: 'Custom Date...' }
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSubmissionDateFilter(preset.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                        submissionDateFilter === preset.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {submissionDateFilter === 'custom' && (
                  <div className="pt-1 flex items-center gap-2">
                    <input
                      type="date"
                      value={customSubmissionDate}
                      onChange={(e) => setCustomSubmissionDate(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono outline-none focus:border-indigo-500 bg-white"
                    />
                    <span className="text-[11px] text-slate-400">Select any submission day</span>
                  </div>
                )}
              </div>

              {/* Expected Delivery Date Controls */}
              <div className="bg-white p-3 rounded-xl border border-indigo-100/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-500" />
                    <span>Expected Delivery Date (সম্ভাব্য ডেলিভারি)</span>
                  </span>
                  {deliveryDateFilter !== 'all' && (
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">Active</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', label: 'All Dates' },
                    { id: 'today', label: 'Today' },
                    { id: 'tomorrow', label: 'Tomorrow' },
                    { id: 'overdue', label: '⚠️ Overdue' },
                    { id: 'custom', label: 'Custom Date...' }
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setDeliveryDateFilter(preset.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                        deliveryDateFilter === preset.id
                          ? preset.id === 'overdue'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-indigo-600 text-white shadow-xs'
                          : preset.id === 'overdue'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {deliveryDateFilter === 'custom' && (
                  <div className="pt-1 flex items-center gap-2">
                    <input
                      type="date"
                      value={customDeliveryDate}
                      onChange={(e) => setCustomDeliveryDate(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono outline-none focus:border-indigo-500 bg-white"
                    />
                    <span className="text-[11px] text-slate-400">Select target delivery day</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SEARCH & STATUS/PAYMENT FILTER CONTROLS */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Search Box (Requirement 4: Search by customer name, mobile number, or Job ID) */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, mobile number, or Job ID..."
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status & Payment Filter Pills (Requirement 4: Filter by job status) */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Status Pills */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {[
                { id: 'all', label: `All (${jobs.length})` },
                { id: 'pending', label: `Pending (${stats.pendingJobs})` },
                { id: 'processing', label: `Processing (${stats.processingJobs})` },
                { id: 'completed', label: `Completed (${stats.completedJobs})` },
                { id: 'delivered', label: `Delivered (${stats.deliveredJobs})` },
                { id: 'cancelled', label: `Cancelled (${stats.cancelledJobs})` }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedStatusFilter(pill.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedStatusFilter === pill.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-slate-200 mx-0.5 hidden sm:block" />

            {/* Payment Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {[
                { id: 'all', label: 'All Pay' },
                { id: 'paid', label: 'Paid' },
                { id: 'partially_paid', label: 'Partially Paid' },
                { id: 'unpaid', label: 'Unpaid' }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedPaymentFilter(pill.id as any)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedPaymentFilter === pill.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Counter, Active Filter Badges and Reset Button */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 px-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span>
              Showing <strong className="text-slate-900 font-bold">{filteredJobs.length}</strong> of {jobs.length} jobs
            </span>

            {/* Active filter badges */}
            {quickFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px] flex items-center gap-1">
                <span>Quick: {quickFilter}</span>
                <button onClick={() => setQuickFilter('all')} className="hover:text-black">✕</button>
              </span>
            )}
            {submissionDateFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-bold text-[10px] flex items-center gap-1">
                <span>Submitted: {submissionDateFilter === 'custom' ? customSubmissionDate : submissionDateFilter}</span>
                <button onClick={() => { setSubmissionDateFilter('all'); setCustomSubmissionDate(''); }} className="hover:text-black">✕</button>
              </span>
            )}
            {deliveryDateFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-bold text-[10px] flex items-center gap-1">
                <span>Delivery: {deliveryDateFilter === 'custom' ? customDeliveryDate : deliveryDateFilter}</span>
                <button onClick={() => { setDeliveryDateFilter('all'); setCustomDeliveryDate(''); }} className="hover:text-black">✕</button>
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-emerald-700 hover:text-emerald-900 hover:underline font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* Recent Jobs Table - Responsive for Desktop & Mobile */}
        {filteredJobs.length === 0 ? (
          <div className="p-12 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 space-y-3">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No recent jobs found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No cyber cafe work orders match your search or status filter. Click below to add a new job.
            </p>
            <button
              onClick={() => setIsAddJobModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-colors"
            >
              + Create New Job Order
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">Token & Job ID</th>
                  <th className="py-3 px-3.5">Customer</th>
                  <th className="py-3 px-3.5">Service Details</th>
                  <th className="py-3 px-3.5">Delivery Target</th>
                  <th className="py-3 px-3.5">Payment</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((job) => {
                  const isPaid = job.paidAmount >= job.amount;
                  const due = Math.max(0, job.amount - job.paidAmount);

                  return (
                    <tr 
                      key={job.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        job.urgent ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Token & Job ID (Clickable to open Job Details) */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div 
                          onClick={() => setDetailsJob(job)}
                          className="flex items-center gap-2 cursor-pointer group"
                          title="Click to view full job details & status timeline"
                        >
                          <span className="w-7 h-7 rounded-lg bg-slate-900 text-amber-300 font-black text-xs flex items-center justify-center font-mono group-hover:bg-blue-600 transition-colors shadow-xs">
                            #{job.tokenNumber}
                          </span>
                          <div>
                            <span className="font-mono text-[11px] font-bold text-slate-700 block group-hover:text-blue-600 group-hover:underline">
                              {job.id}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {job.createdAt}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div>
                          <button
                            onClick={() => {
                              const match = customers.find(c => (job.customerId && c.id === job.customerId) || c.mobile === job.customerMobile);
                              if (match) {
                                setSelectedCustomerIdForProfile(match.id);
                              }
                              setActiveTab('customers');
                            }}
                            className="font-bold text-slate-900 text-xs block text-left hover:text-emerald-700 hover:underline cursor-pointer group flex items-center gap-1"
                            title="Open Customer Profile & Job History"
                          >
                            <span>{job.customerName}</span>
                            <Eye className="w-3 h-3 text-emerald-600 opacity-60 group-hover:opacity-100" />
                          </button>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] font-mono text-slate-500">
                              {job.customerMobile}
                            </span>
                            <button
                              onClick={() => sendWhatsAppUpdate(job)}
                              className="text-emerald-600 hover:text-emerald-700 p-0.5 rounded cursor-pointer"
                              title="Send WhatsApp update to customer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={`tel:${job.customerMobile}`}
                              className="text-blue-600 hover:text-blue-700 p-0.5 rounded cursor-pointer"
                              title="Call customer"
                            >
                              <Phone className="w-3 h-3" />
                            </a>
                            <button
                              onClick={() => {
                                const match = customers.find(c => (job.customerId && c.id === job.customerId) || c.mobile === job.customerMobile);
                                if (match) {
                                  setSelectedCustomerIdForProfile(match.id);
                                }
                                setActiveTab('customers');
                              }}
                              className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800 text-[9px] font-bold cursor-pointer transition-colors"
                              title="View full customer profile & previous jobs history"
                            >
                              History ↗
                            </button>
                          </div>
                          {job.villageOrCity && (
                            <span className="text-[10px] text-slate-400 block">
                              {job.villageOrCity}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Service Details */}
                      <td className="py-3.5 px-3.5 max-w-[240px]">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs">
                              {job.serviceType}
                            </span>
                            {job.urgent && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-extrabold text-[9px] uppercase tracking-wide">
                                Urgent
                              </span>
                            )}
                          </div>
                          {job.description && (
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                              {job.description}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Delivery Target (Shows Overdue alert badge if delivery date is past) */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        {(() => {
                          const overdue = isJobOverdue(job);
                          return (
                            <div className="flex items-start gap-1.5 text-slate-700">
                              <Calendar className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${overdue ? 'text-rose-600' : 'text-slate-400'}`} />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-bold text-xs block ${overdue ? 'text-rose-700 font-black' : 'text-slate-800'}`}>
                                    {job.expectedDeliveryDate || job.deliveryDate}
                                  </span>
                                  {overdue && (
                                    <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-extrabold text-[9px] uppercase tracking-wide flex items-center gap-0.5 border border-rose-200">
                                      <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                                      <span>Overdue</span>
                                    </span>
                                  )}
                                </div>
                                <span className={`text-[10px] block ${overdue ? 'text-rose-500 font-semibold' : 'text-slate-400'}`}>
                                  {job.deliveryTime || 'Ready Soon'}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        {(() => {
                          const charge = Number(job.serviceCharge ?? job.amount) || 0;
                          const paid = Number(job.amountPaid ?? job.paidAmount) || 0;
                          const due = job.balanceDue !== undefined ? job.balanceDue : Math.max(0, charge - paid);
                          const isFullyPaid = paid >= charge && charge > 0;
                          const isUnpaid = paid === 0;

                          return (
                            <div>
                              <div className="font-mono text-xs flex items-center gap-1.5">
                                <span className="font-black text-slate-900">₹{charge}</span>
                                {paid > 0 && paid < charge && (
                                  <span className="text-[10px] text-slate-400 font-semibold">(Paid: ₹{paid})</span>
                                )}
                              </div>
                              {isFullyPaid ? (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 mt-0.5">
                                  <Check className="w-2.5 h-2.5" />
                                  <span>Paid</span>
                                </span>
                              ) : isUnpaid ? (
                                <div className="mt-0.5">
                                  <span className="inline-flex items-center text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                    Unpaid: ₹{due}
                                  </span>
                                  <button
                                    onClick={() => handleMarkAsPaid(job.id)}
                                    className="block text-[10px] text-emerald-700 hover:underline font-bold mt-0.5 cursor-pointer"
                                  >
                                    Mark Paid
                                  </button>
                                </div>
                              ) : (
                                <div className="mt-0.5">
                                  <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                    Partially Paid (Due: ₹{due})
                                  </span>
                                  <button
                                    onClick={() => handleMarkAsPaid(job.id)}
                                    className="block text-[10px] text-emerald-700 hover:underline font-bold mt-0.5 cursor-pointer"
                                  >
                                    Clear Balance
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Status Stepper / Dropdown */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <select
                            value={job.status}
                            onChange={(e) => handleSetExactStatus(job.id, e.target.value as CyberCafeJobStatus)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-xl border focus:outline-none cursor-pointer ${
                              job.status === 'pending'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : job.status === 'processing'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : job.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : job.status === 'delivered'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                                : 'bg-rose-50 text-rose-800 border-rose-300 line-through'
                            }`}
                          >
                            <option value="pending">⏳ Pending</option>
                            <option value="processing">⚙️ Processing</option>
                            <option value="completed">✅ Completed</option>
                            <option value="delivered">🚚 Delivered</option>
                            <option value="cancelled">🚫 Cancelled</option>
                          </select>

                          {job.status !== 'delivered' && job.status !== 'cancelled' && (
                            <button
                              onClick={() => handleAdvanceStatus(job.id, job.status)}
                              className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                              title="Advance to next status"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDetailsJob(job)}
                            className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors border border-blue-200/80 shadow-xs"
                            title="View Job Details & Timestamped Activity History"
                          >
                            <History className="w-3.5 h-3.5 text-blue-600" />
                            <span>Activity & Details</span>
                          </button>

                          <button
                            onClick={() => setReceiptJob(job)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer transition-colors"
                            title="Print Token Slip / Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingJob(job)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer transition-colors"
                            title="Edit Job Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Quick Footer Links / Reset Defaults */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-slate-400">
          <span>
            ⚡ Total Revenue Collected: <strong className="text-emerald-700 font-bold font-mono">₹{stats.totalRevenue}</strong> | Total Due Balance: <strong className="text-amber-700 font-bold font-mono">₹{stats.totalDue}</strong>
          </span>

          <button
            onClick={handleResetDefaults}
            className="text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
          >
            Reset Demo Jobs Data
          </button>
        </div>
      </div>
      </>
    )}

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW JOB ORDER (ALL REQUIRED FIELDS & STRICT VALIDATION) */}
      {/* ========================================================================= */}
      {isAddJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                    +
                  </span>
                  <h3 className="font-bold text-sm sm:text-base">Create New Job Order (নতুন কাজ)</h3>
                </div>
                <div className="flex items-center gap-2 mt-1 font-mono text-[11px] text-slate-300">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold border border-slate-700">
                    Auto Token #{nextTokenNumber}
                  </span>
                  <span>•</span>
                  <span className="text-slate-400">
                    Job ID: <strong className="text-white">{nextJobId}</strong>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAddJobModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* 1. Customer Selection / Direct Entry */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Customer (গ্রাহক নির্বাচন) *</span>
                  </label>
                  <span className="text-[11px] text-slate-500">Pick existing or enter new</span>
                </div>

                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500 bg-white font-medium text-xs text-slate-800"
                >
                  <option value="new">+ Quick Add New Customer (নতুন গ্রাহক এন্ট্রি)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id}: {c.name} ({c.mobile}) - {c.villageOrCity || 'No address'}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name (গ্রাহকের নাম) *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Subir Karmakar"
                      className="w-full px-3 py-2 bg-white border rounded-xl outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mobile Number (মোবাইল নম্বর) *</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit mobile number"
                      className="w-full px-3 py-2 bg-white border rounded-xl outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Village / City / Address (ঠিকানা)</label>
                    <input
                      type="text"
                      value={villageOrCity}
                      onChange={(e) => setVillageOrCity(e.target.value)}
                      placeholder="e.g. Barasat, North 24 Pgs"
                      className="w-full px-3 py-2 bg-white border rounded-xl outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Optional Email (ইমেইল)</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. customer@gmail.com (Optional)"
                      className="w-full px-3 py-2 bg-white border rounded-xl outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Service Name & Description */}
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <span>Service Name (কাজের সেবা) *</span>
                  </label>
                  <select
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500 bg-white font-medium text-slate-800"
                  >
                    {COMMON_SERVICES.map((s, idx) => (
                      <option key={idx} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {serviceName.includes('Other') && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Specify Custom Service Name *</label>
                    <input
                      type="text"
                      required
                      value={customServiceName}
                      onChange={(e) => setCustomServiceName(e.target.value)}
                      placeholder="Enter custom cyber cafe service name"
                      className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500 bg-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Description (optional)</label>
                  <textarea
                    rows={2}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="e.g. WB Police Constable application, Roll no 4521, glossy print, pending signature scan"
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500 bg-white"
                  />
                </div>
              </div>

              {/* 3. Submission Date and Time & Expected Delivery Date */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Submission Date & Time *</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={submissionDateTime}
                      onChange={(e) => setSubmissionDateTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white border rounded-xl outline-none focus:border-blue-500 font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Expected Delivery Date *</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={expectedDeliveryDate}
                      onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border rounded-xl outline-none focus:border-indigo-500 font-mono text-slate-800"
                    />
                  </div>
                </div>

                {/* Quick Delivery Shortcuts */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/70 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Quick Delivery:</span>
                    <button
                      type="button"
                      onClick={() => setExpectedDeliveryDate(new Date().toISOString().split('T')[0])}
                      className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 border text-slate-700 font-semibold cursor-pointer"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 1);
                        setExpectedDeliveryDate(d.toISOString().split('T')[0]);
                      }}
                      className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 border text-slate-700 font-semibold cursor-pointer"
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 2);
                        setExpectedDeliveryDate(d.toISOString().split('T')[0]);
                      }}
                      className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 border text-slate-700 font-semibold cursor-pointer"
                    >
                      +2 Days
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">Target Time:</span>
                    <input
                      type="text"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      placeholder="e.g. 05:00 PM"
                      className="w-24 px-2 py-0.5 bg-white border rounded text-[11px] font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Service Charge, Amount Paid & Automatic Balance Due Calculation */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4 text-emerald-700" />
                    <span>Charges & Payment Calculation (হিসাব)</span>
                  </h4>
                  <span className="text-[10px] text-emerald-800 font-semibold">
                    Balance Due = Service Charge - Amount Paid
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Service Charge (চার্জ ₹) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      required
                      value={serviceCharge}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setServiceCharge(val);
                      }}
                      className="w-full px-3 py-2 bg-white border rounded-xl outline-none focus:border-emerald-600 font-mono font-bold text-sm text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Amount Paid (জমা ₹) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      required
                      value={amountPaid}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setAmountPaid(val);
                      }}
                      className="w-full px-3 py-2 bg-white border rounded-xl outline-none focus:border-emerald-600 font-mono font-bold text-sm text-slate-900"
                    />
                  </div>
                </div>

                {/* Quick Payment Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500 font-medium">Quick Amount:</span>
                  <button
                    type="button"
                    onClick={() => setAmountPaid(serviceCharge)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    Full Paid (₹{serviceCharge})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmountPaid(Math.round(serviceCharge / 2))}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    Partial 50% (₹{Math.round(serviceCharge / 2)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmountPaid(0)}
                    className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    Unpaid (₹0)
                  </button>
                </div>

                {/* Real-time Calculation Summary Bar */}
                <div className="p-3 bg-white rounded-xl border border-emerald-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Balance Due:</span>
                    <span className={`text-base font-black font-mono ${balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      ₹{balanceDue}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      (₹{serviceCharge} - ₹{amountPaid})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500">Payment Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                      paymentStatus === 'paid'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : paymentStatus === 'partially_paid'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {paymentStatus === 'paid' ? 'Paid' : paymentStatus === 'partially_paid' ? 'Partially Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>

                {/* Validation Warning Alert */}
                {validationError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>

              {/* 5. Job Status & Optional Internal Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Job Status (কাজের বর্তমান অবস্থা) *
                  </label>
                  <select
                    value={jobStatus}
                    onChange={(e) => setJobStatus(e.target.value as CyberCafeJobStatus)}
                    className="w-full px-3 py-2 bg-white border rounded-xl outline-none focus:border-slate-800 font-bold text-slate-800"
                  >
                    <option value="pending">⏳ Pending (অপেক্ষমাণ)</option>
                    <option value="processing">⚙️ Processing (চলছে)</option>
                    <option value="completed">✅ Completed (রেডি)</option>
                    <option value="delivered">🚚 Delivered (হস্তান্তরিত)</option>
                    <option value="cancelled">🚫 Cancelled (বাতিল)</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 mt-4 sm:mt-0 p-2.5 bg-slate-50 rounded-xl border border-slate-200 w-full">
                    <input
                      type="checkbox"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                    />
                    <span className="text-rose-700">Mark as Urgent Work (জরুরি কাজ)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Optional Internal Notes (দোকানের গোপন নোট)</label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="e.g. OTP verified on phone, Roll number checked from admit card, Saved in Desktop/Orders folder"
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-slate-800 bg-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddJobModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Boolean(validationError)}
                  className={`px-5 py-2 text-white font-bold rounded-xl shadow cursor-pointer transition-all ${
                    validationError
                      ? 'bg-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  Create Job #{nextTokenNumber}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT EXISTING JOB (ALL REQUIRED FIELDS & VALIDATION) */}
      {/* ========================================================================= */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Edit Job #{editingJob.tokenNumber}</h3>
                  <p className="text-[11px] font-mono text-slate-300">Job ID: {editingJob.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingJob(null)}
                className="text-slate-400 hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditJob} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={editingJob.customerName}
                    onChange={(e) => setEditingJob({ ...editingJob, customerName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border rounded-xl outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={editingJob.customerMobile}
                    onChange={(e) => setEditingJob({ ...editingJob, customerMobile: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 bg-white border rounded-xl outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Village / Address</label>
                  <input
                    type="text"
                    value={editingJob.villageOrCity || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, villageOrCity: e.target.value })}
                    className="w-full px-3 py-2 bg-white border rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Service Name & Description */}
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service Name *</label>
                  <input
                    type="text"
                    required
                    value={editingJob.serviceName || editingJob.serviceType}
                    onChange={(e) => setEditingJob({ 
                      ...editingJob, 
                      serviceName: e.target.value,
                      serviceType: e.target.value 
                    })}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Description (optional)</label>
                  <textarea
                    rows={2}
                    value={editingJob.description || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Dates & Timelines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Submission Date & Time</label>
                  <input
                    type="text"
                    value={editingJob.submissionDateTime || editingJob.createdAt}
                    onChange={(e) => setEditingJob({ 
                      ...editingJob, 
                      submissionDateTime: e.target.value,
                      createdAt: e.target.value 
                    })}
                    className="w-full px-3 py-2 bg-white border rounded-xl outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expected Delivery Date</label>
                  <input
                    type="text"
                    value={editingJob.expectedDeliveryDate || editingJob.deliveryDate}
                    onChange={(e) => setEditingJob({ 
                      ...editingJob, 
                      expectedDeliveryDate: e.target.value,
                      deliveryDate: e.target.value 
                    })}
                    className="w-full px-3 py-2 bg-white border rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Service Charge, Amount Paid, and Real-time Balance Due */}
              {(() => {
                const charge = Number(editingJob.serviceCharge ?? editingJob.amount) || 0;
                const paid = Number(editingJob.amountPaid ?? editingJob.paidAmount) || 0;
                const due = calculateBalanceDue(charge, paid);
                const isOverpaid = paid > charge;
                const isNeg = charge < 0 || paid < 0;

                return (
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Service Charge ₹ *</label>
                        <input
                          type="number"
                          min={0}
                          value={charge}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setEditingJob({
                              ...editingJob,
                              serviceCharge: val,
                              amount: val
                            });
                          }}
                          className="w-full px-3 py-2 bg-white border rounded-xl outline-none focus:border-blue-500 font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Amount Paid ₹ *</label>
                        <input
                          type="number"
                          min={0}
                          value={paid}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setEditingJob({
                              ...editingJob,
                              amountPaid: val,
                              paidAmount: val
                            });
                          }}
                          className="w-full px-3 py-2 bg-white border rounded-xl outline-none focus:border-blue-500 font-mono font-bold"
                        />
                      </div>
                    </div>

                    {/* Quick Payment Helpers */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-500 font-medium">Quick Set:</span>
                      <button
                        type="button"
                        onClick={() => setEditingJob({
                          ...editingJob,
                          amountPaid: charge,
                          paidAmount: charge
                        })}
                        className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold cursor-pointer"
                      >
                        Full Paid (₹{charge})
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingJob({
                          ...editingJob,
                          amountPaid: 0,
                          paidAmount: 0
                        })}
                        className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold cursor-pointer"
                      >
                        Unpaid (₹0)
                      </button>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-blue-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-medium">Calculated Balance Due:</span>
                        <span className={`font-mono font-black text-sm ${due > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          ₹{due}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        paid >= charge && charge > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : paid > 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {paid >= charge && charge > 0 ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Unpaid'}
                      </span>
                    </div>

                    {isOverpaid && (
                      <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>Amount Paid (₹{paid}) cannot exceed Service Charge (₹{charge}).</span>
                      </div>
                    )}
                    {isNeg && (
                      <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>Amounts cannot be negative.</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Status & Internal Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Job Status *</label>
                <select
                  value={editingJob.status}
                  onChange={(e) => setEditingJob({ ...editingJob, status: e.target.value as CyberCafeJobStatus })}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500 font-bold bg-white"
                >
                  <option value="pending">⏳ Pending (অপেক্ষমাণ)</option>
                  <option value="processing">⚙️ Processing (চলছে)</option>
                  <option value="completed">✅ Completed (রেডি)</option>
                  <option value="delivered">🚚 Delivered (হস্তান্তরিত)</option>
                  <option value="cancelled">🚫 Cancelled (বাতিল)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Optional Internal Notes</label>
                <textarea
                  rows={2}
                  value={editingJob.internalNotes ?? editingJob.notes ?? ''}
                  onChange={(e) => setEditingJob({ 
                    ...editingJob, 
                    internalNotes: e.target.value,
                    notes: e.target.value 
                  })}
                  placeholder="Internal shop notes"
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500 bg-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDeleteJob(editingJob.id)}
                  className="text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Order</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingJob(null)}
                    className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow cursor-pointer transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PRINT TOKEN SLIP / RECEIPT (ALL FIELDS INCLUDED) */}
      {/* ========================================================================= */}
      {receiptJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-xs">Customer Token Slip (টোকেন স্লিপ)</h3>
              </div>
              <button
                onClick={() => setReceiptJob(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Printable Receipt Body */}
            <div className="p-6 bg-slate-50 font-mono text-xs space-y-4 border-b border-slate-200">
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <h4 className="font-black text-sm text-slate-900">MASUD DIGITAL HUB</h4>
                <p className="text-[10px] text-slate-500">Cyber Cafe & Online Services</p>
                <div className="mt-2 inline-block px-3 py-1 rounded-lg bg-slate-900 text-amber-300 font-bold text-xs">
                  TOKEN #{receiptJob.tokenNumber}
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-700">
                <div className="flex justify-between">
                  <span>Job ID:</span>
                  <span className="font-bold">{receiptJob.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="font-bold">{receiptJob.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mobile:</span>
                  <span>{receiptJob.customerMobile}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Name:</span>
                  <span className="font-bold truncate max-w-[150px]">{receiptJob.serviceName || receiptJob.serviceType}</span>
                </div>
                {receiptJob.description && (
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Description:</span>
                    <span className="truncate max-w-[140px]">{receiptJob.description}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Submitted:</span>
                  <span>{receiptJob.submissionDateTime || receiptJob.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expected Delivery:</span>
                  <span>{receiptJob.expectedDeliveryDate || receiptJob.deliveryDate} ({receiptJob.deliveryTime || 'Ready Soon'})</span>
                </div>
                <div className="flex justify-between">
                  <span>Job Status:</span>
                  <span className="font-bold uppercase text-[10px]">{receiptJob.status}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 text-xs">
                <div className="flex justify-between font-bold">
                  <span>Service Charge:</span>
                  <span>₹{receiptJob.serviceCharge ?? receiptJob.amount}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Amount Paid:</span>
                  <span>₹{receiptJob.amountPaid ?? receiptJob.paidAmount}</span>
                </div>
                <div className="flex justify-between text-rose-700 font-black">
                  <span>Balance Due:</span>
                  <span>₹{receiptJob.balanceDue !== undefined ? receiptJob.balanceDue : Math.max(0, (receiptJob.serviceCharge ?? receiptJob.amount) - (receiptJob.amountPaid ?? receiptJob.paidAmount))}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-600 pt-0.5">
                  <span>Payment Status:</span>
                  <span className="font-bold uppercase">
                    {(receiptJob.amountPaid ?? receiptJob.paidAmount) >= (receiptJob.serviceCharge ?? receiptJob.amount) ? 'PAID' : (receiptJob.amountPaid ?? receiptJob.paidAmount) > 0 ? 'PARTIALLY PAID' : 'UNPAID'}
                  </span>
                </div>
              </div>

              {receiptJob.internalNotes && (
                <div className="pt-2 border-t border-dotted border-slate-300 text-[10px] text-slate-500">
                  <span className="font-bold">Notes:</span> {receiptJob.internalNotes}
                </div>
              )}

              <p className="text-[9px] text-center text-slate-400 leading-tight pt-1">
                *Please bring this slip or WhatsApp token while collecting your documents.
              </p>
            </div>

            {/* Print / Action Buttons */}
            <div className="p-4 bg-white flex items-center justify-between">
              <button
                onClick={() => sendWhatsAppUpdate(receiptJob)}
                className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Token</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer shadow"
              >
                <Printer className="w-3.5 h-3.5 text-amber-300" />
                <span>Print Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* MODAL 4: CUSTOMER DIRECTORY MODAL */}
      {/* ========================================================================= */}
      {isCustomerListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Customer Directory ({customers.length} Registered Customers)</h3>
              </div>
              <button
                onClick={() => setIsCustomerListOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              {customers.map((cust) => (
                <div
                  key={cust.id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                      {cust.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{cust.name}</h4>
                      <p className="text-[11px] font-mono text-slate-500">{cust.mobile}</p>
                      {cust.villageOrCity && (
                        <p className="text-[10px] text-slate-400">{cust.villageOrCity}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right text-[11px]">
                      <span className="font-bold text-slate-800 block">{cust.totalOrders} Orders</span>
                      <span className="text-[10px] text-emerald-700 font-bold font-mono">₹{cust.totalSpent} Spent</span>
                    </div>

                    <a
                      href={`https://wa.me/91${cust.mobile.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                      title="WhatsApp Customer"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsCustomerListOpen(false)}
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* MODAL 5: JOB DETAILS & UPDATES MODAL (Requirement 5: Job Details & Updates) */}
      {/* ========================================================================= */}
      {detailsJob && (
        <CyberCafeJobDetailsModal
          job={detailsJob}
          onClose={() => setDetailsJob(null)}
          onUpdateJob={(updatedJob) => {
            const updated = jobs.map((j) => (j.id === updatedJob.id ? updatedJob : j));
            handleUpdateJobs(updated);
            setDetailsJob(updatedJob);
          }}
          onPrintReceipt={(j) => setReceiptJob(j)}
          onOpenCustomerProfile={(customerIdOrMobile) => {
            const match = customers.find(
              (c) => c.id === customerIdOrMobile || c.mobile === customerIdOrMobile
            );
            if (match) {
              setSelectedCustomerIdForProfile(match.id);
            }
            setActiveTab('customers');
          }}
          lang={lang}
        />
      )}
    </div>
  );
};
