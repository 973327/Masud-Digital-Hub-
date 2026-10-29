import React, { useState, useMemo } from 'react';
import { 
  X, 
  Briefcase, 
  Clock, 
  Calendar, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  Ban, 
  MessageCircle, 
  Printer, 
  Phone, 
  User, 
  IndianRupee, 
  ArrowRight, 
  History, 
  Check, 
  FileText,
  CalendarClock,
  ArrowUpDown,
  Copy,
  Plus,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Tag,
  CheckCheck
} from 'lucide-react';
import { 
  CyberCafeJob, 
  CyberCafeJobStatus, 
  CyberCafeJobStatusHistoryEntry 
} from '../../types/cybercafeManagement';
import { 
  createStatusHistoryEntry, 
  formatCurrentTimestamp, 
  isJobOverdue,
  calculateBalanceDue,
  determinePaymentStatus
} from '../../services/cyberCafeStorage';

interface CyberCafeJobDetailsModalProps {
  job: CyberCafeJob;
  onClose: () => void;
  onUpdateJob: (updatedJob: CyberCafeJob) => void;
  onPrintReceipt: (job: CyberCafeJob) => void;
  onOpenCustomerProfile?: (customerIdOrMobile: string) => void;
  lang?: 'en' | 'bn';
}

export const CyberCafeJobDetailsModal: React.FC<CyberCafeJobDetailsModalProps> = ({
  job,
  onClose,
  onUpdateJob,
  onPrintReceipt,
  onOpenCustomerProfile,
  lang = 'en'
}) => {
  // Update state for Status & Delivery Info
  const [selectedStatus, setSelectedStatus] = useState<CyberCafeJobStatus>(job.status);
  const [deliveryDate, setDeliveryDate] = useState<string>(job.expectedDeliveryDate || job.deliveryDate || '');
  const [deliveryTime, setDeliveryTime] = useState<string>(job.deliveryTime || '05:00 PM');
  const [updateNote, setUpdateNote] = useState<string>('');
  const [internalNotes, setInternalNotes] = useState<string>(job.internalNotes || job.notes || '');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Activity History State (Core Requirement)
  const [sortOrder, setSortOrder] = useState<'chronological' | 'reverse'>('chronological');
  const [activityFilter, setActivityFilter] = useState<'all' | 'status_only' | 'notes_only'>('all');
  const [isAddNoteOpen, setIsAddNoteOpen] = useState<boolean>(false);
  const [newLogNote, setNewLogNote] = useState<string>('');
  const [copiedHistory, setCopiedHistory] = useState<boolean>(false);

  const overdue = isJobOverdue(job);
  const charge = Number(job.serviceCharge ?? job.amount) || 0;
  const paid = Number(job.amountPaid ?? job.paidAmount) || 0;
  const due = job.balanceDue !== undefined ? job.balanceDue : Math.max(0, charge - paid);
  const isPaid = paid >= charge && charge > 0;

  // Build full chronological Activity History with initial creation record guaranteed
  const fullActivityHistory = useMemo(() => {
    let list: CyberCafeJobStatusHistoryEntry[] = job.statusHistory ? [...job.statusHistory] : [];

    // If history is empty, synthesize the initial order creation record
    if (list.length === 0) {
      list = [
        {
          id: `init-${job.id}`,
          toStatus: 'pending',
          timestamp: job.submissionDateTime || job.createdAt || 'Order Created',
          note: `Order registered with Token #${job.tokenNumber} for customer ${job.customerName}. Service: ${job.serviceName || job.serviceType}.`,
          updatedBy: 'Shop Operator'
        }
      ];
    } else {
      // Check if an initial creation event exists; if the first entry is already a status change with fromStatus, ensure initial exists
      const hasInitial = list.some(entry => !entry.fromStatus);
      if (!hasInitial) {
        list = [
          {
            id: `init-${job.id}`,
            toStatus: 'pending',
            timestamp: job.submissionDateTime || job.createdAt || 'Order Created',
            note: `Order registered with Token #${job.tokenNumber} for customer ${job.customerName}.`,
            updatedBy: 'Shop Operator'
          },
          ...list
        ];
      }
    }

    return list;
  }, [job]);

  // Filtered and sorted activity history
  const sortedHistory = useMemo(() => {
    let filtered = fullActivityHistory.filter((entry) => {
      if (activityFilter === 'status_only') {
        return !!entry.fromStatus || entry.toStatus !== undefined;
      }
      if (activityFilter === 'notes_only') {
        return entry.note && entry.note.length > 0;
      }
      return true;
    });

    if (sortOrder === 'reverse') {
      return [...filtered].reverse();
    }
    return filtered;
  }, [fullActivityHistory, sortOrder, activityFilter]);

  // Handle Status & Delivery Update
  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    const isStatusChanged = selectedStatus !== job.status;
    let newHistory: CyberCafeJobStatusHistoryEntry[] = job.statusHistory ? [...job.statusHistory] : [];

    // If status changed or note provided, append a timestamped history entry
    if (isStatusChanged || (updateNote && updateNote.trim())) {
      const historyEntry = createStatusHistoryEntry(
        selectedStatus,
        isStatusChanged ? job.status : undefined,
        updateNote.trim() || undefined,
        'Shop Operator'
      );
      // Append chronologically to maintain history
      newHistory = [...newHistory, historyEntry];
    }

    const updatedJob: CyberCafeJob = {
      ...job,
      status: selectedStatus,
      expectedDeliveryDate: deliveryDate,
      deliveryDate: deliveryDate,
      deliveryTime: deliveryTime,
      internalNotes: internalNotes.trim() || undefined,
      notes: internalNotes.trim() || undefined,
      statusHistory: newHistory
    };

    onUpdateJob(updatedJob);
    setIsUpdating(false);
    setUpdateNote('');
    setSaveSuccessMessage('Status & delivery details updated successfully!');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  // Add an Activity Note directly into history without changing status
  const handleAddDirectNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogNote.trim()) return;

    const newEntry = createStatusHistoryEntry(
      job.status,
      undefined,
      newLogNote.trim(),
      'Shop Operator'
    );

    const existingHistory = job.statusHistory ? [...job.statusHistory] : [];
    const updatedHistory = [...existingHistory, newEntry];

    const updatedJob: CyberCafeJob = {
      ...job,
      statusHistory: updatedHistory
    };

    onUpdateJob(updatedJob);
    setNewLogNote('');
    setIsAddNoteOpen(false);
    setSaveSuccessMessage('New activity log entry added to history!');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  // Copy full activity audit trail to clipboard
  const handleCopyHistory = () => {
    const lines = [
      `Activity History: Token #${job.tokenNumber} (${job.id})`,
      `Customer: ${job.customerName} | Phone: ${job.customerMobile}`,
      `Service: ${job.serviceName || job.serviceType}`,
      `Created At: ${job.submissionDateTime || job.createdAt}`,
      `Current Status: ${job.status.toUpperCase()} | Balance Due: ₹${due}`,
      '==================================================',
      ...sortedHistory.map((item, idx) => {
        const stepNum = sortOrder === 'chronological' ? idx + 1 : sortedHistory.length - idx;
        const transition = item.fromStatus 
          ? `[${item.fromStatus.toUpperCase()} → ${item.toStatus.toUpperCase()}]`
          : `[${item.toStatus.toUpperCase()}]`;
        return `#${stepNum} [${item.timestamp}] ${transition}\n   Note: ${item.note || 'No additional note'}\n   By: ${item.updatedBy || 'Shop Operator'}`;
      })
    ];

    navigator.clipboard.writeText(lines.join('\n\n'));
    setCopiedHistory(true);
    setTimeout(() => setCopiedHistory(false), 2500);
  };

  // Quick Action: Mark as Paid
  const handleQuickMarkPaid = () => {
    const newEntry = createStatusHistoryEntry(
      job.status,
      undefined,
      `Full payment of ₹${due} received. Balance cleared.`,
      'Shop Operator'
    );
    const existingHistory = job.statusHistory ? [...job.statusHistory] : [];

    const updatedJob: CyberCafeJob = {
      ...job,
      amountPaid: charge,
      paidAmount: charge,
      balanceDue: 0,
      paymentStatus: 'paid',
      statusHistory: [...existingHistory, newEntry]
    };
    onUpdateJob(updatedJob);
    setSaveSuccessMessage('Payment marked as fully paid (₹' + charge + ')');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  // WhatsApp notification launcher
  const sendWhatsAppUpdate = () => {
    const cleanMobile = job.customerMobile.replace(/[^0-9]/g, '');
    let text = '';
    if (job.status === 'completed') {
      text = `নমস্কার ${job.customerName} বাবু, আপনার কাজটি (${job.serviceName || job.serviceType}) সম্পূর্ণ প্রস্তুত হয়ে গেছে। অনুগ্রহ করে দোকানে এসে সংগ্রহ করে নিন। মোট: ₹${charge}, বাকি: ₹${due}। টোকেন: #${job.tokenNumber}। ধন্যবাদ!`;
    } else if (job.status === 'processing') {
      text = `নমস্কার ${job.customerName}, আপনার কাজ (${job.serviceName || job.serviceType}) প্রসেসিং চলছে। সম্ভাব্য ডেলিভারি: ${job.expectedDeliveryDate || job.deliveryDate} (${job.deliveryTime || 'শীঘ্রই'})। টোকেন: #${job.tokenNumber}।`;
    } else {
      text = `নমস্কার ${job.customerName}, আপনার কাজের টোকেন #${job.tokenNumber} (${job.serviceName || job.serviceType}) স্ট্যাটাস আপডেট: ${job.status.toUpperCase()}। ধন্যবাদ!`;
    }
    const url = `https://wa.me/91${cleanMobile}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const getStatusBadge = (status: CyberCafeJobStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-600" /> Pending</span>;
      case 'processing':
        return <span className="px-2.5 py-1 rounded-xl bg-blue-100 text-blue-800 font-bold text-xs flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" /> Processing</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 rounded-xl bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-indigo-600" /> Delivered</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-xl bg-rose-100 text-rose-800 font-bold text-xs flex items-center gap-1.5"><Ban className="w-3.5 h-3.5 text-rose-600" /> Cancelled</span>;
      default:
        return null;
    }
  };

  const getStatusColorConfig = (status: CyberCafeJobStatus) => {
    switch (status) {
      case 'pending':
        return {
          pill: 'bg-amber-100 text-amber-900 border-amber-300',
          dot: 'bg-amber-500 border-amber-300 ring-amber-400/30',
          card: 'bg-amber-50/40 border-amber-200/80',
          icon: Clock
        };
      case 'processing':
        return {
          pill: 'bg-blue-100 text-blue-900 border-blue-300',
          dot: 'bg-blue-600 border-blue-300 ring-blue-500/30',
          card: 'bg-blue-50/40 border-blue-200/80',
          icon: Clock
        };
      case 'completed':
        return {
          pill: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          dot: 'bg-emerald-600 border-emerald-300 ring-emerald-500/30',
          card: 'bg-emerald-50/40 border-emerald-200/80',
          icon: CheckCircle2
        };
      case 'delivered':
        return {
          pill: 'bg-indigo-100 text-indigo-900 border-indigo-300',
          dot: 'bg-indigo-600 border-indigo-300 ring-indigo-500/30',
          card: 'bg-indigo-50/40 border-indigo-200/80',
          icon: Truck
        };
      case 'cancelled':
        return {
          pill: 'bg-rose-100 text-rose-900 border-rose-300',
          dot: 'bg-rose-600 border-rose-300 ring-rose-500/30',
          card: 'bg-rose-50/40 border-rose-200/80',
          icon: Ban
        };
      default:
        return {
          pill: 'bg-slate-100 text-slate-800 border-slate-300',
          dot: 'bg-slate-500 border-slate-300 ring-slate-400/30',
          card: 'bg-slate-50 border-slate-200',
          icon: Clock
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* ========================================================================= */}
        {/* 1. TOP HEADER */}
        {/* ========================================================================= */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center font-mono shadow-md">
              #{job.tokenNumber}
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-mono font-black text-sm sm:text-base text-white">{job.id}</h3>
                {job.urgent && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px] uppercase tracking-wide">
                    Urgent
                  </span>
                )}
                {overdue && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] uppercase tracking-wide flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Overdue</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 font-medium truncate max-w-xs sm:max-w-md">
                {job.serviceName || job.serviceType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintReceipt(job)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Print Customer Token Receipt"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Print Slip</span>
            </button>

            <button
              onClick={sendWhatsAppUpdate}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Send WhatsApp update to customer"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {saveSuccessMessage && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between shrink-0 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{saveSuccessMessage}</span>
            </div>
            <button onClick={() => setSaveSuccessMessage(null)} className="text-emerald-200 hover:text-white">✕</button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. BODY CONTENT (SCROLLABLE 2-COLUMN LAYOUT) */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Overdue Alert Banner if overdue */}
          {overdue && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl text-rose-800 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-black block text-rose-900">Delivery Target Missed (কাজের সময় পার হয়ে গেছে)</strong>
                <p className="text-rose-700 mt-0.5">
                  This order was scheduled for delivery on <strong>{job.expectedDeliveryDate || job.deliveryDate}</strong> ({job.deliveryTime || 'Ready Soon'}), but is currently still in <strong>{job.status.toUpperCase()}</strong> status. Please update the status or reschedule the delivery date below.
                </p>
              </div>
            </div>
          )}

          {/* Quick Overview Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Customer Details Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  <span>Customer</span>
                </span>
                {onOpenCustomerProfile && (
                  <button
                    onClick={() => {
                      onOpenCustomerProfile(job.customerId || job.customerMobile);
                      onClose();
                    }}
                    className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    View Profile ↗
                  </button>
                )}
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-900">{job.customerName}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs text-slate-600">{job.customerMobile}</span>
                  <a
                    href={`tel:${job.customerMobile}`}
                    className="p-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                    title="Call Customer"
                  >
                    <Phone className="w-3 h-3" />
                  </a>
                  <button
                    onClick={sendWhatsAppUpdate}
                    className="p-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 cursor-pointer"
                    title="Message on WhatsApp"
                  >
                    <MessageCircle className="w-3 h-3" />
                  </button>
                </div>
                {job.villageOrCity && (
                  <p className="text-[11px] text-slate-500 mt-1">{job.villageOrCity}</p>
                )}
                {job.customerId && (
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px] font-bold">
                    ID: {job.customerId}
                  </span>
                )}
              </div>
            </div>

            {/* Service & Delivery Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Service & Timing</span>
              </span>
              <div>
                <h4 className="font-bold text-xs text-slate-900">{job.serviceName || job.serviceType}</h4>
                {job.description && (
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{job.description}</p>
                )}
                <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Submitted:</span>
                    <span className="font-bold text-slate-700">{job.submissionDateTime || job.createdAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Delivery:</span>
                    <span className={`font-bold ${overdue ? 'text-rose-600' : 'text-slate-700'}`}>
                      {job.expectedDeliveryDate || job.deliveryDate} ({job.deliveryTime || 'Ready Soon'})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>Payment Status</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    isPaid ? 'bg-emerald-100 text-emerald-800' : paid > 0 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {isPaid ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Unpaid'}
                  </span>
                </div>

                <div className="mt-2 space-y-1 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service Charge:</span>
                    <span className="font-bold text-slate-900">₹{charge}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Amount Paid:</span>
                    <span className="font-bold">₹{paid}</span>
                  </div>
                  <div className="flex justify-between text-rose-700 font-black pt-1 border-t border-slate-200">
                    <span>Balance Due:</span>
                    <span>₹{due}</span>
                  </div>
                </div>
              </div>

              {due > 0 && (
                <button
                  type="button"
                  onClick={handleQuickMarkPaid}
                  className="w-full mt-2 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Paid (Collect ₹{due})</span>
                </button>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. AUTHORIZED USER UPDATE PANEL (UPDATE STATUS & DELIVERY INFO) */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/40 p-4 sm:p-5 rounded-3xl border border-blue-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <CalendarClock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Update Job Status & Delivery Information</h4>
                  <p className="text-[11px] text-slate-500">Change progress stage or adjust target delivery schedule</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">Current Status:</span>
                {getStatusBadge(job.status)}
              </div>
            </div>

            <form onSubmit={handleSaveUpdate} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* 1. Job Status */}
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1.5">
                    Select New Job Status *
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as CyberCafeJobStatus)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-xs outline-none focus:border-blue-500 shadow-xs"
                  >
                    <option value="pending">⏳ Pending (অপেক্ষমাণ)</option>
                    <option value="processing">⚙️ Processing (চলছে)</option>
                    <option value="completed">✅ Completed (রেডি)</option>
                    <option value="delivered">🚚 Delivered (হস্তান্তরিত)</option>
                    <option value="cancelled">🚫 Cancelled (বাতিল)</option>
                  </select>
                </div>

                {/* 2. Expected Delivery Date */}
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1.5 flex items-center justify-between">
                    <span>Expected Delivery Date *</span>
                    <span className="text-[10px] text-blue-600 font-normal">
                      <button
                        type="button"
                        onClick={() => setDeliveryDate('Today')}
                        className="hover:underline mr-1"
                      >
                        Today
                      </button>
                      |
                      <button
                        type="button"
                        onClick={() => setDeliveryDate('Tomorrow')}
                        className="hover:underline ml-1"
                      >
                        Tomorrow
                      </button>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    placeholder="e.g. Today, Tomorrow, or YYYY-MM-DD"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500 shadow-xs font-semibold"
                  />
                </div>

                {/* 3. Delivery Time */}
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1.5">
                    Delivery / Pickup Time
                  </label>
                  <input
                    type="text"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    placeholder="e.g. 05:00 PM or Ready for Pickup"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500 shadow-xs"
                  />
                </div>
              </div>

              {/* Status Update Reason / Timeline Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Timestamped Update Note (Timeline Entry)
                  </label>
                  <input
                    type="text"
                    value={updateNote}
                    onChange={(e) => setUpdateNote(e.target.value)}
                    placeholder="e.g. Photo printed and cut, Handed over to customer, or Reason for delay"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500 shadow-xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Recorded in the job's permanent Activity History timeline below.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Optional Internal Notes (Staff only)
                  </label>
                  <input
                    type="text"
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="e.g. Application password, shelf location, original document remarks"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500 shadow-xs"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Save Status & Delivery Updates</span>
                </button>
              </div>
            </form>
          </div>

          {/* ========================================================================= */}
          {/* 4. TIMESTAMPED ACTIVITY HISTORY (DETAILED CHRONOLOGICAL AUDIT TRAIL) */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 space-y-4 shadow-xs">
            {/* Header: Title, Counts, Sorting & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm sm:text-base text-slate-900">
                      Activity History
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                      {fullActivityHistory.length} {fullActivityHistory.length === 1 ? 'Event' : 'Events'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Chronological audit trail of all status transitions, operator logs & milestones
                  </p>
                </div>
              </div>

              {/* Action Cluster: Sort Toggle, Add Log, Copy */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Sort Order Button */}
                <button
                  type="button"
                  onClick={() => setSortOrder(prev => prev === 'chronological' ? 'reverse' : 'chronological')}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Toggle Chronological (Oldest First) vs Newest First"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {sortOrder === 'chronological' ? 'Oldest → Newest' : 'Newest → Oldest'}
                  </span>
                </button>

                {/* Add Quick Log Note Button */}
                <button
                  type="button"
                  onClick={() => setIsAddNoteOpen(prev => !prev)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                    isAddNoteOpen 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                  title="Log an operator activity note"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </button>

                {/* Copy History Summary Button */}
                <button
                  type="button"
                  onClick={handleCopyHistory}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    copiedHistory 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                  title="Copy full chronological history text"
                >
                  {copiedHistory ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedHistory ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Quick Filter Pills */}
            <div className="flex items-center justify-between text-xs gap-2 pt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mr-1">
                  Filter:
                </span>
                <button
                  type="button"
                  onClick={() => setActivityFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    activityFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({fullActivityHistory.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActivityFilter('status_only')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    activityFilter === 'status_only'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Status Transitions
                </button>
                <button
                  type="button"
                  onClick={() => setActivityFilter('notes_only')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    activityFilter === 'notes_only'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Notes & Remarks
                </button>
              </div>

              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                Sort: {sortOrder === 'chronological' ? 'Chronological (1 → N)' : 'Reverse (N → 1)'}
              </span>
            </div>

            {/* Inline Add Note Composer */}
            {isAddNoteOpen && (
              <form onSubmit={handleAddDirectNote} className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Log New Activity Note to Timeline</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddNoteOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                </div>

                <textarea
                  value={newLogNote}
                  onChange={(e) => setNewLogNote(e.target.value)}
                  placeholder="e.g. Customer called to confirm pickup time, Advance ₹100 received via GPay, or DigiLocker documents verified."
                  rows={2}
                  className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-xs outline-none focus:border-blue-500 shadow-2xs"
                  autoFocus
                />

                <div className="flex items-center justify-between">
                  {/* Quick Preset Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {['Customer Called', 'Docs Verified', 'Advance Paid', 'Ready Soon'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setNewLogNote(prev => prev ? `${prev} • ${tag}` : tag)}
                        className="text-[10px] bg-white border border-blue-200 hover:bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-semibold cursor-pointer"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddNoteOpen(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newLogNote.trim()}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
                    >
                      Save Activity Note
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Detailed Chronological Timeline */}
            {sortedHistory.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs space-y-2 border border-dashed border-slate-200 rounded-2xl">
                <History className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No activity records match the selected filter.</p>
              </div>
            ) : (
              <div className="relative pl-7 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {sortedHistory.map((entry, index) => {
                  // Determine actual chronological step index
                  const stepNumber = sortOrder === 'chronological' 
                    ? index + 1 
                    : sortedHistory.length - index;

                  const isCurrentActive = entry.toStatus === job.status && (
                    sortOrder === 'chronological' 
                      ? index === sortedHistory.length - 1 
                      : index === 0
                  );

                  const toConfig = getStatusColorConfig(entry.toStatus);
                  const Icon = toConfig.icon;

                  return (
                    <div key={entry.id || index} className="relative group">
                      {/* Timeline Dot Indicator */}
                      <div className={`absolute -left-7 sm:-left-8 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs ${
                        isCurrentActive 
                          ? `${toConfig.dot} ring-4` 
                          : 'bg-white border-slate-300'
                      }`}>
                        {isCurrentActive ? (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-400" />
                        )}
                      </div>

                      {/* Event Card */}
                      <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                        isCurrentActive 
                          ? `${toConfig.card} shadow-sm border-slate-300` 
                          : 'bg-slate-50/80 border-slate-200/70 hover:bg-slate-50'
                      }`}>
                        {/* Top Line: Step Badge, Transitions, Timestamp */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Step Badge */}
                            <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-900 text-white shadow-2xs">
                              STEP #{stepNumber}
                            </span>

                            {/* Transition Status Pills */}
                            {entry.fromStatus ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-bold text-slate-500 line-through">
                                  {entry.fromStatus.toUpperCase()}
                                </span>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${toConfig.pill} flex items-center gap-1`}>
                                  <Icon className="w-3 h-3" />
                                  <span>{entry.toStatus}</span>
                                </span>
                              </div>
                            ) : (
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${toConfig.pill} flex items-center gap-1`}>
                                <Icon className="w-3 h-3" />
                                <span>{entry.toStatus}</span>
                              </span>
                            )}

                            {/* Current Active Indicator */}
                            {isCurrentActive && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wide shadow-2xs">
                                Current State
                              </span>
                            )}
                          </div>

                          {/* Timestamp */}
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold">{entry.timestamp}</span>
                          </div>
                        </div>

                        {/* Note / Description */}
                        {entry.note ? (
                          <div className="mt-2 p-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-xs text-slate-800 font-medium leading-relaxed shadow-2xs">
                            <p>{entry.note}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic mt-1">
                            Status changed to {entry.toStatus.toUpperCase()}
                          </p>
                        )}

                        {/* Event Metadata Footer */}
                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>Logged by: <strong className="text-slate-700">{entry.updatedBy || 'Shop Operator'}</strong></span>
                          </span>

                          <span className="font-mono text-[9px] text-slate-400">
                            {entry.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. FOOTER */}
        {/* ========================================================================= */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            <span>Job created: <strong>{job.submissionDateTime || job.createdAt}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintReceipt(job)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
