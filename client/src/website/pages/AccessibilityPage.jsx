/* Brex / Urbanist Design System — Accessibility Statement */
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SEO from "../components/seo/SEO";
import { BreadcrumbStructuredData } from "../components/seo/AdditiveSchemas";
import {
  Eye,
  Heart,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Sliders,
  Keyboard,
  Monitor,
  Mail,
} from "lucide-react";

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-[#F6F5FA] text-[#212121] flex flex-col font-body selection:bg-[#212121] selection:text-white">
      <SEO
        title="Accessibility Statement | Journey Rentals Solapur"
        description="Learn about Journey Rentals commitment to digital accessibility conforming to WCAG 2.1 Level AA standards for accessible vehicle booking."
        canonical="/accessibility"
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "/" },
          { name: "Legal Hub", url: "/legal" },
          { name: "Accessibility", url: "/accessibility" },
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
              <span className="text-white font-bold">Accessibility Statement</span>
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20 mb-3">
                <Heart size={12} className="text-[#e1b808]" />
                Digital Inclusivity
              </span>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Accessibility Statement
              </h1>
              <p className="text-sm sm:text-base text-[#99989E] mt-2 max-w-2xl">
                Journey Rentals is committed to providing a seamless, barrier-free digital booking experience for all travelers, regardless of ability or assistive technology.
              </p>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12 space-y-8">
          <div className="bg-white border border-[#DFDCE8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="font-display text-base sm:text-lg font-bold text-[#212121] flex items-center gap-2">
              <Sparkles size={20} className="text-[#3F5F8C]" />
              Our Commitment &amp; Standards
            </h2>
            <p className="text-xs sm:text-sm text-[#6F6E73] leading-relaxed">
              We design and engineer <strong className="text-[#212121]">journeyrentals.in</strong> in accordance with the <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong>. These internationally recognized standards define best practices for making web content accessible to individuals with visual, auditory, motor, or cognitive disabilities.
            </p>
          </div>

          {/* Key Accessibility Measures */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-[#DFDCE8] rounded-2xl p-5 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8] flex items-center justify-center text-[#212121] mb-3">
                <Keyboard size={18} className="text-[#3F5F8C]" />
              </div>
              <h3 className="font-display text-sm font-bold text-[#212121]">
                Full Keyboard Navigation
              </h3>
              <p className="text-xs text-[#6F6E73] mt-1.5 leading-relaxed">
                All interactive search filters, datepickers, buttons, and checkout dialogs can be operated fully via keyboard tab stops with high-visibility focus indicators.
              </p>
            </div>

            <div className="bg-white border border-[#DFDCE8] rounded-2xl p-5 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8] flex items-center justify-center text-[#212121] mb-3">
                <Monitor size={18} className="text-[#4B8039]" />
              </div>
              <h3 className="font-display text-sm font-bold text-[#212121]">
                High Contrast &amp; Typography
              </h3>
              <p className="text-xs text-[#6F6E73] mt-1.5 leading-relaxed">
                We enforce contrast ratios exceeding 4.5:1 for standard body text against background tones, paired with scalable geometric sans fonts (Plus Jakarta Sans &amp; Urbanist).
              </p>
            </div>

            <div className="bg-white border border-[#DFDCE8] rounded-2xl p-5 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8] flex items-center justify-center text-[#212121] mb-3">
                <Eye size={18} className="text-[#916A00]" />
              </div>
              <h3 className="font-display text-sm font-bold text-[#212121]">
                Screen Reader Compatibility
              </h3>
              <p className="text-xs text-[#6F6E73] mt-1.5 leading-relaxed">
                Semantic HTML5 landmarks (`&lt;main&gt;`, `&lt;nav&gt;`, `&lt;section&gt;`), descriptive ARIA labels, and explicit image alternative text enable screen readers like NVDA and VoiceOver.
              </p>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="bg-[#212121] text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold">Feedback &amp; Assistance</h3>
              <p className="text-xs text-[#99989E] mt-1 max-w-xl">
                If you experience any accessibility hurdles while booking or navigating our platform, please reach out so our development team can promptly remediate it.
              </p>
            </div>
            <a
              href="mailto:rental.journeycars@gmail.com?subject=Accessibility%20Feedback%20-%20Journey%20Rentals"
              className="inline-flex items-center gap-2 bg-[#e1b808] text-[#212121] hover:bg-[#d0aa07] rounded-full px-5 py-2.5 text-xs font-bold transition-all shadow-sm shrink-0"
            >
              <Mail size={14} />
              <span>Send Accessibility Feedback</span>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
