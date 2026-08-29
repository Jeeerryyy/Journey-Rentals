/* Brex / Urbanist Design System — Reusable High-Authority Hub & Category Landing Template */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "./seo/SEO";
import { FAQStructuredData, BreadcrumbStructuredData, WebSiteSearchSchema } from "./seo/AdditiveSchemas";
import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";
import {
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Zap,
  Car,
  Bike,
  Users,
  Fuel,
  ArrowRight,
  Phone,
  MessageCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Shield,
  FileCheck,
  Check,
} from "lucide-react";
import { Button } from "@/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/ui/accordion";
import { formatINR } from "@/lib/api";

export default function HubLandingTemplate({
  seoTitle,
  seoDescription,
  canonicalUrl,
  badgeText = "VERIFIED SELF-DRIVE SERVICE",
  heroHeading,
  heroSubheading,
  answerFirstSummary,
  quickFacts = [],
  marathiSection = null,
  recommendedVehicles = [],
  routeHighlights = [],
  faqs = [],
  breadcrumbs = [],
  ctaVehicleCategory = "All",
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F6F5FA] text-[#212121] font-body no-scroll-x selection:bg-[#212121] selection:text-white">
      {/* SEO & OpenGraph */}
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={canonicalUrl}
      />
      <BreadcrumbStructuredData items={breadcrumbs} />
      <FAQStructuredData faqs={faqs} />
      <WebSiteSearchSchema />

      <Navbar />

      <main className="pt-24 sm:pt-28 pb-16 space-y-12 sm:space-y-16 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Bar */}
        <nav aria-label="Breadcrumb" className="text-xs text-[#6F6E73] flex items-center gap-1.5 font-medium">
          <Link to="/" className="hover:text-[#212121] transition-colors">Home</Link>
          <ChevronRight size={12} />
          {breadcrumbs.slice(0, -1).map((b, idx) => (
            <React.Fragment key={idx}>
              <Link to={b.url} className="hover:text-[#212121] transition-colors">{b.name}</Link>
              <ChevronRight size={12} />
            </React.Fragment>
          ))}
          <span className="text-[#212121] font-bold truncate">{breadcrumbs[breadcrumbs.length - 1]?.name || heroHeading}</span>
        </nav>

        {/* ── 1. HERO SECTION & ANSWER-FIRST DIRECT SUMMARY ────────────────────────── */}
        <section className="bg-white rounded-[24px] sm:rounded-[32px] border border-[#DFDCE8] p-6 sm:p-10 lg:p-12 shadow-sm space-y-8">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#82C4B7]/20 border border-[#82C4B7]/30 text-[#4B8039] text-xs font-bold font-mono uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4B8039] animate-pulse" />
              {badgeText}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#212121] tracking-tight leading-[1.15]">
              {heroHeading}
            </h1>

            <p className="text-sm sm:text-base text-[#6F6E73] font-medium leading-relaxed">
              {heroSubheading}
            </p>
          </div>

          {/* Answer-First High-Citation Executive Summary Block (GEO Engineered) */}
          <div className="bg-[#F6F5FA] border-l-4 border-[#212121] rounded-2xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#212121] font-mono">
              <Sparkles size={14} className="text-[#e1b808]" />
              <span>Direct Summary &amp; Booking Essentials</span>
            </div>
            <p className="text-xs sm:text-sm text-[#212121] leading-relaxed font-medium">
              {answerFirstSummary}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to={`/fleet${ctaVehicleCategory !== "All" ? `?category=${ctaVehicleCategory}` : ""}`}
                className="bg-[#212121] hover:bg-[#141414] text-white px-5 py-2.5 rounded-full text-xs font-bold inline-flex items-center gap-2 transition-all shadow-xs"
              >
                <span>Browse Available Fleet</span>
                <ArrowRight size={14} className="text-[#e1b808]" />
              </Link>
              <a
                href="https://wa.me/919604437794?text=Hello%20Journey%20Rentals,%20I%20want%20to%20inquire%20about%20vehicle%20rental"
                target="_blank"
                rel="noreferrer"
                className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2.5 rounded-full text-xs font-bold inline-flex items-center gap-2 transition-all shadow-xs"
              >
                <MessageCircle size={14} />
                <span>WhatsApp Instant Inquiry</span>
              </a>
            </div>
          </div>

          {/* Quick Facts Grid */}
          {quickFacts && quickFacts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
              {quickFacts.map((fact, idx) => (
                <div key={idx} className="p-3.5 sm:p-4 rounded-2xl bg-[#F6F5FA] border border-[#DFDCE8] space-y-1">
                  <div className="text-[10px] sm:text-[11px] font-bold uppercase text-[#6F6E73] font-mono">{fact.label}</div>
                  <div className="font-bold text-xs sm:text-sm text-[#212121]">{fact.value}</div>
                  {fact.subtext && <div className="text-[10px] text-[#6F6E73]">{fact.subtext}</div>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 2. BILINGUAL MARATHI PILGRIMAGE SECTION (FOR TEMPLE ROUTES) ───────── */}
        {marathiSection && (
          <section className="bg-gradient-to-br from-[#FFFBE6] to-[#FFF7D6] rounded-[24px] sm:rounded-[32px] border border-[#FFE58F] p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚩</span>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#874D00]">
                {marathiSection.title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#593800] leading-relaxed font-medium">
              {marathiSection.description}
            </p>
            {marathiSection.bulletPoints && (
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                {marathiSection.bulletPoints.map((pt, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white/80 p-3 rounded-xl border border-[#FFE58F] text-xs text-[#593800] font-medium">
                    <CheckCircle2 size={15} className="text-[#874D00] shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── 3. RECOMMENDED VEHICLES FOR THIS ROUTE / CATEGORY ──────────────────── */}
        {recommendedVehicles && recommendedVehicles.length > 0 && (
          <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#212121]">
                  Recommended Fleet Options
                </h2>
                <p className="text-xs sm:text-sm text-[#6F6E73] font-medium mt-1">
                  Sanitized, verified, and commercial permit ready vehicles with transparent pricing
                </p>
              </div>
              <Link
                to="/fleet"
                className="text-xs font-bold text-[#212121] hover:underline inline-flex items-center gap-1"
              >
                <span>View Full 30+ Fleet Catalog</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendedVehicles.map((veh, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-[#DFDCE8] p-5 shadow-2xs hover:shadow-sm transition-all space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F6F5FA] border border-[#DFDCE8] text-[#6F6E73] uppercase font-mono">
                        {veh.category}
                      </span>
                      <span className="text-xs font-bold text-[#4B8039]">{veh.fuelType}</span>
                    </div>
                    <div className="font-display text-lg font-bold text-[#212121]">{veh.name}</div>
                    <p className="text-xs text-[#6F6E73] line-clamp-2">{veh.description}</p>
                  </div>

                  <div className="pt-3 border-t border-[#DFDCE8] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[#6F6E73] font-mono">Daily Rate</div>
                      <div className="font-display text-base font-extrabold text-[#212121]">{formatINR(veh.dailyRate)}<span className="text-xs font-normal text-[#6F6E73]">/day</span></div>
                    </div>
                    <Link
                      to="/fleet"
                      className="bg-[#212121] hover:bg-[#141414] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      Reserve Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 4. ROUTE HIGHLIGHTS & TRAVEL INFORMATION ───────────────────────────── */}
        {routeHighlights && routeHighlights.length > 0 && (
          <section className="bg-white rounded-[24px] sm:rounded-[32px] border border-[#DFDCE8] p-6 sm:p-10 space-y-6">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#212121]">
              Route Details, Road Conditions &amp; Tips
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {routeHighlights.map((hl, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-[#F6F5FA] border border-[#DFDCE8] space-y-2">
                  <div className="font-bold text-sm text-[#212121] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#212121] text-white text-xs flex items-center justify-center font-mono">{idx + 1}</span>
                    <span>{hl.title}</span>
                  </div>
                  <p className="text-xs text-[#6F6E73] leading-relaxed font-medium">{hl.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 5. LOCAL SEO & GOOGLE BUSINESS PROFILE NAP CARD ────────────────────── */}
        <section className="bg-white rounded-[24px] sm:rounded-[32px] border border-[#DFDCE8] p-6 sm:p-10 space-y-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="space-y-3 max-w-lg">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#82C4B7]/20 text-[#4B8039] text-[10px] font-bold uppercase tracking-wider font-mono">
                <MapPin size={12} />
                <span>Verified Physical Dispatch Hub</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#212121]">
                Journey Rentals Solapur Dispatch Office
              </h2>
              <div className="text-xs sm:text-sm text-[#6F6E73] space-y-1.5 font-medium">
                <div><strong>Address:</strong> Near Solapur Railway Station, Hotgi Road, Solapur, Maharashtra 413001</div>
                <div><strong>Phone / Hotline:</strong> +91 96044 37794</div>
                <div><strong>Operating Hours:</strong> 06:00 AM – 11:00 PM (Monday to Sunday)</div>
                <div><strong>Delivery Radius:</strong> Railway Station (Platform 1), Hotgi Road, Vijapur Road, Akkalkot Road, and Doorstep Solapur City.</div>
              </div>
              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href="tel:+919604437794"
                  className="bg-[#212121] hover:bg-[#141414] text-white px-4 py-2.5 rounded-full text-xs font-bold inline-flex items-center gap-2 transition-all shadow-xs"
                >
                  <Phone size={13} />
                  <span>Call +91 96044 37794</span>
                </a>
                <a
                  href="https://maps.google.com/?q=Solapur+Railway+Station+Maharashtra+413001"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white border border-[#DFDCE8] hover:bg-[#F6F5FA] text-[#212121] px-4 py-2.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs"
                >
                  <MapPin size={13} className="text-[#E8826B]" />
                  <span>Open in Google Maps</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            {/* Embedded Google Map */}
            <div className="w-full md:w-80 lg:w-96 h-56 sm:h-64 rounded-2xl overflow-hidden border border-[#DFDCE8] shrink-0 bg-[#F6F5FA]">
              <iframe
                title="Journey Rentals Solapur Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3801.4423854124976!2d75.9042!3d17.6599!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc5db08466b0f19%3A0xb35a09b4dbcb97a!2sSolapur%20Railway%20Station!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

        {/* ── 6. FREQUENTLY ASKED QUESTIONS (GENUINE USER & GEO ANSWERS) ─────────── */}
        {faqs && faqs.length > 0 && (
          <section className="bg-white rounded-[24px] sm:rounded-[32px] border border-[#DFDCE8] p-6 sm:p-10 space-y-6">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#212121]">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-[#6F6E73] font-medium mt-1">
                Clear answers regarding vehicle handover, documents, fuel, and temple travel
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, idx) => (
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
          </section>
        )}

        {/* ── 7. INTERNAL LINKING HUB DIRECTORY ─────────────────────────────────── */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#F6F5FA] border border-[#DFDCE8] space-y-4">
          <div className="text-xs font-bold uppercase text-[#6F6E73] font-mono tracking-wider">
            Explore More Solapur Vehicle Services
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs font-medium">
            <Link to="/locations/solapur-railway-station" className="p-2.5 rounded-xl bg-white border border-[#DFDCE8] text-[#212121] hover:border-[#212121] transition-colors truncate">
              📍 Solapur Station Car Handover
            </Link>
            <Link to="/locations/pandharpur-temple-trip" className="p-2.5 rounded-xl bg-white border border-[#DFDCE8] text-[#212121] hover:border-[#212121] transition-colors truncate">
              🚩 Pandharpur Vitthal Temple Tour
            </Link>
            <Link to="/locations/akkalkot-temple-trip" className="p-2.5 rounded-xl bg-white border border-[#DFDCE8] text-[#212121] hover:border-[#212121] transition-colors truncate">
              🚩 Akkalkot Swami Samarth Darshan
            </Link>
            <Link to="/locations/tuljapur-temple-trip" className="p-2.5 rounded-xl bg-white border border-[#DFDCE8] text-[#212121] hover:border-[#212121] transition-colors truncate">
              🚩 Tuljapur Bhavani Temple Car
            </Link>
            <Link to="/car-rental/suv-7-seater" className="p-2.5 rounded-xl bg-white border border-[#DFDCE8] text-[#212121] hover:border-[#212121] transition-colors truncate">
              🚙 7-Seater Ertiga &amp; SUV Rental
            </Link>
            <Link to="/car-rental/hatchback-economy" className="p-2.5 rounded-xl bg-white border border-[#DFDCE8] text-[#212121] hover:border-[#212121] transition-colors truncate">
              🚗 Swift &amp; i10 Budget Hatchbacks
            </Link>
            <Link to="/bike-rental/hourly-bikes" className="p-2.5 rounded-xl bg-white border border-[#DFDCE8] text-[#212121] hover:border-[#212121] transition-colors truncate">
              🛵 Hourly Activa &amp; Bike Rentals
            </Link>
            <Link to="/guides/self-drive-vs-chauffeur-car-rental" className="p-2.5 rounded-xl bg-white border border-[#DFDCE8] text-[#212121] hover:border-[#212121] transition-colors truncate">
              📖 Self-Drive vs Chauffeur Guide
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
