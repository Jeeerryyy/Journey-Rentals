/* Brex / Urbanist Design System — Exact 1:1 DriveHub Goa Parity */
import React, { useState } from "react";
import { MapPin, Phone, Mail, FileText, Lock, Cookie, MessageCircle, HelpCircle } from "lucide-react";
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

            {/* Col 3: Quick Links */}
            <div className="space-y-3.5 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">
                Quick Links
              </h4>
              <ul className="space-y-2.5 text-xs text-[#99989E] font-normal">
                <li>
                  <Link to="/" className="hover:text-[#e1b808] hover:underline transition-colors">Home</Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-[#e1b808] hover:underline transition-colors">About Us &amp; FAQs</Link>
                </li>
                <li>
                  <Link to="/fleet" className="hover:text-[#e1b808] hover:underline transition-colors">All Vehicles</Link>
                </li>
                <li>
                  <Link to="/fleet?category=SUV" className="hover:text-[#e1b808] hover:underline transition-colors">SUVs &amp; 4x4 Thar</Link>
                </li>
                <li>
                  <Link to="/fleet?category=Hatchback" className="hover:text-[#e1b808] hover:underline transition-colors">Hatchbacks</Link>
                </li>
                <li>
                  <Link to="/fleet?type=bike" className="hover:text-[#e1b808] hover:underline transition-colors">Hourly &amp; Daily Bikes</Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={openCookiePreferences}
                    className="hover:text-[#e1b808] hover:underline transition-colors text-left flex items-center gap-1 cursor-pointer"
                  >
                    <span>Cookie Preferences</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Service Areas */}
            <div className="space-y-3.5 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">
                Solapur Coverage
              </h4>
              <ul className="space-y-2 text-xs text-[#99989E] font-normal">
                <li className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#e1b808] shrink-0" />
                  <span>Solapur Railway Station</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#e1b808] shrink-0" />
                  <span>Hotgi Road &amp; Airport Hub</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#e1b808] shrink-0" />
                  <span>Vijapur Road Hub</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#e1b808] shrink-0" />
                  <span>Akkalkot Swami Samarth</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#e1b808] shrink-0" />
                  <span>Pandharpur Vitthal Temple</span>
                </li>
              </ul>
            </div>

            {/* Col 5: Contact & Operations */}
            <div className="space-y-3.5 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">
                Direct Contact
              </h4>
              <div className="space-y-2.5 text-xs text-[#99989E]">
                <div className="text-[#FFFFFF] font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#CFDECA]" />
                  <span>Journey Rentals <span className="text-[11px] text-[#99989E] font-normal">(Solapur HQ)</span></span>
                </div>
                <div>
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
              &copy; {new Date().getFullYear()} Journey Rentals. All rights reserved. Self-Drive Car &amp; Bike Rentals in Solapur, Maharashtra.
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="hover:text-[#e1b808] hover:underline cursor-pointer flex items-center gap-1"
              >
                <FileText size={12} className="text-[#e1b808]" /> Terms &amp; Conditions
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setShowNda(true)}
                className="hover:text-[#e1b808] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Lock size={12} className="text-[#e1b808]" /> Privacy Policy
              </button>
              <span>•</span>
              <Link
                to="/about#faqs"
                className="hover:text-[#e1b808] hover:underline cursor-pointer flex items-center gap-1"
              >
                <HelpCircle size={12} className="text-[#e1b808]" /> Help Center
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
        </div>
      </footer>

      {/* Modals */}
      <TermsModal open={showTerms} onOpenChange={setShowTerms} />
      <NdaModal open={showNda} onOpenChange={setShowNda} />
    </>
  );
}
