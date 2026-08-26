/* Brex / Urbanist Design System — Privacy Policy Page */
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SEO from "../components/seo/SEO";
import { BreadcrumbStructuredData } from "../components/seo/AdditiveSchemas";
import {
  Lock,
  ShieldCheck,
  Eye,
  Database,
  FileCheck,
  ChevronRight,
  Phone,
  Mail,
  Printer,
  Sparkles,
  Server,
  KeyRound,
} from "lucide-react";
import { Button } from "@/ui/button";

const PRIVACY_SECTIONS = [
  {
    id: "information-collected",
    icon: Database,
    title: "1. Information We Collect",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          To facilitate self-drive bookings and fulfill statutory motor vehicle regulations, Journey Rentals collects the following customer details:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>Identity &amp; Contact Details:</strong> Full legal name, verified mobile number, email address, and residential city.</li>
          <li><strong>Driving &amp; KYC Verification Documents:</strong> Clear digital copies or scans of your original Indian Driving License, Aadhaar Card, Passport, or Voter ID.</li>
          <li><strong>Trip &amp; Telemetry Metadata:</strong> Selected pickup hub, return destination, rental time duration, and vehicle model requested.</li>
          <li><strong>Payment Records:</strong> Transaction reference IDs, advance booking receipts, and payment status. <em>(Note: Sensitive debit/credit card numbers and CVVs are processed directly by RBI-authorized PCI-DSS payment gateways and are never stored on our servers).</em></li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    icon: FileCheck,
    title: "2. How We Use Your Information",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          We use customer data strictly for legitimate operational purposes:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>Booking Dispatch &amp; Handover:</strong> Preparing your vehicle on time and executing immediate platform handovers at Solapur Railway Station or doorstep locations.</li>
          <li><strong>Digital KYC &amp; Risk Compliance:</strong> Validating driving license legitimacy to protect vehicle assets and maintain zero security deposit trust.</li>
          <li><strong>Instant WhatsApp &amp; Email Alerts:</strong> Sending automated booking confirmation slips, tax invoices, vehicle inspection records, and return reminders.</li>
          <li><strong>FASTag &amp; Toll Reconciliations:</strong> Accurately calculating electronic toll deductions incurred during your specific rental window.</li>
        </ul>
      </>
    ),
  },
  {
    id: "data-protection",
    icon: Lock,
    title: "3. Document Storage & Security Safeguards",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          We employ banking-grade security protocols to protect your documents:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>Encrypted Document Vaults:</strong> All uploaded KYC driving licenses and identity documents are stored in secure cloud storage with strict server-side encryption (AES-256) and time-limited access tokens.</li>
          <li><strong>Strict Role-Based Access:</strong> Only authorized Journey Rentals dispatch supervisors can inspect KYC documents during active handover verification.</li>
          <li><strong>Zero Data Selling:</strong> We have a strict zero-tolerance policy against data sharing. We <strong>NEVER</strong> sell, rent, or trade your personal information to third-party marketing companies or advertisers.</li>
        </ul>
      </>
    ),
  },
  {
    id: "payment-security",
    icon: ShieldCheck,
    title: "4. Payment Rails & Razorpay Integration",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          All online financial transactions are executed via <strong>Razorpay</strong>:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li>Compliant with the highest international security benchmark: <strong>PCI-DSS Level 1</strong>.</li>
          <li>Protected with 256-bit TLS encryption and mandatory 2-Factor Authentication (OTP / 3D-Secure).</li>
          <li>Journey Rentals does not retain or log credit/debit card numbers or UPI PINs.</li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies-analytics",
    icon: Eye,
    title: "5. Cookies & Session Management",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          Our website uses secure HTTP-only cookies to:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li>Maintain customer authentication sessions securely across page visits.</li>
          <li>Remember your pickup date and vehicle preferences during multi-step reservation flows.</li>
          <li>Collect anonymous site performance metrics to continuously improve booking loading speeds.</li>
        </ul>
      </>
    ),
  },
  {
    id: "your-rights",
    icon: KeyRound,
    title: "6. Your Rights & Data Erasure Requests",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          Under Indian information technology standards and data protection guidelines, you retain full ownership of your data:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>Right to Review:</strong> You can view and update your profile details at any time from your <Link to="/profile" className="font-bold underline text-[#212121]">Customer Profile</Link>.</li>
          <li><strong>Right to Erasure:</strong> Upon completion of your trip and settlement of all dues, you may request the complete deletion of your uploaded KYC documents and customer profile by emailing our Grievance Officer.</li>
        </ul>
      </>
    ),
  },
];

export default function PrivacyPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F6F5FA] text-[#212121] flex flex-col font-body selection:bg-[#212121] selection:text-white">
      <SEO
        title="Privacy Policy | Journey Rentals Solapur"
        description="Learn how Journey Rentals Solapur protects your personal information, driving license KYC documents, and secure payment transactions with 256-bit encryption."
        canonical="/privacy-policy"
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", item: "https://journeyrentals.in/" },
          { name: "Privacy Policy", item: "https://journeyrentals.in/privacy-policy" },
        ]}
      />

      <Navbar />

      <main className="flex-1 pb-16 sm:pb-24">
        {/* Header Hero Banner */}
        <section className="bg-[#212121] text-white pt-28 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 relative overflow-hidden">
          <div className="max-w-5xl mx-auto relative z-10">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs font-mono text-[#99989E] mb-4">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight size={12} />
              <span className="text-white font-bold">Privacy Policy</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20 mb-3">
                  <Lock size={12} className="text-[#e1b808]" />
                  Data Security &amp; Trust
                </span>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                  Privacy Policy
                </h1>
                <p className="text-sm sm:text-base text-[#99989E] mt-2 max-w-2xl">
                  How we protect your identity, safely store driving license KYC documents, and guarantee 100% data confidentiality.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="rounded-full bg-white/10 hover:bg-white/20 text-white border-white/20 h-10 px-4 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print Policy</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12">
          {/* Quick Notice Card */}
          <div className="bg-white border border-[#DFDCE8] rounded-2xl sm:rounded-3xl p-5 sm:p-6 mb-8 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#CFDECA] text-[#4B8039] flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#212121]">
                Zero Third-Party Sharing Commitment
              </h3>
              <p className="text-xs sm:text-sm text-[#6F6E73] mt-0.5 leading-relaxed">
                Your personal details, contact numbers, and KYC records are collected exclusively to manage vehicle dispatches in Solapur. We never monetize or distribute your information.
              </p>
            </div>
          </div>

          {/* Detailed Clauses */}
          <div className="space-y-6">
            {PRIVACY_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              return (
                <div
                  key={sec.id}
                  id={sec.id}
                  className="bg-white border border-[#DFDCE8] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs hover:border-[#212121]/30 transition-all text-left"
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-[#DFDCE8] mb-4">
                    <div className="w-9 h-9 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8] flex items-center justify-center text-[#212121] shrink-0">
                      <Icon size={18} className="text-[#3F5F8C]" />
                    </div>
                    <h2 className="font-display text-base sm:text-lg font-bold text-[#212121]">
                      {sec.title}
                    </h2>
                  </div>
                  <div>{sec.content}</div>
                </div>
              );
            })}
          </div>

          {/* Privacy & Grievance Contact */}
          <div className="mt-10 bg-[#212121] text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h3 className="font-display text-lg font-bold">Data Protection &amp; Grievance Officer</h3>
              <p className="text-xs sm:text-sm text-[#99989E] mt-1 max-w-xl">
                For questions regarding data processing or to request document deletion, please reach out to our team:
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-mono text-[#e1b808]">
                <span className="flex items-center gap-1.5">
                  <Mail size={13} /> rental.journeycars@gmail.com
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} /> Solapur Central Hub, Maharashtra
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:rental.journeycars@gmail.com"
                className="inline-flex items-center gap-2 bg-white text-[#212121] hover:bg-[#F6F5FA] rounded-full px-5 py-2.5 text-xs font-bold transition-all shadow-sm"
              >
                <Mail size={14} />
                <span>Contact Officer</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
