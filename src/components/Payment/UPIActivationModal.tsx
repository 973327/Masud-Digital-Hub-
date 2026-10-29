import React, { useState } from 'react';
import { CheckCircle2, QrCode, ShieldCheck, ArrowRight, Copy, Check, AlertCircle, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SupportConfig, User } from '../../types';

interface UPIActivationModalProps {
  user: User;
  supportConfig: SupportConfig;
  isOpen: boolean;
  onSuccess: (updatedUser: User) => void;
  onClose?: () => void;
  canClose?: boolean;
}

export const UPIActivationModal: React.FC<UPIActivationModalProps> = ({
  user,
  supportConfig,
  isOpen,
  onSuccess,
  onClose,
  canClose = false
}) => {
  const [utrNumber, setUtrNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const upiId = supportConfig.upiId;
  const amount = supportConfig.joiningFee || 50;

  // Standard UPI URI format: upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...
  const upiIntentUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    'Masud Digital Hub'
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(`MDH Activation ${user.mobileNumber}`)}`;

  // Public QR Generator image using standard encoded UPI URL
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    upiIntentUri
  )}&margin=10`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCompleteActivation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    // If UTR entered, validate minimally
    if (utrNumber.trim() && utrNumber.trim().length < 6) {
      setError('Please enter a valid 12-digit UTR/UPI Reference Number or leave blank for instant activation.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Trigger festive celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // ignore
      }

      const updatedUser: User = {
        ...user,
        isActive: true,
        paymentDetails: {
          amount: amount,
          upiId: upiId,
          transactionId: utrNumber.trim() || `KB${Date.now().toString().slice(-8)}`,
          paidAt: new Date().toISOString(),
          status: 'completed'
        }
      };

      setIsSubmitting(false);
      onSuccess(updatedUser);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md mb-2">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Masud Digital Hub Membership</h3>
          <p className="text-emerald-100 text-xs mt-1">
            Standard ₹{amount} One-Time UPI Activation
          </p>

          {canClose && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white text-sm"
            >
              ✕
            </button>
          )}
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Member Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 mb-5 flex items-center justify-between text-xs">
            <div>
              <p className="text-slate-500 font-medium">Candidate Name</p>
              <p className="text-slate-800 font-bold text-sm">{user.fullName}</p>
              <p className="text-slate-500">{user.district}, {user.state}</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold">
                Activation Pending
              </span>
              <p className="text-emerald-700 font-extrabold text-base mt-1">₹{amount} Only</p>
            </div>
          </div>

          {/* QR Code Presentation */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50/60 rounded-2xl border border-slate-200 mb-5">
            <div className="p-2.5 bg-white rounded-xl shadow-md border border-slate-100 mb-3">
              <img
                src={qrImageUrl}
                alt="UPI QR Code for ₹50 Activation"
                className="w-44 h-44 object-contain"
                loading="eager"
              />
            </div>
            <p className="text-[11px] text-slate-500 text-center font-medium">
              Scan with Google Pay, PhonePe, Paytm, or BHIM
            </p>

            {/* UPI ID Copy Bar */}
            <div className="mt-3 w-full flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs">
              <div className="truncate mr-2">
                <span className="text-slate-400 text-[10px] block">Official UPI ID</span>
                <span className="font-mono font-bold text-slate-800 select-all">{upiId}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold cursor-pointer transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Direct Pay Link for Mobile */}
          <div className="mb-4">
            <a
              href={upiIntentUri}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition-all text-center"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Tap to Open UPI App (GPay / PhonePe / Paytm)</span>
            </a>
          </div>

          {/* Reference UTR Number Form */}
          <form onSubmit={handleCompleteActivation} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                UPI Reference / UTR Number (Optional)
              </label>
              <input
                type="text"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="e.g. 423456789012"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs text-slate-800 outline-none transition-all font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Found in your banking receipt after sending ₹{amount} to {upiId}
              </p>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-70"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Activate Account & Enter Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Trust Badges */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Verified Employer Contacts
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Direct Call Access
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
