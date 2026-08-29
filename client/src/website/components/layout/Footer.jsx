/* Brex / Urbanist Design System — Exact 1:1 DriveHub Goa Parity */
import React, { useState } from "react";
import { MapPin, Phone, Mail, FileText, Lock, Cookie, MessageCircle, HelpCircle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import BrandLogo from "../BrandLogo";
import { TermsModal, NdaModal } from "../LegalModals";
import { openCookiePreferences } from "../../utils/cookieConsent";

export default function Footer() {
  const [showTerms, setShowTerms] = useState(false);
  const [showNda, setShowNda] = useState(false);

  return (
    <>
      <footer className="bg-[#212121] text-[#FFFFFF] pt-12 sm:pt-16 pb-8 sm:pb-10 border-t border-[#141414] relative font-body text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-10 pb-8 sm:pb-12 border-b border-white/10">
            {/* Col 1 & 2: Brand Info */}
            <div className="col-span-2 lg:col-span-2 space-y-4 text-left">
              <div className="flex items-center gap-3">
                <BrandLogo variant="white" size="lg" />
              </div>

              <p className="text-sm text-[#99989E] leading-relaxed max-w-sm font-normal">
                Solapur's premier verified self-drive car and hourly bike rental agency. Clean sanitized vehicles, doorstep delivery across Solapur city, direct railway station handover, and transparent pricing with zero deposit stress.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://wa.me/919604437794"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-[#141414] hover:bg-[#e1b808] hover:text-[#212121] border border-white/10 text-white flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 group"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={15} className="text-[#e1b808] group-hover:text-[#212121]" />
                </a>
                <a
                  href="tel:+919604437794"
                  className="w-10 h-10 rounded-full bg-[#141414] hover:bg-[#e1b808] hover:text-[#212121] border border-white/10 text-white flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 group"
                  aria-label="Call"
                >
                  <Phone size={15} className="text-[#e1b808] group-hover:text-[#212121]" />
                </a>
                <a
                  href="mailto:rental.journeycars@gmail.com"
                  className="w-10 h-10 rounded-full bg-[#141414] hover:bg-[#e1b808] hover:text-[#212121] border border-white/10 text-white flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 group"
                  aria-label="Email"
                >
                  <Mail size={15} className="text-[#e1b808] group-hover:text-[#212121]" />
                </a>
              </div>
            </div>

            {/* Col 3: Vehicle Categories */}
            <div className="space-y-3.5 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">
                Vehicle Classes
              </h4>
              <ul className="space-y-2 text-xs text-[#99989E] font-normal">
                <li>
                  <Link to="/fleet" className="hover:text-[#e1b808] hover:underline transition-colors">Complete 30+ Fleet</Link>
                </li>
                <li>
                  <Link to="/car-rental/suv-7-seater" className="hover:text-[#e1b808] hover:underline transition-colors">7-Seater MPVs &amp; Thar 4x4</Link>
                </li>
                <li>
                  <Link to="/car-rental/hatchback-economy" className="hover:text-[#e1b808] hover:underline transition-colors">Budget Swift &amp; Hatchbacks</Link>
                </li>
                <li>
                  <Link to="/car-rental/sedan" className="hover:text-[#e1b808] hover:underline transition-colors">Executive Dzire &amp; Sedans</Link>
                </li>
                <li>
                  <Link to="/bike-rental/hourly-bikes" className="hover:text-[#e1b808] hover:underline transition-colors">Hourly Scooters &amp; Bikes</Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-[#e1b808] hover:underline transition-colors">About Us &amp; FAQs</Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Handover Hubs & Temple Routes */}
            <div className="space-y-3.5 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">
                Hubs &amp; Temple Routes
              </h4>
              <ul className="space-y-2 text-xs text-[#99989E] font-normal">
                <li>
                  <Link to="/locations/solapur-railway-station" className="hover:text-[#e1b808] hover:underline transition-colors flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#e1b808] shrink-0" />
                    <span>Solapur Railway Station</span>
                  </Link>
                </li>
                <li>
                  <Link to="/locations/pandharpur-temple-trip" className="hover:text-[#e1b808] hover:underline transition-colors flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#e1b808] shrink-0" />
                    <span>Pandharpur Vitthal Mandir</span>
                  </Link>
                </li>
                <li>
                  <Link to="/locations/akkalkot-temple-trip" className="hover:text-[#e1b808] hover:underline transition-colors flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#e1b808] shrink-0" />
                    <span>Akkalkot Swami Samarth</span>
                  </Link>
                </li>
                <li>
                  <Link to="/locations/tuljapur-temple-trip" className="hover:text-[#e1b808] hover:underline transition-colors flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#e1b808] shrink-0" />
                    <span>Tuljapur Bhavani Mata</span>
                  </Link>
                </li>
                <li>
                  <Link to="/locations/hotgi-road-airport" className="hover:text-[#e1b808] hover:underline transition-colors flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#e1b808] shrink-0" />
                    <span>Hotgi Road &amp; Airport Hub</span>
                  </Link>
                </li>
                <li>
                  <Link to="/locations/vijapur-road" className="hover:text-[#e1b808] hover:underline transition-colors flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#e1b808] shrink-0" />
                    <span>Vijapur Road Hub</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 5: Travel Guides & Contact */}
            <div className="space-y-3.5 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">
                Guides &amp; Contact
              </h4>
              <div className="space-y-2 text-xs text-[#99989E]">
                <div>
                  <Link to="/guides/self-drive-vs-chauffeur-car-rental" className="hover:text-[#e1b808] hover:underline transition-colors block">
                    Self-Drive vs Chauffeur Cab
                  </Link>
                </div>
                <div>
                  <Link to="/guides/documents-required-self-drive-car-rental" className="hover:text-[#e1b808] hover:underline transition-colors block">
                    Documents &amp; KYC Guide
                  </Link>
                </div>
                <div>
                  <Link to="/guides/solapur-to-akkalkot-pandharpur-road-trip" className="hover:text-[#e1b808] hover:underline transition-colors block">
                    Temple Pilgrimage Circuit
                  </Link>
                </div>
                <div className="pt-2">
                  <a href="tel:+919604437794" className="hover:text-[#e1b808] transition-colors flex items-center gap-2 font-bold text-[#FFFFFF]">
                    <Phone size={13} className="text-[#e1b808]" />
                    <span>+91 96044 37794</span>
                  </a>
                </div>
                <div>
                  <a href="mailto:rental.journeycars@gmail.com" className="hover:text-[#e1b808] transition-colors flex items-center gap-2 text-[#99989E]">
                    <Mail size={13} className="text-[#e1b808]" />
                    <span className="truncate">rental.journeycars@gmail.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Compliance */}
          <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#99989E]">
            <div>
              &copy; {new Date().getFullYear()} Journey Rentals. All rights reserved. Self-Drive Car &amp; Hourly Bike Rentals in Solapur, Maharashtra.
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
              <Link to="/terms" className="hover:text-[#e1b808] hover:underline flex items-center gap-1">
                <FileText size={12} className="text-[#e1b808]" /> Terms &amp; Conditions
              </Link>
              <span>•</span>
              <Link to="/privacy-policy" className="hover:text-[#e1b808] hover:underline flex items-center gap-1">
                <Lock size={12} className="text-[#e1b808]" /> Privacy Policy
              </Link>
              <span>•</span>
              <Link to="/cookie-policy" className="hover:text-[#e1b808] hover:underline flex items-center gap-1">
                Cookie Policy
              </Link>
              <span>•</span>
              <Link to="/accessibility" className="hover:text-[#e1b808] hover:underline flex items-center gap-1">
                Accessibility
              </Link>
              <span>•</span>
              <button
                type="button"
                onClick={openCookiePreferences}
                className="hover:text-[#e1b808] hover:underline cursor-pointer flex items-center gap-1"
                data-testid="footer-cookie-preferences-btn"
              >
                <Cookie size={12} className="text-[#e1b808]" /> Cookie Preferences
              </button>
            </div>
          </div>

          <div className="text-center sm:text-left text-[11px] text-[#99989E]/80 pt-4 mt-4 border-t border-white/5 w-full flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              MoRTH Registered · Unlimited Km Self-Drive Fleet · Solapur, MH
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span>
                Designed by{" "}
                <a
                  href="https://nirvanaastudious.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#e1b808] font-semibold transition-colors underline decoration-white/20 hover:decoration-[#e1b808]"
                >
                  Nirvanaa Studios
                </a>
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="font-mono text-[10px] text-[#99989E]/60">
                PCI-DSS Level 1 · DPDPA 2023 Compliant
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TermsModal open={showTerms} onOpenChange={setShowTerms} />
      <NdaModal open={showNda} onOpenChange={setShowNda} />
    </>
  );
}
