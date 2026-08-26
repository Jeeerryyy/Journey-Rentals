/* Brex Design System — Exact DriveHub Goa Parity for Journey Rentals */
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, ArrowRight, Car } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import MyBookingsModal from "../MyBookingsModal";
import BrandLogo from "../BrandLogo";

const navItems = [
  { label: "Home", href: "/", exact: true },
  { label: "Our Fleet", href: "/fleet" },
  { label: "Why Journey Rentals", href: "#benefits" },
  { label: "Locations", href: "#locations" },
  { label: "Reviews", href: "#reviews" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const { user, customer, logout, customerLogout } = useAuth();
  const activeUser = user || customer;
  const navigate = useNavigate();
  const nav = navigate;
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 15);

      if (currentScrollY <= 10) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 60) {
        setVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleNavClick = (e, href) => {
    if (href.startsWith("/")) {
      e.preventDefault();
      if (location.pathname !== href) {
        navigate(href);
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      setMobileMenuOpen(false);
      return;
    }
    if (href === "#top" || href === "#hero") {
      e.preventDefault();
      if (location.pathname !== "/") {
        navigate("/");
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      setMobileMenuOpen(false);
      return;
    }
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.replace("#", "");

      const performScroll = () => {
        const el = document.getElementById(targetId);
        if (el) {
          const navHeight = 64;
          const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: elementPosition - navHeight, behavior: "smooth" });
        }
      };

      if (location.pathname !== "/") {
        navigate("/", { state: { scrollTo: targetId } });
      } else {
        performScroll();
      }
      setMobileMenuOpen(false);
    }
  };

  const isLinkActive = (path, exact = false) => {
    if (path.startsWith("#")) return false;
    return exact ? location.pathname === path : location.pathname.startsWith(path);
  };

  return (
    <>
      {/* ── MAIN HEADER / NAVBAR ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out glass-nav-header ${
          visible ? "translate-y-0" : "-translate-y-full"
        } ${scrolled ? "shadow-xs py-1" : "py-1.5"}`}
      >
        <nav className="max-w-7xl mx-auto px-5 sm:px-8" aria-label="Main navigation">
          <div className="flex items-center justify-between h-14">
            {/* Left: Brand Logo */}
            <Link
              to="/"
              className="flex items-center shrink-0 group"
              aria-label="Journey Rentals Solapur Home"
              data-testid="nav-logo"
            >
              <BrandLogo size="md" />
            </Link>

            {/* Center: Nav Menu (Desktop) */}
            <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`relative py-1.5 px-3 text-sm font-medium transition-all rounded-full ${
                    isLinkActive(item.href, item.exact)
                      ? "text-[#212121] bg-[#e1b808] font-bold shadow-2xs"
                      : "text-[#212121] hover:bg-[#e1b808]/50 hover:text-[#212121]"
                  }`}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Right: Actions */}
            <div className="hidden md:flex items-center gap-4 shrink-0">
              {/* If signed in: Profile/My Account. If NOT signed in: Sign In */}
              {activeUser ? (
                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    to="/profile"
                    className="relative py-1 px-3 rounded-full flex items-center gap-1.5 text-sm font-medium text-[#212121] hover:bg-[#e1b808]/40 transition-colors"
                    title="My Profile & Bookings"
                    data-testid="nav-user-profile-btn"
                  >
                    {activeUser.picture || activeUser.avatarUrl ? (
                      <img src={activeUser.picture || activeUser.avatarUrl} alt="Profile" className="w-5 h-5 rounded-full object-cover shrink-0 border border-[#DFDCE8]" />
                    ) : (
                      <User size={15} className="shrink-0 text-[#212121]" />
                    )}
                    <span>{activeUser.name ? activeUser.name.split(' ')[0] : 'My Account'}</span>
                  </Link>
                  <button
                    onClick={() => {
                      if (customerLogout) customerLogout();
                      else if (logout) logout();
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-normal text-[#6F6E73] hover:text-[#212121] hover:bg-[#DFDCE8]/50 transition-all cursor-pointer"
                    title="Sign Out"
                    data-testid="nav-logout-btn"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => nav("/login")}
                  className="relative py-1.5 px-4 rounded-full flex items-center gap-1.5 text-sm font-medium text-[#212121] hover:bg-[#e1b808]/40 transition-colors cursor-pointer"
                  title="Sign In to your account"
                  data-testid="nav-signin-btn"
                >
                  <User size={14} className="shrink-0 text-[#212121]" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Primary Book Now CTA (Urbanist Pill) */}
              <button
                onClick={() => nav("/fleet")}
                className="bg-[#212121] hover:bg-[#141414] active:bg-[#000000] text-white font-medium text-xs uppercase tracking-wider px-5 py-2.5 h-10 rounded-full flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-98"
                data-testid="nav-book-cta"
              >
                <span>Book Now</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-[#212121] hover:bg-[#e1b808]/40 active:scale-95 transition-all focus:outline-none cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              data-testid="nav-menu-toggle"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="lg:hidden fixed top-[56px] left-0 right-0 z-50 px-4 pb-6 pt-3 flex flex-col gap-4 bg-white border-b border-[#DFDCE8] rounded-b-2xl shadow-lg animate-slideDown max-h-[calc(100vh-56px)] overflow-y-auto">
              <div className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`py-2 px-3.5 text-sm font-medium rounded-full transition-colors flex items-center justify-between ${
                      isLinkActive(item.href, item.exact)
                        ? "text-[#212121] bg-[#e1b808] font-bold"
                        : "text-[#212121] hover:bg-[#F6F5FA]"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ArrowRight size={14} className="text-[#99989E]" />
                  </a>
                ))}
              </div>

              {/* Mobile CTA */}
              <div className="pt-3 border-t border-[#DFDCE8] flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    nav("/fleet");
                  }}
                  className="w-full bg-[#212121] hover:bg-[#141414] text-white font-medium text-xs uppercase tracking-wider py-3 rounded-full flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>Explore Fleet &amp; Book</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Customer Profile & My Bookings Modal */}
      <MyBookingsModal open={showProfileModal} onOpenChange={setShowProfileModal} />
    </>
  );
}