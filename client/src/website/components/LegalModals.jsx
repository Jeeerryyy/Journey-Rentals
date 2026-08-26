/* Brex / Urbanist Design System — Exact Parity for Journey Rentals */
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/ui/dialog";
import { ShieldCheck, Lock, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/ui/button";

export function TermsModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-[#F6F5FA] text-[#212121] border border-[#DFDCE8] rounded-[24px] p-6 sm:p-8 font-body">
        <DialogHeader className="mb-4 text-left">
          <DialogTitle className="font-display text-xl sm:text-2xl text-[#212121] font-bold flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#212121] text-white flex items-center justify-center">
              <FileText size={18} className="text-[#e1b808]" />
            </div>
            Terms &amp; Conditions
          </DialogTitle>
          <DialogDescription className="text-xs uppercase tracking-wider mt-1 text-[#6F6E73] font-bold">
            Journey Rentals Solapur · Self-Drive Vehicle Rental Agreement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 text-xs sm:text-sm text-[#212121] leading-relaxed font-body text-left">
          <section className="bg-white p-5 rounded-[16px] border border-[#DFDCE8] shadow-xs">
            <h4 className="font-bold text-sm text-[#212121] mb-1 flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#212121]" /> 1. Driver Eligibility &amp; Verification
            </h4>
            <p className="text-xs text-[#6F6E73] leading-relaxed font-normal">
              The primary driver must be at least 21 years of age and possess an original valid Indian Driving License held for at least 1 year, alongside a government-issued photo ID (Aadhaar or Passport).
            </p>
          </section>

          <section className="bg-white p-5 rounded-[16px] border border-[#DFDCE8] shadow-xs">
            <h4 className="font-bold text-sm text-[#212121] mb-1 flex items-center gap-2">
              <FileText size={16} className="text-[#212121]" /> 2. Vehicle Usage &amp; Pilgrimage Routes
            </h4>
            <p className="text-xs text-[#6F6E73] leading-relaxed font-normal">
              Vehicles are fitted with valid all-Maharashtra tourist permits. Travel to Akkalkot Swami Samarth Mandir, Tuljapur Bhavani Mandir, and Pandharpur is fully permitted with unlimited kilometers.
            </p>
          </section>

          <section className="bg-white p-5 rounded-[16px] border border-[#DFDCE8] shadow-xs">
            <h4 className="font-bold text-sm text-[#212121] mb-1 flex items-center gap-2">
              <AlertCircle size={16} className="text-[#212121]" /> 3. Fuel Policy &amp; Return Condition
            </h4>
            <p className="text-xs text-[#6F6E73] leading-relaxed font-normal">
              Vehicles operate on a level-to-level fuel policy. The car or bike must be returned with the same fuel level as provided during pickup.
            </p>
          </section>

          <section className="bg-white p-5 rounded-[16px] border border-[#DFDCE8] shadow-xs">
            <h4 className="font-bold text-sm text-[#212121] mb-1 flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#212121]" /> 4. Instant KYC &amp; Zero Deposit
            </h4>
            <p className="text-xs text-[#6F6E73] leading-relaxed font-normal">
              Journey Rentals operates on instant digital KYC verification with zero security deposit hassle. Only a nominal ₹500 advance lock is required to confirm reservations.
            </p>
          </section>
        </div>

        <div className="mt-6 pt-4 border-t border-[#DFDCE8] flex justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-[#212121] hover:bg-[#141414] active:bg-[#000000] text-white rounded-full px-6 h-10 font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
          >
            I Understand &amp; Agree
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function NdaModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-[#F6F5FA] text-[#212121] border border-[#DFDCE8] rounded-[24px] p-6 sm:p-8 font-body">
        <DialogHeader className="mb-4 text-left">
          <DialogTitle className="font-display text-xl sm:text-2xl text-[#212121] font-bold flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#212121] text-white flex items-center justify-center">
              <Lock size={18} className="text-[#e1b808]" />
            </div>
            Privacy &amp; Data Protection
          </DialogTitle>
          <DialogDescription className="text-xs uppercase tracking-wider mt-1 text-[#6F6E73] font-bold">
            Journey Rentals Solapur · Privacy &amp; Confidentiality Commitment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 text-xs sm:text-sm text-[#212121] leading-relaxed font-body text-left">
          <section className="bg-white p-5 rounded-[16px] border border-[#DFDCE8] shadow-xs">
            <h4 className="font-bold text-sm text-[#212121] mb-1 flex items-center gap-2">
              <Lock size={16} className="text-[#212121]" /> 1. Customer Personal Data Protection
            </h4>
            <p className="text-xs text-[#6F6E73] leading-relaxed font-normal">
              Journey Rentals strictly safeguards all customer identity documents, contact numbers, email addresses, and payment records. Your information will never be shared or sold under any circumstances.
            </p>
          </section>

          <section className="bg-white p-5 rounded-[16px] border border-[#DFDCE8] shadow-xs">
            <h4 className="font-bold text-sm text-[#212121] mb-1 flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#212121]" /> 2. Secure Payment Rails
            </h4>
            <p className="text-xs text-[#6F6E73] leading-relaxed font-normal">
              Advance payments are processed securely through PCI-DSS certified gateways (Razorpay). No sensitive card credentials are saved on our servers.
            </p>
          </section>
        </div>

        <div className="mt-6 pt-4 border-t border-[#DFDCE8] flex justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-[#212121] hover:bg-[#141414] text-white rounded-full px-6 h-10 font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
