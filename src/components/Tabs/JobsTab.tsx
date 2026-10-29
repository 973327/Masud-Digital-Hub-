import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  Phone, 
  Building2, 
  Briefcase, 
  Filter, 
  CheckCircle, 
  Users, 
  MessageCircle, 
  Info,
  Calendar
} from 'lucide-react';
import { Job, StateType, SupportConfig, User } from '../../types';
import { DISTRICTS_BY_STATE, SUPPORTED_STATES } from '../../data/locations';

interface JobsTabProps {
  jobs: Job[];
  currentUser: User | null;
  supportConfig: SupportConfig;
  appliedJobIds?: string[];
  onOpenAuth: () => void;
  onOpenUPIActivation: () => void;
  onNavigateTab: (tab: 'cybercafe' | 'home' | 'jobs' | 'learn' | 'profile' | 'admin') => void;
  onApplyJob?: (job: Job) => void;
  onReportJob?: (job: Job) => void;
  onOpenGeneralFeedback?: () => void;
}

export const JobsTab: React.FC<JobsTabProps> = ({
  jobs,
  currentUser,
  supportConfig,
  appliedJobIds = [],
  onOpenAuth,
  onOpenUPIActivation,
  onNavigateTab,
  onApplyJob,
  onReportJob,
  onOpenGeneralFeedback
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<StateType | 'All'>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedShift, setSelectedShift] = useState<string>('All');
  const [selectedJobForModal, setSelectedJobForModal] = useState<Job | null>(null);

  // Available districts based on selected state
  const availableDistricts = selectedState === 'All'
    ? [...DISTRICTS_BY_STATE['West Bengal'], ...DISTRICTS_BY_STATE['Bihar']]
    : DISTRICTS_BY_STATE[selectedState];

  const handleStateFilterChange = (state: StateType | 'All') => {
    setSelectedState(state);
    setSelectedDistrict('All');
  };

  const filteredJobs = jobs.filter((job) => {
    // State Filter
    if (selectedState !== 'All' && job.state !== selectedState) {
      return false;
    }

    // District Filter
    if (selectedDistrict !== 'All' && job.district !== selectedDistrict) {
      return false;
    }

    // Shift Filter
    if (selectedShift !== 'All') {
      if (!job.shiftTimings.toLowerCase().includes(selectedShift.toLowerCase())) {
        return false;
      }
    }

    // Keyword Search (title, company, district, category)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.district.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        (job.category && job.category.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  const cleanHelpline = supportConfig.helplineNumber.replace(/[^0-9]/g, '');

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Verified Job Opportunities
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Filtered specifically by West Bengal & Bihar districts • Zero Brokerage
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Found
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search job title, company, or skill (e.g. Electrician, Driver, Delivery, Security)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm text-slate-800 outline-none transition-all"
          />
        </div>

        {/* Filter Bar: State & District Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* State Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Select State (রাজ্য / राज्य)
            </label>
            <select
              value={selectedState}
              onChange={(e) => handleStateFilterChange(e.target.value as StateType | 'All')}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none bg-white cursor-pointer"
            >
              <option value="All">All States (West Bengal & Bihar)</option>
              <option value="West Bengal">West Bengal (পশ্চিমবঙ্গ)</option>
              <option value="Bihar">Bihar (बिहार)</option>
            </select>
          </div>

          {/* District Dropdown - Strictly WB & Bihar districts as requested! */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Select District (জেলা / ज़िला)
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none bg-white cursor-pointer"
            >
              <option value="All">All Districts in {selectedState === 'All' ? 'Region' : selectedState}</option>
              {availableDistricts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          {/* Shift Timing Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Shift Timings
            </label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none bg-white cursor-pointer"
            >
              <option value="All">All Shift Timings</option>
              <option value="Day">Day Shift</option>
              <option value="Night">Night Shift</option>
              <option value="Rotational">Rotational Shift</option>
              <option value="Part">Part-Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Listing Grid */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-lg mx-auto shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              No Active Job Listings in this Selection Yet
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Masud Digital Hub only publishes 100% verified positions to protect candidates. New verified vacancies will appear here as soon as employers list them.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-600 text-left border border-slate-100 space-y-1.5">
            <p className="font-semibold text-slate-800 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Verified Direct Employer Contact:
            </p>
            <p className="pl-5 text-slate-500">
              • All listed vacancies include direct phone contact numbers with hiring managers.
            </p>
            <p className="pl-5 text-slate-500">
              • Employers can call helpline {supportConfig.helplineNumber} to list requirements.
            </p>
          </div>

          {currentUser?.role === 'admin' ? (
            <button
              onClick={() => onNavigateTab('admin')}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
            >
              Post a New Job Listing Now
            </button>
          ) : (
            <a
              href={`https://wa.me/91${cleanHelpline}?text=${encodeURIComponent('Hello, I am looking for jobs in ' + (selectedDistrict !== 'All' ? selectedDistrict : 'West Bengal / Bihar'))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Ask Masud Digital Hub Support on WhatsApp</span>
            </a>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job, idx) => (
            <div
              key={`${job.id}-${idx}`}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* State & District Pill */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-100 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      {job.district}, {job.state}
                    </span>

                    {appliedJobIds.includes(job.id) && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold border border-indigo-200 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-indigo-600" />
                        Applied / Contacted
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : 'Active'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {job.title}
                </h3>

                <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {job.company}
                </p>

                {/* Salary Badge */}
                <div className="mt-3 p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Monthly Salary:</span>
                  <span className="text-sm font-extrabold text-emerald-700">{job.salary}</span>
                </div>

                {/* Key Spec Row */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{job.shiftTimings}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono font-bold text-slate-800">{job.contactPersonNumber}</span>
                  </div>
                </div>

                {job.description && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                )}
              </div>

              {/* Direct Call & Action Buttons */}
              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center gap-2">
                <a
                  href={`tel:${job.contactPersonNumber}`}
                  onClick={() => onApplyJob && onApplyJob(job)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 text-center"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Now ({job.contactPersonNumber})</span>
                </a>

                <a
                  href={`https://wa.me/91${job.contactPersonNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello! I saw your "${job.title}" requirement on Masud Digital Hub and would like to apply.`
                  )}`}
                  onClick={() => onApplyJob && onApplyJob(job)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                  title="WhatsApp Recruiter"
                >
                  <MessageCircle className="w-4 h-4 fill-emerald-600" />
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedJobForModal(job)}
                  className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  title="View Full Job Details"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Job Information Modal */}
      {selectedJobForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  {selectedJobForModal.district}, {selectedJobForModal.state}
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {selectedJobForModal.title}
                </h3>
                <p className="text-xs text-slate-400">{selectedJobForModal.company}</p>
              </div>
              <button
                onClick={() => setSelectedJobForModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl">
                <div>
                  <span className="text-slate-400 block font-medium">Monthly Salary:</span>
                  <span className="text-emerald-700 font-extrabold text-sm">
                    {selectedJobForModal.salary}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Shift Timings:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedJobForModal.shiftTimings}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Work Location:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedJobForModal.location}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Direct Contact:</span>
                  <span className="font-mono font-bold text-emerald-800 text-xs">
                    {selectedJobForModal.contactPersonNumber}
                  </span>
                </div>
              </div>

              {selectedJobForModal.description && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Job Responsibilities:</h4>
                  <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                    {selectedJobForModal.description}
                  </p>
                </div>
              )}

              {selectedJobForModal.requirements && selectedJobForModal.requirements.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Requirements:</h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    {selectedJobForModal.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <a
                  href={`tel:${selectedJobForModal.contactPersonNumber}`}
                  onClick={() => onApplyJob && onApplyJob(selectedJobForModal)}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center flex items-center justify-center gap-2 shadow-md"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Employer Directly</span>
                </a>

                <a
                  href={`https://wa.me/91${selectedJobForModal.contactPersonNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello! I am contacting you regarding the "${selectedJobForModal.title}" position at ${selectedJobForModal.company}.`
                  )}`}
                  onClick={() => onApplyJob && onApplyJob(selectedJobForModal)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-center flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Report Issue with this job trigger */}
              {onReportJob && (
                <div className="pt-2 text-center border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      const job = selectedJobForModal;
                      setSelectedJobForModal(null);
                      onReportJob(job);
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold hover:underline cursor-pointer"
                  >
                    🚩 Report Issue with this Job (Fake number, wrong salary, inactive recruiter)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Suggestion / Feedback Banner */}
      {onOpenGeneralFeedback && (
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-bold text-slate-800">
              Can't find the exact job or have suggestions for Masud Digital Hub?
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Tell our admin team which district or trade skills you want more listings for.
            </p>
          </div>
          <button
            onClick={onOpenGeneralFeedback}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            Submit Feedback or Suggestion
          </button>
        </div>
      )}
    </div>
  );
};
