/* Brex / Urbanist Design System — Exact 1:1 Parity with DriveHub Goa */
import React from "react";
import { MapPin, Phone, Mail, Globe, Navigation, MessageSquare, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/ui/button";

export default function LocationSection() {
  const googleMapsDirectionsUrl = "https://www.google.com/maps/search/?api=1&query=Solapur+Railway+Station+Solapur+Maharashtra+413001";
  const mapEmbedUrl = "https://maps.google.com/maps?q=Solapur%20Railway%20Station%2C%20Solapur%2C%20Maharashtra%20413001&t=&z=14&ie=UTF8&iwloc=&output=embed";

  return (
    <section id="locations" className="py-12 sm:py-20 bg-[#F6F5FA] text-[#212121] border-t border-[#DFDCE8] font-body cv-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="mb-8 sm:mb-12 text-left space-y-2">
          <h2 className="text-2xl sm:text-4xl font-bold text-[#212121] tracking-tight font-display">
            Our Headquarters in Solapur Central
          </h2>
          <p className="text-[#6F6E73] text-sm sm:text-base font-normal max-w-2xl">
            Conveniently located next to Solapur Railway Station and Hotgi Road for express vehicle handover upon train arrival.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* Left Column: Owner & Contact Information */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-[24px] border border-[#DFDCE8] shadow-sm hover:border-[#212121] transition-all duration-300 flex flex-col justify-between text-left">
            <div>
              {/* Info Header */}
              <div className="flex items-center gap-4 pb-5 mb-5 border-b border-[#DFDCE8]">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#DFDCE8] p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
                  <img src="/logo.png" alt="Journey Rentals Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#212121] font-display leading-tight">
                    Journey Rentals
                  </h3>
                  <p className="text-xs text-[#6F6E73] font-normal mt-0.5">
                    Operations Dispatch — Solapur HQ
                  </p>
                </div>
              </div>

              {/* Contact Details List */}
              <div className="space-y-4 text-xs sm:text-sm mb-6 sm:mb-8">
                <div className="flex items-start gap-3.5 text-[#212121]">
                  <div className="w-8 h-8 rounded-full bg-[#F6F5FA] border border-[#DFDCE8] flex items-center justify-center shrink-0 mt-0.5 text-[#212121]">
                    <MapPin size={15} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#99989E] uppercase tracking-wider font-bold font-mono">Address</span>
                    <span className="font-medium text-[#212121] leading-relaxed">
                      Near Solapur Railway Station &amp; Hotgi Road, Solapur 413001
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 text-[#212121]">
                  <div className="w-8 h-8 rounded-full bg-[#F6F5FA] border border-[#DFDCE8] flex items-center justify-center shrink-0 mt-0.5 text-[#212121]">
                    <Phone size={15} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#99989E] uppercase tracking-wider font-bold font-mono">Phone &amp; 24/7 Helpline</span>
                    <a
                      href="tel:+919604437794"
                      className="hover:underline transition-colors font-mono font-bold text-[#212121] text-sm block mt-0.5"
                    >
                      +91 96044 37794
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 text-[#212121]">
                  <div className="w-8 h-8 rounded-full bg-[#F6F5FA] border border-[#DFDCE8] flex items-center justify-center shrink-0 mt-0.5 text-[#212121]">
                    <Mail size={15} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#99989E] uppercase tracking-wider font-bold font-mono">Email Enquiries</span>
                    <a
                      href="mailto:rental.journeycars@gmail.com"
                      className="hover:underline font-medium text-[#212121] transition-colors block mt-0.5 truncate"
                    >
                      rental.journeycars@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 text-[#212121]">
                  <div className="w-8 h-8 rounded-full bg-[#F6F5FA] border border-[#DFDCE8] flex items-center justify-center shrink-0 mt-0.5 text-[#212121]">
                    <Globe size={15} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#99989E] uppercase tracking-wider font-bold font-mono">Service Coverage</span>
                    <span className="text-[#212121] font-medium block mt-0.5">
                      Solapur, Akkalkot, Tuljapur, Pandharpur &amp; Western Maharashtra
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons (Pill) */}
            <div className="grid grid-cols-2 gap-3 pt-5 border-t border-[#DFDCE8]">
              <a
                href="https://wa.me/919604437794?text=Hello%20Journey%20Rentals,%20I%20want%20to%20inquire%20about%20renting%20a%20vehicle%20in%20Solapur"
                target="_blank"
                rel="noreferrer"
                className="w-full"
              >
                <Button className="w-full bg-[#212121] hover:bg-[#141414] active:bg-[#000000] text-white font-bold text-xs uppercase tracking-wider h-11 rounded-full flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95">
                  <MessageSquare size={14} className="text-[#e1b808]" /> WhatsApp
                </Button>
              </a>

              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full"
              >
                <Button className="w-full bg-transparent hover:bg-[#212121]/5 text-[#212121] border border-[#212121] font-bold text-xs uppercase tracking-wider h-11 rounded-full flex items-center justify-center gap-1.5 shadow-none transition-colors cursor-pointer active:scale-95">
                  <Navigation size={14} /> Directions
                </Button>
              </a>
            </div>
          </div>

          {/* Right Column: Google Maps Embed Box */}
          <div className="lg:col-span-7 bg-white rounded-[24px] border border-[#DFDCE8] shadow-sm overflow-hidden flex flex-col min-h-[320px] sm:min-h-[400px]">
            <div className="px-5 py-3.5 bg-[#212121] text-white flex items-center justify-between text-xs font-medium">
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-[#e1b808]" />
                <span className="truncate font-bold font-display">Solapur Railway Station Central Hub</span>
              </div>
              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#e1b808] hover:underline text-xs flex items-center gap-1 shrink-0 font-bold font-mono"
              >
                Open in Maps <ExternalLink size={12} />
              </a>
            </div>

            <div className="flex-1 w-full h-full min-h-[280px] sm:min-h-[350px]">
              <iframe
                title="Journey Rentals Solapur Location"
                src={mapEmbedUrl}
                className="w-full h-full border-0"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
