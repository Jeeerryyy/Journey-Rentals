/* Brex / Urbanist Design System — Exact Parity for Journey Rentals */
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Search, Calendar, MapPin, ExternalLink, Ticket, AlertCircle, Loader2, ShieldCheck, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import api, { formatINR, safeFormatDate } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { openBookingInvoiceInNewTab } from "@/website/utils/invoiceGenerator";

export default function MyBookingsModal({ open, onOpenChange }) {
  const { customer, user } = useAuth();
  const activeUser = customer || user;
  const [query, setQuery] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!open) return;
    const savedEmail = activeUser?.email || "";
    if (savedEmail) {
      setQuery(savedEmail);
      fetchBookings(savedEmail);
    }
  }, [open, activeUser]);

  const fetchBookings = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q || q.trim().length < 3) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.bookings.getMyBookings();
      const list = res.bookings || res.data || (Array.isArray(res) ? res : []);
      setBookings(list);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#F6F5FA] text-[#212121] border border-[#DFDCE8] rounded-[24px] p-6 sm:p-8 font-body" data-testid="my-bookings-modal">
        <DialogHeader className="mb-4 text-left">
          <DialogTitle className="font-display text-xl sm:text-2xl font-bold text-[#212121] flex items-center gap-3">
            Customer Profile &amp; My Bookings
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-[#6F6E73] mt-1 font-normal">
            View your verified Solapur rental history and reservation details.
          </DialogDescription>
        </DialogHeader>

        {/* Logged-In User Profile Card */}
        {activeUser && (
          <div className="bg-white border border-[#DFDCE8] rounded-[18px] p-4 mb-4 flex items-center justify-between gap-4 shadow-sm" data-testid="logged-in-profile-card">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-full bg-[#212121] text-white flex items-center justify-center font-display font-bold text-sm shrink-0">
                {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <div className="font-display font-bold text-[#212121] text-sm sm:text-base leading-tight">{activeUser.name || "Customer Account"}</div>
                <div className="text-xs text-[#6F6E73] mt-0.5">{activeUser.email} {activeUser.phone ? `· ${activeUser.phone}` : ""}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-[#4B8039] bg-[#CFDECA] px-3 py-1 rounded-full shrink-0">
              <ShieldCheck size={12} className="text-[#4B8039]" />
              <span>Verified</span>
            </div>
          </div>
        )}

        {/* Search Bar Input */}
        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99989E]" />
            <Input
              type="text"
              placeholder="Enter email address or booking reference ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-11 rounded-full bg-white border-[#DFDCE8] text-[#212121] font-body text-xs font-normal focus-visible:ring-1 focus-visible:ring-[#212121]"
              data-testid="profile-booking-search-input"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-[#212121] hover:bg-[#141414] active:bg-[#000000] text-white rounded-full px-6 h-11 uppercase tracking-wider text-xs font-bold shadow-sm cursor-pointer"
            data-testid="profile-booking-search-btn"
          >
            {loading ? <Loader2 size={14} className="animate-spin text-white" /> : "Search"}
          </Button>
        </form>

        {/* Results Display */}
        <div className="space-y-3">
          {loading && (
            <div className="py-10 text-center text-[#6F6E73] flex flex-col items-center gap-2">
              <Loader2 size={22} className="animate-spin text-[#212121]" />
              <span className="text-xs uppercase tracking-wider font-normal">Finding your bookings…</span>
            </div>
          )}

          {!loading && searched && bookings.length === 0 && (
            <div className="py-8 text-center bg-white border border-[#DFDCE8] rounded-[20px] p-6 shadow-sm">
              <AlertCircle size={24} className="mx-auto text-[#212121] mb-2 opacity-80" />
              <div className="font-display font-bold text-[#212121] text-sm">No Bookings Found</div>
              <p className="text-xs mt-1 max-w-sm mx-auto text-[#6F6E73]">
                We couldn't find any active or past rentals matching "{query}".
              </p>
            </div>
          )}

          {!loading && bookings.map((b) => {
            const veh = b.vehicleId || {};
            const refId = b.referenceId || b._id?.slice(-8).toUpperCase();
            return (
              <div
                key={b._id || b.id}
                className="bg-white border border-[#DFDCE8] rounded-[20px] p-5 shadow-sm hover:border-[#212121] transition-all relative overflow-hidden text-left"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DFDCE8]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#F6F5FA] text-[#212121] flex items-center justify-center font-bold text-xs border border-[#DFDCE8]">
                      <Ticket size={14} />
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-[#99989E] font-bold">Booking Ref</div>
                      <div className="font-mono text-xs font-bold text-[#212121]">#{refId}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${
                        b.status === "confirmed"
                          ? "bg-[#CFDECA] text-[#4B8039]"
                          : b.status === "completed"
                          ? "bg-[#212121] text-white"
                          : "bg-[#e1b808] text-[#212121]"
                      }`}
                    >
                      {b.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => openBookingInvoiceInNewTab(b)}
                      className="px-2.5 py-1 rounded-full bg-[#F6F5FA] hover:bg-white text-[#212121] border border-[#DFDCE8] text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      title="Download Tax Invoice"
                    >
                      <FileText size={11} className="text-[#3F5F8C]" />
                      <span>Invoice</span>
                    </button>
                    <Link
                      to={`/booking-success/${b._id || b.referenceId}`}
                      onClick={() => onOpenChange(false)}
                      className="p-1.5 rounded-full bg-[#F6F5FA] hover:bg-[#212121] hover:text-white transition-colors text-[#212121] text-xs flex items-center gap-1 border border-[#DFDCE8]"
                      title="View Voucher"
                    >
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>

                <div className="py-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="flex-1 space-y-1">
                    <h4 className="font-display text-sm font-bold text-[#212121]">
                      {veh.title || `${veh.brand || ''} ${veh.model || 'Vehicle'}`.trim()}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#6F6E73] font-normal">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-[#212121]" />
                        {safeFormatDate(b.pickupDate || b.bikeDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-[#212121]" />
                        {b.pickupLocation || "Solapur Hub"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right sm:self-center">
                    <div className="text-[9px] uppercase tracking-wider text-[#99989E] font-medium">Total Rate</div>
                    <div className="font-display text-base font-bold text-[#212121]">
                      {formatINR(b.totalPrice || 0)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
