/* Brex Design System — Exact DriveHub Goa Parity for Journey Rentals */
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SEO from "../components/seo/SEO";
import { WebSiteSearchSchema, OrganizationFounderSchema } from "../components/seo/AdditiveSchemas";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import LocationSection from "../components/LocationSection";
import VehicleCard from "../components/VehicleCard";
import CustomSelect from "../components/CustomSelect";
import { Button } from "@/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { toast } from "sonner";
import {
  Car,
  Check,
  MapPin,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Star,
  Shield,
  Zap,
  Phone,
  ArrowRight,
  Fuel,
  Users,
  Cog,
  Sparkles,
  Headphones,
  CheckCircle2,
  MessageSquare,
  Tag,
  Copy,
  Gift,
  Flame,
  Percent,
  Clock,
} from "lucide-react";
import api, { formatINR, getOptimizedImageUrl } from "@/lib/api";

export function GoogleIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

const POSTER_BANNERS = [
  {
    id: "poster-darshan",
    posterImage: "/banners/journey_darshan_offer.jpg",
    badge: "🙏 PILGRIMAGE SPECIAL TOURS",
    title: "Akkalkot, Tuljapur & Pandharpur Temple Tours",
    subtitle: "Special pilgrimage rental packages with direct Solapur Railway Station vehicle handover and unlimited km options.",
    dailyRate: "₹1,500/day",
    ctaText: "Explore Temple Fleet",
    ctaHref: "/fleet",
  },
  {
    id: "poster-weekend",
    posterImage: "/banners/journey_weekend_offer.jpg",
    badge: "🔥 WEEKEND GETAWAY SPECIALS",
    title: "Weekend Highway Trips Across Maharashtra",
    subtitle: "Spotless, sanitized fleet ready for your highway roadtrips across Maharashtra with zero hidden charges.",
    dailyRate: "₹1,200/day",
    ctaText: "Explore Weekend Cars",
    ctaHref: "/fleet",
  },
  {
    id: "poster-suv",
    posterImage: "/banners/journey_suv_offer.jpg",
    badge: "👑 PREMIUM 7-SEATER & 4x4 FLEET",
    title: "Toyota Fortuner, Thar 4x4 & Ertiga",
    subtitle: "Commanding road presence & spacious luxury for grand family highway trips and group travel.",
    dailyRate: "₹2,500/day",
    ctaText: "Reserve 7-Seater SUV",
    ctaHref: "/fleet?category=SUV",
  },
  {
    id: "poster-bikes",
    posterImage: "/banners/journey_bikes_offer.jpg",
    badge: "⚡ HOURLY BIKE & SCOOTER RENTALS",
    title: "Royal Enfield & Activa from ₹79/hr",
    subtitle: "Beat city traffic or cruise locally with sanitized two-wheelers, complimentary helmets & instant delivery.",
    dailyRate: "₹79/hr",
    ctaText: "Rent Hourly Bike",
    ctaHref: "/fleet?type=bike",
  },
];

const STARTER_FEATURED_VEHICLES = [
  {
    id: "v-thar-4x4",
    title: "Mahindra Thar 4x4 Hard Top",
    category: "SUV",
    daily_rate: 3500,
    fuel_type: "Diesel",
    transmission: "Automatic",
    seating: 4,
    image_url: "/vehicles/hero_thar_front_cutout.png",
    status: "Available",
    description: "Iconic 4x4 convertible hard top with 4WD capabilities, perfect for highways and pilgrimage trips.",
  },
  {
    id: "v-creta-auto",
    title: "Hyundai Creta SX (O) Automatic",
    category: "SUV",
    daily_rate: 2600,
    fuel_type: "Petrol",
    transmission: "Automatic",
    seating: 5,
    image_url: "/vehicles/hero_creta_front_cutout.png",
    status: "Available",
    description: "Premium panoramic sunroof SUV with ventilated seats, cruise control and supreme boot space.",
  },
  {
    id: "v-swift-auto",
    title: "Maruti Suzuki Swift ZXi Auto",
    category: "Hatchback",
    daily_rate: 1400,
    fuel_type: "Petrol",
    transmission: "Automatic",
    seating: 5,
    image_url: "/vehicles/hero_swift_front_cutout.png",
    status: "Available",
    description: "Solapur's most popular fuel-efficient automatic hatchback. Compact and nimble in city traffic.",
  },
  {
    id: "v-convertible-cooper",
    title: "Mini Cooper S Convertible",
    category: "Convertible",
    daily_rate: 7500,
    fuel_type: "Petrol",
    transmission: "Automatic",
    seating: 4,
    image_url: "/vehicles/hero_convertible_front_cutout.png",
    status: "Available",
    description: "British racing heritage open-top luxury convertible with twin-power turbo performance.",
  },
  {
    id: "v-baleno-alpha",
    title: "Maruti Suzuki Baleno Alpha",
    category: "Hatchback",
    daily_rate: 1500,
    fuel_type: "Petrol",
    transmission: "Automatic",
    seating: 5,
    image_url: "/vehicles/maruti_swift_old.png",
    status: "Available",
    description: "Spacious premium hatchback with heads-up display, 360 camera, and excellent fuel economy.",
  },
  {
    id: "v-brezza-zxi",
    title: "Maruti Suzuki Brezza ZXi+",
    category: "SUV",
    daily_rate: 2200,
    fuel_type: "Petrol",
    transmission: "Automatic",
    seating: 5,
    image_url: "/vehicles/cat_suv.jpg",
    status: "Available",
    description: "High ground clearance compact SUV with electronic sunroof and wireless smartphone charging.",
  },
];

const CATEGORIES = [
  {
    title: "Economy & Hatchbacks",
    category: "Hatchback",
    desc: "Fuel-efficient, easy to park in Solapur city lanes & temple market streets.",
    models: "Swift, Baleno, i20, Tiago",
    startPrice: "₹1,400",
    image: "/vehicles/cat_hatchback.jpg",
    fallback: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80",
    isFeatured: false,
    seats: "4-5 Seats",
    ac: "Air Conditioner",
    rating: "5.0",
  },
  {
    title: "SUVs & 4x4 Thar",
    category: "SUV",
    desc: "Commanding road view, high ground clearance & spacious Maharashtra tour style.",
    models: "Mahindra Thar 4x4, Creta, Brezza, XUV 3XO",
    startPrice: "₹2,400",
    image: "/vehicles/cat_suv.jpg",
    fallback: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80",
    isFeatured: true,
    badge: "Most Booked",
    seats: "4-7 Seats",
    ac: "Air Conditioner",
    rating: "5.0",
  },
  {
    title: "Luxury & Convertibles",
    category: "Convertible",
    desc: "Open-top cruising for unforgettable highway drives, photoshoots & VIP events.",
    models: "Mini Cooper, BMW Z4, Mercedes C300",
    startPrice: "₹7,500",
    image: "/vehicles/cat_convertible.jpg",
    fallback: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
    isFeatured: false,
    seats: "2-4 Seats",
    ac: "Air Conditioner",
    rating: "5.0",
  },
  {
    title: "Family MUVs & 7-Seaters",
    category: "MUV",
    desc: "Spacious multi-utility vehicles for group trips, family pilgrimages & long tours.",
    models: "Ertiga, XL6, Carens, Innova Crysta",
    startPrice: "₹2,800",
    image: "/vehicles/cat_muv.jpg",
    fallback: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80",
    isFeatured: false,
    seats: "6-7 Seats",
    ac: "Air Conditioner",
    rating: "5.0",
  },
  {
    title: "Executive Vans & Group",
    category: "Van",
    desc: "Spacious luxury passenger transport for corporate travel & private group tours.",
    models: "Sprinter, Force Urbania, Vellfire",
    startPrice: "₹4,500",
    image: "/vehicles/cat_van.jpg",
    fallback: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
    isFeatured: false,
    seats: "9-12 Seats",
    ac: "Air Conditioner",
    rating: "5.0",
  },
  {
    title: "Executive Luxury Sedans",
    category: "Sedan",
    desc: "Premium comfort, smooth automatic drive & spacious luggage boot space.",
    models: "Mercedes C-Class, Honda City, Verna",
    startPrice: "₹2,500",
    image: "/vehicles/cat_sedan.jpg",
    fallback: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80",
    isFeatured: false,
    seats: "5 Seats",
    ac: "Air Conditioner",
    rating: "5.0",
  },
];

const TRUST_FEATURES = [
  {
    icon: <Shield className="w-5 h-5 text-[#212121]" />,
    title: "Zero Security Deposit Hassle",
    desc: "No stressful holds or hidden deductions. Simple, instant digital KYC verification with zero deposit stress.",
  },
  {
    icon: <Zap className="w-5 h-5 text-[#212121]" />,
    title: "24/7 Railway Station Delivery",
    desc: "Direct platform handover at Solapur Railway Station. No waiting for local cabs.",
  },
  {
    icon: <Car className="w-5 h-5 text-[#212121]" />,
    title: "Sanitized & Verified Fleet",
    desc: "Every car & bike undergoes comprehensive 25-point mechanical inspection & interior sanitization.",
  },
  {
    icon: <Headphones className="w-5 h-5 text-[#212121]" />,
    title: "24/7 On-Road Assistance",
    desc: "Complete roadside support across Solapur, Akkalkot, Tuljapur, and Pandharpur routes.",
  },
];

const TESTIMONIALS = [
  {
    name: "Rohan Malhotra",
    location: "Mumbai",
    rating: 5,
    date: "Akkalkot Trip",
    car: "Mahindra Thar 4x4 Automatic",
    comment: "Renting the Thar from Journey Rentals was the smoothest experience. The team handed over the car right as our train pulled into Solapur Railway Station. Clean car, great mileage, and zero deposit hassles!",
  },
  {
    name: "Ananya Sharma",
    location: "Bengaluru",
    rating: 5,
    date: "Tuljapur Darshan",
    car: "Hyundai Creta Automatic",
    comment: "Excellent service! We booked online and had the car delivered to our hotel in Solapur. The AC was ice cold, car was spotless, and rates were completely honest. Will definitely book again.",
  },
  {
    name: "Vikram & Pooja",
    location: "Pune",
    rating: 5,
    date: "Pandharpur Pilgrimage",
    car: "Maruti Ertiga 7-Seater",
    comment: "The Ertiga made our family pilgrimage to Pandharpur and Akkalkot unforgettable. Transparent pricing and very courteous handover team at Solapur.",
  },
];

export default function Landing() {
  const nav = useNavigate();
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [vehicles, setVehicles] = useState(() => {
    try {
      const cached = localStorage.getItem("jr_cached_vehicles");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return STARTER_FEATURED_VEHICLES;
  });
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [searchForm, setSearchForm] = useState({
    pickupLocation: "Solapur Railway Station",
    dropoffLocation: "Solapur Railway Station",
    pickupDate: new Date().toISOString().split("T")[0],
    pickupTime: "10:00",
    dropoffDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    dropoffTime: "10:00",
    category: "All",
  });

  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const targetId = location.state.scrollTo;
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          const navOffset = 64;
          const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: elementPosition - navOffset, behavior: "smooth" });
        }
      }, 150);
    }
  }, [location]);

  const fetchVehicles = React.useCallback(() => {
    api.get("/vehicles", { params: { _t: Date.now() } })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data.vehicles || []);
        if (list.length > 0) {
          setVehicles(list);
          try {
            localStorage.setItem("jr_cached_vehicles", JSON.stringify(list));
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoadingVehicles(false));
  }, []);

  useEffect(() => {
    fetchVehicles();
    const handleUpdate = () => { fetchVehicles(); };
    window.addEventListener("jr_vehicles_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("jr_vehicles_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [fetchVehicles]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchForm.category !== "All") query.set("category", searchForm.category);
    if (searchForm.pickupLocation) query.set("location", searchForm.pickupLocation);
    if (searchForm.pickupDate) query.set("pickupDate", searchForm.pickupDate);
    if (searchForm.dropoffDate) query.set("dropoffDate", searchForm.dropoffDate);
    nav(`/fleet?${query.toString()}`);
  };

  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  // Auto-rotate hero poster banners every 5.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % POSTER_BANNERS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const nextHeroSlide = () => {
    setCurrentHeroSlide((prev) => (prev + 1) % POSTER_BANNERS.length);
  };

  const prevHeroSlide = () => {
    setCurrentHeroSlide((prev) => (prev - 1 + POSTER_BANNERS.length) % POSTER_BANNERS.length);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      nextHeroSlide();
    } else if (diff < -45) {
      prevHeroSlide();
    }
    setTouchStartX(null);
  };

  const featuredVehicles = React.useMemo(() => {
    return vehicles.slice(0, 6);
  }, [vehicles]);

  const activeBanner = POSTER_BANNERS[currentHeroSlide] || POSTER_BANNERS[0];

  return (
    <div className="min-h-screen bg-[#F6F5FA] text-[#212121] font-body antialiased overflow-x-hidden">
      <SEO />
      <WebSiteSearchSchema />
      <OrganizationFounderSchema />
      <Navbar />

      {/* ── 1. UNIFIED LUXURY HERO BANNER ── */}
      <section
        className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-8 sm:pb-16 max-w-7xl mx-auto"
        aria-label="Featured Luxury Fleet"
      >
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative bg-white border border-[#DFDCE8] rounded-3xl overflow-hidden shadow-sm group select-none transition-all duration-300"
        >
          {/* Main Banner Canvas */}
          <div className="relative w-full h-[480px] sm:h-[420px] md:h-[480px] lg:h-[520px] flex flex-col justify-between">
            {/* Background Full-Bleed Car Image */}
            <div className="absolute inset-0 z-0">
              <img
                key={activeBanner.id}
                src={activeBanner.posterImage}
                alt={activeBanner.title}
                className="w-full h-full object-cover object-center sm:object-right md:object-center transition-all duration-700 hero-banner-content-animate"
              />
              {/* Vignette */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 via-50% to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full p-6 sm:p-10 lg:p-14 flex flex-col justify-between max-w-xl lg:max-w-2xl text-left">
              {/* Top Tag Badge */}
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-xs">
                  {activeBanner.badge}
                </span>
              </div>

              {/* Middle Headline & Subtitle */}
              <div className="space-y-2 sm:space-y-3 my-auto py-2">
                <h1
                  id="hero-title"
                  className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight font-display leading-[1.15] drop-shadow-md"
                >
                  {activeBanner.title}
                </h1>
                <p className="text-white/95 text-xs sm:text-base font-normal max-w-lg leading-relaxed drop-shadow-sm">
                  {activeBanner.subtitle}
                </p>
              </div>

              {/* Bottom Carousel Indicator Dots */}
              <div className="flex items-center gap-2 pt-2">
                {POSTER_BANNERS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentHeroSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      currentHeroSlide === idx
                        ? "w-8 bg-[#e1b808]"
                        : "w-2.5 bg-white/50 hover:bg-white"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Standard Center-Aligned Carousel Arrow Controls */}
            <button
              onClick={prevHeroSlide}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md border border-white/20 hover:border-white/60 text-white flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shadow-lg hover:scale-105"
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} className="stroke-[2.5]" />
            </button>
            <button
              onClick={nextHeroSlide}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md border border-white/20 hover:border-white/60 text-white flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shadow-lg hover:scale-105"
              aria-label="Next slide"
            >
              <ChevronRight size={20} className="stroke-[2.5]" />
            </button>

          </div>
        </div>

        {/* ── 2. QUICK BOOKING SEARCH WIDGET (Positioned below hero banner with dedicated gap) ── */}
        <div className="relative mt-6 sm:mt-10 z-20 max-w-6xl mx-auto px-1 sm:px-2">
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white rounded-[24px] shadow-sm hover:shadow-md p-5 sm:p-7 border border-[#DFDCE8] transition-all"
            data-testid="hero-booking-widget"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 items-end">
              {/* Field 1: Pickup Location */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-[#6F6E73] flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#212121]" />
                  Pick-up Location
                </label>
                <CustomSelect
                  value={searchForm.pickupLocation}
                  onChange={(val) => setSearchForm({ ...searchForm, pickupLocation: val })}
                  options={[
                    "Solapur Railway Station",
                    "Hotgi Road & Airport Hub",
                    "Vijapur Road Hub",
                    "Akkalkot Road Hub",
                    "Doorstep Delivery (Solapur City)",
                  ]}
                  placeholder="Select Pick-up Hub"
                />
              </div>

              {/* Field 2: Drop-off Location */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-[#6F6E73] flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#212121]" />
                  Drop-off Location
                </label>
                <CustomSelect
                  value={searchForm.dropoffLocation}
                  onChange={(val) => setSearchForm({ ...searchForm, dropoffLocation: val })}
                  options={[
                    "Solapur Railway Station",
                    "Hotgi Road & Airport Hub",
                    "Vijapur Road Hub",
                    "Akkalkot Road Hub",
                    "Same as Pick-up",
                  ]}
                  placeholder="Select Drop-off Hub"
                />
              </div>

              {/* Field 3: Pick-up Date */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-[#6F6E73] flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#212121]" />
                  Pick-up Date
                </label>
                <input
                  type="date"
                  value={searchForm.pickupDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSearchForm({ ...searchForm, pickupDate: e.target.value })}
                  className="w-full bg-[#F6F5FA] border border-[#DFDCE8] rounded-full px-4 py-2 text-xs sm:text-sm font-medium text-[#212121] outline-none focus:border-[#212121] transition-all cursor-pointer h-11"
                  data-testid="search-pickup-date"
                />
              </div>

              {/* Field 4: Drop-off Date */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-[#6F6E73] flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#212121]" />
                  Drop-off Date
                </label>
                <input
                  type="date"
                  value={searchForm.dropoffDate}
                  min={searchForm.pickupDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSearchForm({ ...searchForm, dropoffDate: e.target.value })}
                  className="w-full bg-[#F6F5FA] border border-[#DFDCE8] rounded-full px-4 py-2 text-xs sm:text-sm font-medium text-[#212121] outline-none focus:border-[#212121] transition-all cursor-pointer h-11"
                  data-testid="search-dropoff-date"
                />
              </div>

              {/* Field 5: Vehicle Type */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-[#6F6E73] flex items-center gap-1.5">
                  <Car size={13} className="text-[#212121]" />
                  Vehicle Class
                </label>
                <CustomSelect
                  value={searchForm.category}
                  onChange={(val) => setSearchForm({ ...searchForm, category: val })}
                  options={[
                    { value: "All", label: "All Categories" },
                    { value: "SUV", label: "SUVs & 4x4 Thar" },
                    { value: "Hatchback", label: "Economy Hatchbacks" },
                    { value: "Sedan", label: "Sedans" },
                    { value: "Convertible", label: "Luxury & Convertibles" },
                  ]}
                  placeholder="Select Category"
                />
              </div>

              {/* Field 6: Search Button */}
              <div>
                <Button
                  type="submit"
                  className="w-full bg-[#212121] hover:bg-[#141414] active:bg-[#000000] text-white font-medium rounded-full h-11 text-xs tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  data-testid="search-submit-btn"
                >
                  <span>Search Fleet</span>
                  <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* ── 3. CATEGORY CARDS SECTION (Pixel-Perfect from DriveHub Goa) ── */}
      <section className="py-10 sm:py-16 px-4 sm:px-8 max-w-7xl mx-auto cv-auto" aria-labelledby="categories-heading">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-2">
          <h2 id="categories-heading" className="text-2xl sm:text-4xl font-bold text-[#212121] tracking-tight font-display">
            Choose The Vehicle You Need
          </h2>
          <p className="text-[#6F6E73] text-sm sm:text-base font-normal">
            Explore Solapur and Maharashtra pilgrimages with verified self-drive cars and hourly bikes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
          {CATEGORIES.map((cat, idx) => (
            <div
              key={idx}
              className="group rounded-[24px] p-5 sm:p-6 flex flex-col justify-between shadow-sm border border-[#DFDCE8] bg-white text-[#212121] h-full hover:border-[#212121] transition-colors"
            >
              <div>
                {/* Top Rating Star & Badge */}
                <div className="flex items-center justify-between min-h-[26px] mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FFA500]">
                    <Star size={14} fill="currentColor" />
                    <span className="text-[#212121] font-medium">
                      {cat.rating}
                    </span>
                  </div>
                  {cat.badge ? (
                    <span className="bg-[#e1b808] text-[#212121] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                      {cat.badge}
                    </span>
                  ) : <div />}
                </div>

                {/* Car Image - Exact Clean seamless placement with DriveHub categories */}
                <div className="relative h-44 sm:h-52 lg:h-56 w-full flex items-center justify-center my-2 sm:my-3 px-1">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { e.currentTarget.src = cat.fallback; }}
                    className="max-h-full max-w-full w-auto h-auto object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Title, Price & Specs */}
                <div className="mt-3 sm:mt-4 grid grid-cols-12 gap-2 items-start text-left">
                  <div className="col-span-7 pr-1">
                    <h3 className="text-base font-bold leading-tight text-[#212121]">
                      {cat.title}
                    </h3>
                    <div className="text-xs sm:text-sm font-bold mt-1 text-[#212121]">
                      {cat.startPrice}/Day
                    </div>
                  </div>

                  <div className="col-span-5 space-y-1 text-right">
                    <div className="text-xs font-normal flex items-center justify-end gap-1.5 text-[#6F6E73]">
                      <Users size={12} className="text-[#212121]" />
                      <span>{cat.seats}</span>
                    </div>
                    <div className="text-xs font-normal flex items-center justify-end gap-1.5 text-[#6F6E73]">
                      <Zap size={12} className="text-[#212121]" />
                      <span>{cat.ac}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button (Pill) */}
              <div className="pt-4 mt-2">
                <Link
                  to={`/fleet?category=${cat.category}`}
                  className="w-full min-h-[40px] h-[40px] rounded-full font-medium text-xs uppercase tracking-wider text-center flex items-center justify-center bg-[#212121] hover:bg-[#141414] active:bg-[#000000] text-white shadow-sm transition-all"
                  data-testid={`category-cta-${cat.category.toLowerCase()}`}
                >
                  Explore {cat.category}s →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. LIVE FLEET LISTINGS GRID ── */}
      <section className="py-12 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto cv-auto" aria-labelledby="fleet-grid-heading">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-3">
          <h2 id="fleet-grid-heading" className="text-2xl sm:text-4xl font-bold text-[#212121] tracking-tight font-display">
            Featured Self-Drive Cars &amp; Bikes
          </h2>
          <p className="text-[#6F6E73] text-sm sm:text-base font-normal">
            Immaculate, sanitized fleet with valid permits for Akkalkot, Tuljapur, Pandharpur, and Maharashtra road trips.
          </p>
        </div>

        {/* Vehicle Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {loadingVehicles && featuredVehicles.length === 0 ? (
            [...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#DFDCE8] rounded-[24px] overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-[#F6F5FA] animate-pulse">
                    <div className="absolute top-3 left-3 w-16 h-5 bg-[#EFEDF5] rounded-full" />
                    <div className="absolute top-3 right-3 w-16 h-5 bg-[#EFEDF5] rounded-full" />
                  </div>
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="h-5 bg-[#F6F5FA] rounded-full w-3/4 animate-pulse" />
                    <div className="h-3 bg-[#F6F5FA] rounded-full w-full animate-pulse" />
                    <div className="h-3 bg-[#F6F5FA] rounded-full w-5/6 animate-pulse" />
                  </div>
                </div>
                <div className="p-4 sm:p-5 flex items-center justify-between border-t border-[#DFDCE8] bg-[#F6F5FA]">
                  <div className="space-y-1">
                    <div className="h-2.5 w-12 bg-[#EFEDF5] rounded-full" />
                    <div className="h-5 w-20 bg-[#EFEDF5] rounded-full" />
                  </div>
                  <div className="h-9 w-24 bg-[#EFEDF5] rounded-full" />
                </div>
              </div>
            ))
          ) : featuredVehicles.length > 0 ? (
            featuredVehicles.map((v, idx) => (
              <VehicleCard key={v._id || v.id || idx} v={v} index={idx} />
            ))
          ) : (
            <div className="col-span-3 py-12 text-center text-[#6F6E73]">
              No fleet vehicles available at the moment.
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8 sm:mt-12">
          <Button
            asChild
            className="bg-[#212121] hover:bg-[#141414] active:bg-[#000000] text-white font-medium rounded-full h-11 px-8 text-xs tracking-wider uppercase shadow-sm transition-all cursor-pointer"
          >
            <Link to="/fleet" data-testid="explore-all-fleet-btn">
              <span>View All Fleet ({vehicles.length > 0 ? vehicles.length : 22} Vehicles)</span>
              <ArrowRight size={14} className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── 5. SECONDARY PROMO BANNER ── */}
      <section className="py-8 sm:py-16 px-4 sm:px-8 max-w-7xl mx-auto cv-auto" aria-labelledby="airport-promo-heading">
        <div className="bg-white border border-[#DFDCE8] rounded-[24px] p-5 sm:p-10 lg:p-12 text-[#212121] text-left relative overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-3 sm:space-y-4">
              <h2 id="airport-promo-heading" className="text-2xl sm:text-4xl font-bold text-[#212121] tracking-tight leading-tight font-display">
                Book Your Ride with 24/7 Dedicated Support
              </h2>
              <p className="text-[#6F6E73] text-xs sm:text-sm max-w-2xl leading-relaxed font-normal">
                Skip local taxi queues and unpredictable surge fares. Your sanitized car or bike will be parked and ready right as your train arrives at Solapur Railway Station, or reach out to our dispatch team for custom reservations.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <a
                href="https://wa.me/919604437794?text=Hello%20Journey%20Rentals,%20I%20would%20like%20to%20enquire%20about%20booking%20a%20vehicle"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#212121] hover:bg-[#141414] active:bg-[#000000] text-white font-medium rounded-full h-10 px-5 text-xs uppercase tracking-wider shadow-sm transition-all text-center cursor-pointer active:scale-98"
                data-testid="promo-whatsapp-btn"
              >
                <MessageSquare size={15} />
                <span>WhatsApp Enquiry</span>
              </a>
              <a
                href="tel:+919604437794"
                className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-[#212121]/5 text-[#212121] border border-[#212121] font-medium rounded-full h-10 px-5 text-xs uppercase tracking-wider transition-colors text-center cursor-pointer active:scale-98"
                data-testid="promo-call-btn"
              >
                <Phone size={14} className="text-[#212121]" />
                <span>Call +91 96044 37794</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. TRUST & STATS SECTION ── */}
      <section className="py-8 sm:py-16 px-4 sm:px-8 max-w-7xl mx-auto cv-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {TRUST_FEATURES.map((feat, i) => (
            <div
              key={i}
              className="bg-white rounded-[24px] p-4 sm:p-6 border border-[#DFDCE8] text-left space-y-2 hover:border-[#212121] transition-all duration-200 shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-[#e1b808] text-[#212121] flex items-center justify-center">
                {feat.icon}
              </div>
              <h3 className="text-sm font-bold text-[#212121]">
                {feat.title}
              </h3>
              <p className="text-xs text-[#6F6E73] leading-relaxed font-normal">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. CUSTOMER TESTIMONIALS ── */}
      <section id="reviews" className="py-10 sm:py-16 px-4 sm:px-8 bg-white border-y border-[#DFDCE8] cv-auto" aria-labelledby="reviews-heading">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12 space-y-2">
            <h2 id="reviews-heading" className="text-2xl sm:text-4xl font-bold text-[#212121] tracking-tight font-display">
              Trusted by Over 5,000+ Travellers
            </h2>
            <p className="text-[#6F6E73] text-xs sm:text-sm font-normal">
              Real feedback from devotees, families, and roadtrippers exploring Solapur with Journey Rentals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-left">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="bg-[#F6F5FA] rounded-[24px] p-5 sm:p-6 border border-[#DFDCE8] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#212121] transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex text-[#FFA500]">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#6F6E73] italic leading-relaxed font-normal">
                    "{t.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#DFDCE8] flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="block text-xs font-bold text-[#212121]">{t.name}</span>
                    <span className="block text-[11px] text-[#99989E]">{t.location} · {t.car}</span>
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#212121] bg-white border border-[#DFDCE8] px-3 py-1 rounded-full shadow-2xs shrink-0"
                  >
                    <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[10px] font-semibold text-[#212121]">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. BENEFITS HIGHLIGHT BANNER ── */}
      <section id="benefits" className="py-10 sm:py-16 px-4 sm:px-8 max-w-7xl mx-auto cv-auto">
        <div className="bg-white border border-[#DFDCE8] rounded-[24px] p-5 sm:p-10 lg:p-12 relative overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center text-left">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-2xl sm:text-4xl font-bold text-[#212121] tracking-tight leading-tight font-display">
                Why Renting with Us in Solapur Feels Better
              </h2>

              <div className="space-y-2.5">
                {[
                  "No Hidden Charges — Transparent daily rental rates with clear insurance details.",
                  "Unlimited Kilometers Option Available — Explore Akkalkot, Tuljapur, and Pandharpur without counting miles.",
                  "Direct Railway Station Handover — Save 2+ hours of travel logistics upon arrival.",
                  "Prompt WhatsApp & Roadside Help — Our Solapur dispatch team is always on call.",
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#CFDECA] text-[#4B8039] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <span className="text-xs sm:text-sm font-normal text-[#212121] leading-snug">{text}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button
                  asChild
                  className="bg-[#212121] hover:bg-[#141414] active:bg-[#000000] text-white font-medium rounded-full h-11 px-8 text-xs tracking-wider uppercase transition-all shadow-sm cursor-pointer"
                >
                  <Link to="/fleet">
                    <span>Find Your Vehicle Now</span>
                    <ArrowRight size={14} className="ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative z-10 w-full rounded-[20px] overflow-hidden shadow-md border border-[#DFDCE8]">
                <img
                  src="/banners/journey_benefits_handover.jpg"
                  alt="Journey Rentals Solapur Handover Service"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { e.currentTarget.src = "/banners/journey_darshan_offer.jpg"; }}
                  className="w-full h-full aspect-[4/3] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. SOLAPUR MAP & HQ LOCATION SECTION ── */}
      <LocationSection />

      {/* ── 10. FOOTER ── */}
      <Footer />
    </div>
  );
}
