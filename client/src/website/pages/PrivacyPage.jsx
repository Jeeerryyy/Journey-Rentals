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
    purpose: "RBI-regulated Payment Gateway, UPI rails, Card processing & Automated Refund Settlements",
    location: "India (PCI-DSS Level 1)",
  },
  {
    name: "Cloudflare / AWS Cloud Services",
    purpose: "Web Application Firewall (WAF), AES-256 KYC Document Storage Vaults, DDoS mitigation",
    location: "Mumbai (India Region)",
  },
  {
    name: "Meta Platforms (WhatsApp Cloud API)",
    purpose: "Transactional Booking Slips, Invoice Delivery & Real-Time Handover Notifications",
    location: "Global Data Centers (TLS 1.3)",
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
          To facilitate self-drive reservations and comply with Indian statutory motor vehicle regulations, Journey Rentals collects the following customer details:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>Identity &amp; Contact Details:</strong> Full legal name, verified mobile number, email address, and residential city.</li>
          <li><strong>Driving License &amp; KYC Documents:</strong> Digital copies or photographs of your original Indian Driving License, Aadhaar Card, Passport, or Voter ID for zero-deposit verification.</li>
          <li><strong>Trip &amp; Telemetry Metadata:</strong> Selected pickup hub, vehicle model, reservation time window, and statutory speed compliance telemetry (80 km/h limiter status).</li>
          <li><strong>Payment Transaction Records:</strong> Razorpay payment order IDs, timestamp receipts, and transaction status. <em>(Note: Raw debit/credit card numbers and UPI PINs are processed directly by RBI-authorized PCI-DSS payment gateways and are never stored on our servers).</em></li>
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
          Customer information is used strictly for legitimate self-drive rental operations:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>Vehicle Dispatch &amp; Station Handover:</strong> Staging and delivering sanitized vehicles on time at Solapur Railway Station or doorstep locations.</li>
          <li><strong>Digital KYC Risk Validation:</strong> Validating driving license authenticity to protect vehicle assets and maintain our zero security deposit promise.</li>
          <li><strong>Instant WhatsApp &amp; Email Notifications:</strong> Sending automated booking confirmation slips, tax invoices, vehicle inspection walkaround photos, and return reminders.</li>
          <li><strong>FASTag &amp; Toll Reconciliations:</strong> Accurately calculating electronic toll deductions incurred during your specific rental window.</li>
        </ul>
      </>
    ),
  },
  {
    id: "kyc-encryption",
    icon: Lock,
    title: "3. Document Storage & AES-256 Encryption (Zero Data Sales Guarantee)",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          We employ banking-grade security protocols to protect your documents:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>Encrypted Document Vaults:</strong> All uploaded KYC driving licenses and identity documents are stored in secure cloud storage with strict server-side encryption (AES-256) and time-limited access tokens.</li>
          <li><strong>Strict Role-Based Access (RBAC):</strong> Only authorized Journey Rentals dispatch supervisors can inspect KYC documents during active handover verification.</li>
          <li><strong>Zero Data Selling Commitment:</strong> We have a strict zero-tolerance policy against data sharing. We <strong>NEVER</strong> sell, rent, or trade your personal information to third-party advertisers or marketing brokers.</li>
        </ul>
      </>
    ),
  },
  {
    id: "payment-security",
    icon: ShieldCheck,
    title: "4. Payment Rails & Razorpay PCI-DSS Level 1 Compliance",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          All online financial transactions are executed via <strong>Razorpay</strong>:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li>Compliant with the highest international security benchmark: <strong>PCI-DSS Level 1</strong>.</li>
          <li>Protected with 256-bit TLS 1.3 encryption and mandatory 2-Factor Authentication (OTP / 3D-Secure).</li>
          <li>Journey Rentals does not retain or log credit/debit card numbers or UPI PINs.</li>
        </ul>
      </>
    ),
  },
  {
    id: "data-processing-agreement",
    icon: Server,
    title: "5. Data Processing & Authorized Sub-Processors (DPA Compliance)",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          In accordance with the <strong>Digital Personal Data Protection Act, 2023 (DPDPA)</strong>, Journey Rentals acts as a Data Fiduciary. We engage only vetted, compliant sub-processors:
        </p>
        <div className="overflow-x-auto my-3">
          <table className="w-full text-left text-xs border border-[#DFDCE8] rounded-xl overflow-hidden">
            <thead className="bg-[#F6F5FA] border-b border-[#DFDCE8] text-[#212121] font-bold">
              <tr>
                <th className="p-3">Partner</th>
                <th className="p-3">Role &amp; Purpose</th>
                <th className="p-3">Location / Standards</th>
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
    title: "6. User Rights, Data Retention & Erasure Requests",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          Under Indian data protection guidelines, you retain full ownership of your data:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>Right to Review:</strong> You can view and update your profile details at any time from your <Link to="/profile" className="font-bold underline text-[#212121]">Customer Profile</Link>.</li>
          <li><strong>Right to Erasure / Deletion:</strong> Upon completion of your trip and settlement of all dues, you may request the complete deletion of your uploaded KYC documents and customer profile by emailing our Grievance Officer.</li>
          <li><strong>Data Retention Duration:</strong> KYC records are kept only for the statutory minimum duration required to verify driving legitimacy and settle potential traffic e-challans.</li>
        </ul>
      </>
    ),
  },
  {
    id: "security-disclosure",
    icon: Bug,
    title: "7. Security Architecture & Responsible Disclosure (Bug Bounty)",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          Our engineering infrastructure utilizes end-to-end TLS 1.3, strict Content Security Policies (CSP), and HTTP-only JWT session tokens.
        </p>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed">
          If you are an ethical security researcher and discover a potential vulnerability, please report it directly to <strong className="text-[#212121]">rental.journeycars@gmail.com</strong> with reproducible proof-of-concept steps. We review and acknowledge valid security reports within 24 hours under our safe harbor policy.
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
