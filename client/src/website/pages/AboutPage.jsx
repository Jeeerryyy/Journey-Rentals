/* Brex / Urbanist Design System — Dedicated About & FAQ Page (Exact DriveHub Goa Parity) */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SEO from "../components/seo/SEO";
import { FAQStructuredData, BreadcrumbStructuredData } from "../components/seo/AdditiveSchemas";
import {
  ShieldCheck,
  Award,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  Phone,
  Mail,
  Car,
  ChevronRight,
  HelpCircle,
  Zap,
  Users,
  Compass,
  ArrowRight,
  Headphones,
  DollarSign,
  Fuel,
  KeyRound,
  MessageCircle,
  Bike,
} from "lucide-react";
import { Button } from "@/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/ui/accordion";

const STATS = [
  { value: "2020", label: "Year Founded" },
  { value: "30+", label: "Verified Fleet" },
  { value: "10k+", label: "Happy Trips" },
  { value: "4.9★", label: "Google Rating", highlight: true },
  { value: "100%", label: "On-Time Delivery" },
];

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "100% Verified & Sanitised Fleet",
    desc: "Every car and bike undergoes a strict 28-point pre-handover mechanical and safety check, accompanied by deep cabin sanitisation and full AC duct cleaning.",
  },
  {
    icon: DollarSign,
    title: "Zero Hidden Fees & Transparent Pricing",
    desc: "What you see is exactly what you pay. Transparent daily & hourly rental rates, crystal-clear fuel policies, and immediate digital KYC verification with zero deposit stress.",
  },
  {
    icon: Zap,
    title: "Express Railway Station & Doorstep Delivery",
    desc: "Instant platform key handover at Solapur Railway Station right as your train arrives. Complimentary doorstep deliveries throughout Solapur city hubs.",
  },
  {
    icon: Headphones,
    title: "24/7 Dedicated Solapur Support Dispatch",
    desc: "Our localized roadside response team is on 24-hour standby across Solapur, Akkalkot, Tuljapur, and Pandharpur routes for immediate assistance or mechanical support.",
  },
];

const FAQ_CATEGORIES = [
  { id: "all", label: "All Questions" },
  { id: "eligibility", label: "Eligibility & Docs" },
  { id: "pricing", label: "Pricing & Deposit" },
  { id: "pickup", label: "Pickup & Railway Station" },
  { id: "fuel", label: "Fuel & Policies" },
  { id: "pilgrimage", label: "Pilgrimage Routes" },
];

const FAQ_DATA = [
  {
    id: "faq-1",
    category: "eligibility",
    question: "What documents are required to rent a self-drive car or bike in Solapur?",
    answer:
      "To rent a vehicle with Journey Rentals, you must present a valid Original Driving License along with an Aadhaar Card or Voter ID (for Indian residents). International travellers require a valid Passport and an International Driving Permit (IDP) or native driving license.",
  },
  {
    id: "faq-2",
    category: "eligibility",
    question: "What is the minimum age requirement for renting?",
    answer:
      "The minimum age requirement is 21 years with at least one year of active driving experience. All driving documents are verified digitally during the booking process or in-person at handover.",
  },
  {
    id: "faq-3",
    category: "pricing",
    question: "Is there a security deposit, and how is it refunded?",
    answer:
      "Journey Rentals operates on an instant digital KYC model with zero security deposit hassle for verified profiles. You simply pay a nominal advance to reserve the vehicle and clear the balance at vehicle handover.",
  },
  {
    id: "faq-4",
    category: "pricing",
    question: "What is the cancellation and modification policy?",
    answer:
      "We offer free cancellations with a 100% refund when cancelled up to 24 hours prior to the scheduled pickup time. Date and vehicle modifications can be made anytime subject to vehicle availability through your account or WhatsApp support.",
  },
  {
    id: "faq-5",
    category: "pickup",
    question: "How does Solapur Railway Station express delivery work?",
    answer:
      "Our team coordinates with your train arrival time. When you exit Solapur Railway Station, our representative meets you right outside with the vehicle parked and ready for a swift 2-minute digital handover so you can begin your journey without waiting.",
  },
  {
    id: "faq-6",
    category: "pickup",
    question: "Can I pick up the vehicle at one location and return it at another?",
    answer:
      "Yes, we support flexible return points across Solapur. For example, you can pick up the car at Solapur Railway Station and return it at Hotgi Road, Vijapur Road, or your hotel.",
  },
  {
    id: "faq-7",
    category: "fuel",
    question: "What is the fuel policy for rented cars and bikes?",
    answer:
      "Journey Rentals follows a fair 'Same-to-Same' fuel policy. You will receive the vehicle with a documented fuel level, and you are expected to return it with the same level. If returned with less, the difference is adjusted at standard fuel rates.",
  },
  {
    id: "faq-8",
    category: "fuel",
    question: "Is there a kilometer driving limit on self-drive rentals?",
    answer:
      "All standard daily self-drive car rentals include unlimited kilometers throughout Maharashtra, enabling hassle-free pilgrimage travel to Akkalkot, Tuljapur, and Pandharpur.",
  },
  {
    id: "faq-9",
    category: "pilgrimage",
    question: "Can I drive to Akkalkot Swami Samarth, Tuljapur Bhavani, and Pandharpur Vitthal temples?",
    answer:
      "Yes! All our fleet vehicles carry all-Maharashtra commercial tourist permits and fastag for toll plazas. Our vehicles are ideal for family pilgrimage circuits around Solapur.",
  },
  {
    id: "faq-10",
    category: "eligibility",
    question: "What should I do in case of a flat tire or roadside breakdown?",
    answer:
      "We provide complimentary 24/7 localized roadside assistance. In the rare event of a tire puncture, battery issue, or mechanical concern, call our emergency hotline at +91 96044 37794 and our mobile dispatch unit will assist you promptly.",
  },
];

export default function AboutPage() {
  const navigate = useNavigate();
  const [activeFaqCategory, setActiveFaqCategory] = useState("all");

  const filteredFaqs =
    activeFaqCategory === "all"
      ? FAQ_DATA
      : FAQ_DATA.filter((item) => item.category === activeFaqCategory);

  return (
    <div className="min-h-screen bg-[#F6F5FA] text-[#212121] font-body flex flex-col justify-between selection:bg-[#212121] selection:text-white">
      <SEO
        title="About Journey Rentals Solapur — Self-Drive Cars, Bikes & FAQs"
        description="Learn about Journey Rentals Solapur. Explore our fleet standards, railway station delivery services, transparent pricing, and complete rental FAQs."
        canonical="/about"
      />
      <FAQStructuredData faqs={FAQ_DATA} />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "/" },
          { name: "About Us & FAQs", url: "/about" },
        ]}
      />

      <Navbar />

      <main className="flex-1 pt-20 pb-16">
        {/* ── 1. HERO HEADER ── */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-8 sm:pt-12 pb-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#6F6E73] mb-6">
            <Link to="/" className="hover:text-[#212121] transition-colors">Home</Link>
            <ChevronRight size={13} className="text-[#99989E]" />
            <span className="text-[#212121] font-bold">About Us &amp; FAQs</span>
          </div>

          <div className="relative bg-white border border-[#DFDCE8] rounded-[24px] p-6 sm:p-10 lg:p-12 shadow-sm overflow-hidden text-left">
            <div className="max-w-3xl space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#212121] tracking-tight leading-tight font-display">
                Freedom, Safety, and Transparency Across Every Road in Solapur
              </h1>

              <p className="text-sm sm:text-base text-[#6F6E73] leading-relaxed font-normal">
                Journey Rentals was created with a singular focus: giving devotees, families, and travellers complete independence to explore Solapur and pilgrimage temples with dependable sanitized vehicles, crystal-clear pricing, and 24/7 on-ground roadside support.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mt-8 pt-8 border-t border-[#DFDCE8]">
              {STATS.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-[#F6F5FA] p-4 sm:p-5 rounded-[16px] text-center border border-[#DFDCE8]"
                >
                  <div className={`text-2xl sm:text-3xl font-bold font-display ${stat.highlight ? "text-[#212121]" : "text-[#212121]"}`}>
                    {stat.value}
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-[#6F6E73] font-bold font-mono mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2. STORY & FOUNDER VISION ── */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-6 text-left">
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Story Card */}
            <div className="lg:col-span-7 bg-white border border-[#DFDCE8] rounded-[24px] p-6 sm:p-8 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#212121] uppercase tracking-wider font-mono">
                  <Award size={16} className="text-[#212121]" /> The Journey Rentals Story
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#212121] tracking-tight font-display">
                  Built to Fix What Was Broken in Local Self-Drive Rentals
                </h2>
                <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed font-normal">
                  Founded and operated in Solapur Central, Journey Rentals began as an answer to the frequent issues travellers encountered with traditional transport: surprise hidden charges, delay in vehicle handovers, and poorly maintained cars.
                </p>
                <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed font-normal">
                  We built Journey Rentals around full operational transparency. We maintain and inspect our entire fleet of hatchbacks, sedans, SUVs, and hourly bikes in-house, ensuring each vehicle is in immaculate condition before it reaches your hands.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-[#DFDCE8] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-[#4B8039] font-semibold bg-[#CFDECA] px-3 py-1 rounded-full font-mono">
                  <CheckCircle2 size={16} />
                  <span>Verified Solapur Self-Drive Provider</span>
                </div>
                <div className="text-xs text-[#6F6E73] font-mono">
                  Operations Dispatch: <span className="font-bold text-[#212121]">Solapur Central HQ</span>
                </div>
              </div>
            </div>

            {/* Quick Action Hub Info Card */}
            <div className="lg:col-span-5 bg-[#212121] text-white rounded-[24px] p-6 sm:p-8 flex flex-col justify-between shadow-sm">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#e1b808] mb-2 flex items-center gap-2 font-mono">
                  <Compass size={16} /> Central Operations Hub
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 font-display">
                  Solapur Railway Station &amp; Coverage
                </h3>
                <div className="space-y-3 text-xs sm:text-sm text-[#99989E]">
                  <div className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-[#e1b808] shrink-0 mt-0.5" />
                    <span>Main Hub: Near Solapur Railway Station &amp; Hotgi Road, Solapur 413001</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock size={16} className="text-[#e1b808] shrink-0 mt-0.5" />
                    <span>Hub Hours: 6:00 AM – 11:00 PM (Station Handover 24/7)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Phone size={16} className="text-[#e1b808] shrink-0 mt-0.5" />
                    <span>Dispatch Phone: +91 96044 37794</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Mail size={16} className="text-[#e1b808] shrink-0 mt-0.5" />
                    <span>Email: rental.journeycars@gmail.com</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate("/fleet")}
                  className="bg-[#e1b808] hover:bg-[#E5E690] text-[#212121] font-bold text-xs uppercase tracking-wider rounded-full h-10 flex-1 shadow-sm transition-all cursor-pointer"
                >
                  <Car size={14} className="mr-1.5" /> Browse Fleet
                </Button>
                <a
                  href="https://wa.me/919604437794?text=Hi%20Journey%20Rentals,%20I%20have%20an%20inquiry%20regarding%20vehicle%20rental"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 text-white font-medium text-xs uppercase tracking-wider rounded-full h-10 px-5 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageCircle size={14} className="text-[#CFDECA]" /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. FOUR PILLARS OF SERVICE ── */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-8 text-left">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#212121] tracking-tight font-display">
              Why Travellers Choose Journey Rentals
            </h2>
            <p className="text-xs sm:text-sm text-[#6F6E73] mt-1 font-normal">
              Engineered for seamless car and bike rental experiences from booking to return.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#DFDCE8] rounded-[24px] p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-[#212121] transition-colors"
                >
                  <div>
                    <div className="w-10 h-10 rounded-full bg-[#e1b808] text-[#212121] flex items-center justify-center mb-3">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-bold text-sm text-[#212121] mb-1.5 leading-snug font-display">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-[#6F6E73] leading-relaxed font-normal">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4. COMPREHENSIVE FAQS ── */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10 text-left" id="faqs">
          <div className="bg-white border border-[#DFDCE8] rounded-[24px] p-6 sm:p-10 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8 pb-6 border-b border-[#DFDCE8]">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#212121] uppercase tracking-wider mb-2">
                  <HelpCircle size={15} /> Frequently Asked Questions
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#212121] tracking-tight font-display">
                  Everything You Need to Know
                </h2>
                <p className="text-xs sm:text-sm text-[#6F6E73] mt-1 font-normal">
                  Clear answers about self-drive rentals, deposits, railway station pickups, and pilgrimage policies.
                </p>
              </div>

              {/* Category Filter Pills (Fixed & Stabilized) */}
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                {FAQ_CATEGORIES.map((cat) => {
                  const isSelected = activeFaqCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveFaqCategory(cat.id)}
                      className={`h-8 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center border select-none ${
                        isSelected
                          ? "bg-[#212121] text-white border-[#212121] shadow-2xs"
                          : "bg-[#F6F5FA] text-[#212121] border-[#DFDCE8] hover:border-[#212121]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accordion List (Fixed Minimum Height to Prevent Jumping) */}
            <div className="min-h-[380px]">
              <Accordion type="single" collapsible className="w-full space-y-3">
                {filteredFaqs.map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="border border-[#DFDCE8] rounded-[16px] px-5 py-1 bg-[#F6F5FA] data-[state=open]:bg-white data-[state=open]:border-[#212121] transition-colors"
                  >
                    <AccordionTrigger className="text-left text-xs sm:text-sm font-bold text-[#212121] hover:no-underline py-3">
                      <span className="pr-4">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed pt-1 pb-3 font-normal">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* ── 5. BOTTOM CALL TO ACTION ── */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-6">
          <div className="bg-[#212121] text-white rounded-[24px] p-8 sm:p-12 text-center relative overflow-hidden shadow-md">
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight font-display">
                Ready to Hit the Road in Solapur?
              </h2>
              <p className="text-xs sm:text-sm text-[#99989E] leading-relaxed">
                Choose from our verified fleet of SUVs, family sedans, compact hatchbacks, and hourly bikes with instant confirmation.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <Button
                  onClick={() => navigate("/fleet")}
                  className="bg-white hover:bg-[#EFEDF5] active:bg-[#DFDCE8] text-[#212121] font-bold text-xs uppercase tracking-wider rounded-full h-11 px-7 shadow-sm transition-all cursor-pointer"
                >
                  <span>Explore Available Fleet</span>
                  <ArrowRight size={14} className="ml-1.5" />
                </Button>
                <a
                  href="tel:+919604437794"
                  className="bg-white/10 hover:bg-white/20 text-white font-medium text-xs uppercase tracking-wider rounded-full h-11 px-6 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Phone size={14} className="text-[#e1b808]" />
                  <span>Call +91 96044 37794</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
