/* Brex / Urbanist Design System — Exact DriveHub Goa Parity */
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Fuel, Cog, Users, ArrowUpRight, ChevronLeft, ChevronRight, MessageCircle, Phone, Bike, Car, CheckCircle2 } from "lucide-react";
import { formatINR, getOptimizedImageUrl } from "@/lib/api";
import Tilt3DCard from "./Tilt3DCard";

export default function VehicleCard({ v, index = 0, queryParams = "" }) {
  const navigate = useNavigate();
  const vehicleId = v._id || v.id;
  const bookingUrl = `/booking/${vehicleId}${queryParams ? `?${queryParams}` : ""}`;

  const isBike = v.type === "bike";
  const title = v.title || `${v.brand || ''} ${v.model || ''}`.trim() || "Vehicle";

  // Image list (capped at max 5 photos, cover first)
  const imageList = useMemo(() => {
    if (Array.isArray(v.images) && v.images.length > 0) {
      const valid = v.images.filter(Boolean).slice(0, 5);
      if (valid.length > 0) return valid;
    }
    if (v.image) return [v.image];
    if (v.image_url) return [v.image_url];
    return isBike
      ? ["https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80"]
      : ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"];
  }, [v.images, v.image, v.image_url, isBike]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(null);

  // Auto-play gentle rotation (3.5s interval, pauses when user hovers)
  useEffect(() => {
    if (imageList.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % imageList.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [imageList.length, isHovered]);

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % imageList.length);
  };

  const handleDotClick = (e, idx) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx(idx);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setActiveIdx((prev) => (prev + 1) % imageList.length);
      } else {
        setActiveIdx((prev) => (prev - 1 + imageList.length) % imageList.length);
      }
    }
    touchStartX.current = null;
  };

  const currentImage = imageList[activeIdx] || imageList[0];
  const displayRate = isBike ? (v.bikeSlots?.price24hr || v.bikeSlots?.price12hr || v.pricePerDay || 500) : (v.pricePerDay || v.daily_rate || 2000);

  return (
    <Tilt3DCard maxTilt={3} scale={1.015} className="rounded-[24px] h-full font-body">
      <div
        className="group bg-white rounded-[24px] overflow-hidden border border-[#DFDCE8] shadow-sm hover:shadow-md hover:border-[#212121] transition-all duration-300 h-full flex flex-col justify-between"
        data-testid={`vehicle-card-${index}`}
        style={{ animationDelay: `${index * 40}ms` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top & Details (Clickable -> Booking Page) */}
        <div onClick={() => navigate(bookingUrl)} className="cursor-pointer">
          {/* Vehicle Image Banner / Carousel */}
          <div
            className="relative aspect-[16/10] overflow-hidden bg-[#F6F5FA] select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              key={`${vehicleId}-${activeIdx}`}
              src={getOptimizedImageUrl(currentImage)}
              alt={`${title} - View ${activeIdx + 1}`}
              onError={(e) => {
                e.currentTarget.src = isBike
                  ? "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80"
                  : "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80";
              }}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />

            {/* Navigation Arrows */}
            {imageList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-xs transition-opacity duration-200 opacity-0 group-hover:opacity-100 cursor-pointer z-10 shadow-sm active:scale-95"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-xs transition-opacity duration-200 opacity-0 group-hover:opacity-100 cursor-pointer z-10 shadow-sm active:scale-95"
                  aria-label="Next image"
                >
                  <ChevronRight size={16} />
                </button>

                {/* Pagination Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-xs">
                  {imageList.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={(e) => handleDotClick(e, dotIdx)}
                      className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                        dotIdx === activeIdx
                          ? "w-4 bg-[#e1b808]"
                          : "w-1.5 bg-white/70 hover:bg-white"
                      }`}
                      aria-label={`Go to image ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Category Tag */}
            <div className="absolute top-3.5 left-3.5 flex gap-2 z-10">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-xs text-[#212121] border border-[#DFDCE8] shadow-xs">
                {v.category || (isBike ? "Bike" : "Car")}
              </span>
            </div>

            {/* Status Tag */}
            <div className="absolute top-3.5 right-3.5 z-10">
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs ${
                  v.isAvailable !== false && v.status !== "Booked"
                    ? "bg-[#CFDECA] text-[#4B8039]"
                    : "bg-[#EFEDF5] text-[#6F6E73] border border-[#DFDCE8]"
                }`}
              >
                {v.isAvailable !== false && v.status !== "Booked" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4B8039] animate-pulse" />
                )}
                <span>{v.isAvailable !== false && v.status !== "Booked" ? "Available" : "Booked"}</span>
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="p-5 text-left space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[#212121] leading-snug group-hover:text-[#212121] transition-colors truncate font-display">
                {title}
              </h3>
              <div className="w-7 h-7 rounded-full bg-[#F6F5FA] border border-[#DFDCE8] flex items-center justify-center text-[#6F6E73] group-hover:bg-[#212121] group-hover:text-white transition-all shrink-0">
                <ArrowUpRight size={14} />
              </div>
            </div>

            {/* Specs Pills */}
            <div className="flex items-center gap-2.5 text-xs text-[#6F6E73] font-medium">
              <div className="flex items-center gap-1 bg-[#F6F5FA] px-2.5 py-1 rounded-lg border border-[#DFDCE8]/70">
                <Fuel size={13} className="text-[#212121]" />
                <span>{v.fuelType || v.fuel_type || "Petrol"}</span>
              </div>
              <div className="flex items-center gap-1 bg-[#F6F5FA] px-2.5 py-1 rounded-lg border border-[#DFDCE8]/70">
                <Cog size={13} className="text-[#212121]" />
                <span>{v.transmission || "Manual"}</span>
              </div>
              <div className="flex items-center gap-1 bg-[#F6F5FA] px-2.5 py-1 rounded-lg border border-[#DFDCE8]/70">
                <Users size={13} className="text-[#212121]" />
                <span>{v.sittingCapacity || (isBike ? 2 : 5)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Daily/Hourly Rate & Action Buttons */}
        <div className="p-5 border-t border-[#DFDCE8] bg-[#F6F5FA] space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-left shrink-0 min-w-0">
              <div className="text-[10px] uppercase tracking-wider font-bold text-[#6F6E73] leading-none mb-1 font-mono">
                {isBike ? "24 Hours Rate" : "Daily Rate"}
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-[#212121] leading-tight font-mono">
                {formatINR(displayRate)}
                <span className="text-xs text-[#6F6E73] font-normal ml-0.5">{isBike ? "/24h" : "/day"}</span>
              </div>
            </div>

            {/* Book Now Button */}
            <button
              type="button"
              onClick={() => navigate(bookingUrl)}
              className="bg-[#212121] hover:bg-[#141414] active:bg-[#000000] text-white font-bold text-xs tracking-wider uppercase px-5 py-2.5 h-10 rounded-full flex items-center justify-center gap-1.5 transition-all duration-150 shrink-0 whitespace-nowrap shadow-xs cursor-pointer active:scale-95"
            >
              <span>Book Now</span>
              <span className="text-sm font-normal">→</span>
            </button>
          </div>

          {/* Quick Contact Buttons: WhatsApp & Call Now */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#DFDCE8]/60">
            <a
              href={`https://wa.me/919604437794?text=Hi%20Journey%20Rentals%20Solapur%2C%20I%20would%20like%20to%20enquire%20about%20booking%20the%20${encodeURIComponent(title)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 px-3 rounded-full bg-[#EBF7EE] hover:bg-[#25D366] text-[#1E7E34] hover:text-white border border-[#C3E6CB] hover:border-[#25D366] text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs active:scale-95 text-center"
              title="Enquire on WhatsApp"
            >
              <MessageCircle size={13} className="shrink-0" />
              <span className="truncate">WhatsApp</span>
            </a>

            <a
              href="tel:+919604437794"
              className="w-full py-2 px-3 rounded-full bg-white hover:bg-[#212121] text-[#212121] hover:text-white border border-[#DFDCE8] text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs active:scale-95 text-center"
              title="Call Now"
            >
              <Phone size={13} className="shrink-0" />
              <span className="truncate">Call Now</span>
            </a>
          </div>
        </div>
      </div>
    </Tilt3DCard>
  );
}
