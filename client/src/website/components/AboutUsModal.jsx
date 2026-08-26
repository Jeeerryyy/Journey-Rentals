/* Brex / Urbanist Design System — Exact Parity for Journey Rentals */
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/ui/dialog";
import { Award, ShieldCheck, MapPin, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/ui/button";

export default function AboutUsModal({ open, onOpenChange }) {
  const handleViewLocation = () => {
    onOpenChange(false);
    setTimeout(() => {
      const el = document.getElementById("locations");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = "/#locations";
      }
    }, 150);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#F6F5FA] text-[#212121] border border-[#DFDCE8] rounded-[24px] p-6 sm:p-8 font-body" data-testid="about-us-modal">
        <DialogHeader className="mb-5 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#e1b808] text-[#212121] text-xs font-bold uppercase tracking-wider mb-2.5 w-fit shadow-xs">
            <Sparkles size={13} /> Trusted In Solapur Since 2020
          </div>
          <DialogTitle className="font-display text-2xl sm:text-3xl text-[#212121] font-bold leading-tight flex items-center gap-3">
            About Journey Rentals
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-[#6F6E73] mt-1.5 leading-relaxed font-normal">
            Solapur’s premier self-drive vehicle rental company — delivering freedom, safety, and transparent pricing to thousands of devotees and travellers.
          </DialogDescription>
        </DialogHeader>

        {/* Core Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 rounded-[20px] bg-[#212121] text-white mb-5 shadow-sm font-mono">
          <div className="text-center p-1.5">
            <div className="font-display text-2xl font-bold text-white">2020</div>
            <div className="text-[10px] uppercase tracking-wider text-[#99989E] mt-0.5 font-bold">Est. Year</div>
          </div>
          <div className="text-center p-1.5">
            <div className="font-display text-2xl font-bold text-white">30+</div>
            <div className="text-[10px] uppercase tracking-wider text-[#99989E] mt-0.5 font-bold">Verified Fleet</div>
          </div>
          <div className="text-center p-1.5">
            <div className="font-display text-2xl font-bold text-white">10k+</div>
            <div className="text-[10px] uppercase tracking-wider text-[#99989E] mt-0.5 font-bold">Happy Trips</div>
          </div>
          <div className="text-center p-1.5">
            <div className="font-display text-2xl font-bold text-[#e1b808]">4.9★</div>
            <div className="text-[10px] uppercase tracking-wider text-[#99989E] mt-0.5 font-bold">Google Rating</div>
          </div>
        </div>

        {/* Story & Mission */}
        <div className="space-y-3.5 text-xs sm:text-sm text-[#212121] leading-relaxed font-body text-left">
          <div className="p-6 rounded-[20px] bg-white border border-[#DFDCE8] shadow-sm">
            <h3 className="font-display text-lg font-bold text-[#212121] mb-2 flex items-center gap-2">
              <Award className="text-[#212121]" size={20} /> Our Story &amp; Leadership
            </h3>
            <p className="text-[#6F6E73] leading-relaxed mb-2 font-normal">
              Journey Rentals was founded in Solapur to eliminate the surge fares, taxi strikes, and hidden conditions often faced by pilgrims visiting Akkalkot, Tuljapur, and Pandharpur.
            </p>
            <p className="text-[#6F6E73] leading-relaxed font-normal">
              We operate on three uncompromising pillars: <strong>honest pricing with zero deposit stress</strong>, <strong>100% verified sanitized vehicles</strong>, and <strong>24/7 on-ground assistance</strong>.
            </p>
          </div>

          {/* Pillars of Excellence Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 rounded-[18px] bg-white border border-[#DFDCE8] shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#F6F5FA] text-[#212121] flex items-center justify-center mb-2.5 border border-[#DFDCE8]">
                <ShieldCheck size={16} />
              </div>
              <h4 className="font-bold text-sm text-[#212121] mb-1">Fully Insured &amp; Sanitised</h4>
              <p className="text-xs text-[#6F6E73] leading-relaxed font-normal">
                Every vehicle undergoes a multi-point safety check, full cabin sanitisation, and carries all-Maharashtra tourist permits.
              </p>
            </div>

            <div className="p-5 rounded-[18px] bg-white border border-[#DFDCE8] shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#F6F5FA] text-[#212121] flex items-center justify-center mb-2.5 border border-[#DFDCE8]">
                <MapPin size={16} />
              </div>
              <h4 className="font-bold text-sm text-[#212121] mb-1">Railway Station Handover</h4>
              <p className="text-xs text-[#6F6E73] leading-relaxed font-normal">
                Direct handover right as your train arrives at Solapur Railway Station. Doorstep delivery available across Solapur city.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-[#DFDCE8] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#4B8039] flex items-center gap-1.5 font-bold">
            <CheckCircle2 size={14} className="text-[#4B8039]" />
            <span>Verified Solapur Self-Drive Provider</span>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              onClick={handleViewLocation}
              className="bg-[#212121] hover:bg-[#141414] active:bg-[#000000] text-white rounded-full px-5 h-10 font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <MapPin size={13} className="text-[#e1b808]" /> View HQ &amp; Map
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="border-[#DFDCE8] bg-transparent text-[#212121] hover:bg-[#F6F5FA] rounded-full px-5 h-10 font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
