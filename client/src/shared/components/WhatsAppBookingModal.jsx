import React, { useState, useEffect, useRef } from 'react';
import {
  X, MessageSquare, Copy, Check, Send, Phone, User, Calendar, Car, Compass,
  Sparkles, RefreshCw, AlertCircle, ShieldCheck, MapPin, DollarSign, Edit3, Users,
  CheckCircle2, AlertTriangle, RotateCcw, Bike
} from 'lucide-react';
import {
  getTemplatesForBooking,
  INSERTABLE_VARIABLES,
  extractBookingDetails,
  renderBookingTemplate,
  getRecommendedTemplateId,
  sanitizeWhatsAppPhone,
  isValidWhatsAppPhone
} from '../utils/whatsappTemplates';

export function WhatsAppBookingModal({
  isOpen,
  onClose,
  booking,
  defaultTemplateId,
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  const bookingDetails = extractBookingDetails(booking);
  const isBike = bookingDetails.is_bike;
  const isTour = bookingDetails.is_tour;
  const availableTemplates = getTemplatesForBooking(booking);

  useEffect(() => {
    if (isOpen && booking) {
      const templates = getTemplatesForBooking(booking);
      const initialTemplateId =
        defaultTemplateId && templates.some((t) => t.id === defaultTemplateId)
          ? defaultTemplateId
          : getRecommendedTemplateId(booking);

      setSelectedTemplateId(initialTemplateId);
      const matchedTemplate =
        templates.find((t) => t.id === initialTemplateId) || templates[0];

      if (matchedTemplate) {
        const parsed = renderBookingTemplate(matchedTemplate.template, booking);
        setMessageText(parsed);
      }

      const initialPhone = bookingDetails.raw_customer_phone || bookingDetails.clean_phone || '';
      setRecipientPhone(initialPhone);
      setCopied(false);
    }
  }, [isOpen, booking, defaultTemplateId]);

  if (!isOpen || !booking) return null;

  const cleanRecipient = sanitizeWhatsAppPhone(recipientPhone);
  const isPhoneValid = isValidWhatsAppPhone(recipientPhone);
  const isModifiedFromBooking = recipientPhone !== (bookingDetails.raw_customer_phone || '');

  const handleSelectTemplate = (template) => {
    setSelectedTemplateId(template.id);
    const parsed = renderBookingTemplate(template.template, booking);
    setMessageText(parsed);
  };

  const handleResetCurrentTemplate = () => {
    const matchedTemplate =
      availableTemplates.find((t) => t.id === selectedTemplateId) ||
      availableTemplates[0];
    if (matchedTemplate) {
      const parsed = renderBookingTemplate(matchedTemplate.template, booking);
      setMessageText(parsed);
    }
  };

  const handleResetRecipientPhone = () => {
    setRecipientPhone(bookingDetails.raw_customer_phone || '');
  };

  const handleInsertVariable = (tag) => {
    if (!textareaRef.current) {
      setMessageText((prev) => prev + ` ${tag}`);
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = messageText.substring(0, start);
    const after = messageText.substring(end);

    const newText = before + tag + after;
    const parsed = renderBookingTemplate(newText, booking);
    setMessageText(parsed);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const nextPos = start + tag.length;
        textareaRef.current.setSelectionRange(nextPos, nextPos);
      }
    }, 50);
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSendWhatsApp = () => {
    if (!cleanRecipient || !isPhoneValid) {
      alert('Please enter a valid 10-digit customer WhatsApp phone number before sending.');
      return;
    }

    const encodedText = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${cleanRecipient}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-gray-200 dark:border-slate-800 my-auto text-gray-900 dark:text-gray-100">
        
        {/* HEADER */}
        <div className={`px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between text-white ${
          isTour
            ? 'bg-gradient-to-r from-amber-950 via-[#3a2010] to-[#24130a]'
            : isBike
            ? 'bg-gradient-to-r from-emerald-950 via-[#133326] to-[#0d221a]'
            : 'bg-gradient-to-r from-[#171F38] via-[#1E294B] to-[#121A30]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner ${
              isTour
                ? 'bg-amber-500/20 border border-amber-400/30 text-amber-300'
                : isBike
                ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-300'
                : 'bg-indigo-500/20 border border-indigo-400/30 text-indigo-300'
            }`}>
              {isTour ? <Compass className="w-5 h-5" /> : isBike ? <Bike className="w-5 h-5" /> : <Car className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold tracking-tight">
                  {isTour
                    ? 'Temple Tour WhatsApp Dispatch'
                    : isBike
                    ? 'Hourly Bike / Scooter Dispatch'
                    : 'Self-Drive Car WhatsApp Dispatch'}
                </h3>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  isTour
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : isBike
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                }`}>
                  {isTour ? '🛕 Pilgrimage Tour' : isBike ? '🛵 Two-Wheeler' : '🚗 Self-Drive Fleet'}
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                Dispatch instant confirmations, station handover notices, and balance reminders to customer WhatsApp.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">

          {/* 1. BOOKING SUMMARY CARD */}
          <div className="border border-gray-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50/80 dark:bg-slate-800/40 shadow-xs">
            <div className="space-y-1 md:border-r border-gray-200 dark:border-slate-700/80 pr-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                <User className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Customer Name
              </span>
              <div className="font-bold text-sm text-gray-900 dark:text-white truncate">
                {bookingDetails.customer_name}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400">
                <span className="font-mono">{bookingDetails.display_phone}</span>
              </div>
            </div>

            <div className="space-y-1 md:border-r border-gray-200 dark:border-slate-700/80 pr-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                {isTour ? <Compass className="w-3 h-3 text-amber-600" /> : isBike ? <Bike className="w-3 h-3 text-emerald-600" /> : <Car className="w-3 h-3 text-indigo-600" />}
                Assigned Vehicle / Route
              </span>
              <div className="font-bold text-gray-900 dark:text-white text-xs truncate">
                {bookingDetails.vehicle_name}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-[10px] bg-gray-200 dark:bg-slate-700 px-2 py-0.5 rounded font-bold text-gray-800 dark:text-gray-200">
                  {bookingDetails.vehicle_number}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  {bookingDetails.status}
                </span>
              </div>
            </div>

            <div className="space-y-1 md:border-r border-gray-200 dark:border-slate-700/80 pr-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-600" />
                Schedule
              </span>
              <div className="text-[11px] text-gray-800 dark:text-gray-200 font-semibold truncate">
                Pickup: {bookingDetails.pickup_date} ({bookingDetails.pickup_time})
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                Drop: {bookingDetails.dropoff_date} ({bookingDetails.dropoff_time})
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Payment Summary
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] text-gray-500 dark:text-gray-400">Total:</span>
                <span className="font-bold text-gray-900 dark:text-white">₹{bookingDetails.total_amount}</span>
              </div>
              <div className="flex items-baseline justify-between text-[11px]">
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">Advance: ₹{bookingDetails.advance_paid}</span>
                <span className="text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/40 px-1.5 py-0.2 rounded">
                  Due: ₹{bookingDetails.balance_amount}
                </span>
              </div>
            </div>
          </div>

          {/* 2. RECIPIENT PHONE ROUTING BOX */}
          <div className="bg-gradient-to-r from-emerald-50/90 to-green-50/70 dark:from-emerald-950/40 dark:to-green-950/20 border border-emerald-200/90 dark:border-emerald-800/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 flex-wrap">
            <div className="space-y-1 flex-1 min-w-[260px]">
              <div className="flex items-center gap-2">
                <label htmlFor="recipient-phone-input" className="font-bold text-emerald-950 dark:text-emerald-200 text-xs flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  <span>Recipient Customer WhatsApp Number:</span>
                </label>
                {isPhoneValid ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    {isModifiedFromBooking ? 'Custom Recipient' : 'Booking Phone Verified'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> Needs Valid 10-Digit Phone
                  </span>
                )}
              </div>
              <p className="text-[10px] text-emerald-800/80 dark:text-emerald-400/80">
                Direct dispatch link: <span className="font-mono font-bold">wa.me/{cleanRecipient || '...'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <span className="absolute left-3 font-mono font-bold text-xs text-gray-500 select-none">
                  🇮🇳
                </span>
                <input
                  id="recipient-phone-input"
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="Enter 10-digit phone"
                  className="pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-xl font-mono font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner w-44"
                />
              </div>

              {isModifiedFromBooking && (
                <button
                  type="button"
                  onClick={handleResetRecipientPhone}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-2.5 h-2.5" /> Revert
                </button>
              )}
            </div>
          </div>

          {/* 3. TEMPLATE SELECTION CARDS */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">
                Select WhatsApp Message Template ({availableTemplates.length})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {availableTemplates.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1 relative cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{tpl.icon}</span>
                        <span className={`font-bold text-xs ${
                          isSelected ? 'text-emerald-950 dark:text-emerald-200' : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {tpl.title}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full shrink-0 mt-1 bg-emerald-500" />
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-tight">
                      {tpl.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. DYNAMIC INSERTABLE VARIABLE CHIPS */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500 dark:text-gray-400 font-semibold flex items-center gap-1">
                <Edit3 className="w-3 h-3 text-indigo-500" /> Insert Variable at Cursor:
              </span>
              <button
                type="button"
                onClick={handleResetCurrentTemplate}
                className="text-[10px] font-bold text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Reset to Original Template
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {INSERTABLE_VARIABLES.map((v) => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => handleInsertVariable(v.tag)}
                  className="px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer bg-gray-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border-gray-200 dark:border-slate-700 hover:border-emerald-300 text-gray-700 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-300"
                >
                  + {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. EDITABLE DRAFT TEXTAREA */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="whatsapp-draft-textarea" className="font-bold text-gray-800 dark:text-gray-200 text-xs flex items-center gap-1.5">
                <span>Message Draft (WhatsApp Native Formatting):</span>
              </label>
              <span className="text-[10px] font-mono text-gray-400">
                {messageText.length} characters
              </span>
            </div>

            <div className="relative rounded-2xl border border-gray-200 dark:border-slate-700 bg-[#FAF9F5] dark:bg-slate-950 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all overflow-hidden shadow-inner">
              <textarea
                id="whatsapp-draft-textarea"
                ref={textareaRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={9}
                className="w-full p-4 bg-transparent text-gray-800 dark:text-gray-100 font-sans text-xs sm:text-sm leading-relaxed resize-y focus:outline-none placeholder-gray-400"
                placeholder="Type your WhatsApp message draft here..."
              />
            </div>
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/90 flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleCopyMessage}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all border shadow-xs active:scale-95 cursor-pointer ${
              copied
                ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-gray-500" />
                <span>Copy Draft</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold text-xs hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              disabled={!isPhoneValid}
              className={`px-6 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-md transition-all ${
                isPhoneValid
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-emerald-600/30 hover:scale-102 active:scale-98 cursor-pointer'
                  : 'bg-gray-300 dark:bg-slate-800 text-gray-500 dark:text-gray-500 cursor-not-allowed shadow-none'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>🟢 Open in WhatsApp & Send ({cleanRecipient ? `+${cleanRecipient}` : 'No Phone'})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default WhatsAppBookingModal;
