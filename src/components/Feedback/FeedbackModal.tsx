import React, { useState, useEffect } from 'react';
import { 
  MessageSquarePlus, 
  X, 
  Star, 
  AlertTriangle, 
  Lightbulb, 
  ThumbsUp, 
  HelpCircle, 
  Send, 
  CheckCircle, 
  Phone, 
  Briefcase,
  ShieldCheck
} from 'lucide-react';
import { FeedbackItem, Job, StateType, SupportConfig, User } from '../../types';
import { DISTRICTS_BY_STATE, SUPPORTED_STATES } from '../../data/locations';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: FeedbackItem) => void;
  currentUser: User | null;
  supportConfig: SupportConfig;
  preSelectedJob?: Job | null;
  initialCategory?: 'job_issue' | 'suggestion' | 'review' | 'payment_issue' | 'other';
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
  supportConfig,
  preSelectedJob,
  initialCategory = 'review'
}) => {
  const [category, setCategory] = useState<'job_issue' | 'suggestion' | 'review' | 'payment_issue' | 'other'>(
    preSelectedJob ? 'job_issue' : initialCategory
  );
  const [userName, setUserName] = useState(currentUser?.fullName || '');
  const [userMobile, setUserMobile] = useState(currentUser?.mobileNumber || '');
  const [userState, setUserState] = useState<StateType>(currentUser?.state || 'West Bengal');
  const [userDistrict, setUserDistrict] = useState<string>(
    currentUser?.district || DISTRICTS_BY_STATE['West Bengal'][0]
  );
  const [rating, setRating] = useState<number>(5);
  const [subject, setSubject] = useState(
    preSelectedJob ? `Issue with job posting: ${preSelectedJob.title} (${preSelectedJob.company})` : ''
  );
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (preSelectedJob) {
      setCategory('job_issue');
      setSubject(`Issue regarding: ${preSelectedJob.title} at ${preSelectedJob.company}`);
    } else {
      setCategory(initialCategory);
    }
  }, [preSelectedJob, initialCategory]);

  useEffect(() => {
    if (currentUser) {
      setUserName(currentUser.fullName);
      setUserMobile(currentUser.mobileNumber);
      setUserState(currentUser.state);
      setUserDistrict(currentUser.district);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!userName.trim()) {
      setFormError('Please enter your name.');
      return;
    }

    const cleanMobile = userMobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!subject.trim()) {
      setFormError('Please provide a brief subject / topic.');
      return;
    }

    if (!message.trim()) {
      setFormError('Please describe your feedback, review, or the issue in detail.');
      return;
    }

    const newId = `FB-${Date.now().toString().slice(-6)}`;
    const newFeedback: FeedbackItem = {
      id: newId,
      userId: currentUser?.id,
      userName: userName.trim(),
      userMobile: cleanMobile,
      userState: userState,
      userDistrict: userDistrict,
      category: category,
      jobId: preSelectedJob?.id,
      jobTitle: preSelectedJob ? `${preSelectedJob.title} (${preSelectedJob.company})` : undefined,
      rating: category === 'review' ? rating : undefined,
      subject: subject.trim(),
      message: message.trim(),
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    onSubmit(newFeedback);
    setSubmissionId(newId);
    setIsSubmitted(true);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setMessage('');
    setSubject('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                Masud Digital Hub Feedback & Support
              </h3>
              <p className="text-xs text-slate-300">
                User Reviews, Suggestions & Service Issue Reporting
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto">
          {isSubmitted ? (
            /* Success Confirmation Screen */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-mono font-bold">
                  Reference ID: {submissionId}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  ধন্যবাদ! Thank You for Your Feedback
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                  Your submission has been safely recorded in the Masud Digital Hub Super Admin portal. Our team reviews all customer submissions daily to keep the portal safe and authentic.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 text-left space-y-1">
                <p className="font-semibold text-slate-800">What happens next?</p>
                <p>• If you reported a fraudulent service or issue, our verification team will investigate and take immediate action.</p>
                <p>• For urgent assistance, our helpline is always active at <span className="font-mono font-bold text-emerald-700">{supportConfig.helplineNumber}</span>.</p>
              </div>

              <button
                onClick={handleResetAndClose}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            /* Submission Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Category Pills */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  What would you like to share? (বিষয় নির্বাচন করুন) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCategory('review')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
                      category === 'review'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4 text-emerald-600" />
                    <span className="text-[11px]">App Review / Feedback</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('job_issue')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
                      category === 'job_issue'
                        ? 'bg-rose-50 border-rose-500 text-rose-800 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span className="text-[11px]">Report Job Posting</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('suggestion')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
                      category === 'suggestion'
                        ? 'bg-amber-50 border-amber-500 text-amber-800 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span className="text-[11px]">Suggest Feature</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('payment_issue')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
                      category === 'payment_issue'
                        ? 'bg-blue-50 border-blue-500 text-blue-800 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-[11px]">₹50 UPI Payment Query</span>
                  </button>
                </div>
              </div>

              {/* Star Rating for Reviews */}
              {category === 'review' && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <span className="font-bold text-slate-700">Rate your experience:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 cursor-pointer transition-transform hover:scale-125"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="font-bold text-slate-800 text-sm ml-2">
                      {rating} / 5
                    </span>
                  </div>
                </div>
              )}

              {/* If attached to job */}
              {preSelectedJob && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-rose-900">
                  <Briefcase className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Attached Job:</span> {preSelectedJob.title} at {preSelectedJob.company} ({preSelectedJob.district}, {preSelectedJob.state})
                    <p className="text-[10px] text-rose-700 mt-0.5">Contact: {preSelectedJob.contactPersonNumber}</p>
                  </div>
                </div>
              )}

              {/* User Identity Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    10-Digit Mobile Number *
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={userMobile}
                    onChange={(e) => setUserMobile(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter mobile number"
                    className="w-full px-3 py-2 border rounded-xl font-mono outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    State
                  </label>
                  <select
                    value={userState}
                    onChange={(e) => {
                      const st = e.target.value as StateType;
                      setUserState(st);
                      setUserDistrict(DISTRICTS_BY_STATE[st][0]);
                    }}
                    className="w-full px-3 py-2 border rounded-xl outline-none bg-white"
                  >
                    {SUPPORTED_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    District
                  </label>
                  <select
                    value={userDistrict}
                    onChange={(e) => setUserDistrict(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none bg-white"
                  >
                    {DISTRICTS_BY_STATE[userState].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Subject / Topic *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Recruiter number not reachable / Love the app / Need more jobs in Burdwan"
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Message Details */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Detailed Explanation / Review *
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe what happened or share your suggestions. Your feedback helps make Masud Digital Hub better for all users."
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {formError && (
                <div className="p-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit to Admin Team</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
