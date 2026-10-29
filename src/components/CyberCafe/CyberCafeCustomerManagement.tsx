import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  Edit3, 
  Trash2, 
  Briefcase, 
  Eye, 
  Plus, 
  MessageCircle, 
  X, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Printer, 
  ExternalLink,
  RotateCcw,
  Tag,
  MapPin,
  Check
} from 'lucide-react';
import { CyberCafeCustomer, CyberCafeJob } from '../../types/cybercafeManagement';
import { generateCustomerId } from '../../services/cyberCafeStorage';

interface CyberCafeCustomerManagementProps {
  customers: CyberCafeCustomer[];
  jobs: CyberCafeJob[];
  onUpdateCustomers: (customers: CyberCafeCustomer[]) => void;
  onUpdateJobs: (jobs: CyberCafeJob[]) => void;
  onOpenNewJobForCustomer?: (customer: CyberCafeCustomer) => void;
  onPrintJobReceipt?: (job: CyberCafeJob) => void;
  onOpenJobDetails?: (job: CyberCafeJob) => void;
  initialSelectedCustomerId?: string | null;
  onClearInitialSelectedCustomer?: () => void;
  onBackToDashboard?: () => void;
  lang?: 'en' | 'bn';
}

export const CyberCafeCustomerManagement: React.FC<CyberCafeCustomerManagementProps> = ({
  customers,
  jobs,
  onUpdateCustomers,
  onUpdateJobs,
  onOpenNewJobForCustomer,
  onPrintJobReceipt,
  onOpenJobDetails,
  initialSelectedCustomerId,
  onClearInitialSelectedCustomer,
  onBackToDashboard,
  lang = 'en'
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCustomerForProfile, setSelectedCustomerForProfile] = useState<CyberCafeCustomer | null>(() => {
    if (initialSelectedCustomerId) {
      return customers.find(c => c.id === initialSelectedCustomerId) || null;
    }
    return null;
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<CyberCafeCustomer | null>(null);

  // Sync initialSelectedCustomerId if it changes from parent
  React.useEffect(() => {
    if (initialSelectedCustomerId) {
      const match = customers.find(c => c.id === initialSelectedCustomerId);
      if (match) {
        setSelectedCustomerForProfile(match);
      }
    }
  }, [initialSelectedCustomerId, customers]);

  // Close Profile Modal helper
  const handleCloseProfileModal = () => {
    setSelectedCustomerForProfile(null);
    onClearInitialSelectedCustomer?.();
  };

  // Form State for Adding New Customer
  const nextCustomerId = useMemo(() => generateCustomerId(customers), [customers]);
  const [formName, setFormName] = useState<string>('');
  const [formMobile, setFormMobile] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formVillage, setFormVillage] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formCreatedDate, setFormCreatedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Search filter by name or mobile number (Core Requirement)
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase().trim();
    return customers.filter((c) => {
      const matchName = c.name.toLowerCase().includes(q);
      const matchMobile = c.mobile.includes(q);
      const matchId = c.id.toLowerCase().includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q);
      const matchVillage = c.villageOrCity?.toLowerCase().includes(q);
      return matchName || matchMobile || matchId || matchEmail || matchVillage;
    });
  }, [customers, searchQuery]);

  // Helper to get previous jobs of a customer
  const getCustomerJobs = (customer: CyberCafeCustomer): CyberCafeJob[] => {
    return jobs.filter((j) => {
      if (j.customerId && j.customerId === customer.id) return true;
      if (j.customerMobile && j.customerMobile === customer.mobile) return true;
      return false;
    });
  };

  // Add New Customer Submit Handler
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formMobile.trim()) return;

    const newCustomer: CyberCafeCustomer = {
      id: nextCustomerId,
      name: formName.trim(),
      mobile: formMobile.trim(),
      email: formEmail.trim() || undefined,
      createdDate: formCreatedDate || new Date().toISOString().split('T')[0],
      villageOrCity: formVillage.trim() || undefined,
      totalOrders: 0,
      totalSpent: 0,
      lastVisit: 'Today',
      notes: formNotes.trim() || undefined
    };

    onUpdateCustomers([newCustomer, ...customers]);
    setIsAddModalOpen(false);

    // Reset Form
    setFormName('');
    setFormMobile('');
    setFormEmail('');
    setFormVillage('');
    setFormNotes('');
  };

  // Edit Customer Submit Handler
  const handleSaveEditCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !editingCustomer.name.trim() || !editingCustomer.mobile.trim()) return;

    const oldMobile = customers.find(c => c.id === editingCustomer.id)?.mobile;

    const updatedList = customers.map((c) => (c.id === editingCustomer.id ? editingCustomer : c));
    onUpdateCustomers(updatedList);

    // If mobile or name changed, propagate to their jobs for consistency
    if (oldMobile && (oldMobile !== editingCustomer.mobile || editingCustomer.name)) {
      const updatedJobs = jobs.map((j) => {
        if (j.customerId === editingCustomer.id || j.customerMobile === oldMobile) {
          return {
            ...j,
            customerId: editingCustomer.id,
            customerName: editingCustomer.name,
            customerMobile: editingCustomer.mobile,
            villageOrCity: editingCustomer.villageOrCity || j.villageOrCity
          };
        }
        return j;
      });
      onUpdateJobs(updatedJobs);
    }

    // If this customer was currently open in profile modal, update profile modal view as well
    if (selectedCustomerForProfile && selectedCustomerForProfile.id === editingCustomer.id) {
      setSelectedCustomerForProfile(editingCustomer);
    }

    setEditingCustomer(null);
  };

  // Delete Customer
  const handleDeleteCustomer = (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer record?')) {
      const updated = customers.filter((c) => c.id !== customerId);
      onUpdateCustomers(updated);
      if (selectedCustomerForProfile?.id === customerId) {
        setSelectedCustomerForProfile(null);
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & CUSTOMER SEARCH BAR */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                Customer Management (গ্রাহক ব্যবস্থাপনা)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Total: {customers.length}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Customer Records & Work History
            </h2>
            <p className="text-xs text-slate-500">
              Add new customers, manage contact profiles, and track all previous jobs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>← Back to Dashboard</span>
              </button>
            )}

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <UserPlus className="w-4 h-4 stroke-[3]" />
              <span>+ Add New Customer (নতুন গ্রাহক)</span>
            </button>
          </div>
        </div>

        {/* Search Bar - Live filter by name or mobile number (Core Requirement) */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1 border-t border-slate-100">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers by full name or 10-digit mobile number..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium whitespace-nowrap self-end sm:self-auto">
            Showing <strong className="text-slate-900 font-bold">{filteredCustomers.length}</strong> of {customers.length} customers
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CUSTOMER LIST / DIRECTORY */}
      {/* ========================================================================= */}
      {filteredCustomers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3 shadow-xs">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No customers found matching "{searchQuery}"</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try checking the spelling or mobile number, or add this person as a new customer.
          </p>
          <div className="flex justify-center gap-2 pt-1">
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 border rounded-xl text-slate-600 text-xs font-bold cursor-pointer hover:bg-slate-50"
            >
              Clear Search
            </button>
            <button
              onClick={() => {
                setFormName(searchQuery.replace(/[0-9]/g, '').trim());
                setFormMobile(searchQuery.replace(/\D/g, '').trim());
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow cursor-pointer hover:bg-emerald-700"
            >
              + Add as New Customer
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => {
            const customerJobs = getCustomerJobs(cust);
            const totalDue = customerJobs.reduce(
              (sum, j) => sum + Math.max(0, j.amount - j.paidAmount),
              0
            );

            return (
              <div
                key={cust.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Header: ID & Profile info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-black text-base flex items-center justify-center shadow-xs">
                        {cust.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-900 text-amber-300">
                            {cust.id}
                          </span>
                          {cust.createdDate && (
                            <span className="text-[10px] text-slate-400">
                              Joined {cust.createdDate}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 mt-1 leading-snug">
                          {cust.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingCustomer(cust)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit Customer Details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(cust.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="space-y-1 text-xs pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-600 font-mono">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold">{cust.mobile}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <a
                          href={`https://wa.me/91${cust.mobile.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md text-emerald-700 bg-emerald-50 hover:bg-emerald-100 cursor-pointer"
                          title="WhatsApp Customer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`tel:${cust.mobile}`}
                          className="p-1 rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 cursor-pointer"
                          title="Direct Call"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {cust.email && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <a href={`mailto:${cust.email}`} className="hover:underline truncate">
                          {cust.email}
                        </a>
                      </div>
                    )}

                    {cust.villageOrCity && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{cust.villageOrCity}</span>
                      </div>
                    )}
                  </div>

                  {/* Job Statistics Badge */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-center font-mono">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-sans block font-semibold">Total Orders</span>
                      <span className="text-sm font-bold text-slate-900 block">
                        {customerJobs.length || cust.totalOrders || 0}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-sans block font-semibold">Balance Due</span>
                      <span className={`text-sm font-bold block ${totalDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ₹{totalDue}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions: View Profile & Previous Jobs, or New Job */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedCustomerForProfile(cust)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="View Customer Profile & Complete Job History"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                    <span>Profile & History ({customerJobs.length})</span>
                  </button>

                  {onOpenNewJobForCustomer && (
                    <button
                      onClick={() => onOpenNewJobForCustomer(cust)}
                      className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer border border-emerald-200"
                      title="Create New Job for this Customer"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-600" />
                      <span>New Job</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CUSTOMER PROFILE & PREVIOUS JOBS MODAL (CORE REQUIREMENT) */}
      {/* ========================================================================= */}
      {selectedCustomerForProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 font-black text-base flex items-center justify-center">
                  {selectedCustomerForProfile.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                      {selectedCustomerForProfile.id}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base">
                      {selectedCustomerForProfile.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {selectedCustomerForProfile.mobile} • Joined {selectedCustomerForProfile.createdDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const custToEdit = selectedCustomerForProfile;
                    setSelectedCustomerForProfile(null);
                    setEditingCustomer(custToEdit);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={handleCloseProfileModal}
                  className="text-slate-400 hover:text-white cursor-pointer text-lg p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Profile Overview Banner */}
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 shrink-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                {(() => {
                  const custJobs = getCustomerJobs(selectedCustomerForProfile);
                  const totalSpent = custJobs.reduce((sum, j) => sum + (j.paidAmount || 0), 0);
                  const totalDue = custJobs.reduce((sum, j) => sum + Math.max(0, j.amount - j.paidAmount), 0);

                  return (
                    <>
                      <div className="bg-white p-3 rounded-2xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-sans block font-semibold">Total Orders</span>
                        <span className="text-lg font-black text-slate-900 block">{custJobs.length}</span>
                      </div>
                      <div className="bg-white p-3 rounded-2xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-sans block font-semibold">Total Paid</span>
                        <span className="text-lg font-black text-emerald-700 block">₹{totalSpent}</span>
                      </div>
                      <div className="bg-white p-3 rounded-2xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-sans block font-semibold">Balance Due</span>
                        <span className={`text-lg font-black block ${totalDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          ₹{totalDue}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-2xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-sans block font-semibold">Contact</span>
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <a
                            href={`https://wa.me/91${selectedCustomerForProfile.mobile.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 p-1 bg-emerald-50 rounded-lg hover:bg-emerald-100"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                          <a
                            href={`tel:${selectedCustomerForProfile.mobile}`}
                            className="text-blue-700 p-1 bg-blue-50 rounded-lg hover:bg-blue-100"
                            title="Call"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Extra details like email, village, notes */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-200 font-sans">
                {selectedCustomerForProfile.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <strong>Email:</strong> {selectedCustomerForProfile.email}
                  </span>
                )}
                {selectedCustomerForProfile.villageOrCity && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <strong>Location:</strong> {selectedCustomerForProfile.villageOrCity}
                  </span>
                )}
                {selectedCustomerForProfile.notes && (
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <strong>Notes:</strong> {selectedCustomerForProfile.notes}
                  </span>
                )}
              </div>
            </div>

            {/* Previous Jobs Table Section (Core Requirement) */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>Previous Jobs & Order History (পূর্ববর্তী কাজের তালিকা)</span>
                </h4>

                {onOpenNewJobForCustomer && (
                  <button
                    onClick={() => {
                      const cust = selectedCustomerForProfile;
                      setSelectedCustomerForProfile(null);
                      onOpenNewJobForCustomer(cust);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Place New Job for Customer</span>
                  </button>
                )}
              </div>

              {(() => {
                const customerJobs = getCustomerJobs(selectedCustomerForProfile);

                if (customerJobs.length === 0) {
                  return (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500 space-y-2">
                      <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
                      <p>No previous jobs recorded yet for {selectedCustomerForProfile.name}.</p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Token & ID</th>
                          <th className="py-2.5 px-3">Service</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Amount & Payment</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {customerJobs.map((job) => (
                          <tr key={job.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className="font-mono font-bold text-slate-800">#{job.tokenNumber}</span>
                              <span className="text-[10px] text-slate-400 block font-mono">{job.id}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-slate-900 block">{job.serviceType}</span>
                              {job.description && (
                                <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">
                                  {job.description}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                              {job.createdAt}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap font-mono">
                              <span className="font-bold">₹{job.amount}</span>
                              <span className="text-[10px] text-slate-400 ml-1">
                                (Paid: ₹{job.paidAmount})
                              </span>
                              {job.amount - job.paidAmount > 0 && (
                                <span className="block text-[10px] font-bold text-rose-600">
                                  Due: ₹{job.amount - job.paidAmount}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  job.status === 'pending'
                                    ? 'bg-amber-100 text-amber-800'
                                    : job.status === 'processing'
                                    ? 'bg-blue-100 text-blue-800'
                                    : job.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : job.status === 'delivered'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {job.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1">
                                {onOpenJobDetails && (
                                  <button
                                    onClick={() => onOpenJobDetails(job)}
                                    className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-[10px] cursor-pointer flex items-center gap-1 border border-emerald-200"
                                    title="View Job Details, Updates & Timeline"
                                  >
                                    <Eye className="w-3 h-3 text-emerald-600" />
                                    <span>Details</span>
                                  </button>
                                )}
                                {onPrintJobReceipt && (
                                  <button
                                    onClick={() => onPrintJobReceipt(job)}
                                    className="p-1 rounded-lg text-slate-600 hover:bg-slate-200 cursor-pointer"
                                    title="Print Slip"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={handleCloseProfileModal}
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ADD NEW CUSTOMER MODAL (CORE REQUIREMENT) */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Add New Customer (নতুন গ্রাহক যোগ করুন)</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Automatically Generated Customer ID */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">
                    Customer ID (স্বয়ংক্রিয় গ্রাহক কোড)
                  </span>
                  <span className="font-mono font-black text-sm text-emerald-900">
                    {nextCustomerId}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-300">
                  Auto-Generated
                </span>
              </div>

              {/* Full Name & Mobile Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Full Name (সম্পূর্ণ নাম) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Subrata Roy"
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mobile Number (মোবাইল নম্বর) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Optional Email & Created Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Optional Email (ইমেল - ঐচ্ছিক)
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. customer@gmail.com"
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Created Date (নথিভুক্তির তারিখ)
                  </label>
                  <input
                    type="date"
                    value={formCreatedDate}
                    onChange={(e) => setFormCreatedDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Village / City / Address (গ্রাম / শহর / ঠিকানা)
                </label>
                <input
                  type="text"
                  value={formVillage}
                  onChange={(e) => setFormVillage(e.target.value)}
                  placeholder="e.g. Barasat, North 24 Pgs"
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Customer Notes & Preferences (গ্রাহক নোট)
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. WB Police student, regular xerox customer"
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow cursor-pointer transition-colors"
                >
                  Save Customer (সংরক্ষণ করুন)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. EDIT CUSTOMER DETAILS MODAL (CORE REQUIREMENT) */}
      {/* ========================================================================= */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Edit Customer ({editingCustomer.id})</h3>
              </div>
              <button
                onClick={() => setEditingCustomer(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditCustomer} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Customer ID (Fixed)
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {editingCustomer.id}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  Created {editingCustomer.createdDate}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.name}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={editingCustomer.mobile}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, mobile: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Optional Email</label>
                  <input
                    type="email"
                    value={editingCustomer.email || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Created Date</label>
                  <input
                    type="text"
                    value={editingCustomer.createdDate || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, createdDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Village / City / Address</label>
                <input
                  type="text"
                  value={editingCustomer.villageOrCity || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, villageOrCity: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Notes</label>
                <textarea
                  rows={2}
                  value={editingCustomer.notes || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDeleteCustomer(editingCustomer.id)}
                  className="text-rose-600 hover:bg-rose-50 px-2 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Customer</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCustomer(null)}
                    className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer"
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
    </div>
  );
};
