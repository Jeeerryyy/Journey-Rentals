/* Urbanist Design System — Exact Parity with DriveHub Goa CRM Architecture */
import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, Car, ClipboardList, Ticket, LogOut, CalendarDays,
  ShieldCheck, Search, Bell, Sparkles, SlidersHorizontal, Settings, Clock, BarChart3, ChevronDown, Menu, X, ArrowLeft
} from "lucide-react";
import OfflineBookingModal from "../components/OfflineBookingModal";
import EnquiryModal from "../components/EnquiryModal";
import NotificationCenter from "../components/NotificationCenter";
import BrandLogo from "@/website/components/BrandLogo";

const MAIN_LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/admin/fleet", label: "Fleet", icon: Car },
  { to: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const { owner, ownerLogout, user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    if (ownerLogout) await ownerLogout();
    else if (logout) await logout();
    nav("/admin/login");
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#F6F5FA] p-1 sm:p-2.5 md:p-4 font-body text-[#212121] relative overflow-x-hidden flex flex-col justify-start md:justify-center text-left">
      {/* Background Geometric Line Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full border border-white/60" />
        <div className="absolute top-1/4 -right-40 w-[800px] h-[800px] rounded-full border border-white/50" />
        <div className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] rounded-full border border-white/60" />
      </div>

      {/* Main Floating Dashboard Shell Container */}
      <div className="relative z-10 max-w-[1600px] w-full mx-auto bg-[#F6F5FA] rounded-[1.25rem] sm:rounded-[2rem] shadow-xl border border-[#DFDCE8] h-[calc(100dvh-0.5rem)] sm:h-[calc(100dvh-1.25rem)] md:h-[calc(100dvh-2rem)] flex flex-col lg:flex-row overflow-hidden">
        
        {/* MOBILE HEADER BAR */}
        <div className="lg:hidden bg-[#FFFFFF] border-b border-[#DFDCE8] px-3.5 py-2.5 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white border border-[#DFDCE8] text-[#212121] font-bold cursor-pointer hover:bg-[#F6F5FA] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
            <BrandLogo size="sm" showSubtitle={false} />
          </div>

          <div className="flex items-center gap-2">
            <NotificationCenter />
            <NavLink
              to="/admin/settings"
              className="w-8 h-8 rounded-full overflow-hidden border border-[#DFDCE8] bg-white p-0.5 flex items-center justify-center shadow-2xs"
              title="Admin Profile"
            >
              <img src="/logo.png" alt="Journey Rentals Logo" className="w-full h-full object-contain" />
            </NavLink>
          </div>
        </div>

        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* LEFT SIDEBAR */}
        <aside
          className={`w-full sm:w-72 lg:w-64 bg-[#FFFFFF] border-r border-[#DFDCE8] p-5 sm:p-6 flex flex-col justify-between shrink-0 transition-all duration-300 ${
            mobileMenuOpen
              ? "fixed top-0 bottom-0 left-0 z-50 shadow-2xl bg-[#F6F5FA] overflow-y-auto"
              : "hidden lg:flex"
          }`}
        >
          <div>
            {/* Mobile Header Inside Drawer */}
            <div className="flex lg:hidden items-center justify-between pb-4 mb-4 border-b border-[#DFDCE8]">
              <div className="flex items-center gap-2">
                <BrandLogo size="sm" />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-xl bg-white border border-[#DFDCE8] text-[#212121]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Desktop Brand Logo Header */}
            <div className="hidden lg:flex items-center justify-center mb-8 px-2">
              <BrandLogo size="md" />
            </div>

            {/* Navigation Groups */}
            <div className="space-y-6">
              {/* Main Section */}
              <div>
                <div className="px-3 mb-2 text-[10px] uppercase font-bold tracking-widest text-[#9896A1]">
                  Main Menu
                </div>
                <nav className="relative space-y-1">
                  {/* Liquid Jelly Pill Active Background Indicator */}
                  {(() => {
                    const activeIndex = MAIN_LINKS.findIndex(({ to, end }) =>
                      end ? location.pathname === to : location.pathname.startsWith(to) && to !== "/admin"
                    );
                    if (activeIndex === -1) return null;
                    return (
                      <div
                        className="absolute left-0 right-0 h-[38px] bg-[#212121] rounded-full shadow-md pointer-events-none transition-all duration-300"
                        style={{
                          transform: `translateY(${activeIndex * 42}px)`,
                          transitionTimingFunction: "cubic-bezier(0.34, 1.5, 0.64, 1)",
                        }}
                      />
                    );
                  })()}

                  {MAIN_LINKS.map(({ to, label, icon: Icon, end }) => {
                    const isActive = end
                      ? location.pathname === to
                      : location.pathname.startsWith(to) && to !== "/admin";
                    return (
                      <NavLink
                        key={label}
                        to={to}
                        end={end}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`relative z-10 flex items-center gap-3 px-4 h-[38px] rounded-full text-xs font-semibold tracking-wide transition-colors duration-200 ${
                          isActive
                            ? "text-white font-bold"
                            : "text-[#6F6E73] hover:text-[#212121] hover:bg-[#F6F5FA]"
                        }`}
                      >
                        <Icon size={16} className={`transition-colors duration-200 ${isActive ? "text-white" : "text-[#6F6E73]"}`} />
                        <span>{label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              {/* Tools / Quick Actions Section */}
              <div>
                <div className="px-3 mb-2 text-[10px] uppercase font-bold tracking-widest text-[#9896A1]">
                  Quick Actions
                </div>
                <nav className="space-y-1">
                  <button
                    onClick={() => { setOfflineModalOpen(true); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide text-[#6F6E73] hover:text-[#212121] hover:bg-[#F6F5FA] transition-all text-left cursor-pointer"
                  >
                    <Clock size={16} className="text-[#6F6E73]" />
                    <span>New Booking</span>
                  </button>

                  <button
                    onClick={() => { setEnquiryModalOpen(true); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide text-[#6F6E73] hover:text-[#212121] hover:bg-[#F6F5FA] transition-all text-left cursor-pointer"
                  >
                    <BarChart3 size={16} className="text-[#6F6E73]" />
                    <span>Leads &amp; Enquiries</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* User Footer Account Card */}
          <div className="pt-3 mt-auto border-t border-[#DFDCE8] shrink-0">
            <div className="flex items-center justify-between gap-2 p-2 bg-[#F6F5FA] rounded-2xl border border-[#DFDCE8]">
              <NavLink
                to="/admin/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0 p-1 hover:bg-[#FFFFFF] rounded-xl transition-colors"
                title="View Admin Profile & Settings"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#DFDCE8] bg-white p-0.5 shrink-0 flex items-center justify-center shadow-2xs">
                  <img src="/logo.png" alt="Journey Rentals Logo" className="w-full h-full object-contain" />
                </div>
                <div className="truncate">
                  <div className="font-bold text-xs text-[#212121] truncate">{owner?.name || "Journey Admin"}</div>
                  <div className="text-[10px] text-[#6F6E73] truncate">{owner?.email || "admin@journeyrentals.in"}</div>
                </div>
              </NavLink>

              <button
                onClick={handleSignOut}
                className="p-2 rounded-xl text-[#E03131] hover:bg-red-50 border border-[#E03131]/30 transition-all cursor-pointer shrink-0 flex items-center gap-1.5 text-[11px] font-bold"
                title="Sign out of owner console"
              >
                <LogOut size={15} />
                <span className="hidden xl:inline">Exit</span>
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN WORKSPACE */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto overscroll-y-contain no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-[#F6F5FA]">
          {/* Desktop Header Bar */}
          <header className="hidden lg:flex p-4 sm:p-6 pb-3 sm:pb-4 flex-wrap items-center justify-between gap-4 border-b border-[#DFDCE8] bg-[#F6F5FA]">
            <div className="text-xs font-bold uppercase tracking-wider text-[#6F6E73]">
              Executive CRM Dashboard
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <Link
                to="/"
                className="text-xs font-bold text-[#6F6E73] hover:text-[#212121] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#DFDCE8] hover:bg-[#F6F5FA] transition-colors"
                title="Open Public Customer Site"
              >
                <ArrowLeft size={13} />
                <span>Live Website</span>
              </Link>

              <NotificationCenter />

              <NavLink
                to="/admin/settings"
                className="w-9 h-9 rounded-full overflow-hidden border border-[#DFDCE8] shadow-2xs shrink-0 bg-white p-1 flex items-center justify-center hover:ring-2 hover:ring-[#212121] transition-all cursor-pointer"
                title="Admin Settings & Profile"
              >
                <img src="/logo.png" alt="Journey Rentals Logo" className="w-full h-full object-contain" />
              </NavLink>
            </div>
          </header>

          {/* Page Content Outlet */}
          <div className="p-4 sm:p-6 lg:p-8 flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Global Admin Modals */}
      <OfflineBookingModal open={offlineModalOpen} onOpenChange={setOfflineModalOpen} />
      <EnquiryModal open={enquiryModalOpen} onOpenChange={setEnquiryModalOpen} />
    </div>
  );
}
