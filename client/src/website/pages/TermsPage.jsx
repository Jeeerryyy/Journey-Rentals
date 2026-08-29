/* Brex / Urbanist Design System — Comprehensive Master Terms & Conditions */
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
  Sparkles,
  MapPin,
  RefreshCw,
  Truck,
  RotateCcw,
  Ban,
  Scale,
  Gauge,
  HelpCircle,
} from "lucide-react";

const MASTER_TERMS_SECTIONS = [
  {
    id: "eligibility",
    icon: ShieldCheck,
    title: "1. Driver Eligibility, License & KYC Verification",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          To ensure road safety and statutory motor vehicle compliance across Maharashtra, all hirers must meet the following mandatory criteria:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>Age Requirement:</strong> The primary driver must be at least <strong>21 years of age</strong>.</li>
          <li><strong>Driving License:</strong> You must present an original, valid Indian Light Motor Vehicle (LMV) Driving License held for a minimum of 1 year. Learner licenses are strictly not accepted.</li>
          <li><strong>Zero-Deposit Digital KYC:</strong> A valid government-issued photo ID (Aadhaar Card, Passport, or Voter ID) must be verified prior to key handover. Journey Rentals does not collect physical identity cards or high security deposits.</li>
          <li><strong>Authorized Drivers:</strong> Only the verified primary hirer (and registered secondary co-driver, if declared during booking) is legally permitted to operate the vehicle.</li>
        </ul>
      </>
    ),
  },
  {
    id: "usage-pilgrimage",
    icon: Car,
    title: "2. Vehicle Usage & Pilgrimage Corridors (Unlimited Kilometers)",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          All cars and bikes in our fleet are registered commercial self-drive vehicles with valid tourist permits:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>Unlimited Kilometers:</strong> Standard daily and multi-day bookings include <strong>unlimited kilometers</strong> with zero per-kilometer overage charges.</li>
          <li><strong>Pilgrimage Circuits:</strong> Fully authorized for travel to Akkalkot (Swami Samarth Mandir), Tuljapur (Bhavani Mata Mandir), Pandharpur (Vitthal Rukmini Mandir), Gangapur Dattatreya, and Pune/Mumbai highways.</li>
          <li><strong>Interstate Travel:</strong> If traveling outside Maharashtra (e.g. Karnataka border trips to Bijapur/Kalaburagi), statutory state border entry taxes are payable by the hirer at the respective RTO border checkposts.</li>
        </ul>
      </>
    ),
  },
  {
    id: "cancellation-refunds",
    icon: RefreshCw,
    title: "3. Advance Booking, Cancellation & Refund Policy",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          To lock your vehicle without high upfront expenses, Journey Rentals only requires a nominal <strong>₹500 advance</strong>. Your cancellation refund is calculated based on notification time:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          <div className="p-3.5 rounded-xl bg-[#CFDECA]/40 border border-[#CFDECA] text-xs">
            <span className="font-bold text-[#4B8039] block text-sm">&gt; 24 Hours Prior</span>
            <span className="font-bold text-[#212121]">100% Full Refund</span>
            <p className="text-[#6F6E73] mt-1 text-[11px]">Full ₹500 advance returned with zero processing fees.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FBECC8]/50 border border-[#FBECC8] text-xs">
            <span className="font-bold text-[#916A00] block text-sm">12 to 24 Hours Prior</span>
            <span className="font-bold text-[#212121]">50% Partial Refund</span>
            <p className="text-[#6F6E73] mt-1 text-[11px]">₹250 refunded to offset vehicle holding &amp; prep costs.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FCD8D4]/50 border border-[#FCD8D4] text-xs">
            <span className="font-bold text-[#B83227] block text-sm">&lt; 12 Hours / No-Show</span>
            <span className="font-bold text-[#212121]">Non-Refundable</span>
            <p className="text-[#6F6E73] mt-1 text-[11px]">Advance forfeited for immediate slot reservation loss.</p>
          </div>
        </div>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>Razorpay Bank Settlement:</strong> All approved refunds are automatically credited back to your original payment method (UPI / Debit Card / Netbanking) within <strong>5 to 7 business days</strong> via Razorpay.</li>
          <li><strong>Free Rescheduling:</strong> Change your trip dates with zero penalty if requested at least 12 hours before pickup, subject to fleet availability.</li>
          <li><strong>Severe Weather / Train Delays:</strong> Full 100% refunds or open travel credits are provided in case of verified train cancellations at Solapur Station or government highway advisories.</li>
        </ul>
      </>
    ),
  },
  {
    id: "handover-delivery",
    icon: Truck,
    title: "4. Delivery, Platform Handover & Digital Check-In (Shipping Policy)",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          We offer convenient dispatch options across Solapur:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>Solapur Railway Station Platform Handover:</strong> 100% free delivery. Our executive meets you right outside Solapur Junction main exit/parking with vehicle keys staged.</li>
          <li><strong>Doorstep &amp; Hotel Dispatch:</strong> Available across Solapur city (Hotgi Road, Vijapur Road, Old Pune Naka) with nominal delivery fee based on distance.</li>
          <li><strong>2-Minute Digital Walkaround:</strong> Before handover, our supervisor photographs odometer reading, fuel bar, and any pre-existing cosmetic scratches so you are never charged for prior wear.</li>
        </ul>
      </>
    ),
  },
  {
    id: "return-exchange",
    icon: RotateCcw,
    title: "5. Vehicle Return, Grace Periods & Exchange Policy",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          Vehicles must be returned to the designated Solapur hub at the agreed booking conclusion time:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>30-Minute Grace Buffer:</strong> An automatic 30-minute grace window is granted to accommodate highway traffic delays before late fees apply.</li>
          <li><strong>Unscheduled Extension:</strong> Delays exceeding 30 minutes without prior dispatch approval are billed at standard hourly rates plus ₹200/hr late fee to protect subsequent bookings.</li>
          <li><strong>Roadside Assistance &amp; Exchange:</strong> In the rare event of mechanical trouble or breakdown, our mobile unit is dispatched immediately. If unresolved within 90 minutes, an equivalent or upgraded vehicle is delivered at no extra charge.</li>
        </ul>
      </>
    ),
  },
  {
    id: "fuel-tolls",
    icon: Fuel,
    title: "6. Fuel Policy, FASTag & Toll Compliance",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          Fuel and highway tolls operate on clear, actual-use principles:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>Level-to-Level Fuel:</strong> Vehicles are delivered with a recorded fuel level and must be returned at the same level. If returned with less fuel, the difference is charged at exact pump price without penalty markup.</li>
          <li><strong>Automated FASTag:</strong> Every car has an active FASTag. Exact electronic toll deductions logged during your rental duration are reconciled at vehicle return.</li>
          <li><strong>Traffic E-Challans:</strong> Any speeding fines, camera-captured signal jumps, or illegal parking challans incurred during your reservation remain the legal liability of the hirer.</li>
        </ul>
      </>
    ),
  },
  {
    id: "acceptable-use",
    icon: Ban,
    title: "7. Acceptable Use Policy & Zero-Tolerance Prohibitions",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          To protect hirer safety and prevent criminal liabilities, the following activities are strictly prohibited and result in immediate contract cancellation and police notification:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>Drunk Driving:</strong> Operating a vehicle under the influence of alcohol, narcotics, or intoxicating substances (automatically voids all insurance coverage).</li>
          <li><strong>Sub-Leasing / Commercial Taxi:</strong> Renting the vehicle out to third parties, operating as an unregistered taxi aggregator, or carrying goods for commercial freight.</li>
          <li><strong>Racing &amp; Abuse:</strong> Speed contests, drag racing, aggressive drifting, or driving through deep unpaved rivers/extreme off-road tracks.</li>
          <li><strong>Illegal Cargo:</strong> Transporting contraband, hazardous chemicals, or prohibited substances under Indian law.</li>
        </ul>
      </>
    ),
  },
  {
    id: "disclaimers-speed",
    icon: Gauge,
    title: "8. Statutory Speed Regulations, Insurance & Liability Disclaimers",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed mb-3">
          Statutory motor vehicle compliance guidelines:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
          <li><strong>Speed Governor Compliance:</strong> In accordance with applicable statutory road safety regulations, commercial rental vehicles are equipped with speed limiters configured to <strong>80 km/h</strong>. Tampering with speed limiting devices or vehicle telematics is strictly prohibited and constitutes a material breach of contract.</li>
          <li><strong>Insurance Coverage:</strong> All vehicles carry comprehensive commercial insurance. In the event of an accidental damage claim, the hirer's maximum liability is strictly limited to the mandatory insurance deductible (₹5,000 for standard hatchbacks, ₹10,000 for SUVs) provided zero violations of clause 7 occurred.</li>
          <li><strong>Personal Belongings:</strong> Journey Rentals is not liable for loss or damage to personal items, cash, or electronics left inside the vehicle.</li>
        </ul>
      </>
    ),
  },
  {
    id: "jurisdiction",
    icon: Scale,
    title: "9. Governing Law & Dispute Resolution",
    content: (
      <>
        <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed">
          This rental agreement is governed by the laws of India and the State of Maharashtra. Any statutory notices, legal claims, or disputes arising under this agreement shall be subject to the exclusive jurisdiction of the competent courts in <strong>Solapur, Maharashtra</strong>.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
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
        title="Terms of Service & Rental Agreement | Journey Rentals Solapur"
        description="Comprehensive self-drive vehicle rental agreement, driver eligibility, ₹500 advance refund policy, platform delivery, fuel rules, and acceptable use guidelines."
        canonical="/terms"
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "/" },
          { name: "Terms & Conditions", url: "/terms" },
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

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20 mb-3">
                <Sparkles size={12} className="text-[#e1b808]" />
                Official Rental Agreement &amp; Policies
              </span>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Terms of Service &amp; Rental Policies
              </h1>
              <p className="text-sm sm:text-base text-[#99989E] mt-2 max-w-2xl">
                Clear, transparent, and legally binding guidelines covering vehicle reservation, cancellations, refunds, station handover, and driver safety.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Jump Navigation Bar */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-6">
          <div className="bg-white border border-[#DFDCE8] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6F6E73] mb-2">
              Quick Policy Jump:
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <a href="#eligibility" className="px-3 py-1 rounded-full bg-[#F6F5FA] hover:bg-[#212121] hover:text-white transition-colors border border-[#DFDCE8]">1. Eligibility &amp; KYC</a>
              <a href="#usage-pilgrimage" className="px-3 py-1 rounded-full bg-[#F6F5FA] hover:bg-[#212121] hover:text-white transition-colors border border-[#DFDCE8]">2. Pilgrimage Corridors</a>
              <a href="#cancellation-refunds" className="px-3 py-1 rounded-full bg-[#F6F5FA] hover:bg-[#212121] hover:text-white transition-colors border border-[#DFDCE8] font-bold text-[#3F5F8C]">3. Refund &amp; Cancellation</a>
              <a href="#handover-delivery" className="px-3 py-1 rounded-full bg-[#F6F5FA] hover:bg-[#212121] hover:text-white transition-colors border border-[#DFDCE8]">4. Delivery / Handover</a>
              <a href="#return-exchange" className="px-3 py-1 rounded-full bg-[#F6F5FA] hover:bg-[#212121] hover:text-white transition-colors border border-[#DFDCE8]">5. Return &amp; Exchange</a>
              <a href="#fuel-tolls" className="px-3 py-1 rounded-full bg-[#F6F5FA] hover:bg-[#212121] hover:text-white transition-colors border border-[#DFDCE8]">6. Fuel &amp; FASTag</a>
              <a href="#acceptable-use" className="px-3 py-1 rounded-full bg-[#F6F5FA] hover:bg-[#212121] hover:text-white transition-colors border border-[#DFDCE8]">7. Acceptable Use</a>
              <a href="#disclaimers-speed" className="px-3 py-1 rounded-full bg-[#F6F5FA] hover:bg-[#212121] hover:text-white transition-colors border border-[#DFDCE8]">8. Speed &amp; Insurance</a>
            </div>
          </div>
        </section>

        {/* Master Clauses */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
          <div className="space-y-6">
            {MASTER_TERMS_SECTIONS.map((sec) => {
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

          {/* Grievance & Contact Section */}
          <div className="mt-10 bg-[#212121] text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h3 className="font-display text-lg font-bold">Questions Regarding Rental Terms?</h3>
              <p className="text-xs sm:text-sm text-[#99989E] mt-1 max-w-xl">
                Our operations and support desk in Solapur is available 24/7 to assist with booking questions, cancellations, and route authorizations.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-mono text-[#e1b808]">
                <a href="tel:+919604437794" className="flex items-center gap-1.5 hover:underline">
                  <Phone size={13} /> +91 96044 37794
                </a>
                <a href="mailto:rental.journeycars@gmail.com" className="flex items-center gap-1.5 hover:underline">
                  <Mail size={13} /> rental.journeycars@gmail.com
                </a>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://wa.me/919604437794?text=Hi%20Journey%20Rentals,%20I%20have%20a%20question%20regarding%20rental%20terms"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#e1b808] text-[#212121] hover:bg-[#d0aa07] rounded-full px-5 py-2.5 text-xs font-bold transition-all shadow-sm shrink-0"
              >
                <HelpCircle size={14} />
                <span>Chat with Support</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
