/* Brex / Urbanist Design System — Cookie Policy */
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SEO from "../components/seo/SEO";
import { BreadcrumbStructuredData } from "../components/seo/AdditiveSchemas";
import {
  Cookie,
  ShieldCheck,
  Sliders,
  Settings,
  ChevronRight,
  Lock,
  Eye,
  Server,
} from "lucide-react";
import { Button } from "@/ui/button";

const COOKIE_TYPES = [
  {
    type: "Strictly Necessary Cookies & Tokens",
    required: true,
    description: "Crucial for authenticating your customer session, keeping your reservation active, and enabling secure payment callbacks via Razorpay.",
    examples: ["jr_token (HTTP-Only Auth)", "jr_customer_token", "booking_session_id"],
  },
  {
    type: "Functional & Preference Cookies",
    required: false,
    description: "Remembers your preferred pickup hub in Solapur, selected vehicle filter categories (SUV vs Hatchback vs Bike), and language settings.",
    examples: ["preferred_hub", "vehicle_filter_pref", "cookie_consent_choice"],
  },
  {
    type: "Performance & Diagnostic Analytics",
    required: false,
    description: "Anonymized page latency logs and network metrics that help our engineering team keep booking checkout load times under 1.5 seconds.",
    examples: ["_jr_perf_beacon", "page_load_timing"],
  },
];

export default function CookiePolicyPage() {
  const openPreferences = () => {
    // Trigger custom event to open cookie banner preferences
    window.dispatchEvent(new CustomEvent("open-cookie-preferences"));
  };

  return (
    <div className="min-h-screen bg-[#F6F5FA] text-[#212121] flex flex-col font-body selection:bg-[#212121] selection:text-white">
      <SEO
        title="Cookie Policy & Preferences | Journey Rentals Solapur"
        description="Learn how Journey Rentals uses essential session cookies, local storage tokens, and preference controls to provide a seamless vehicle booking experience."
        canonical="/cookie-policy"
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "/" },
          { name: "Legal Hub", url: "/legal" },
          { name: "Cookie Policy", url: "/cookie-policy" },
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
              <Link to="/legal" className="hover:text-white transition-colors">Legal Hub</Link>
              <ChevronRight size={12} />
              <span className="text-white font-bold">Cookie Policy</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20 mb-3">
                  <Cookie size={12} className="text-[#e1b808]" />
                  Browser Storage &amp; Cookies
                </span>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                  Cookie Policy &amp; Preferences
                </h1>
                <p className="text-sm sm:text-base text-[#99989E] mt-2 max-w-2xl">
                  Transparency regarding how we use HTTP cookies and browser storage to power self-drive car reservations in Solapur.
                </p>
              </div>

              <div className="shrink-0">
                <Button
                  onClick={openPreferences}
                  className="rounded-full bg-[#e1b808] hover:bg-[#d0aa07] text-[#212121] font-bold text-xs h-10 px-5 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Sliders size={14} />
                  <span>Manage Preferences</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12 space-y-8">
          {/* Overview */}
          <div className="bg-white border border-[#DFDCE8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="font-display text-base sm:text-lg font-bold text-[#212121]">
              What Are Cookies &amp; Local Storage?
            </h2>
            <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed">
              Cookies and web storage tokens are small text files placed on your browser or device when you visit <strong className="text-[#212121]">journeyrentals.in</strong>. They allow our systems to recognize your logged-in customer account, securely save your selected vehicle dates across checkout pages, and ensure instant verification without repeated logins.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="space-y-4">
            <h2 className="font-display text-base sm:text-lg font-bold text-[#212121]">
              Categories of Cookies We Use
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {COOKIE_TYPES.map((item) => (
                <div
                  key={item.type}
                  className="bg-white border border-[#DFDCE8] rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.required ? 'bg-[#212121] text-white' : 'bg-[#CFDECA] text-[#4B8039]'}`}>
                        {item.required ? 'Always Active' : 'Configurable'}
                      </span>
                    </div>
                    <h3 className="font-display text-sm font-bold text-[#212121]">
                      {item.type}
                    </h3>
                    <p className="text-xs text-[#6F6E73] mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#DFDCE8] font-mono text-[11px] text-[#99989E]">
                    <div className="font-bold text-[#212121] mb-1">Key items:</div>
                    <div className="space-y-0.5">
                      {item.examples.map(ex => (
                        <div key={ex} className="truncate">• {ex}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How to control cookies */}
          <div className="bg-white border border-[#DFDCE8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="font-display text-base sm:text-lg font-bold text-[#212121] flex items-center gap-2">
              <Settings size={20} className="text-[#3F5F8C]" />
              How You Can Control Browser Cookies
            </h2>
            <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed">
              Most modern web browsers (Google Chrome, Apple Safari, Microsoft Edge, Mozilla Firefox) automatically accept cookies. You can manage or disable non-essential cookies at any time:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#212121]">
              <li>Use the <strong>"Manage Preferences"</strong> button on this page to toggle functional or analytics cookies.</li>
              <li>Block third-party cookies directly within your browser settings under <em>Privacy &amp; Security &gt; Cookies and site data</em>.</li>
              <li>Clear browsing history and stored session tokens whenever you complete a reservation on a public device.</li>
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
