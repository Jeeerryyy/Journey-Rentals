/* Brex / Urbanist Design System — Comprehensive Master Privacy & Data Security Policy */
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
  Sparkles,
  Server,
  KeyRound,
  MapPin,
  Layers,
  Bug,
} from "lucide-react";

const SUBPROCESSORS_LIST = [
  {
    name: "Razorpay Software Pvt. Ltd.",
    purpose: "RBI-authorized Payment Gateway, UPI transaction processing & automated refund disbursement",
    location: "India (PCI-DSS Level 1 Compliant)",
  },
  {
    name: "Enterprise Cloud Infrastructure Provider",
    purpose: "Secure data hosting, encrypted document storage, and network resilience",
    location: "India Region (ISO 27001 / SOC 2 Certified)",
  },
  {
    name: "Authorized Messaging Provider",
    purpose: "Transactional booking receipts, invoice delivery & automated customer notifications",
    location: "Enterprise Secure Rails (Encrypted In-Transit)",
  },
];

const MASTER_PRIVACY_SECTIONS = [
  {
    id: "information-collected",
    icon: Database,
    title: "1. Information We Collect",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          In connection with providing self-drive vehicle rental services and ensuring compliance with applicable motor vehicle laws, Journey Rentals collects the following categories of information:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>Identity &amp; Contact Information:</strong> Legal name, verified telephone number, email address, and residential city.</li>
          <li><strong>Driver Verification &amp; KYC Records:</strong> Copies of your valid Indian Driving License, government photo identification (such as Aadhaar Card, Passport, or Voter ID), and related eligibility credentials.</li>
          <li><strong>Booking &amp; Reservation Details:</strong> Selected vehicle model, rental duration, pickup hub, and statutory fleet speed governor compliance records (80 km/h regulatory limit).</li>
          <li><strong>Transactional Records:</strong> Payment reference identifiers, transaction timestamps, and invoice settlement statuses. <em>(Note: Financial credentials such as card numbers and banking PINs are processed directly by authorized payment gateways and are never stored on our systems).</em></li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    icon: FileCheck,
    title: "2. Purpose of Data Processing",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          Personal data is processed solely for legitimate operational and statutory compliance purposes:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>Vehicle Reservation &amp; Dispatch:</strong> Fulfilling vehicle preparation, station platform handovers, and scheduled doorstep delivery logistics.</li>
          <li><strong>Driver Verification &amp; Risk Assessment:</strong> Authenticating driving credentials to maintain vehicle asset security and offer zero-deposit self-drive rentals.</li>
          <li><strong>Operational Communications:</strong> Providing automated booking confirmations, digital tax invoices, vehicle inspection records, and trip conclusion summaries.</li>
          <li><strong>Toll &amp; Statutory Reconciliations:</strong> Processing electronic toll (FASTag) reconciliations and resolving relevant traffic authority queries.</li>
        </ul>
      </>
    ),
  },
  {
    id: "kyc-encryption",
    icon: Lock,
    title: "3. Information Security & Confidentiality (Zero Data Selling)",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          We implement industry-standard technical, administrative, and physical safeguards:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>Encrypted Data Storage:</strong> Identity and driving license records are stored in secure cloud environments utilizing strong cryptographic controls and restricted access protocols.</li>
          <li><strong>Controlled Access:</strong> Data access is strictly limited to authorized personnel directly involved in customer verification and vehicle dispatch.</li>
          <li><strong>No Commercial Data Monetization:</strong> We maintain a strict policy against commercializing customer information. Journey Rentals does not sell, rent, or trade personal data to third-party marketing brokers.</li>
        </ul>
      </>
    ),
  },
  {
    id: "payment-security",
    icon: ShieldCheck,
    title: "4. Payment Processing & Financial Safeguards",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          All financial transactions are conducted through certified payment infrastructure:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li>Processed via RBI-regulated payment partners compliant with <strong>PCI-DSS Level 1</strong> standards.</li>
          <li>Protected with standard transport encryption and mandatory two-factor authentication (OTP / 3D-Secure).</li>
          <li>Journey Rentals does not retain or access credit/debit card numbers or confidential banking passwords.</li>
        </ul>
      </>
    ),
  },
  {
    id: "data-processing-agreement",
    icon: Server,
    title: "5. Third-Party Service Providers & Sub-Processors",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          In accordance with the <strong>Digital Personal Data Protection Act, 2023 (DPDPA)</strong>, Journey Rentals engages authorized sub-processors bound by contractual confidentiality obligations:
        </p>
        <div className="overflow-x-auto my-3">
          <table className="w-full text-left text-xs border border-[#DFDCE8] rounded-xl overflow-hidden">
            <thead className="bg-[#F6F5FA] border-b border-[#DFDCE8] text-[#212121] font-bold">
              <tr>
                <th className="p-3">Partner / Category</th>
                <th className="p-3">Function &amp; Scope</th>
                <th className="p-3">Compliance Standard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFDCE8] text-[#6F6E73]">
              {SUBPROCESSORS_LIST.map((sub) => (
                <tr key={sub.name}>
                  <td className="p-3 font-bold text-[#212121]">{sub.name}</td>
                  <td className="p-3">{sub.purpose}</td>
                  <td className="p-3 font-mono">{sub.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    id: "your-rights-erasure",
    icon: KeyRound,
    title: "6. User Rights, Data Retention & Deletion",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          Subject to statutory obligations under Indian law, customers retain rights regarding their personal data:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>Right to Access &amp; Correction:</strong> You may review and update your account details directly via the <Link to="/profile" className="font-bold underline text-[#212121]">Customer Profile</Link>.</li>
          <li><strong>Data Retention:</strong> Information is retained only as long as necessary to fulfill rental agreements, resolve traffic challans, and satisfy statutory tax and motor vehicle record-keeping requirements.</li>
          <li><strong>Right to Request Erasure:</strong> Following completion of your rental and settlement of all obligations, you may request account and document deletion by contacting our Grievance Desk.</li>
        </ul>
      </>
    ),
  },
  {
    id: "security-disclosure",
    icon: Bug,
    title: "7. System Security & Responsible Disclosure",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          Journey Rentals maintains appropriate organizational and technical safeguards designed to ensure platform integrity and prevent unauthorized data access.
        </p>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed">
          Security researchers who identify potential vulnerabilities are encouraged to disclose them responsibly to <strong className="text-[#212121]">rental.journeycars@gmail.com</strong> with reproducible details. Valid disclosures will be reviewed promptly under our responsible disclosure guidelines.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.replace("#", ""));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-[#F6F5FA] text-[#212121] flex flex-col font-body selection:bg-[#212121] selection:text-white">
      <SEO
        title="Privacy Policy & Data Security | Journey Rentals Solapur"
        description="Learn how Journey Rentals Solapur protects your personal information, driving license KYC documents with AES-256 encryption, DPDPA 2023 compliance, and zero data sales."
        canonical="/privacy-policy"
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "/" },
          { name: "Privacy Policy", url: "/privacy-policy" },
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

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20 mb-3">
                <Lock size={12} className="text-[#e1b808]" />
                Data Security &amp; Trust
              </span>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Privacy Policy &amp; Data Protection
              </h1>
              <p className="text-sm sm:text-base text-[#99989E] mt-2 max-w-2xl">
                How we protect your identity, safely store driving license KYC documents with AES-256 encryption, and guarantee 100% data confidentiality under DPDPA 2023.
              </p>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12 space-y-6">
          {/* Quick Notice Card */}
          <div className="bg-white border border-[#DFDCE8] rounded-2xl sm:rounded-3xl p-5 sm:p-6 mb-4 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#CFDECA] text-[#4B8039] flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#212121]">
                Zero Third-Party Data Selling Commitment
              </h3>
              <p className="text-xs sm:text-sm text-[#6F6E73] mt-0.5 leading-relaxed">
                Your personal details, contact numbers, and driving license records are collected exclusively to manage vehicle dispatches in Solapur. We never monetize, sell, or distribute customer information.
              </p>
            </div>
          </div>

          {/* Master Clauses */}
          <div className="space-y-6">
            {MASTER_PRIVACY_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              return (
                <div
                  key={sec.id}
                  id={sec.id}
                  className="bg-white border border-[#DFDCE8] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs hover:border-[#212121]/30 transition-all text-left scroll-mt-24"
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
                For questions regarding data processing or to request document deletion, please reach out to our team in Solapur:
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-mono text-[#e1b808]">
                <span className="flex items-center gap-1.5">
                  <Mail size={13} /> rental.journeycars@gmail.com
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} /> Solapur Central Hub, Maharashtra 413001
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:rental.journeycars@gmail.com"
                className="inline-flex items-center gap-2 bg-white text-[#212121] hover:bg-[#F6F5FA] rounded-full px-5 py-2.5 text-xs font-bold transition-all shadow-sm"
              >
                <Mail size={14} />
                <span>Contact Grievance Desk</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
