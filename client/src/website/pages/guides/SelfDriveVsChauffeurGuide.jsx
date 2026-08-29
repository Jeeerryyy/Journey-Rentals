/* Brex / Urbanist Design System — High-Citation Comparison Guide: Self-Drive vs Chauffeur */
import React from "react";
import { Link } from "react-router-dom";
import SEO from "../../components/seo/SEO";
import { FAQStructuredData, BreadcrumbStructuredData } from "../../components/seo/AdditiveSchemas";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Car,
  Clock,
  DollarSign,
  Fuel,
  Users,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/ui/accordion";

const FAQS = [
  {
    question: "Is self-drive cheaper than hiring a taxi with driver for Akkalkot and Pandharpur?",
    answer: "Yes, significantly. A typical outstation taxi charges ₹14–₹18 per km plus driver batta (₹300–₹500/day) and night charges, easily totaling ₹3,500–₹5,000 for a multi-temple day. A self-drive hatchback from Journey Rentals costs just ₹1,400/day (plus actual fuel), saving you 40–50% overall.",
  },
  {
    question: "What happens if our temple darshan takes longer than expected?",
    answer: "With a self-drive car, you have complete schedule control. There is no driver waiting meter, no rushed prayers, and no overtime hourly penalties. You decide when to depart, stop for meals, or attend evening Aarti.",
  },
  {
    question: "Are rental cars allowed into temple parking zones in Akkalkot, Pandharpur, and Tuljapur?",
    answer: "Yes. All Journey Rentals vehicles are registered tourist transport cars with commercial permits and Fastag, granting seamless entry into all municipal and devasthan parking facilities.",
  },
];

export default function SelfDriveVsChauffeurGuide() {
  const breadcrumbs = [
    { name: "Guides", url: "/guides/self-drive-vs-chauffeur-car-rental" },
    { name: "Self-Drive vs Chauffeur Car Rental", url: "/guides/self-drive-vs-chauffeur-car-rental" },
  ];

  return (
    <div className="min-h-screen bg-[#F6F5FA] text-[#212121] font-body no-scroll-x selection:bg-[#212121] selection:text-white">
      <SEO
        title="Self-Drive vs Chauffeur Car Rental in Solapur: Cost, Privacy & Flexibility"
        description="Detailed comparison of self-drive cars vs taxis with drivers in Solapur for Akkalkot, Pandharpur & Tuljapur temple trips. Compare costs, privacy, and flexibility."
        canonical="https://journeyrentals.in/guides/self-drive-vs-chauffeur-car-rental"
      />
      <BreadcrumbStructuredData items={breadcrumbs} />
      <FAQStructuredData faqs={FAQS} />

      <Navbar />

      <main className="pt-24 sm:pt-28 pb-16 space-y-12 sm:space-y-16 max-w-5xl mx-auto px-4 sm:px-6">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-xs text-[#6F6E73] flex items-center gap-1.5 font-medium">
          <Link to="/" className="hover:text-[#212121]">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#212121] font-bold">Self-Drive vs Chauffeur Guide</span>
        </nav>

        {/* Hero & Answer-First Section */}
        <article className="bg-white rounded-[24px] sm:rounded-[32px] border border-[#DFDCE8] p-6 sm:p-10 space-y-8 shadow-sm">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#82C4B7]/20 border border-[#82C4B7]/30 text-[#4B8039] text-xs font-bold font-mono uppercase tracking-wider">
              <span>Verified Comparison Guide</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#212121] tracking-tight leading-tight">
              Self-Drive vs Chauffeur Car Rental in Solapur: What's the Best Choice?
            </h1>
            <div className="text-xs text-[#6F6E73] font-mono flex items-center gap-4">
              <span>Published by Journey Rentals Editorial Team</span>
              <span>•</span>
              <span>Updated: August 2026</span>
            </div>
          </div>

          {/* Answer-First Executive Summary */}
          <div className="bg-[#F6F5FA] border-l-4 border-[#212121] rounded-2xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#212121] font-mono">
              <Sparkles size={14} className="text-[#e1b808]" />
              <span>Key Takeaway</span>
            </div>
            <p className="text-xs sm:text-sm text-[#212121] leading-relaxed font-medium">
              For family pilgrimage trips (Akkalkot, Tuljapur, Pandharpur) and leisure exploration around Solapur, <strong>self-drive car rental is 40% to 50% more affordable</strong> than chauffeur-driven cabs while offering 100% private family time, zero driver food/night allowance hassles, and absolute freedom over temple darshan timings. Chauffeur cabs are only recommended for solo travelers who do not possess an active driving license or prefer not to drive on highways.
            </p>
          </div>

          {/* Comparison Matrix Table */}
          <div className="space-y-4 pt-4">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#212121]">
              Side-by-Side Comparison Matrix
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-[#DFDCE8]">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#F6F5FA] text-[#212121] font-bold border-b border-[#DFDCE8]">
                  <tr>
                    <th className="p-3.5 sm:p-4">Feature / Aspect</th>
                    <th className="p-3.5 sm:p-4 text-[#4B8039]">Journey Rentals Self-Drive</th>
                    <th className="p-3.5 sm:p-4 text-[#E8826B]">Chauffeur / Tourist Cab</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFDCE8]">
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-[#212121]">Daily Rental Base</td>
                    <td className="p-3.5 sm:p-4 text-[#4B8039] font-semibold">From ₹1,400/day (Fixed 24 Hours)</td>
                    <td className="p-3.5 sm:p-4 text-[#6F6E73]">₹3,500 – ₹5,000/day (Distance + Time)</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-[#212121]">Driver Batta &amp; Food Charges</td>
                    <td className="p-3.5 sm:p-4 text-[#4B8039] font-semibold">₹0 (Zero Driver Allowance)</td>
                    <td className="p-3.5 sm:p-4 text-[#6F6E73]">₹300 – ₹500/day + Night Halt</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-[#212121]">Schedule Freedom</td>
                    <td className="p-3.5 sm:p-4 text-[#4B8039] font-semibold">100% Flexible — Stay as long as you want</td>
                    <td className="p-3.5 sm:p-4 text-[#6F6E73]">Driver hourly pressure &amp; overtime fees</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-[#212121]">Family Privacy</td>
                    <td className="p-3.5 sm:p-4 text-[#4B8039] font-semibold">100% Private (No stranger in the car)</td>
                    <td className="p-3.5 sm:p-4 text-[#6F6E73]">Driver present at all times</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-[#212121]">Advance Booking Token</td>
                    <td className="p-3.5 sm:p-4 text-[#4B8039] font-semibold">₹500 Online via Razorpay</td>
                    <td className="p-3.5 sm:p-4 text-[#6F6E73]">50% Advance or High Cash upfront</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Deep Content Analysis */}
          <div className="space-y-6 pt-4 text-xs sm:text-sm text-[#6F6E73] leading-relaxed font-medium">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#212121]">
              Why Devotees Prefer Self-Drive for Akkalkot, Pandharpur &amp; Tuljapur
            </h2>
            <p>
              Temple pilgrimage routes from Solapur often involve uncertain queue timings. At Pandharpur or Akkalkot during auspicious days (Thursday, Ekadashi, Navratri), darshan queues can take anywhere from 1 hour to over 4 hours. With a hired cab, taxi drivers often demand overtime compensation or urge devotees to hurry up.
            </p>
            <p>
              With a <strong>Journey Rentals self-drive car</strong>, you park at the designated temple trust parking lot, take your darshan in peace, enjoy Mahaprasad at your leisure, and move on to your next destination without any stress.
            </p>
          </div>

          {/* CTA Box */}
          <div className="p-6 rounded-2xl bg-[#212121] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-display text-lg font-bold">Ready to take the wheel in Solapur?</div>
              <div className="text-xs text-white/70">Reserve your sanitised self-drive car with station delivery from ₹1,400/day.</div>
            </div>
            <Link
              to="/fleet"
              className="bg-white text-[#212121] hover:bg-[#F6F5FA] px-5 py-2.5 rounded-full text-xs font-bold inline-flex items-center gap-2 transition-all shrink-0"
            >
              <span>Explore Fleet Catalog</span>
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
