/* Brex / Urbanist Design System — Exact DriveHub Goa Parity */
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SEO from "../components/seo/SEO";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Skeleton } from "@/ui/skeleton";
import { toast } from "sonner";
import {
  User,
  Phone,
  Mail,
  Ticket,
  Car,
  Calendar,
  MapPin,
  Loader2,
  ShieldCheck,
  LogOut,
  ArrowRight,
  Check,
  Copy,
  Clock,
  MessageSquare,
  Shield,
  Search,
  Bike,
  HelpCircle,
  FileText,
} from "lucide-react";
import api, { formatINR, safeFormatDate, formatApiError } from "@/lib/api";
import { openBookingInvoiceInNewTab } from "@/website/utils/invoiceGenerator";

export default function CustomerProfile() {
  const { customer, user, customerLogout, refreshCustomer } = useAuth();
  const activeUser = customer || user;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") || "bookings";
  const setActiveTab = (tab) => setSearchParams({ tab });

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingFilter, setBookingFilter] = useState("all");
  const [bookingSearch, setBookingSearch] = useState("");

  const [profileForm, setProfileForm] = useState({
    name: activeUser?.name || "",
    phone: activeUser?.phone || "",
    email: activeUser?.email || "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (activeUser) {
      setProfileForm({
        name: activeUser.name || "",
        phone: activeUser.phone || "",
        email: activeUser.email || "",
      });
    }
  }, [activeUser]);

  // Load Bookings
  useEffect(() => {
    async function loadBookings() {
      if (!activeUser) {
        setLoadingBookings(false);
        return;
      }
      try {
        setLoadingBookings(true);
        const res = await api.bookings.getMyBookings();
        const list = res.bookings || res.data || (Array.isArray(res) ? res : []);
        setBookings(list);
      } catch (err) {
        console.warn("Failed to load customer bookings:", err);
      } finally {
        setLoadingBookings(false);
      }
    }
    loadBookings();
  }, [activeUser]);

  const handleLogout = async () => {
    try {
      await customerLogout();
      toast.success("Signed out successfully");
      navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.customer.updateProfile(profileForm);
      if (refreshCustomer) await refreshCustomer();
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(formatApiError(err) || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to request cancellation for this booking?")) return;
    try {
      await api.bookings.cancelBooking(bookingId);
      toast.success("Cancellation request submitted");
      const res = await api.bookings.getMyBookings();
      setBookings(res.bookings || []);
    } catch (err) {
      toast.error(formatApiError(err) || "Failed to cancel booking");
    }
  };

  const filteredBookings = useMemo(() => {
    let list = [...bookings];
    if (bookingFilter !== "all") {
      list = list.filter((b) => (b.status || "").toLowerCase() === bookingFilter.toLowerCase());
    }
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase().trim();
      list = list.filter((b) =>
        (b.referenceId || b._id || "").toLowerCase().includes(q) ||
        (b.vehicleId?.title || b.vehicleId?.model || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [bookings, bookingFilter, bookingSearch]);

  if (!activeUser && !loadingBookings) {
    return (
      <div className="min-h-screen bg-[#F6F5FA] text-[#212121] font-body no-scroll-x">
        <Navbar />
        <div className="max-w-md mx-auto pt-36 pb-20 px-4 text-center space-y-4">
          <User size={48} className="mx-auto text-[#99989E]" />
          <h2 className="text-xl font-bold">Please Sign In</h2>
          <p className="text-xs text-[#6F6E73]">
            Access your active Solapur reservations, trip vouchers, and account settings.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-2.5 rounded-full bg-[#212121] text-white text-xs font-bold uppercase tracking-wider"
          >
            Sign In Now
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F5FA] text-[#212121] font-body no-scroll-x">
      <SEO
        title="My Profile & Reservations | Journey Rentals Solapur"
        description="Manage your self-drive car and bike reservations, check booking status, and update KYC documents."
        canonical="/profile"
      />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16">
        {/* User Hero Banner */}
        <div className="bg-white rounded-[24px] border border-[#DFDCE8] p-5 sm:p-7 shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#e1b808] text-[#212121] flex items-center justify-center font-bold text-xl font-display shadow-2xs">
              {(activeUser?.name || "U")[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#212121] font-display">
                {activeUser?.name || "Customer"}
              </h1>
              <div className="flex items-center gap-3 text-xs text-[#6F6E73] mt-0.5">
                <span className="flex items-center gap-1"><Mail size={12} /> {activeUser?.email}</span>
                {activeUser?.phone && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Phone size={12} /> {activeUser?.phone}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F6F5FA] hover:bg-[#212121] hover:text-white border border-[#DFDCE8] text-xs font-bold text-[#212121] transition-all cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-6 border-b border-[#DFDCE8] pb-3 overflow-x-auto no-scrollbar font-mono">
          {[
            { key: "bookings", label: "My Bookings", icon: Ticket },
            { key: "profile", label: "Profile Details", icon: User },
            { key: "support", label: "Help & Support", icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`h-10 px-5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-[#212121] text-white shadow-xs"
                    : "bg-white text-[#6F6E73] hover:text-[#212121] border border-[#DFDCE8]"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Bookings */}
        {activeTab === "bookings" && (
          <div className="space-y-4 text-left">
            {/* Filter bar */}
            <div className="bg-white rounded-[20px] p-3 sm:p-4 border border-[#DFDCE8] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#99989E]" />
                <input
                  type="text"
                  placeholder="Search by Reference ID or Vehicle..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-full bg-[#F6F5FA] border border-[#DFDCE8] text-xs font-medium text-[#212121]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
                {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setBookingFilter(status)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-mono font-bold uppercase transition-all ${
                      bookingFilter === status
                        ? "bg-[#212121] text-white"
                        : "bg-[#F6F5FA] text-[#6F6E73] hover:text-[#212121]"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings List */}
            {loadingBookings ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-[24px] border border-[#DFDCE8] p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-28 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <div className="flex items-start gap-3.5">
                      <Skeleton className="w-16 h-12 rounded-xl" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-36 rounded-lg" />
                        <Skeleton className="h-3 w-48 rounded-full" />
                        <Skeleton className="h-3 w-32 rounded-full" />
                      </div>
                    </div>
                    <div className="pt-3 border-t border-[#DFDCE8] flex items-center justify-between">
                      <Skeleton className="h-6 w-24 rounded-lg" />
                      <Skeleton className="h-8 w-28 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-white rounded-[24px] border border-[#DFDCE8] p-12 text-center space-y-3 shadow-sm">
                <Car size={40} className="mx-auto text-[#99989E]" />
                <h3 className="font-bold text-base text-[#212121]">No Reservations Found</h3>
                <p className="text-xs text-[#6F6E73] max-w-sm mx-auto">
                  You have not made any bookings yet or none match your search filter.
                </p>
                <Link
                  to="/fleet"
                  className="inline-block px-5 py-2.5 rounded-full bg-[#212121] text-white text-xs font-bold uppercase tracking-wider"
                >
                  Explore Fleet &amp; Book
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBookings.map((b) => {
                  const veh = b.vehicleId || {};
                  const isBike = b.bookingType === "bike";
                  const refId = b.referenceId || b._id?.slice(-8).toUpperCase();
                  const status = b.status || "Pending";

                  return (
                    <div
                      key={b._id}
                      className="bg-white rounded-[24px] border border-[#DFDCE8] p-5 shadow-sm space-y-4 hover:border-[#212121] transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[#6F6E73]">#{refId}</span>
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase font-mono ${
                              status === "confirmed"
                                ? "bg-[#CFDECA] text-[#4B8039]"
                                : status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-[#e1b808] text-[#212121]"
                            }`}
                          >
                            {status}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-base text-[#212121]">
                            {veh.title || `${veh.brand || ''} ${veh.model || 'Vehicle'}`.trim()}
                          </h4>
                          <p className="text-xs text-[#6F6E73] flex items-center gap-1 mt-0.5">
                            <MapPin size={12} className="text-[#3F5F8C]" /> {b.pickupLocation || "Solapur Railway Station"}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8] space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-[#6F6E73]">Schedule</span>
                            <span className="font-bold text-[#212121]">
                              {isBike
                                ? `${safeFormatDate(b.bikeDate)} (${b.bikeSlot})`
                                : `${safeFormatDate(b.pickupDate)} – ${safeFormatDate(b.returnDate)} (${b.totalDays}d)`}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-[#DFDCE8] pt-1.5">
                            <span className="text-[#6F6E73]">Total Rate</span>
                            <span className="font-bold text-[#212121] font-mono">{formatINR(b.totalPrice || 0)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#DFDCE8] flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => openBookingInvoiceInNewTab(b)}
                          className="px-3.5 py-2 rounded-full bg-[#F6F5FA] hover:bg-white text-[#212121] border border-[#DFDCE8] text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                        >
                          <FileText size={13} className="text-[#3F5F8C]" />
                          <span>Tax Invoice</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/919604437794?text=Hi%20Journey%20Rentals,%20checking%20status%20for%20Booking%20%23${refId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-2 rounded-full bg-[#EBF7EE] text-[#1E7E34] hover:bg-[#25D366] hover:text-white border border-[#C3E6CB] text-xs font-bold flex items-center gap-1.5 transition-all"
                          >
                            <MessageSquare size={13} />
                            <span>WhatsApp Dispatch</span>
                          </a>

                          {status !== "cancelled" && status !== "completed" && (
                            <button
                              type="button"
                              onClick={() => handleCancelBooking(b._id)}
                              className="px-3.5 py-2 rounded-full bg-[#F6F5FA] hover:bg-red-50 text-red-600 border border-[#DFDCE8] text-xs font-bold transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Profile Details */}
        {activeTab === "profile" && (
          <div className="max-w-xl mx-auto bg-white rounded-[24px] border border-[#DFDCE8] p-6 sm:p-8 shadow-sm text-left">
            <h2 className="font-display text-xl font-bold text-[#212121] mb-1">Account Information</h2>
            <p className="text-xs text-[#6F6E73] mb-5">
              Update your primary driver contact details for quick checkout.
            </p>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-[#6F6E73] mb-1.5 block">Full Legal Name</Label>
                <Input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="h-11 rounded-xl bg-[#F6F5FA] border-[#DFDCE8] text-xs font-medium"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-[#6F6E73] mb-1.5 block">Email Address</Label>
                <Input
                  type="email"
                  value={profileForm.email}
                  disabled
                  className="h-11 rounded-xl bg-[#F6F5FA] border-[#DFDCE8] text-xs font-medium opacity-70"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-[#6F6E73] mb-1.5 block">Phone Number</Label>
                <Input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="Enter 10-digit phone number"
                  className="h-11 rounded-xl bg-[#F6F5FA] border-[#DFDCE8] text-xs font-medium"
                />
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full bg-[#212121] hover:bg-[#141414] text-white font-bold rounded-full h-11 text-xs uppercase tracking-wider"
                >
                  {savingProfile ? <Loader2 size={14} className="animate-spin mr-2" /> : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Help & Support */}
        {activeTab === "support" && (
          <div className="max-w-2xl mx-auto space-y-4 text-left">
            <div className="bg-white rounded-[24px] border border-[#DFDCE8] p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-base text-[#212121]">Solapur Operations Helpline</h3>
              <p className="text-xs text-[#6F6E73]">
                For fast assistance regarding railway station handovers, delayed trains, or extension requests:
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href="https://wa.me/919604437794"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-full bg-[#212121] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  <MessageSquare size={14} /> WhatsApp Support
                </a>
                <a
                  href="tel:+919604437794"
                  className="px-4 py-2 rounded-full bg-[#F6F5FA] text-[#212121] border border-[#DFDCE8] text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  <Phone size={14} /> Call +91 96044 37794
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
