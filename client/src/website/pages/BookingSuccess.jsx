import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import SEO from "../components/seo/SEO";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { CheckCircle2, MessageCircle, MapPin, Calendar, Car, Bike, Phone, User, ArrowRight, FileText, Clock, Tag } from "lucide-react";
import api, { formatINR, safeFormatDate } from "@/lib/api";
import { openBookingInvoiceInNewTab } from "@/website/utils/invoiceGenerator";
import { Skeleton } from "@/ui/skeleton";

export default function BookingSuccess() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooking() {
      try {
        setLoading(true);
        // 1. Direct fetch by ID/reference ID
        if (bookingId) {
          try {
            const res = await api.get(`/api/bookings/${bookingId}`);
            if (res.data?.booking || res.data?.data || res.data) {
              setBooking(res.data.booking || res.data.data || res.data);
              return;
            }
          } catch {}
        }

        // 2. Fallback to authenticated user's bookings
        const mineRes = await api.bookings.mine().catch(() => ({ bookings: [] }));
        const list = mineRes.bookings || mineRes.data || (Array.isArray(mineRes) ? mineRes : []);
        const found = list.find((b) => b._id === bookingId || b.referenceId === bookingId || b.id === bookingId);
        if (found) {
          setBooking(found);
        }
      } catch (err) {
        console.warn("Failed to load booking details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [bookingId]);

  const refId = booking?.referenceId || (bookingId && bookingId.length === 24 ? `JR-${bookingId.slice(-6).toUpperCase()}` : bookingId) || "JR-CONFIRMED";
  const vTitle = booking?.vehicleSnapshot
    ? `${booking.vehicleSnapshot.brand || ""} ${booking.vehicleSnapshot.model || ""}`.trim()
    : (booking?.vehicleName || "Self-Drive Vehicle");
  const isBike = booking?.bookingType === "bike" || booking?.vehicleSnapshot?.type === "bike";
  const vImg = booking?.vehicleSnapshot?.image || booking?.vehicleId?.image || "/placeholder-car.png";

  const customerName = booking?.userSnapshot?.name || booking?.customerName || "";
  const customerPhone = booking?.userSnapshot?.phone || booking?.customerPhone || "";
  const pickupLoc = booking?.pickupLocation || "Solapur Railway Station (Main Hub)";

  const datesFormatted = isBike || booking?.bikeSlot
    ? `${safeFormatDate(booking?.bikeDate || booking?.pickupDate, "dd MMM yyyy")} (${booking?.bikeSlot || "Hourly"} Rental Slot)`
    : `${safeFormatDate(booking?.pickupDate, "dd MMM yyyy")}${booking?.pickupTime ? `, ${booking.pickupTime}` : ""} → ${safeFormatDate(booking?.returnDate, "dd MMM yyyy")}${booking?.returnTime ? `, ${booking.returnTime}` : ""}`;

  const advancePaid = booking?.advancePaid != null ? booking.advancePaid : 500;
  const totalPrice = booking?.totalPrice != null ? booking.totalPrice : advancePaid;
  const balanceDue = booking?.balanceDue != null ? booking.balanceDue : Math.max(0, totalPrice - advancePaid);
  const discount = booking?.discount || 0;
  const couponApplied = booking?.couponApplied;

  const waLink = `https://wa.me/919604437794?text=${encodeURIComponent(
    `Hi Journey Rentals Solapur! My booking is confirmed.\nBooking Ref: #${refId}\nVehicle: ${vTitle}\nDates: ${datesFormatted}\nCustomer: ${customerName}`
  )}`;

  return (
    <div className="min-h-screen bg-[#F6F5FA] text-[#212121] font-body flex flex-col justify-between">
      <SEO
        title={`Booking Confirmed #${refId} | Journey Rentals Solapur`}
        description="Your vehicle reservation in Solapur has been confirmed."
        noindex={true}
      />
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16 w-full">
        {/* Success Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#CFDECA] text-[#4B8039] mb-3 shadow-xs">
            <CheckCircle2 size={36} />
          </div>
          <div className="text-xs uppercase tracking-wider text-[#4B8039] font-bold font-mono mb-1.5">
            Reservation Confirmed
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-[#212121] mb-2 tracking-tight">
            You're all set to drive!
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6E73] max-w-md mx-auto leading-relaxed font-medium">
            Booking Reference <span className="font-bold text-[#212121] font-mono bg-white px-2.5 py-0.5 rounded-full border border-[#DFDCE8]">#{refId}</span> is confirmed and locked in the schedule.
          </p>
        </div>

        {/* Booking Card */}
        <div className="bg-white rounded-[24px] border border-[#DFDCE8] overflow-hidden shadow-sm text-left">
          {/* Top Vehicle & Customer Ribbon */}
          <div className="p-5 sm:p-7 border-b border-[#DFDCE8] bg-[#F6F5FA]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-12 rounded-xl bg-white border border-[#DFDCE8] flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                {isBike ? (
                  <Bike size={22} className="text-[#212121]" />
                ) : (
                  <Car size={22} className="text-[#212121]" />
                )}
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#6F6E73] font-bold font-mono">Reserved Vehicle</div>
                <div className="font-display text-base sm:text-lg font-bold text-[#212121]">{vTitle}</div>
                <div className="text-xs text-[#6F6E73] flex items-center gap-1 mt-0.5 font-medium">
                  <MapPin size={11} className="text-[#E8826B]" />
                  <span>{pickupLoc}</span>
                </div>
              </div>
            </div>

            {customerName && (
              <div className="text-left sm:text-right bg-white sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-[#DFDCE8]">
                <div className="text-[10px] uppercase tracking-wider text-[#6F6E73] font-bold font-mono">Primary Driver</div>
                <div className="font-bold text-xs text-[#212121] flex items-center sm:justify-end gap-1.5 mt-0.5">
                  <User size={12} className="text-[#212121]" />
                  <span>{customerName}</span>
                </div>
                {customerPhone && (
                  <div className="text-[11px] text-[#6F6E73] font-mono mt-0.5">{customerPhone}</div>
                )}
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="p-5 sm:p-7 grid sm:grid-cols-2 gap-5 sm:gap-6 border-b border-[#DFDCE8]">
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-[#6F6E73] font-bold font-mono">Rental Schedule</div>
              <div className="text-xs sm:text-sm font-bold text-[#212121] flex items-start gap-2 pt-0.5">
                <Calendar size={14} className="text-[#212121] shrink-0 mt-0.5" />
                <span>{datesFormatted}</span>
              </div>
              <div className="text-[11px] text-[#6F6E73] pt-0.5">Solapur Railway Station &amp; Temple Hub Handover</div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-[#6F6E73] font-bold font-mono">Pickup &amp; Return Hub</div>
              <div className="text-xs sm:text-sm font-bold text-[#212121] flex items-start gap-2 pt-0.5">
                <MapPin size={14} className="text-[#E8826B] shrink-0 mt-0.5" />
                <span>{pickupLoc}</span>
              </div>
              <div className="text-[11px] text-[#6F6E73] pt-0.5">Express 24/7 Gate Dispatch</div>
            </div>

            <div className="bg-[#F6F5FA] p-4 rounded-2xl border border-[#DFDCE8]">
              <div className="text-[10px] uppercase tracking-wider text-[#6F6E73] font-bold font-mono">Advance Amount Paid</div>
              <div className="font-display text-xl sm:text-2xl font-extrabold text-[#212121] mt-1">{formatINR(advancePaid)}</div>
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4B8039] bg-[#CFDECA] px-2 py-0.5 rounded-full mt-1">
                ● Online Verified &amp; Locked
              </div>
            </div>

            <div className="bg-[#F6F5FA] p-4 rounded-2xl border border-[#DFDCE8]">
              <div className="text-[10px] uppercase tracking-wider text-[#6F6E73] font-bold font-mono">Balance Due at Handover</div>
              <div className="font-display text-xl sm:text-2xl font-extrabold text-[#212121] mt-1">{formatINR(balanceDue)}</div>
              <div className="text-[11px] text-[#6F6E73] mt-1">
                {balanceDue > 0 ? "Payable via Cash/UPI upon vehicle key handover" : "Paid in Full"}
              </div>
            </div>
          </div>

          {/* Pricing Summary Row */}
          {(totalPrice > advancePaid || discount > 0) && (
            <div className="px-5 sm:px-7 py-3.5 bg-[#FFFFFF] border-b border-[#DFDCE8] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="text-[#6F6E73] flex items-center gap-2">
                <span>Total Fare: <strong>{formatINR(totalPrice)}</strong></span>
                {discount > 0 && (
                  <span className="text-[#4B8039] font-bold inline-flex items-center gap-1">
                    <Tag size={12} /> {couponApplied ? `Coupon (${couponApplied}): -${formatINR(discount)}` : `Discount: -${formatINR(discount)}`}
                  </span>
                )}
              </div>
              <div className="text-[#212121] font-bold">
                Advance Paid: <span className="text-[#4B8039]">{formatINR(advancePaid)}</span>
              </div>
            </div>
          )}

          {/* Next Steps & Support Buttons */}
          <div className="p-5 sm:p-7 bg-[#F6F5FA] flex flex-col sm:flex-row flex-wrap gap-3">
            <button
              type="button"
              onClick={() => openBookingInvoiceInNewTab(booking || { referenceId: refId, totalPrice, advancePaid, balanceDue, vehicleSnapshot: { brand: vTitle }, pickupLocation: pickupLoc })}
              className="flex-1 min-w-[180px] bg-[#212121] hover:bg-[#141414] text-white font-bold text-xs uppercase tracking-wider rounded-full py-3.5 px-4 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
            >
              <FileText size={15} className="text-[#e1b808]" />
              <span>Download Tax Invoice</span>
            </button>

            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="flex-1 min-w-[180px] bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-full flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98 transition-all"
            >
              <MessageCircle size={15} />
              <span>WhatsApp Dispatch</span>
            </a>

            <Link
              to="/profile"
              className="flex-1 min-w-[160px] border border-[#DFDCE8] bg-white hover:bg-[#F6F5FA] text-[#212121] font-bold text-xs uppercase tracking-wider rounded-full py-3.5 px-4 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <span>View In Profile</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
