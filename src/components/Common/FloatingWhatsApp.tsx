import React, { useState } from 'react';
import { 
  Phone, 
  MessageCircle, 
  X, 
  Headphones, 
  Megaphone, 
  Check, 
  CheckCheck, 
  Clock, 
  Sparkles, 
  ArrowRight,
  Zap,
  KeyRound,
  Briefcase,
  CreditCard,
  FileText,
  HelpCircle,
  Wrench,
  ShieldAlert,
  Send,
  RotateCcw
} from 'lucide-react';
import { SupportConfig } from '../../types';

interface FloatingWhatsAppProps {
  supportConfig: SupportConfig;
}

interface QuickReplyOption {
  id: string;
  icon: React.ReactNode;
  label: string;
  labelBengali: string;
  messageText: string;
}

const QUICK_REPLIES: QuickReplyOption[] = [
  {
    id: 'password_help',
    icon: <KeyRound className="w-3.5 h-3.5 text-amber-500" />,
    label: 'I need help with my password',
    labelBengali: 'পাসওয়ার্ড / লগইন সহায়তা',
    messageText: 'নমস্কার! I need help with my password or logging into my account. Please assist me in recovering/resetting my login access.'
  },
  {
    id: 'shop_job_status',
    icon: <Briefcase className="w-3.5 h-3.5 text-blue-500" />,
    label: 'Work Order / Token Status Inquiry',
    labelBengali: 'কাজের স্ট্যাটাস / টোকেন অনুসন্ধান',
    messageText: 'নমস্কার! I want to check the status of my Cyber Cafe work order/job. My Token Number / Job ID is: '
  },
  {
    id: 'upi_activation',
    icon: <CreditCard className="w-3.5 h-3.5 text-emerald-500" />,
    label: 'Shop Account Activation Support',
    labelBengali: 'দোকান অ্যাকাউন্ট সহায়তা',
    messageText: 'নমস্কার! I have a question regarding account activation, shop access, and membership features.'
  },
  {
    id: 'cv_maker',
    icon: <FileText className="w-3.5 h-3.5 text-purple-500" />,
    label: 'CV & Biodata Printing Help',
    labelBengali: 'সিভি ও বায়োডাটা প্রিন্ট',
    messageText: 'Hello! I need assistance creating, downloading, or printing a CV / Biodata format.'
  },
  {
    id: 'cybercafe_tools',
    icon: <Wrench className="w-3.5 h-3.5 text-teal-500" />,
    label: 'Cyber Cafe Tools Assistance',
    labelBengali: 'সাইবার ক্যাফে টুলস সহায়তা',
    messageText: 'নমস্কার! I am using the Cyber Cafe Tools (Passport photo / PDF tools / Photo Resizer) and need technical assistance with a document.'
  },
  {
    id: 'document_services',
    icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />,
    label: 'Online Form & Document Services',
    labelBengali: 'অনলাইন ফর্ম ও আবেদন সেবা',
    messageText: 'নমস্কার! I need assistance with Online Form Fillup, Aadhaar/Voter service, or document printing at your digital center.'
  }
];

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ supportConfig }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQuickReplyId, setSelectedQuickReplyId] = useState<string>('password_help');
  const [customMessage, setCustomMessage] = useState<string>(QUICK_REPLIES[0].messageText);
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);

  const [readAnnouncementId, setReadAnnouncementId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('kajbondhu_read_announcement_id');
    } catch {
      return null;
    }
  });

  const announcement = supportConfig.announcement;
  // Has unread announcement if active and not marked as read
  const hasUnreadAnnouncement = Boolean(
    announcement && 
    announcement.isActive && 
    announcement.id && 
    readAnnouncementId !== announcement.id
  );

  const cleanWhatsappNumber = supportConfig.whatsappNumber.replace(/[^0-9]/g, '');
  const cleanHelplineNumber = supportConfig.helplineNumber.replace(/[^0-9]/g, '');

  const defaultWhatsappUrl = `https://wa.me/91${cleanWhatsappNumber}?text=${encodeURIComponent(
    customMessage.trim() || 'নমস্কার / Hello! I need help with Masud Digital Hub services.'
  )}`;

  const callUrl = `tel:${cleanHelplineNumber}`;

  const handleSelectQuickReply = (reply: QuickReplyOption) => {
    setSelectedQuickReplyId(reply.id);
    setCustomMessage(reply.messageText);
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (announcement?.id) {
      try {
        localStorage.setItem('kajbondhu_read_announcement_id', announcement.id);
      } catch (err) {
        console.error('Failed to save read status:', err);
      }
      setReadAnnouncementId(announcement.id);
    }
  };

  const handleResetUnreadForTesting = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      localStorage.removeItem('kajbondhu_read_announcement_id');
    } catch (err) {
      console.error(err);
    }
    setReadAnnouncementId(null);
  };

  // When user clicks the WhatsApp button to chat, mark announcement as read
  const handleChatClick = () => {
    if (announcement?.id && hasUnreadAnnouncement) {
      try {
        localStorage.setItem('kajbondhu_read_announcement_id', announcement.id);
      } catch (err) {
        console.error(err);
      }
      setReadAnnouncementId(announcement.id);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {/* Quick Action Drawer Popup */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 transition-all transform origin-bottom-right animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-2.5 mb-3">
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Masud Digital Hub Support</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Online Active"></span>
                </h4>
                <p className="text-[11px] text-emerald-600 font-medium">Official 24/7 Helpline • WB & Bihar</p>
                <div className="flex items-center gap-1 text-[10.5px] text-slate-600 font-medium mt-1 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md w-fit">
                  <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Estimated response time: &lt; 15 mins</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
              aria-label="Close support drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New Official Support Announcement Banner (if active) */}
          {announcement && announcement.isActive && (
            <div
              className={`mb-3.5 p-3 rounded-xl border transition-all ${
                hasUnreadAnnouncement
                  ? 'bg-gradient-to-br from-red-50/90 via-rose-50/70 to-amber-50/80 border-red-200 shadow-xs ring-1 ring-red-300/40'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    {hasUnreadAnnouncement && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    )}
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 ${
                        hasUnreadAnnouncement ? 'bg-red-600' : 'bg-emerald-500'
                      }`}
                    ></span>
                  </span>
                  <div className="flex items-center gap-1">
                    <Megaphone className={`w-3 h-3 ${hasUnreadAnnouncement ? 'text-red-600' : 'text-slate-500'}`} />
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        hasUnreadAnnouncement
                          ? 'text-red-700 bg-red-100/90 border border-red-200 font-extrabold'
                          : 'text-slate-600 bg-slate-200/80'
                      }`}
                    >
                      {announcement.badgeText || 'Official Notice'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{announcement.timestamp || 'Just now'}</span>
                </div>
              </div>

              <h5 className="text-xs font-bold text-slate-900 mb-1 leading-snug">
                {announcement.title}
              </h5>

              <p className="text-[11px] text-slate-600 leading-relaxed mb-2.5">
                {announcement.message}
              </p>

              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/70 text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    const noticeText = `নমস্কার Masud Digital Hub Team! I saw the official announcement: "${announcement.title}". I would like more details.`;
                    setCustomMessage(noticeText);
                    setSelectedQuickReplyId('');
                  }}
                  className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <MessageCircle className="w-3 h-3 text-emerald-600" />
                  <span>Use as message</span>
                </button>

                {hasUnreadAnnouncement ? (
                  <button
                    onClick={handleMarkAsRead}
                    className="font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200/90 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
                    title="Mark message as read"
                  >
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Mark as Read</span>
                  </button>
                ) : (
                  <button
                    onClick={handleResetUnreadForTesting}
                    className="text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
                    title="Click to reset badge test"
                  >
                    <CheckCheck className="w-3 h-3 text-emerald-600" />
                    <span>Seen (Unread)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* QUICK REPLY FEATURE */}
          <div className="mb-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Quick Reply Options</span>
                <span className="text-[10px] text-slate-400 font-normal">(দ্রুত প্রশ্ন)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Select a common topic:</span>
            </div>

            {/* Quick Reply Pills Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {QUICK_REPLIES.map((reply) => {
                const isSelected = selectedQuickReplyId === reply.id;
                return (
                  <button
                    key={reply.id}
                    type="button"
                    onClick={() => handleSelectQuickReply(reply)}
                    className={`text-left p-2 rounded-xl text-xs transition-all flex items-start gap-2 cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 font-bold shadow-2xs ring-1 ring-emerald-500/30'
                        : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200/70 text-slate-700'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{reply.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] leading-tight truncate">
                        {reply.label}
                      </div>
                      <div className="text-[9px] text-slate-400 font-normal truncate">
                        {reply.labelBengali}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 self-center" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Message Preview & Customizer */}
            <div className="pt-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <span>Message to send:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCustomizing(!isCustomizing)}
                  className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                >
                  {isCustomizing ? 'Hide editor' : 'Edit message'}
                </button>
              </div>

              {isCustomizing ? (
                <div className="space-y-1">
                  <textarea
                    rows={3}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Type or customize your WhatsApp support message..."
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 focus:bg-white leading-relaxed text-slate-800"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const matched = QUICK_REPLIES.find((r) => r.id === selectedQuickReplyId);
                        if (matched) setCustomMessage(matched.messageText);
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Reset to default reply</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsCustomizing(true)}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed max-h-20 overflow-y-auto cursor-pointer hover:border-slate-300 transition-colors"
                  title="Click to edit message before sending"
                >
                  <p className="text-[11px] italic text-slate-600">
                    "{customMessage}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <a
              href={defaultWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleChatClick}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer transform active:scale-98"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Send Quick Reply on WhatsApp</span>
              <Send className="w-3 h-3 text-emerald-200" />
            </a>

            <a
              href={callUrl}
              className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>Direct Helpline Call ({supportConfig.helplineNumber})</span>
            </a>
          </div>

          {/* Footer Info */}
          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
            <span>{supportConfig.officialEmail}</span>
            <span>WB & Bihar Hub</span>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button with Pulsing Red Notification Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white cursor-pointer"
        aria-label="WhatsApp Support"
      >
        <MessageCircle className="w-7 h-7 fill-white" />
        <span className="sr-only">Masud Digital Hub WhatsApp Support</span>

        {/* Small Red Notification Badge that pulses when there is a new support message or announcement */}
        {hasUnreadAnnouncement && (
          <span
            className="absolute -top-1 -right-1 flex h-4 w-4 pointer-events-none"
            aria-label="New support message or announcement"
          >
            {/* Outer animated radar ping ring */}
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            
            {/* Core pulsing solid red badge */}
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 border-2 border-white items-center justify-center text-[9px] font-black text-white shadow-md animate-pulse">
              1
            </span>
          </span>
        )}
      </button>
    </div>
  );
};
