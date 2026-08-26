import React from "react";
import Marquee from "react-fast-marquee";
import { Star, Award } from "lucide-react";
import { GoogleIcon } from "../pages/Landing";

const DEFAULT_REVIEWS = [
  {
    name: "Rajesh Patil",
    date: "Akkalkot Devotee",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    text: "Booked an Ertiga for our family trip to Akkalkot Swami Samarth temple. The car was spotless, AC was chilled, and the railway station delivery was on time. Highly recommended!",
    hub: "Solapur Station"
  },
  {
    name: "Sneha Kulkarni",
    date: "Pune Visitor",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    text: "Seamless KYC process and zero deposit hassle. We visited Tuljapur Bhavani Mandir and returned the car without any fuss. Best self-drive service in Solapur.",
    hub: "Hotgi Road"
  },
  {
    name: "Amit Deshmukh",
    date: "Local Commuter",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    text: "Rented a Pulsar for a 6-hour slot in Solapur city. The bike was in brand new condition, helmet provided, and pickup was smooth as butter.",
    hub: "Vijapur Road"
  },
  {
    name: "Pooja Gaikwad",
    date: "Pandharpur Trip",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    text: "Very professional owner and team. The Hyundai Creta was smooth on the Pandharpur highway. Transparent pricing with complete peace of mind.",
    hub: "Railway Station"
  },
  {
    name: "Vikas Joshi",
    date: "Business Traveller",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
    text: "Fastest car delivery at Solapur Station right when my train arrived. Excellent customer support on WhatsApp. Will definitely rent again!",
    hub: "Station Hub"
  }
];

export default function ReviewsMarquee() {
  return (
    <section id="reviews" className="py-12 sm:py-16 bg-[#F6F5FA] text-[#212121] relative overflow-hidden border-t border-[#DFDCE8] font-body">
      <div className="max-w-7xl mx-auto px-6 mb-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#e1b808] text-[#212121] text-xs uppercase tracking-wider font-bold mb-2.5 shadow-xs">
              <Award size={13} /> Verified Customer Stories
            </div>
            <h2 className="font-display text-2xl sm:text-4xl text-[#212121] font-bold leading-tight">
              Trusted by <span className="text-[#212121]">5,000+ Travellers</span> in Solapur
            </h2>
          </div>

          {/* Rating Summary Bar */}
          <div className="flex items-center gap-4 bg-white border border-[#DFDCE8] p-3.5 sm:p-4 rounded-[20px] shadow-sm text-left">
            <div className="text-center pr-4 border-r border-[#DFDCE8]">
              <div className="font-display text-2xl font-bold text-[#212121]">4.9</div>
              <div className="flex text-[#212121] justify-center mt-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={11} fill="currentColor" />
                ))}
              </div>
            </div>
            <div className="text-xs text-[#6F6E73]">
              <div className="font-bold flex items-center gap-1.5 text-[#212121]">
                <GoogleIcon className="w-3.5 h-3.5" />
                Google Verified Reviews
              </div>
              <div className="text-[#99989E] mt-0.5 font-normal">100% Genuine Solapur Feedback</div>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Row */}
      <div className="marquee-mask">
        <Marquee gradient={false} speed={35} pauseOnHover>
          {DEFAULT_REVIEWS.map((r, i) => (
            <article
              key={`review-card-${i}`}
              className="mx-3 w-[340px] bg-white rounded-[24px] p-6 border border-[#DFDCE8] hover:border-[#212121] transition-all shadow-sm flex-shrink-0 text-left"
              data-testid={`review-card-${i}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <img
                    src={r.avatar}
                    alt={r.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#DFDCE8]"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border border-[#DFDCE8] flex items-center justify-center p-0.5">
                    <GoogleIcon className="w-2.5 h-2.5" />
                  </span>
                </div>
                <div>
                  <div className="font-display text-xs font-bold text-[#212121]">{r.name}</div>
                  <div className="text-[11px] text-[#99989E] font-normal">{r.date}</div>
                </div>
                <div className="ml-auto flex items-center gap-0.5 text-[#212121]">
                  {[...Array(r.rating || 5)].map((_, idx) => (
                    <Star key={idx} size={12} fill="currentColor" />
                  ))}
                </div>
              </div>

              <div className="relative">
                <p className="font-body text-xs text-[#6F6E73] leading-relaxed">"{r.text}"</p>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-[#DFDCE8] flex items-center justify-between text-[10px] text-[#99989E] uppercase tracking-wider font-bold">
                <span className="flex items-center gap-1.5 text-[#212121]">
                  <GoogleIcon className="w-3 h-3" /> Google Verified
                </span>
                <span className="text-[#3F5F8C]">{r.hub}</span>
              </div>
            </article>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
