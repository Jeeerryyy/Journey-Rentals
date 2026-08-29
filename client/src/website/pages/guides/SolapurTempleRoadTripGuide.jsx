/* Brex / Urbanist Design System — High-Citation Road Trip Guide: Solapur to Akkalkot, Tuljapur & Pandharpur */
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
  Compass,
  MapPin,
  Clock,
  Calendar,
  Fuel,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/ui/accordion";

const FAQS = [
  {
    question: "What is the best order to visit Akkalkot, Gangapur, Tuljapur, and Pandharpur?",
    answer: "The most efficient 2-Day pilgrimage circuit from Solapur Railway Station is: Day 1: Solapur → Tuljapur (45 km) → Akkalkot (65 km) → Gangapur (50 km) → Night stay at Akkalkot or Solapur. Day 2: Solapur → Pandharpur (72 km) → Return to Solapur Railway Station for evening return train.",
  },
  {
    question: "How are the road and highway conditions on this pilgrimage circuit?",
    answer: "Road conditions are very good. Solapur-Tuljapur (NH-52) and Solapur-Pandharpur (NH-65) are smooth 4-lane national highways with toll plazas. Solapur-Akkalkot is a well-maintained 2-lane state highway.",
  },
  {
    question: "Which vehicle is best suited for this 2-3 day temple road trip?",
    answer: "For families of 5–7 members, the Maruti Ertiga 7-Seater CNG is the #1 choice for comfort, luggage space, and low fuel costs. For 2–4 people, the Maruti Swift or Hyundai Venue offers fantastic driving ease.",
  },
];

export default function SolapurTempleRoadTripGuide() {
  const breadcrumbs = [
    { name: "Guides", url: "/guides/solapur-to-akkalkot-pandharpur-road-trip" },
    { name: "Solapur Pilgrimage Road Trip Guide", url: "/guides/solapur-to-akkalkot-pandharpur-road-trip" },
  ];

  return (
    <div className="min-h-screen bg-[#F6F5FA] text-[#212121] font-body no-scroll-x selection:bg-[#212121] selection:text-white">
      <SEO
        title="Solapur to Akkalkot, Tuljapur & Pandharpur Road Trip Guide (2-3 Day Circuit)"
        description="Complete self-drive pilgrimage itinerary from Solapur Railway Station covering Akkalkot, Tuljapur, Pandharpur & Gangapur. Distances, timings, temple tips & car rental."
        canonical="https://journeyrentals.in/guides/solapur-to-akkalkot-pandharpur-road-trip"
      />
      <BreadcrumbStructuredData items={breadcrumbs} />
      <FAQStructuredData faqs={FAQS} />

      <Navbar />

      <main className="pt-24 sm:pt-28 pb-16 space-y-12 sm:space-y-16 max-w-5xl mx-auto px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-xs text-[#6F6E73] flex items-center gap-1.5 font-medium">
          <Link to="/" className="hover:text-[#212121]">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#212121] font-bold">Solapur Pilgrimage Road Trip Guide</span>
        </nav>

        <article className="bg-white rounded-[24px] sm:rounded-[32px] border border-[#DFDCE8] p-6 sm:p-10 space-y-8 shadow-sm">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#82C4B7]/20 border border-[#82C4B7]/30 text-[#4B8039] text-xs font-bold font-mono uppercase tracking-wider">
              <span>Pilgrimage Itinerary Guide</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#212121] tracking-tight leading-tight">
              Solapur to Akkalkot, Tuljapur &amp; Pandharpur: The Ultimate Self-Drive Road Trip
            </h1>
            <div className="text-xs text-[#6F6E73] font-mono flex items-center gap-4">
              <span>Published by Journey Rentals Travel Desk</span>
              <span>•</span>
              <span>Updated: August 2026</span>
            </div>
          </div>

          {/* Quick Fact Answer Box */}
          <div className="bg-[#F6F5FA] border-l-4 border-[#212121] rounded-2xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#212121] font-mono">
              <Sparkles size={14} className="text-[#e1b808]" />
              <span>Itinerary Overview</span>
            </div>
            <p className="text-xs sm:text-sm text-[#212121] leading-relaxed font-medium">
              Solapur is the strategic gateway to Maharashtra's sacred pilgrimage quadrangle: <strong>Akkalkot (40 km), Tuljapur (45 km), Pandharpur (72 km), and Gangapur (90 km)</strong>. By picking up a self-drive car right outside Solapur Railway Station upon your morning train arrival, you can comfortably complete this entire 300 km circuit across 2 days with zero driver negotiations, flexible darshan timings, and total family privacy.
            </p>
          </div>

          {/* Distance & Driving Table */}
          <div className="space-y-4 pt-4">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#212121]">
              Distance &amp; Travel Duration Matrix from Solapur
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-[#DFDCE8]">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#F6F5FA] text-[#212121] font-bold border-b border-[#DFDCE8]">
                  <tr>
                    <th className="p-3.5 sm:p-4">Destination Temple</th>
                    <th className="p-3.5 sm:p-4">Distance from Solapur</th>
                    <th className="p-3.5 sm:p-4">Driving Time</th>
                    <th className="p-3.5 sm:p-4">Highway Route</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFDCE8] text-[#6F6E73] font-medium">
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-[#212121]">Shri Swami Samarth (Akkalkot)</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-[#4B8039]">40 km</td>
                    <td className="p-3.5 sm:p-4">45–50 mins</td>
                    <td className="p-3.5 sm:p-4">Akkalkot Road (SH-151)</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-[#212121]">Tulja Bhavani Mata (Tuljapur)</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-[#4B8039]">45 km</td>
                    <td className="p-3.5 sm:p-4">45–50 mins</td>
                    <td className="p-3.5 sm:p-4">NH-52 4-Lane Highway</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-[#212121]">Shri Vitthal-Rukmini (Pandharpur)</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-[#4B8039]">72 km</td>
                    <td className="p-3.5 sm:p-4">1 hr 15 mins</td>
                    <td className="p-3.5 sm:p-4">NH-65 &amp; Mohol Bypass</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-[#212121]">Dattatreya Temple (Gangapur, KA)</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-[#4B8039]">90 km</td>
                    <td className="p-3.5 sm:p-4">1 hr 45 mins</td>
                    <td className="p-3.5 sm:p-4">Akkalkot-Wagdari Road</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 2-Day Recommended Itinerary */}
          <div className="space-y-6 pt-4">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#212121]">
              Recommended 2-Day Pilgrimage Itinerary
            </h2>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#F6F5FA] border border-[#DFDCE8] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#4B8039]">DAY 01</span>
                  <span className="text-xs text-[#6F6E73]">Solapur → Tuljapur → Akkalkot → Gangapur</span>
                </div>
                <div className="font-bold text-sm text-[#212121]">Morning Arrival &amp; Devi Darshan</div>
                <p className="text-xs text-[#6F6E73] leading-relaxed">
                  Arrive at Solapur Railway Station on the Vande Bharat or Siddheshwar Express. Receive your Journey Rentals car outside Platform 1. Drive 45 km to Tuljapur for morning Tulja Bhavani darshan. Proceed 65 km via bypass to Akkalkot for afternoon Mahaprasad at Annachhatra and Swami Samarth darshan. In the late afternoon, take a quick 50 km drive to Gangapur for Dattatreya Sangam snan and darshan. Overnight stay in Akkalkot or Solapur.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F6F5FA] border border-[#DFDCE8] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#4B8039]">DAY 02</span>
                  <span className="text-xs text-[#6F6E73]">Solapur → Pandharpur → Return Train</span>
                </div>
                <div className="font-bold text-sm text-[#212121]">Vitthal-Rukmini Darshan &amp; Return Handover</div>
                <p className="text-xs text-[#6F6E73] leading-relaxed">
                  Depart Solapur at 07:00 AM towards Pandharpur (72 km via NH-65). Enjoy Chandrabhaga river snan and enter the Vitthal-Rukmini temple for Mukh darshan or Charansparsh. Savor traditional Solapur Shenga Chutney lunch. Drive back to Solapur Railway Station by 05:00 PM, hand over the vehicle keys to our executive, and board your return train hassle-free.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Box */}
          <div className="p-6 rounded-2xl bg-[#212121] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-display text-lg font-bold">Plan your temple road trip today</div>
              <div className="text-xs text-white/70">7-Seater Ertiga and economical Swift cars with station delivery.</div>
            </div>
            <Link
              to="/fleet"
              className="bg-white text-[#212121] hover:bg-[#F6F5FA] px-5 py-2.5 rounded-full text-xs font-bold inline-flex items-center gap-2 transition-all shrink-0"
            >
              <span>View Available Fleet</span>
              <ArrowRight size={14} />
            </Link>
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
