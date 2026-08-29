/* Brex / Urbanist Design System — High-Citation Guide: Documents Required for Self Drive Car Rental */
import React from "react";
import { Link } from "react-router-dom";
import SEO from "../../components/seo/SEO";
import { FAQStructuredData, BreadcrumbStructuredData } from "../../components/seo/AdditiveSchemas";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import {
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ChevronRight,
  FileCheck,
  CreditCard,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/ui/accordion";

const FAQS = [
  {
    question: "Can I drive if I only have a Learner's License?",
    answer: "No. Self-drive car rentals strictly require a valid, permanent Light Motor Vehicle (LMV) Indian Driving License or International Driving Permit. Learner's licenses are not accepted.",
  },
  {
    question: "Is digital KYC on DigiLocker or mParivahan accepted?",
    answer: "Yes, we accept verified mParivahan and DigiLocker virtual driving licenses and Aadhaar cards during our digital pre-handover verification.",
  },
  {
    question: "What is the minimum age requirement for car and bike rentals?",
    answer: "The minimum age to rent a self-drive car is 21 years with at least 1 year of driving experience. The minimum age to rent an hourly scooter or motorcycle is 18 years.",
  },
];

export default function DocumentsRequiredGuide() {
  const breadcrumbs = [
    { name: "Guides", url: "/guides/documents-required-self-drive-car-rental" },
    { name: "Documents Required Guide", url: "/guides/documents-required-self-drive-car-rental" },
  ];

  return (
    <div className="min-h-screen bg-[#F6F5FA] text-[#212121] font-body no-scroll-x selection:bg-[#212121] selection:text-white">
      <SEO
        title="Documents Required for Self-Drive Car Rental in Solapur (Complete Checklist)"
        description="Official checklist of documents needed for self-drive car & bike rentals in Solapur. Aadhaar, Indian Driving License, KYC guidelines, and security deposit details."
        canonical="https://journeyrentals.in/guides/documents-required-self-drive-car-rental"
      />
      <BreadcrumbStructuredData items={breadcrumbs} />
      <FAQStructuredData faqs={FAQS} />

      <Navbar />

      <main className="pt-24 sm:pt-28 pb-16 space-y-12 sm:space-y-16 max-w-5xl mx-auto px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-xs text-[#6F6E73] flex items-center gap-1.5 font-medium">
          <Link to="/" className="hover:text-[#212121]">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#212121] font-bold">Documents Required Guide</span>
        </nav>

        <article className="bg-white rounded-[24px] sm:rounded-[32px] border border-[#DFDCE8] p-6 sm:p-10 space-y-8 shadow-sm">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#82C4B7]/20 border border-[#82C4B7]/30 text-[#4B8039] text-xs font-bold font-mono uppercase tracking-wider">
              <span>Official Verification Guide</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#212121] tracking-tight leading-tight">
              Documents Required for Self-Drive Car Rental in Solapur
            </h1>
            <div className="text-xs text-[#6F6E73] font-mono flex items-center gap-4">
              <span>Published by Journey Rentals Compliance Team</span>
              <span>•</span>
              <span>Updated: August 2026</span>
            </div>
          </div>

          {/* Quick Answer Block */}
          <div className="bg-[#F6F5FA] border-l-4 border-[#212121] rounded-2xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#212121] font-mono">
              <Sparkles size={14} className="text-[#e1b808]" />
              <span>Mandatory Checklist Summary</span>
            </div>
            <p className="text-xs sm:text-sm text-[#212121] leading-relaxed font-medium">
              To rent a self-drive vehicle in Solapur, you need: <strong>1. Original Indian Driving License</strong> (LMV for cars, MCWG for two-wheelers), <strong>2. Aadhaar Card or Passport</strong> for identity/address verification, and <strong>3. ₹500 advance booking token</strong> paid online via Razorpay. Digital verification takes less than 2 minutes during checkout.
            </p>
          </div>

          {/* Detailed Document Cards */}
          <div className="grid sm:grid-cols-2 gap-5 pt-4">
            <div className="p-6 rounded-2xl bg-[#F6F5FA] border border-[#DFDCE8] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#212121] text-white flex items-center justify-center">
                <FileCheck size={20} className="text-[#e1b808]" />
              </div>
              <h2 className="font-display text-base sm:text-lg font-bold text-[#212121]">
                1. Driving License (Mandatory)
              </h2>
              <ul className="text-xs sm:text-sm text-[#6F6E73] space-y-2 font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-[#4B8039] shrink-0 mt-0.5" />
                  <span>Valid Indian LMV (Light Motor Vehicle) License.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-[#4B8039] shrink-0 mt-0.5" />
                  <span>mParivahan / DigiLocker virtual DL accepted.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-[#4B8039] shrink-0 mt-0.5" />
                  <span>For NRIs/Foreigners: International Driving Permit (IDP) + Home Country License.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#F6F5FA] border border-[#DFDCE8] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#212121] text-white flex items-center justify-center">
                <UserCheck size={20} className="text-[#82C4B7]" />
              </div>
              <h2 className="font-display text-base sm:text-lg font-bold text-[#212121]">
                2. Identity &amp; Address Proof
              </h2>
              <ul className="text-xs sm:text-sm text-[#6F6E73] space-y-2 font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-[#4B8039] shrink-0 mt-0.5" />
                  <span>Aadhaar Card (front &amp; back) or Indian Passport.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-[#4B8039] shrink-0 mt-0.5" />
                  <span>Verified securely online with OTP or photo upload.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-[#4B8039] shrink-0 mt-0.5" />
                  <span>Name on ID must match the person driving the vehicle.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 3 Step Verification Process */}
          <div className="space-y-4 pt-4">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#212121]">
              How the 3-Step Verification Works
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8] space-y-1.5">
                <span className="text-xs font-mono font-bold text-[#4B8039]">STEP 01</span>
                <div className="font-bold text-sm text-[#212121]">Online Reservation</div>
                <div className="text-xs text-[#6F6E73]">Pick dates, select your car or scooter, and pay ₹500 via Razorpay.</div>
              </div>
              <div className="p-4 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8] space-y-1.5">
                <span className="text-xs font-mono font-bold text-[#4B8039]">STEP 02</span>
                <div className="font-bold text-sm text-[#212121]">Instant Digital KYC</div>
                <div className="text-xs text-[#6F6E73]">Submit DL &amp; Aadhaar details before arrival for rapid pre-clearance.</div>
              </div>
              <div className="p-4 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8] space-y-1.5">
                <span className="text-xs font-mono font-bold text-[#4B8039]">STEP 03</span>
                <div className="font-bold text-sm text-[#212121]">Express Handover</div>
                <div className="text-xs text-[#6F6E73]">Inspect the vehicle, receive keys at Solapur Station, and begin driving.</div>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="space-y-4 pt-4">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#212121]">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-3">
              {FAQS.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className="border border-[#DFDCE8] rounded-2xl px-5 bg-[#F6F5FA]/60"
                >
                  <AccordionTrigger className="text-left font-display font-bold text-xs sm:text-sm text-[#212121] hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-[#6F6E73] font-medium leading-relaxed pb-4 pt-1">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
