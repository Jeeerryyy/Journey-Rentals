/* Brex / Urbanist Design System — Terms & Conditions Page */
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SEO from "../components/seo/SEO";
import { BreadcrumbStructuredData } from "../components/seo/AdditiveSchemas";
import {
  FileText,
  ShieldCheck,
  Fuel,
  AlertCircle,
  Clock,
  Car,
  ChevronRight,
  Phone,
  Mail,
  Printer,
  Sparkles,
  MapPin,
} from "lucide-react";
import { Button } from "@/ui/button";

const SECTIONS = [
  {
    id: "eligibility",
    icon: ShieldCheck,
    title: "1. Driver Eligibility, License & KYC Verification",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          To ensure safety and statutory compliance on Maharashtra roads, all hirers must meet the following baseline requirements:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>Age Requirement:</strong> The primary driver must be at least <strong>21 years of age</strong>.</li>
          <li><strong>Driving License:</strong> You must present an original, valid Indian Driving License (LMV for cars, MCWG for two-wheelers) held for a minimum of 1 year. Learner licenses are strictly not accepted.</li>
          <li><strong>Government ID:</strong> A valid original photo ID (Aadhaar Card, Passport, or Voter ID) matching the driving license name must be submitted during digital KYC or physical handover.</li>
          <li><strong>International Travelers:</strong> Foreign nationals must provide an original Passport, valid Visa, and an International Driving Permit (IDP) alongside their domestic driving license.</li>
        </ul>
      </>
    ),
  },
  {
    id: "permitted-use",
    icon: Car,
    title: "2. Vehicle Usage & Pilgrimage Routes",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          All Journey Rentals cars and bikes are registered with official tourist permits:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>Approved Pilgrimage Circuits:</strong> Unlimited kilometer travel is permitted across popular Solapur circuits including <em>Akkalkot (Swami Samarth Mandir)</em>, <em>Tuljapur (Bhavani Mata Mandir)</em>, <em>Pandharpur (Vitthal-Rukmini Mandir)</em>, and <em>Gangapur</em>.</li>
          <li><strong>Interstate Travel:</strong> If you plan to travel outside Maharashtra (e.g. into Karnataka or Telangana), prior notice must be given during booking so appropriate state permit taxes can be arranged.</li>
          <li><strong>Prohibited Activities:</strong> Off-roading in non-4x4 vehicles, commercial ride-sharing, towing, racing, driving under the influence of alcohol/drugs, or transporting illicit goods is strictly forbidden and terminates insurance coverage immediately.</li>
        </ul>
      </>
    ),
  },
  {
    id: "booking-cancellation",
    icon: Clock,
    title: "3. Booking Reservations, Advance & Cancellation Policy",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          We believe in transparent scheduling with zero hidden charges:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>Advance Confirmation:</strong> A nominal advance payment (typically ₹500 - ₹1,000 depending on vehicle class) is required to block the vehicle and schedule dispatch.</li>
          <li><strong>Balance Settlement:</strong> The remaining rental balance must be paid in full at the time of vehicle key handover via UPI, Cash, or Card.</li>
          <li><strong>Cancellations:</strong>
            <ul className="list-circle pl-5 mt-1 space-y-1 text-[#6F6E73]">
              <li>More than 24 hours prior to pickup: 100% full refund of the advance amount.</li>
              <li>Within 12 to 24 hours prior to pickup: 50% refund of the advance amount.</li>
              <li>Less than 12 hours or No-Show: Advance is non-refundable due to reserved dispatch staging.</li>
            </ul>
          </li>
          <li><strong>Extensions:</strong> Trip extensions must be requested at least 4 hours prior to your scheduled return time via phone or WhatsApp, subject to vehicle availability.</li>
        </ul>
      </>
    ),
  },
  {
    id: "fuel-policy",
    icon: Fuel,
    title: "4. Fuel Policy & Vehicle Return Condition",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          Journey Rentals operates on a fair <strong>Level-to-Level Fuel Policy</strong>:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li>The vehicle is handed over with a recorded fuel gauge level. The hirer is requested to return the vehicle with the equivalent fuel level.</li>
          <li>If returned with lower fuel, the difference is charged at prevailing market fuel rates without surcharge.</li>
          <li><strong>Cleanliness:</strong> Normal road dust and exterior grime from highway driving is accepted. However, excessive interior stains, mud accumulation, cigarette smoke, or food spills requiring professional dry cleaning will incur a standard deep-cleaning fee.</li>
        </ul>
      </>
    ),
  },
  {
    id: "insurance-accidents",
    icon: ShieldCheck,
    title: "5. Insurance, Breakdowns & Roadside Assistance",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          Your safety is backed by comprehensive commercial vehicle insurance:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>Comprehensive Insurance:</strong> All vehicles carry valid Third-Party Liability and Own Damage comprehensive insurance. In the event of an unavoidable accidental damage, customer liability is limited to the insurance deductible/excess amount provided traffic laws were obeyed.</li>
          <li><strong>24/7 Roadside Assistance:</strong> In case of a mechanical issue, flat tire, or breakdown anywhere in Solapur or surrounding pilgrimage routes, call our 24/7 dispatch hotline immediately. We will dispatch mobile repair or arrange an immediate replacement vehicle.</li>
          <li><strong>Accident Reporting:</strong> Any accident or collision must be reported to Journey Rentals within 1 hour along with photographs before moving the vehicle from the scene.</li>
        </ul>
      </>
    ),
  },
  {
    id: "tolls-fastag",
    icon: AlertCircle,
    title: "6. Fastag, Tolls, Challans & Traffic Fines",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          Hirers are responsible for all government toll and traffic compliance:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>FASTag:</strong> All cars are fitted with active FASTags. Exact toll charges incurred during your trip duration will be reconciled and billed at actuals at vehicle return.</li>
          <li><strong>Traffic Violations:</strong> Any speeding e-challans, signal jumping fines, or illegal parking penalties captured by traffic cameras during the rental period remain the legal and financial responsibility of the hirer.</li>
        </ul>
      </>
    ),
  },
];

export default function TermsPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F6F5FA] text-[#212121] flex flex-col font-body selection:bg-[#212121] selection:text-white">
      <SEO
        title="Terms & Conditions | Journey Rentals Solapur"
        description="Review the official self-drive vehicle rental agreement, driver eligibility, zero-deposit KYC guidelines, fuel policies, and pilgrimage travel rules with Journey Rentals Solapur."
        canonical="/terms"
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", item: "https://journeyrentals.in/" },
          { name: "Terms & Conditions", item: "https://journeyrentals.in/terms" },
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
              <span className="text-white font-bold">Terms &amp; Conditions</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20 mb-3">
                  <Sparkles size={12} className="text-[#e1b808]" />
                  Official Rental Agreement
                </span>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                  Terms &amp; Conditions
                </h1>
                <p className="text-sm sm:text-base text-[#99989E] mt-2 max-w-2xl">
                  Clear, honest, and transparent guidelines designed to keep your Solapur and pilgrimage journeys seamless, secure, and stress-free.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="rounded-full bg-white/10 hover:bg-white/20 text-white border-white/20 h-10 px-4 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print Agreement</span>
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
                Zero Deposit &amp; Instant Digital KYC
              </h3>
              <p className="text-xs sm:text-sm text-[#6F6E73] mt-0.5 leading-relaxed">
                Journey Rentals operates with zero security deposit lockups for verified accounts. By confirming a booking on our website or at our Solapur hubs, you agree to the conditions outlined below.
              </p>
            </div>
          </div>

          {/* Detailed Clauses */}
          <div className="space-y-6">
            {SECTIONS.map((sec) => {
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

          {/* Support & Jurisdiction Box */}
          <div className="mt-10 bg-[#212121] text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h3 className="font-display text-lg font-bold">Have Questions About Our Rental Terms?</h3>
              <p className="text-xs sm:text-sm text-[#99989E] mt-1 max-w-xl">
                Our Solapur dispatch team is available 24/7 to clarify any booking conditions or custom pilgrimage travel needs.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="tel:+919604437794"
                className="inline-flex items-center gap-2 bg-white text-[#212121] hover:bg-[#F6F5FA] rounded-full px-5 py-2.5 text-xs font-bold transition-all shadow-sm"
              >
                <Phone size={14} />
                <span>+91 96044 37794</span>
              </a>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-5 py-2.5 text-xs font-bold transition-all"
              >
                <span>Visit FAQs</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
