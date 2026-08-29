/* Brex / Urbanist Design System — Master Cookie Policy */
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SEO from "../components/seo/SEO";
import { BreadcrumbStructuredData } from "../components/seo/AdditiveSchemas";
import {
  Cookie,
  ShieldCheck,
  Settings,
  ChevronRight,
  Lock,
  Database,
  Globe,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

const COOKIE_CATEGORIES = [
  {
    category: "Strictly Necessary Tokens & Session Identifiers",
    required: true,
    badge: "Essential",
    badgeColor: "bg-[#212121] text-white",
    description:
      "Required for platform security, user authentication, maintaining active booking sessions during checkout, and processing authorized payments via payment gateways.",
    storageItems: [
      { name: "Authentication Token", type: "HTTP-Only Cookie", duration: "7 Days", purpose: "Maintains authenticated customer session and account security." },
      { name: "Checkout Session Identifier", type: "Session Storage", duration: "Session Only", purpose: "Preserves selected vehicle, rental dates, and hub selection during checkout." },
      { name: "Security & Anti-CSRF Token", type: "HTTP-Only Cookie", duration: "Session Only", purpose: "Protects against unauthorized cross-site request forgery attacks." },
    ],
  },
  {
    category: "Functional & Preference Storage",
    required: false,
    badge: "Functional",
    badgeColor: "bg-[#CFDECA] text-[#4B8039]",
    description:
      "Remembers user interface preferences, such as selected vehicle categories, pickup location preferences, and cookie consent choices, ensuring a consistent user experience.",
    storageItems: [
      { name: "Location Preference", type: "Local Storage", duration: "30 Days", purpose: "Remembers default pickup hub or delivery location preference in Solapur." },
      { name: "Fleet Filter Preference", type: "Local Storage", duration: "30 Days", purpose: "Remembers vehicle filter selections (e.g., SUV, Hatchback, Bike)." },
      { name: "Consent Choice Record", type: "Local Storage", duration: "1 Year", purpose: "Stores user cookie consent choices and notification acknowledgements." },
    ],
  },
  {
    category: "Performance & Diagnostic Telemetry",
    required: false,
    badge: "Diagnostic",
    badgeColor: "bg-[#DFDCE8] text-[#212121]",
    description:
      "Collects aggregated, non-identifiable technical performance metrics and page latency diagnostics to optimize load speeds and identify system errors.",
    storageItems: [
      { name: "Performance Beacon", type: "Session Storage", duration: "Session Only", purpose: "Monitors page response times and Core Web Vitals performance." },
      { name: "Network Diagnostic Token", type: "Local Storage", duration: "24 Hours", purpose: "Detects degraded network connections to facilitate offline retry mechanisms." },
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#F6F5FA] text-[#212121] flex flex-col font-body selection:bg-[#212121] selection:text-white">
      <SEO
        title="Cookie Policy | Journey Rentals Solapur"
        description="Official Cookie Policy for Journey Rentals. Learn how we use essential session tokens, browser storage, and performance telemetry in compliance with DPDPA 2023."
        canonical="/cookie-policy"
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "/" },
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
              <span className="text-white font-bold">Cookie Policy</span>
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20 mb-3">
                <Cookie size={12} className="text-[#e1b808]" />
                Browser Storage &amp; Compliance
              </span>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Cookie Policy
              </h1>
              <p className="text-sm sm:text-base text-[#99989E] mt-2 max-w-2xl">
                Transparency regarding how Journey Rentals uses HTTP cookies and browser storage technologies to provide secure, instant self-drive vehicle reservations in Solapur.
              </p>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12 space-y-8">
          {/* Overview Statement */}
          <div className="bg-white border border-[#DFDCE8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#CFDECA]/40 flex items-center justify-center text-[#4B8039]">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h2 className="font-display text-base sm:text-lg font-bold text-[#212121]">
                  1. What Are Cookies &amp; Web Storage?
                </h2>
                <p className="text-xs text-[#99989E]">Digital Personal Data Protection Act (DPDPA 2023) Alignment</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed">
              Cookies and modern web storage (Local Storage and Session Storage) are lightweight data tokens stored in your web browser when visiting <strong className="text-[#212121]">journeyrentals.in</strong>. They allow our systems to recognize your logged-in customer profile, preserve selected booking dates across the reservation workflow, and secure payment transactions with Razorpay without requiring repetitive credentials.
            </p>
            <div className="p-4 rounded-2xl bg-[#F6F5FA] border border-[#DFDCE8] text-xs text-[#212121] flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-[#4B8039] shrink-0 mt-0.5" />
              <span>
                <strong>Zero Cross-Site Ad Tracking:</strong> Journey Rentals does not sell your browsing habits or deploy invasive third-party cross-site advertising trackers. Storage is strictly functional and operational.
              </span>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h2 className="font-display text-base sm:text-lg font-bold text-[#212121]">
                2. Storage Inventory &amp; Categorization
              </h2>
              <span className="text-xs text-[#99989E] font-mono">Last Reviewed: Q3 2026</span>
            </div>

            <div className="space-y-4">
              {COOKIE_CATEGORIES.map((cat, idx) => (
                <div
                  key={cat.category}
                  className="bg-white border border-[#DFDCE8] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#212121] text-white flex items-center justify-center font-bold text-xs font-mono">
                        0{idx + 1}
                      </div>
                      <h3 className="font-display text-sm sm:text-base font-bold text-[#212121]">
                        {cat.category}
                      </h3>
                    </div>
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${cat.badgeColor}`}>
                      {cat.badge}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed">
                    {cat.description}
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#DFDCE8] text-[#99989E] font-mono uppercase text-[10px]">
                          <th className="py-2 pr-4">Token Name</th>
                          <th className="py-2 pr-4">Type</th>
                          <th className="py-2 pr-4">Duration</th>
                          <th className="py-2">Operational Purpose</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DFDCE8]/60 font-mono text-[11px]">
                        {cat.storageItems.map((item) => (
                          <tr key={item.name} className="hover:bg-[#F6F5FA]/50 transition-colors">
                            <td className="py-2.5 pr-4 font-bold text-[#212121]">{item.name}</td>
                            <td className="py-2.5 pr-4 text-[#6F6E73]">{item.type}</td>
                            <td className="py-2.5 pr-4 text-[#6F6E73]">{item.duration}</td>
                            <td className="py-2.5 text-[#212121] font-sans">{item.purpose}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Third-Party Service Providers */}
          <div className="bg-white border border-[#DFDCE8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="font-display text-base sm:text-lg font-bold text-[#212121] flex items-center gap-2">
              <Globe size={18} className="text-[#3F5F8C]" />
              3. Third-Party Payment &amp; Cloud Sub-Processors
            </h2>
            <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed">
              When completing an online booking transaction, authorized third-party integrations may set operational tokens necessary to guarantee fraud detection, security, and payment processing:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-[#F6F5FA] border border-[#DFDCE8] space-y-1">
                <div className="font-bold text-[#212121] flex items-center justify-between">
                  <span>Razorpay Software Pvt Ltd</span>
                  <span className="text-[10px] font-mono text-[#4B8039] font-bold">PCI-DSS L1</span>
                </div>
                <p className="text-[#6F6E73] text-[11px]">
                  Sets security tokens to verify payment integrity and prevent fraudulent card or UPI transactions.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#F6F5FA] border border-[#DFDCE8] space-y-1">
                <div className="font-bold text-[#212121] flex items-center justify-between">
                  <span>Cloudflare &amp; AWS Infrastructure</span>
                  <span className="text-[10px] font-mono text-[#3F5F8C] font-bold">SOC 2 / ISO 27001</span>
                </div>
                <p className="text-[#6F6E73] text-[11px]">
                  Provides DDoS protection, SSL edge termination, and fast asset caching across Maharashtra.
                </p>
              </div>
            </div>
          </div>

          {/* How You Can Control Browser Cookies */}
          <div className="bg-white border border-[#DFDCE8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="font-display text-base sm:text-lg font-bold text-[#212121] flex items-center gap-2">
              <Settings size={18} className="text-[#e1b808]" />
              4. Managing &amp; Disabling Cookies in Your Browser
            </h2>
            <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed">
              Every major modern web browser provides controls to inspect, restrict, or clear stored cookies and web tokens. If you prefer to disable cookies, you may do so through your browser settings:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl border border-[#DFDCE8] bg-white">
                <div className="font-bold text-[#212121] mb-1">Google Chrome &amp; Brave</div>
                <p className="text-[#6F6E73] text-[11px] font-mono">Settings &gt; Privacy and security &gt; Third-party cookies</p>
              </div>
              <div className="p-3.5 rounded-2xl border border-[#DFDCE8] bg-white">
                <div className="font-bold text-[#212121] mb-1">Apple Safari (iOS / macOS)</div>
                <p className="text-[#6F6E73] text-[11px] font-mono">Settings &gt; Safari &gt; Advanced &gt; Privacy &amp; Cookies</p>
              </div>
              <div className="p-3.5 rounded-2xl border border-[#DFDCE8] bg-white">
                <div className="font-bold text-[#212121] mb-1">Mozilla Firefox</div>
                <p className="text-[#6F6E73] text-[11px] font-mono">Settings &gt; Privacy &amp; Security &gt; Enhanced Tracking</p>
              </div>
              <div className="p-3.5 rounded-2xl border border-[#DFDCE8] bg-white">
                <div className="font-bold text-[#212121] mb-1">Microsoft Edge</div>
                <p className="text-[#6F6E73] text-[11px] font-mono">Settings &gt; Cookies and site permissions &gt; Manage</p>
              </div>
            </div>
            <p className="text-xs text-[#99989E] italic">
              *Note: Disabling strictly necessary session tokens will prevent customer login authentication and online reservation checkout on journeyrentals.in.
            </p>
          </div>

          {/* Grievance & Contact */}
          <div className="bg-[#212121] text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <HelpCircle size={18} className="text-[#e1b808]" />
                Questions Regarding Our Cookie Practices?
              </h3>
              <p className="text-xs text-[#99989E] max-w-xl">
                Contact our Data Protection Officer for inquiries concerning stored browser tokens, telemetry policies, or DPDPA 2023 compliance.
              </p>
            </div>
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/20 shrink-0"
            >
              <span>Contact Support</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
