/* Brex / Urbanist Design System — Exact DriveHub Goa Parity for Journey Rentals Solapur */
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import api, { formatApiError, formatINR, safeFormatDate } from "@/lib/api";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import {
  ChevronLeft, ChevronRight, CalendarDays, User, Phone, Mail, MapPin,
  Car, Bike, Clock, Search, Sparkles, Filter, CheckCircle2, ShieldCheck,
  Plus, Eye, MessageCircle, AlertCircle, CalendarRange, FileText
} from "lucide-react";
import {
  format, getDaysInMonth, startOfMonth, addDays, isSameDay, isToday, isWeekend
} from "date-fns";
import OfflineBookingModal from "../components/OfflineBookingModal";
import { openBookingInvoiceInNewTab } from "@/website/utils/invoiceGenerator";
import CustomSelect from "@/website/components/CustomSelect";
import { Skeleton } from "@/ui/skeleton";

function ymd(d) {
  if (!d) return "";
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return "";
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CalendarView() {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [viewMode, setViewMode] = useState("TIMELINE"); // "TIMELINE" | "DAILY" | "MONTH"
  
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCar, setSearchCar] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Selected date for Daily view
  const [selectedDate, setSelectedDate] = useState(today);

  // Dialog states
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);
  const [quickBookingData, setQuickBookingData] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [vRes, bRes] = await Promise.allSettled([
        api.get("/api/admin/fleet").then((r) => r.data?.vehicles || r.data || []),
        api.get("/api/admin/bookings").then((r) => r.data?.bookings || r.data || []),
      ]);

      if (vRes.status === "fulfilled" && vRes.value) {
        setVehicles(Array.isArray(vRes.value) ? vRes.value : (vRes.value.vehicles || []));
      }
      if (bRes.status === "fulfilled" && bRes.value) {
        setBookings(Array.isArray(bRes.value) ? bRes.value : (bRes.value.bookings || []));
      }
    } catch (err) {
      console.error("Failed to load fleet schedule:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    window.addEventListener("focus", loadData);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", loadData);
    };
  }, [loadData]);

  // Days in current selected month
  const daysInMonth = useMemo(() => {
    const daysCount = getDaysInMonth(currentMonth);
    const result = [];
    for (let i = 0; i < daysCount; i++) {
      result.push(addDays(currentMonth, i));
    }
    return result;
  }, [currentMonth]);

  const nextMonth = () => setCurrentMonth((prev) => addDays(startOfMonth(prev), 32));
  const prevMonth = () => setCurrentMonth((prev) => startOfMonth(addDays(prev, -10)));

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(vehicles.map((v) => v.category || (v.type === "bike" ? "Bike" : "Car")));
    return ["All", ...Array.from(set)];
  }, [vehicles]);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchSearch = !searchCar.trim() || 
        `${v.brand || ''} ${v.model || ''} ${v.title || ''} ${v.reg_no || ''}`.toLowerCase().includes(searchCar.toLowerCase());
      const cat = v.category || (v.type === "bike" ? "Bike" : "Car");
      const matchCat = categoryFilter === "All" || cat === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [vehicles, searchCar, categoryFilter]);

  // Filter bookings for a specific day
  const dailyBookings = useMemo(() => {
    const targetStr = ymd(selectedDate);
    return bookings.filter((b) => {
      const startStr = ymd(b.startDate || b.start_date || b.pickupDate || b.bikeDate);
      const endStr = ymd(b.endDate || b.end_date || b.returnDate || b.bikeDate);
      return targetStr >= startStr && targetStr <= endStr;
    });
  }, [bookings, selectedDate]);

  function handleSlotClick(vehicle, day) {
    setQuickBookingData({
      vehicle_id: vehicle._id || vehicle.id,
      start_date: day,
      end_date: addDays(day, 1),
      pickup_location: "Solapur Railway Station (Main Hub)"
    });
    setOfflineModalOpen(true);
  }

  function handleBookingClick(e, booking) {
    e.stopPropagation();
    setSelectedBooking(booking);
    setDetailOpen(true);
  }

  return (
    <div className="space-y-6 text-left font-body text-[#212121]">
      
      {/* ── 1. HEADER CONTROL BAR ─────────────────────────────────────── */}
      <div className="bg-white border border-[#DFDCE8] rounded-[24px] p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#212121] tracking-tight">
              Vehicle Schedule &amp; Timeline
            </h1>
            <p className="text-xs text-[#6F6E73] mt-1 font-normal">
              Track live reservations, temple trips, express railway station handovers, and open slots.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="bg-[#F6F5FA] border border-[#DFDCE8] p-1 rounded-full flex items-center gap-1">
              <button
                onClick={() => setViewMode("TIMELINE")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "TIMELINE"
                    ? "bg-[#212121] text-white shadow-xs"
                    : "text-[#6F6E73] hover:text-[#212121]"
                }`}
              >
                Timeline Grid
              </button>
              <button
                onClick={() => setViewMode("DAILY")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "DAILY"
                    ? "bg-[#212121] text-white shadow-xs"
                    : "text-[#6F6E73] hover:text-[#212121]"
                }`}
              >
                Daily Dispatch
              </button>
            </div>

            {/* Quick Offline Booking Action */}
            <Button
              onClick={() => { setQuickBookingData(null); setOfflineModalOpen(true); }}
              className="bg-[#212121] hover:bg-[#141414] text-white rounded-full px-5 py-2 text-xs font-bold shadow-sm cursor-pointer"
            >
              <Plus size={14} className="mr-1.5 text-[#e1b808]" />
              New Booking
            </Button>
          </div>
        </div>

        {/* Filters & Month Stepper */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#DFDCE8]">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9896A1]" />
              <input
                type="text"
                placeholder="Search car or bike..."
                value={searchCar}
                onChange={(e) => setSearchCar(e.target.value)}
                className="w-full bg-[#F6F5FA] border border-[#DFDCE8] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#212121] outline-none focus:border-[#212121]"
              />
            </div>

            {/* Category Filter */}
            <div className="w-full sm:w-44">
              <CustomSelect
                value={categoryFilter}
                onChange={(val) => setCategoryFilter(val)}
                options={categories.map((c) => ({ value: c, label: c }))}
                placeholder="All Categories"
              />
            </div>
          </div>

          {/* Month Stepper */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-xl border border-[#DFDCE8] bg-white hover:bg-[#F6F5FA] text-[#212121] cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="px-4 py-1.5 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8] text-xs font-bold">
              {format(currentMonth, "MMMM yyyy")}
            </div>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-xl border border-[#DFDCE8] bg-white hover:bg-[#F6F5FA] text-[#212121] cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. TIMELINE GANTT MATRIX VIEW ─────────────────────────────── */}
      {viewMode === "TIMELINE" && (
        <div className="bg-white border border-[#DFDCE8] rounded-[24px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-max min-w-full table-fixed border-collapse text-xs">
              <thead className="sticky top-0 z-20 bg-[#F6F5FA] border-b border-[#DFDCE8]">
                <tr>
                  <th className="sticky left-0 z-30 bg-[#F6F5FA] p-3 text-left w-56 min-w-[224px] max-w-[224px] font-bold text-[#212121] border-r border-[#DFDCE8]">
                    Vehicle ({filteredVehicles.length})
                  </th>
                  {daysInMonth.map((day) => {
                    const todayFlag = isToday(day);
                    const weekend = isWeekend(day);
                    return (
                      <th
                        key={day.toISOString()}
                        className="p-1 text-center w-12 min-w-[48px] max-w-[48px] border-r border-[#DFDCE8] select-none"
                      >
                        <div
                          className={`w-9 h-11 mx-auto rounded-xl flex flex-col items-center justify-center transition-all ${
                            todayFlag
                              ? "bg-[#212121] text-white shadow-xs"
                              : weekend
                              ? "bg-[#DFDCE8]/40 text-[#212121] font-bold"
                              : "bg-[#F6F5FA] text-[#6F6E73]"
                          }`}
                        >
                          <span className="text-[9px] uppercase font-bold tracking-tight leading-none">
                            {format(day, "EEE")}
                          </span>
                          <span
                            className={`text-xs font-extrabold mt-1 leading-none ${
                              todayFlag ? "text-[#e1b808]" : ""
                            }`}
                          >
                            {format(day, "d")}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFDCE8]">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="sticky left-0 z-10 bg-white p-2.5 border-r border-[#DFDCE8] w-56 min-w-[224px] max-w-[224px]">
                        <div className="flex items-center gap-2.5">
                          <Skeleton className="w-10 h-8 rounded-lg" />
                          <div className="space-y-1.5 flex-1">
                            <Skeleton className="h-3.5 w-28 rounded-md" />
                            <Skeleton className="h-2.5 w-16 rounded-md" />
                          </div>
                        </div>
                      </td>
                      {daysInMonth.map((day) => (
                        <td key={day.toISOString()} className="p-1 border-r border-[#DFDCE8] w-12 min-w-[48px] max-w-[48px] h-12">
                          <div className="w-full h-8 bg-[#F6F5FA]/50 rounded-lg" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle) => {
                    const vId = vehicle._id || vehicle.id;
                    const vName = vehicle.title || `${vehicle.brand || ""} ${vehicle.model || ""}`;
                    const vImg = vehicle.image || vehicle.imageUrl || vehicle.photos?.[0] || "/placeholder-car.png";

                    return (
                      <tr key={vId} className="hover:bg-[#F6F5FA]/40 transition-colors">
                        {/* Vehicle Row Header */}
                        <td className="sticky left-0 z-10 bg-white p-2.5 border-r border-[#DFDCE8] w-56 min-w-[224px] max-w-[224px]">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={vImg}
                              alt={vName}
                              className="w-10 h-8 rounded-lg object-contain bg-[#F6F5FA] border border-[#DFDCE8] shrink-0"
                            />
                            <div className="truncate">
                              <div className="font-bold text-xs text-[#212121] truncate">{vName}</div>
                              <div className="text-[10px] text-[#6F6E73] truncate">
                                {vehicle.reg_no || vehicle.category || "Verified"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Date Slots */}
                        {daysInMonth.map((day) => {
                          const dayStr = ymd(day);
                          const matchedBooking = bookings.find((b) => {
                            const bVehId = b.vehicleId?._id || b.vehicleId || b.vehicle_id || b.vehicleSnapshot?._id;
                            if (bVehId && String(bVehId) !== String(vId)) return false;
                            const startStr = ymd(b.startDate || b.start_date || b.pickupDate || b.bikeDate);
                            const endStr = ymd(b.endDate || b.end_date || b.returnDate || b.bikeDate);
                            return dayStr >= startStr && dayStr <= endStr;
                          });

                          return (
                            <td
                              key={day.toISOString()}
                              onClick={() => !matchedBooking && handleSlotClick(vehicle, day)}
                              className={`p-1 text-center border-r border-[#DFDCE8] w-12 min-w-[48px] max-w-[48px] h-12 transition-all relative ${
                                matchedBooking ? "" : "cursor-pointer hover:bg-[#e1b808]/20"
                              }`}
                            >
                              {matchedBooking ? (
                                <div
                                  onClick={(e) => handleBookingClick(e, matchedBooking)}
                                  className={`w-full h-8 rounded-lg px-1 text-[9px] font-bold flex items-center justify-center truncate cursor-pointer shadow-2xs transition-all hover:scale-105 ${
                                    (matchedBooking.status || "").toLowerCase() === "confirmed"
                                      ? "bg-[#212121] text-white"
                                      : (matchedBooking.status || "").toLowerCase() === "completed"
                                      ? "bg-[#82C4B7] text-[#212121]"
                                      : "bg-[#e1b808] text-[#212121] border border-[#C4C732]"
                                  }`}
                                  title={`${matchedBooking.userSnapshot?.name || matchedBooking.customerName || "Booking"} · ${matchedBooking.status}`}
                                >
                                  <span className="truncate">
                                    {(matchedBooking.userSnapshot?.name || matchedBooking.customerName || "Booked").split(" ")[0]}
                                  </span>
                                </div>
                              ) : (
                                <div className="w-full h-8 rounded-lg" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={daysInMonth.length + 1} className="py-16 text-center text-xs text-[#6F6E73]">
                      No vehicles found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 3. DAILY DISPATCH VIEW ────────────────────────────────────── */}
      {viewMode === "DAILY" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Date Picker Side Column */}
          <div className="bg-white border border-[#DFDCE8] rounded-[24px] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFDCE8]">
              <div>
                <h3 className="font-bold text-sm text-[#212121]">Select Dispatch Date</h3>
                <p className="text-[11px] text-[#6F6E73]">{format(currentMonth, "MMMM yyyy")} ({daysInMonth.length} Days)</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg border border-[#DFDCE8] hover:bg-[#F6F5FA] text-[#212121] cursor-pointer transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg border border-[#DFDCE8] hover:bg-[#F6F5FA] text-[#212121] cursor-pointer transition-colors"
                  title="Next Month"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-1 max-h-[560px] overflow-y-auto pr-1">
              {daysInMonth.map((d) => {
                const isSelected = isSameDay(d, selectedDate);
                const dStr = ymd(d);
                const count = bookings.filter((b) => {
                  const s = ymd(b.startDate || b.start_date || b.pickupDate || b.bikeDate);
                  const e = ymd(b.endDate || b.end_date || b.returnDate || b.bikeDate);
                  return dStr >= s && dStr <= e;
                }).length;

                return (
                  <button
                    key={d.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(d)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#212121] text-white shadow-xs"
                        : "text-[#212121] hover:bg-[#F6F5FA] border border-transparent hover:border-[#DFDCE8]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isToday(d) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4B8039]" title="Today" />
                      )}
                      <span>{format(d, "EEE, dd MMM yyyy")}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isSelected ? "bg-[#e1b808] text-[#212121]" : count > 0 ? "bg-[#CFDECA] text-[#4B8039]" : "bg-[#F6F5FA] text-[#6F6E73]"
                    }`}>
                      {count} {count === 1 ? 'Trip' : 'Trips'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Schedule List */}
          <div className="lg:col-span-2 bg-white border border-[#DFDCE8] rounded-[24px] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFDCE8]">
              <div>
                <h3 className="font-bold text-base text-[#212121]">
                  Dispatches for {format(selectedDate, "dd MMMM yyyy")}
                </h3>
                <p className="text-xs text-[#6F6E73]">
                  {dailyBookings.length} Active {dailyBookings.length === 1 ? 'Rental' : 'Rentals'} on this day
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {dailyBookings.length > 0 ? (
                dailyBookings.map((b) => (
                  <div
                    key={b._id || b.id}
                    onClick={() => { setSelectedBooking(b); setDetailOpen(true); }}
                    className="p-4 rounded-2xl bg-[#F6F5FA] border border-[#DFDCE8] hover:border-[#212121] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#DFDCE8] flex items-center justify-center shrink-0">
                        <Car size={18} className="text-[#212121]" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#212121]">{b.customerName || b.userSnapshot?.name || "Customer"}</div>
                        <div className="text-[11px] text-[#6F6E73] mt-0.5">{b.customerPhone || b.userSnapshot?.phone || "Phone N/A"}</div>
                        <div className="text-[11px] font-bold text-[#212121] mt-1 flex items-center gap-1">
                          <MapPin size={11} className="text-[#E8826B]" />
                          <span>{b.pickupLocation || "Solapur Railway Station"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right space-y-1">
                      <div className="font-bold text-sm text-[#212121]">{formatINR(b.totalPrice || 0)}</div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === "Confirmed" || b.status === "confirmed" ? "bg-[#CFDECA] text-[#4B8039]" : "bg-[#e1b808] text-[#212121]"
                      }`}>
                        {b.status || "Pending"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center text-xs text-[#6F6E73]">
                  No vehicle dispatches scheduled for {format(selectedDate, "dd MMMM yyyy")}.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 4. BOOKING DETAIL MODAL ───────────────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md bg-white border border-[#DFDCE8] rounded-[24px] p-6 text-[#212121]">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-[#212121]" />
                <span>Reservation Details</span>
              </div>
              {selectedBooking?.referenceId && (
                <span className="font-mono text-xs font-bold text-[#6F6E73] bg-[#F6F5FA] px-2.5 py-1 rounded-full border border-[#DFDCE8]">
                  #{selectedBooking.referenceId}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4 text-xs mt-2">
              {/* Customer & Status Card */}
              <div className="p-4 rounded-2xl bg-[#F6F5FA] border border-[#DFDCE8] space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-sm text-[#212121] block">
                      {selectedBooking.userSnapshot?.name || selectedBooking.customerName || selectedBooking.name || "Customer"}
                    </span>
                    {selectedBooking.vehicleSnapshot && (
                      <span className="text-[11px] font-semibold text-[#3F5F8C] block mt-0.5">
                        {selectedBooking.vehicleSnapshot.brand} {selectedBooking.vehicleSnapshot.model}
                      </span>
                    )}
                  </div>
                  <span className={`font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full ${
                    (selectedBooking.status || "").toLowerCase() === "confirmed"
                      ? "bg-[#CFDECA] text-[#4B8039]"
                      : (selectedBooking.status || "").toLowerCase() === "completed"
                      ? "bg-[#82C4B7]/40 text-[#212121] border border-[#82C4B7]"
                      : "bg-[#e1b808] text-[#212121]"
                  }`}>
                    {selectedBooking.status || "Confirmed"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#6F6E73] pt-1.5 border-t border-[#DFDCE8]/60">
                  {(selectedBooking.userSnapshot?.phone || selectedBooking.customerPhone || selectedBooking.phone) && (
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} className="text-[#212121]" />
                      <span>{selectedBooking.userSnapshot?.phone || selectedBooking.customerPhone || selectedBooking.phone}</span>
                    </div>
                  )}
                  {(selectedBooking.userSnapshot?.email || selectedBooking.customerEmail || selectedBooking.email) && (
                    <div className="flex items-center gap-1.5">
                      <Mail size={12} className="text-[#212121]" />
                      <span>{selectedBooking.userSnapshot?.email || selectedBooking.customerEmail || selectedBooking.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule & Pricing Details */}
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between py-2 border-b border-[#DFDCE8]">
                  <span className="text-[#6F6E73]">Pickup Date:</span>
                  <span className="font-bold text-[#212121]">
                    {selectedBooking.bookingType === "bike" || selectedBooking.bikeSlot
                      ? safeFormatDate(selectedBooking.bikeDate || selectedBooking.pickupDate || selectedBooking.startDate, "dd MMM yyyy") + ` (${selectedBooking.bikeSlot || "Hourly"})`
                      : safeFormatDate(selectedBooking.pickupDate || selectedBooking.startDate || selectedBooking.start_date, "dd MMM yyyy") +
                        (selectedBooking.pickupTime ? `, ${selectedBooking.pickupTime}` : "")}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-[#DFDCE8]">
                  <span className="text-[#6F6E73]">Return Date:</span>
                  <span className="font-bold text-[#212121]">
                    {selectedBooking.bookingType === "bike" || selectedBooking.bikeSlot
                      ? `${selectedBooking.bikeSlot || "Hourly"} Rental Slot`
                      : safeFormatDate(selectedBooking.returnDate || selectedBooking.endDate || selectedBooking.end_date, "dd MMM yyyy") +
                        (selectedBooking.returnTime ? `, ${selectedBooking.returnTime}` : "")}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-[#DFDCE8]">
                  <span className="text-[#6F6E73]">Pickup Hub:</span>
                  <span className="font-bold text-[#212121] max-w-[220px] text-right truncate">
                    {selectedBooking.pickupLocation || selectedBooking.location || "Solapur Railway Station (Main Hub)"}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-[#DFDCE8]">
                  <span className="text-[#6F6E73]">Total Amount:</span>
                  <span className="font-extrabold text-sm text-[#212121] font-mono">
                    {formatINR(selectedBooking.totalPrice != null ? selectedBooking.totalPrice : (selectedBooking.total_amount || 0))}
                  </span>
                </div>

                {(selectedBooking.advancePaid !== undefined || selectedBooking.balanceDue !== undefined) && (
                  <div className="flex justify-between py-1.5 text-[10px] text-[#6F6E73]">
                    <span>Adv: <strong className="text-[#4B8039]">{formatINR(selectedBooking.advancePaid || 0)}</strong></span>
                    <span>Bal: <strong className="text-[#212121]">{formatINR(selectedBooking.balanceDue || 0)}</strong></span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  onClick={() => openBookingInvoiceInNewTab(selectedBooking)}
                  variant="outline"
                  className="rounded-full px-4 py-2 text-xs font-bold border-[#DFDCE8] bg-white hover:bg-[#F6F5FA] text-[#212121] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <FileText size={13} className="text-[#E8826B]" />
                  <span>Tax Invoice</span>
                </Button>

                <Button
                  onClick={() => setDetailOpen(false)}
                  className="rounded-full px-5 py-2 text-xs font-bold bg-[#212121] hover:bg-[#141414] text-white cursor-pointer shadow-2xs"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Offline Booking Modal */}
      <OfflineBookingModal
        open={offlineModalOpen}
        onOpenChange={setOfflineModalOpen}
        initialData={quickBookingData}
        onSuccess={loadData}
      />
    </div>
  );
}
